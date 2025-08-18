-- Fix critical PII exposure by adding RLS to pedidos_pii_masked table
ALTER TABLE public.pedidos_pii_masked ENABLE ROW LEVEL SECURITY;

-- Only admins can access masked PII data
CREATE POLICY "Only admins can access masked PII" 
ON public.pedidos_pii_masked 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add missing RPC function for secure masked PII access
CREATE OR REPLACE FUNCTION public.get_masked_pii_secure(p_order_ids uuid[])
RETURNS TABLE(
    order_id uuid,
    customer_email_masked text,
    customer_first_name text,
    customer_cpf_masked text,
    customer_phone_masked text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Only allow service role to call this function
  IF current_setting('role') != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: Function only accessible to service role';
  END IF;

  RETURN QUERY
  SELECT 
    pii.order_id,
    pii.customer_email_masked,
    pii.customer_first_name,
    pii.customer_cpf_masked,
    pii.customer_phone_masked
  FROM public.pedidos_pii_masked pii
  WHERE pii.order_id = ANY(p_order_ids);
END;
$function$;

-- Secure existing database functions by adding search_path protection
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles p
    WHERE p.id = uid AND p.role = 'admin'
  );
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = ''
AS $function$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.get_pii_encryption_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Generate a consistent key based on database settings
  -- In production, this should use an external key management service
  RETURN encode(digest('mk_art_seo_pii_key_2024' || current_setting('cluster_name', true), 'sha256'), 'hex');
END;
$function$;

CREATE OR REPLACE FUNCTION public.encrypt_pii(data text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.decrypt_pii(encrypted_data text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.insert_encrypted_pii_secure(p_order_id uuid, p_customer_email text DEFAULT NULL::text, p_customer_name text DEFAULT NULL::text, p_customer_cpf text DEFAULT NULL::text, p_customer_phone text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_multiple_decrypted_pii_secure(p_order_ids uuid[])
RETURNS TABLE(order_id uuid, customer_email text, customer_name text, customer_cpf text, customer_phone text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, role) 
  VALUES (new.id, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;