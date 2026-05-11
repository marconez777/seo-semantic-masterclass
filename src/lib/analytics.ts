// Tracker first-party do site. Mantém visitor_id (localStorage),
// session_id (sessionStorage com expiração de 30min de inatividade),
// faz buffer de pageviews+events e envia via edge function `track`.

type EventItem = { event_type: string; event_label?: string | null; event_data?: Record<string, any>; path?: string; ts: number };
type PageviewItem = { path: string; title?: string; referrer?: string; ts: number; duration_seconds?: number; scroll_depth_pct?: number };

const FN_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/track`;
const VISITOR_KEY = "mk_visitor_id";
const SESSION_KEY = "mk_session_id";
const SESSION_TS_KEY = "mk_session_last_ts";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function detectDevice() {
  const ua = navigator.userAgent;
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return "mobile";
  return "desktop";
}
function detectOS() {
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac OS X/i.test(ua)) return "macOS";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "Unknown";
}
function detectBrowser() {
  const ua = navigator.userAgent;
  if (/Edg/i.test(ua)) return "Edge";
  if (/Chrome/i.test(ua) && !/Chromium/i.test(ua)) return "Chrome";
  if (/Firefox/i.test(ua)) return "Firefox";
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return "Safari";
  return "Other";
}

class Analytics {
  private visitorId: string | null = null;
  private sessionId: string | null = null;
  private userId: string | null = null;
  private events: EventItem[] = [];
  private pageviews: PageviewItem[] = [];
  private initPayload: Record<string, any> | null = null;
  private currentPath: string | null = null;
  private currentPathStart = Date.now();
  private maxScrollPct = 0;
  private flushTimer: number | null = null;
  private started = false;

  private getVisitorId() {
    if (this.visitorId) return this.visitorId;
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = uuid();
      localStorage.setItem(VISITOR_KEY, id);
    }
    this.visitorId = id;
    return id;
  }

  private getSessionId() {
    const now = Date.now();
    const lastTs = parseInt(sessionStorage.getItem(SESSION_TS_KEY) || "0", 10);
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id || (lastTs && now - lastTs > SESSION_TIMEOUT_MS)) {
      id = uuid();
      sessionStorage.setItem(SESSION_KEY, id);
      this.initPayload = this.buildInitPayload();
    }
    sessionStorage.setItem(SESSION_TS_KEY, String(now));
    this.sessionId = id;
    return id;
  }

  private buildInitPayload() {
    const qs = new URL(window.location.href).searchParams;
    return {
      utm_source: qs.get("utm_source"),
      utm_medium: qs.get("utm_medium"),
      utm_campaign: qs.get("utm_campaign"),
      utm_content: qs.get("utm_content"),
      utm_term: qs.get("utm_term"),
      referrer: document.referrer || null,
      landing_path: window.location.pathname + window.location.search,
      user_agent: navigator.userAgent,
      device_type: detectDevice(),
      os: detectOS(),
      browser: detectBrowser(),
      screen_size: `${window.screen.width}x${window.screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  start() {
    if (this.started) return;
    this.started = true;
    this.getVisitorId();
    this.getSessionId();

    // Click listener global
    document.addEventListener("click", (e) => this.onGlobalClick(e), true);

    // Scroll
    window.addEventListener("scroll", () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      if (total > 0) {
        const pct = Math.min(100, Math.round(((h.scrollTop + h.clientHeight) / h.scrollHeight) * 100));
        if (pct > this.maxScrollPct) this.maxScrollPct = pct;
      }
    }, { passive: true });

    // Flush periódico
    this.flushTimer = window.setInterval(() => this.flush(false), 8000);

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.endCurrentPageview();
        this.flush(true);
      }
    });
    window.addEventListener("pagehide", () => { this.endCurrentPageview(); this.flush(true); });
  }

  identify(userId: string | null) {
    this.userId = userId;
  }

  trackPageview(path: string, title?: string) {
    if (!this.started) this.start();
    this.endCurrentPageview();
    this.currentPath = path;
    this.currentPathStart = Date.now();
    this.maxScrollPct = 0;
    this.pageviews.push({
      path,
      title: title ?? document.title,
      referrer: document.referrer || undefined,
      ts: Date.now(),
    });
    // refresh session timestamp
    sessionStorage.setItem(SESSION_TS_KEY, String(Date.now()));
  }

  private endCurrentPageview() {
    if (!this.currentPath) return;
    const last = [...this.pageviews].reverse().find((p) => p.path === this.currentPath);
    if (last) {
      last.duration_seconds = Math.max(0, Math.round((Date.now() - this.currentPathStart) / 1000));
      last.scroll_depth_pct = this.maxScrollPct;
    }
  }

  track(event_type: string, opts: { label?: string; data?: Record<string, any> } = {}) {
    if (!this.started) this.start();
    this.events.push({
      event_type,
      event_label: opts.label ?? null,
      event_data: opts.data ?? {},
      path: window.location.pathname,
      ts: Date.now(),
    });
    if (this.events.length >= 20) this.flush(false);
  }

  private onGlobalClick(e: MouseEvent) {
    const el = (e.target as HTMLElement | null)?.closest?.("a,button,[data-track]") as HTMLElement | null;
    if (!el) return;
    const trackAttr = el.getAttribute("data-track");
    const href = el.getAttribute("href") || "";
    if (href.includes("wa.me") || href.includes("api.whatsapp.com")) {
      this.track("click_whatsapp", { label: trackAttr || "wa_link", data: { href } });
      return;
    }
    if (trackAttr) {
      this.track("click_cta", { label: trackAttr, data: { text: (el.textContent || "").trim().slice(0, 80) } });
      return;
    }
    if (href.startsWith("http") && !href.includes(window.location.host)) {
      this.track("click_outbound", { label: "outbound", data: { href } });
    }
  }

  async flush(useBeacon = false) {
    if (!this.sessionId || !this.visitorId) return;
    if (this.events.length === 0 && this.pageviews.length === 0 && !this.initPayload) return;

    const body: any = {
      session_id: this.sessionId,
      visitor_id: this.visitorId,
      user_id: this.userId,
      events: this.events.splice(0),
      pageviews: this.pageviews.splice(0),
    };
    if (this.initPayload) {
      body.session_init = this.initPayload;
      this.initPayload = null;
    }

    const json = JSON.stringify(body);
    try {
      if (useBeacon && "sendBeacon" in navigator) {
        const blob = new Blob([json], { type: "application/json" });
        navigator.sendBeacon(FN_URL, blob);
        return;
      }
      await fetch(FN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json,
        keepalive: true,
      });
    } catch { /* silencioso */ }
  }
}

export const analytics = new Analytics();
