-- Tabela de inscrições do webinar médico
CREATE TABLE public.webinar_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  especialidade TEXT NOT NULL,
  faturamento TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'webinar-medico'
);

-- Validação de dados
CREATE OR REPLACE FUNCTION public.validate_webinar_signup()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF length(NEW.nome) < 2 OR length(NEW.nome) > 100 THEN
    RAISE EXCEPTION 'Nome deve ter entre 2 e 100 caracteres';
  END IF;
  IF NEW.email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Email inválido';
  END IF;
  IF length(NEW.whatsapp) < 8 OR length(NEW.whatsapp) > 25 THEN
    RAISE EXCEPTION 'WhatsApp inválido';
  END IF;
  IF length(NEW.especialidade) < 2 OR length(NEW.especialidade) > 100 THEN
    RAISE EXCEPTION 'Especialidade inválida';
  END IF;
  IF length(NEW.faturamento) < 2 OR length(NEW.faturamento) > 50 THEN
    RAISE EXCEPTION 'Faturamento inválido';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_webinar_signup_trigger
BEFORE INSERT ON public.webinar_signups
FOR EACH ROW EXECUTE FUNCTION public.validate_webinar_signup();

-- RLS
ALTER TABLE public.webinar_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit webinar signup"
ON public.webinar_signups
FOR INSERT
WITH CHECK (source = 'webinar-medico');

CREATE POLICY "Admins can view webinar signups"
ON public.webinar_signups
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update webinar signups"
ON public.webinar_signups
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete webinar signups"
ON public.webinar_signups
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));