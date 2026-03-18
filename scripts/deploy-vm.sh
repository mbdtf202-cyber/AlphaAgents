#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/alpha-agents}"
COMPOSE_FILE="${APP_DIR}/deploy/docker-compose.prod.yml"

required_vars=(
  ALPHA_AGENTS_IMAGE
  GHCR_USERNAME
  GHCR_TOKEN
  APP_DOMAIN
)

for name in "${required_vars[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    echo "Missing required env: ${name}" >&2
    exit 1
  fi
done

cd "${APP_DIR}"

export ALPHA_AGENTS_IMAGE
export APP_DOMAIN

echo "${GHCR_TOKEN}" | docker login ghcr.io -u "${GHCR_USERNAME}" --password-stdin
docker compose -f "${COMPOSE_FILE}" pull
docker compose -f "${COMPOSE_FILE}" run --rm web pnpm db:migrate
docker compose -f "${COMPOSE_FILE}" up -d web benchmark-worker caddy

for _ in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3100/api/readyz >/tmp/alpha_agents_readyz.json; then
    cat /tmp/alpha_agents_readyz.json
    exit 0
  fi
  sleep 2
done

docker compose -f "${COMPOSE_FILE}" ps
docker compose -f "${COMPOSE_FILE}" logs --tail=200 web benchmark-worker caddy || true
exit 1
