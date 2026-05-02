import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { PressableScale } from "./PressableScale";

type Props = {
  eyebrow?: string;
  title: string;
  action?: { label: string; onPress: () => void };
};

export function SectionHeader({ eyebrow, title, action }: Props) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        {eyebrow ? (
          <Text style={[styles.eyebrow, { color: colors.pink, fontFamily: "Inter_500Medium" }]}>
            {eyebrow}
          </Text>
        ) : null}
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          {title}
        </Text>
      </View>
      {action ? (
        <PressableScale onPress={action.onPress} scaleTo={0.95}>
          <Text style={[styles.action, { color: colors.pink, fontFamily: "Inter_500Medium" }]}>
            {action.label}
          </Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 20, paddingTop: 32, paddingBottom: 16 },
  eyebrow: { fontSize: 10, letterSpacing: 2.5, marginBottom: 8, textTransform: "uppercase" as const },
  title: { fontSize: 26, letterSpacing: -0.7, lineHeight: 32 },
  action: { fontSize: 13, letterSpacing: 0.3, paddingBottom: 3 },
});
