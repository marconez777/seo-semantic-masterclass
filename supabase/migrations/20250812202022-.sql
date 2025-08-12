-- 1) Create table to store sensitive customer data separately
CREATE TABLE IF NOT EXISTS public.pedidos_pii (
  order_id UUID PRIMARY KEY REFERENCES public.pedidos(id) ON DELETE CASCADE,
  customer_email TEXT,
  customer_name TEXT,
  customer_cpf TEXT,
  customer_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Enable RLS on the new table
ALTER TABLE public.pedidos_pii ENABLE ROW LEVEL SECURITY;

-- 3) RLS policies: admins can do everything
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pedidos_pii' AND policyname = 'Admins manage pedidos_pii'
  ) THEN
    CREATE POLICY "Admins manage pedidos_pii" ON public.pedidos_pii
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- 4) RLS policies: users can manage/select their own rows (linked by pedidos.user_id)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pedidos_pii' AND policyname = 'Users can select own pedidos_pii'
  ) THEN
    CREATE POLICY "Users can select own pedidos_pii" ON public.pedidos_pii
    FOR SELECT TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.pedidos p
      WHERE p.id = pedidos_pii.order_id AND p.user_id = auth.uid()
    ));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pedidos_pii' AND policyname = 'Users can insert own pedidos_pii'
  ) THEN
    CREATE POLICY "Users can insert own pedidos_pii" ON public.pedidos_pii
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.pedidos p
      WHERE p.id = pedidos_pii.order_id AND p.user_id = auth.uid()
    ));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pedidos_pii' AND policyname = 'Users can update own pedidos_pii'
  ) THEN
    CREATE POLICY "Users can update own pedidos_pii" ON public.pedidos_pii
    FOR UPDATE TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.pedidos p
      WHERE p.id = pedidos_pii.order_id AND p.user_id = auth.uid()
    ));
  END IF;
END $$;

-- 5) Trigger to maintain updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_pedidos_pii_updated_at'
  ) THEN
    CREATE TRIGGER trg_pedidos_pii_updated_at
    BEFORE UPDATE ON public.pedidos_pii
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 6) Migrate existing data into the new table
INSERT INTO public.pedidos_pii (order_id, customer_email, customer_name, customer_cpf, customer_phone)
SELECT id, customer_email, customer_name, customer_cpf, customer_phone
FROM public.pedidos p
WHERE (p.customer_email IS NOT NULL OR p.customer_name IS NOT NULL OR p.customer_cpf IS NOT NULL OR p.customer_phone IS NOT NULL)
ON CONFLICT (order_id) DO NOTHING;

-- 7) Drop sensitive columns from pedidos (only if they exist)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='pedidos' AND column_name='customer_email') THEN
    ALTER TABLE public.pedidos DROP COLUMN customer_email;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='pedidos' AND column_name='customer_name') THEN
    ALTER TABLE public.pedidos DROP COLUMN customer_name;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='pedidos' AND column_name='customer_cpf') THEN
    ALTER TABLE public.pedidos DROP COLUMN customer_cpf;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='pedidos' AND column_name='customer_phone') THEN
    ALTER TABLE public.pedidos DROP COLUMN customer_phone;
  END IF;
END $$;