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
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { useTabBar } from "@/contexts/TabBarContext";
import { useColors } from "@/hooks/useColors";

const TABS = [
  { name: "feed",    route: "/(tabs)/feed",    label: "Лента",    icon: "image"          as const },
  { name: "index",   route: "/(tabs)/",        label: "Главная",  icon: "home"           as const },
  { name: "learn",   route: "/(tabs)/learn",   label: "Обучение", icon: "book-open"      as const },
  { name: "chat",    route: "/(tabs)/chat",    label: "Чаты",     icon: "message-circle" as const },
  { name: "profile", route: "/(tabs)/profile", label: "Профиль",  icon: "user"           as const },
];

const NORMAL_H = 64;
const COMPACT_H = 48;
const glassAvail = Platform.OS === "ios" && isGlassEffectAPIAvailable();

function tabIndexFromSegments(segs: string[]): number {
  const seg = segs[1] as string | undefined;
  if (!seg) return 1;
  if (seg === "feed")    return 0;
  if (seg === "learn")   return 2;
  if (seg === "chat")    return 3;
  if (seg === "profile") return 4;
  return 1;
}

export function FloatingTabBar() {
  const colors   = useColors();
  const insets   = useSafeAreaInsets();
  const router   = useRouter();
  const segments = useSegments();
  const { user } = useApp();
  const { isScrolled } = useTabBar();

  const activeIdx = tabIndexFromSegments(segments as string[]);

  const onPressTab = useCallback(
    (route: string) => { router.replace(route as never); },
    [router],
  );

  const barH    = useRef(new Animated.Value(NORMAL_H)).current;
  const labelOp = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const spring = (val: Animated.Value, to: number, useND: boolean) =>
      Animated.spring(val, {
        toValue: to,
        damping: 22,
        stiffness: 280,
        mass: 0.8,
        useNativeDriver: useND && Platform.OS !== "web",
      });

    Animated.parallel([
      spring(barH,    isScrolled ? COMPACT_H : NORMAL_H, false),
      spring(labelOp, isScrolled ? 0          : 1,        true),
    ]).start();
  }, [isScrolled, barH, labelOp]);

  if (!user) return null;

  const bottomOffset = (insets.bottom > 0 ? insets.bottom : 8) + 12;

  return (
    <Animated.View
      style={[
        styles.container,
        { bottom: bottomOffset, height: barH },
      ]}
    >
      {/* Glass background */}
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
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((tab, idx) => {
          const active = idx === activeIdx;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabBtn}
              onPress={() => onPressTab(tab.route)}
              activeOpacity={0.65}
            >
              {active && (
                <View
                  style={[
                    styles.activePill,
                    {
                      backgroundColor: "rgba(200,160,100,0.18)",
                      borderColor: "rgba(200,160,100,0.38)",
                    },
                  ]}
                />
              )}
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
                    opacity: labelOp,
                  },
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
    left: 20,
    right: 20,
    borderRadius: 999,
    zIndex: 100,
    shadowColor: "#6B5A3E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
  },
  glassClip: {
    borderRadius: 999,
    overflow: "hidden",
  },
  overlay: {
    backgroundColor: "rgba(250,246,240,0.48)",
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
    position: "relative",
    paddingVertical: 6,
  },
  activePill: {
    ...StyleSheet.absoluteFillObject,
    margin: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  tabLabel: {
    fontSize: 9,
    letterSpacing: 0.1,
  },
});
