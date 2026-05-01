import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Share, StyleSheet, Text, View } from "react-native";

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
  const isVideo = !!post.video;

  const handleShare = async () => {
    const authorName = author?.name ?? "мастер APIA";
    try {
      await Share.share({
        message: `Посмотрите работу ${authorName} в APIA:\n\n"${post.caption}"\n\n${post.tags.map((t) => `#${t}`).join(" ")}`,
        title: `Работа мастера APIA — ${authorName}`,
      });
    } catch {}
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <PressableScale onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })} scaleTo={0.99}>
        <View style={[styles.imageWrap, isVideo && { backgroundColor: "#111" }]}>
          <Image source={post.image} style={styles.image} contentFit="cover" transition={300} />
          {isVideo ? (
            <View style={[styles.playOverlay, { backgroundColor: "rgba(0,0,0,0.38)" }]}>
              <View style={[styles.playCircle, { backgroundColor: "rgba(255,255,255,0.92)" }]}>
                <Feather name="play" size={22} color="#1a1a1a" style={{ marginLeft: 2 }} />
              </View>
              <Text style={[styles.tapHint, { color: "rgba(255,255,255,0.85)", fontFamily: "Inter_500Medium" }]}>
                Нажмите для просмотра
              </Text>
            </View>
          ) : null}
        </View>
      </PressableScale>

      <View style={styles.body}>
        <View style={styles.header}>
          <Avatar initials={author?.initials ?? "M"} size={36} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              @{(author?.name ?? "maison").split(" ")[0].toLowerCase()}_{(author?.name ?? "maison").split(" ")[1]?.toLowerCase().slice(0, 6) ?? "maison"}
            </Text>
            <Text style={[styles.specialty, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {author?.specialty ?? ""} · {timeAgo(post.createdAt)}
            </Text>
          </View>
          {isVideo ? (
            <View style={[styles.videoBadge, { backgroundColor: colors.pinkSoft }]}>
              <Feather name="video" size={11} color={colors.pink} />
              <Text style={[styles.videoBadgeText, { color: colors.pink, fontFamily: "Inter_600SemiBold" }]}>
                Видео
              </Text>
            </View>
          ) : null}
        </View>

        <Text
          numberOfLines={3}
          style={[styles.caption, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
        >
          {post.caption}
        </Text>

        {post.tags.length > 0 ? (
          <Text style={[styles.tags, { color: colors.pink, fontFamily: "Inter_500Medium" }]}>
            {post.tags.map((t) => `#${t}`).join("  ")}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <PressableScale onPress={() => toggleLike(post.id)} scaleTo={0.85}>
            <View style={styles.actionRow}>
              <Feather name="heart" size={20} color={liked ? colors.pink : colors.mutedForeground} />
              <Text style={[styles.actionText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {post.likedBy.length}
              </Text>
            </View>
          </PressableScale>
          <PressableScale onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })} scaleTo={0.85}>
            <View style={styles.actionRow}>
              <Feather name="message-circle" size={20} color={colors.mutedForeground} />
              <Text style={[styles.actionText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {post.comments.length}
              </Text>
            </View>
          </PressableScale>
          <PressableScale onPress={handleShare} scaleTo={0.85}>
            <Feather name="share-2" size={20} color={colors.mutedForeground} />
          </PressableScale>
          <View style={{ flex: 1 }} />
          <PressableScale onPress={() => toggleSave(post.id)} scaleTo={0.85}>
            <Feather name="bookmark" size={20} color={saved ? colors.pink : colors.mutedForeground} />
          </PressableScale>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    overflow: "hidden",
    marginHorizontal: 16,
  },
  imageWrap: { position: "relative" },
  image: { width: "100%", aspectRatio: 4 / 5 },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  tapHint: {
    fontSize: 11,
    letterSpacing: 0.3,
    marginTop: 4,
  },
  body: { padding: 16, gap: 10 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { fontSize: 14, letterSpacing: 0.1 },
  specialty: { fontSize: 11, marginTop: 2, letterSpacing: 0.1 },
  videoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  videoBadgeText: { fontSize: 10, letterSpacing: 0.1 },
  actions: { flexDirection: "row", alignItems: "center", gap: 18, paddingTop: 4 },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionText: { fontSize: 13, letterSpacing: 0.1 },
  caption: { fontSize: 14, lineHeight: 20 },
  tags: { fontSize: 12, letterSpacing: 0.2 },
});
