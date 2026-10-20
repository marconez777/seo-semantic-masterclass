#!/usr/bin/env bash
# Publica as edge functions do repositório na stack própria do site: copia
# supabase/functions/ para o volume da stack, põe o roteador (ops/supabase/main) no
# lugar e reinicia o serviço.
#
# Uso: ssh sfai-vps 'bash /var/www/mkart/repo/ops/supabase/publicar-funcoes.sh </dev/null'
#
# Publica TODAS de uma vez, sempre do que está em /var/www/mkart/repo.
set -euo pipefail

REPO=/var/www/mkart/repo
STACK=/opt/supabase/mkart
DEST=$STACK/volumes/functions

cd "$REPO"
versao=$(git rev-parse --short HEAD 2>/dev/null || cat versao.txt 2>/dev/null || echo sem-versao)

# Função apagada no repo sai do volume (--delete). O roteador e o import map são da
# stack, não do repo de funções: ficam protegidos pelo --exclude.
rsync -a --delete \
  --exclude='/main/' --exclude='/deno.jsonc' --exclude='/_versao.txt' \
  --exclude='*.test.ts' --exclude='__tests__/' \
  "$REPO/supabase/functions/" "$DEST/"
mkdir -p "$DEST/main"
cp "$REPO/ops/supabase/main/index.ts" "$DEST/main/index.ts"
[ -s "$DEST/deno.jsonc" ] || printf '{}\n' > "$DEST/deno.jsonc"
printf '%s\n' "$versao" > "$DEST/_versao.txt"

python3 - "$DEST" <<'PY'
import json, os, sys
dest = sys.argv[1]
manifesto = json.load(open(os.path.join(dest, '_manifesto-verify-jwt.json')))['funcoes']
pastas = sorted(d for d in os.listdir(dest)
                if not d.startswith('_') and d != 'main' and os.path.isfile(os.path.join(dest, d, 'index.ts')))
fora = [d for d in pastas if d not in manifesto]
sem_pasta = [f for f in manifesto if f not in pastas]
print(f"{len(pastas)} funções no volume; {sum(1 for f in pastas if manifesto.get(f) is False)} abertas")
if fora:
    print("fora do manifesto (ficam FECHADAS até entrarem nele):", ", ".join(fora))
if sem_pasta:
    print("🔴 no manifesto e sem pasta (vão responder 404):", ", ".join(sem_pasta))
PY

cd "$STACK"
if [ -n "$(sudo docker compose ps -q functions 2>/dev/null)" ]; then
  sudo docker compose restart functions >/dev/null
  echo "serviço de funções reiniciado"
else
  echo "a stack não está de pé: as funções entram quando ela subir"
fi
echo "publicado: $versao"
