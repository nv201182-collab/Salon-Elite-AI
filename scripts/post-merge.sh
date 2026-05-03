#!/bin/bash
# Runs automatically after Replit pulls from GitHub
echo "[post-merge] New code pulled, forcing app rebuild..."

# Remove build stamp so server rebuilds the app on next start
rm -f artifacts/salon-app/static-build/src-version.txt

echo "[post-merge] Done. Press Run to restart the server."
