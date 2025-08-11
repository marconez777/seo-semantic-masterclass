-- Grant admin role to the current user so they can publish posts (RLS requires admin)
DO $$
DECLARE
  uid uuid := '62e34c06-bcef-4b07-95cc-b84c10f2dff6'::uuid; -- from session used in the app
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = uid AND role = 'admin'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (uid, 'admin');
  END IF;
END $$;