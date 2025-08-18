-- 1) Create user_details table
CREATE TABLE public.user_details (
  id uuid primary key references public.profiles(id) on delete cascade,
  name text,
  phone text,
  cpf text,
  created_at timestamptz default now()
);

-- 2) Enable RLS
ALTER TABLE public.user_details ENABLE ROW LEVEL SECURITY;

-- 3) RLS policies for user_details
CREATE POLICY "Users can view own details"
ON public.user_details FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own details"
ON public.user_details FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins can view all details"
ON public.user_details FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all details"
ON public.user_details FOR UPDATE
USING (is_admin(auth.uid()));
