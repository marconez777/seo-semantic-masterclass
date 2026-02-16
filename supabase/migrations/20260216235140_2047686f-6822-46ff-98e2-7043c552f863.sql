
-- Tighten contact_submissions INSERT policy: restrict writable fields
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions
  FOR INSERT
  WITH CHECK (
    status = 'novo'
    AND read_at IS NULL
    AND notes IS NULL
  );

-- Tighten backlink_leads INSERT policy: restrict writable fields
DROP POLICY IF EXISTS "Anyone can submit backlink lead" ON public.backlink_leads;
CREATE POLICY "Anyone can submit backlink lead"
  ON public.backlink_leads
  FOR INSERT
  WITH CHECK (
    status = 'novo'
  );
