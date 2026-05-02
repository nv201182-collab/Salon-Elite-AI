import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text } from "react-native";

import { useColors } from "@/hooks/useColors";
import { GlassCard } from "./GlassCard";

type Props = {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
};

export function StatCard({ label, value, hint, accent }: Props) {
  const colors = useColors();

  if (accent) {
    return (
      <LinearGradient
        colors={[colors.pink, colors.purple]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.accentCard}
      >
        <Text style={[styles.value, { color: "#FFFFFF", fontFamily: "Inter_700Bold" }]}>{value}</Text>
        <Text style={[styles.label, { color: "#FFFFFF", fontFamily: "Inter_500Medium", opacity: 0.80 }]}>{label}</Text>
        {hint ? <Text style={[styles.hint, { color: "#FFFFFF", fontFamily: "Inter_400Regular", opacity: 0.70 }]}>{hint}</Text> : null}
      </LinearGradient>
    );
  }

  return (
    <GlassCard style={{ flex: 1 }} innerStyle={styles.inner} borderRadius={22}>
      <Text style={[styles.value, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{label}</Text>
      {hint ? <Text style={[styles.hint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{hint}</Text> : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  accentCard: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 18,
    gap: 6,
    minHeight: 100,
    justifyContent: "center",
    shadowColor: "#8B6030",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },
  inner: {
    paddingVertical: 20,
    paddingHorizontal: 18,
    gap: 6,
    minHeight: 100,
    justifyContent: "center",
  },
  label: { fontSize: 10, letterSpacing: 2, textTransform: "uppercase" as const },
  value: { fontSize: 30, letterSpacing: -0.8 },
  hint: { fontSize: 11, letterSpacing: 0.2, marginTop: 2, opacity: 0.70 },
});
