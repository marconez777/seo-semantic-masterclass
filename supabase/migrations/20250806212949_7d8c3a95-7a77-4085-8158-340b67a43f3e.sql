-- Create backlinks table
CREATE TABLE public.backlinks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    site_url TEXT NOT NULL,
    dr INTEGER NOT NULL,
    da INTEGER NOT NULL,
    trafego_mensal INTEGER NOT NULL,
    categoria TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pedidos table
CREATE TABLE public.pedidos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    backlink_id UUID NOT NULL REFERENCES public.backlinks(id) ON DELETE CASCADE,
    url_destino TEXT NOT NULL,
    texto_ancora TEXT NOT NULL,
    pagamento_status TEXT NOT NULL DEFAULT 'pendente' CHECK (pagamento_status IN ('pendente', 'pago')),
    publicacao_status TEXT NOT NULL DEFAULT 'pendente' CHECK (publicacao_status IN ('pendente', 'publicado')),
    link_publicacao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create favoritos table
CREATE TABLE public.favoritos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    backlink_id UUID NOT NULL REFERENCES public.backlinks(id) ON DELETE CASCADE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, backlink_id)
);

-- Enable Row Level Security
ALTER TABLE public.backlinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for backlinks table
-- Anyone can read backlinks (including non-authenticated users)
CREATE POLICY "Anyone can view backlinks" 
ON public.backlinks 
FOR SELECT 
USING (true);

-- Only admin can insert/update/delete backlinks (for now, no specific admin role - will be handled in app)
CREATE POLICY "Authenticated users can manage backlinks" 
ON public.backlinks 
FOR ALL 
TO authenticated 
USING (false) 
WITH CHECK (false);

-- RLS Policies for pedidos table
-- Users can only see their own orders
CREATE POLICY "Users can view their own orders" 
ON public.pedidos 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create their own orders" 
ON public.pedidos 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Users cannot update orders (only admin can - handled in app)
CREATE POLICY "Users cannot update orders" 
ON public.pedidos 
FOR UPDATE 
TO authenticated 
USING (false);

-- RLS Policies for favoritos table
-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites" 
ON public.favoritos 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Users can add to their favorites
CREATE POLICY "Users can add to their favorites" 
ON public.favoritos 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Users can remove from their favorites
CREATE POLICY "Users can remove their favorites" 
ON public.favoritos 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_backlinks_categoria ON public.backlinks(categoria);
CREATE INDEX idx_backlinks_valor ON public.backlinks(valor);
CREATE INDEX idx_backlinks_dr ON public.backlinks(dr);
CREATE INDEX idx_pedidos_user_id ON public.pedidos(user_id);
CREATE INDEX idx_pedidos_backlink_id ON public.pedidos(backlink_id);
CREATE INDEX idx_favoritos_user_id ON public.favoritos(user_id);
CREATE INDEX idx_favoritos_backlink_id ON public.favoritos(backlink_id);