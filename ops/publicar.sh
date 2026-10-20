#!/usr/bin/env bash
# Regera o site na VPS e só troca o que está no ar se o build passar.
# Uso: ssh sfai-vps /var/www/mkart/repo/ops/publicar.sh
#
# Layout em /var/www/mkart:
#   repo/      o repositório (onde este script roda)
#   releases/  uma pasta por build que passou
#   atual      link para o release servido pelo Nginx
#   acme/      desafio do certbot
#
# O build não precisa de segredo: o .env (não versionado) é gerado a cada publicação por
# ops/gerar-env.sh, com a URL e a chave anon da stack, que são públicas. O sitemap do mkart é o arquivo estático
# public/sitemap.xml, mantido à mão (docs/playbooks/41-publicar-post-no-blog.md).
set -euo pipefail

BASE=/var/www/mkart
MANTER=5
DIAS_DE_ASSET_ANTIGO=30

cd "$BASE/repo"
# Enquanto o repo chega aqui por rsync não há o que puxar.
[ -d .git ] && git pull --ff-only --quiet
# Depois do pull, para nenhum .env que tenha vindo junto valer: a fonte é a stack.
ops/gerar-env.sh > .env.novo
mv .env.novo .env
url_api="$(grep '^VITE_SUPABASE_URL=' .env | cut -d= -f2- | tr -d '"')"
# --legacy-peer-deps: o package.json tem date-fns 4 e o react-day-picker 8 declara até a 3.
# O Lovable instalava com bun, que não barra peer dependency; sem a flag o npm ci para.
npm ci --no-audit --no-fund --silent --legacy-peer-deps
# Falha aqui encerra o script pelo `set -e`: nada abaixo roda e o `atual` continua
# apontando para o build anterior.
npm run build

# Build que "passou" sem gerar o site não vai ao ar.
test -s dist/index.html
ls dist/assets/*.js >/dev/null
test -s dist/sitemap.xml || { echo "🔴 o build saiu sem sitemap.xml"; exit 1; }
# O build tem de apontar para a stack daqui, não para o Lovable Cloud.
if grep -rq 'nxitvhrfloibpwrkskzx' dist/assets; then echo "🔴 o build ainda fala com o Lovable Cloud"; exit 1; fi
grep -rqF "$url_api" dist/assets || { echo "🔴 o build não tem $url_api"; exit 1; }

# O que está no ar, sem abrir o servidor: curl https://<dominio>/versao.txt
{ git rev-parse --short HEAD 2>/dev/null || cat versao.txt 2>/dev/null || echo sem-versao; } > dist/versao.txt

destino="$BASE/releases/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BASE/releases"
cp -a dist "$destino"

# Quem está com o site aberto desde antes da publicação tem o index.html antigo, que pede
# os arquivos de /assets com o nome (hash) antigo ao abrir uma página carregada sob
# demanda. Os arquivos do release anterior vêm junto — nome com hash não colide — e
# saem sozinhos depois de DIAS_DE_ASSET_ANTIGO.
if [ -d "$BASE/atual/assets" ]; then
  cp -a --update=none "$BASE/atual/assets/." "$destino/assets/"
  find "$destino/assets" -type f -mtime +"$DIAS_DE_ASSET_ANTIGO" -delete
fi

# ln -sfn sozinho não é atômico (apaga e recria). Criar ao lado e renomear por cima é.
ln -sfn "$destino" "$BASE/atual.novo"
mv -T "$BASE/atual.novo" "$BASE/atual"

ls -1dt "$BASE"/releases/* | tail -n +$((MANTER + 1)) | xargs -r rm -rf
echo "no ar: $destino ($(cat "$destino/versao.txt"))"
