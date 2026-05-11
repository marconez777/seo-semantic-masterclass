import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

// Edge function pública (sem JWT) — recebe tracking first-party do site.
// Faz upsert em analytics_visitors / analytics_sessions e insere
// pageviews + events em lote.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const SEARCH_HOSTS = ["google.", "bing.", "duckduckgo.", "yahoo.", "ecosia.", "brave."];
const SOCIAL_HOSTS = [
  "facebook.", "instagram.", "linkedin.", "t.co", "twitter.", "x.com",
  "youtube.", "tiktok.", "pinterest.", "reddit.", "whatsapp.",
];
const PAID_MEDIUMS = new Set(["cpc", "ppc", "paid", "paidsocial", "paid-social", "display", "cpm"]);

function s(v: unknown, max = 500): string | null {
  if (v === undefined || v === null) return null;
  const str = String(v);
  if (!str) return null;
  return str.slice(0, max);
}

function hostOf(url: string | null): string | null {
  if (!url) return null;
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return null; }
}

function classifyChannel(opts: {
  utm_medium: string | null;
  utm_source: string | null;
  referrer_host: string | null;
}): string {
  const m = (opts.utm_medium || "").toLowerCase();
  if (m && PAID_MEDIUMS.has(m)) return "paid";
  if (m === "email") return "email";
  if (m === "social") return "social";
  if (m === "organic") return "organic";
  if (m === "referral") return "referral";
  const h = (opts.referrer_host || "").toLowerCase();
  if (!h) return opts.utm_source ? "referral" : "direct";
  if (SEARCH_HOSTS.some((s) => h.includes(s))) return "organic";
  if (SOCIAL_HOSTS.some((s) => h.includes(s))) return "social";
  return "referral";
}

