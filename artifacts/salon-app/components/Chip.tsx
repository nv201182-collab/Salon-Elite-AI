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

  const isGhost = variant === "ghost";

  const bg = active
    ? colors.pink
    : isGhost
    ? "transparent"
    : colors.secondary;

  const fg = active ? "#FFFFFF" : colors.foreground;

  return (
    <PressableScale onPress={onPress} scaleTo={0.94} haptic={!!onPress}>
      <View style={[styles.chip, { backgroundColor: bg }]}>
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
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  text: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
});
