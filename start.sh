#!/bin/bash
# Auto-sync from GitHub before starting the server
# Preserves db.json (shared posts database) across resets

echo "[start] Syncing with GitHub..."

# Backup shared database before git reset
if [ -f artifacts/salon-app/db.json ]; then
  cp artifacts/salon-app/db.json /tmp/db_backup.json
fi

git fetch origin --quiet && git reset --hard origin/main --quiet
echo "[start] Code is up to date."

# Restore shared database after reset
if [ -f /tmp/db_backup.json ]; then
  cp /tmp/db_backup.json artifacts/salon-app/db.json
  echo "[start] Posts database restored."
fi

cd artifacts/salon-app
PORT=8081 node server/serve.js
