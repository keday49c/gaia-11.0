#!/bin/bash
set -euo pipefail

# Usage: sudo ./apply-patches.sh /absolute/path/to/project_root
# The script copies patched files into the provided PROJECT_ROOT and sets minimal permissions.

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 /absolute/path/to/project_root"
  exit 2
fi

PROJECT_ROOT="$1"
PATCH_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Applying patches from $PATCH_DIR to $PROJECT_ROOT"

# Backup originals
TIMESTAMP=$(date +%Y%m%dT%H%M%S)
BACKUP_DIR="$HOME/gaia-patches-backup-$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

for f in docker-compose.yml Dockerfile client.Dockerfile; do
  if [ -f "$PROJECT_ROOT/$f" ]; then
    echo "Backing up $PROJECT_ROOT/$f -> $BACKUP_DIR/$f"
    cp -v "$PROJECT_ROOT/$f" "$BACKUP_DIR/$f"
  fi
done

# Copy patched files
cp -v "$PATCH_DIR/docker-compose.yml" "$PROJECT_ROOT/docker-compose.yml"
cp -v "$PATCH_DIR/Dockerfile" "$PROJECT_ROOT/Dockerfile"
cp -v "$PATCH_DIR/client.Dockerfile" "$PROJECT_ROOT/client/Dockerfile"

# Copy scripts
mkdir -p "$PROJECT_ROOT/scripts"
cp -v "$PATCH_DIR/wait-for-db.sh" "$PROJECT_ROOT/scripts/wait-for-db.sh"
cp -v "$PATCH_DIR/gaia-stack.service" "$PROJECT_ROOT/scripts/gaia-stack.service"
cp -v "$PATCH_DIR/.env.example" "$PROJECT_ROOT/.env.example"

# If .env does not exist, create it from .env.example (safe default placeholders). Do not overwrite existing .env
if [ ! -f "$PROJECT_ROOT/.env" ]; then
  cp -v "$PATCH_DIR/.env.example" "$PROJECT_ROOT/.env"
  chmod 600 "$PROJECT_ROOT/.env" || true
  echo "Created $PROJECT_ROOT/.env from example. Please edit to set real secrets before deploying to production."
fi

# Ensure executable
chmod +x "$PROJECT_ROOT/scripts/wait-for-db.sh" || true

# If running as root, install the systemd unit automatically (idempotent)
if [ "$(id -u)" -eq 0 ]; then
  echo "Detected root. Installing systemd unit to /etc/systemd/system/gaia-stack.service"
  cp -v "$PROJECT_ROOT/scripts/gaia-stack.service" /etc/systemd/system/gaia-stack.service
  sed -i "s|/path/to/gaia-11.0|$PROJECT_ROOT|g" /etc/systemd/system/gaia-stack.service || true
  systemctl daemon-reload || true
  systemctl enable --now gaia-stack.service || true
  echo "Systemd unit installed and enabled (or attempted). Check 'systemctl status gaia-stack.service' for status."
else
  echo
  echo "NOTE: not running as root. To install the systemd unit run as root or use the next-steps file."
  cat > /tmp/gaia-apply-next-steps.txt <<EOF
# Next steps on the host (run as root or with sudo):
# 1) Copy systemd unit and fix paths
sudo cp -v "$PROJECT_ROOT/scripts/gaia-stack.service" /etc/systemd/system/gaia-stack.service
sudo sed -i "s|/path/to/gaia-11.0|$PROJECT_ROOT|g" /etc/systemd/system/gaia-stack.service

# 2) Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable --now gaia-stack.service

# 3) Build and bring up stack
cd "$PROJECT_ROOT"
docker compose build --pull
docker compose up -d --remove-orphans

# 4) Validate as described in README_APPLY_PATCHES.md
EOF

  echo "Patches copied. Read /tmp/gaia-apply-next-steps.txt for next steps to run on the target host."
fi

exit 0
