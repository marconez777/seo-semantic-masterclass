-- Corrigir avisos de segurança

-- 1. Recriar view com SECURITY INVOKER (padrão seguro)
DROP VIEW IF EXISTS public.backlinks_public;
CREATE VIEW public.backlinks_public 
WITH (security_invoker = true)
AS
SELECT id, url, domain, da, dr, traffic, price, category, tipo, created_at
FROM public.backlinks
WHERE status = 'ativo';

-- 2. Corrigir função com search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;