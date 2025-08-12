-- Secure public exposure of backlinks via a narrowed replica table
-- 1) Create a safe public table with only necessary fields
create table if not exists public.backlinks_public (
  id uuid primary key,
  site_name text,
  site_url text,
  dr int,
  da int,
  traffic int,
  category text,
  price_cents int,
  is_active boolean,
  updated_at timestamptz not null default now()
);

-- 2) Enable RLS and allow public read-only access
alter table public.backlinks_public enable row level security;

-- Allow anyone (including anon) to read
create policy if not exists "Public can read backlinks_public"
  on public.backlinks_public
  for select
  using (true);

-- Allow authenticated to write (used by triggers/admin operations)
create policy if not exists "Authenticated can write backlinks_public"
  on public.backlinks_public
  for all
  to authenticated
  using (true)
  with check (true);

-- 3) Seed/Sync data initially from the private source table
insert into public.backlinks_public (id, site_name, site_url, dr, da, traffic, category, price_cents, is_active, updated_at)
select id, site_name, site_url, dr, da, traffic, category, price_cents, is_active, now()
from public.backlinks
on conflict (id) do update set
  site_name = excluded.site_name,
  site_url = excluded.site_url,
  dr = excluded.dr,
  da = excluded.da,
  traffic = excluded.traffic,
  category = excluded.category,
  price_cents = excluded.price_cents,
  is_active = excluded.is_active,
  updated_at = now();

-- 4) Keep the public table in sync via trigger
create or replace function public.sync_backlinks_public()
returns trigger as $$
begin
  if tg_op = 'DELETE' then
    delete from public.backlinks_public where id = old.id;
    return old;
  else
    insert into public.backlinks_public (id, site_name, site_url, dr, da, traffic, category, price_cents, is_active, updated_at)
    values (new.id, new.site_name, new.site_url, new.dr, new.da, new.traffic, new.category, new.price_cents, new.is_active, now())
    on conflict (id) do update set
      site_name = excluded.site_name,
      site_url = excluded.site_url,
      dr = excluded.dr,
      da = excluded.da,
      traffic = excluded.traffic,
      category = excluded.category,
      price_cents = excluded.price_cents,
      is_active = excluded.is_active,
      updated_at = now();
    return new;
  end if;
end;
$$ language plpgsql;

-- apply trigger on main table
create or replace trigger trg_sync_backlinks_public
after insert or update or delete on public.backlinks
for each row execute function public.sync_backlinks_public();

-- 5) Restrict base table to authenticated users only
alter table public.backlinks enable row level security;

-- Create a safe read policy for authenticated users (no public policy)
create policy if not exists "Authenticated can read backlinks"
  on public.backlinks
  for select
  to authenticated
  using (true);
