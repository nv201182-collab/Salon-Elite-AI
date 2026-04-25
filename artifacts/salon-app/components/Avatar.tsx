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
  const isGold = variant === "gold";
  const bg = isGold ? colors.gold : colors.secondary;
  const fg = isGold ? colors.accentForeground : colors.foreground;
  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          borderColor: isGold ? colors.goldDeep : colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: fg,
            fontSize: size * 0.36,
            fontFamily: "Inter_500Medium",
            letterSpacing: 1,
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
    borderWidth: StyleSheet.hairlineWidth,
  },
  text: {
    includeFontPadding: false,
  },
});
