/**
 * Full-screen Instagram-style story viewer.
 * - Progress segments auto-advance every 4 s
 * - Tap left half = previous, tap right half = next
 * - Swipe down = close
 * - Each story can have multiple frames (post images of that employee)
 */
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "./Avatar";

const { width: W, height: H } = Dimensions.get("window");
const FRAME_DURATION = 4000; // ms per frame

export type StoryItem = {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  frames: string[]; // image URLs; empty = use gradient
};

type Props = {
  stories: StoryItem[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
};

const ACCENT_COLORS = [
  ["#FF6B9D", "#C44DFF"],
  ["#4D79FF", "#00C6FF"],
  ["#00C9A7", "#10B981"],
  ["#FF8C42", "#FF4D6D"],
  ["#A855F7", "#EC4899"],
  ["#C8A064", "#8B5E3C"],
];

export function StoryViewer({ stories, initialIndex, visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [storyIdx, setStoryIdx] = useState(initialIndex);
  const [frameIdx, setFrameIdx] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPaused = useRef(false);

  const story = stories[storyIdx];
  const frames = story?.frames ?? [];
  const totalFrames = Math.max(frames.length, 1);

  /* ── Reset when opening or switching story ─── */
  const startFrame = useCallback((fi: number) => {
    setFrameIdx(fi);
    progressAnim.setValue(0);
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: FRAME_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !isPaused.current) advance();
    });
  }, [progressAnim]); // eslint-disable-line

  const advance = useCallback(() => {
    setStoryIdx((si) => {
      const s = stories[si];
      const fr = Math.max((s?.frames ?? []).length, 1);
      setFrameIdx((fi) => {
        if (fi + 1 < fr) {
          startFrame(fi + 1);
          return fi; // will be set by startFrame
        } else if (si + 1 < stories.length) {
          const next = si + 1;
          setStoryIdx(next);
          startFrame(0);
          return 0;
        } else {
          onClose();
          return fi;
        }
      });
      return si;
    });
  }, [stories, onClose, startFrame]);

  const goBack = useCallback(() => {
    setStoryIdx((si) => {
      setFrameIdx((fi) => {
        if (fi > 0) {
          startFrame(fi - 1);
          return fi - 1;
        } else if (si > 0) {
          const prev = si - 1;
          const prevFrames = Math.max((stories[prev]?.frames ?? []).length, 1);
          setStoryIdx(prev);
          startFrame(prevFrames - 1);
          return prevFrames - 1;
        }
        return fi;
      });
      return si;
    });
  }, [stories, startFrame]);

  /* ── Init / visible change ─────────────────── */
  useEffect(() => {
    if (visible) {
      setStoryIdx(initialIndex);
      isPaused.current = false;
      startFrame(0);
    } else {
      progressAnim.stopAnimation();
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [visible, initialIndex]); // eslint-disable-line

  /* ── Swipe-down to close (PanResponder) ───── */
  const swipeY = useRef(new Animated.Value(0)).current;
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 10 && g.dy > 0,
      onPanResponderGrant: () => { isPaused.current = true; progressAnim.stopAnimation(); },
      onPanResponderMove: Animated.event([null, { dy: swipeY }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100) {
          Animated.timing(swipeY, { toValue: H, duration: 250, useNativeDriver: false }).start(onClose);
        } else {
          Animated.spring(swipeY, { toValue: 0, useNativeDriver: false }).start(() => {
            isPaused.current = false;
            startFrame(frameIdx);
          });
        }
      },
    })
  ).current;

  if (!story) return null;

  const colors = ACCENT_COLORS[storyIdx % ACCENT_COLORS.length];
  const imageUrl = frames[frameIdx];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View
        style={[styles.root, { transform: [{ translateY: swipeY }] }]}
        {...pan.panHandlers}
      >
        {/* ── Background ───────────────────────────── */}
        {imageUrl ? (
          <Image source={imageUrl} style={StyleSheet.absoluteFillObject} contentFit="cover" />
        ) : (
          <LinearGradient
            colors={[colors[0], colors[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        )}

        {/* Dark overlay for readability */}
        <LinearGradient
          colors={["rgba(0,0,0,0.52)", "transparent", "rgba(0,0,0,0.6)"]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* ── Progress bars ────────────────────────── */}
        <View style={[styles.progressRow, { paddingTop: insets.top + 10 }]}>
          {Array.from({ length: totalFrames }).map((_, i) => (
            <View key={i} style={styles.progressTrack}>
              {i < frameIdx ? (
                <View style={[styles.progressFill, { width: "100%", backgroundColor: "rgba(255,255,255,0.95)" }]} />
              ) : i === frameIdx ? (
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
                      backgroundColor: "rgba(255,255,255,0.95)",
                    },
                  ]}
                />
              ) : (
                <View style={[styles.progressFill, { width: 0 }]} />
              )}
            </View>
          ))}
        </View>

        {/* ── Header: avatar + name + close ────────── */}
        <View style={styles.header}>
          <Avatar initials={story.initials} size={38} />
          <View style={{ flex: 1 }}>
            <Text style={styles.storyName}>{story.name}</Text>
            <Text style={styles.storySpec}>{story.specialty}</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={16} style={styles.closeBtn}>
            <Feather name="x" size={22} color="rgba(255,255,255,0.9)" />
          </Pressable>
        </View>

        {/* Content overlay (if no image, show a centered label) */}
        {!imageUrl && (
          <View style={styles.noImageContent}>
            <Text style={styles.noImageInitials}>{story.initials}</Text>
            <Text style={styles.noImageName}>{story.name}</Text>
            <Text style={styles.noImageSpec}>{story.specialty}</Text>
          </View>
        )}

        {/* ── Tap zones: left = back, right = next ─── */}
        <View style={styles.tapZones} pointerEvents="box-none">
          <Pressable style={styles.tapLeft} onPress={goBack} />
          <Pressable style={styles.tapRight} onPress={advance} />
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  progressRow: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 12,
    paddingBottom: 10,
    zIndex: 10,
  },
  progressTrack: {
    flex: 1,
    height: 2.5,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 12,
    zIndex: 10,
  },
  storyName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: -0.2,
  },
  storySpec: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    marginTop: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  noImageContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  noImageInitials: {
    fontSize: 72,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "700",
  },
  noImageName: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "600",
  },
  noImageSpec: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
  },
  tapZones: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: 5,
  },
  tapLeft: { flex: 1 },
  tapRight: { flex: 2 },
});
