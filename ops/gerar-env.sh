#!/usr/bin/env bash
# Imprime o .env do site (as três VITE_*) a partir da stack /opt/supabase/mkart.
# O .env não é versionado: a fonte da URL e da chave anon é a própria stack, então um
# commit antigo não consegue fazer o build voltar a falar com outro banco.
#
# Uso, na VPS (o publicar.sh já chama):  ops/gerar-env.sh > .env
# Uso, para o dev local, do seu Mac:      ssh sfai-vps /var/www/mkart/repo/ops/gerar-env.sh > .env
#
# Só sai valor público (vai para o bundle do navegador de qualquer forma). Recusa
# qualquer chave cujo papel não seja anon: a service_role não pode cair no .env.
set -euo pipefail

STACK_ENV="${STACK_ENV:-/opt/supabase/mkart/.env}"

ler() { { grep "^$1=" "$STACK_ENV" || true; } | head -n1 | cut -d= -f2- | sed 's/^"//; s/"$//'; }
url="$(ler SUPABASE_PUBLIC_URL)"
chave="$(ler ANON_KEY)"
[ -n "$url" ] && [ -n "$chave" ] || { echo "🔴 SUPABASE_PUBLIC_URL ou ANON_KEY vazios em $STACK_ENV" >&2; exit 1; }

papel="$(python3 - "$chave" <<'PY'
import base64, json, sys
try:
    corpo = sys.argv[1].split('.')[1]
    corpo += '=' * (-len(corpo) % 4)
    print(json.loads(base64.urlsafe_b64decode(corpo)).get('role', ''))
except Exception:
    print('')
PY
)"
[ "$papel" = anon ] || { echo "🔴 a ANON_KEY da stack não tem papel anon (veio '$papel'): nada foi gerado" >&2; exit 1; }

printf 'VITE_SUPABASE_PROJECT_ID="mkart"\n'
printf 'VITE_SUPABASE_PUBLISHABLE_KEY="%s"\n' "$chave"
printf 'VITE_SUPABASE_URL="%s"\n' "$url"
