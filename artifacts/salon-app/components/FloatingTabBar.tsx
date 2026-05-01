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
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { useTabBar } from "@/contexts/TabBarContext";
import { useColors } from "@/hooks/useColors";

/* ─── Tab definitions ──────────────────────────────────────── */
const TABS = [
  { name: "feed",    route: "/(tabs)/feed",    label: "Лента",    icon: "image"          as const },
  { name: "index",   route: "/(tabs)/",        label: "Главная",  icon: "home"           as const },
  { name: "learn",   route: "/(tabs)/learn",   label: "Обучение", icon: "book-open"      as const },
  { name: "chat",    route: "/(tabs)/chat",    label: "Чаты",     icon: "message-circle" as const },
  { name: "profile", route: "/(tabs)/profile", label: "Профиль",  icon: "user"           as const },
];
const TAB_COUNT = TABS.length;

/* ─── Layout constants ─────────────────────────────────────── */
const SIDE_MARGIN = 20;   // left / right from screen edges
const PILL_PAD    = 6;    // horizontal inset from tab cell edge
const PILL_INSET  = 5;    // vertical inset (top + bottom)
const NORMAL_H    = 64;
const COMPACT_H   = 48;

/* ─── Spring configs ───────────────────────────────────────── */
/** Pill center moves smoothly with slight overshoot */
const POS_SPRING    = { damping: 15, stiffness: 280, mass: 0.85 };
/** Stretch peaks quickly then releases */
const STRETCH_IN    = { damping: 10, stiffness: 500, mass: 0.5  };
const STRETCH_OUT   = { damping: 18, stiffness: 220, mass: 0.9  };
/** Bar height collapse */
const HEIGHT_SPRING = { damping: 22, stiffness: 280, mass: 0.8  };

const glassAvail = Platform.OS === "ios" && isGlassEffectAPIAvailable();

function tabIndexFromSegments(segs: string[]): number {
  const s = segs[1] as string | undefined;
  if (s === "feed")    return 0;
  if (s === "learn")   return 2;
  if (s === "chat")    return 3;
  if (s === "profile") return 4;
  return 1; // home / (tabs)/
}

/* ─── Component ─────────────────────────────────────────────── */
export function FloatingTabBar() {
  const { width }      = useWindowDimensions();
  const insets         = useSafeAreaInsets();
  const colors         = useColors();
  const router         = useRouter();
  const segments       = useSegments();
  const { user }       = useApp();
  const { isScrolled } = useTabBar();

  const activeIdx = tabIndexFromSegments(segments as string[]);

  /** Width of a single tab cell inside the bar */
  const tabW = (width - SIDE_MARGIN * 2) / TAB_COUNT;
  /** Natural pill width */
  const pillNatW = tabW - PILL_PAD * 2;

  /** Keep latest tabW in a ref so callbacks never go stale */
  const tabWRef = useRef(tabW);
  useEffect(() => { tabWRef.current = tabW; }, [tabW]);

  /* ── Pill animation: center-X + width ── */
  const pillCX = useSharedValue(activeIdx * tabW + tabW / 2);   // center X
  const pillW  = useSharedValue(pillNatW);                       // current width

  /* Previous active index to detect direction */
  const prevIdxRef = useRef(activeIdx);

  const animatePill = useCallback((toIdx: number, fromIdx: number) => {
    const tw   = tabWRef.current;
    const natW = tw - PILL_PAD * 2;
    const dist = Math.abs(toIdx - fromIdx);
    /** How much the pill stretches — more tabs = more stretch */
    const extra = Math.min(dist * tw * 0.4, tw * 0.9);

    pillCX.value = withSpring(toIdx * tw + tw / 2, POS_SPRING);

    pillW.value = withSequence(
      withSpring(natW + extra, STRETCH_IN),
      withSpring(natW, STRETCH_OUT),
    );
  }, [pillCX, pillW]);

  /* Sync pill when routing changes outside of tap (back button, deep link) */
  useEffect(() => {
    if (prevIdxRef.current === activeIdx) return;
    animatePill(activeIdx, prevIdxRef.current);
    prevIdxRef.current = activeIdx;
  }, [activeIdx, animatePill]);

  /* ── Scroll-shrink ──────────────────────────────────────────── */
  const barH    = useSharedValue(NORMAL_H);
  const labelOp = useSharedValue(1);

  useEffect(() => {
    barH.value    = withSpring(isScrolled ? COMPACT_H : NORMAL_H, HEIGHT_SPRING);
    labelOp.value = withTiming(isScrolled ? 0 : 1, { duration: 150 });
  }, [isScrolled, barH, labelOp]);

  /* ── Animated styles ────────────────────────────────────────── */
  const barStyle = useAnimatedStyle(() => ({ height: barH.value }));

  /** Derive left from center — keeps pill horizontally centered in its cell */
  const pillStyle = useAnimatedStyle(() => ({
    left:  pillCX.value - pillW.value / 2,
    width: pillW.value,
  }));

  const labelStyle = useAnimatedStyle(() => ({ opacity: labelOp.value }));

  /* ── Tab press ──────────────────────────────────────────────── */
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
    <Animated.View style={[styles.wrapper, { bottom: bottomOffset }, barStyle]}>
      {/* ── Glass / blur fill ─────────────────────────────────── */}
      <View style={styles.glassWrap}>
        {glassAvail ? (
          <GlassContainer style={StyleSheet.absoluteFillObject}>
            <GlassView
              style={StyleSheet.absoluteFillObject}
              glassEffectStyle="regular"
              colorScheme="light"
            />
          </GlassContainer>
        ) : (
          <BlurView intensity={85} tint="light" style={StyleSheet.absoluteFillObject} />
        )}
        <View style={[StyleSheet.absoluteFillObject, styles.tint]} />
      </View>

      {/* ── Liquid pill indicator (OUTSIDE the clipped area) ─── */}
      <Animated.View style={[styles.pill, pillStyle]} />

      {/* ── Tab buttons ─────────────────────────────────────── */}
      <View style={styles.row}>
        {TABS.map((tab, idx) => {
          const active = idx === activeIdx;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabBtn}
              onPress={() => onTabPress(tab.route, idx)}
              activeOpacity={0.7}
            >
              <Feather
                name={tab.icon}
                size={active ? 22 : 20}
                color={active ? colors.accent : colors.mutedForeground}
              />
              <Animated.Text
                numberOfLines={1}
                style={[
                  styles.label,
                  {
                    color:      active ? colors.accent : colors.mutedForeground,
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
  wrapper: {
    position: "absolute",
    left: SIDE_MARGIN,
    right: SIDE_MARGIN,
    borderRadius: 999,
    zIndex: 100,
    overflow: "hidden",           // clips the blur AND the pill together
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.75)",
    shadowColor: "#5A4020",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 14,
  },
  glassWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  tint: {
    backgroundColor: "rgba(252,247,241,0.52)",
  },
  /** Liquid pill — absolutely positioned directly in wrapper */
  pill: {
    position: "absolute",
    top: PILL_INSET,
    bottom: PILL_INSET,
    borderRadius: 999,
    backgroundColor: "rgba(185,145,85,0.22)",
    borderWidth: 1,
    borderColor: "rgba(185,145,85,0.50)",
  },
  row: {
    flex: 1,
    flexDirection: "row",
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 6,
  },
  label: {
    fontSize: 9,
    letterSpacing: 0.1,
  },
});
