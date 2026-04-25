import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
};

export function EmptyState({ icon = "circle", title, subtitle }: Props) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.icon,
          { borderColor: colors.border, backgroundColor: colors.card },
        ]}
      >
        <Feather name={icon} size={20} color={colors.gold} />
      </View>
      <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", paddingVertical: 48, paddingHorizontal: 24, gap: 12 },
  icon: {
    width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 15, letterSpacing: 0.4, textAlign: "center" },
  subtitle: { fontSize: 13, lineHeight: 19, textAlign: "center", maxWidth: 280 },
});
