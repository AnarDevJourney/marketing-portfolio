#!/usr/bin/env bash
# Deploy the latest backend from GitHub: pull, rebuild the API image, restart it.
# Usage on the VPS:  /opt/portfolio/deploy/update.sh
set -euo pipefail
cd "$(dirname "$0")"

git pull --ff-only
docker compose up -d --build api
docker image prune -f >/dev/null
docker compose ps
