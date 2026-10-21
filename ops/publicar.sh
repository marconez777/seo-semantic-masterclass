#!/usr/bin/env bash
# Regera o site na VPS e só troca o que está no ar se o build passar.
# Uso: ssh sfai-vps /var/www/mkart/repo/ops/publicar.sh
#
# Layout em /var/www/mkart:
#   repo/      o repositório (onde este script roda)
#   releases/  uma pasta por build que passou
#   atual      link para o release servido pelo Nginx
#   acme/      desafio do certbot
#   email/     templates do e-mail do auth (ops/supabase/aplicar-emails.sh), fora do build
#   logs/      geracao.log (uma linha por geração) e ultimo-build.log (saída do último build)
#   estado/    lock e impressão do conteúdo da última geração que entrou no ar
#
# O build não precisa de segredo: o .env (não versionado) é gerado a cada publicação por
# ops/gerar-env.sh, com a URL e a chave anon da stack, que são públicas.
# O site é HTML pronto por URL (npm run build:ssg): o sitemap sai do build, com os posts
# publicados no banco.
#
# Variáveis (quem usa é o ops/regerar-se-mudou.sh, chamado pelo cron):
#   SEM_PULL=1     não puxa código nem reinstala dependências: só regera o conteúdo
#   ORIGEM=auto    o que aparece no log (padrão: manual)
#   SITE_LOCK=1    quem chamou já segura o lock
set -euo pipefail

BASE=/var/www/mkart
MANTER=5
DIAS_DE_ASSET_ANTIGO=30
LOG="$BASE/logs/geracao.log"
BUILD_LOG="$BASE/logs/ultimo-build.log"
ORIGEM="${ORIGEM:-manual}"

mkdir -p "$BASE/logs" "$BASE/estado" "$BASE/releases"

registrar() { echo "$(TZ=America/Sao_Paulo date '+%Y-%m-%d %H:%M:%S %z') | $ORIGEM | $*" >> "$LOG"; }

# Nunca duas gerações ao mesmo tempo: as duas escreveriam no mesmo dist/.
if [ -z "${SITE_LOCK:-}" ]; then
  exec 9> "$BASE/estado/publicar.lock"
  if ! flock -w 600 9; then
    registrar "FALHOU | outra geração segurou o lock por mais de 10 minutos"
    exit 1
  fi
fi

# Tudo dentro de uma função: o bash lê o arquivo aos poucos, e o pull (ou o rsync que
# traz o código) pode trocar este script no meio da execução. Função já lida inteira não muda.
principal() {
  inicio=$(date +%s)
  trap 'c=$?; [ "$c" -eq 0 ] || registrar "FALHOU | código $c em $(( $(date +%s) - inicio ))s | o site no ar não mudou | detalhe em $BUILD_LOG"' EXIT

  cd "$BASE/repo"
  : > "$BUILD_LOG"
  if [ -z "${SEM_PULL:-}" ]; then
    {
      # Enquanto o repo chega aqui por rsync não há o que puxar.
      if [ -d .git ]; then git pull --ff-only --quiet; fi
      # --legacy-peer-deps: o package.json tem date-fns 4 e o react-day-picker 8 declara até a 3.
      # O Lovable instalava com bun, que não barra peer dependency; sem a flag o npm ci para.
      npm ci --no-audit --no-fund --silent --legacy-peer-deps
    } 2>&1 | tee -a "$BUILD_LOG"
  fi
  # Depois do pull, para nenhum .env que tenha vindo junto valer: a fonte é a stack.
  ops/gerar-env.sh > .env.novo
  mv .env.novo .env
  url_api="$(grep '^VITE_SUPABASE_URL=' .env | cut -d= -f2- | tr -d '"')"

  # Tirada antes do build: o que mudar no banco durante o build fica diferente da
  # impressão salva e o próximo ciclo regera.
  impressao=$(node scripts/impressao-do-conteudo.mjs 2>> "$BUILD_LOG" || true)

  # Falha aqui (página vazia, banco fora, URLs sumindo) encerra o script pelo `set -e`:
  # nada abaixo roda e o `atual` continua apontando para o build anterior.
  npm run build:ssg 2>&1 | tee -a "$BUILD_LOG"

  # Build que "passou" sem gerar o site não vai ao ar.
  grep -q 'data-ssg-path="/"' dist/index.html || { echo "🔴 a home saiu sem o HTML pronto"; exit 1; }
  ls dist/assets/*.js >/dev/null
  test -s dist/404.html
  test -s dist/spa.html
  grep -q '<loc>https://mkart.com.br/blog/' dist/sitemap.xml || { echo "🔴 o sitemap saiu sem os posts do blog"; exit 1; }
  # O build tem de apontar para a stack daqui, não para o Lovable Cloud.
  if grep -rq 'nxitvhrfloibpwrkskzx' dist/assets; then echo "🔴 o build ainda fala com o Lovable Cloud"; exit 1; fi
  grep -rqF "$url_api" dist/assets || { echo "🔴 o build não tem $url_api"; exit 1; }

  # O que está no ar, sem abrir o servidor: curl https://mkart.com.br/versao.txt
  { git rev-parse --short HEAD 2>/dev/null || cat versao.txt 2>/dev/null || echo sem-versao; } > dist/versao.txt

  destino="$BASE/releases/$(date +%Y%m%d-%H%M%S)"
  cp -a dist "$destino"

  # Quem está com o site aberto desde antes da publicação tem o HTML antigo, que pede
  # os arquivos de /assets com o nome (hash) antigo. Os arquivos do release anterior vêm
  # junto — nome com hash não colide — e saem sozinhos depois de DIAS_DE_ASSET_ANTIGO.
  if [ -d "$BASE/atual/assets" ]; then
    cp -a --update=none "$BASE/atual/assets/." "$destino/assets/"
    find "$destino/assets" -type f -mtime +"$DIAS_DE_ASSET_ANTIGO" -delete
  fi

  # ln -sfn sozinho não é atômico (apaga e recria). Criar ao lado e renomear por cima é.
  ln -sfn "$destino" "$BASE/atual.novo"
  mv -T "$BASE/atual.novo" "$BASE/atual"

  [ -z "$impressao" ] || echo "$impressao" > "$BASE/estado/impressao"

  ls -1dt "$BASE"/releases/* | tail -n +$((MANTER + 1)) | xargs -r rm -rf
  resumo=$(grep -E '^[0-9]+ páginas em ' "$BUILD_LOG" | tail -n 1 || true)
  registrar "OK | ${resumo:-build concluído} | $(( $(date +%s) - inicio ))s no total | $destino ($(cat "$destino/versao.txt"))"
  echo "no ar: $destino ($(cat "$destino/versao.txt"))"
}

principal
