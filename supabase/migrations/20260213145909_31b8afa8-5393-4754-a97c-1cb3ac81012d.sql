CREATE TABLE public.keyword_monthly_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id uuid NOT NULL REFERENCES public.tracked_keywords(id) ON DELETE CASCADE,
  month date NOT NULL,
  position integer,
  checked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(keyword_id, month)
);

ALTER TABLE public.keyword_monthly_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own snapshots" ON public.keyword_monthly_snapshots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tracked_keywords
      JOIN keyword_projects ON keyword_projects.id = tracked_keywords.project_id
      WHERE tracked_keywords.id = keyword_monthly_snapshots.keyword_id
      AND keyword_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own snapshots" ON public.keyword_monthly_snapshots
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tracked_keywords
      JOIN keyword_projects ON keyword_projects.id = tracked_keywords.project_id
      WHERE tracked_keywords.id = keyword_monthly_snapshots.keyword_id
      AND keyword_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all snapshots" ON public.keyword_monthly_snapshots
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));