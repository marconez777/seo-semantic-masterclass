#!/usr/bin/env bash
# Instala a configuração do Nginx do site na VPS. Para cada grupo escolhe a variante
# https se o certificado já existe, senão a http — por isso pode (e deve) ser rodado de
# novo depois de emitir um certificado.
#
# Uso: ssh sfai-vps /var/www/mkart/repo/ops/instalar-nginx.sh api
#      ssh sfai-vps /var/www/mkart/repo/ops/instalar-nginx.sh site api
#
# Grupos (ops/nginx/<grupo>.{http,https}.conf):
#   site  mkart.com.br e www — o site; entra na virada, quando o DNS
#         apontar para cá
#   api   api.mkart.com.br — o backend (a stack do Supabase nesta VPS)
#
# Emitir certificado (o certbot não edita os arquivos do Nginx): o comando está no
# cabeçalho de ops/nginx/<grupo>.https.conf.
set -euo pipefail

if [ "$#" -eq 0 ]; then
  echo "diga quais grupos instalar: site, api" >&2
  exit 2
fi

ORIGEM="$(cd "$(dirname "$0")" && pwd)/nginx"
DISPONIVEIS=/etc/nginx/sites-available
ATIVOS=/etc/nginx/sites-enabled
SNIPPETS=/etc/nginx/snippets

# Domínio que dá nome ao certificado de cada grupo.
dominio_de() {
  case "$1" in
    site) echo mkart.com.br ;;
    api) echo api.mkart.com.br ;;
    *) echo "grupo desconhecido: $1" >&2; exit 2 ;;
  esac
}

for grupo in "$@"; do dominio_de "$grupo" >/dev/null; done

mkdir -p /var/www/mkart/acme

# Cópia do que está instalado, para devolver se a configuração nova não passar no
# `nginx -t`: config inválida deixada no disco derruba o próximo reload de qualquer
# outro site desta VPS.
copia="$(mktemp -d)"
sudo cp -a "$SNIPPETS"/mkart-*.conf "$DISPONIVEIS"/mkart-*.conf "$copia"/ 2>/dev/null || true

sudo cp "$ORIGEM/regras.conf" "$SNIPPETS/mkart-regras.conf"

for grupo in "$@"; do
  variante=http
  if sudo test -f "/etc/letsencrypt/live/$(dominio_de "$grupo")/fullchain.pem"; then variante=https; fi
  sudo cp "$ORIGEM/$grupo.$variante.conf" "$DISPONIVEIS/mkart-$grupo.conf"
  sudo ln -sfn "$DISPONIVEIS/mkart-$grupo.conf" "$ATIVOS/mkart-$grupo.conf"
  echo "$grupo: $variante"
done

if ! sudo nginx -t 2>/tmp/mkart-nginx-t.log; then
  cat /tmp/mkart-nginx-t.log >&2
  # Devolve o que havia; o que não havia antes desta rodada sai.
  for f in "$SNIPPETS"/mkart-*.conf "$DISPONIVEIS"/mkart-*.conf; do
    [ -e "$f" ] || continue
    if [ -e "$copia/$(basename "$f")" ]; then
      sudo cp -a "$copia/$(basename "$f")" "$f"
    else
      sudo unlink "$f"
      sudo unlink "$ATIVOS/$(basename "$f")" 2>/dev/null || true
    fi
  done
  echo "configuração inválida: devolvi a anterior, o Nginx não foi recarregado" >&2
  exit 1
fi
sudo systemctl reload nginx
echo "nginx recarregado"
