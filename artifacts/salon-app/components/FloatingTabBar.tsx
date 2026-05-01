import { Feather } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import React, { useCallback } from "react";
import {
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
  const third = segs[2] as string | undefined;
  if (!third || third === "(tabs)") return 1;
  if (third === "feed")    return 0;
  if (third === "learn")   return 2;
  if (third === "chat")    return 3;
  if (third === "profile") return 4;
  return 1;
}

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

  return (
    <View
      style={[
        styles.container,
        {
          height: barHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: bottomPad,
        },
      ]}
    >
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
                  style={[
                    styles.activeDot,
                    { backgroundColor: colors.accent },
                  ]}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    zIndex: 100,
    elevation: 8,
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
  activeDot: {
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
