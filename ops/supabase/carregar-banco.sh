#!/usr/bin/env bash
# Carrega na stack própria o backup tirado do Lovable Cloud (pg_dump em formato custom do
# banco inteiro). Roda uma vez, com a stack de pé e o banco ainda vazio.
#
# Uso: ssh sfai-vps 'bash /var/www/mkart/repo/ops/supabase/carregar-banco.sh </dev/null'
#      … carregar-banco.sh /caminho/do/arquivo.backup
#
# O backup traz também os esquemas internos do Supabase (auth, storage, realtime…), que
# aqui já existem, criados pelos serviços da stack na versão deles. Por isso entra só:
#   - o esquema public inteiro (tabelas, funções, políticas, dados);
#   - as contas de login: os DADOS de auth.users e auth.identities (a senha vem junto,
#     como hash; sessões e tokens antigos não vêm, todos entram de novo);
#   - o cadastro dos buckets e as políticas de storage.objects;
#   - as políticas de realtime.messages;
#   - o histórico de migrations (supabase_migrations).
# Os arquivos do storage não estão no backup: ver ops/supabase/copiar-arquivos.sh.
# Tudo numa transação: se algo falhar, o banco continua vazio.
set -euo pipefail

DUMP="${1:-$HOME/migracao-mkart/origem.backup}"
STACK=/opt/supabase/mkart
CONTAINER=mkart-db

[ -s "$DUMP" ] || { echo "🔴 não achei o backup em $DUMP"; exit 1; }
cd "$STACK"
sql() { sudo docker exec -i "$CONTAINER" psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -At "$@"; }

if [ "$(sql -c "select count(*) from pg_tables where schemaname='public'")" != 0 ]; then
  echo "🔴 o esquema public já tem tabelas: este script só carrega em banco vazio"; exit 1
fi
if [ "$(sql -c "select count(*) from auth.users")" != 0 ]; then
  echo "🔴 auth.users já tem contas: este script só carrega em banco vazio"; exit 1
fi

sudo docker cp "$DUMP" "$CONTAINER:/tmp/origem.backup"
sudo docker exec "$CONTAINER" pg_restore -l /tmp/origem.backup > /tmp/mkart-toc.txt

python3 - /tmp/mkart-toc.txt > /tmp/mkart-lista.txt <<'PY'
import re, sys
linhas = [l.rstrip('\n') for l in open(sys.argv[1], encoding='utf-8') if l.strip() and not l.startswith(';')]
tem_esquema = lambda nome: re.compile(r'^\d+; \d+ \d+ [A-Z ]+ ' + nome + r' ')
do_public = tem_esquema('public')
das_migrations = re.compile(r'^\d+; \d+ \d+ (SCHEMA - supabase_migrations|[A-Z ]+ supabase_migrations) ')
exatas = re.compile(r'^\d+; \d+ \d+ (TABLE DATA auth (users|identities)|TABLE DATA storage buckets|POLICY storage objects|POLICY realtime messages) ')
# O gatilho que cria a linha em profiles a cada cadastro mora no esquema auth: sem ele,
# conta nova entra sem perfil. Vai por último, depois da função public.handle_new_user.
gatilho = re.compile(r'^\d+; \d+ \d+ TRIGGER auth users on_auth_user_created ')
escolhidas = [l for l in linhas if do_public.match(l) or das_migrations.match(l) or exatas.match(l)]
# auth.identities aponta para auth.users, e a chave estrangeira já existe aqui: users primeiro.
primeiro = [l for l in escolhidas if ' TABLE DATA auth users ' in l]
assert len(primeiro) == 1, 'não achei os dados de auth.users no backup'
ultimo = [l for l in linhas if gatilho.match(l)]
assert len(ultimo) == 1, 'não achei o gatilho on_auth_user_created no backup'
print('\n'.join(primeiro + [l for l in escolhidas if l not in primeiro] + ultimo))
PY
echo "itens do backup que entram: $(wc -l < /tmp/mkart-lista.txt) de $(grep -vc '^;' /tmp/mkart-toc.txt)"
sudo docker cp /tmp/mkart-lista.txt "$CONTAINER:/tmp/lista.txt"

