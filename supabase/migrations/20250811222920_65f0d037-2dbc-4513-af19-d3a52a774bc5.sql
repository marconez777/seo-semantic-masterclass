-- Create posts table for blog (idempotent)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  content_md text not null,
  featured_image_url text,
  seo_title text,
  seo_description text,
  slug text not null unique,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts enable row level security;

-- Policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='posts' AND policyname='Admins manage posts'
  ) THEN
    CREATE POLICY "Admins manage posts"
      ON public.posts
      AS RESTRICTIVE
      FOR ALL
      USING (has_role(auth.uid(), 'admin'::app_role))
      WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='posts' AND policyname='Public can read published posts'
  ) THEN
    CREATE POLICY "Public can read published posts"
      ON public.posts
      AS RESTRICTIVE
      FOR SELECT
      USING (published = true);
  END IF;
END $$;

-- Trigger for updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'update_posts_updated_at'
      AND n.nspname = 'public'
      AND c.relname = 'posts'
  ) THEN
    CREATE TRIGGER update_posts_updated_at
      BEFORE UPDATE ON public.posts
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('blog', 'blog', true)
on conflict (id) do nothing;

-- Storage policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public read blog images'
  ) THEN
    CREATE POLICY "Public read blog images"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'blog');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins can upload blog images'
  ) THEN
    CREATE POLICY "Admins can upload blog images"
      ON storage.objects
      FOR INSERT
      WITH CHECK (bucket_id = 'blog' AND has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins can update blog images'
  ) THEN
    CREATE POLICY "Admins can update blog images"
      ON storage.objects
      FOR UPDATE
      USING (bucket_id = 'blog' AND has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins can delete blog images'
  ) THEN
    CREATE POLICY "Admins can delete blog images"
      ON storage.objects
      FOR DELETE
      USING (bucket_id = 'blog' AND has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;