
-- Table: keyword_projects
CREATE TABLE public.keyword_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  domain text NOT NULL,
  region text NOT NULL DEFAULT 'www.google.com.br',
  device text NOT NULL DEFAULT 'desktop',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.keyword_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON public.keyword_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON public.keyword_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.keyword_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.keyword_projects FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all projects"
  ON public.keyword_projects FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_keyword_projects_updated_at
  BEFORE UPDATE ON public.keyword_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Table: tracked_keywords
CREATE TABLE public.tracked_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.keyword_projects(id) ON DELETE CASCADE,
  keyword text NOT NULL,
  current_position integer,
  previous_position integer,
  best_position integer,
  last_checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tracked_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own keywords"
  ON public.tracked_keywords FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.keyword_projects
    WHERE keyword_projects.id = tracked_keywords.project_id
      AND keyword_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own keywords"
  ON public.tracked_keywords FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.keyword_projects
    WHERE keyword_projects.id = tracked_keywords.project_id
      AND keyword_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own keywords"
  ON public.tracked_keywords FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.keyword_projects
    WHERE keyword_projects.id = tracked_keywords.project_id
      AND keyword_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own keywords"
  ON public.tracked_keywords FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.keyword_projects
    WHERE keyword_projects.id = tracked_keywords.project_id
      AND keyword_projects.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all keywords"
  ON public.tracked_keywords FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Table: keyword_history
CREATE TABLE public.keyword_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id uuid NOT NULL REFERENCES public.tracked_keywords(id) ON DELETE CASCADE,
  position integer,
  checked_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.keyword_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history"
  ON public.keyword_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.tracked_keywords
    JOIN public.keyword_projects ON keyword_projects.id = tracked_keywords.project_id
    WHERE tracked_keywords.id = keyword_history.keyword_id
      AND keyword_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own history"
  ON public.keyword_history FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tracked_keywords
    JOIN public.keyword_projects ON keyword_projects.id = tracked_keywords.project_id
    WHERE tracked_keywords.id = keyword_history.keyword_id
      AND keyword_projects.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all history"
  ON public.keyword_history FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
