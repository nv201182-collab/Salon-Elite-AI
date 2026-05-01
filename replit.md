# APIA — Mobile App for Beauty Salon Network

## Overview
Premium iOS/web mobile app for APIA salon network. Russian language, phone-based auth, light cream/honey palette, bee logo. Tagline: "ARCHITECTURE · PEOPLE · INTELLIGENCE · ACTION".

## Architecture
- Monorepo (pnpm workspace) with three artifacts:
  - `artifacts/salon-app` — Expo SDK 54 mobile app (main product)
  - `artifacts/api-server` — backend API stub
  - `artifacts/mockup-sandbox` — design preview server
- Salon app stack: Expo Router 6, expo-image, expo-linear-gradient, expo-blur, expo-glass-effect, react-native-reanimated 4, react-native-gesture-handler, AsyncStorage, Inter fonts.

## Liquid Glass Design System (fully applied)
- `components/GlassCard.tsx` — reusable glass card: GlassView (iOS 26+) → BlurView (iOS) → rgba (web). Shadow + white border.
- `components/LiquidBg.tsx` — warm cream gradient bg (`#F8F3EC → #F1E9D9 → #EDE0C8`) + ambient warm orbs.
- `contexts/TabBarContext.tsx` — `isScrolled` boolean + `onScroll(y)` for scroll-shrink tab bar animation.
- `components/FloatingTabBar.tsx` — floating glass capsule tab bar: `left/right:20`, `borderRadius:999`, scroll-shrink via Animated (height 64→48, label opacity 1→0), golden active pill indicator.
- Background pattern: every tab screen wraps content in `<View style={{flex:1}}><LiquidBg /><ScrollView style={{flex:1}}>...` so gradient shows through transparent cards.
- Each screen's ScrollView/FlatList calls `useTabBar().onScroll` to drive scroll-shrink.

## Salon App Structure
- `app/_layout.tsx` — root with auth gate, BeeLoader (800ms fallback timeout for slow networks), TabBarProvider wrapping.
- `app/(tabs)/` — tab order: **feed** (Лента), index (Главная), learn (Обучение), chat (Чаты), profile (Профиль).
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
- Pre-existing TS errors (non-blocking): `app/chat/[id].tsx` (letterSpacing), `hooks/useColors.ts` (radius type).
- Storage key: `@maison/data/v3`.
- bottomPad formula: `insets.bottom + (Platform.OS === "web" ? 84 : 100)`.
- FloatingTabBar `tabIndexFromSegments`: segs[1] → "feed"=0, undefined=1 (home), "learn"=2, "chat"=3, "profile"=4.

## Glass Components Usage
- Replace solid `<View style={{backgroundColor: colors.card}}>` → `<GlassCard>` everywhere
- `GlassCard` props: `borderRadius` (default 22), `innerStyle` for padding/layout, `tintOpacity` (default 0.24), `onPress`+`scaleTo` for pressable cards
- `Chip`: active=solid accent color, inactive=glass with BlurView
- `StatCard`: regular=GlassCard, accent=LinearGradient (pink→purple)
- `CourseCard`: glass borderColor/backgroundColor on outer card View
- `FloatingTabBar`: uses `useTabBar().isScrolled`; each screen passes `onScroll` to its list
