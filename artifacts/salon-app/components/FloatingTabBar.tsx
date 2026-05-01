import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter, useSegments } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const beeImg = require("../assets/images/bee.png");

const TABS = [
  { name: "feed", route: "/(tabs)/feed", label: "Лента", icon: "image" as const },
  { name: "index", route: "/(tabs)/", label: "Главная", icon: "home" as const },
  { name: "learn", route: "/(tabs)/learn", label: "Обучение", icon: "book-open" as const },
  { name: "chat", route: "/(tabs)/chat", label: "Чаты", icon: "message-circle" as const },
  { name: "profile", route: "/(tabs)/profile", label: "Профиль", icon: "user" as const },
];

const TAB_BAR_HEIGHT = 64;
const BEE_SIZE = 28;
const SCREEN_W = Dimensions.get("window").width;
const TAB_W = SCREEN_W / TABS.length;

function tabIndexFromSegments(segs: string[]): number {
  const third = segs[2] as string | undefined;
  if (!third || third === "(tabs)") return 1;
  if (third === "feed") return 0;
  if (third === "learn") return 2;
  if (third === "chat") return 3;
  if (third === "profile") return 4;
  return 1;
}

function beeXForIndex(idx: number): number {
  return TAB_W * idx + TAB_W / 2 - BEE_SIZE / 2;
}

export function FloatingTabBar() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const { user } = useApp();

  const activeIdx = tabIndexFromSegments(segments as string[]);
  const prevIdx = useRef(activeIdx);

  const beeX = useSharedValue(beeXForIndex(activeIdx));
  const beeY = useSharedValue(0);
  const beeRotate = useSharedValue(0);
  const beeScale = useSharedValue(1);

  const animateBeeToIndex = useCallback(
    (toIdx: number) => {
      cancelAnimation(beeX);
      cancelAnimation(beeY);
      cancelAnimation(beeRotate);
      cancelAnimation(beeScale);

      const direction = toIdx > prevIdx.current ? 1 : -1;
      prevIdx.current = toIdx;
      const targetX = beeXForIndex(toIdx);

      beeRotate.value = withSpring(direction * 18, { damping: 7, stiffness: 220 }, () => {
        beeRotate.value = withSpring(0, { damping: 9, stiffness: 180 });
      });
      beeY.value = withSpring(-16, { damping: 5, stiffness: 280 }, () => {
        beeY.value = withSpring(0, { damping: 7, stiffness: 200 });
      });
      beeScale.value = withSpring(1.3, { damping: 5, stiffness: 300 }, () => {
        beeScale.value = withSpring(1, { damping: 7, stiffness: 220 });
      });
      beeX.value = withSpring(targetX, { damping: 13, stiffness: 170, mass: 0.75 });
    },
    [beeX, beeY, beeRotate, beeScale]
  );

  useEffect(() => {
    if (activeIdx !== prevIdx.current) {
      animateBeeToIndex(activeIdx);
    }
  }, [activeIdx, animateBeeToIndex]);

  const beeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: beeX.value },
      { translateY: beeY.value },
      { rotate: `${beeRotate.value}deg` },
      { scale: beeScale.value },
    ],
  }));

  const onPressTab = useCallback(
    (idx: number, route: string) => {
      animateBeeToIndex(idx);
      router.replace(route as never);
    },
    [animateBeeToIndex, router]
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
      <Animated.View style={[styles.bee, beeStyle]} pointerEvents="none">
        <View style={[styles.beeGlow, { backgroundColor: colors.gold }]} />
        <Image
          source={beeImg}
          style={{ width: BEE_SIZE, height: BEE_SIZE, borderRadius: BEE_SIZE / 2 }}
          contentFit="cover"
        />
      </Animated.View>

      <View style={styles.tabRow}>
        {TABS.map((tab, idx) => {
          const active = idx === activeIdx;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabBtn}
              onPress={() => onPressTab(idx, tab.route)}
              activeOpacity={0.6}
            >
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
  bee: {
    position: "absolute",
    top: -BEE_SIZE / 2 - 6,
    left: 0,
    zIndex: 102,
    alignItems: "center",
    justifyContent: "center",
  },
  beeGlow: {
    position: "absolute",
    width: BEE_SIZE + 8,
    height: BEE_SIZE + 8,
    borderRadius: (BEE_SIZE + 8) / 2,
    opacity: 0.2,
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
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.1,
  },
});
