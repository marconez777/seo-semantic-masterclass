-- Final security fixes for remaining functions and policies

-- Update get_pii_key function with security definer and search path
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

-- Update get_pedidos_pii_decrypted function with security definer and search path
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

-- Update insert_pedidos_pii_encrypted function with security definer and search path
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

-- Create secure function to access masked PII data
CREATE OR REPLACE FUNCTION public.get_masked_pii_secure(p_order_ids uuid[])
 RETURNS TABLE(order_id uuid, customer_email_masked text, customer_first_name text, customer_cpf_masked text, customer_phone_masked text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Only allow admins to access masked PII data
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Only admins can access masked PII data';
  END IF;

  RETURN QUERY
  SELECT 
    ppm.order_id,
    ppm.customer_email_masked,
    ppm.customer_first_name,
    ppm.customer_cpf_masked,
    ppm.customer_phone_masked
  FROM public.pedidos_pii_masked ppm
  WHERE ppm.order_id = ANY(p_order_ids);
END;
$function$;

-- Add RLS policy to block direct access to pedidos_pii_masked view (even though it's a view)
-- This will ensure users use the secure function instead
CREATE POLICY "Block direct access to pedidos_pii_masked"
ON public.pedidos_pii_masked
FOR ALL
USING (false)
WITH CHECK (false);

-- Enable RLS on pedidos_pii_masked (this will block all direct access)
ALTER TABLE public.pedidos_pii_masked ENABLE ROW LEVEL SECURITY;