function pickInit(init: Record<string, any>) {
  const referrer = s(init.referrer);
  const referrer_host = hostOf(referrer);
  const utm_source = s(init.utm_source, 200);
  const utm_medium = s(init.utm_medium, 200);
  const channel = classifyChannel({ utm_medium, utm_source, referrer_host });
  return {
    landing_path: s(init.landing_path, 1000),
    referrer,
    referrer_host,
    channel,
    utm_source,
    utm_medium,
    utm_campaign: s(init.utm_campaign, 200),
    utm_term: s(init.utm_term, 200),
    utm_content: s(init.utm_content, 200),
    device_type: s(init.device_type, 50),
    os: s(init.os, 50),
    browser: s(init.browser, 50),
    language: s(init.language, 20),
    screen_size: s(init.screen_size, 30),
    viewport_size: s(init.viewport_size, 30),
    timezone: s(init.timezone, 100),
    user_agent: s(init.user_agent, 500),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const session_id = s(body.session_id, 100);
    const visitor_id = s(body.visitor_id, 100);
    if (!session_id || !visitor_id) {
      return new Response(JSON.stringify({ error: "session_id and visitor_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ipCountry = req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country") || null;
    const userId = s(body.user_id, 64); // pode ser null

    // Init data (1ª chamada da sessão)
    const init = body.session_init ? pickInit(body.session_init) : null;

    // ---- VISITOR ----
    const { data: existingVisitor } = await sb
      .from("analytics_visitors")
      .select("visitor_id, total_sessions, total_pageviews, user_id")
      .eq("visitor_id", visitor_id)
      .maybeSingle();

    if (!existingVisitor) {
      await sb.from("analytics_visitors").insert({
        visitor_id,
        user_id: userId,
        first_referrer: init?.referrer ?? null,
        first_referrer_host: init?.referrer_host ?? null,
        first_landing_path: init?.landing_path ?? null,
        first_utm_source: init?.utm_source ?? null,
        first_utm_medium: init?.utm_medium ?? null,
        first_utm_campaign: init?.utm_campaign ?? null,
        first_channel: init?.channel ?? null,
        total_sessions: 1,
        total_pageviews: 0,
      });
    } else if (userId && !existingVisitor.user_id) {
      await sb.from("analytics_visitors").update({ user_id: userId, last_seen_at: new Date().toISOString() }).eq("visitor_id", visitor_id);
    } else {
      await sb.from("analytics_visitors").update({ last_seen_at: new Date().toISOString() }).eq("visitor_id", visitor_id);
    }

    // ---- SESSION ----
    const { data: existingSession } = await sb
      .from("analytics_sessions")
      .select("*")
      .eq("session_id", session_id)
      .maybeSingle();

    if (!existingSession) {
      await sb.from("analytics_sessions").insert({
        session_id,
        visitor_id,
        user_id: userId,
        ip_country: ipCountry,
        ...(init ?? {}),
      });
      if (existingVisitor) {
        await sb.rpc; // noop placeholder; increment via direct update below
        await sb.from("analytics_visitors").update({
          total_sessions: (existingVisitor.total_sessions || 0) + 1,
        }).eq("visitor_id", visitor_id);
      }
    } else if (userId && !existingSession.user_id) {
      await sb.from("analytics_sessions").update({ user_id: userId }).eq("session_id", session_id);
    }

    // ---- PAGEVIEWS ----
    const pageviews = Array.isArray(body.pageviews) ? body.pageviews.slice(0, 50) : [];
    const pvRows = pageviews.map((p: any) => ({
      session_id,
      visitor_id,
      user_id: userId,
      path: s(p.path, 1000) || "/",
      title: s(p.title, 300),
      referrer: s(p.referrer, 1000),
      duration_seconds: typeof p.duration_seconds === "number" ? Math.min(86400, Math.max(0, Math.round(p.duration_seconds))) : null,
      scroll_depth_pct: typeof p.scroll_depth_pct === "number" ? Math.min(100, Math.max(0, Math.round(p.scroll_depth_pct))) : null,
      created_at: p.ts ? new Date(p.ts).toISOString() : new Date().toISOString(),
    }));
    if (pvRows.length) await sb.from("analytics_pageviews").insert(pvRows);

    // ---- EVENTS ----
    const events = Array.isArray(body.events) ? body.events.slice(0, 100) : [];
    const evRows = events.map((e: any) => ({
      session_id,
      visitor_id,
      user_id: userId,
      path: s(e.path, 1000),
      event_type: s(e.event_type, 80) || "unknown",
      event_label: s(e.event_label, 200),
      event_data: typeof e.event_data === "object" && e.event_data ? e.event_data : {},
      created_at: e.ts ? new Date(e.ts).toISOString() : new Date().toISOString(),
    }));
    if (evRows.length) await sb.from("analytics_events").insert(evRows);

    // ---- SESSION counters & flags ----
    const sessUpdate: Record<string, any> = {
      last_seen_at: new Date().toISOString(),
    };
    if (pvRows.length) sessUpdate.pageview_count = (existingSession?.pageview_count ?? 0) + pvRows.length;
    if (evRows.length) sessUpdate.event_count = (existingSession?.event_count ?? 0) + evRows.length;
    if (pvRows.length) {
      const lastPath = pvRows[pvRows.length - 1].path;
      if (lastPath) sessUpdate.exit_path = lastPath;
    }
    const hasWa = evRows.some((e) => e.event_type === "click_whatsapp");
    const hasSignup = evRows.some((e) => e.event_type === "signup_completed");
    const hasOrder = evRows.some((e) => e.event_type === "order_created");
    if (hasWa) sessUpdate.clicked_whatsapp = true;
    if (hasSignup) sessUpdate.signed_up = true;
    if (hasOrder) sessUpdate.created_order = true;

    if (typeof body.duration_seconds === "number") {
      sessUpdate.duration_seconds = Math.max(existingSession?.duration_seconds ?? 0, Math.min(86400, Math.round(body.duration_seconds)));
    }

    await sb.from("analytics_sessions").update(sessUpdate).eq("session_id", session_id);

    if (pvRows.length && existingVisitor) {
      await sb.from("analytics_visitors").update({
        total_pageviews: (existingVisitor.total_pageviews || 0) + pvRows.length,
      }).eq("visitor_id", visitor_id);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
