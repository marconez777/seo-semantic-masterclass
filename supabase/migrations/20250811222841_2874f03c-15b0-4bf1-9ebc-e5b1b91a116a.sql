-- Create posts table for blog
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

-- Enable RLS
alter table public.posts enable row level security;

-- Admins manage posts policy
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'posts' and polname = 'Admins manage posts'
  ) then
    create policy "Admins manage posts"
      on public.posts
      as restrictive
      for all
      using (has_role(auth.uid(), 'admin'::app_role))
      with check (has_role(auth.uid(), 'admin'::app_role));
  end if;
end $$;

-- Public can read published posts policy
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'posts' and polname = 'Public can read published posts'
  ) then
    create policy "Public can read published posts"
      on public.posts
      as restrictive
      for select
      using (published = true);
  end if;
end $$;

-- Trigger to update updated_at
do $$ begin
  if not exists (
    select 1 from pg_trigger t join pg_class c on c.oid = t.tgrelid join pg_namespace n on n.oid = c.relnamespace
    where t.tgname = 'update_posts_updated_at' and n.nspname = 'public' and c.relname = 'posts'
  ) then
    create trigger update_posts_updated_at
    before update on public.posts
    for each row execute function public.update_updated_at_column();
  end if;
end $$;

-- Create storage bucket for blog images
insert into storage.buckets (id, name, public)
values ('blog', 'blog', true)
on conflict (id) do nothing;

-- Storage policies
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and polname = 'Public read blog images'
  ) then
    create policy "Public read blog images"
      on storage.objects
      for select
      using (bucket_id = 'blog');
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and polname = 'Admins can upload blog images'
  ) then
    create policy "Admins can upload blog images"
      on storage.objects
      for insert
      with check (bucket_id = 'blog' and has_role(auth.uid(), 'admin'::app_role));
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and polname = 'Admins can update blog images'
  ) then
    create policy "Admins can update blog images"
      on storage.objects
      for update
      using (bucket_id = 'blog' and has_role(auth.uid(), 'admin'::app_role));
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and polname = 'Admins can delete blog images'
  ) then
    create policy "Admins can delete blog images"
      on storage.objects
      for delete
      using (bucket_id = 'blog' and has_role(auth.uid(), 'admin'::app_role));
  end if;
end $$;