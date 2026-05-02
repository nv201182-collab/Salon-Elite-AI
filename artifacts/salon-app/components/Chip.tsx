import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

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

  if (active) {
    return (
      <PressableScale onPress={onPress} scaleTo={0.94} haptic={!!onPress}>
        <View style={[styles.chip, {
          backgroundColor: colors.accent,
          shadowColor: colors.gold,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.40,
          shadowRadius: 10,
          elevation: 5,
        }]}>
          <Text style={[styles.text, { color: "#FFFFFF", fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 }]}>
            {label}
          </Text>
        </View>
      </PressableScale>
    );
  }

  return (
    <PressableScale onPress={onPress} scaleTo={0.94} haptic={!!onPress}>
      <View style={[styles.chip, styles.glassChip]}>
        {Platform.OS !== "web" && (
          <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFillObject} />
        )}
        <View style={[StyleSheet.absoluteFillObject, styles.chipOverlay]} />
        <Text style={[styles.text, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
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
    overflow: "hidden",
  },
  glassChip: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.75)",
    shadowColor: "#7A6030",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 2,
  },
  chipOverlay: {
    backgroundColor: "rgba(255,255,255,0.48)",
  },
  text: {
    fontSize: 13,
    letterSpacing: 0.2,
    position: "relative",
  },
});
