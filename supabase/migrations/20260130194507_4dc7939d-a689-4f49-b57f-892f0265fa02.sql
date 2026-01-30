-- =============================================
-- SCHEMA COMPLETO: MK Art SEO
-- =============================================

-- 1. Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- 2. Tabela de backlinks (produtos)
CREATE TABLE IF NOT EXISTS public.backlinks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  domain TEXT,
  da INTEGER DEFAULT 0,
  dr INTEGER DEFAULT 0,
  traffic INTEGER DEFAULT 0,
  price NUMERIC(10,2) DEFAULT 0,
  category TEXT,
  tipo TEXT DEFAULT 'Guest Post',
  status TEXT DEFAULT 'ativo',
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.backlinks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active backlinks" ON public.backlinks FOR SELECT USING (status = 'ativo');
CREATE POLICY "Admins can manage backlinks" ON public.backlinks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- 3. View pública de backlinks
CREATE OR REPLACE VIEW public.backlinks_public AS
SELECT id, url, domain, da, dr, traffic, price, category, tipo, created_at
FROM public.backlinks
WHERE status = 'ativo';

-- 4. Tabela de posts do blog
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  category TEXT,
  tags TEXT[],
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published posts" ON public.posts FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage posts" ON public.posts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- 5. Tabela de favoritos
CREATE TABLE IF NOT EXISTS public.favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  backlink_id UUID REFERENCES public.backlinks(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, backlink_id)
);

ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON public.favoritos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.favoritos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON public.favoritos FOR DELETE USING (auth.uid() = user_id);

-- 6. Tabela de pedidos
CREATE TABLE IF NOT EXISTS public.orders_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pendente',
  total NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.orders_new ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON public.orders_new FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders_new FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage orders" ON public.orders_new FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- 7. Tabela de itens de pedidos
CREATE TABLE IF NOT EXISTS public.order_items_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders_new(id) ON DELETE CASCADE NOT NULL,
  backlink_id UUID REFERENCES public.backlinks(id),
  price NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.order_items_new ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items" ON public.order_items_new FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders_new WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create order items" ON public.order_items_new FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders_new WHERE id = order_id AND user_id = auth.uid())
);

-- 8. Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Triggers de updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_backlinks_updated_at ON public.backlinks;
CREATE TRIGGER update_backlinks_updated_at BEFORE UPDATE ON public.backlinks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_new_updated_at ON public.orders_new;
CREATE TRIGGER update_orders_new_updated_at BEFORE UPDATE ON public.orders_new
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();