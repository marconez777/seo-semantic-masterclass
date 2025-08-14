-- Security enhancement: Encrypt sensitive PII data
-- This migration adds encryption to customer_name, customer_email, customer_cpf, and customer_phone

-- 1. First, ensure pgcrypto extension is available (for encryption functions)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create a secure encryption key management function
CREATE OR REPLACE FUNCTION public.get_pii_encryption_key()
RETURNS TEXT AS $$
BEGIN
  -- Generate a consistent key based on database settings
  -- In production, this should use an external key management service
  RETURN encode(digest('mk_art_seo_pii_key_2024' || current_setting('cluster_name', true), 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create encryption/decryption helper functions for PII data
CREATE OR REPLACE FUNCTION public.encrypt_pii(data TEXT)
RETURNS TEXT AS $$
BEGIN
  IF data IS NULL OR data = '' THEN
    RETURN NULL;
  END IF;
  
  RETURN encode(
    pgp_sym_encrypt(
      data, 
      public.get_pii_encryption_key(),
      'compress-algo=1, cipher-algo=aes256'
    ), 
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrypt_pii(encrypted_data TEXT)
RETURNS TEXT AS $$
BEGIN
  IF encrypted_data IS NULL OR encrypted_data = '' THEN
    RETURN NULL;
  END IF;
  
  BEGIN
    RETURN pgp_sym_decrypt(
      decode(encrypted_data, 'base64'),
      public.get_pii_encryption_key()
    );
  EXCEPTION WHEN OTHERS THEN
    -- If decryption fails, return the original data (might be unencrypted)
    RETURN encrypted_data;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create functions to handle encrypted inserts and updates
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
    public.encrypt_pii(p_customer_email),
    public.encrypt_pii(p_customer_name),
    public.encrypt_pii(p_customer_cpf),
    public.encrypt_pii(p_customer_phone)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_pii_encryption_key TO authenticated;
GRANT EXECUTE ON FUNCTION public.encrypt_pii TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrypt_pii TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_encrypted_pii TO authenticated;

-- 6. Migrate existing unencrypted data to encrypted format
-- This is a one-time operation to encrypt existing data
DO $$
DECLARE
  rec RECORD;
BEGIN
  -- Process each record and encrypt the data if it's not already encrypted
  FOR rec IN SELECT order_id, customer_email, customer_name, customer_cpf, customer_phone FROM public.pedidos_pii LOOP
    UPDATE public.pedidos_pii SET
      customer_email = CASE 
        WHEN rec.customer_email IS NOT NULL AND NOT (rec.customer_email ~ '^[A-Za-z0-9+/]*={0,2}$' AND length(rec.customer_email) > 20) 
        THEN public.encrypt_pii(rec.customer_email) 
        ELSE customer_email 
      END,
      customer_name = CASE 
        WHEN rec.customer_name IS NOT NULL AND NOT (rec.customer_name ~ '^[A-Za-z0-9+/]*={0,2}$' AND length(rec.customer_name) > 20) 
        THEN public.encrypt_pii(rec.customer_name) 
        ELSE customer_name 
      END,
      customer_cpf = CASE 
        WHEN rec.customer_cpf IS NOT NULL AND NOT (rec.customer_cpf ~ '^[A-Za-z0-9+/]*={0,2}$' AND length(rec.customer_cpf) > 20) 
        THEN public.encrypt_pii(rec.customer_cpf) 
        ELSE customer_cpf 
      END,
      customer_phone = CASE 
        WHEN rec.customer_phone IS NOT NULL AND NOT (rec.customer_phone ~ '^[A-Za-z0-9+/]*={0,2}$' AND length(rec.customer_phone) > 20) 
        THEN public.encrypt_pii(rec.customer_phone) 
        ELSE customer_phone 
      END
    WHERE order_id = rec.order_id;
  END LOOP;
END $$;