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
import { GlassCard } from "./GlassCard";
import { PressableScale } from "./PressableScale";
import { VideoInFeed } from "./VideoInFeed";

type Props = { post: Post; isActive?: boolean };

function timeAgo(at: number): string {
  const diff = Date.now() - at;
  const h = Math.round(diff / 3600_000);
  if (h < 1) return "сейчас";
  if (h < 24) return `${h} ч`;
  const d = Math.round(h / 24);
  return `${d} дн`;
}

export function PostCard({ post, isActive = false }: Props) {
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
    try {
      await Share.share({
        message: `Работа ${author?.name ?? "мастера APIA"} в APIA:\n\n"${post.caption}"\n\n${post.tags.map((t) => `#${t}`).join(" ")}`,
      });
    } catch {}
  };

  return (
    <View style={styles.outerWrap}>
      <GlassCard borderRadius={22} innerStyle={{ padding: 0 }} tintOpacity={0.30}>
        <PressableScale
          onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })}
          scaleTo={0.99}
        >
          <View style={[styles.imageWrap, { backgroundColor: "#0D0D0D" }]}>
            {isVideo && isActive ? (
              <VideoInFeed source={post.video!} isActive={isActive} />
            ) : (
              <Image source={post.image} style={StyleSheet.absoluteFillObject} contentFit="cover" transition={300} />
            )}
            {isVideo && !isActive ? (
              <View style={styles.playOverlay}>
                <View style={styles.playCircle}>
                  <Feather name="play" size={22} color="#1a1a1a" style={{ marginLeft: 2 }} />
                </View>
              </View>
            ) : null}
            {isVideo ? (
              <View style={styles.videoBadge}>
                <Feather name="video" size={11} color="#FFFFFF" />
                <Text style={[styles.videoBadgeText, { color: "#FFFFFF", fontFamily: "Inter_600SemiBold" }]}>Видео</Text>
              </View>
            ) : null}
          </View>
        </PressableScale>

        <View style={styles.body}>
          <View style={styles.headerRow}>
            <Avatar initials={author?.initials ?? "M"} size={34} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.handle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                @{(author?.name ?? "maison").split(" ")[0].toLowerCase()}_{(author?.name ?? "").split(" ")[1]?.toLowerCase().slice(0, 6) ?? "maison"}
              </Text>
              <Text style={[styles.specialty, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {author?.specialty ?? ""} · {timeAgo(post.createdAt)}
              </Text>
            </View>
          </View>

          <Text numberOfLines={3} style={[styles.caption, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
            {post.caption}
          </Text>

          {post.tags.length > 0 ? (
            <Text style={[styles.tags, { color: colors.pink, fontFamily: "Inter_500Medium" }]}>
              {post.tags.map((t) => `#${t}`).join("  ")}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <PressableScale onPress={() => toggleLike(post.id)} scaleTo={0.85}>
              <View style={styles.actionItem}>
                <Feather name="heart" size={20} color={liked ? colors.pink : colors.mutedForeground} />
                <Text style={[styles.actionNum, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {post.likedBy.length}
                </Text>
              </View>
            </PressableScale>
            <PressableScale onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })} scaleTo={0.85}>
              <View style={styles.actionItem}>
                <Feather name="message-circle" size={20} color={colors.mutedForeground} />
                <Text style={[styles.actionNum, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
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
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrap: { marginHorizontal: 16 },
  imageWrap: { width: "100%", aspectRatio: 4 / 5, overflow: "hidden" },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.90)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  videoBadgeText: { fontSize: 10, letterSpacing: 0.1 },
  body: { padding: 16, gap: 10 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  handle: { fontSize: 13, letterSpacing: 0.1 },
  specialty: { fontSize: 11, marginTop: 2, letterSpacing: 0.1 },
  caption: { fontSize: 14, lineHeight: 20 },
  tags: { fontSize: 12, letterSpacing: 0.2 },
  actions: { flexDirection: "row", alignItems: "center", gap: 18, paddingTop: 4 },
  actionItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionNum: { fontSize: 13, letterSpacing: 0.1 },
});
