#!/bin/sh
set -e

HOST=${DB_HOST:-postgres}
PORT=${DB_PORT:-5432}
USER=${DB_USER:-gaia_user}
RETRIES=${WAIT_RETRIES:-60}
SLEEP=${WAIT_SLEEP:-2}

echo "[wait-for-db] Waiting for Postgres at ${HOST}:${PORT} (user=${USER})"
count=0
while ! pg_isready -h "$HOST" -p "$PORT" -U "$USER" >/dev/null 2>&1; do
  count=$((count+1))
  if [ "$count" -ge "$RETRIES" ]; then
    echo "[wait-for-db] timed out after $RETRIES attempts"
    exit 1
  fi
  echo "[wait-for-db] waiting for postgres... attempt $count"
  sleep ${SLEEP}
done

echo "[wait-for-db] Postgres is available. Starting application..."

# Exec the application (node dist/index.js) as the current user
exec node dist/index.js
