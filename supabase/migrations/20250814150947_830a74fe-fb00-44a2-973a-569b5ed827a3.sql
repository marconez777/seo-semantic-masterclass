-- Fix database function security by adding proper search_path protection

-- Update sync_backlinks_public function with security definer and search path
CREATE OR REPLACE FUNCTION public.sync_backlinks_public()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.backlinks_public WHERE id = OLD.id;
    RETURN OLD;
  ELSE
    INSERT INTO public.backlinks_public (id, site_name, site_url, category, price_cents, traffic, da, dr, is_active)
    VALUES (NEW.id, NEW.site_name, NEW.site_url, NEW.category, NEW.price_cents, NEW.traffic, NEW.da, NEW.dr, NEW.is_active)
    ON CONFLICT (id) DO UPDATE SET
      site_name = EXCLUDED.site_name,
      site_url = EXCLUDED.site_url,
      category = EXCLUDED.category,
      price_cents = EXCLUDED.price_cents,
      traffic = EXCLUDED.traffic,
      da = EXCLUDED.da,
      dr = EXCLUDED.dr,
      is_active = EXCLUDED.is_active;
    RETURN NEW;
  END IF;
END;
$function$;

-- Update update_updated_at_column function with search path protection
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;