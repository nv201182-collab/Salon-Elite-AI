/**
 * BeeRefreshIndicator — APIA-brand bee that drops from the top
 * while pull-to-refresh is active, then flies back up when done.
 *
 * Usage:
 *   const { refreshing, onRefresh, beeIndicator } = useBeeRefresh(callback);
 *   <FlatList refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="transparent" />} ... />
 *   {beeIndicator}
 */
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";
import Svg, { Ellipse, Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GOLD = "#C8A064";
const DARK = "#3A2A10";
const WING = "#D4B880";

function BeeSvg({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 1.3} viewBox="-18 -8 36 64">
      {/* Wings */}
      <Ellipse cx="-13" cy="13" rx="14" ry="8"  fill={WING} opacity="0.65" transform="rotate(-28,-13,13)" />
      <Ellipse cx="13"  cy="13" rx="14" ry="8"  fill={WING} opacity="0.65" transform="rotate(28,13,13)"  />
      <Ellipse cx="-9"  cy="22" rx="9"  ry="5"  fill={WING} opacity="0.42" transform="rotate(-20,-9,22)" />
      <Ellipse cx="9"   cy="22" rx="9"  ry="5"  fill={WING} opacity="0.42" transform="rotate(20,9,22)"   />
      {/* Body */}
      <Ellipse cx="0"   cy="36" rx="8"  ry="15" fill={GOLD} />
      <Path d="M-7,29 Q0,27 7,29" stroke={DARK} strokeWidth="2.5" fill="none" />
      <Path d="M-8,36 Q0,34 8,36" stroke={DARK} strokeWidth="2.5" fill="none" />
      <Path d="M-7,43 Q0,41 7,43" stroke={DARK} strokeWidth="2.5" fill="none" />
      {/* Head */}
      <Ellipse cx="0" cy="18" rx="7" ry="7" fill={GOLD} />
      {/* Antennae */}
      <Path d="M-2.5,11 Q-10,3 -14,-2" stroke={DARK} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <Path d="M2.5,11  Q10,3  14,-2"  stroke={DARK} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <Ellipse cx="-14" cy="-2" rx="1.8" ry="1.8" fill={DARK} />
      <Ellipse cx="14"  cy="-2" rx="1.8" ry="1.8" fill={DARK} />
    </Svg>
  );
}

type Props = { refreshing: boolean };

export function BeeRefreshIndicator({ refreshing }: Props) {
  const insets = useSafeAreaInsets();
  const topY   = insets.top + (Platform.OS === "web" ? 60 : 10);

  const slideY  = useRef(new Animated.Value(-90)).current;
  const wing    = useRef(new Animated.Value(0)).current;
  const float   = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const wingLoop = useRef<Animated.CompositeAnimation | null>(null);
  const floatLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (refreshing) {
      // Slide down
      Animated.parallel([
        Animated.spring(slideY, { toValue: topY, useNativeDriver: true, damping: 18, stiffness: 220 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      // Wing flap
      wingLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(wing, { toValue: 1, duration: 55, useNativeDriver: true, easing: Easing.linear }),
          Animated.timing(wing, { toValue: 0, duration: 55, useNativeDriver: true, easing: Easing.linear }),
        ])
      );
      wingLoop.current.start();

      // Float up/down
      floatLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(float, { toValue: 1, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
          Animated.timing(float, { toValue: 0, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        ])
      );
      floatLoop.current.start();
    } else {
      // Fly away up
      wingLoop.current?.stop();
      floatLoop.current?.stop();
      Animated.parallel([
        Animated.timing(slideY, { toValue: -90, duration: 300, useNativeDriver: true, easing: Easing.in(Easing.cubic) }),
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [refreshing]);

  const beeStyle = {
    transform: [
      { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) },
      { scaleX: wing.interpolate({ inputRange: [0, 1], outputRange: [1, 0.88] }) },
    ],
    opacity,
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: slideY }] }]}
      pointerEvents="none"
    >
      <Animated.View style={beeStyle}>
        <BeeSvg size={40} />
      </Animated.View>
    </Animated.View>
  );
}

/**
 * Hook that wires up pull-to-refresh state + bee indicator.
 * Pass a callback that performs the actual refresh (async).
 */
export function useBeeRefresh(onRefresh: () => Promise<void> | void) {
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setRefreshing(false), 1200); // min display time
    }
  };

  const beeIndicator = <BeeRefreshIndicator refreshing={refreshing} />;

  return { refreshing, handleRefresh, beeIndicator };
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 999,
    alignItems: "center",
    top: 0,
  },
});
