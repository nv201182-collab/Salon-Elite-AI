import { Image } from "expo-image";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";

const beeImg = require("../assets/images/bee.png");

type Props = {
  size?: number;
  caption?: string | null;
  fullscreen?: boolean;
  style?: ViewStyle;
};

export function BeeLoader({ size = 64, caption = "Минутку…", fullscreen = true, style }: Props) {
  const colors = useColors();
  const t = useSharedValue(0);
  const wing = useSharedValue(0);
  const float = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
      -1,
      false
    );
    wing.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 80 }),
        withTiming(0, { duration: 80 })
      ),
      -1,
      true
    );
    float.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    return () => {
      cancelAnimation(t);
      cancelAnimation(wing);
      cancelAnimation(float);
    };
  }, [t, wing, float]);

  const beeStyle = useAnimatedStyle(() => {
    const angle = t.value * Math.PI * 2;
    const radiusX = 70;
    const radiusY = 22;
    const tx = Math.cos(angle) * radiusX;
    const ty = Math.sin(angle * 2) * radiusY + (float.value - 0.5) * 8;
    const rotate = `${Math.cos(angle) * 14}deg`;
    const scale = 0.96 + wing.value * 0.06;
    return {
      transform: [
        { translateX: tx },
        { translateY: ty },
        { rotate },
        { scale },
      ],
    };
  });

  const trailStyle = useAnimatedStyle(() => {
    const angle = t.value * Math.PI * 2;
    const tx = Math.cos(angle - 0.4) * 70;
    const ty = Math.sin((angle - 0.4) * 2) * 22;
    return {
      transform: [{ translateX: tx }, { translateY: ty }],
      opacity: 0.18 + Math.abs(Math.sin(angle * 2)) * 0.25,
    };
  });

  const trail2Style = useAnimatedStyle(() => {
    const angle = t.value * Math.PI * 2;
    const tx = Math.cos(angle - 0.8) * 70;
    const ty = Math.sin((angle - 0.8) * 2) * 22;
    return {
      transform: [{ translateX: tx }, { translateY: ty }, { scale: 0.6 }],
      opacity: 0.1 + Math.abs(Math.sin(angle * 2)) * 0.18,
    };
  });

  const dotStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + Math.abs(Math.sin(t.value * Math.PI * 4)) * 0.6,
  }));

  const stage = useMemo(
    () => ({
      width: size * 3,
      height: size * 1.6,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    }),
    [size]
  );

  const Body = (
    <View style={{ alignItems: "center", gap: 18 }}>
      <View style={stage}>
        <Animated.View
          style={[
            styles.trail,
            {
              width: size * 0.72,
              height: size * 0.72,
              borderRadius: size * 0.36,
              backgroundColor: colors.pinkSoft,
            },
            trail2Style,
          ]}
        />
        <Animated.View
          style={[
            styles.trail,
            {
              width: size * 0.84,
              height: size * 0.84,
              borderRadius: size * 0.42,
              backgroundColor: colors.pinkSoft,
            },
            trailStyle,
          ]}
        />
        <Animated.View style={beeStyle}>
          <View
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.card,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: colors.gold,
              shadowOpacity: 0.35,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 6 },
              elevation: 6,
            }}
          >
            <Image
              source={beeImg}
              style={{ width: size * 0.78, height: size * 0.78, borderRadius: (size * 0.78) / 2 }}
              contentFit="cover"
            />
          </View>
        </Animated.View>
      </View>
      {caption ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Animated.View
            style={[styles.dot, { backgroundColor: colors.gold }, dotStyle]}
          />
          <Text
            style={{
              color: colors.mutedForeground,
              fontFamily: "Inter_500Medium",
              fontSize: 13,
              letterSpacing: 1.6,
              textTransform: "uppercase",
            }}
          >
            {caption}
          </Text>
          <Animated.View
            style={[styles.dot, { backgroundColor: colors.gold }, dotStyle]}
          />
        </View>
      ) : null}
    </View>
  );

  if (!fullscreen) {
    return <View style={[{ alignItems: "center", justifyContent: "center" }, style]}>{Body}</View>;
  }

  return (
    <View
      style={[
        styles.fullscreen,
        { backgroundColor: colors.background },
        style,
      ]}
    >
      {Body}
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  trail: {
    position: "absolute",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
