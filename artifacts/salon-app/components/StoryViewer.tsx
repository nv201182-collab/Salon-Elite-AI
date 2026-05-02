/**
 * Full-screen story viewer — Instagram style.
 * Fixed: no stale-closure bugs, stable timer, smooth progress.
 */
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
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

const { height: SH } = Dimensions.get("window");
const FRAME_MS = 5000;

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
  onViewed?: (id: string) => void;
};

const GRADIENTS: [string, string][] = [
  ["#C8A064", "#6B3F1E"],
  ["#FF6B9D", "#C44DFF"],
  ["#4D79FF", "#00C6FF"],
  ["#00C9A7", "#10B981"],
  ["#FF8C42", "#FF4D6D"],
  ["#A855F7", "#EC4899"],
];

export function StoryViewer({ stories, initialIndex, visible, onClose, onViewed }: Props) {
  const insets = useSafeAreaInsets();

  // All mutable navigation state lives in a single ref — no stale closures possible
  const nav = useRef({
    storyIdx: initialIndex,
    frameIdx: 0,
    paused: false,
    timerStart: 0,
    elapsed: 0,
    raf: 0 as ReturnType<typeof requestAnimationFrame>,
    timeout: null as ReturnType<typeof setTimeout> | null,
  });

  // React state only for re-render triggers
  const [tick, setTick] = useState(0);
  const forceUpdate = () => setTick((n) => n + 1);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const swipeY = useRef(new Animated.Value(0)).current;

  function currentStory() { return stories[nav.current.storyIdx]; }
  function currentFrames() { return currentStory()?.frames ?? []; }
  function totalFrames()  { return Math.max(currentFrames().length, 1); }

  // ── Start timer for current frame ───────────────────────────
  function startTimer(elapsed = 0) {
    const n = nav.current;
    n.paused = false;
    n.elapsed = elapsed;
    n.timerStart = Date.now();

    if (n.timeout) clearTimeout(n.timeout);
    progressAnim.stopAnimation();
    progressAnim.setValue(elapsed / FRAME_MS);

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: FRAME_MS - elapsed,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !nav.current.paused) advance();
    });
  }

  // ── Pause timer ─────────────────────────────────────────────
  function pauseTimer() {
    const n = nav.current;
    if (n.paused) return;
    n.paused = true;
    n.elapsed = Math.min(Date.now() - n.timerStart + n.elapsed, FRAME_MS);
    progressAnim.stopAnimation();
  }

  // ── Resume timer ────────────────────────────────────────────
  function resumeTimer() {
    if (!nav.current.paused) return;
    startTimer(nav.current.elapsed);
  }

  // ── Navigate ────────────────────────────────────────────────
  function goTo(si: number, fi: number) {
    if (si < 0 || si >= stories.length) { onClose(); return; }
    const frLen = Math.max((stories[si]?.frames ?? []).length, 1);
    if (fi < 0) { goTo(si - 1, Math.max((stories[si - 1]?.frames ?? []).length, 1) - 1); return; }
    if (fi >= frLen) { goTo(si + 1, 0); return; }

    nav.current.storyIdx = si;
    nav.current.frameIdx = fi;
    nav.current.paused   = false;
    nav.current.elapsed  = 0;
    forceUpdate();
    onViewed?.(stories[si]?.id ?? "");
    startTimer(0);
  }

  function advance() { goTo(nav.current.storyIdx, nav.current.frameIdx + 1); }
  function goBack()  { goTo(nav.current.storyIdx, nav.current.frameIdx - 1); }

  // ── Init / open ─────────────────────────────────────────────
  useEffect(() => {
    if (!visible) {
      progressAnim.stopAnimation();
      nav.current.paused = true;
      return;
    }
    nav.current.storyIdx = initialIndex;
    nav.current.frameIdx = 0;
    nav.current.elapsed  = 0;
    nav.current.paused   = false;
    swipeY.setValue(0);
    forceUpdate();
    onViewed?.(stories[initialIndex]?.id ?? "");
    startTimer(0);

    return () => {
      progressAnim.stopAnimation();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialIndex]);

  // ── Swipe-down to close ─────────────────────────────────────
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 14 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderGrant: () => pauseTimer(),
      onPanResponderMove: Animated.event([null, { dy: swipeY }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100 || g.vy > 1.2) {
          Animated.timing(swipeY, { toValue: SH, duration: 260, useNativeDriver: false }).start(onClose);
        } else {
          Animated.spring(swipeY, { toValue: 0, useNativeDriver: false, bounciness: 6 }).start(() => resumeTimer());
        }
      },
    })
  ).current;

  const si = nav.current.storyIdx;
  const fi = nav.current.frameIdx;
  const story  = stories[si];
  const frames = story?.frames ?? [];
  const imgUrl = frames[fi] ?? null;
  const grad   = GRADIENTS[si % GRADIENTS.length];
  const tf     = totalFrames();

  if (!story) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[styles.root, { transform: [{ translateY: swipeY }] }]} {...pan.panHandlers}>

        {/* Background */}
        <LinearGradient colors={[grad[0], grad[1]]} style={StyleSheet.absoluteFillObject} />
        {imgUrl ? (
          <Image source={{ uri: imgUrl }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
        ) : null}

        {/* Scrim */}
        <LinearGradient
          colors={["rgba(0,0,0,0.52)", "transparent", "rgba(0,0,0,0.58)"]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        {/* Progress bars */}
        <View style={[styles.progressRow, { paddingTop: insets.top + (Platform.OS === "ios" ? 6 : 14) }]}>
          {Array.from({ length: tf }).map((_, i) => (
            <View key={i} style={styles.track}>
              {i < fi ? (
                <View style={[styles.fill, { width: "100%" }]} />
              ) : i === fi ? (
                <Animated.View
                  style={[styles.fill, {
                    width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
                  }]}
                />
              ) : null}
            </View>
          ))}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Avatar initials={story.initials} size={36} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{story.name}</Text>
            <Text style={styles.spec}>{story.specialty}</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={16} style={styles.closeBtn}>
            <Feather name="x" size={22} color="rgba(255,255,255,0.9)" />
          </Pressable>
        </View>

        {/* Text overlay (center) */}
        {!!story.storyText && (
          <View style={styles.textOverlay} pointerEvents="none">
            <View style={styles.textCard}>
              <Text style={styles.textBody}>{story.storyText}</Text>
            </View>
          </View>
        )}

        {/* No-image initials */}
        {!imgUrl && !story.storyText && (
          <View style={styles.centerContent} pointerEvents="none">
            <Text style={styles.initials}>{story.initials}</Text>
            <Text style={styles.centerName}>{story.name}</Text>
            <Text style={styles.centerSpec}>{story.specialty}</Text>
          </View>
        )}

        {/* Tap zones */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
          <View style={styles.tapRow}>
            <Pressable style={styles.tapHalf} onPress={goBack} />
            <Pressable style={styles.tapHalf} onPress={advance} />
          </View>
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
    paddingHorizontal: 10,
    paddingBottom: 8,
    zIndex: 10,
  },
  track: {
    flex: 1, height: 2.5,
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 2, overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: "rgba(255,255,255,0.92)", borderRadius: 2 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 10,
    zIndex: 10,
  },
  name: { fontSize: 14, fontWeight: "600", color: "#fff", letterSpacing: -0.2 },
  spec: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 1 },
  closeBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },

  textOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  textCard: {
    backgroundColor: "rgba(0,0,0,0.48)",
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 16,
    maxWidth: 310,
    borderWidth: 1,
    borderColor: "rgba(200,160,100,0.3)",
  },
  textBody: {
    color: "#FFF",
    fontSize: 18,
    lineHeight: 27,
    textAlign: "center",
    fontWeight: "400",
  },

  centerContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  initials:   { fontSize: 70, color: "rgba(255,255,255,0.88)", fontWeight: "700" },
  centerName: { fontSize: 22, color: "#fff", fontWeight: "600" },
  centerSpec: { fontSize: 14, color: "rgba(255,255,255,0.7)" },

  tapRow: { flex: 1, flexDirection: "row", marginTop: 100 },
  tapHalf: { flex: 1 },
});
