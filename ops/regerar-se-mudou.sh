#!/usr/bin/env bash
# Regera o site quando o conteúdo publicado mudou desde a última geração que entrou no ar.
# Roda pelo crontab do usuário deploy, a cada 5 minutos:
#   */5 * * * * /var/www/<slug>/repo/ops/regerar-se-mudou.sh >/dev/null 2>&1 # <slug>: regerar site
#
# Não puxa código do GitHub: código novo continua entrando só pelo ops/publicar.sh, à mão.
set -euo pipefail

BASE="$(cd "$(dirname "$0")/../.." && pwd)"
LOG="$BASE/logs/geracao.log"
ESPERA_APOS_FALHA=30 # minutos sem tentar de novo o mesmo conteúdo que derrubou o build

mkdir -p "$BASE/logs" "$BASE/estado"

# Geração em andamento (deste script ou do publicar.sh à mão): sai e tenta no próximo ciclo.
exec 9> "$BASE/estado/publicar.lock"
flock -n 9 || exit 0

registrar() { echo "$(TZ=America/Sao_Paulo date '+%Y-%m-%d %H:%M:%S %z') | auto | $*" >> "$LOG"; }

cd "$BASE/repo"
if ! agora=$(node scripts/impressao-do-conteudo.mjs 2> "$BASE/estado/erro-da-consulta"); then
  registrar "FALHOU | não consegui ler o banco: $(tr '\n' ' ' < "$BASE/estado/erro-da-consulta" | cut -c1-200) | o site no ar não mudou"
  exit 1
fi

[ "$agora" != "$(cat "$BASE/estado/impressao" 2> /dev/null || true)" ] || exit 0

# Conteúdo que já derrubou o build não é tentado a cada 5 minutos: o build ocupa a VPS,
# que é dividida com outros sistemas. Editar de novo no admin muda a impressão e libera.
falhou="$BASE/estado/impressao-que-falhou"
if [ "$agora" = "$(cat "$falhou" 2> /dev/null || true)" ] && [ -n "$(find "$falhou" -mmin -"$ESPERA_APOS_FALHA")" ]; then
  exit 0
fi

if SITE_LOCK=1 ORIGEM=auto SEM_PULL=1 nice -n 10 "$BASE/repo/ops/publicar.sh" > /dev/null 2>&1; then
  rm -f "$falhou"
else
  echo "$agora" > "$falhou"
  exit 1
fi
