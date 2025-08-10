-- Enums
DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('pending','paid','cancelled','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Timestamp trigger function (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Backlinks (publicly readable catalog)
CREATE TABLE IF NOT EXISTS public.backlinks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL,
  site_url text NOT NULL,
  dr integer,
  da integer,
  traffic integer,
  category text NOT NULL,
  price_cents integer NOT NULL CHECK (price_cents >= 100),
  link_type text,
  requirements text[],
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.backlinks ENABLE ROW LEVEL SECURITY;

-- Public read-only policy for active backlinks
DO $$ BEGIN
  CREATE POLICY "Public can read active backlinks"
  ON public.backlinks FOR SELECT
  USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Update timestamp trigger
DO $$ BEGIN
  CREATE TRIGGER update_backlinks_updated_at
  BEFORE UPDATE ON public.backlinks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helpful indexes for filtering
CREATE INDEX IF NOT EXISTS idx_backlinks_category ON public.backlinks (category);
CREATE INDEX IF NOT EXISTS idx_backlinks_price ON public.backlinks (price_cents);
CREATE INDEX IF NOT EXISTS idx_backlinks_dr ON public.backlinks (dr);
CREATE INDEX IF NOT EXISTS idx_backlinks_traffic ON public.backlinks (traffic);

-- Orders (pedidos)
CREATE TABLE IF NOT EXISTS public.pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  total_cents integer NOT NULL CHECK (total_cents >= 0),
  status public.order_status NOT NULL DEFAULT 'pending',
  abacate_bill_id text,
  abacate_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- RLS: users manage their own orders
DO $$ BEGIN
  CREATE POLICY "Users can select own pedidos"
  ON public.pedidos FOR SELECT
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own pedidos"
  ON public.pedidos FOR INSERT
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own pedidos"
  ON public.pedidos FOR UPDATE
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own pedidos"
  ON public.pedidos FOR DELETE
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Update timestamp trigger
DO $$ BEGIN
  CREATE TRIGGER update_pedidos_updated_at
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Order items
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  backlink_id uuid NOT NULL REFERENCES public.backlinks(id),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  price_cents integer NOT NULL CHECK (price_cents >= 0)
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS for order_items by joining pedidos
DO $$ BEGIN
  CREATE POLICY "Users can select own order_items"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.pedidos p
    WHERE p.id = order_id AND p.user_id = auth.uid()
  ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own order_items"
  ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.pedidos p
    WHERE p.id = order_id AND p.user_id = auth.uid()
  ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own order_items"
  ON public.order_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.pedidos p
    WHERE p.id = order_id AND p.user_id = auth.uid()
  ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own order_items"
  ON public.order_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.pedidos p
    WHERE p.id = order_id AND p.user_id = auth.uid()
  ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Favorites
CREATE TABLE IF NOT EXISTS public.favoritos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  backlink_id uuid NOT NULL REFERENCES public.backlinks(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT favoritos_unique UNIQUE (user_id, backlink_id)
);

ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can select own favoritos"
  ON public.favoritos FOR SELECT
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own favoritos"
  ON public.favoritos FOR INSERT
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own favoritos"
  ON public.favoritos FOR DELETE
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;