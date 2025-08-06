-- Add missing column to pedidos table for storing payment reference
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- Create index for faster payment lookups
CREATE INDEX IF NOT EXISTS idx_pedidos_stripe_session_id ON public.pedidos(stripe_session_id);

-- Add updated_at column with trigger for automatic updates
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create or replace function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on pedidos
DROP TRIGGER IF EXISTS update_pedidos_updated_at ON public.pedidos;
CREATE TRIGGER update_pedidos_updated_at
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();