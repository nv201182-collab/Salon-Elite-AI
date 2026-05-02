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
          { backgroundColor: "rgba(255,252,247,0.85)" },
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
  container: { alignItems: "center", justifyContent: "center", paddingVertical: 64, paddingHorizontal: 24, gap: 16 },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
    shadowColor: "#7A6030",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 14,
    elevation: 3,
  },
  title: { fontSize: 16, letterSpacing: -0.2, textAlign: "center" },
  subtitle: { fontSize: 13, lineHeight: 20, textAlign: "center", maxWidth: 280, opacity: 0.68 },
});
