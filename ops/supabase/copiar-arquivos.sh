#!/usr/bin/env bash
# Copia os arquivos do storage do Lovable Cloud para a stack própria. O backup do banco
# traz só o cadastro deles (storage.objects), não o conteúdo: este script lê a lista do
# backup, baixa cada arquivo do projeto antigo e sobe pela API de storage daqui, com o
# mesmo caminho, tipo e cache. Pode rodar de novo: o que já está aqui é pulado.
#
# Uso: ssh sfai-vps 'bash /var/www/mkart/repo/ops/supabase/copiar-arquivos.sh </dev/null'
#        copia os buckets públicos e troca, nos dados do site, o endereço antigo pelo novo.
#      ssh -t sfai-vps /var/www/mkart/repo/ops/supabase/copiar-arquivos.sh --privados
#        copia também bucket privado, se o backup tiver algum (as migrations do mkart só
#        criam `blog` e `webinar-videos`, os dois públicos). Pede, no terminal, o e-mail e
#        a senha de um administrador do site antigo; nada disso é gravado.
set -euo pipefail

DUMP="$HOME/migracao-mkart/origem.backup"
STACK=/opt/supabase/mkart
CONTAINER=mkart-db
export ANTIGO=https://nxitvhrfloibpwrkskzx.supabase.co
export NOVO_PUBLICO=https://api.mkart.com.br
export NOVO_LOCAL=http://127.0.0.1:8106
export PRIVADOS=0
[ "${1:-}" = "--privados" ] && PRIVADOS=1

[ -s "$DUMP" ] || { echo "🔴 não achei o backup em $DUMP"; exit 1; }
lista="$(mktemp)"
trap 'rm -f "$lista"' EXIT
sudo docker cp "$DUMP" "$CONTAINER:/tmp/origem.backup"
sudo docker exec "$CONTAINER" sh -c 'pg_restore -a -n storage -t objects -f - /tmp/origem.backup; rm -f /tmp/origem.backup' > "$lista"

# As chaves entram pelo ambiente do processo, não pela linha de comando nem pela tela.
SERVICE_ROLE_KEY="$(grep '^SERVICE_ROLE_KEY=' "$STACK/.env" | cut -d= -f2-)"
CHAVE_PUBLICA_ANTIGA="$(grep '^VITE_SUPABASE_PUBLISHABLE_KEY=' "$HOME/migracao-mkart/env-antigo" | cut -d= -f2- | tr -d '"')"
export SERVICE_ROLE_KEY CHAVE_PUBLICA_ANTIGA

if [ "$PRIVADOS" = 1 ]; then
  read -rp "E-mail de um administrador do site antigo: " ADMIN_EMAIL
  read -rsp "Senha: " ADMIN_SENHA; echo
  export ADMIN_EMAIL ADMIN_SENHA
fi

python3 - "$lista" <<'PY'
import json, os, sys, urllib.error, urllib.parse, urllib.request

ANTIGO, LOCAL = os.environ['ANTIGO'], os.environ['NOVO_LOCAL']
CHAVE, CHAVE_ANTIGA = os.environ['SERVICE_ROLE_KEY'], os.environ['CHAVE_PUBLICA_ANTIGA']
PRIVADOS = os.environ['PRIVADOS'] == '1'
# Bucket que o próprio Lovable cria para exportar o banco: não é do site.
IGNORAR_PREFIXO = 'database_export_'

def desescapar(v):  # texto do COPY
    return None if v == '\\N' else v.replace('\\\\', '\\')

colunas, objetos = None, []
for l in open(sys.argv[1], encoding='utf-8'):
    if l.startswith('COPY storage.objects'):
        colunas = [c.strip() for c in l[l.index('(') + 1:l.index(')')].split(',')]
    elif colunas and l.strip() == '\\.':
        break
    elif colunas:
        r = dict(zip(colunas, l.rstrip('\n').split('\t')))
        objetos.append((r['bucket_id'], desescapar(r['name']), json.loads(desescapar(r['metadata']) or '{}')))

def pedir(url, cabecalhos, corpo=None, metodo=None):
    req = urllib.request.Request(url, data=corpo, headers=cabecalhos, method=metodo)
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()

aqui = {'Authorization': f'Bearer {CHAVE}', 'apikey': CHAVE}
publicos = {b['id']: b['public'] for b in json.loads(pedir(f'{LOCAL}/storage/v1/bucket', aqui))}

