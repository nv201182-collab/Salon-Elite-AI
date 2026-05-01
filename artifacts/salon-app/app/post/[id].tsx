import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { PinchZoomImage } from "@/components/PinchZoomImage";
import { PressableScale } from "@/components/PressableScale";
import { useApp } from "@/contexts/AppContext";
import { useData } from "@/contexts/DataContext";
import { EMPLOYEES_SEED, type ImageSrc } from "@/data/seed";
import { useColors } from "@/hooks/useColors";

function timeAgo(at: number): string {
  const diff = Date.now() - at;
  const h = Math.round(diff / 3600_000);
  if (h < 1) return "сейчас";
  if (h < 24) return `${h} ч`;
  const d = Math.round(h / 24);
  return `${d} дн`;
}

function VideoPlayer({ source }: { source: ImageSrc }) {
  const player = useVideoPlayer(source as never, (p) => {
    p.loop = true;
    p.play();
  });

  return (
    <View style={styles.videoWrap}>
      <VideoView
        style={styles.videoView}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        contentFit="contain"
      />
    </View>
  );
}

export default function PostDetail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useApp();
  const { posts, toggleLike, toggleSave, addComment } = useData();
  const [draft, setDraft] = useState<string>("");
  const [videoVisible, setVideoVisible] = useState(false);

  const post = posts.find((p) => p.id === id);

  if (!post) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <Stack.Screen options={{ title: "" }} />
        <Text style={{ color: colors.mutedForeground }}>Публикация не найдена</Text>
      </View>
    );
  }

  const author =
    post.authorId === "u_self"
      ? { name: user?.name ?? "Вы", specialty: user?.specialty ?? "", initials: user?.initials ?? "M" }
      : EMPLOYEES_SEED.find((e) => e.id === post.authorId);

  const liked = user ? post.likedBy.includes(user.id) : false;
  const saved = user ? post.savedBy.includes(user.id) : false;
  const isVideo = !!post.video;

  const onSend = () => {
    if (!draft.trim()) return;
    addComment(post.id, draft);
    setDraft("");
  };

  const onShare = async () => {
    const authorName = author?.name ?? "мастер APIA";
    try {
      await Share.share({
        message: `Посмотрите работу ${authorName} в APIA:\n\n"${post.caption}"\n\n${post.tags.map((t) => `#${t}`).join(" ")}`,
        title: `Работа мастера APIA — ${authorName}`,
      });
    } catch {}
  };

  const bottomPad = insets.bottom > 0 ? insets.bottom + 70 : 80;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.background }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <Stack.Screen options={{ title: "" }} />
      <FlatList
        data={post.comments}
        keyExtractor={(c) => c.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{ paddingBottom: bottomPad }}
        ListHeaderComponent={
          <View>
            {isVideo && videoVisible ? (
              <VideoPlayer source={post.video!} />
            ) : isVideo ? (
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={() => setVideoVisible(true)}
              >
                <Image source={post.image} style={styles.image} contentFit="cover" transition={200} />
                <View style={styles.playOverlay}>
                  <View style={[styles.playCircle, { backgroundColor: "rgba(255,255,255,0.92)" }]}>
                    <Feather name="play" size={28} color="#1a1a1a" style={{ marginLeft: 3 }} />
                  </View>
                  <Text style={[styles.playHint, { color: "#FFFFFF", fontFamily: "Inter_500Medium" }]}>
                    Нажмите, чтобы воспроизвести
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <PinchZoomImage source={post.image} style={styles.image} />
            )}

            <View style={styles.headerBlock}>
              <View style={styles.authorRow}>
                <Avatar initials={author?.initials ?? "M"} size={42} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.authorName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                    {author?.name ?? "Мастер APIA"}
                  </Text>
                  <Text style={[styles.authorSpec, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {author?.specialty ?? ""} · {timeAgo(post.createdAt)}
                  </Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <PressableScale onPress={() => toggleLike(post.id)} scaleTo={0.85}>
                  <View style={styles.actionItem}>
                    <Feather name="heart" size={22} color={liked ? colors.pink : colors.foreground} />
                    <Text style={[styles.actionText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                      {post.likedBy.length}
                    </Text>
                  </View>
                </PressableScale>
                <View style={styles.actionItem}>
                  <Feather name="message-circle" size={22} color={colors.foreground} />
                  <Text style={[styles.actionText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                    {post.comments.length}
                  </Text>
                </View>
                <PressableScale onPress={onShare} scaleTo={0.85}>
                  <View style={styles.actionItem}>
                    <Feather name="share-2" size={22} color={colors.foreground} />
                    <Text style={[styles.actionText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                      Поделиться
                    </Text>
                  </View>
                </PressableScale>
                <View style={{ flex: 1 }} />
                <PressableScale onPress={() => toggleSave(post.id)} scaleTo={0.85}>
                  <Feather name="bookmark" size={22} color={saved ? colors.pink : colors.foreground} />
                </PressableScale>
              </View>

              <Text style={[styles.caption, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                {post.caption}
              </Text>
              {post.tags.length > 0 ? (
                <Text style={[styles.tags, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
                  {post.tags.map((t) => `#${t}`).join("  ")}
                </Text>
              ) : null}

              <Text style={[styles.commentsLabel, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
                КОММЕНТАРИИ · {post.comments.length}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const a =
            item.authorId === "u_self"
              ? { name: user?.name ?? "Вы", initials: user?.initials ?? "M" }
              : EMPLOYEES_SEED.find((e) => e.id === item.authorId);
          return (
            <View style={[styles.commentRow, { borderBottomColor: colors.border }]}>
              <Avatar initials={a?.initials ?? "M"} size={32} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={[styles.commentAuthor, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {a?.name}{" "}
                  <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
                    · {timeAgo(item.at)}
                  </Text>
                </Text>
                <Text style={[styles.commentText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                  {item.text}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Будьте первым, кто оставит комментарий.
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />

      <View
        style={[
          styles.composer,
          {
            borderTopColor: colors.border,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 64 : 74,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Avatar initials={user?.initials ?? "M"} size={32} />
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Ответить мастеру…"
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.composerInput,
            { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card },
          ]}
          onSubmitEditing={onSend}
          returnKeyType="send"
        />
        <PressableScale onPress={onSend} scaleTo={0.9} disabled={!draft.trim()}>
          <View
            style={[
              styles.sendBtn,
              {
                backgroundColor: draft.trim() ? colors.gold : colors.muted,
                borderColor: draft.trim() ? colors.gold : colors.border,
              },
            ]}
          >
            <Feather
              name="arrow-up"
              size={18}
              color={draft.trim() ? colors.accentForeground : colors.mutedForeground}
            />
          </View>
        </PressableScale>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  image: { width: "100%", aspectRatio: 3 / 4 },
  videoWrap: { width: "100%", aspectRatio: 3 / 4, backgroundColor: "#000" },
  videoView: { width: "100%", height: "100%" },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  playCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  playHint: { fontSize: 13, letterSpacing: 0.2, opacity: 0.9 },
  headerBlock: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, gap: 14 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  authorName: { fontSize: 14, letterSpacing: 0.1 },
  authorSpec: { fontSize: 11, letterSpacing: 0.1, marginTop: 2 },
  actionsRow: { flexDirection: "row", alignItems: "center", gap: 18, flexWrap: "wrap" },
  actionItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionText: { fontSize: 13, letterSpacing: 0.2 },
  caption: { fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  tags: { fontSize: 11, letterSpacing: 1 },
  commentsLabel: { fontSize: 9, letterSpacing: 2, marginTop: 14 },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  commentAuthor: { fontSize: 12, letterSpacing: 0.2 },
  commentText: { fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
  empty: { fontSize: 13, letterSpacing: 0.2, padding: 28, textAlign: "center" },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  composerInput: {
    flex: 1,
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
});
