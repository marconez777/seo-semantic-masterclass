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

-- Policies
create policy if not exists "Admins manage posts"
  on public.posts
  as restrictive
  for all
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));

create policy if not exists "Public can read published posts"
  on public.posts
  as restrictive
  for select
  using (published = true);

-- Trigger to update updated_at
create trigger if not exists update_posts_updated_at
before update on public.posts
for each row execute function public.update_updated_at_column();

-- Create storage bucket for blog images
insert into storage.buckets (id, name, public)
values ('blog', 'blog', true)
on conflict (id) do nothing;

-- Storage policies
create policy if not exists "Public read blog images"
  on storage.objects
  for select
  using (bucket_id = 'blog');

create policy if not exists "Admins can upload blog images"
  on storage.objects
  for insert
  with check (bucket_id = 'blog' and has_role(auth.uid(), 'admin'::app_role));

create policy if not exists "Admins can update blog images"
  on storage.objects
  for update
  using (bucket_id = 'blog' and has_role(auth.uid(), 'admin'::app_role));

create policy if not exists "Admins can delete blog images"
  on storage.objects
  for delete
  using (bucket_id = 'blog' and has_role(auth.uid(), 'admin'::app_role));