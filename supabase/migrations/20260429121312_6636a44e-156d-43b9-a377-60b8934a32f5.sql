ALTER TABLE public.webinar_sessions
  ADD COLUMN IF NOT EXISTS reached_thank_you boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS thank_you_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS whatsapp_group_clicked boolean NOT NULL DEFAULT false;