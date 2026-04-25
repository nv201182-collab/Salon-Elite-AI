import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useApp } from "@/contexts/AppContext";
import { useData } from "@/contexts/DataContext";
import { EMPLOYEES_SEED, type Post } from "@/data/seed";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "./Avatar";
import { PressableScale } from "./PressableScale";

type Props = { post: Post };

function timeAgo(at: number): string {
  const diff = Date.now() - at;
  const h = Math.round(diff / 3600_000);
  if (h < 1) return "сейчас";
  if (h < 24) return `${h} ч`;
  const d = Math.round(h / 24);
  return `${d} дн`;
}

export function PostCard({ post }: Props) {
  const colors = useColors();
  const router = useRouter();
  const { user } = useApp();
  const { toggleLike, toggleSave } = useData();

  const author =
    post.authorId === "u_self"
      ? { name: user?.name ?? "Вы", specialty: user?.specialty ?? "", initials: user?.initials ?? "M" }
      : EMPLOYEES_SEED.find((e) => e.id === post.authorId);

  const liked = user ? post.likedBy.includes(user.id) : false;
  const saved = user ? post.savedBy.includes(user.id) : false;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Avatar initials={author?.initials ?? "M"} size={36} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
            {author?.name ?? "Сотрудник Maison"}
          </Text>
          <Text style={[styles.specialty, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {author?.specialty ?? ""} · {timeAgo(post.createdAt)}
          </Text>
        </View>
      </View>

      <PressableScale onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })} scaleTo={0.99}>
        <Image source={post.image} style={styles.image} contentFit="cover" transition={200} />
      </PressableScale>

      <View style={styles.actions}>
        <PressableScale onPress={() => toggleLike(post.id)} scaleTo={0.85}>
          <View style={styles.actionRow}>
            <Feather name={liked ? "heart" : "heart"} size={20} color={liked ? colors.gold : colors.foreground} />
            <Text style={[styles.actionText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              {post.likedBy.length}
            </Text>
          </View>
        </PressableScale>
        <PressableScale onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })} scaleTo={0.85}>
          <View style={styles.actionRow}>
            <Feather name="message-circle" size={20} color={colors.foreground} />
            <Text style={[styles.actionText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              {post.comments.length}
            </Text>
          </View>
        </PressableScale>
        <View style={{ flex: 1 }} />
        <PressableScale onPress={() => toggleSave(post.id)} scaleTo={0.85}>
          <Feather name="bookmark" size={20} color={saved ? colors.gold : colors.foreground} />
        </PressableScale>
      </View>

      <Text
        numberOfLines={3}
        style={[styles.caption, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
      >
        {post.caption}
      </Text>

      {post.tags.length > 0 ? (
        <Text style={[styles.tags, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
          {post.tags.map((t) => `#${t}`).join("  ")}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    gap: 12,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20 },
  name: { fontSize: 14, letterSpacing: 0.1 },
  specialty: { fontSize: 11, marginTop: 2, letterSpacing: 0.2 },
  image: { width: "100%", aspectRatio: 3 / 4 },
  actions: { flexDirection: "row", alignItems: "center", gap: 22, paddingHorizontal: 20 },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionText: { fontSize: 13, letterSpacing: 0.2 },
  caption: { fontSize: 13, lineHeight: 19, paddingHorizontal: 20 },
  tags: { fontSize: 11, letterSpacing: 1, paddingHorizontal: 20 },
});
