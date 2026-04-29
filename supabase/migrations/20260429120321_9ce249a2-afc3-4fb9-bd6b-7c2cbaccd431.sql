
-- 1. webinar_sessions
CREATE TABLE public.webinar_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  signup_id uuid NULL,

  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at  timestamptz NOT NULL DEFAULT now(),

  utm_source text, utm_medium text, utm_campaign text, utm_content text, utm_term text,
  referrer text, landing_url text,

  user_agent text, device_type text, os text, browser text,
  screen_size text, viewport_size text, language text, timezone text,
  ip_country text, ip_city text,

  video_started boolean NOT NULL DEFAULT false,
  video_watch_seconds integer NOT NULL DEFAULT 0,
  video_max_position_seconds integer NOT NULL DEFAULT 0,
  video_duration_seconds integer NOT NULL DEFAULT 0,
  video_completion_pct numeric NOT NULL DEFAULT 0,
  video_completed boolean NOT NULL DEFAULT false,
  unmuted boolean NOT NULL DEFAULT false,
  went_fullscreen boolean NOT NULL DEFAULT false,
  max_speed numeric NOT NULL DEFAULT 1,

  cta_clicks integer NOT NULL DEFAULT 0,
  cta_hero_clicks integer NOT NULL DEFAULT 0,
  cta_learn_clicks integer NOT NULL DEFAULT 0,
  cta_final_clicks integer NOT NULL DEFAULT 0,
  cta_sticky_clicks integer NOT NULL DEFAULT 0,
  first_cta_clicked text,

  signup_modal_opened boolean NOT NULL DEFAULT false,
  signup_step_reached integer NOT NULL DEFAULT 0,
  signup_completed boolean NOT NULL DEFAULT false,
  signup_qualified boolean NOT NULL DEFAULT false,

  total_time_on_page_seconds integer NOT NULL DEFAULT 0,
  scroll_depth_pct integer NOT NULL DEFAULT 0
);

CREATE INDEX idx_webinar_sessions_first_seen ON public.webinar_sessions(first_seen_at DESC);
CREATE INDEX idx_webinar_sessions_signup ON public.webinar_sessions(signup_id);

ALTER TABLE public.webinar_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert webinar session"
  ON public.webinar_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view webinar sessions"
  ON public.webinar_sessions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update webinar sessions"
  ON public.webinar_sessions FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete webinar sessions"
  ON public.webinar_sessions FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. webinar_events
CREATE TABLE public.webinar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  event_type text NOT NULL,
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_webinar_events_session ON public.webinar_events(session_id, created_at);
CREATE INDEX idx_webinar_events_created ON public.webinar_events(created_at DESC);
CREATE INDEX idx_webinar_events_type ON public.webinar_events(event_type);

ALTER TABLE public.webinar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert webinar event"
  ON public.webinar_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view webinar events"
  ON public.webinar_events FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete webinar events"
  ON public.webinar_events FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Link signup -> session
ALTER TABLE public.webinar_signups ADD COLUMN IF NOT EXISTS session_id text;
CREATE INDEX IF NOT EXISTS idx_webinar_signups_session ON public.webinar_signups(session_id);
