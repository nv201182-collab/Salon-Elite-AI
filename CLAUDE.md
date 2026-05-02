# Salon Elite AI — Правила работы

## Workflow: автокоммит и пуш

После каждого осмысленного изменения кода (фича, фикс, рефакторинг):
1. Запусти: `git add .`
2. Сделай commit с осмысленным сообщением на русском
3. Сразу выполни: `git push origin main`

**Важно:**
- Всегда пушить напрямую в ветку `main`
- Никогда не создавать отдельные ветки и pull requests
- Не спрашивать подтверждения для git-команд — они разрешены

## Стек проекта

- **Frontend**: Expo (React Native) — `artifacts/salon-app/`
- **Backend**: API-сервер — `artifacts/api-server/`
- **Shared libs**: `lib/`
- **Package manager**: pnpm (использовать только pnpm, не npm)

## Правила разработки

- TypeScript strict mode
- Коммиты на русском языке
- После каждого push Replit подтягивает изменения через Git pull
