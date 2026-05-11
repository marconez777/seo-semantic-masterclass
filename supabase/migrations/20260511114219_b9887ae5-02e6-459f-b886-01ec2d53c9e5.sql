
CREATE TABLE public.analytics_visitors (
  visitor_id text PRIMARY KEY,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid,
  first_referrer text,
  first_referrer_host text,
  first_landing_path text,
  first_utm_source text,
  first_utm_medium text,
  first_utm_campaign text,
  first_channel text,
  total_sessions integer NOT NULL DEFAULT 1,
  total_pageviews integer NOT NULL DEFAULT 0
);

CREATE TABLE public.analytics_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  visitor_id text NOT NULL,
  user_id uuid,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  duration_seconds integer NOT NULL DEFAULT 0,
  pageview_count integer NOT NULL DEFAULT 0,
  event_count integer NOT NULL DEFAULT 0,
  landing_path text,
  exit_path text,
  referrer text,
  referrer_host text,
  channel text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  device_type text,
  os text,
  browser text,
  language text,
  screen_size text,
  viewport_size text,
  ip_country text,
  ip_city text,
  timezone text,
  user_agent text,
  signed_up boolean NOT NULL DEFAULT false,
  clicked_whatsapp boolean NOT NULL DEFAULT false,
  created_order boolean NOT NULL DEFAULT false
);

CREATE TABLE public.analytics_pageviews (
  id bigserial PRIMARY KEY,
  session_id text NOT NULL,
  visitor_id text NOT NULL,
  user_id uuid,
  path text NOT NULL,
  title text,
  referrer text,
  duration_seconds integer,
  scroll_depth_pct integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.analytics_events (
  id bigserial PRIMARY KEY,
  session_id text NOT NULL,
  visitor_id text NOT NULL,
  user_id uuid,
  path text,
  event_type text NOT NULL,
  event_label text,
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_an_pv_path_date ON public.analytics_pageviews (path, created_at DESC);
CREATE INDEX idx_an_pv_session ON public.analytics_pageviews (session_id);
CREATE INDEX idx_an_pv_user ON public.analytics_pageviews (user_id, created_at DESC);
CREATE INDEX idx_an_pv_visitor ON public.analytics_pageviews (visitor_id, created_at DESC);
CREATE INDEX idx_an_ev_type_date ON public.analytics_events (event_type, created_at DESC);
CREATE INDEX idx_an_ev_user ON public.analytics_events (user_id, created_at DESC);
CREATE INDEX idx_an_ev_visitor ON public.analytics_events (visitor_id, created_at DESC);
CREATE INDEX idx_an_ev_session ON public.analytics_events (session_id);
CREATE INDEX idx_an_ses_started ON public.analytics_sessions (started_at DESC);
CREATE INDEX idx_an_ses_channel ON public.analytics_sessions (channel, started_at DESC);
CREATE INDEX idx_an_ses_user ON public.analytics_sessions (user_id);
CREATE INDEX idx_an_ses_visitor ON public.analytics_sessions (visitor_id);
CREATE INDEX idx_an_vis_user ON public.analytics_visitors (user_id);

ALTER TABLE public.analytics_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_pageviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view analytics_visitors" ON public.analytics_visitors
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view analytics_sessions" ON public.analytics_sessions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view analytics_pageviews" ON public.analytics_pageviews
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view analytics_events" ON public.analytics_events
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
