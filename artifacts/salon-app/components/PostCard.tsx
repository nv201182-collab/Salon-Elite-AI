/**
 * PostCard — Feed card with:
 *  1. Double-tap photo → like + full-screen heart burst animation
 *  2. Single-tap photo → slide-up comments sheet (no navigation)
 *  3. Pinch on photo → zoom; release → spring back to 1×
 */
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Share, StyleSheet, Text, View } from "react-native";
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
import { GlassCard } from "./GlassCard";
import { PressableScale } from "./PressableScale";
import { VideoInFeed } from "./VideoInFeed";

type Props = { post: Post; isActive?: boolean };

function timeAgo(at: number): string {
  const diff = Date.now() - at;
  const h = Math.round(diff / 3_600_000);
  if (h < 1) return "сейчас";
  if (h < 24) return `${h} ч`;
  return `${Math.round(h / 24)} дн`;
}

export function PostCard({ post, isActive = false }: Props) {
  const colors = useColors();
  const { user } = useApp();
  const { toggleLike, toggleSave } = useData();
  const [commentsOpen, setCommentsOpen] = useState(false);

  const author =
    post.authorId === "u_self"
      ? { name: user?.name ?? "Вы", specialty: user?.specialty ?? "", initials: user?.initials ?? "M" }
      : EMPLOYEES_SEED.find((e) => e.id === post.authorId);

  const liked = user ? post.likedBy.includes(user.id) : false;
  const saved = user ? post.savedBy.includes(user.id) : false;
  const isVideo = !!post.video;

  /* ── Shared values ─────────────────────────────────────── */
  const imgScale  = useSharedValue(1);     // pinch-to-zoom
  const heartS    = useSharedValue(0);     // heart pop scale
  const heartO    = useSharedValue(0);     // heart opacity

  /* ── Helpers called from worklets via runOnJS ─────────── */
  const doLike = () => { if (!liked) toggleLike(post.id); };
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

  /* ── Gestures ─────────────────────────────────────────── */
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(300)
    .onStart(() => {
      "worklet";
      burstHeart();
      runOnJS(doLike)();
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

  /* ── Animated styles ──────────────────────────────────── */
  const imgStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imgScale.value }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    opacity: heartO.value,
    transform: [{ scale: heartS.value }],
  }));

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

        {/* ── Photo / video area ──────────────────────── */}
        <GestureDetector gesture={composed}>
          <View style={[styles.imageWrap, { backgroundColor: "#0D0D0D" }]}>
            {/* Actual media */}
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

            {/* Video overlays */}
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

            {/* ── Heart burst animation ──────────────── */}
            <Animated.View style={[styles.heartBurst, heartStyle]} pointerEvents="none">
              <Feather name="heart" size={120} color="#FF3B6F" style={styles.heartIcon} />
            </Animated.View>
          </View>
        </GestureDetector>

        {/* ── Card body ───────────────────────────────── */}
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

          {post.tags.length > 0 && (
            <Text style={[styles.tags, { color: colors.pink, fontFamily: "Inter_500Medium" }]}>
              {post.tags.map((t) => `#${t}`).join("  ")}
            </Text>
          )}

          <View style={styles.actions}>
            {/* Like */}
            <PressableScale onPress={() => toggleLike(post.id)} scaleTo={0.85}>
              <View style={styles.actionItem}>
                <Feather name="heart" size={20} color={liked ? colors.pink : colors.mutedForeground} />
                <Text style={[styles.actionNum, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {post.likedBy.length}
                </Text>
              </View>
            </PressableScale>

            {/* Comments — opens sheet */}
            <PressableScale onPress={() => setCommentsOpen(true)} scaleTo={0.85}>
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

      {/* Comments bottom sheet */}
      <CommentsSheet
        post={post}
        visible={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      />
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
  videoBadgeText: { fontSize: 10, letterSpacing: 0.1 },
  /** Heart burst */
  heartBurst: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  heartIcon: {
    shadowColor: "#FF3B6F",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
  },
  /** Body */
  body: { padding: 16, gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  handle: { fontSize: 13, letterSpacing: -0.1 },
  specialty: { fontSize: 11, marginTop: 2, letterSpacing: 0.2, opacity: 0.70 },
  caption: { fontSize: 14, lineHeight: 21, letterSpacing: 0.1 },
  tags: { fontSize: 11, letterSpacing: 0.4 },
  actions: { flexDirection: "row", alignItems: "center", gap: 20, paddingTop: 2 },
  actionItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionNum: { fontSize: 13, letterSpacing: 0.1 },
});
