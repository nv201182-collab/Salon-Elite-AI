import { Image } from "expo-image";
import React, { useEffect } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  useDerivedValue,
} from "react-native-reanimated";

const beeImg = require("../assets/images/bee.png");

const GOLD = "#C9A96E";
const BG = "#FAF8F4";
const DARK = "#0E1A2B";

type Props = {
  size?: number;
  fullscreen?: boolean;
  style?: ViewStyle;
  /** Прогресс 0–100. Если не задан — автоматически анимируется до 100 */
  progress?: number;
};

export function BeeLoader({ size = 72, fullscreen = true, style, progress }: Props) {
  const t = useSharedValue(0);
  const wing = useSharedValue(0);
  const float = useSharedValue(0);
  const progressAnim = useSharedValue(0);

  // Полёт пчелы
  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 3800, easing: Easing.inOut(Easing.sin) }),
      -1,
      false
    );
    wing.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 65 }),
        withTiming(0, { duration: 65 })
      ),
      -1,
      true
    );
    float.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    return () => {
      cancelAnimation(t);
      cancelAnimation(wing);
      cancelAnimation(float);
    };
  }, []);

  // Прогресс
  useEffect(() => {
    if (progress !== undefined) {
      progressAnim.value = withTiming(progress, { duration: 280 });
    } else {
      progressAnim.value = withTiming(95, { duration: 2200, easing: Easing.out(Easing.quad) });
    }
  }, [progress]);

  const beeStyle = useAnimatedStyle(() => {
    "worklet";
    const angle = t.value * Math.PI * 2;
    const tx = Math.cos(angle) * 84;
    const ty = Math.sin(angle * 2) * 28 + (float.value - 0.5) * 10;
    const rotate = `${Math.cos(angle) * 18}deg`;
    const sc = 0.93 + wing.value * 0.09;
    return { transform: [{ translateX: tx }, { translateY: ty }, { rotate }, { scale: sc }] };
  });

  const trail1Style = useAnimatedStyle(() => {
    "worklet";
    const angle = t.value * Math.PI * 2;
    return {
      transform: [
        { translateX: Math.cos(angle - 0.45) * 84 },
        { translateY: Math.sin((angle - 0.45) * 2) * 28 },
      ],
      opacity: 0.14 + Math.abs(Math.sin(angle * 2)) * 0.2,
    };
  });

  const trail2Style = useAnimatedStyle(() => {
    "worklet";
    const angle = t.value * Math.PI * 2;
    return {
      transform: [
        { translateX: Math.cos(angle - 0.9) * 84 },
        { translateY: Math.sin((angle - 0.9) * 2) * 28 },
        { scale: 0.52 },
      ],
      opacity: 0.07 + Math.abs(Math.sin(angle * 2)) * 0.12,
    };
  });

  const progressBarStyle = useAnimatedStyle(() => {
    "worklet";
    return { width: `${Math.min(progressAnim.value, 100)}%` as any };
  });

  const percentText = useDerivedValue(() => `${Math.round(progressAnim.value)} %`);

  const stageW = size * 3.4;
  const stageH = size * 1.9;

  const content = (
    <View style={styles.wrapper}>
      {/* Логотип */}
      <View style={styles.logoBlock}>
        <Text style={styles.logoText}>APIA</Text>
        <View style={styles.taglineRow}>
          {["ARCHITECTURE", "PEOPLE", "INTELLIGENCE", "ACTION"].map((w, i) => (
            <React.Fragment key={w}>
              {i > 0 && <View style={styles.taglineDot} />}
              <Text style={styles.taglineWord}>{w}</Text>
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Арена полёта */}
      <View style={{ width: stageW, height: stageH, alignItems: "center", justifyContent: "center" }}>
        <Animated.View style={[styles.trailCircle, { width: size * 0.72, height: size * 0.72, borderRadius: size * 0.36 }, trail2Style]} />
        <Animated.View style={[styles.trailCircle, { width: size * 0.86, height: size * 0.86, borderRadius: size * 0.43 }, trail1Style]} />
        <Animated.View style={beeStyle}>
          <View style={[styles.beeBubble, { width: size, height: size, borderRadius: size / 2 }]}>
            <Image
              source={beeImg}
              style={{ width: size * 0.76, height: size * 0.76, borderRadius: (size * 0.76) / 2 }}
              contentFit="cover"
            />
          </View>
        </Animated.View>
      </View>

      {/* Прогресс */}
      <View style={styles.progressBlock}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressBarStyle]} />
        </View>
        <Animated.Text style={styles.percentLabel}>
          {percentText.value}
        </Animated.Text>
      </View>
    </View>
  );

  if (!fullscreen) {
    return <View style={[{ alignItems: "center", justifyContent: "center" }, style]}>{content}</View>;
  }

  return (
    <View style={[styles.screen, style]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  wrapper: {
    alignItems: "center",
    gap: 0,
  },
  // Логотип
  logoBlock: {
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  logoText: {
    fontSize: 62,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 20,
    color: DARK,
  },
  taglineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  taglineWord: {
    fontSize: 8.5,
    letterSpacing: 1.1,
    fontFamily: "Inter_500Medium",
    color: GOLD,
  },
  taglineDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: GOLD,
  },
  // Пчела
  trailCircle: {
    position: "absolute",
    backgroundColor: GOLD + "1A",
  },
  beeBubble: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: GOLD,
    shadowOpacity: 0.38,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  // Прогресс
  progressBlock: {
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  progressTrack: {
    width: 210,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: GOLD + "33",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: GOLD,
    borderRadius: 1,
  },
  percentLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 2.5,
    color: GOLD,
  },
});
