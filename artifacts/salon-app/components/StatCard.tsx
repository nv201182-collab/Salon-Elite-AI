import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
};

export function StatCard({ label, value, hint, accent }: Props) {
  const colors = useColors();

  const content = (
    <>
      <Text
        style={[
          styles.value,
          {
            color: accent ? "#FFFFFF" : colors.foreground,
            fontFamily: "Inter_600SemiBold",
          },
        ]}
      >
        {value}
      </Text>
      <Text
        style={[
          styles.label,
          {
            color: accent ? "#FFFFFF" : colors.mutedForeground,
            fontFamily: "Inter_500Medium",
            opacity: accent ? 0.85 : 1,
          },
        ]}
      >
        {label}
      </Text>
      {hint ? (
        <Text
          style={[
            styles.hint,
            {
              color: accent ? "#FFFFFF" : colors.mutedForeground,
              fontFamily: "Inter_400Regular",
              opacity: accent ? 0.75 : 1,
            },
          ]}
        >
          {hint}
        </Text>
      ) : null}
    </>
  );

  if (accent) {
    return (
      <LinearGradient
        colors={[colors.pink, colors.purple]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {content}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 4,
    minHeight: 96,
    justifyContent: "center",
  },
  label: { fontSize: 12, letterSpacing: 0.1 },
  value: { fontSize: 28, letterSpacing: -0.6 },
  hint: { fontSize: 11, letterSpacing: 0.1, marginTop: 2 },
});
