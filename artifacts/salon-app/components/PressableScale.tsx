import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import { Animated, Platform, Pressable, type PressableProps, type ViewStyle } from "react-native";

type Props = PressableProps & {
  haptic?: boolean;
  style?: ViewStyle | ViewStyle[];
  scaleTo?: number;
};

export function PressableScale({ children, haptic = true, style, scaleTo = 0.97, onPressIn, onPressOut, onPress, disabled, ...rest }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handleIn = (e: Parameters<NonNullable<PressableProps["onPressIn"]>>[0]) => {
    Animated.spring(scale, {
      toValue: scaleTo,
      useNativeDriver: true,
      friction: 8,
      tension: 200,
    }).start();
    onPressIn?.(e);
  };

  const handleOut = (e: Parameters<NonNullable<PressableProps["onPressOut"]>>[0]) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 200,
    }).start();
    onPressOut?.(e);
  };

  const handlePress = (e: Parameters<NonNullable<PressableProps["onPress"]>>[0]) => {
    if (haptic && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress?.(e);
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        {...rest}
        disabled={disabled}
        onPressIn={handleIn}
        onPressOut={handleOut}
        onPress={handlePress}
        style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]}
      >
        {children as React.ReactNode}
      </Pressable>
    </Animated.View>
  );
}
