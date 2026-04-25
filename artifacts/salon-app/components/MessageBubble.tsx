import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  text: string;
  fromMe?: boolean;
  authorName?: string;
  time?: string;
  pinned?: boolean;
};

export function MessageBubble({ text, fromMe, authorName, time, pinned }: Props) {
  const colors = useColors();

  const inner = (
    <>
      {!fromMe && authorName ? (
        <Text style={[styles.author, { color: colors.pink, fontFamily: "Inter_600SemiBold" }]}>
          {authorName}
        </Text>
      ) : null}
      <Text
        style={[
          styles.text,
          { color: fromMe ? "#FFFFFF" : colors.foreground, fontFamily: "Inter_400Regular" },
        ]}
      >
        {text}
      </Text>
      <View style={styles.metaRow}>
        {pinned ? (
          <Text
            style={[
              styles.meta,
              {
                color: fromMe ? "#FFFFFF" : colors.pink,
                fontFamily: "Inter_500Medium",
                opacity: fromMe ? 0.7 : 1,
              },
            ]}
          >
            Закреплено
          </Text>
        ) : null}
        {time ? (
          <Text
            style={[
              styles.meta,
              {
                color: fromMe ? "#FFFFFF" : colors.mutedForeground,
                fontFamily: "Inter_400Regular",
                opacity: fromMe ? 0.75 : 1,
              },
            ]}
          >
            {time}
          </Text>
        ) : null}
      </View>
    </>
  );

  return (
    <View style={[styles.row, { justifyContent: fromMe ? "flex-end" : "flex-start" }]}>
      {fromMe ? (
        <LinearGradient
          colors={[colors.pink, colors.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.bubble,
            { borderTopLeftRadius: 18, borderTopRightRadius: 4 },
          ]}
        >
          {inner}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: colors.card,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 18,
            },
          ]}
        >
          {inner}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 4 },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    gap: 4,
  },
  author: { fontSize: 11, letterSpacing: 0.1 },
  text: { fontSize: 14, lineHeight: 20 },
  metaRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  meta: { fontSize: 10, letterSpacing: 0.1 },
});
