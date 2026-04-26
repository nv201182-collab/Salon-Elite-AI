# APIA — Mobile App for Beauty Salon Network

## Overview
Premium iOS/web mobile app for APIA salon network. Russian language, phone-based auth, light cream/honey palette, bee logo. Tagline: "ARCHITECTURE · PEOPLE · INTELLIGENCE · ACTION".

## Architecture
- Monorepo (pnpm workspace) with three artifacts:
  - `artifacts/salon-app` — Expo SDK 54 mobile app (main product)
  - `artifacts/api-server` — backend API stub
  - `artifacts/mockup-sandbox` — design preview server
- Salon app stack: Expo Router 6, expo-image, expo-linear-gradient, react-native-reanimated 4, AsyncStorage, Inter fonts.

## Salon App Structure
- `app/_layout.tsx` — root with auth gate, BeeLoader during font load.
- `app/(tabs)/` — tab order: **feed** (Лента, default), index (Главная), learn (Обучение), chat (Чаты), profile (Профиль).
- `contexts/AppContext.tsx` — user, auth, points, level, role.
- `contexts/DataContext.tsx` — posts, courses, chats, contests, trends, achievements; AsyncStorage persistence.
- `data/seed.ts` — 6 salons, 22 employees, 30 posts, 14 courses, 8 contests, 13 chats, trends and achievements.
- `data/images.ts` — curated trending Unsplash beauty image URLs.
- `components/BeeLoader.tsx` — animated bee splash (figure-8 path, wing flap, gold trail dots).

## Key Conventions
- Single salon-app artifact (free tier).
- All photos use REMOTE map from `data/images.ts` — Unsplash trending shots categorized by hair / barber / nails / makeup / brows / skin / interior / tools.
- Course categories: Адаптация, Сервис, Продажи, Парикмахерское, Маникюр, Брови, Макияж, Уход, Менеджмент.
- Brand palette in `constants/colors.ts` and `hooks/useColors.ts`.
