/**
 * FloatingTabBar — Apple Liquid Glass pill navigation, May 2026.
 *
 * Water-flow physics: the pill stretches toward the destination
 * (like liquid), glides with overshoot, then settles.
 *
 * Color: transparent cool-gray (no beige), authentic glass.
 * Haptics: light impact on every tab press.
 */
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import {
  GlassContainer,
  GlassView,
  isGlassEffectAPIAvailable,
} from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
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
  Easing,
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
  { name: "feed",    route: "/(tabs)/feed",    label: "Лента",   icon: "home"           as const },
  { name: "index",   route: "/(tabs)/",        label: "Поиск",   icon: "search"         as const },
  { name: "learn",   route: "/(tabs)/learn",   label: "Курсы",   icon: "book-open"      as const },
  { name: "chat",    route: "/(tabs)/chat",    label: "Чаты",    icon: "message-circle" as const },
  { name: "profile", route: "/(tabs)/profile", label: "Профиль", icon: "user"           as const },
];
const TAB_COUNT = TABS.length;

/* ─── Layout ───────────────────────────────────────────────── */
const SIDE_MARGIN = 20;
const PILL_PAD    = 6;
const PILL_INSET  = 5;
const NORMAL_H    = 64;
const COMPACT_H   = 48;

/* ─── Spring configs — viscous water physics ───────────────── */
/** Main glide: slower, heavier — like water being pushed */
const POS_SPRING    = { damping: 18, stiffness: 110, mass: 1.6 } as const;
/** Stretch inflate: under-damped, snappy leading edge */
const STRETCH_IN    = { damping: 5,  stiffness: 180, mass: 1.1 } as const;
/** Settle: over-damped, slow drip back */
const STRETCH_OUT   = { damping: 9,  stiffness: 75,  mass: 2.0 } as const;
/** Bar height */
const HEIGHT_SPRING = { damping: 26, stiffness: 240, mass: 0.9 } as const;

const glassAvail = Platform.OS === "ios" && isGlassEffectAPIAvailable();

