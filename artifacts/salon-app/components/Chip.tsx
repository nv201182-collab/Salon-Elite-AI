import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { PressableScale } from "./PressableScale";

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  variant?: "default" | "gold" | "ghost";
};

export function Chip({ label, active, onPress, variant = "default" }: Props) {
  const colors = useColors();

  const isGold = variant === "gold";
  const isGhost = variant === "ghost";

  const bg = active
    ? isGold
      ? colors.gold
      : colors.foreground
    : isGhost
    ? "transparent"
    : colors.secondary;

  const fg = active
    ? isGold
      ? colors.accentForeground
      : colors.background
    : colors.foreground;

  const borderColor = isGhost
    ? colors.border
    : active
    ? "transparent"
    : colors.border;

  return (
    <PressableScale onPress={onPress} scaleTo={0.94} haptic={!!onPress}>
      <View
        style={[
          styles.chip,
          {
            backgroundColor: bg,
            borderColor,
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: fg,
              fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  text: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});
