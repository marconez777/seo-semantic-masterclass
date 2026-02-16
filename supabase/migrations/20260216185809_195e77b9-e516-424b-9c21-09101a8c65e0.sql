
-- =============================================
-- CONSULTING CLIENTS
-- =============================================
CREATE TABLE public.consulting_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- linked user (nullable until assigned)
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.consulting_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage consulting_clients"
  ON public.consulting_clients FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own consulting record"
  ON public.consulting_clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE TRIGGER update_consulting_clients_updated_at
  BEFORE UPDATE ON public.consulting_clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- CONSULTING KEYWORDS
-- =============================================
CREATE TABLE public.consulting_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.consulting_clients(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  volume INTEGER DEFAULT 0,
  cpc NUMERIC DEFAULT 0,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.consulting_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage consulting_keywords"
  ON public.consulting_keywords FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own keywords"
  ON public.consulting_keywords FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.consulting_clients
    WHERE consulting_clients.id = consulting_keywords.client_id
      AND consulting_clients.user_id = auth.uid()
  ));

-- =============================================
-- CONSULTING PAGES
-- =============================================
CREATE TABLE public.consulting_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.consulting_clients(id) ON DELETE CASCADE,
  page_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  main_keyword TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.consulting_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage consulting_pages"
  ON public.consulting_pages FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own pages"
  ON public.consulting_pages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.consulting_clients
    WHERE consulting_clients.id = consulting_pages.client_id
      AND consulting_clients.user_id = auth.uid()
  ));

-- =============================================
-- CONSULTING PAGE KEYWORDS
-- =============================================
CREATE TABLE public.consulting_page_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.consulting_pages(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  repartition NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.consulting_page_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage consulting_page_keywords"
  ON public.consulting_page_keywords FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own page keywords"
  ON public.consulting_page_keywords FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.consulting_pages
    JOIN public.consulting_clients ON consulting_clients.id = consulting_pages.client_id
    WHERE consulting_pages.id = consulting_page_keywords.page_id
      AND consulting_clients.user_id = auth.uid()
  ));

-- =============================================
-- CONSULTING BACKLINKS
-- =============================================
CREATE TABLE public.consulting_backlinks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.consulting_clients(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  site_domain TEXT NOT NULL,
  dr INTEGER DEFAULT 0,
  anchor_text TEXT,
  target_url TEXT,
  publication_url TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.consulting_backlinks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage consulting_backlinks"
  ON public.consulting_backlinks FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own backlinks"
  ON public.consulting_backlinks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.consulting_clients
    WHERE consulting_clients.id = consulting_backlinks.client_id
      AND consulting_clients.user_id = auth.uid()
  ));

-- =============================================
-- CONSULTING BLOG POSTS
-- =============================================
CREATE TABLE public.consulting_blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.consulting_clients(id) ON DELETE CASCADE,
  month DATE,
  title TEXT NOT NULL,
  url TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.consulting_blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage consulting_blog_posts"
  ON public.consulting_blog_posts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own blog posts"
  ON public.consulting_blog_posts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.consulting_clients
    WHERE consulting_clients.id = consulting_blog_posts.client_id
      AND consulting_clients.user_id = auth.uid()
  ));

-- =============================================
-- CONSULTING TASKS
-- =============================================
CREATE TABLE public.consulting_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.consulting_clients(id) ON DELETE CASCADE,
  column_key TEXT NOT NULL DEFAULT 'pesquisa',
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pendente',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.consulting_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage consulting_tasks"
  ON public.consulting_tasks FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own tasks"
  ON public.consulting_tasks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.consulting_clients
    WHERE consulting_clients.id = consulting_tasks.client_id
      AND consulting_clients.user_id = auth.uid()
  ));

CREATE TRIGGER update_consulting_tasks_updated_at
  BEFORE UPDATE ON public.consulting_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
