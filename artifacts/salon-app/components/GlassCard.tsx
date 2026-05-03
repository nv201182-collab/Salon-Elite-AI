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
        style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(250,248,244,0.92)" }]}
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
        {/* Specular edge — simulates physical glass top-edge reflection */}
        <View style={styles.specular} />
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(229,217,204,0.80)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  inner: {
    overflow: "hidden",
  },
  specular: {
    position: "absolute",
    top: 0,
    left: "18%",
    right: "18%",
    height: 1,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.90)",
  },
  content: {
    padding: 18,
  },
});
