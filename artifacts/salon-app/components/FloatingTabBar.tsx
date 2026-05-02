import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
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

/* ─── Layout constants ─────────────────────────────────────── */
const SIDE_MARGIN = 20;
const PILL_PAD    = 6;
const PILL_INSET  = 5;
const NORMAL_H    = 64;
const COMPACT_H   = 48;

/* ─── Spring configs — water-like, slow and graceful ──────── */
/** Pill center glides with gentle overshoot */
const POS_SPRING  = { damping: 22, stiffness: 160, mass: 1.1 };
/** Stretch inflates languidly */
const STRETCH_IN  = { damping: 7,  stiffness: 220, mass: 0.9 };
/** Settle back softly, like a droplet landing */
const STRETCH_OUT = { damping: 13, stiffness: 130, mass: 1.4 };
/** Bar height collapse */
const HEIGHT_SPRING = { damping: 26, stiffness: 240, mass: 0.9 };

const glassAvail = Platform.OS === "ios" && isGlassEffectAPIAvailable();

function tabIndexFromSegments(segs: string[]): number {
  const s = segs[1] as string | undefined;
  if (s === "feed")    return 0;
  if (s === "learn")   return 2;
  if (s === "chat")    return 3;
  if (s === "profile") return 4;
  if (s === "index" || s === undefined) return 1;
  return 0;
}

/* ─── Per-tab icon animated wrapper ────────────────────────── */
type TabIconProps = {
  icon: (typeof TABS)[number]["icon"];
  label: string;
  active: boolean;
  labelStyle: object;
  accentColor: string;
  mutedColor: string;
};

function TabIcon({ icon, label, active, labelStyle, accentColor, mutedColor }: TabIconProps) {
  const scale   = useSharedValue(active ? 1 : 0.88);
  const opacity = useSharedValue(active ? 1 : 0.6);

  useEffect(() => {
    scale.value   = withSpring(active ? 1 : 0.88, { damping: 16, stiffness: 260, mass: 0.7 });
    opacity.value = withTiming(active ? 1 : 0.6, { duration: 220, easing: Easing.out(Easing.quad) });
  }, [active, scale, opacity]);

  const iconWrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.tabContent}>
      <Animated.View style={iconWrapStyle}>
        <Feather
          name={icon}
          size={22}
          color={active ? accentColor : mutedColor}
        />
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
    /* Stretch proportional to distance traveled — more graceful for long jumps */
    const extra = Math.min(dist * tw * 0.35, tw * 0.8);

    pillCX.value = withSpring(toIdx * tw + tw / 2, POS_SPRING);
    pillW.value  = withSequence(
      withSpring(natW + extra, STRETCH_IN),
      withSpring(natW, STRETCH_OUT),
    );
  }, [pillCX, pillW]);

  /* Sync pill when routing changes outside of tap */
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
  const barStyle   = useAnimatedStyle(() => ({ height: barH.value }));
  const pillStyle  = useAnimatedStyle(() => ({
    left:  pillCX.value - pillW.value / 2,
    width: pillW.value,
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
    <Animated.View style={[styles.wrapper, { bottom: bottomOffset }, barStyle]}>
      {/* ── Glass / blur fill ─────────────────────────────── */}
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
          <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFillObject} />
        )}
        <View style={[StyleSheet.absoluteFillObject, styles.tint]} />
      </View>

      {/* ── Liquid pill ───────────────────────────────────── */}
      <Animated.View style={[styles.pill, pillStyle]} pointerEvents="none">
        <LinearGradient
          colors={["rgba(212,172,108,0.48)", "rgba(185,145,80,0.28)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Specular sheen at top */}
        <View style={styles.pillSheen} />
        {/* Bottom rim — adds glass depth */}
        <View style={styles.pillRim} />
      </Animated.View>

      {/* ── Tab buttons ──────────────────────────────────── */}
      <View style={styles.row}>
        {TABS.map((tab, idx) => (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabBtn}
            onPress={() => onTabPress(tab.route, idx)}
            activeOpacity={0.75}
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

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: SIDE_MARGIN,
    right: SIDE_MARGIN,
    borderRadius: 999,
    zIndex: 100,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 18,
  },
  glassWrap: { ...StyleSheet.absoluteFillObject },
  tint: { backgroundColor: "rgba(255,255,255,0.72)" },
  pill: {
    position: "absolute",
    top: PILL_INSET,
    bottom: PILL_INSET,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(200,160,90,0.50)",
  },
  pillSheen: {
    position: "absolute",
    top: 0,
    left: "12%",
    right: "12%",
    height: "44%",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.38)",
  },
  pillRim: {
    position: "absolute",
    bottom: 0,
    left: "20%",
    right: "20%",
    height: 1,
    borderRadius: 999,
    backgroundColor: "rgba(200,160,90,0.30)",
  },
  row: { flex: 1, flexDirection: "row" },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  tabContent: { alignItems: "center", gap: 2 },
  label: { fontSize: 9, letterSpacing: 0.1 },
});
