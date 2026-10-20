#!/usr/bin/env bash
# Cria a stack do Supabase do site da mkart em /opt/supabase/mkart, a
# partir do molde que já roda nesta VPS (o Supabase do CRM, self-hosted v0.8.2). Copia SÓ
# a receita: nenhum dado, nenhum segredo e nenhuma função do molde vêm junto. Gera chaves
# novas, sem mostrá-las. Não sobe a stack.
#
# Uso: ssh sfai-vps 'bash /var/www/mkart/repo/ops/supabase/criar-stack.sh </dev/null'
# Recusa rodar se /opt/supabase/mkart já existir.
#
# Depois dele: ops/supabase/publicar-funcoes.sh, subir a stack, ops/supabase/carregar-banco.sh
# e o Nginx (ops/instalar-nginx.sh api).
set -euo pipefail

MOLDE=/opt/supabase/mkcrm
DEST=/opt/supabase/mkart
API=https://api.mkart.com.br
SITE=https://mkart.com.br
PORTA_GATEWAY=8106
PORTA_POOLER_SESSAO=5444
PORTA_POOLER_TRANSACAO=6544

[ -e "$DEST" ] && { echo "🔴 $DEST já existe: não sobrescrevo uma stack"; exit 1; }
for p in "$PORTA_GATEWAY" "$PORTA_POOLER_SESSAO" "$PORTA_POOLER_TRANSACAO"; do
  if sudo ss -tlnH | grep -q "127.0.0.1:$p "; then echo "🔴 porta $p ocupada"; exit 1; fi
done

sudo mkdir -p "$DEST"
sudo chown deploy:deploy "$DEST"
chmod 750 "$DEST"

# Só a receita. `volumes/db/data` é o banco do CRM; `volumes/functions` são as funções
# dele; `.env` e `functions.env` são os segredos dele.
rsync -a \
  --exclude='/.env' --exclude='/.env.old' --exclude='/functions.env' --exclude='/import/' \
  --exclude='/volumes/db/data/' --exclude='/volumes/storage/' --exclude='/volumes/functions/' \
  --exclude='/docker-compose.yml.old' \
  "$MOLDE/" "$DEST/"
mkdir -p "$DEST/volumes/db/data" "$DEST/volumes/storage" "$DEST/volumes/functions/main"
cd "$DEST"

# --- composição: nome, portas, e o serviço de funções
sed -i 's/mkcrm/mkart/g' docker-compose.yml
sed -i "s/127\.0\.0\.1:5442:5432/127.0.0.1:$PORTA_POOLER_SESSAO:5432/; s/127\.0\.0\.1:6542:6543/127.0.0.1:$PORTA_POOLER_TRANSACAO:6543/" docker-compose.yml
# O vídeo do webinar (webinar-videos/hero.mp4) tem 84 MB; o molde limita upload a 50 MB.
sed -i 's/FILE_SIZE_LIMIT: 52428800$/FILE_SIZE_LIMIT: 209715200/' docker-compose.yml
grep -q 'FILE_SIZE_LIMIT: 209715200' docker-compose.yml || { echo "🔴 não achei o FILE_SIZE_LIMIT do molde"; exit 1; }
python3 - <<'PY'
p = 'docker-compose.yml'
s = open(p, encoding='utf-8').read()
ini = s.index('\n  functions:\n')
fim = s.index('\n  db:\n', ini)
bloco = s[ini:fim]

# Dentro da função, SUPABASE_URL é o gateway da própria stack (como no molde de fábrica):
# as funções do site só o usam para falar com o banco, e assim não dependem do DNS nem
# do certificado do endereço público.
antes = '      SUPABASE_URL: ${SUPABASE_PUBLIC_URL}\n'
assert antes in bloco, 'SUPABASE_URL do bloco functions mudou no molde'
bloco = bloco.replace(antes, '      SUPABASE_URL: http://api-gw:8000\n')
assert '      - ./functions.env\n' in bloco, 'o molde deixou de ler functions.env'

