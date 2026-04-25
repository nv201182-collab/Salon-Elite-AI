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
  row: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 20, paddingTop: 28, paddingBottom: 14 },
  eyebrow: { fontSize: 12, letterSpacing: 0.2, marginBottom: 4 },
  title: { fontSize: 22, letterSpacing: -0.3 },
  action: { fontSize: 13, letterSpacing: 0.1 },
});
