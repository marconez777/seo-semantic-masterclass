-- Enhanced Security: Remove public API access to PII data
-- This migration removes direct API access to the pedidos_pii table and creates secure edge function access only

-- 1. Revoke all public API access to the pedidos_pii table
REVOKE ALL ON public.pedidos_pii FROM authenticated;
REVOKE ALL ON public.pedidos_pii FROM anon;

-- 2. Create a service role function to access PII data (only callable by edge functions)
CREATE OR REPLACE FUNCTION public.get_decrypted_pii_secure(p_order_id UUID)
RETURNS TABLE(
  order_id UUID,
  customer_email TEXT,
  customer_name TEXT,
  customer_cpf TEXT,
  customer_phone TEXT
) 
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow service role to call this function
  IF current_setting('role') != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: Function only accessible to service role';
  END IF;

  RETURN QUERY
  SELECT 
    pii.order_id,
    public.decrypt_pii(pii.customer_email) as customer_email,
    public.decrypt_pii(pii.customer_name) as customer_name,
    public.decrypt_pii(pii.customer_cpf) as customer_cpf,
    public.decrypt_pii(pii.customer_phone) as customer_phone
  FROM public.pedidos_pii pii
  WHERE pii.order_id = p_order_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Create a service role function to get multiple PII records (for admin)
CREATE OR REPLACE FUNCTION public.get_multiple_decrypted_pii_secure(p_order_ids UUID[])
RETURNS TABLE(
  order_id UUID,
  customer_email TEXT,
  customer_name TEXT,
  customer_cpf TEXT,
  customer_phone TEXT
) 
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow service role to call this function
  IF current_setting('role') != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: Function only accessible to service role';
  END IF;

  RETURN QUERY
  SELECT 
    pii.order_id,
    public.decrypt_pii(pii.customer_email) as customer_email,
    public.decrypt_pii(pii.customer_name) as customer_name,
    public.decrypt_pii(pii.customer_cpf) as customer_cpf,
    public.decrypt_pii(pii.customer_phone) as customer_phone
  FROM public.pedidos_pii pii
  WHERE pii.order_id = ANY(p_order_ids);
END;
$$ LANGUAGE plpgsql;

-- 4. Update the insert function to be service role only as well
CREATE OR REPLACE FUNCTION public.insert_encrypted_pii_secure(
  p_order_id UUID,
  p_customer_email TEXT DEFAULT NULL,
  p_customer_name TEXT DEFAULT NULL,
  p_customer_cpf TEXT DEFAULT NULL,
  p_customer_phone TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Only allow service role to call this function
  IF current_setting('role') != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: Function only accessible to service role';
  END IF;

  INSERT INTO public.pedidos_pii (
    order_id,
    customer_email,
    customer_name,
    customer_cpf,
    customer_phone
  ) VALUES (
    p_order_id,
    public.encrypt_pii(p_customer_email),
    public.encrypt_pii(p_customer_name),
    public.encrypt_pii(p_customer_cpf),
    public.encrypt_pii(p_customer_phone)
  );
END;
$$ LANGUAGE plpgsql;

-- 5. Remove all RLS policies from pedidos_pii since it's no longer accessible via API
DROP POLICY IF EXISTS "Admins manage pedidos_pii" ON public.pedidos_pii;
DROP POLICY IF EXISTS "Users can select own pedidos_pii" ON public.pedidos_pii;
DROP POLICY IF EXISTS "Users can insert own pedidos_pii" ON public.pedidos_pii;
DROP POLICY IF EXISTS "Users can update own pedidos_pii" ON public.pedidos_pii;

-- 6. Disable RLS since table is no longer accessible via public API
ALTER TABLE public.pedidos_pii DISABLE ROW LEVEL SECURITY;

-- 7. Grant execute permissions only to service role for the secure functions
GRANT EXECUTE ON FUNCTION public.get_decrypted_pii_secure TO service_role;
GRANT EXECUTE ON FUNCTION public.get_multiple_decrypted_pii_secure TO service_role;
GRANT EXECUTE ON FUNCTION public.insert_encrypted_pii_secure TO service_role;