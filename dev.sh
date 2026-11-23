#!/usr/bin/env bash
# Local dev: starts infra (Mongo + MinIO), the NestJS API and the Vite client.
#
#   ./dev.sh           # infra + server + client
#   ./dev.sh --seed    # also runs `seed` (admin + default settings) before starting
#   ./dev.sh --demo    # also runs `seed` + `seed:demo` (fictional demo content)
#   ./dev.sh --down    # stop infra containers and exit
#
# Ctrl+C stops server and client (infra containers keep running; use --down).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE=(docker compose -f "$ROOT/deploy/docker-compose.dev.yml")

SEED=0
DEMO=0
for arg in "$@"; do
  case "$arg" in
    --seed) SEED=1 ;;
    --demo) SEED=1; DEMO=1 ;;
    --down) "${COMPOSE[@]}" down; exit 0 ;;
    -h|--help) sed -n '2,9p' "$0"; exit 0 ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

log() { printf '\033[1;36m[dev]\033[0m %s\n' "$*"; }

# Fail early if the ports we need are taken by something else.
for port in 3000 5173; do
  if ss -ltn 2>/dev/null | grep -q ":$port "; then
    echo "Port $port is already in use — stop that process first." >&2
    exit 1
  fi
done

# 1. Infra
log "Starting MongoDB + MinIO…"
"${COMPOSE[@]}" up -d

log "Waiting for MongoDB (:27017) and MinIO (:9000)…"
for i in $(seq 1 30); do
  if (exec 3<>/dev/tcp/127.0.0.1/27017) 2>/dev/null && (exec 3<>/dev/tcp/127.0.0.1/9000) 2>/dev/null; then
    break
  fi
  [ "$i" -eq 30 ] && { echo "Infra did not come up in 30s" >&2; exit 1; }
  sleep 1
done

# 2. Env files + dependencies
for app in server client; do
  if [ ! -f "$ROOT/$app/.env" ]; then
    cp "$ROOT/$app/.env.example" "$ROOT/$app/.env"
    log "Created $app/.env from .env.example — review secrets/passwords in it."
  fi
  if [ ! -d "$ROOT/$app/node_modules" ]; then
    log "Installing $app dependencies…"
    (cd "$ROOT/$app" && npm ci)
  fi
done

# 3. Optional seeding
if [ "$SEED" -eq 1 ]; then
  log "Seeding admin + default settings…"
  (cd "$ROOT/server" && npm run seed)
fi
if [ "$DEMO" -eq 1 ]; then
  log "Seeding demo content…"
  (cd "$ROOT/server" && npm run seed:demo)
fi

# 4. Server + client in parallel, with prefixed output
prefix() { local tag="$1" color="$2"; while IFS= read -r line; do printf '\033[%sm[%s]\033[0m %s\n' "$color" "$tag" "$line"; done; }

cleanup() {
  trap - INT TERM EXIT
  log "Stopping server and client…"
  kill 0 2>/dev/null || true
}
trap cleanup INT TERM EXIT

(cd "$ROOT/server" && npm run start:dev 2>&1 | prefix api '1;35') &
(cd "$ROOT/client" && npm run dev 2>&1 | prefix web '1;32') &

log "Site:    http://localhost:5173"
log "Admin:   http://localhost:5173/admin"
log "API:     http://localhost:3000/api   (Swagger: /api/docs)"
log "MinIO:   http://localhost:9001       (minioadmin / minioadmin)"
log "Ctrl+C to stop."

wait
