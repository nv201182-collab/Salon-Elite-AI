import { BlurView } from "expo-blur";
import { Tabs, useRouter, useSegments } from "expo-router";
import React, { useCallback } from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/useColors";

const TABS = ["feed", "index", "learn", "chat", "profile"] as const;
type TabName = typeof TABS[number];

function tabIndexFromSegments(segs: string[]): number {
  const last = segs[segs.length - 1] as TabName;
  const idx = TABS.indexOf(last);
  return idx >= 0 ? idx : 0;
}

function haptic() {
  if (Platform.OS !== "web") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
}

export default function TabLayout() {
  const colors      = useColors();
  const colorScheme = useColorScheme();
  const isDark      = colorScheme === "dark";
  const isIOS       = Platform.OS === "ios";
  const router      = useRouter();
  const segments    = useSegments();

  const currentIdx = tabIndexFromSegments(segments);

  const navigateToTab = useCallback((idx: number) => {
    if (idx < 0 || idx >= TABS.length) return;
    haptic();
    const name = TABS[idx];
    if (name === "index") {
      router.navigate("/(tabs)/");
    } else {
      router.navigate(`/(tabs)/${name}`);
    }
  }, [router]);

  // Horizontal swipe between tabs (like Instagram)
  const swipe = Gesture.Pan()
    .activeOffsetX([-18, 18])   // must move 18px horizontally to activate
    .failOffsetY([-12, 12])     // cancel if vertical movement is dominant
    .runOnJS(true)
    .onEnd((e) => {
      const fast = Math.abs(e.velocityX) > 400;
      const far  = Math.abs(e.translationX) > 60;
      if (!fast && !far) return;

      if (e.velocityX < 0) {
        // Swipe left → next tab
        navigateToTab(currentIdx + 1);
      } else {
        // Swipe right → previous tab
        navigateToTab(currentIdx - 1);
      }
    });

  return (
    <GestureDetector gesture={swipe}>
      <View style={{ flex: 1 }}>
        <Tabs
          initialRouteName="feed"
          screenOptions={{
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.mutedForeground,
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: { display: "none" },
            tabBarBackground: () =>
              isIOS ? (
                <BlurView
                  intensity={100}
                  tint={isDark ? "dark" : "light"}
                  style={StyleSheet.absoluteFill}
                />
              ) : (
                <View
                  style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}
                />
              ),
          }}
        >
          <Tabs.Screen name="feed"    options={{ title: "Лента" }} />
          <Tabs.Screen name="index"   options={{ title: "Главная" }} />
          <Tabs.Screen name="learn"   options={{ title: "Развитие" }} />
          <Tabs.Screen name="chat"    options={{ title: "Чаты" }} />
          <Tabs.Screen name="profile" options={{ title: "Профиль" }} />
        </Tabs>
      </View>
    </GestureDetector>
  );
}
