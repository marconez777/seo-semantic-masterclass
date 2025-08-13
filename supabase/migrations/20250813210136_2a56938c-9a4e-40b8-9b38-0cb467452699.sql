-- Add INSERT policy for backlinks_public to allow sync trigger
CREATE POLICY "Allow sync trigger to insert backlinks_public" 
ON public.backlinks_public 
FOR INSERT 
WITH CHECK (true);

-- Add UPDATE policy for backlinks_public to allow sync trigger  
CREATE POLICY "Allow sync trigger to update backlinks_public" 
ON public.backlinks_public 
FOR UPDATE 
USING (true);