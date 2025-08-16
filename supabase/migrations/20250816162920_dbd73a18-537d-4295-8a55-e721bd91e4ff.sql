-- Criar perfil para o usuário admin existente
INSERT INTO public.profiles (id, role) 
VALUES ('601989e7-96a8-42c0-8c42-96b86db7e0d1', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Verificar se existe trigger para novos usuários, se não existir, criar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role) 
  VALUES (new.id, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Criar trigger se não existir (será ignorado se já existir)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();