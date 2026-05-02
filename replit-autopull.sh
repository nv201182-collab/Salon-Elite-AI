#!/bin/bash
# Автопулл изменений с GitHub каждые 10 секунд
echo "🔄 Автопулл запущен. Ctrl+C для остановки."
while true; do
  git pull origin main 2>/dev/null && echo "$(date '+%H:%M:%S') ✓ pulled" || true
  sleep 10
done
