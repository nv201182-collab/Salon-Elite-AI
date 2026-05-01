import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import {
  GlassContainer,
  GlassView,
  isGlassEffectAPIAvailable,
} from "expo-glass-effect";
import { useRouter, useSegments } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { useTabBar } from "@/contexts/TabBarContext";
import { useColors } from "@/hooks/useColors";

/* ─── Tab definitions ─────────────────────────────────────── */
const TABS = [
  { name: "feed",    route: "/(tabs)/feed",    label: "Лента",    icon: "image"          as const },
  { name: "index",   route: "/(tabs)/",        label: "Главная",  icon: "home"           as const },
  { name: "learn",   route: "/(tabs)/learn",   label: "Обучение", icon: "book-open"      as const },
  { name: "chat",    route: "/(tabs)/chat",    label: "Чаты",     icon: "message-circle" as const },
  { name: "profile", route: "/(tabs)/profile", label: "Профиль",  icon: "user"           as const },
];
const TAB_COUNT = TABS.length;

/* ─── Constants ───────────────────────────────────────────── */
const SIDE_MARGIN   = 20;   // left/right offset of the bar from screen edges
const PILL_INSET    = 5;    // space between pill edge and bar edge (top/bottom)
const PILL_PAD      = 5;    // horizontal shrink of pill vs full tab width
const NORMAL_H      = 64;
const COMPACT_H     = 48;

/* Leading edge: fast + slight overshoot for the "liquid pull" feel */
const LEAD  = { damping: 14, stiffness: 260, mass: 0.75 };
/* Trailing edge: slow + no overshoot, lags behind */
const LAG   = { damping: 24, stiffness: 180, mass: 1.1  };
/* Scroll-shrink spring */
const SHRINK = { damping: 22, stiffness: 280, mass: 0.8  };

const glassAvail = Platform.OS === "ios" && isGlassEffectAPIAvailable();

function tabIndexFromSegments(segs: string[]): number {
  const s = segs[1] as string | undefined;
  if (s === "feed")    return 0;
  if (s === "learn")   return 2;
  if (s === "chat")    return 3;
  if (s === "profile") return 4;
  return 1;
}

