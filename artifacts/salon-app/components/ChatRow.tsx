import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useApp } from "@/contexts/AppContext";
import { useData } from "@/contexts/DataContext";
import { EMPLOYEES_SEED, type Chat } from "@/data/seed";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "./Avatar";
import { PressableScale } from "./PressableScale";

type Props = { chat: Chat };

function shortTime(at: number): string {
  const d = new Date(at);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function ChatRow({ chat }: Props) {
  const colors = useColors();
  const router = useRouter();
  const { user } = useApp();
  const { messagesByChat } = useData();
  const messages = messagesByChat[chat.id] ?? [];
  const last = messages[messages.length - 1];

  const initials =
    chat.kind === "dm"
      ? EMPLOYEES_SEED.find((e) => `dm_${e.id}` === chat.id)?.initials ?? chat.title.slice(0, 2)
      : chat.title.slice(0, 2);

  const lastAuthor = last?.authorId === user?.id ? "Вы" : last?.authorId
    ? EMPLOYEES_SEED.find((e) => e.id === last.authorId)?.name.split(" ")[0] ?? ""
    : "";

  return (
    <PressableScale
      onPress={() => router.push({ pathname: "/chat/[id]", params: { id: chat.id } })}
      scaleTo={0.99}
    >
      <View style={styles.row}>
        <Avatar initials={initials} size={52} variant={chat.kind === "company" ? "gold" : "default"} />
        <View style={{ flex: 1, gap: 4 }}>
          <View style={styles.titleRow}>
            <Text numberOfLines={1} style={[styles.title, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              {chat.title}
            </Text>
            {chat.pinned ? <Feather name="bookmark" size={12} color={colors.pink} /> : null}
          </View>
          <Text numberOfLines={1} style={[styles.preview, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {last ? `${lastAuthor ? lastAuthor + ": " : ""}${last.text}` : chat.subtitle ?? ""}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 6 }}>
          {last ? (
            <Text style={[styles.time, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {shortTime(last.at)}
            </Text>
          ) : null}
          {chat.members > 1 ? (
            <View style={[styles.membersBadge, { backgroundColor: "rgba(200,160,100,0.15)", borderColor: "rgba(200,160,100,0.25)", borderWidth: 1 }]}>
              <Text style={[styles.members, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {chat.members}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 14,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 15, letterSpacing: 0.1 },
  preview: { fontSize: 13, letterSpacing: 0.1 },
  time: { fontSize: 11, letterSpacing: 0.1 },
  membersBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  members: { fontSize: 11, letterSpacing: 0.1 },
});