# O backup concede permissões a papéis internos do Lovable que não existem aqui:
# `sandbox_exec` e, desde 2026-10, `sandbox_exec_<id do projeto>`. Em vez de descartar
# todas as permissões do backup (--no-acl apagaria também as do anon e do authenticated),
# cada um existe só durante a carga e sai, com tudo o que recebeu, logo depois.
PAPEIS="$(sudo docker exec "$CONTAINER" sh -c 'pg_restore -L /tmp/lista.txt -f - /tmp/origem.backup' \
  | grep -oE '\bsandbox_exec[a-z0-9_]*' | sort -u)"
for papel in $PAPEIS; do
  sql -c "do \$\$ begin if not exists (select from pg_roles where rolname = '$papel') then create role $papel nologin; end if; end \$\$" >/dev/null
done
tirar_papel() { for papel in $PAPEIS; do sql -c "drop owned by $papel; drop role $papel" >/dev/null; done; }
trap tirar_papel EXIT

sudo docker exec "$CONTAINER" pg_restore -U supabase_admin -d postgres \
  --single-transaction --exit-on-error -L /tmp/lista.txt /tmp/origem.backup
sudo docker exec "$CONTAINER" rm -f /tmp/origem.backup /tmp/lista.txt
rm -f /tmp/mkart-toc.txt /tmp/mkart-lista.txt

sql -c "notify pgrst, 'reload schema'" >/dev/null

# Os jobs do pg_cron do Lovable chamavam as functions pela URL antiga com a chave anon
# antiga. Aqui são recriados chamando o gateway pela rede interna da stack, com a anon
# desta stack. O publish-scheduled-posts não tem outro chamador: é este job que publica
# post agendado.
ANON="$(sudo grep -E '^ANON_KEY=' "$STACK/.env" | cut -d= -f2-)"
[ -n "$ANON" ] || { echo "🔴 ANON_KEY vazio em $STACK/.env"; exit 1; }
sql -v anon="$ANON" <<'SQL' >/dev/null
create extension if not exists pg_cron;
select cron.schedule('publish-scheduled-posts', '* * * * *', format($c$
  select net.http_post(
    url := 'http://api-gw:8000/functions/v1/publish-scheduled-posts',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer %s'),
    body := jsonb_build_object('time', now())
  ) as request_id;
$c$, :'anon'));
select cron.schedule('monthly-keyword-check', '0 10 28 * *', format($c$
  select net.http_post(
    url := 'http://api-gw:8000/functions/v1/serpbot-proxy',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer %s'),
    body := '{"action": "cron_monthly_check"}'::jsonb
  ) as request_id;
$c$, :'anon'));
select cron.schedule('consulting-monthly-check', '0 10 1 * *', format($c$
  select net.http_post(
    url := 'http://api-gw:8000/functions/v1/serpbot-proxy',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer %s'),
    body := '{"action": "cron_consulting_check"}'::jsonb
  ) as request_id;
$c$, :'anon'));
SQL

echo "== carregado"
sql <<'SQL'
select format('  %-24s %s linhas', c.relname, (xpath('/row/n/text()', query_to_xml(format('select count(*) n from public.%I', c.relname), false, true, '')))[1]::text)
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' order by 1;
select format('  %-24s %s linhas', 'auth.users', count(*)) from auth.users;
select format('  %-24s %s linhas', 'auth.identities', count(*)) from auth.identities;
select format('  %-24s %s (%s)', 'storage.buckets', count(*), string_agg(id || case when public then '' else ' [privado]' end, ', ' order by id)) from storage.buckets;
select format('  %-24s %s', 'políticas em storage', count(*)) from pg_policies where schemaname = 'storage';
select format('  %-24s %s', 'políticas em public', count(*)) from pg_policies where schemaname = 'public';
select format('  %-24s %s', 'gatilhos em auth.users', string_agg(tgname, ', ')) from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal;
select format('  %-24s %s', 'jobs do pg_cron', string_agg(jobname || ' (' || schedule || ')', ', ' order by jobid)) from cron.job;
SQL
