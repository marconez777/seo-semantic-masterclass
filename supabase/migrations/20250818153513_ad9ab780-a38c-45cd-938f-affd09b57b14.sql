-- Fix remaining security issues

-- Add RLS policies to pedidos_pii_masked table
ALTER TABLE public.pedidos_pii_masked ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to access masked PII data
CREATE POLICY "Admins can view masked PII data" ON public.pedidos_pii_masked
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create policy for order owners to view their own masked PII
CREATE POLICY "Order owners can view their own masked PII" ON public.pedidos_pii_masked
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pedidos p
      WHERE p.id = pedidos_pii_masked.order_id 
      AND p.user_id = auth.uid()
    )
  );

-- Fix remaining functions that still need search_path protection
-- These are functions that might still be missing the security setting

-- Update get_pii_key function
CREATE OR REPLACE FUNCTION public.get_pii_key()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Use uma chave da configuração do Supabase
  RETURN current_setting('app.pii_key', true);
END;
$function$;

-- Update get_pedidos_pii_decrypted function
CREATE OR REPLACE FUNCTION public.get_pedidos_pii_decrypted(p_order_ids uuid[])
 RETURNS TABLE(order_id uuid, customer_email text, customer_name text, customer_cpf text, customer_phone text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  encryption_key text;
BEGIN
  -- Obter chave de criptografia
  encryption_key := public.get_pii_key();
  
  IF encryption_key IS NULL OR encryption_key = '' THEN
    RAISE EXCEPTION 'Encryption key not configured';
  END IF;

  RETURN QUERY
  SELECT
    pp.order_id,
    CASE WHEN pp.customer_email_enc IS NOT NULL
      THEN pgp_sym_decrypt(pp.customer_email_enc, encryption_key)::text
      ELSE NULL END as customer_email,
    CASE WHEN pp.customer_name_enc IS NOT NULL
      THEN pgp_sym_decrypt(pp.customer_name_enc, encryption_key)::text  
      ELSE NULL END as customer_name,
    CASE WHEN pp.customer_cpf_enc IS NOT NULL
      THEN pgp_sym_decrypt(pp.customer_cpf_enc, encryption_key)::text
      ELSE NULL END as customer_cpf,
    CASE WHEN pp.customer_phone_enc IS NOT NULL
      THEN pgp_sym_decrypt(pp.customer_phone_enc, encryption_key)::text
      ELSE NULL END as customer_phone
  FROM public.pedidos_pii pp
  JOIN public.pedidos p ON p.id = pp.order_id
  WHERE pp.order_id = ANY(p_order_ids)
    AND (
      public.has_role(auth.uid(), 'admin')  -- admin pode ver tudo
      OR p.user_id = auth.uid()             -- dono do pedido vê o seu
    );
END;
$function$;

-- Update insert_pedidos_pii_encrypted function
CREATE OR REPLACE FUNCTION public.insert_pedidos_pii_encrypted(p_order_id uuid, p_customer_email text DEFAULT NULL::text, p_customer_name text DEFAULT NULL::text, p_customer_cpf text DEFAULT NULL::text, p_customer_phone text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  encryption_key text;
BEGIN
  -- Obter chave de criptografia
  encryption_key := public.get_pii_key();
  
  IF encryption_key IS NULL OR encryption_key = '' THEN
    RAISE EXCEPTION 'Encryption key not configured';
  END IF;

  INSERT INTO public.pedidos_pii (
    order_id,
    customer_email_enc,
    customer_name_enc,
    customer_cpf_enc,
    customer_phone_enc
  ) VALUES (
    p_order_id,
    CASE WHEN p_customer_email IS NOT NULL
      THEN pgp_sym_encrypt(p_customer_email, encryption_key) END,
    CASE WHEN p_customer_name IS NOT NULL
      THEN pgp_sym_encrypt(p_customer_name, encryption_key) END,
    CASE WHEN p_customer_cpf IS NOT NULL
      THEN pgp_sym_encrypt(p_customer_cpf, encryption_key) END,
    CASE WHEN p_customer_phone IS NOT NULL
      THEN pgp_sym_encrypt(p_customer_phone, encryption_key) END
  );
END;
$function$;

-- Update sync_backlinks_public function 
CREATE OR REPLACE FUNCTION public.sync_backlinks_public()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.backlinks_public WHERE id = OLD.id;
    RETURN OLD;
  ELSE
    INSERT INTO public.backlinks_public (id, site_name, site_url, category, price_cents, traffic, da, dr, is_active)
    VALUES (NEW.id, NEW.site_name, NEW.site_url, NEW.category, NEW.price_cents, NEW.traffic, NEW.da, NEW.dr, NEW.is_active)
    ON CONFLICT (id) DO UPDATE SET
      site_name = EXCLUDED.site_name,
      site_url = EXCLUDED.site_url,
      category = EXCLUDED.category,
      price_cents = EXCLUDED.price_cents,
      traffic = EXCLUDED.traffic,
      da = EXCLUDED.da,
      dr = EXCLUDED.dr,
      is_active = EXCLUDED.is_active;
    RETURN NEW;
  END IF;
END;
$function$;