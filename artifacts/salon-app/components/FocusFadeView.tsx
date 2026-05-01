/**
 * Wraps a tab screen so it fades in elegantly whenever it becomes focused.
 * Duration is short (240ms) — just enough to feel intentional, not slow.
 */
import { useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

export function FocusFadeView({ style, children }: Props) {
  const opacity = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      opacity.value = 0;
      opacity.value = withTiming(1, {
        duration: 240,
        easing: Easing.out(Easing.cubic),
      });
    }, [opacity])
  );

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[style, animStyle]}>
      {children}
    </Animated.View>
  );
}
