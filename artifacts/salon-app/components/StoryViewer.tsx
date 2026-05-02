/**
 * StoryViewer — Instagram 2026-style story viewer.
 *
 * Features:
 *  • Progress bars per frame
 *  • Swipe-down to dismiss with spring-back
 *  • Tap left/right to navigate
 *  • Long-press to pause
 *  • Emoji reactions (floating pop + active state)
 *  • Reply input at the bottom (like Instagram 2026)
 *    – When focused: keyboard slides content up, input replaces emoji row
 *    – When dismissed: emoji row returns
 *  • Owner controls (edit / delete) for own stories
 */
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function haptic(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(style).catch(() => {});
}
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "./Avatar";
import { HeartBurst } from "./HeartBurst";

const { height: SH, width: SW } = Dimensions.get("window");
const FRAME_MS = 5_000;

/* 2026 emoji reactions — Instagram style */
const REACTIONS = ["❤️", "🔥", "😂", "😮", "😢", "👏", "💕", "🤩"];

export type RichFrame = { uri?: string; text?: string; storyId?: string };

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

  /* navigation state kept in a ref to avoid re-render loops */
  const nav = useRef({ storyIdx: initialIndex, frameIdx: 0, paused: false, elapsed: 0, timerStart: 0 });
  const [tick, setTick] = useState(0);
  const forceUpdate = () => setTick((n) => n + 1);

  const [emojiPop, setEmojiPop]       = useState<string | null>(null);
  const [heartBurst, setHeartBurst]   = useState(false);
  const emojiScale  = useRef(new Animated.Value(1)).current;

  /* reply input */
  const [replyText, setReplyText]   = useState("");
  const [replyFocused, setReplyFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  /* animations */
  const progressAnim = useRef(new Animated.Value(0)).current;
  const swipeY       = useRef(new Animated.Value(0)).current;
  const kbOffset     = useRef(new Animated.Value(0)).current;

  /* ── Timer ─────────────────────────────────────────────── */
  function startTimer(elapsed = 0) {
    const n = nav.current;
    n.paused = false; n.elapsed = elapsed; n.timerStart = Date.now();
    progressAnim.stopAnimation();
    progressAnim.setValue(elapsed / FRAME_MS);
    Animated.timing(progressAnim, {
      toValue: 1, duration: FRAME_MS - elapsed, useNativeDriver: false,
    }).start(({ finished }) => { if (finished && !nav.current.paused) advance(); });
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

  /* ── Navigation ───────────────────────────────────────── */
  function goTo(si: number, fi: number) {
    if (si < 0 || si >= stories.length) { onClose(); return; }
    const s = stories[si];
    const len = Math.max(s?.richFrames?.length ?? s?.frames.length ?? 0, 1);
    if (fi < 0) { goTo(si - 1, Math.max((stories[si - 1]?.richFrames?.length ?? stories[si - 1]?.frames.length ?? 0), 1) - 1); return; }
    if (fi >= len) { goTo(si + 1, 0); return; }
    nav.current = { ...nav.current, storyIdx: si, frameIdx: fi, paused: false, elapsed: 0 };
    forceUpdate();
    onViewed?.(stories[si]?.id ?? "");
    startTimer(0);
  }

  function advance() { goTo(nav.current.storyIdx, nav.current.frameIdx + 1); }
  function goBack()  { goTo(nav.current.storyIdx, nav.current.frameIdx - 1); }

  /* ── Init / cleanup ─────────────────────────────────────── */
  useEffect(() => {
    if (!visible) { progressAnim.stopAnimation(); nav.current.paused = true; return; }
    nav.current = { storyIdx: initialIndex, frameIdx: 0, paused: false, elapsed: 0, timerStart: 0 };
    swipeY.setValue(0);
    setReplyText(""); setReplyFocused(false);
    forceUpdate();
    onViewed?.(stories[initialIndex]?.id ?? "");
    startTimer(0);
    return () => { progressAnim.stopAnimation(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialIndex]);

  /* ── Keyboard ───────────────────────────────────────────── */
  useEffect(() => {
    const isIOS = Platform.OS === "ios";
    const show = Keyboard.addListener(isIOS ? "keyboardWillShow" : "keyboardDidShow", (e) => {
      pauseTimer();
      Animated.timing(kbOffset, {
        toValue: e.endCoordinates.height,
        duration: isIOS ? (e.duration ?? 280) : 220,
        useNativeDriver: false,
      }).start();
    });
    const hide = Keyboard.addListener(isIOS ? "keyboardWillHide" : "keyboardDidHide", (e) => {
      Animated.timing(kbOffset, {
        toValue: 0,
        duration: isIOS ? (e.duration ?? 240) : 200,
        useNativeDriver: false,
      }).start(() => { if (visible) resumeTimer(); });
    });
    return () => { show.remove(); hide.remove(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, kbOffset]);

  /* ── Swipe-down pan ─────────────────────────────────────── */
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        !replyFocused && g.dy > 12 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderGrant:  () => pauseTimer(),
      onPanResponderMove:   Animated.event([null, { dy: swipeY }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 90 || g.vy > 1.0) {
          Animated.timing(swipeY, { toValue: SH, duration: 250, useNativeDriver: false }).start(onClose);
        } else {
          Animated.spring(swipeY, { toValue: 0, useNativeDriver: false, bounciness: 5 }).start(() => resumeTimer());
        }
      },
    })
  ).current;

  /* ── Emoji reaction ─────────────────────────────────────── */
  function handleReact(emoji: string) {
    const story = stories[nav.current.storyIdx];
    if (!story || !onReact) return;
    const key = story.id + "_" + nav.current.frameIdx;
    onReact(key, emoji);
    setEmojiPop(emoji);
    emojiScale.setValue(0.3);
    Animated.spring(emojiScale, { toValue: 1, useNativeDriver: true, bounciness: 22 }).start(() => {
      setTimeout(() => setEmojiPop(null), 1200);
    });
    // Haptic + full burst for heart reactions
    if (emoji === "❤️" || emoji === "💕") {
      haptic(Haptics.ImpactFeedbackStyle.Heavy);
      setHeartBurst(true);
    } else {
      haptic(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  /* ── Reply send ─────────────────────────────────────────── */
  function handleSendReply() {
    if (!replyText.trim()) { Keyboard.dismiss(); return; }
    // In a real app this would go to DM. Show success feedback.
    setReplyText("");
    Keyboard.dismiss();
  }

  /* ── Derived ────────────────────────────────────────────── */
  const si = nav.current.storyIdx;
  const fi = nav.current.frameIdx;
  const story = stories[si];

  const imgUrl = (() => {
    const rf = story?.richFrames?.[fi];
    if (rf?.uri) return rf.uri;
    return story?.frames[fi] ?? null;
  })();

  const frameText = (() => {
    const rf = story?.richFrames?.[fi];
    if (rf?.text) return rf.text;
    if (fi === 0) return story?.storyText ?? null;
    return null;
  })();

  const tf = Math.max(
    story?.richFrames?.length ?? story?.frames.length ?? 0, 1
  );
  const grad = GRADIENTS[si % GRADIENTS.length];
  const isOwnStory = story?.id === "you";
  const richFrame  = story?.richFrames?.[fi];
  const currentStoryId = richFrame?.storyId ?? (story?.id + "_" + fi);
  const myEmoji = myReactions[currentStoryId];

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
          colors={["rgba(0,0,0,0.55)", "transparent", "rgba(0,0,0,0.65)"]}
          locations={[0, 0.38, 1]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        {/* Progress bars */}
        <View style={[styles.progressRow, { paddingTop: insets.top + (Platform.OS === "ios" ? 8 : 16) }]}>
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
          <Avatar initials={story.initials} size={38} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{story.name}</Text>
            <Text style={styles.spec}>{story.specialty}</Text>
          </View>
          {isOwnStory && (
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => { pauseTimer(); onAddStory?.(); }}
              hitSlop={10}
            >
              <Feather name="plus-circle" size={22} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
          )}
          <Pressable onPress={onClose} hitSlop={18} style={styles.headerBtn}>
            <Feather name="x" size={22} color="rgba(255,255,255,0.92)" />
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

        {/* No-image placeholder */}
        {!imgUrl && !frameText && (
          <View style={styles.centerContent} pointerEvents="none">
            <Text style={styles.initials}>{story.initials}</Text>
            <Text style={styles.centerName}>{story.name}</Text>
            <Text style={styles.centerSpec}>{story.specialty}</Text>
          </View>
        )}

        {/* Floating emoji pop */}
        {emojiPop && (
          <Animated.Text style={[styles.emojiPop, { transform: [{ scale: emojiScale }] }]}>
            {emojiPop}
          </Animated.Text>
        )}

        {/* Tap zones (behind bottom bar) */}
        <View style={[StyleSheet.absoluteFillObject, styles.tapLayer]} pointerEvents="box-none">
          <Pressable
            style={styles.tapHalf}
            onPress={goBack}
            onLongPress={pauseTimer}
            onPressOut={() => { if (nav.current.paused) resumeTimer(); }}
          />
          <Pressable
            style={styles.tapHalf}
            onPress={advance}
            onLongPress={pauseTimer}
            onPressOut={() => { if (nav.current.paused) resumeTimer(); }}
          />
        </View>

        {/* ── Bottom bar — slides up with keyboard ─────────── */}
        <Animated.View style={[styles.bottomBar, { bottom: kbOffset, paddingBottom: insets.bottom + 10 }]}>

          {/* Emoji reactions row — hidden when typing */}
          {!replyFocused && (
            <View style={styles.reactionsRow}>
              {REACTIONS.map((e) => {
                const active = myEmoji === e;
                return (
                  <TouchableOpacity
                    key={e}
                    style={[styles.reactionBtn, active && styles.reactionBtnActive]}
                    onPress={() => handleReact(e)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.reactionText}>{e}</Text>
                    {active && <View style={styles.reactionDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Reply input — Instagram 2026 style */}
          <View style={styles.replyRow}>
            {replyFocused ? (
              // Full input when focused
              <>
                <TextInput
                  ref={inputRef}
                  style={styles.replyInput}
                  value={replyText}
                  onChangeText={setReplyText}
                  placeholder={`Ответить ${story.name}…`}
                  placeholderTextColor="rgba(255,255,255,0.55)"
                  onFocus={() => { setReplyFocused(true); pauseTimer(); }}
                  onBlur={() => setReplyFocused(false)}
                  returnKeyType="send"
                  onSubmitEditing={handleSendReply}
                  autoFocus
                  multiline={false}
                  maxLength={300}
                  selectionColor="rgba(200,160,100,0.8)"
                />
                <TouchableOpacity
                  style={[styles.sendBtn, { opacity: replyText.trim() ? 1 : 0.5 }]}
                  onPress={handleSendReply}
                  activeOpacity={0.8}
                >
                  <Text style={styles.sendBtnText}>Отправить</Text>
                </TouchableOpacity>
              </>
            ) : (
              // Pill button when idle
              <TouchableOpacity
                style={styles.replyPill}
                onPress={() => {
                  setReplyFocused(true);
                  inputRef.current?.focus();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.replyPillText}>Ответить {story.name}…</Text>
              </TouchableOpacity>
            )}

            {/* Share icon */}
            {!replyFocused && (
              <TouchableOpacity style={styles.shareBtn} activeOpacity={0.8}>
                <Feather name="send" size={22} color="rgba(255,255,255,0.88)" />
              </TouchableOpacity>
            )}
          </View>

          {/* Owner controls */}
          {isOwnStory && richFrame?.storyId && (
            <View style={styles.ownerRow}>
              <TouchableOpacity
                style={styles.ownerBtn}
                onPress={() => { pauseTimer(); onEditStory?.(richFrame.storyId!); }}
              >
                <Feather name="edit-2" size={13} color="rgba(255,255,255,0.85)" />
                <Text style={styles.ownerBtnText}>Изменить</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ownerBtn, styles.ownerBtnDanger]}
                onPress={() => {
                  pauseTimer();
                  Alert.alert("Удалить сториз?", "Это действие нельзя отменить.", [
                    { text: "Отмена", onPress: resumeTimer },
                    {
                      text: "Удалить", style: "destructive",
                      onPress: () => { onDeleteStory?.(richFrame.storyId!); onClose(); },
                    },
                  ]);
                }}
              >
                <Feather name="trash-2" size={13} color="rgba(255,100,100,0.9)" />
                <Text style={[styles.ownerBtnText, { color: "rgba(255,100,100,0.9)" }]}>Удалить</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Hidden input (for focus management) */}
        {!replyFocused && (
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            onFocus={() => setReplyFocused(true)}
          />
        )}
      </Animated.View>

      {/* Full-screen heart burst on ❤️ / 💕 reaction */}
      <HeartBurst
        visible={heartBurst}
        originY={SW * 0.4}
        onDone={() => setHeartBurst(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },

  progressRow: {
    flexDirection: "row", gap: 3,
    paddingHorizontal: 10, paddingBottom: 6, zIndex: 10,
  },
  track: {
    flex: 1, height: 2.5,
    backgroundColor: "rgba(255,255,255,0.30)",
    borderRadius: 2, overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: "rgba(255,255,255,0.94)", borderRadius: 2 },

  header: {
    flexDirection: "row", alignItems: "center",
    gap: 10, paddingHorizontal: 14, paddingBottom: 10, zIndex: 10,
  },
  name: { fontSize: 14, fontWeight: "700", color: "#fff", letterSpacing: -0.2 },
  spec: { fontSize: 11, color: "rgba(255,255,255,0.72)", marginTop: 1 },
  headerBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },

  textOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center", justifyContent: "center",
    bottom: 200,
  },
  textCard: {
    backgroundColor: "rgba(0,0,0,0.50)", borderRadius: 20,
    paddingHorizontal: 24, paddingVertical: 16, maxWidth: 320,
    borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,255,255,0.20)",
  },
  textBody: { color: "#FFF", fontSize: 18, lineHeight: 27, textAlign: "center" },

  centerContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center", justifyContent: "center", gap: 8, bottom: 200,
  },
  initials:   { fontSize: 72, color: "rgba(255,255,255,0.88)", fontWeight: "700" },
  centerName: { fontSize: 22, color: "#fff", fontWeight: "600" },
  centerSpec: { fontSize: 14, color: "rgba(255,255,255,0.72)" },

  emojiPop: {
    position: "absolute", top: "35%", alignSelf: "center",
    fontSize: 88, zIndex: 50,
  },

  tapLayer:  { zIndex: 5 },
  tapHalf:   { flex: 1, height: SH * 0.65 },

  /* ── Bottom bar ── */
  bottomBar: {
    position: "absolute", left: 0, right: 0,
    paddingHorizontal: 14, gap: 8, zIndex: 20,
  },

  reactionsRow: {
    flexDirection: "row", justifyContent: "center", gap: 4,
    backgroundColor: "rgba(0,0,0,0.40)",
    borderRadius: 32, paddingVertical: 7, paddingHorizontal: 10,
    alignSelf: "center",
  },
  reactionBtn: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  reactionBtnActive: { backgroundColor: "rgba(200,160,100,0.40)" },
  reactionText: { fontSize: 22 },
  reactionDot: {
    position: "absolute", bottom: 3,
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: "#C8A064",
  },

  replyRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  replyPill: {
    flex: 1, height: 44, borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.28)",
    justifyContent: "center", paddingHorizontal: 18,
  },
  replyPillText: { color: "rgba(255,255,255,0.65)", fontSize: 14, fontWeight: "400" },
  replyInput: {
    flex: 1, height: 44, borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.28)",
    color: "#fff", paddingHorizontal: 18, fontSize: 14,
  },
  sendBtn: {
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: "#C8A064", borderRadius: 22,
  },
  sendBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  shareBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.20)",
  },

  ownerRow: { flexDirection: "row", gap: 10, justifyContent: "center" },
  ownerBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(0,0,0,0.48)",
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 22,
  },
  ownerBtnDanger: { backgroundColor: "rgba(60,0,0,0.40)" },
  ownerBtnText: { color: "rgba(255,255,255,0.88)", fontSize: 13, fontWeight: "500" },

  hiddenInput: {
    position: "absolute", left: -9999, top: -9999,
    width: 1, height: 1, opacity: 0,
  },
});
