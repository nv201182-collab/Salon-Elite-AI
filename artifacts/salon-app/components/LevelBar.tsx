import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { getLevel, LEVELS } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

type Props = {
  points: number;
  compact?: boolean;
};

export function LevelBar({ points, compact }: Props) {
  const colors = useColors();
  const current = getLevel(points);
  const span = current.max - current.min;
  const ratio = Math.min(1, Math.max(0, (points - current.min) / span));
  const nextIndex = LEVELS.indexOf(current) + 1;
  const next = LEVELS[nextIndex];
  const remaining = next ? next.min - points : 0;

  return (
    <View style={[styles.wrap, compact ? { gap: 12 } : { gap: 16 }]}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            Уровень
          </Text>
          <Text style={[styles.level, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            {current.label}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            Баллы
          </Text>
          <Text style={[styles.level, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            {points.toLocaleString("ru-RU")}
          </Text>
        </View>
      </View>

      <View style={[styles.track, { backgroundColor: colors.muted }]}>
        <LinearGradient
          colors={[colors.pink, colors.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.fill,
            {
              width: `${Math.max(3, ratio * 100)}%`,
              shadowColor: colors.pink,
              shadowOffset: { width: 4, height: 0 },
              shadowOpacity: 0.55,
              shadowRadius: 10,
              elevation: 3,
            },
          ]}
        />
      </View>

      {next ? (
        <Text style={[styles.hint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Ещё {remaining.toLocaleString("ru-RU")} баллов до уровня «{next.label}»
        </Text>
      ) : (
        <Text style={[styles.hint, { color: colors.pink, fontFamily: "Inter_500Medium" }]}>
          Высший уровень дома достигнут
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  headerRow: { flexDirection: "row", alignItems: "flex-end" },
  eyebrow: { fontSize: 12, letterSpacing: 0.1, marginBottom: 4 },
  level: { fontSize: 22, letterSpacing: -0.4 },
  track: { height: 4, borderRadius: 2, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 2 },
  hint: { fontSize: 12, letterSpacing: 0.1 },
});
