/**
 * PostCard — Instagram-style feed card
 *  1. Author header above the image
 *  2. Double-tap photo → like + heart burst animation
 *  3. Single-tap photo → slide-up comments sheet
 *  4. Pinch on photo → zoom; release → spring back
 *  5. Likes summary "Нравится X людям"
 *  6. Caption + last comment inline
 */
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Platform, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useApp } from "@/contexts/AppContext";
import { useData } from "@/contexts/DataContext";
import { EMPLOYEES_SEED, type Post } from "@/data/seed";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "./Avatar";
import { CommentsSheet } from "./CommentsSheet";
import { HeartBurst } from "./HeartBurst";
import { PressableScale } from "./PressableScale";
import { VideoInFeed } from "./VideoInFeed";

function haptic(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(style).catch(() => {});
}

type Props = { post: Post; isActive?: boolean };

function timeAgo(at: number): string {
  const diff = Date.now() - at;
  const h = Math.round(diff / 3_600_000);
  if (h < 1) return "только что";
  if (h < 24) return `${h} ч`;
  return `${Math.round(h / 24)} дн`;
}

export function PostCard({ post, isActive = false }: Props) {
  const colors = useColors();
  const { user } = useApp();
  const { toggleLike, toggleSave } = useData();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);

  const isOwnPost = post.authorId === "u_self" || post.authorId === user?.id;
  const author = isOwnPost
    ? { name: user?.name ?? "Вы", specialty: user?.specialty ?? "", initials: user?.initials ?? "M", avatarUri: user?.avatarUri }
    : EMPLOYEES_SEED.find((e) => e.id === post.authorId);

  const liked = user ? post.likedBy.includes(user.id) : false;
  const saved = user ? post.savedBy.includes(user.id) : false;
  const isVideo = !!post.video;
  const isMine = isOwnPost;

  const handleName = `@${(author?.name ?? "maison").split(" ")[0].toLowerCase()}`;
  const lastComment = post.comments[post.comments.length - 1];

  /* ── Shared values ──────────────────────────────────────── */
  const imgScale = useSharedValue(1);
  const heartS   = useSharedValue(0);
  const heartO   = useSharedValue(0);
  const likeS    = useSharedValue(1);

  /* ── Helpers via runOnJS ────────────────────────────────── */
  const bounceHeart = () => {
    likeS.value = withSequence(
      withSpring(1.45, { damping: 4, stiffness: 420 }),
      withSpring(1.0, { damping: 10, stiffness: 260 }),
    );
  };
  // Tap on like button
  const handleTapLike = () => {
    haptic(Haptics.ImpactFeedbackStyle.Medium);
    toggleLike(post.id);
    bounceHeart();
  };
  // Double-tap on image — only add like (never remove) + full-screen burst
  const handleDoubleTapLike = () => {
    const wasLiked = liked;
    if (!wasLiked) {
      toggleLike(post.id);
      haptic(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      haptic(Haptics.ImpactFeedbackStyle.Light);
    }
    bounceHeart();
    setHeartBurst(true);
  };
  const openComments = () => setCommentsOpen(true);

  const burstHeart = () => {
    "worklet";
    heartO.value = withSequence(
      withTiming(1, { duration: 80 }),
      withDelay(420, withTiming(0, { duration: 280 })),
    );
    heartS.value = withSequence(
      withSpring(1.0, { damping: 7, stiffness: 280, mass: 0.8 }),
      withDelay(400, withTiming(0, { duration: 280 })),
    );
  };

  /* ── Gestures ───────────────────────────────────────────── */
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(300)
    .onStart(() => {
      "worklet";
      burstHeart();
      runOnJS(handleDoubleTapLike)();
    });

  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .requireExternalGestureToFail(doubleTap)
    .onStart(() => {
      "worklet";
      runOnJS(openComments)();
    });

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      "worklet";
      imgScale.value = Math.max(1, Math.min(e.scale, 4));
    })
    .onEnd(() => {
      "worklet";
      imgScale.value = withSpring(1, { damping: 14, stiffness: 200, mass: 0.9 });
    });

  const composed = Gesture.Simultaneous(pinch, doubleTap, singleTap);

  /* ── Animated styles ────────────────────────────────────── */
  const imgStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imgScale.value }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    opacity: heartO.value,
    transform: [{ scale: heartS.value }],
  }));

  const likeIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeS.value }],
  }));

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Работа ${author?.name ?? "мастера APIA"} в APIA:\n\n"${post.caption}"\n\n${post.tags.map((t) => `#${t}`).join(" ")}`,
      });
    } catch {}
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>

      {/* ── Author header ──────────────────────────────────── */}
      <View style={styles.authorRow}>
        <View style={[styles.avatarRing, { borderColor: liked ? "#C8A064" : "rgba(200,160,100,0.30)" }]}>
          <Avatar
            initials={author?.initials ?? "M"}
            size={34}
            avatarUri={(author as any)?.avatarUri}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.handle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            {handleName}
          </Text>
          <Text style={[styles.specialty, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {author?.specialty ?? ""} · {timeAgo(post.createdAt)}
          </Text>
        </View>
        {!isMine && (
          <TouchableOpacity style={[styles.followBtn, { borderColor: colors.accent }]}>
            <Text style={[styles.followText, { color: colors.accent, fontFamily: "Inter_600SemiBold" }]}>
              Следить
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity hitSlop={10} style={{ paddingLeft: 8 }}>
          <Feather name="more-horizontal" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* ── Photo / video area ─────────────────────────────── */}
      <GestureDetector gesture={composed}>
        <View style={[styles.imageWrap, { backgroundColor: "#0D0D0D" }]}>
          {isVideo && isActive ? (
            <VideoInFeed source={post.video!} isActive={isActive} />
          ) : (
            <Animated.View style={[StyleSheet.absoluteFillObject, imgStyle]}>
              <Image
                source={post.image}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
                transition={300}
              />
            </Animated.View>
          )}

          {isVideo && !isActive && (
            <View style={styles.playOverlay}>
              <View style={styles.playCircle}>
                <Feather name="play" size={22} color="#1a1a1a" style={{ marginLeft: 2 }} />
              </View>
            </View>
          )}
          {isVideo && (
            <View style={styles.videoBadge}>
              <Feather name="video" size={11} color="#FFFFFF" />
              <Text style={[styles.videoBadgeText, { color: "#FFFFFF", fontFamily: "Inter_600SemiBold" }]}>Видео</Text>
            </View>
          )}

          <Animated.View style={[styles.heartBurst, heartStyle]} pointerEvents="none">
            <Feather name="heart" size={100} color="#FFFFFF" style={styles.heartIconShadow} />
          </Animated.View>
        </View>
      </GestureDetector>

      {/* ── Action bar ─────────────────────────────────────── */}
      <View style={styles.actions}>
        <PressableScale onPress={handleTapLike} scaleTo={0.82}>
          <Animated.View style={[styles.actionBtn, likeIconStyle]}>
            <MaterialCommunityIcons
              name={liked ? "heart" : "heart-outline"}
              size={26}
              color={liked ? "#FF3B6F" : colors.foreground}
            />
          </Animated.View>
        </PressableScale>

        <PressableScale onPress={() => setCommentsOpen(true)} scaleTo={0.82}>
          <View style={styles.actionBtn}>
            <MaterialCommunityIcons name="comment-outline" size={24} color={colors.foreground} />
          </View>
        </PressableScale>

        <PressableScale onPress={handleShare} scaleTo={0.82}>
          <View style={styles.actionBtn}>
            <Feather name="send" size={22} color={colors.foreground} />
          </View>
        </PressableScale>

        <View style={{ flex: 1 }} />

        <PressableScale onPress={() => toggleSave(post.id)} scaleTo={0.82}>
          <View style={styles.actionBtn}>
            <MaterialCommunityIcons
              name={saved ? "bookmark" : "bookmark-outline"}
              size={26}
              color={saved ? "#C8A064" : colors.foreground}
            />
          </View>
        </PressableScale>
      </View>

      {/* ── Likes summary ──────────────────────────────────── */}
      <View style={styles.body}>
        {post.likedBy.length > 0 && (
          <Text style={[styles.likesText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Нравится {post.likedBy.length.toLocaleString("ru-RU")} {likesWord(post.likedBy.length)}
          </Text>
        )}

        {/* Caption */}
        <Text numberOfLines={3} style={[styles.caption, { color: colors.foreground }]}>
          <Text style={[styles.captionHandle, { fontFamily: "Inter_600SemiBold" }]}>{handleName} </Text>
          <Text style={{ fontFamily: "Inter_400Regular" }}>{post.caption}</Text>
        </Text>

        {/* Tags */}
        {post.tags.length > 0 && (
          <Text style={[styles.tags, { color: colors.accent, fontFamily: "Inter_500Medium" }]}>
            {post.tags.map((t) => `#${t}`).join("  ")}
          </Text>
        )}

        {/* Comments preview */}
        {post.comments.length > 1 && (
          <TouchableOpacity onPress={() => setCommentsOpen(true)}>
            <Text style={[styles.viewAllComments, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Посмотреть все комментарии ({post.comments.length})
            </Text>
          </TouchableOpacity>
        )}
        {lastComment && (
          <Text numberOfLines={2} style={[styles.lastComment, { color: colors.foreground }]}>
            <Text style={{ fontFamily: "Inter_600SemiBold" }}>
              @{commentAuthorHandle(lastComment.authorId)}{" "}
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular" }}>{lastComment.text}</Text>
          </Text>
        )}

        {/* Time */}
        <Text style={[styles.timeText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {timeAgo(post.createdAt)} назад
        </Text>
      </View>

      {/* Comments bottom sheet */}
      <CommentsSheet
        post={post}
        visible={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      />

      {/* Full-screen heart burst on double-tap */}
      <HeartBurst
        visible={heartBurst}
        onDone={() => setHeartBurst(false)}
      />
    </View>
  );
}

function likesWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return "людям";
  if (mod10 === 1) return "человеку";
  if (mod10 >= 2 && mod10 <= 4) return "людям";
  return "людям";
}

function commentAuthorHandle(authorId: string): string {
  if (authorId === "u_self") return "вы";
  const emp = EMPLOYEES_SEED.find((e) => e.id === authorId);
  return emp ? emp.name.split(" ")[0].toLowerCase() : "мастер";
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 0,
    borderRadius: 0,
    overflow: "hidden",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  avatarRing: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2,
  },
  handle: { fontSize: 13, letterSpacing: -0.1 },
  specialty: { fontSize: 11, marginTop: 1, opacity: 0.7 },
  followBtn: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1.2,
  },
  followText: { fontSize: 12, letterSpacing: 0.2 },
  imageWrap: { width: "100%", aspectRatio: 1, overflow: "hidden" },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  playCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.90)",
    alignItems: "center", justifyContent: "center",
  },
  videoBadge: {
    position: "absolute", top: 12, right: 12,
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
  },
  videoBadgeText: { fontSize: 10 },
  heartBurst: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  heartIconShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  actionBtn: {
    padding: 6,
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 5,
  },
  likesText: { fontSize: 13 },
  caption: { fontSize: 14, lineHeight: 20 },
  captionHandle: { fontSize: 14 },
  tags: { fontSize: 12, letterSpacing: 0.3 },
  viewAllComments: { fontSize: 13 },
  lastComment: { fontSize: 13, lineHeight: 19 },
  timeText: { fontSize: 11, marginTop: 2 },
});