function triggerHaptic() {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/* ─── Per-tab icon ──────────────────────────────────────────── */
type TabIconProps = {
  icon: (typeof TABS)[number]["icon"];
  label: string;
  active: boolean;
  labelStyle: object;
  accentColor: string;
  mutedColor: string;
};

function TabIcon({ icon, label, active, labelStyle, accentColor, mutedColor }: TabIconProps) {
  const scale   = useSharedValue(active ? 1 : 0.86);
  const opacity = useSharedValue(active ? 1 : 0.55);

  useEffect(() => {
    scale.value   = withSpring(active ? 1 : 0.86, { damping: 14, stiffness: 300, mass: 0.6 });
    opacity.value = withTiming(active ? 1 : 0.55, { duration: 200, easing: Easing.out(Easing.quad) });
  }, [active, scale, opacity]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.tabContent}>
      <Animated.View style={iconStyle}>
        <Feather name={icon} size={22} color={active ? accentColor : mutedColor} />
      </Animated.View>
      <Animated.Text
        numberOfLines={1}
        style={[
          styles.label,
          {
            color:      active ? accentColor : mutedColor,
            fontFamily: active ? "Inter_600SemiBold" : "Inter_400Regular",
          },
          labelStyle,
        ]}
      >
        {label}
      </Animated.Text>
    </View>
  );
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

  const tabW     = (width - SIDE_MARGIN * 2) / TAB_COUNT;
  const pillNatW = tabW - PILL_PAD * 2;

  const tabWRef = useRef(tabW);
  useEffect(() => { tabWRef.current = tabW; }, [tabW]);

  /* ── Pill: center-X + width ─────────────────────────────── */
  const pillCX = useSharedValue(activeIdx * tabW + tabW / 2);
  const pillW  = useSharedValue(pillNatW);
  const prevIdxRef = useRef(activeIdx);

  const animatePill = useCallback((toIdx: number, fromIdx: number) => {
    const tw    = tabWRef.current;
    const natW  = tw - PILL_PAD * 2;
    const dist  = Math.abs(toIdx - fromIdx);

    // Water stretch: proportional to distance, exaggerated for long jumps
    const extra = Math.min(dist * tw * 0.62, tw * 1.25);

    pillCX.value = withSpring(toIdx * tw + tw / 2, POS_SPRING);
    pillW.value  = withSequence(
      withSpring(natW + extra, STRETCH_IN),
      withSpring(natW, STRETCH_OUT),
    );
  }, [pillCX, pillW]);

  useEffect(() => {
    if (prevIdxRef.current === activeIdx) return;
    animatePill(activeIdx, prevIdxRef.current);
    prevIdxRef.current = activeIdx;
  }, [activeIdx, animatePill]);

  /* ── Scroll-shrink ─────────────────────────────────────── */
  const barH    = useSharedValue(NORMAL_H);
  const labelOp = useSharedValue(1);

  useEffect(() => {
    barH.value    = withSpring(isScrolled ? COMPACT_H : NORMAL_H, HEIGHT_SPRING);
    labelOp.value = withTiming(isScrolled ? 0 : 1, { duration: 200 });
  }, [isScrolled, barH, labelOp]);

  /* ── Animated styles ────────────────────────────────────── */
  const barStyle  = useAnimatedStyle(() => ({ height: barH.value }));
  const pillStyle = useAnimatedStyle(() => ({
    left:  pillCX.value - pillW.value / 2,
    width: pillW.value,
  }));
  const labelStyle = useAnimatedStyle(() => ({ opacity: labelOp.value }));

  /* ── Tab press ──────────────────────────────────────────── */
  const onTabPress = useCallback(
    (route: string, idx: number) => {
      triggerHaptic();
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
      {/* ── Glass fill ────────────────────────────────────── */}
      <View style={StyleSheet.absoluteFillObject}>
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
        {/* Cool-gray tint — no beige */}
        <View style={[StyleSheet.absoluteFillObject, styles.tint]} />
      </View>

      {/* ── Liquid pill ───────────────────────────────────── */}
      <Animated.View style={[styles.pill, pillStyle]} pointerEvents="none">
        <LinearGradient
          colors={["rgba(200,160,100,0.44)", "rgba(168,112,64,0.24)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Specular sheen */}
        <View style={styles.pillSheen} />
        {/* Trailing liquid ripple — gives "water surface" feel */}
        <View style={styles.pillRipple} />
        <View style={styles.pillRim} />
      </Animated.View>

      {/* ── Tabs ─────────────────────────────────────────── */}
      <View style={styles.row}>
        {TABS.map((tab, idx) => (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabBtn}
            onPress={() => onTabPress(tab.route, idx)}
            activeOpacity={0.80}
          >
            <TabIcon
              icon={tab.icon}
              label={tab.label}
              active={idx === activeIdx}
              labelStyle={labelStyle}
              accentColor={colors.accent}
              mutedColor={colors.mutedForeground}
            />
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}

function tabIndexFromSegments(segs: string[]): number {
  const s = segs[1] as string | undefined;
  if (s === "feed")    return 0;
  if (s === "learn")   return 2;
  if (s === "chat")    return 3;
  if (s === "profile") return 4;
  if (s === "index" || s === undefined) return 1;
  return 0;
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: SIDE_MARGIN, right: SIDE_MARGIN,
    borderRadius: 999,
    zIndex: 100,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.70)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 18,
  },
  /* Warm cream — Apple Liquid Glass, organic and airy */
  tint: { backgroundColor: "rgba(250,248,244,0.82)" },

  pill: {
    position: "absolute",
    top: PILL_INSET, bottom: PILL_INSET,
    borderRadius: 999, overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(200,160,80,0.45)",
  },
  pillSheen: {
    position: "absolute", top: 0, left: "10%", right: "10%",
    height: "46%", borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.42)",
  },
  pillRipple: {
    position: "absolute",
    bottom: "15%", left: "20%", right: "20%",
    height: "30%", borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  pillRim: {
    position: "absolute", bottom: 0,
    left: "22%", right: "22%",
    height: 1, borderRadius: 999,
    backgroundColor: "rgba(200,160,80,0.28)",
  },

  row:     { flex: 1, flexDirection: "row" },
  tabBtn:  { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 6 },
  tabContent: { alignItems: "center", gap: 2 },
  label:   { fontSize: 9, letterSpacing: 0.1 },
});
