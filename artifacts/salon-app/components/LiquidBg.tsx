import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export function LiquidBg() {
  const tx1 = useSharedValue(0);
  const ty1 = useSharedValue(0);
  const s1  = useSharedValue(1);
  const tx2 = useSharedValue(0);
  const ty2 = useSharedValue(0);
  const s2  = useSharedValue(1);

  useEffect(() => {
    const ease = Easing.inOut(Easing.sin);
    tx1.value = withRepeat(withTiming(30,   { duration: 18000, easing: ease }), -1, true);
    ty1.value = withRepeat(withTiming(38,   { duration: 22000, easing: ease }), -1, true);
    s1.value  = withRepeat(withTiming(1.18, { duration: 16000, easing: ease }), -1, true);
    tx2.value = withRepeat(withTiming(-38,  { duration: 20000, easing: ease }), -1, true);
    ty2.value = withRepeat(withTiming(-30,  { duration: 17000, easing: ease }), -1, true);
    s2.value  = withRepeat(withTiming(1.22, { duration: 24000, easing: ease }), -1, true);
  }, [tx1, ty1, tx2, ty2, s1, s2]);

  const orb1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx1.value }, { translateY: ty1.value }, { scale: s1.value }],
  }));

  const orb2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx2.value }, { translateY: ty2.value }, { scale: s2.value }],
  }));

  return (
    <>
      <LinearGradient
        colors={["#FAF6EF", "#F4ECD8", "#EEE2CA", "#F3ECDA"]}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <Animated.View style={[styles.orb1, orb1Style]} />
      <Animated.View style={[styles.orb2, orb2Style]} />
    </>
  );
}

const styles = StyleSheet.create({
  orb1: {
    position: "absolute",
    top: -140,
    right: -100,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: "rgba(200,160,100,0.13)",
  },
  orb2: {
    position: "absolute",
    bottom: 160,
    left: -120,
    width: 310,
    height: 310,
    borderRadius: 155,
    backgroundColor: "rgba(176,136,80,0.09)",
  },
});
