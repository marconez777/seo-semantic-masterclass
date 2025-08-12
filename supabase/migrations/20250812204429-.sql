-- Tighten RLS and add URL validation triggers

-- 1) pedidos: remove user UPDATE; restrict DELETE to pending orders only
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Drop existing user update/delete policies if they exist
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pedidos' AND polname = 'Users can update own pedidos'
  ) THEN
    DROP POLICY "Users can update own pedidos" ON public.pedidos;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pedidos' AND polname = 'Users can delete own pedidos'
  ) THEN
    DROP POLICY "Users can delete own pedidos" ON public.pedidos;
  END IF;
END $$;

-- Recreate a stricter DELETE policy: only allow owners to delete pending orders
CREATE POLICY "Users can delete own pending pedidos"
ON public.pedidos
FOR DELETE
USING (auth.uid() = user_id AND status = 'pending');

-- 2) order_items: remove user UPDATE and DELETE permissions
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_items' AND polname = 'Users can update own order_items'
  ) THEN
    DROP POLICY "Users can update own order_items" ON public.order_items;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_items' AND polname = 'Users can delete own order_items'
  ) THEN
    DROP POLICY "Users can delete own order_items" ON public.order_items;
  END IF;
END $$;

-- 3) Add validation triggers for URLs on order_items (http/https only, reject javascript:)
CREATE OR REPLACE FUNCTION public.validate_order_items_urls()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Normalize empty strings to NULL
  IF NEW.target_url IS NOT NULL AND btrim(NEW.target_url) = '' THEN
    NEW.target_url := NULL;
  END IF;
  IF NEW.publication_url IS NOT NULL AND btrim(NEW.publication_url) = '' THEN
    NEW.publication_url := NULL;
  END IF;

  -- Validate target_url if present
  IF NEW.target_url IS NOT NULL THEN
    IF NEW.target_url ~* '^\s*javascript:' THEN
      RAISE EXCEPTION 'Invalid target_url protocol';
    END IF;
    IF NOT NEW.target_url ~* '^\s*https?://' THEN
      RAISE EXCEPTION 'target_url must start with http:// or https://';
    END IF;
  END IF;

  -- Validate publication_url if present
  IF NEW.publication_url IS NOT NULL THEN
    IF NEW.publication_url ~* '^\s*javascript:' THEN
      RAISE EXCEPTION 'Invalid publication_url protocol';
    END IF;
    IF NOT NEW.publication_url ~* '^\s*https?://' THEN
      RAISE EXCEPTION 'publication_url must start with http:// or https://';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_order_items_urls_ins ON public.order_items;
CREATE TRIGGER trg_validate_order_items_urls_ins
BEFORE INSERT ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.validate_order_items_urls();

DROP TRIGGER IF EXISTS trg_validate_order_items_urls_upd ON public.order_items;
CREATE TRIGGER trg_validate_order_items_urls_upd
BEFORE UPDATE ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.validate_order_items_urls();