#!/usr/bin/env bash
# Cópia DIÁRIA do backend do site: o banco da stack própria (/opt/supabase/mkart,
# container `mkart-db`) e os arquivos do storage.
#
# Uso (como root): ops/backup.sh              # grava em /opt/backups/mkart
#                  ops/backup.sh /outro/lugar
# Agendado em /etc/cron.d/mkart-backup (ops/instalar-backup.sh).
#
# 🔴 A cópia fica NA MESMA MÁQUINA do banco. Protege de erro humano e de migration ruim;
# não protege de perder a VPS.
#
# Restaurar o banco: pg_restore do .dump (ver ops/supabase/carregar-banco.sh, que traz o
# mesmo recorte). O arquivo tem senha (em hash) e dado de cliente: nasce 600.
set -euo pipefail

DESTINO="${1:-/opt/backups/mkart}"
CONTAINER=mkart-db
STORAGE=/opt/supabase/mkart/volumes/storage
GUARDAR=14

mkdir -p "$DESTINO"
chmod 700 "$DESTINO"
umask 077

ARQUIVO="$DESTINO/mkart-banco-$(date +%Y%m%d-%H%M%S).dump"

# `public` inteiro, as contas de login e o cadastro do storage (sem ele os arquivos
# copiados abaixo não têm a quem pertencer).
docker exec "$CONTAINER" pg_dump -U supabase_admin -d postgres -Fc \
  --schema=public --schema=auth --schema=storage > "$ARQUIVO.parcial"

# Dump cortado no meio tem tamanho e não tem índice. Ler o índice é o teste barato de
# que o arquivo se abre.
docker exec -i "$CONTAINER" pg_restore -l < "$ARQUIVO.parcial" > /dev/null

mv "$ARQUIVO.parcial" "$ARQUIVO"

# Mantém os $GUARDAR mais recentes.
ls -1t "$DESTINO"/mkart-banco-*.dump 2>/dev/null | tail -n +$((GUARDAR + 1)) | xargs -r rm -f

# Arquivos do storage: um espelho só, sem --delete. Upload não muda depois de feito, e
# assim o que for apagado por engano no site continua aqui.
rsync -a "$STORAGE/" "$DESTINO/storage/"

echo "OK: $ARQUIVO ($(du -h "$ARQUIVO" | cut -f1)) — guardados: $(ls -1 "$DESTINO"/mkart-banco-*.dump | wc -l); storage: $(du -sh "$DESTINO/storage" | cut -f1)"
