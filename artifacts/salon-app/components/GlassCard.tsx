import { BlurView } from "expo-blur";
import {
  GlassContainer,
  GlassView,
  isGlassEffectAPIAvailable,
} from "expo-glass-effect";
import React from "react";
import { Platform, StyleSheet, View, ViewStyle } from "react-native";

import { PressableScale } from "./PressableScale";

const glassAvail =
  Platform.OS === "ios" && isGlassEffectAPIAvailable();

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  innerStyle?: ViewStyle;
  onPress?: () => void;
  scaleTo?: number;
  borderRadius?: number;
  tintOpacity?: number;
};

function GlassLayer({ borderRadius }: { borderRadius: number }) {
  if (Platform.OS === "web") {
    return (
      <View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(250,246,240,0.82)" }]}
      />
    );
  }
  if (glassAvail) {
    return (
      <GlassContainer style={StyleSheet.absoluteFillObject}>
        <GlassView
          style={StyleSheet.absoluteFillObject}
          glassEffectStyle="regular"
          colorScheme="light"
        />
      </GlassContainer>
    );
  }
  return (
    <BlurView
      intensity={70}
      tint="light"
      style={StyleSheet.absoluteFillObject}
    />
  );
}

export function GlassCard({
  children,
  style,
  innerStyle,
  onPress,
  scaleTo = 0.98,
  borderRadius = 22,
  tintOpacity = 0.24,
}: Props) {
  const card = (
    <View style={[styles.shadow, { borderRadius }, style]}>
      <View style={[styles.inner, { borderRadius: borderRadius - 1 }]}>
        <GlassLayer borderRadius={borderRadius - 1} />
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: `rgba(255,255,255,${tintOpacity})` },
          ]}
        />
        <View style={[styles.content, innerStyle]}>{children}</View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <PressableScale onPress={onPress} scaleTo={scaleTo}>
        {card}
      </PressableScale>
    );
  }
  return card;
}

const styles = StyleSheet.create({
  shadow: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.70)",
    shadowColor: "#8B7355",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 3,
  },
  inner: {
    overflow: "hidden",
  },
  content: {
    padding: 18,
  },
});
