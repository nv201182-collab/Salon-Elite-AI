import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  initials: string;
  size?: number;
  variant?: "default" | "gold";
};

export function Avatar({ initials, size = 40, variant = "default" }: Props) {
  const colors = useColors();
  const isAccent = variant === "gold";

  if (isAccent) {
    return (
      <LinearGradient
        colors={[colors.pink, colors.purple]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.base,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: "#FFFFFF",
              fontSize: size * 0.36,
              fontFamily: "Inter_600SemiBold",
            },
          ]}
        >
          {initials.slice(0, 2).toUpperCase()}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.secondary,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.foreground,
            fontSize: size * 0.36,
            fontFamily: "Inter_600SemiBold",
          },
        ]}
      >
        {initials.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    includeFontPadding: false,
    letterSpacing: 0.3,
  },
});
