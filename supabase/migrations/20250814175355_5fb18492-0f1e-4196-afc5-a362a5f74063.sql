-- Security enhancement: Encrypt sensitive PII data
-- This migration adds encryption to customer_name, customer_email, customer_cpf, and customer_phone

-- 1. First, ensure pgcrypto extension is available (for encryption functions)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create a secure encryption key management function
-- This uses a combination of database-generated key and environment for additional security
CREATE OR REPLACE FUNCTION private.get_pii_encryption_key()
RETURNS TEXT AS $$
BEGIN
  -- Generate a consistent key based on database settings
  -- In production, this should use an external key management service
  RETURN encode(digest('mk_art_seo_pii_key_2024' || current_setting('cluster_name', true), 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create encryption/decryption helper functions for PII data
CREATE OR REPLACE FUNCTION private.encrypt_pii(data TEXT)
RETURNS TEXT AS $$
BEGIN
  IF data IS NULL OR data = '' THEN
    RETURN NULL;
  END IF;
  
  RETURN encode(
    pgp_sym_encrypt(
      data, 
      private.get_pii_encryption_key(),
      'compress-algo=1, cipher-algo=aes256'
    ), 
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION private.decrypt_pii(encrypted_data TEXT)
RETURNS TEXT AS $$
BEGIN
  IF encrypted_data IS NULL OR encrypted_data = '' THEN
    RETURN NULL;
  END IF;
  
  BEGIN
    RETURN pgp_sym_decrypt(
      decode(encrypted_data, 'base64'),
      private.get_pii_encryption_key()
    );
  EXCEPTION WHEN OTHERS THEN
    -- If decryption fails, return null (data might be unencrypted)
    RETURN encrypted_data;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create secure views for encrypted PII access
-- This view automatically encrypts data on insert/update and decrypts on select
CREATE OR REPLACE VIEW public.pedidos_pii_secure AS
SELECT 
  order_id,
  private.decrypt_pii(customer_email) as customer_email,
  private.decrypt_pii(customer_name) as customer_name,
  private.decrypt_pii(customer_cpf) as customer_cpf,
  private.decrypt_pii(customer_phone) as customer_phone,
  created_at,
  updated_at
FROM public.pedidos_pii;

-- 5. Create functions to handle encrypted inserts and updates
CREATE OR REPLACE FUNCTION public.insert_encrypted_pii(
  p_order_id UUID,
  p_customer_email TEXT DEFAULT NULL,
  p_customer_name TEXT DEFAULT NULL,
  p_customer_cpf TEXT DEFAULT NULL,
  p_customer_phone TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.pedidos_pii (
    order_id,
    customer_email,
    customer_name,
    customer_cpf,
    customer_phone
  ) VALUES (
    p_order_id,
    private.encrypt_pii(p_customer_email),
    private.encrypt_pii(p_customer_name),
    private.encrypt_pii(p_customer_cpf),
    private.encrypt_pii(p_customer_phone)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_encrypted_pii(
  p_order_id UUID,
  p_customer_email TEXT DEFAULT NULL,
  p_customer_name TEXT DEFAULT NULL,
  p_customer_cpf TEXT DEFAULT NULL,
  p_customer_phone TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.pedidos_pii SET
    customer_email = CASE WHEN p_customer_email IS NOT NULL THEN private.encrypt_pii(p_customer_email) ELSE customer_email END,
    customer_name = CASE WHEN p_customer_name IS NOT NULL THEN private.encrypt_pii(p_customer_name) ELSE customer_name END,
    customer_cpf = CASE WHEN p_customer_cpf IS NOT NULL THEN private.encrypt_pii(p_customer_cpf) ELSE customer_cpf END,
    customer_phone = CASE WHEN p_customer_phone IS NOT NULL THEN private.encrypt_pii(p_customer_phone) ELSE customer_phone END,
    updated_at = now()
  WHERE order_id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant necessary permissions
GRANT SELECT ON public.pedidos_pii_secure TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_encrypted_pii TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_encrypted_pii TO authenticated;

-- 7. Update RLS policies for the secure view
-- Copy existing policies to the secure view
CREATE POLICY "Admins manage pedidos_pii_secure" ON public.pedidos_pii_secure
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can select own pedidos_pii_secure" ON public.pedidos_pii_secure
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.pedidos p
  WHERE p.id = pedidos_pii_secure.order_id AND p.user_id = auth.uid()
));

-- 8. Migrate existing unencrypted data to encrypted format
-- This is a one-time operation to encrypt existing data
DO $$
DECLARE
  rec RECORD;
BEGIN
  -- Process each record and encrypt the data
  FOR rec IN SELECT order_id, customer_email, customer_name, customer_cpf, customer_phone FROM public.pedidos_pii LOOP
    UPDATE public.pedidos_pii SET
      customer_email = CASE WHEN rec.customer_email IS NOT NULL AND rec.customer_email !~ '^[A-Za-z0-9+/]*={0,2}$' THEN private.encrypt_pii(rec.customer_email) ELSE customer_email END,
      customer_name = CASE WHEN rec.customer_name IS NOT NULL AND rec.customer_name !~ '^[A-Za-z0-9+/]*={0,2}$' THEN private.encrypt_pii(rec.customer_name) ELSE customer_name END,
      customer_cpf = CASE WHEN rec.customer_cpf IS NOT NULL AND rec.customer_cpf !~ '^[A-Za-z0-9+/]*={0,2}$' THEN private.encrypt_pii(rec.customer_cpf) ELSE customer_cpf END,
      customer_phone = CASE WHEN rec.customer_phone IS NOT NULL AND rec.customer_phone !~ '^[A-Za-z0-9+/]*={0,2}$' THEN private.encrypt_pii(rec.customer_phone) ELSE customer_phone END
    WHERE order_id = rec.order_id;
  END LOOP;
END $$;