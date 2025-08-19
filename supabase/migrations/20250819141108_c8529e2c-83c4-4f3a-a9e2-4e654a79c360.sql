-- 1) Remover campos herdados do Abacate/Stripe
ALTER TABLE public.pedidos 
  DROP COLUMN IF EXISTS abacate_bill_id,
  DROP COLUMN IF EXISTS abacate_url,
  DROP COLUMN IF EXISTS stripe_session_id,
  DROP COLUMN IF EXISTS payment_reference,
  DROP COLUMN IF EXISTS payment_provider;

-- 2) Adicionar colunas para fluxo manual PIX
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS publish_due_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'pix_manual';

-- 3) Trigger: quando marcar como 'paid', setar paid_at e publish_due_at = now() + 7 dias
CREATE OR REPLACE FUNCTION public.set_paid_timestamps()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    NEW.paid_at := COALESCE(NEW.paid_at, now());
    NEW.publish_due_at := COALESCE(NEW.publish_due_at, now() + interval '7 days');
  END IF;

  IF NEW.status = 'cancelled' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    NEW.cancelled_at := COALESCE(NEW.cancelled_at, now());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_paid_timestamps ON public.pedidos;
CREATE TRIGGER trg_set_paid_timestamps
BEFORE UPDATE ON public.pedidos
FOR EACH ROW EXECUTE FUNCTION public.set_paid_timestamps();

-- 4) Tabela de recibos anexados a pedidos
CREATE TABLE IF NOT EXISTS public.order_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  note text,
  file_url text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_receipts ENABLE ROW LEVEL SECURITY;

-- Políticas: admin pode tudo; usuário vê recibos dos próprios pedidos
CREATE POLICY "Admins manage receipts"
  ON public.order_receipts
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users can read own receipts"
  ON public.order_receipts
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.pedidos p
    WHERE p.id = order_receipts.order_id
      AND p.user_id = auth.uid()
  ));