
-- 1) Prevent privilege escalation via profiles.is_admin
-- Replace is_admin() to source from user_roles instead of the user-editable profiles.is_admin column
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'::app_role
  )
$$;

-- Lock down the profile UPDATE policy so users can't flip is_admin on themselves
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND is_admin = (SELECT p.is_admin FROM public.profiles p WHERE p.user_id = auth.uid())
);

-- 2) Tighten always-true INSERT policies on webinar_events / webinar_sessions
DROP POLICY IF EXISTS "Anyone can insert webinar event" ON public.webinar_events;
CREATE POLICY "Anyone can insert webinar event"
ON public.webinar_events
FOR INSERT
TO anon, authenticated
WITH CHECK (session_id IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can insert webinar session" ON public.webinar_sessions;
CREATE POLICY "Anyone can insert webinar session"
ON public.webinar_sessions
FOR INSERT
TO anon, authenticated
WITH CHECK (session_id IS NOT NULL);

-- 3) Revoke EXECUTE on SECURITY DEFINER functions that should never be callable from PostgREST
REVOKE EXECUTE ON FUNCTION public.promote_to_admin(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.validate_backlink_lead() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.validate_contact_submission() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.validate_webinar_signup() FROM anon, authenticated, public;