open(p, 'w', encoding='utf-8').write(s[:ini] + bloco + s[fim:])
PY

# --- variáveis: do exemplo de fábrica, nunca do .env do molde
cp .env.example .env
chmod 600 .env
definir() { # chave valor
  if grep -q "^$1=" .env; then sed -i "s|^$1=.*|$1=$2|" .env; else printf '%s=%s\n' "$1" "$2" >> .env; fi
}
definir SUPABASE_PUBLIC_URL "$API"
definir API_EXTERNAL_URL "$API/auth/v1"
definir SITE_URL "$SITE"
definir ADDITIONAL_REDIRECT_URLS "$SITE/**"
definir API_GW_HTTP_PORT "127.0.0.1:$PORTA_GATEWAY"
definir POOLER_TENANT_ID mkart
definir STUDIO_DEFAULT_ORGANIZATION mkart
definir STUDIO_DEFAULT_PROJECT mkart
# Diferente do Just Services: o mkart tem cadastro de cliente (/auth), com confirmação por
# e-mail ("Verifique seu e-mail para ativar sua conta"). Cadastro aberto, confirmação ligada.
definir DISABLE_SIGNUP false
definir ENABLE_EMAIL_SIGNUP true
definir ENABLE_EMAIL_AUTOCONFIRM false
definir ENABLE_ANONYMOUS_USERS false
# E-mail do auth (confirmação de cadastro e "esqueci a senha") pelo SMTP do Resend, com o
# domínio que já envia os e-mails do site. A senha (SMTP_PASS = uma chave do Resend) entra
# depois, por ops/supabase/definir-segredo.sh SMTP_PASS. Sem ela, cliente novo não ativa
# a conta e ninguém recupera senha.
definir SMTP_HOST smtp.resend.com
definir SMTP_PORT 465
definir SMTP_USER resend
definir SMTP_ADMIN_EMAIL contato@mkart.com.br
definir SMTP_SENDER_NAME '"MK Art"'
# O roteador próprio decide por função; este valor só existe porque a composição o exige.
definir FUNCTIONS_VERIFY_JWT true

# Os dois scripts do molde IMPRIMEM as chaves: a saída vai para o lixo.
sh utils/generate-keys.sh --update-env >/dev/null
sh utils/add-new-auth-keys.sh --update-env >/dev/null
rm -f .env.old docker-compose.yml.old
chmod 600 .env

# Segredos das funções (Resend, SerpBot, OpenAI…): entram depois por ops/supabase/definir-segredo.sh, sem
# passar por tela. O arquivo precisa existir para a composição subir.
: > functions.env
chmod 600 functions.env
printf '{}\n' > volumes/functions/deno.jsonc

echo "== composição"
sudo docker compose config --quiet && echo "válida"
echo "menções ao molde que sobraram (tem de ser 0): $(grep -c 'mkcrm\|saify' docker-compose.yml .env | paste -sd' ' -)"

echo "== chaves geradas (só nomes e tamanhos)"
for k in POSTGRES_PASSWORD JWT_SECRET ANON_KEY SERVICE_ROLE_KEY SUPABASE_PUBLISHABLE_KEY SUPABASE_SECRET_KEY JWT_KEYS JWT_JWKS VAULT_ENC_KEY; do
  v=$(grep "^$k=" .env | cut -d= -f2-)
  printf '  %-26s %s caracteres\n' "$k" "${#v}"
done
# Nenhum valor de exemplo pode ter sobrado.
if grep -qE "your-super-secret|your-tenant-id|this_password_is_insecure|secret1234" .env; then
  echo "🔴 sobrou valor de exemplo no .env:"; grep -nE "your-super-secret|your-tenant-id|this_password_is_insecure|secret1234" .env | cut -d= -f1
fi
echo "criada em $DEST. Ainda não subiu: falta o roteador (publicar-funcoes.sh)."
