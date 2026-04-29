import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

// Edge function pública (sem JWT) para receber tracking do webinar.
// Faz upsert em webinar_sessions e insert em webinar_events.

interface TrackEvent {
  type: string;
  data?: Record<string, unknown>;
  ts?: number;
}

interface TrackBody {
  session_id?: string;
  session_init?: Record<string, unknown>;
  events?: TrackEvent[];
  metrics_patch?: Record<string, unknown>;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Campos cumulativos: pegam o MAIOR
const MAX_FIELDS = new Set([
  "video_watch_seconds",
  "video_max_position_seconds",
  "video_duration_seconds",
  "video_completion_pct",
  "max_speed",
  "signup_step_reached",
  "total_time_on_page_seconds",
  "scroll_depth_pct",
]);

// Booleans: OR
const BOOL_FIELDS = new Set([
  "video_started",
  "video_completed",
  "unmuted",
  "went_fullscreen",
  "signup_modal_opened",
  "signup_completed",
  "signup_qualified",
  "reached_thank_you",
  "whatsapp_group_clicked",
]);

// Timestamps que só devem ser definidos na primeira ocorrência
const ONCE_TIMESTAMP_FIELDS = new Set(["thank_you_at"]);

// Contadores: soma o sufixo _inc
const COUNTER_FIELDS: Record<string, string> = {
  cta_clicks_inc: "cta_clicks",
  cta_hero_clicks_inc: "cta_hero_clicks",
  cta_learn_clicks_inc: "cta_learn_clicks",
  cta_final_clicks_inc: "cta_final_clicks",
  cta_sticky_clicks_inc: "cta_sticky_clicks",
};

// Strings simples (apenas se não setadas ainda): first_cta_clicked, signup_id
const ONCE_FIELDS = new Set(["first_cta_clicked", "signup_id"]);

function pickInit(init: Record<string, any>) {
  const allowed = [
    "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
    "referrer", "landing_url",
    "user_agent", "device_type", "os", "browser",
    "screen_size", "viewport_size", "language", "timezone",
  ];
  const out: Record<string, any> = {};
  for (const k of allowed) {
    const v = init[k];
    if (v !== undefined && v !== null && v !== "") out[k] = String(v).slice(0, 1000);
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as TrackBody;
    if (!body.session_id || typeof body.session_id !== "string") {
      return new Response(JSON.stringify({ error: "session_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const sessionId = body.session_id.slice(0, 100);

    // Country (best-effort via header CF/Supabase)
    const ipCountry =
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-vercel-ip-country") ||
      null;

    // Carrega sessão atual
    const { data: existing } = await sb
      .from("webinar_sessions")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle();

    // Se não existe, cria com init
    if (!existing) {
      const initData = body.session_init ? pickInit(body.session_init) : {};
      await sb.from("webinar_sessions").insert({
        session_id: sessionId,
        ip_country: ipCountry,
        ...initData,
      });
    }

    // Recarrega (ou pega o que tinha)
    const { data: session } = await sb
      .from("webinar_sessions")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (!session) {
      return new Response(JSON.stringify({ error: "session_not_found" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Aplica metrics_patch
    const patch = body.metrics_patch ?? {};
    const update: Record<string, any> = { last_seen_at: new Date().toISOString() };

    for (const [k, raw] of Object.entries(patch)) {
      if (BOOL_FIELDS.has(k)) {
        update[k] = !!session[k] || !!raw;
      } else if (MAX_FIELDS.has(k) && typeof raw === "number") {
        update[k] = Math.max(Number(session[k] ?? 0), raw);
      } else if (k in COUNTER_FIELDS && typeof raw === "number") {
        const target = COUNTER_FIELDS[k];
        update[target] = Number(session[target] ?? 0) + raw;
      } else if (ONCE_FIELDS.has(k)) {
        if (!session[k] && raw) update[k] = raw;
      }
    }

    if (Object.keys(update).length > 1) {
      await sb.from("webinar_sessions").update(update).eq("session_id", sessionId);
    } else {
      await sb
        .from("webinar_sessions")
        .update({ last_seen_at: update.last_seen_at })
        .eq("session_id", sessionId);
    }

    // Insere eventos
    const events = (body.events ?? []).slice(0, 200);
    if (events.length > 0) {
      const rows = events.map((e) => ({
        session_id: sessionId,
        event_type: String(e.type).slice(0, 80),
        event_data: (e.data ?? {}) as Record<string, unknown>,
        created_at: e.ts ? new Date(e.ts).toISOString() : new Date().toISOString(),
      }));
      await sb.from("webinar_events").insert(rows);
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
