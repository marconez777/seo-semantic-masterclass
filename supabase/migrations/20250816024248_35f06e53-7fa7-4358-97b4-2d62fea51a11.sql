-- Enable Row Level Security on pedidos_pii_masked table
ALTER TABLE public.pedidos_pii_masked ENABLE ROW LEVEL SECURITY;

-- Allow admins to see all masked PII data
CREATE POLICY "Admins can view all masked PII" 
ON public.pedidos_pii_masked 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow users to see masked PII for their own orders
CREATE POLICY "Users can view masked PII for own orders" 
ON public.pedidos_pii_masked 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pedidos p 
    WHERE p.id = pedidos_pii_masked.order_id 
    AND p.user_id = auth.uid()
  )
);

-- Allow admins to manage (insert/update/delete) masked PII data
CREATE POLICY "Admins can manage masked PII" 
ON public.pedidos_pii_masked 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));