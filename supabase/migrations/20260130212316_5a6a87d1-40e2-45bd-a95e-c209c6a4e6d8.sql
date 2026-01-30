-- =============================================
-- FASE 1: SEGURANÇA E ESTRUTURA DO BANCO
-- =============================================

-- 1. Criar enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Criar tabela user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 3. Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Criar função SECURITY DEFINER para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. Policy: admins podem ver todas as roles
CREATE POLICY "Admins can view user_roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Policy: admins podem gerenciar roles
CREATE POLICY "Admins can manage user_roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Migrar admins existentes de profiles.is_admin para user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'::app_role
FROM public.profiles
WHERE is_admin = true AND user_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- =============================================
-- ALTERAÇÕES EM order_items_new
-- =============================================

-- 8. Adicionar colunas para dados do serviço
ALTER TABLE public.order_items_new
ADD COLUMN IF NOT EXISTS anchor_text TEXT,
ADD COLUMN IF NOT EXISTS target_url TEXT,
ADD COLUMN IF NOT EXISTS item_status TEXT DEFAULT 'pendente',
ADD COLUMN IF NOT EXISTS mk_will_choose BOOLEAN DEFAULT false;

-- =============================================
-- ALTERAÇÕES EM orders_new
-- =============================================

-- 9. Adicionar colunas para pagamento
ALTER TABLE public.orders_new
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pix_whatsapp',
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'aguardando',
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- =============================================
-- ATUALIZAR RLS DE orders_new PARA USAR has_role
-- =============================================

-- 10. Remover policy antiga baseada em profiles.is_admin
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders_new;

-- 11. Criar nova policy usando has_role
CREATE POLICY "Admins can manage orders"
ON public.orders_new FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- ATUALIZAR RLS DE order_items_new PARA ADMINS
-- =============================================

-- 12. Adicionar policy para admins gerenciarem order_items
CREATE POLICY "Admins can manage order items"
ON public.order_items_new FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));