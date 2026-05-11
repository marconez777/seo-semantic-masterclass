ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signup_source text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, whatsapp, site, signup_source)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'site',
    NEW.raw_user_meta_data->>'signup_source'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    whatsapp = COALESCE(EXCLUDED.whatsapp, profiles.whatsapp),
    site = COALESCE(EXCLUDED.site, profiles.site),
    signup_source = COALESCE(EXCLUDED.signup_source, profiles.signup_source),
    updated_at = now();
  RETURN NEW;
END;
$function$;