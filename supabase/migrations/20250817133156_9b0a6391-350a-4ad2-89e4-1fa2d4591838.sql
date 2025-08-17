-- Adicionar campos de conteúdo SEO à tabela categories
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS h1 text,
  ADD COLUMN IF NOT EXISTS intro text,
  ADD COLUMN IF NOT EXISTS seo_html text;