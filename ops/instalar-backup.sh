#!/usr/bin/env bash
# Agenda a cópia diária do backend do site (ops/backup.sh) no cron da VPS.
# Uso: ssh sfai-vps /var/www/mkart/repo/ops/instalar-backup.sh
#
# O cron chama uma cópia do script em /usr/local/sbin, do root: a pasta do repo é do
# usuário deploy, e o cron do root não deve executar o que outro usuário pode reescrever.
set -euo pipefail

ORIGEM="$(cd "$(dirname "$0")" && pwd)/backup.sh"
sudo install -o root -g root -m 755 "$ORIGEM" /usr/local/sbin/mkart-backup

# 02:15: antes do banco do SFAI (02:30) e do Just Services (02:45), para não disputar disco.
printf '%s\n' '15 2 * * * root /usr/local/sbin/mkart-backup >> /var/log/mkart-backup.log 2>&1' \
  | sudo tee /etc/cron.d/mkart-backup >/dev/null
sudo chmod 644 /etc/cron.d/mkart-backup
echo "agendado: $(cat /etc/cron.d/mkart-backup)"
