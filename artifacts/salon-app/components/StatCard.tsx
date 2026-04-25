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
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: accent ? colors.gold : colors.card,
          borderColor: accent ? colors.gold : colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: accent ? colors.accentForeground : colors.mutedForeground,
            fontFamily: "Inter_500Medium",
          },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.value,
          {
            color: accent ? colors.accentForeground : colors.foreground,
            fontFamily: "Inter_500Medium",
          },
        ]}
      >
        {value}
      </Text>
      {hint ? (
        <Text
          style={[
            styles.hint,
            {
              color: accent ? colors.accentForeground : colors.mutedForeground,
              fontFamily: "Inter_400Regular",
              opacity: accent ? 0.75 : 1,
            },
          ]}
        >
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 16,
    paddingHorizontal: 14,
    gap: 4,
    minHeight: 90,
    justifyContent: "space-between",
  },
  label: { fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase" },
  value: { fontSize: 26, letterSpacing: -0.6 },
  hint: { fontSize: 11, letterSpacing: 0.2 },
});
