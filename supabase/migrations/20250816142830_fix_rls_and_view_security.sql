-- Habilita e força o RLS na tabela 'pedidos_pii'
alter table public.pedidos_pii enable row level security;
alter table public.pedidos_pii force row level security;

-- Define a view 'pedidos_pii_masked' para usar as permissões do usuário que a consulta (invoker)
alter view public.pedidos_pii_masked set (security_invoker = on);
