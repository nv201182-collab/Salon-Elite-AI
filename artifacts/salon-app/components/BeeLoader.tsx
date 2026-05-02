import React, { useEffect } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Ellipse, Path } from "react-native-svg";

import { ApiaLogo } from "./ApiaLogo";

const GOLD = "#B78F4E";
const DARK = "#3A2A10";
const WING = "#C9A070";
const BG   = "#EDE8E1";

function BeeSvgIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 1.4} viewBox="-20 -10 40 70">
      <Ellipse cx="-14" cy="14" rx="15" ry="9" fill={WING} opacity="0.6" transform="rotate(-28,-14,14)" />
      <Ellipse cx="14"  cy="14" rx="15" ry="9" fill={WING} opacity="0.6" transform="rotate(28,14,14)"  />
      <Ellipse cx="-10" cy="24" rx="10" ry="6" fill={WING} opacity="0.4" transform="rotate(-20,-10,24)" />
      <Ellipse cx="10"  cy="24" rx="10" ry="6" fill={WING} opacity="0.4" transform="rotate(20,10,24)"  />
      <Ellipse cx="0"   cy="38" rx="9"  ry="17" fill={GOLD} />
      <Path d="M-8,31 Q0,29 8,31"  stroke={DARK} strokeWidth="3" fill="none" />
      <Path d="M-9,38 Q0,36 9,38"  stroke={DARK} strokeWidth="3" fill="none" />
      <Path d="M-8,45 Q0,43 8,45"  stroke={DARK} strokeWidth="3" fill="none" />
      <Ellipse cx="0"  cy="19" rx="8" ry="8" fill={GOLD} />
      <Path d="M-3,12 Q-12,4 -16,-2" stroke={DARK} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <Path d="M3,12  Q12,4  16,-2"  stroke={DARK} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <Ellipse cx="-16" cy="-2" rx="1.8" ry="1.8" fill={DARK} />
      <Ellipse cx="16"  cy="-2" rx="1.8" ry="1.8" fill={DARK} />
    </Svg>
  );
}

type Props = {
  size?: number;
  fullscreen?: boolean;
  style?: ViewStyle;
  progress?: number;
};

export function BeeLoader({ size = 50, fullscreen = true, style }: Props) {
  const t     = useSharedValue(0);
  const wing  = useSharedValue(0);
  const float = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 4400, easing: Easing.inOut(Easing.sin) }),
      -1, false
    );
    wing.value = withRepeat(
      withSequence(withTiming(1, { duration: 58 }), withTiming(0, { duration: 58 })),
      -1, true
    );
    float.value = withRepeat(
      withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
      -1, true
    );
    return () => {
      cancelAnimation(t);
      cancelAnimation(wing);
      cancelAnimation(float);
    };
  }, []);

  const beeStyle = useAnimatedStyle(() => {
    "worklet";
    const angle = t.value * Math.PI * 2;
    const tx = Math.cos(angle) * 165;
    const ty = Math.sin(angle) * 52 + (float.value - 0.5) * 14;
    const rotate = `${Math.cos(angle) * 22}deg`;
    const sc = 0.92 + wing.value * 0.1;
    return {
      transform: [{ translateX: tx }, { translateY: ty }, { rotate }, { scale: sc }],
    };
  });

  const inner = (
    <View style={styles.inner}>
      <ApiaLogo width={300} />
      <Animated.View style={[styles.bee, beeStyle]} pointerEvents="none">
        <BeeSvgIcon size={size} />
      </Animated.View>
    </View>
  );

  if (!fullscreen) {
    return <View style={[{ alignItems: "center", justifyContent: "center" }, style]}>{inner}</View>;
  }
  return <View style={[styles.screen, style]}>{inner}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    alignItems: "center",
    justifyContent: "center",
  },
  bee: {
    position: "absolute",
  },
});
