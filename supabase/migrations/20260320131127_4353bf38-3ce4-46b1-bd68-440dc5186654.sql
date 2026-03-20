
-- New table for consulting keyword monthly snapshots
CREATE TABLE public.consulting_keyword_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id uuid NOT NULL REFERENCES public.consulting_keywords(id) ON DELETE CASCADE,
  month date NOT NULL,
  position integer,
  checked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(keyword_id, month)
);

ALTER TABLE public.consulting_keyword_snapshots ENABLE ROW LEVEL SECURITY;

-- Admin ALL
CREATE POLICY "Admins can manage consulting_keyword_snapshots"
  ON public.consulting_keyword_snapshots FOR ALL TO public
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Clients can view own snapshots
CREATE POLICY "Clients can view own keyword snapshots"
  ON public.consulting_keyword_snapshots FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM consulting_keywords ck
    JOIN consulting_clients cc ON cc.id = ck.client_id
    WHERE ck.id = consulting_keyword_snapshots.keyword_id
    AND cc.user_id = auth.uid()
  ));

-- Add tracking columns to consulting_keywords
ALTER TABLE public.consulting_keywords
  ADD COLUMN IF NOT EXISTS current_position integer,
  ADD COLUMN IF NOT EXISTS previous_position integer,
  ADD COLUMN IF NOT EXISTS best_position integer,
  ADD COLUMN IF NOT EXISTS last_checked_at timestamptz;
