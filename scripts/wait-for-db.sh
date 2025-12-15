#!/bin/sh
set -e

HOST=${DB_HOST:-postgres}
# Use a distinct variable name so we don't overwrite the server PORT env
DB_PORT_WAIT=${DB_PORT:-5432}
USER=${DB_USER:-gaia_user}
RETRIES=${WAIT_RETRIES:-60}
SLEEP=${WAIT_SLEEP:-2}

# If DATABASE_URL is provided, prefer parsing host and port from it
if [ -n "$DATABASE_URL" ]; then
  # DATABASE_URL example: postgres://user:pass@host:5432/dbname
  tmp=${DATABASE_URL#*://}        # remove protocol
  # If there is a user:pass@ prefix, drop it
  if [ "${tmp#*@}" != "$tmp" ]; then
    tmp=${tmp#*@}
  fi
  hostpart=${tmp%%/*}             # host[:port]
  HOST_CAND=${hostpart%%:*}
  PORT_CAND=${hostpart#*:}
  if [ -n "$HOST_CAND" ]; then
    HOST=$HOST_CAND
  fi
  # If port was present (not equal to whole hostpart), use it
  if [ "$PORT_CAND" != "$hostpart" ] && [ -n "$PORT_CAND" ]; then
    DB_PORT_WAIT=$PORT_CAND
  fi
fi

# Export PGPASSWORD so clients like psql can use it (pg_isready doesn't need it)
if [ -n "$DB_PASSWORD" ]; then
  export PGPASSWORD="$DB_PASSWORD"
fi

echo "[wait-for-db] Waiting for Postgres at ${HOST}:${DB_PORT_WAIT} (user=${USER})"
count=0
while ! pg_isready -h "$HOST" -p "$DB_PORT_WAIT" -U "$USER" >/dev/null 2>&1; do
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