/* ─── Component ───────────────────────────────────────────── */
export function FloatingTabBar() {
  const { width }    = useWindowDimensions();
  const insets       = useSafeAreaInsets();
  const colors       = useColors();
  const router       = useRouter();
  const segments     = useSegments();
  const { user }     = useApp();
  const { isScrolled } = useTabBar();

  const activeIdx = tabIndexFromSegments(segments as string[]);

  /* Tab geometry (recalculated on orientation change) */
  const TAB_W   = (width - SIDE_MARGIN * 2) / TAB_COUNT;
  const PILL_W  = TAB_W - PILL_PAD * 2;

  /* ── Liquid pill ─────────────────────────────────────────── */
  const pillL = useSharedValue(activeIdx * TAB_W + PILL_PAD);
  const pillR = useSharedValue(activeIdx * TAB_W + TAB_W - PILL_PAD);

  /* Track which index we're visually AT (for direction logic) */
  const prevIdxRef = useRef(activeIdx);
  /* Stable ref to TAB_W so effects always use the current value */
  const tabWRef = useRef(TAB_W);
  useEffect(() => { tabWRef.current = TAB_W; }, [TAB_W]);

  const animatePill = useCallback((toIdx: number, fromIdx: number) => {
    const tw = tabWRef.current;
    const newL = toIdx * tw + PILL_PAD;
    const newR = toIdx * tw + tw - PILL_PAD;
    const goingRight = toIdx > fromIdx;

    if (goingRight) {
      /* Right edge leaps ahead; left edge follows */
      pillR.value = withSpring(newR, LEAD);
      pillL.value = withSpring(newL, LAG);
    } else {
      /* Left edge leaps ahead; right edge follows */
      pillL.value = withSpring(newL, LEAD);
      pillR.value = withSpring(newR, LAG);
    }
  }, [pillL, pillR]);

  /* Animate pill when segments-driven navigation changes the active tab
     (e.g. hardware back, programmatic push from another screen) */
  useEffect(() => {
    if (prevIdxRef.current === activeIdx) return;
    animatePill(activeIdx, prevIdxRef.current);
    prevIdxRef.current = activeIdx;
  }, [activeIdx, animatePill]);

  /* ── Scroll-shrink ─────────────────────────────────────── */
  const barH    = useSharedValue(NORMAL_H);
  const labelOp = useSharedValue(1);

  useEffect(() => {
    barH.value    = withSpring(isScrolled ? COMPACT_H : NORMAL_H, SHRINK);
    labelOp.value = withTiming(isScrolled ? 0 : 1, { duration: 140 });
  }, [isScrolled, barH, labelOp]);

  /* ── Animated styles ────────────────────────────────────── */
  const barStyle = useAnimatedStyle(() => ({ height: barH.value }));

  const pillStyle = useAnimatedStyle(() => ({
    left:  pillL.value,
    width: pillR.value - pillL.value,
  }));

  const labelStyle = useAnimatedStyle(() => ({ opacity: labelOp.value }));

  /* ── Tab press ──────────────────────────────────────────── */
  const onTabPress = useCallback(
    (route: string, idx: number) => {
      if (idx !== prevIdxRef.current) {
        animatePill(idx, prevIdxRef.current);
        prevIdxRef.current = idx;
      }
      router.replace(route as never);
    },
    [router, animatePill],
  );

  if (!user) return null;

  const bottomOffset = (insets.bottom > 0 ? insets.bottom : 8) + 12;

  return (
    <Animated.View
      style={[styles.container, { bottom: bottomOffset }, barStyle]}
    >
      {/* ── Glass background layer (clipped to pill shape) ── */}
      <View style={[StyleSheet.absoluteFillObject, styles.glassClip]}>
        {glassAvail ? (
          <GlassContainer style={StyleSheet.absoluteFillObject}>
            <GlassView
              style={StyleSheet.absoluteFillObject}
              glassEffectStyle="regular"
              colorScheme="light"
            />
          </GlassContainer>
        ) : (
          <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFillObject} />
        )}
        <View style={[StyleSheet.absoluteFillObject, styles.overlay]} />

        {/* ── Liquid indicator ────────────────────────────── */}
        <Animated.View
          style={[
            styles.liquidPill,
            {
              backgroundColor: "rgba(200,160,100,0.20)",
              borderColor: "rgba(200,160,100,0.45)",
            },
            pillStyle,
          ]}
        />
      </View>

      {/* ── Tab buttons ────────────────────────────────────── */}
      <View style={styles.tabRow}>
        {TABS.map((tab, idx) => {
          const active = idx === activeIdx;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabBtn}
              onPress={() => onTabPress(tab.route, idx)}
              activeOpacity={0.65}
            >
              <Feather
                name={tab.icon}
                size={20}
                color={active ? colors.accent : colors.mutedForeground}
              />
              <Animated.Text
                numberOfLines={1}
                style={[
                  styles.tabLabel,
                  {
                    color: active ? colors.accent : colors.mutedForeground,
                    fontFamily: active ? "Inter_600SemiBold" : "Inter_400Regular",
                  },
                  labelStyle,
                ]}
              >
                {tab.label}
              </Animated.Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: SIDE_MARGIN,
    right: SIDE_MARGIN,
    borderRadius: 999,
    zIndex: 100,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
    shadowColor: "#6B5A3E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 14,
  },
  glassClip: {
    borderRadius: 999,
    overflow: "hidden",
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    backgroundColor: "rgba(250,246,240,0.48)",
  },
  liquidPill: {
    position: "absolute",
    top: PILL_INSET,
    bottom: PILL_INSET,
    borderRadius: 999,
    borderWidth: 1,
  },
  tabRow: {
    flex: 1,
    flexDirection: "row",
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 6,
    zIndex: 1, // above the liquid pill
  },
  tabLabel: {
    fontSize: 9,
    letterSpacing: 0.1,
  },
});
