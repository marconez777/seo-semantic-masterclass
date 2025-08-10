
-- 1) Criar enum para status de publicação (se ainda não existir)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'publication_status') THEN
    CREATE TYPE public.publication_status AS ENUM ('pending', 'in_progress', 'published', 'rejected');
  END IF;
END;
$$;

-- 2) Adicionar colunas em order_items para controlar publicação e conteúdo do pedido
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS anchor_text TEXT,
  ADD COLUMN IF NOT EXISTS target_url TEXT,
  ADD COLUMN IF NOT EXISTS publication_status public.publication_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS publication_url TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- 3) Trigger para manter updated_at atualizado
DROP TRIGGER IF EXISTS update_order_items_updated_at ON public.order_items;
CREATE TRIGGER update_order_items_updated_at
  BEFORE UPDATE ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Índice útil para buscar itens por pedido
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
