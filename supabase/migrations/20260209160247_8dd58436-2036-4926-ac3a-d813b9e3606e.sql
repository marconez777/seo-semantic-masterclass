
CREATE TABLE public.backlink_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  whatsapp text,
  website text,
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'novo',
  notes text
);

ALTER TABLE public.backlink_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit backlink lead"
ON public.backlink_leads FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view backlink leads"
ON public.backlink_leads FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update backlink leads"
ON public.backlink_leads FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete backlink leads"
ON public.backlink_leads FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
