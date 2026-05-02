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
            styles.incomingBubble,
            {
              backgroundColor: "rgba(255,255,255,0.72)",
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
    paddingVertical: 11,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    gap: 4,
  },
  incomingBubble: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.80)",
    shadowColor: "#7A6030",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  author: { fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase" as const, opacity: 0.70 },
  text: { fontSize: 14, lineHeight: 21, letterSpacing: 0.1 },
  metaRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  meta: { fontSize: 10, letterSpacing: 0.1, opacity: 0.65 },
});
