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
          { backgroundColor: colors.card },
        ]}
      >
        <Feather name={icon} size={22} color={colors.pink} />
      </View>
      <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
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
  container: { alignItems: "center", justifyContent: "center", paddingVertical: 56, paddingHorizontal: 24, gap: 14 },
  icon: {
    width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 16, letterSpacing: 0.1, textAlign: "center" },
  subtitle: { fontSize: 13, lineHeight: 19, textAlign: "center", maxWidth: 280 },
});
