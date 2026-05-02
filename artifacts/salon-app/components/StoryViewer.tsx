/**
 * Full-screen Instagram-style story viewer.
 * ─ Progress segments auto-advance every 4 s
 * ─ Tap left half = previous, tap right half = next
 * ─ Swipe down = close (spring-back if not far enough)
 * ─ Cross-fade between frames (smooth dissolve)
 * ─ Calls onViewed(id) when a story is first seen
 */
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "./Avatar";

const { width: W, height: H } = Dimensions.get("window");
const FRAME_DURATION = 4000;

export type StoryItem = {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  frames: string[];
  storyText?: string | null;
};

type Props = {
  stories: StoryItem[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
  onViewed?: (storyId: string) => void;
};

const ACCENT_COLORS: [string, string][] = [
  ["#FF6B9D", "#C44DFF"],
  ["#4D79FF", "#00C6FF"],
  ["#00C9A7", "#10B981"],
  ["#FF8C42", "#FF4D6D"],
  ["#A855F7", "#EC4899"],
  ["#C8A064", "#8B5E3C"],
];

export function StoryViewer({ stories, initialIndex, visible, onClose, onViewed }: Props) {
  const insets = useSafeAreaInsets();

  /* ── State ─────────────────────────────────────────────── */
  const [storyIdx, setStoryIdx] = useState(initialIndex);
  const [frameIdx, setFrameIdx] = useState(0);
  const [imgA, setImgA]     = useState<string | null>(null);   // current displayed image
  const [imgB, setImgB]     = useState<string | null>(null);   // incoming image
  const progressAnim  = useRef(new Animated.Value(0)).current;
  const crossFadeAnim = useRef(new Animated.Value(1)).current;  // 1 = show imgA, 0 = show imgB
  const isPaused      = useRef(false);
  const timerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storyIdxRef   = useRef(storyIdx);
  const frameIdxRef   = useRef(frameIdx);

  storyIdxRef.current = storyIdx;
  frameIdxRef.current = frameIdx;

  const story      = stories[storyIdx];
  const frames     = story?.frames ?? [];
  const totalFrames = Math.max(frames.length, 1);

  /* ── Cross-fade helper ─────────────────────────────────── */
  const crossFadeTo = useCallback((url: string | null) => {
    setImgB(url);
    crossFadeAnim.setValue(1);
    Animated.timing(crossFadeAnim, {
      toValue: 0,
      duration: 320,
      useNativeDriver: true,
    }).start(() => {
      setImgA(url);
      crossFadeAnim.setValue(1);
      setImgB(null);
    });
  }, [crossFadeAnim]);

  /* ── Start a specific frame ─────────────────────────────── */
  const startFrame = useCallback((si: number, fi: number) => {
    const s = stories[si];
    const fr = s?.frames ?? [];
    const url = fr[fi] ?? null;

    crossFadeTo(url);
    progressAnim.stopAnimation();
    progressAnim.setValue(0);
    if (timerRef.current) clearTimeout(timerRef.current);

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: FRAME_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !isPaused.current) {
        goForward(si, fi);
      }
    });

    // Mark story as viewed
    if (s) onViewed?.(s.id);
  }, [stories, crossFadeTo, progressAnim, onViewed]); // eslint-disable-line

  /* ── Navigate forward ──────────────────────────────────── */
  const goForward = useCallback((si: number, fi: number) => {
    const s = stories[si];
    const totalFr = Math.max((s?.frames ?? []).length, 1);
    if (fi + 1 < totalFr) {
      setFrameIdx(fi + 1);
      startFrame(si, fi + 1);
    } else if (si + 1 < stories.length) {
      setStoryIdx(si + 1);
      setFrameIdx(0);
      startFrame(si + 1, 0);
    } else {
      onClose();
    }
  }, [stories, startFrame, onClose]);

  /* ── Navigate backward ─────────────────────────────────── */
  const goBack = useCallback((si: number, fi: number) => {
    if (fi > 0) {
      setFrameIdx(fi - 1);
      startFrame(si, fi - 1);
    } else if (si > 0) {
      const prev = si - 1;
      const prevFr = Math.max((stories[prev]?.frames ?? []).length, 1);
      setStoryIdx(prev);
      setFrameIdx(prevFr - 1);
      startFrame(prev, prevFr - 1);
    }
  }, [stories, startFrame]);

  /* ── Tap handlers (use refs to avoid stale closures) ────── */
  const handleTapRight = useCallback(() => {
    goForward(storyIdxRef.current, frameIdxRef.current);
  }, [goForward]);

  const handleTapLeft = useCallback(() => {
    goBack(storyIdxRef.current, frameIdxRef.current);
  }, [goBack]);

  /* ── Init / re-open ─────────────────────────────────────── */
  useEffect(() => {
    if (visible) {
      isPaused.current = false;
      setStoryIdx(initialIndex);
      setFrameIdx(0);
      const url = stories[initialIndex]?.frames?.[0] ?? null;
      setImgA(url);
      setImgB(null);
      crossFadeAnim.setValue(1);
      startFrame(initialIndex, 0);
    } else {
      progressAnim.stopAnimation();
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [visible, initialIndex]); // eslint-disable-line

  /* ── Swipe-down to close ────────────────────────────────── */
  const swipeY = useRef(new Animated.Value(0)).current;
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 12 && g.dy > 0,
      onPanResponderGrant: () => {
        isPaused.current = true;
        progressAnim.stopAnimation();
      },
      onPanResponderMove: Animated.event([null, { dy: swipeY }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 110 || g.vy > 1.4) {
          Animated.timing(swipeY, { toValue: H, duration: 280, useNativeDriver: false }).start(onClose);
        } else {
          Animated.spring(swipeY, {
            toValue: 0,
            damping: 20,
            stiffness: 220,
            useNativeDriver: false,
          }).start(() => {
            isPaused.current = false;
            startFrame(storyIdxRef.current, frameIdxRef.current);
          });
        }
      },
    })
  ).current;

  if (!story) return null;

  const colors = ACCENT_COLORS[storyIdx % ACCENT_COLORS.length];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View
        style={[styles.root, { transform: [{ translateY: swipeY }] }]}
        {...pan.panHandlers}
      >
        {/* ── Background: Layer A (current) + Layer B (incoming) ── */}
        {!imgA && !imgB ? (
          <LinearGradient
            colors={[colors[0], colors[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        ) : null}

        {/* Layer A — stable current */}
        {imgA ? (
          <Animated.View
            style={[StyleSheet.absoluteFillObject, { opacity: crossFadeAnim }]}
            pointerEvents="none"
          >
            <Image source={imgA} style={StyleSheet.absoluteFillObject} contentFit="cover" />
          </Animated.View>
        ) : null}

        {/* Layer B — incoming (cross-fades over A) */}
        {imgB ? (
          <Animated.View
            style={[StyleSheet.absoluteFillObject, { opacity: crossFadeAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}
            pointerEvents="none"
          >
            <Image source={imgB} style={StyleSheet.absoluteFillObject} contentFit="cover" />
          </Animated.View>
        ) : null}

        {/* No-image gradient backdrop */}
        {!imgA && (
          <LinearGradient
            colors={[colors[0], colors[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        )}

        {/* Dark scrim for readability */}
        <LinearGradient
          colors={["rgba(0,0,0,0.55)", "transparent", "rgba(0,0,0,0.62)"]}
          locations={[0, 0.42, 1]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        {/* ── Progress bars ─────────────────────────────────── */}
        <View style={[styles.progressRow, { paddingTop: insets.top + (Platform.OS === "ios" ? 6 : 14) }]}>
          {Array.from({ length: totalFrames }).map((_, i) => (
            <View key={i} style={styles.progressTrack}>
              {i < frameIdx ? (
                <View style={[styles.progressFill, { width: "100%", backgroundColor: "rgba(255,255,255,0.92)" }]} />
              ) : i === frameIdx ? (
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
                      backgroundColor: "rgba(255,255,255,0.92)",
                    },
                  ]}
                />
              ) : (
                <View style={[styles.progressFill, { width: "0%" }]} />
              )}
            </View>
          ))}
        </View>

        {/* ── Header ────────────────────────────────────────── */}
        <View style={styles.header}>
          <Avatar initials={story.initials} size={38} />
          <View style={{ flex: 1 }}>
            <Text style={styles.storyName}>{story.name}</Text>
            <Text style={styles.storySpec}>{story.specialty}</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={18} style={styles.closeBtn}>
            <Feather name="x" size={22} color="rgba(255,255,255,0.88)" />
          </Pressable>
        </View>

        {/* No-image center content */}
        {!imgA && !imgB && (
          <View style={styles.noImageContent} pointerEvents="none">
            <Text style={styles.noImageInitials}>{story.initials}</Text>
            <Text style={styles.noImageName}>{story.name}</Text>
            <Text style={styles.noImageSpec}>{story.specialty}</Text>
            {!!story.storyText && (
              <View style={styles.storyTextCard}>
                <Text style={styles.storyTextBody}>{story.storyText}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Tap zones ─────────────────────────────────────── */}
        <View style={styles.tapZones} pointerEvents="box-none">
          <Pressable style={styles.tapLeft}  onPress={handleTapLeft} />
          <Pressable style={styles.tapRight} onPress={handleTapRight} />
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
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
    backgroundColor: "rgba(255,255,255,0.32)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 2 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 12,
    zIndex: 10,
  },
  storyName: { fontSize: 14, fontWeight: "600", color: "#fff", letterSpacing: -0.2 },
  storySpec:  { fontSize: 11, color: "rgba(255,255,255,0.72)", marginTop: 1 },
  closeBtn:   { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  noImageContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  noImageInitials: { fontSize: 72, color: "rgba(255,255,255,0.88)", fontWeight: "700" },
  noImageName:     { fontSize: 22, color: "#fff", fontWeight: "600" },
  noImageSpec:     { fontSize: 14, color: "rgba(255,255,255,0.72)" },
  storyTextCard: {
    marginTop: 24,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    maxWidth: 300,
    borderWidth: 1,
    borderColor: "rgba(200,160,100,0.35)",
  },
  storyTextBody: {
    color: "#FFF",
    fontSize: 17,
    lineHeight: 26,
    textAlign: "center",
    fontWeight: "400",
  },
  tapZones: { ...StyleSheet.absoluteFillObject, flexDirection: "row", zIndex: 5 },
  tapLeft:  { flex: 1 },
  tapRight: { flex: 2 },
});
