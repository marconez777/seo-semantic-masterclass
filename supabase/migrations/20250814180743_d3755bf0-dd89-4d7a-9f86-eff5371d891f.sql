-- 0) Extensão de criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Colunas criptografadas (BYTEA) 
ALTER TABLE public.pedidos_pii
  ADD COLUMN IF NOT EXISTS customer_email_enc  bytea,
  ADD COLUMN IF NOT EXISTS customer_name_enc   bytea,
  ADD COLUMN IF NOT EXISTS customer_cpf_enc    bytea,
  ADD COLUMN IF NOT EXISTS customer_phone_enc  bytea;

-- 2) Função para obter chave de criptografia
CREATE OR REPLACE FUNCTION public.get_pii_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Use uma chave da configuração do Supabase
  RETURN current_setting('app.pii_key', true);
END;
$$;

-- 3) Função utilitária para descriptografar PII (só para admin e dono)
CREATE OR REPLACE FUNCTION public.get_pedidos_pii_decrypted(p_order_ids uuid[])
RETURNS TABLE (
  order_id uuid,
  customer_email text,
  customer_name  text,
  customer_cpf   text,
  customer_phone text
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
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
$$;

-- 4) Função para inserir PII criptografado
CREATE OR REPLACE FUNCTION public.insert_pedidos_pii_encrypted(
  p_order_id uuid,
  p_customer_email text DEFAULT NULL,
  p_customer_name text DEFAULT NULL,
  p_customer_cpf text DEFAULT NULL,
  p_customer_phone text DEFAULT NULL
)
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
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
$$;

-- 5) VIEW mascarada para consultas que não precisam do dado completo
DROP VIEW IF EXISTS public.pedidos_pii_masked;
CREATE VIEW public.pedidos_pii_masked AS
SELECT
  pp.order_id,
  -- Máscaras simples para uso em telas que não precisam do dado bruto
  CASE WHEN pp.customer_email_enc IS NULL THEN NULL ELSE
    regexp_replace(
      pgp_sym_decrypt(pp.customer_email_enc, public.get_pii_key())::text,
      '(^.)([^@]*)(@.*$)', '\1***\3'
    ) END as customer_email_masked,
  -- nome: primeiro nome apenas
  CASE WHEN pp.customer_name_enc IS NULL THEN NULL ELSE
    split_part(pgp_sym_decrypt(pp.customer_name_enc, public.get_pii_key())::text,' ',1) END as customer_first_name,
  -- cpf: ***.***.***-NN
  CASE WHEN pp.customer_cpf_enc IS NULL THEN NULL ELSE
    '***.***.***-' || right(pgp_sym_decrypt(pp.customer_cpf_enc, public.get_pii_key())::text, 2) END as customer_cpf_masked,
  -- phone: final com 4 dígitos
  CASE WHEN pp.customer_phone_enc IS NULL THEN NULL ELSE
    '*****' || right(pgp_sym_decrypt(pp.customer_phone_enc, public.get_pii_key())::text, 4) END as customer_phone_masked
FROM public.pedidos_pii pp;

-- 6) Revocar acesso direto à tabela pedidos_pii para usuários comuns
-- Manter apenas admin com acesso direto
DROP POLICY IF EXISTS "Users can select own pedidos_pii" ON public.pedidos_pii;
CREATE POLICY "Only admins can access pedidos_pii directly"
  ON public.pedidos_pii FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7) Privilégios nas funções e view
REVOKE ALL ON FUNCTION public.get_pedidos_pii_decrypted(uuid[]) FROM public;
GRANT EXECUTE ON FUNCTION public.get_pedidos_pii_decrypted(uuid[]) TO authenticated;

REVOKE ALL ON FUNCTION public.insert_pedidos_pii_encrypted(uuid, text, text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.insert_pedidos_pii_encrypted(uuid, text, text, text, text) TO authenticated;

REVOKE ALL ON public.pedidos_pii_masked FROM public;
GRANT SELECT ON public.pedidos_pii_masked TO authenticated;