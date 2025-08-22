-- Adiciona coluna is_admin se não existir
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Função is_admin(uid) usando profiles existente
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = uid), false);
$$;

-- Remove policies conflitantes de pedidos
DROP POLICY IF EXISTS "Users can insert own pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Admins can select all pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Admins can update pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Users can select own pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Admins can update all pedidos" ON public.pedidos;

-- Policy para usuário inserir próprios pedidos
CREATE POLICY "Users can insert own pedidos"
  ON public.pedidos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy para usuários verem próprios pedidos
CREATE POLICY "Users can select own pedidos"
  ON public.pedidos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy para admin ver todos os pedidos
CREATE POLICY "Admins can select all pedidos"
  ON public.pedidos FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Policy para admin atualizar pedidos
CREATE POLICY "Admins can update pedidos"
  ON public.pedidos FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Remove policies conflitantes de order_items
DROP POLICY IF EXISTS "Owner can select order_items" ON public.order_items;
DROP POLICY IF EXISTS "Owner can insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Users can select own order_items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own order_items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can select all order_items" ON public.order_items;

-- Policy para dono do pedido ver seus itens
CREATE POLICY "Owner can select order_items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pedidos p
                 WHERE p.id = order_items.order_id
                   AND p.user_id = auth.uid()));

-- Policy para inserir apenas se for dono do pedido
CREATE POLICY "Owner can insert order_items"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.pedidos p
                      WHERE p.id = order_items.order_id
                        AND p.user_id = auth.uid()));

-- Policy para admin ver todos os order_items
CREATE POLICY "Admins can select all order_items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));