token_antigo = None
if PRIVADOS:
    corpo = json.dumps({'email': os.environ['ADMIN_EMAIL'], 'password': os.environ['ADMIN_SENHA']}).encode()
    try:
        r = pedir(f'{ANTIGO}/auth/v1/token?grant_type=password',
                  {'apikey': CHAVE_ANTIGA, 'Content-Type': 'application/json'}, corpo)
    except urllib.error.HTTPError as e:
        sys.exit(f'🔴 o site antigo recusou o login ({e.code}): nada privado foi copiado')
    token_antigo = json.loads(r)['access_token']

copiados = pulados = 0
falhas, privados_pendentes = [], 0
for bucket, nome, meta in objetos:
    if bucket.startswith(IGNORAR_PREFIXO) or nome.endswith('.emptyFolderPlaceholder'):
        continue
    caminho = f'{bucket}/{urllib.parse.quote(nome)}'
    try:
        pedir(f'{LOCAL}/storage/v1/object/info/{caminho}', aqui)
        pulados += 1
        continue
    except urllib.error.HTTPError:
        pass
    try:
        if publicos.get(bucket):
            dados = pedir(f'{ANTIGO}/storage/v1/object/public/{caminho}', {})
        elif token_antigo:
            dados = pedir(f'{ANTIGO}/storage/v1/object/authenticated/{caminho}',
                          {'apikey': CHAVE_ANTIGA, 'Authorization': f'Bearer {token_antigo}'})
        else:
            privados_pendentes += 1
            continue
        if 'size' in meta and len(dados) != int(meta['size']):
            raise ValueError(f"veio com {len(dados)} bytes, o cadastro diz {meta['size']}")
        pedir(f'{LOCAL}/storage/v1/object/{caminho}',
              {**aqui, 'Content-Type': meta.get('mimetype', 'application/octet-stream'),
               'Cache-Control': meta.get('cacheControl', 'max-age=3600')}, dados, 'POST')
        copiados += 1
    except Exception as e:
        falhas.append(f'{bucket}/{nome}: {e}')

print(f'copiados agora: {copiados}; já estavam aqui: {pulados}; falhas: {len(falhas)}')
for f in falhas:
    print('  🔴', f)
if privados_pendentes:
    print(f'privados que ficaram para depois (rodar com --privados): {privados_pendentes}')
sys.exit(1 if falhas else 0)
PY

# Os dados do site guardam o endereço completo de cada arquivo (post, conteúdo SEO, vídeo
# do webinar). Só troca depois que a cópia passou sem falha (o `set -e` encerra antes, se
# não passou). Varre toda coluna de texto ou jsonb do esquema public, em vez de uma lista
# fixa: tabela nova que guarde URL não fica para trás. Os gatilhos ficam desligados só
# nesta transação, para a troca não mexer em `updated_at` (a data de alteração dos posts
# aparece no site e no sitemap).
sudo docker exec -i "$CONTAINER" psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -At \
  -v antigo="$ANTIGO" -v novo="$NOVO_PUBLICO" <<'SQL'
begin;
set local session_replication_role = replica;
select set_config('migracao.antigo', :'antigo', true), set_config('migracao.novo', :'novo', true);
do $$
declare
  c record; n bigint; total bigint := 0;
  antigo text := current_setting('migracao.antigo');
  novo text := current_setting('migracao.novo');
begin
  for c in
    select table_name, column_name, data_type from information_schema.columns
    where table_schema = 'public' and data_type in ('text', 'character varying', 'jsonb')
      and table_name in (select tablename from pg_tables where schemaname = 'public')
  loop
    if c.data_type = 'jsonb' then
      execute format('update public.%I set %I = replace(%I::text, $1, $2)::jsonb where strpos(%I::text, $1) > 0',
                     c.table_name, c.column_name, c.column_name, c.column_name) using antigo, novo;
    else
      execute format('update public.%I set %I = replace(%I, $1, $2) where strpos(%I, $1) > 0',
                     c.table_name, c.column_name, c.column_name, c.column_name) using antigo, novo;
    end if;
    get diagnostics n = row_count;
    if n > 0 then raise notice '%.%: % linha(s)', c.table_name, c.column_name, n; total := total + n; end if;
  end loop;
  raise notice 'total trocado: % linha(s)', total;
end $$;
commit;
SQL
echo "endereço antigo nos dados do site: trocado por $NOVO_PUBLICO"
