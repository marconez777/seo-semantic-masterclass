#!/usr/bin/env bash
# Grava um segredo da stack do site (o valor NÃO aparece ao colar) e recria o container
# que o usa. Todos vão para functions.env, menos SMTP_PASS, que é do auth e vai para o .env.
# Uso (de um terminal, com -t):
#   ssh -t sfai-vps /var/www/mkart/repo/ops/supabase/definir-segredo.sh RESEND_API_KEY
set -euo pipefail

PERMITIDOS="RESEND_API_KEY SERPBOT_API_KEY OPENAI_API_KEY GEMINI_API_KEY FIRECRAWL_API_KEY SEO_HEALTH_SECRET SITE_URL ENVIRONMENT ASAAS_API_KEY ASAAS_API_URL ASAAS_WEBHOOK_TOKEN HEARTH_INTAKE_URL HEARTH_INTEGRATION_SECRET SMTP_PASS"
STACK=/opt/supabase/mkart
ENV=$STACK/functions.env
nome="${1:-}"

case " $PERMITIDOS " in
  *" $nome "*) ;;
  *) echo "uso: $0 <nome>   onde <nome> é um de: $PERMITIDOS"; exit 1 ;;
esac

read -rsp "Cole o valor de $nome e aperte Enter (não aparece): " valor
echo
if [ -z "$valor" ]; then echo "vazio: nada foi alterado"; exit 1; fi

servico=functions
if [ "$nome" = SMTP_PASS ]; then ENV=$STACK/.env; servico=auth; fi

# Reescreve o arquivo sem a linha antiga do segredo. `cat >` preserva dono e permissão.
# O functions.env é lido pelo Docker (env_file): valor cru, sem aspas.
tmp="$(mktemp)"
grep -v "^$nome=" "$ENV" > "$tmp" || true
printf '%s=%s\n' "$nome" "$valor" >> "$tmp"
cat "$tmp" > "$ENV"
rm -f "$tmp"

cd "$STACK"
sudo docker compose up -d "$servico" >/dev/null 2>&1
echo "$nome gravado (${#valor} caracteres). Serviço $servico recriado."
