
-- Concede a role 'admin' para o usuário com o e-mail informado
-- Requer que o usuário já exista em auth.users

insert into public.user_roles (user_id, role)
select u.id, 'admin'::app_role
from auth.users u
where u.email = 'contato@mkart.com.br'
on conflict (user_id, role) do nothing;
