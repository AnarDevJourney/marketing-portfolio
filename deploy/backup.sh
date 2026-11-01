#!/usr/bin/env bash
# Daily backup of the database and the media files, kept for 14 days.
# cron (crontab -e):  0 3 * * * /opt/portfolio/deploy/backup.sh >> /var/log/portfolio-backup.log 2>&1
#
# Backups land on the same VPS — also enable Hetzner's server backups (or copy
# BACKUP_DIR elsewhere) so a lost server doesn't take the backups with it.
set -euo pipefail
cd "$(dirname "$0")"

BACKUP_DIR="${BACKUP_DIR:-/var/backups/portfolio}"
STAMP="$(date +%F)"
mkdir -p "$BACKUP_DIR"

# MongoDB: compressed archive (restore: docker compose exec -T mongo mongorestore --archive --gzip --drop < file)
docker compose exec -T mongo mongodump --archive --gzip > "$BACKUP_DIR/mongo-$STAMP.gz"

# MinIO: tar of the data volume (Chainguard's image has no shell for `mc mirror`)
docker run --rm -v portfolio_minio_data:/data:ro -v "$BACKUP_DIR":/backup alpine \
  tar czf "/backup/media-$STAMP.tar.gz" -C /data .

find "$BACKUP_DIR" -name 'mongo-*.gz' -mtime +14 -delete
find "$BACKUP_DIR" -name 'media-*.tar.gz' -mtime +14 -delete
echo "$(date -Is) backup ok: $BACKUP_DIR/*-$STAMP.*"
