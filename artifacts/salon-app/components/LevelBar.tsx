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
    <View style={[styles.wrap, compact ? { gap: 10 } : { gap: 14 }]}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
            УРОВЕНЬ
          </Text>
          <Text style={[styles.level, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
            {current.label}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.eyebrow, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
            БАЛЛЫ
          </Text>
          <Text style={[styles.level, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
            {points.toLocaleString("ru-RU")}
          </Text>
        </View>
      </View>

      <View style={[styles.track, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.max(2, ratio * 100)}%`,
              backgroundColor: colors.gold,
            },
          ]}
        />
      </View>

      {next ? (
        <Text style={[styles.hint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {remaining.toLocaleString("ru-RU")} баллов до уровня «{next.label}»
        </Text>
      ) : (
        <Text style={[styles.hint, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
          Высший уровень дома достигнут
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "flex-end" },
  eyebrow: { fontSize: 9, letterSpacing: 2, marginBottom: 4 },
  level: { fontSize: 22, letterSpacing: -0.4 },
  track: { height: 3, borderRadius: 0, overflow: "hidden", borderWidth: 0 },
  fill: { height: "100%" },
  hint: { fontSize: 12, letterSpacing: 0.2 },
});
