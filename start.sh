#!/bin/bash
# Auto-sync from GitHub before starting the server
echo "[start] Syncing with GitHub..."
git fetch origin --quiet && git reset --hard origin/main --quiet
echo "[start] Code is up to date."

cd artifacts/salon-app
PORT=8081 node server/serve.js
