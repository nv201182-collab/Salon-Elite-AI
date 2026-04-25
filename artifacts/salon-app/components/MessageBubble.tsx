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
  return (
    <View style={[styles.row, { justifyContent: fromMe ? "flex-end" : "flex-start" }]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: fromMe ? colors.gold : colors.card,
            borderColor: fromMe ? colors.gold : colors.border,
            borderTopLeftRadius: fromMe ? 14 : 2,
            borderTopRightRadius: fromMe ? 2 : 14,
          },
        ]}
      >
        {!fromMe && authorName ? (
          <Text style={[styles.author, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
            {authorName}
          </Text>
        ) : null}
        <Text
          style={[
            styles.text,
            { color: fromMe ? colors.accentForeground : colors.foreground, fontFamily: "Inter_400Regular" },
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
                  color: fromMe ? colors.accentForeground : colors.gold,
                  fontFamily: "Inter_500Medium",
                  opacity: fromMe ? 0.7 : 1,
                },
              ]}
            >
              ЗАКРЕПЛЕНО
            </Text>
          ) : null}
          {time ? (
            <Text
              style={[
                styles.meta,
                {
                  color: fromMe ? colors.accentForeground : colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                  opacity: fromMe ? 0.7 : 1,
                },
              ]}
            >
              {time}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 4 },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  author: { fontSize: 11, letterSpacing: 0.5 },
  text: { fontSize: 14, lineHeight: 20 },
  metaRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  meta: { fontSize: 9, letterSpacing: 1 },
});
