// Cliente de tracking para a página do webinar.
// Mantém um session_id em localStorage, faz buffer de eventos e envia
// patches de métricas via edge function `webinar-track`.

type EventPayload = { type: string; data?: Record<string, any>; ts: number };
type MetricsPatch = Record<string, any>;

const STORAGE_KEY = "webinar_session_id";
const FUNCTIONS_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/webinar-track`;

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function detectDevice(): string {
  const ua = navigator.userAgent;
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return "mobile";
  return "desktop";
}

function detectOS(): string {
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac OS X/i.test(ua)) return "macOS";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "Unknown";
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (/Edg/i.test(ua)) return "Edge";
  if (/Chrome/i.test(ua) && !/Chromium/i.test(ua)) return "Chrome";
  if (/Firefox/i.test(ua)) return "Firefox";
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return "Safari";
  return "Other";
}

class WebinarTracker {
  private sessionId: string | null = null;
  private initialized = false;
  private buffer: EventPayload[] = [];
  private pendingPatch: MetricsPatch = {};
  private flushTimer: number | null = null;
  private initPayload: Record<string, any> | null = null;

  getSessionId(): string {
    if (this.sessionId) return this.sessionId;
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = uuid();
      localStorage.setItem(STORAGE_KEY, id);
    }
    this.sessionId = id;
    return id;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.getSessionId();

    const url = new URL(window.location.href);
    const qs = url.searchParams;

    this.initPayload = {
      utm_source: qs.get("utm_source"),
      utm_medium: qs.get("utm_medium"),
      utm_campaign: qs.get("utm_campaign"),
      utm_content: qs.get("utm_content"),
      utm_term: qs.get("utm_term"),
      referrer: document.referrer || null,
      landing_url: window.location.href,
      user_agent: navigator.userAgent,
      device_type: detectDevice(),
      os: detectOS(),
      browser: detectBrowser(),
      screen_size: `${window.screen.width}x${window.screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    this.track("page_view", { path: window.location.pathname });

    // Flush periódico
    this.flushTimer = window.setInterval(() => this.flush(false), 5000);

    // Flush em visibilidade / unload
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") this.flush(true);
    });
    window.addEventListener("pagehide", () => this.flush(true));
    window.addEventListener("beforeunload", () => this.flush(true));
  }

  track(type: string, data: Record<string, any> = {}) {
    if (!this.initialized) this.getSessionId();
    this.buffer.push({ type, data, ts: Date.now() });
    if (this.buffer.length >= 20) this.flush(false);
  }

  patchMetrics(patch: MetricsPatch) {
    // Merge: contadores somam, máximos pegam o maior, booleans OR
    for (const [k, v] of Object.entries(patch)) {
      if (typeof v === "boolean") {
        this.pendingPatch[k] = !!this.pendingPatch[k] || v;
      } else if (typeof v === "number") {
        // se já existe um número pendente, mantemos o maior (ex: max_position)
        // exceto chaves de incremento (com prefix _inc) — tratamos como soma
        if (k.endsWith("_inc")) {
          this.pendingPatch[k] = (this.pendingPatch[k] || 0) + v;
        } else {
          const cur = this.pendingPatch[k];
          this.pendingPatch[k] = cur === undefined ? v : Math.max(cur, v);
        }
      } else {
        this.pendingPatch[k] = v;
      }
    }
  }

  async flush(useBeacon = false) {
    if (!this.sessionId) return;
    if (this.buffer.length === 0 && Object.keys(this.pendingPatch).length === 0 && !this.initPayload) return;

    const body: any = {
      session_id: this.sessionId,
      events: this.buffer.splice(0),
      metrics_patch: this.pendingPatch,
    };
    this.pendingPatch = {};

    if (this.initPayload) {
      body.session_init = this.initPayload;
      this.initPayload = null;
    }

    const json = JSON.stringify(body);

    try {
      if (useBeacon && "sendBeacon" in navigator) {
        const blob = new Blob([json], { type: "application/json" });
        navigator.sendBeacon(FUNCTIONS_URL, blob);
        return;
      }
      await fetch(FUNCTIONS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json,
        keepalive: true,
      });
    } catch {
      /* silencioso */
    }
  }
}

export const webinarTracker = new WebinarTracker();
