import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import {
  GlassContainer,
  GlassView,
  isGlassEffectAPIAvailable,
} from "expo-glass-effect";
import { useRouter, useSegments } from "expo-router";
import React, { useCallback } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const TABS = [
  { name: "feed",    route: "/(tabs)/feed",    label: "Лента",    icon: "image"          as const },
  { name: "index",   route: "/(tabs)/",        label: "Главная",  icon: "home"           as const },
  { name: "learn",   route: "/(tabs)/learn",   label: "Обучение", icon: "book-open"      as const },
  { name: "chat",    route: "/(tabs)/chat",    label: "Чаты",     icon: "message-circle" as const },
  { name: "profile", route: "/(tabs)/profile", label: "Профиль",  icon: "user"           as const },
];

const TAB_BAR_HEIGHT = 64;

function tabIndexFromSegments(segs: string[]): number {
  const seg = segs[1] as string | undefined;
  if (!seg) return 1;
  if (seg === "feed")    return 0;
  if (seg === "learn")   return 2;
  if (seg === "chat")    return 3;
  if (seg === "profile") return 4;
  return 1;
}

const glassAvailable =
  Platform.OS === "ios" && isGlassEffectAPIAvailable();

export function FloatingTabBar() {
  const colors   = useColors();
  const insets   = useSafeAreaInsets();
  const router   = useRouter();
  const segments = useSegments();
  const { user } = useApp();

  const activeIdx = tabIndexFromSegments(segments as string[]);

  const onPressTab = useCallback(
    (route: string) => { router.replace(route as never); },
    [router],
  );

  if (!user) return null;

  const bottomPad = insets.bottom > 0 ? insets.bottom : 10;
  const barHeight = TAB_BAR_HEIGHT + bottomPad;

  const tabRow = (
    <View style={styles.tabRow}>
      {TABS.map((tab, idx) => {
        const active = idx === activeIdx;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabBtn}
            onPress={() => onPressTab(tab.route)}
            activeOpacity={0.6}
          >
            {active && (
              <View
                style={[styles.activeLine, { backgroundColor: colors.accent }]}
              />
            )}
            <Feather
              name={tab.icon}
              size={22}
              color={active ? colors.accent : colors.mutedForeground}
            />
            <Text
              style={[
                styles.tabLabel,
                {
                  color: active ? colors.accent : colors.mutedForeground,
                  fontFamily: active ? "Inter_600SemiBold" : "Inter_400Regular",
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (glassAvailable) {
    return (
      <GlassContainer
        style={[styles.container, { height: barHeight, paddingBottom: bottomPad }]}
      >
        <GlassView
          style={StyleSheet.absoluteFillObject}
          glassEffectStyle="regular"
          colorScheme="light"
        />
        <View style={[styles.topBorder, { backgroundColor: colors.border }]} />
        {tabRow}
      </GlassContainer>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { height: barHeight, paddingBottom: bottomPad },
      ]}
    >
      <BlurView
        intensity={85}
        tint="light"
        style={StyleSheet.absoluteFillObject}
      />
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: "rgba(248,243,236,0.55)" },
        ]}
      />
      <View style={[styles.topBorder, { backgroundColor: colors.border }]} />
      {tabRow}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    elevation: 8,
    overflow: "hidden",
  },
  topBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  tabRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    gap: 3,
    position: "relative",
  },
  activeLine: {
    position: "absolute",
    top: 0,
    width: 24,
    height: 2,
    borderRadius: 1,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.1,
  },
});
