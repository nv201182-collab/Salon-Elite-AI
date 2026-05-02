/**
 * Full-screen story viewer with emoji reactions and owner controls.
 */
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "./Avatar";

const { height: SH } = Dimensions.get("window");
const FRAME_MS = 5000;
const EMOJIS = ["🔥", "❤️", "😍", "👏", "✨", "🙌"];

export type RichFrame = {
  uri?: string;
  text?: string;
  storyId?: string;
};

export type StoryItem = {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  frames: string[];
  richFrames?: RichFrame[];
  storyText?: string | null;
};

type Props = {
  stories: StoryItem[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
  onViewed?: (id: string) => void;
  myReactions?: Record<string, string>;
  onReact?: (storyId: string, emoji: string) => void;
  onEditStory?: (storyId: string) => void;
  onDeleteStory?: (storyId: string) => void;
  onAddStory?: () => void;
};

const GRADIENTS: [string, string][] = [
  ["#C8A064", "#6B3F1E"],
  ["#FF6B9D", "#C44DFF"],
  ["#4D79FF", "#00C6FF"],
  ["#00C9A7", "#10B981"],
  ["#FF8C42", "#FF4D6D"],
  ["#A855F7", "#EC4899"],
];

export function StoryViewer({
  stories, initialIndex, visible, onClose, onViewed,
  myReactions = {}, onReact, onEditStory, onDeleteStory, onAddStory,
}: Props) {
  const insets = useSafeAreaInsets();

  const nav = useRef({
    storyIdx: initialIndex,
    frameIdx: 0,
    paused: false,
    elapsed: 0,
    timerStart: 0,
  });

  const [tick, setTick] = useState(0);
  const [emojiPop, setEmojiPop] = useState<string | null>(null);
  const emojiScale = useRef(new Animated.Value(1)).current;

  const forceUpdate = () => setTick((n) => n + 1);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const swipeY       = useRef(new Animated.Value(0)).current;

  function currentStory() { return stories[nav.current.storyIdx]; }
  function currentRichFrame(): RichFrame | undefined {
    const s = currentStory();
    return s?.richFrames?.[nav.current.frameIdx];
  }
  function currentFrameUri(): string | null {
    const rf = currentRichFrame();
    if (rf) return rf.uri ?? null;
    const s = currentStory();
    return s?.frames[nav.current.frameIdx] ?? null;
  }
  function currentFrameText(): string | null {
    const rf = currentRichFrame();
    if (rf?.text) return rf.text;
    if (nav.current.frameIdx === 0) return currentStory()?.storyText ?? null;
    return null;
  }
  function totalFrames(): number {
    const s = currentStory();
    return Math.max(s?.richFrames?.length ?? s?.frames.length ?? 0, 1);
  }

  function startTimer(elapsed = 0) {
    const n = nav.current;
    n.paused = false;
    n.elapsed = elapsed;
    n.timerStart = Date.now();
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

  function pauseTimer() {
    if (nav.current.paused) return;
    nav.current.paused  = true;
    nav.current.elapsed = Math.min(Date.now() - nav.current.timerStart + nav.current.elapsed, FRAME_MS);
    progressAnim.stopAnimation();
  }

  function resumeTimer() {
    if (!nav.current.paused) return;
    startTimer(nav.current.elapsed);
  }

  function goTo(si: number, fi: number) {
    if (si < 0 || si >= stories.length) { onClose(); return; }
    const s = stories[si];
    const len = Math.max(s?.richFrames?.length ?? s?.frames.length ?? 0, 1);
    if (fi < 0) { goTo(si - 1, Math.max((stories[si - 1]?.richFrames?.length ?? stories[si - 1]?.frames.length ?? 0), 1) - 1); return; }
    if (fi >= len) { goTo(si + 1, 0); return; }
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
    return () => { progressAnim.stopAnimation(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialIndex]);

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

  // Emoji reaction
  function handleReact(emoji: string) {
    const story = currentStory();
    if (!story || !onReact) return;
    const key = story.id + "_" + nav.current.frameIdx;
    onReact(key, emoji);
    setEmojiPop(emoji);
    emojiScale.setValue(0.5);
    Animated.spring(emojiScale, { toValue: 1, useNativeDriver: true, bounciness: 18 }).start(() => {
      setTimeout(() => setEmojiPop(null), 900);
    });
  }

  const si    = nav.current.storyIdx;
  const fi    = nav.current.frameIdx;
  const story = stories[si];
  const imgUrl      = currentFrameUri();
  const frameText   = currentFrameText();
  const grad        = GRADIENTS[si % GRADIENTS.length];
  const tf          = totalFrames();
  const isOwnStory  = story?.id === "you";
  const richFrame   = currentRichFrame();
  const currentStoryId = richFrame?.storyId ?? (story?.id + "_" + fi);
  const myEmoji     = myReactions[currentStoryId];

  if (!story) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[styles.root, { transform: [{ translateY: swipeY }] }]} {...pan.panHandlers}>

        {/* Background */}
        <LinearGradient colors={[grad[0], grad[1]]} style={StyleSheet.absoluteFillObject} />
        {imgUrl ? <Image source={{ uri: imgUrl }} style={StyleSheet.absoluteFillObject} contentFit="cover" /> : null}

        {/* Scrim */}
        <LinearGradient
          colors={["rgba(0,0,0,0.52)", "transparent", "rgba(0,0,0,0.62)"]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        {/* Progress bars */}
        <View style={[styles.progressRow, { paddingTop: insets.top + (Platform.OS === "ios" ? 6 : 14) }]}>
          {Array.from({ length: tf }).map((_, i) => (
            <View key={i} style={styles.track}>
              {i < fi
                ? <View style={[styles.fill, { width: "100%" }]} />
                : i === fi
                  ? <Animated.View style={[styles.fill, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]} />
                  : null}
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
          {isOwnStory && (
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => {
                pauseTimer();
                onAddStory?.();
              }}
              hitSlop={10}
            >
              <Feather name="plus-circle" size={22} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
          )}
          <Pressable onPress={onClose} hitSlop={16} style={styles.headerBtn}>
            <Feather name="x" size={22} color="rgba(255,255,255,0.9)" />
          </Pressable>
        </View>

        {/* Text overlay */}
        {!!frameText && (
          <View style={styles.textOverlay} pointerEvents="none">
            <View style={styles.textCard}>
              <Text style={styles.textBody}>{frameText}</Text>
            </View>
          </View>
        )}

        {/* No-image initials */}
        {!imgUrl && !frameText && (
          <View style={styles.centerContent} pointerEvents="none">
            <Text style={styles.initials}>{story.initials}</Text>
            <Text style={styles.centerName}>{story.name}</Text>
            <Text style={styles.centerSpec}>{story.specialty}</Text>
          </View>
        )}

        {/* Emoji pop */}
        {emojiPop && (
          <Animated.Text style={[styles.emojiPop, { transform: [{ scale: emojiScale }] }]}>
            {emojiPop}
          </Animated.Text>
        )}

        {/* Tap zones */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
          <View style={styles.tapRow}>
            <Pressable style={styles.tapHalf} onPress={goBack} />
            <Pressable style={styles.tapHalf} onPress={advance} />
          </View>
        </View>

        {/* Bottom bar: emoji reactions + owner controls */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>

          {/* Emoji reactions */}
          <View style={styles.emojiRow}>
            {EMOJIS.map((e) => {
              const active = myEmoji === e;
              return (
                <TouchableOpacity
                  key={e}
                  style={[styles.emojiBtn, active && styles.emojiBtnActive]}
                  onPress={() => handleReact(e)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                  {active && <View style={styles.emojiDot} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Owner controls */}
          {isOwnStory && richFrame?.storyId && (
            <View style={styles.ownerRow}>
              <TouchableOpacity
                style={styles.ownerBtn}
                onPress={() => { pauseTimer(); onEditStory?.(richFrame.storyId!); }}
              >
                <Feather name="edit-2" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.ownerBtnText}>Изменить</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ownerBtn, styles.ownerBtnDanger]}
                onPress={() => {
                  pauseTimer();
                  Alert.alert("Удалить сториз?", "Это действие нельзя отменить.", [
                    { text: "Отмена", onPress: resumeTimer },
                    { text: "Удалить", style: "destructive", onPress: () => { onDeleteStory?.(richFrame.storyId!); onClose(); } },
                  ]);
                }}
              >
                <Feather name="trash-2" size={14} color="rgba(255,100,100,0.9)" />
                <Text style={[styles.ownerBtnText, { color: "rgba(255,100,100,0.9)" }]}>Удалить</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },

  progressRow: {
    flexDirection: "row", gap: 4,
    paddingHorizontal: 10, paddingBottom: 8, zIndex: 10,
  },
  track: {
    flex: 1, height: 2.5,
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 2, overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: "rgba(255,255,255,0.92)", borderRadius: 2 },

  header: {
    flexDirection: "row", alignItems: "center",
    gap: 10, paddingHorizontal: 14, paddingBottom: 10, zIndex: 10,
  },
  name: { fontSize: 14, fontWeight: "600", color: "#fff", letterSpacing: -0.2 },
  spec: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 1 },
  headerBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },

  textOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center", justifyContent: "center",
    bottom: 160,
  },
  textCard: {
    backgroundColor: "rgba(0,0,0,0.48)", borderRadius: 18,
    paddingHorizontal: 22, paddingVertical: 16,
    maxWidth: 310,
    borderWidth: 1, borderColor: "rgba(200,160,100,0.3)",
  },
  textBody: { color: "#FFF", fontSize: 18, lineHeight: 27, textAlign: "center", fontWeight: "400" },

  centerContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center", justifyContent: "center", gap: 8,
    bottom: 160,
  },
  initials:   { fontSize: 70, color: "rgba(255,255,255,0.88)", fontWeight: "700" },
  centerName: { fontSize: 22, color: "#fff", fontWeight: "600" },
  centerSpec: { fontSize: 14, color: "rgba(255,255,255,0.7)" },

  emojiPop: {
    position: "absolute",
    top: "40%", alignSelf: "center",
    fontSize: 80, zIndex: 50,
  },

  tapRow: { flex: 1, flexDirection: "row", marginTop: 100 },
  tapHalf: { flex: 1 },

  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, gap: 10, zIndex: 20,
  },
  emojiRow: {
    flexDirection: "row", justifyContent: "center", gap: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 30, paddingVertical: 8, paddingHorizontal: 12,
  },
  emojiBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  emojiBtnActive: { backgroundColor: "rgba(200,160,100,0.35)" },
  emojiText: { fontSize: 24 },
  emojiDot: {
    position: "absolute", bottom: 4,
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: "#C8A064",
  },

  ownerRow: {
    flexDirection: "row", gap: 10, justifyContent: "center",
  },
  ownerBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20,
  },
  ownerBtnDanger: {},
  ownerBtnText: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "500" },
});
