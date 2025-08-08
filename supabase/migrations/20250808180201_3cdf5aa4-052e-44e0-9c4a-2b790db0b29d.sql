-- Add neutral payment columns used by Abacate Pay integration
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS payment_provider TEXT;

-- Helpful index for webhook updates/lookups
CREATE INDEX IF NOT EXISTS idx_pedidos_payment_reference ON public.pedidos(payment_reference);