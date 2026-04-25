import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";

import { useColors } from "@/hooks/useColors";

type TabSpec = {
  name: string;
  title: string;
  sf: { default: string; selected: string };
  feather: keyof typeof Feather.glyphMap;
};

const TABS: TabSpec[] = [
  {
    name: "index",
    title: "Главная",
    sf: { default: "house", selected: "house.fill" },
    feather: "home",
  },
  {
    name: "learn",
    title: "Обучение",
    sf: { default: "book", selected: "book.fill" },
    feather: "book-open",
  },
  {
    name: "feed",
    title: "Лента",
    sf: { default: "rectangle.stack", selected: "rectangle.stack.fill" },
    feather: "image",
  },
  {
    name: "chat",
    title: "Чаты",
    sf: { default: "message", selected: "message.fill" },
    feather: "message-circle",
  },
  {
    name: "profile",
    title: "Профиль",
    sf: { default: "person.crop.circle", selected: "person.crop.circle.fill" },
    feather: "user",
  },
];

function NativeTabLayout() {
  return (
    <NativeTabs>
      {TABS.map((t) => (
        <NativeTabs.Trigger key={t.name} name={t.name}>
          <Icon sf={t.sf} />
          <Label>{t.title}</Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.background },
              ]}
            />
          ),
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name={t.sf.default as never} tintColor={color} size={24} />
              ) : (
                <Feather name={t.feather} size={22} color={color} />
              ),
          }}
        />
      ))}
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
