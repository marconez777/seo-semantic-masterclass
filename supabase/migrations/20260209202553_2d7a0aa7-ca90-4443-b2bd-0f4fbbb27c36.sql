
-- Use validation triggers instead of CHECK constraints (more flexible, avoids issues with existing data)

-- Validation trigger for contact_submissions
CREATE OR REPLACE FUNCTION public.validate_contact_submission()
RETURNS TRIGGER AS $$
BEGIN
  IF length(NEW.name) < 2 OR length(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Name must be between 2 and 100 characters';
  END IF;
  IF NEW.email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  IF length(NEW.message) < 5 OR length(NEW.message) > 5000 THEN
    RAISE EXCEPTION 'Message must be between 5 and 5000 characters';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_validate_contact_submission
BEFORE INSERT ON public.contact_submissions
FOR EACH ROW EXECUTE FUNCTION public.validate_contact_submission();

-- Validation trigger for backlink_leads
CREATE OR REPLACE FUNCTION public.validate_backlink_lead()
RETURNS TRIGGER AS $$
BEGIN
  IF length(NEW.name) < 2 OR length(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Name must be between 2 and 100 characters';
  END IF;
  IF NEW.email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  IF NEW.website IS NOT NULL AND (length(NEW.website) < 5 OR length(NEW.website) > 500) THEN
    RAISE EXCEPTION 'Website must be between 5 and 500 characters';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_validate_backlink_lead
BEFORE INSERT ON public.backlink_leads
FOR EACH ROW EXECUTE FUNCTION public.validate_backlink_lead();
