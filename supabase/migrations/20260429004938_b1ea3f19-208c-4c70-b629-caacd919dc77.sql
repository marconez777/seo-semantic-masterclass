-- Bucket público para vídeos do webinar
INSERT INTO storage.buckets (id, name, public)
VALUES ('webinar-videos', 'webinar-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Leitura pública
CREATE POLICY "Webinar videos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'webinar-videos');

-- Apenas admins podem enviar
CREATE POLICY "Admins can upload webinar videos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'webinar-videos'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Apenas admins podem atualizar
CREATE POLICY "Admins can update webinar videos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'webinar-videos'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Apenas admins podem excluir
CREATE POLICY "Admins can delete webinar videos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'webinar-videos'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);