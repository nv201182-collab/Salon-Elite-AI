/**
 * CommentsSheet — Instagram 2026-style comment panel.
 *
 * Keyboard handling: we listen to native keyboard events and animate
 * the input area upward independently of the slide-in transform.
 * This avoids mixing native-driver and JS-driver on the same view.
 *
 * Layout:
 *   [handle]
 *   [title · count · ✕]
 *   [likes summary]
 *   [FlatList · flex:1]          ← shrinks when keyboard shows
 *   [emoji quick-bar]            ← slides up with keyboard
 *   [reply-to banner?]
 *   [avatar · input · send]      ← stays above keyboard
 */
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { useData } from "@/contexts/DataContext";
import { EMPLOYEES_SEED, type Post } from "@/data/seed";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "./Avatar";

const { height: H } = Dimensions.get("window");
const SHEET_H = H * 0.80;
const QUICK_EMOJIS = ["❤️", "🔥", "😂", "😮", "😢", "👏", "💕", "🤩"];

function timeAgo(at: number) {
  const diff = Date.now() - at;
  const m = Math.round(diff / 60_000);
  if (m < 1) return "только что";
  if (m < 60) return `${m} мин`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ч`;
  return `${Math.round(h / 24)} дн`;
}

type Props = { post: Post | null; visible: boolean; onClose: () => void };

export function CommentsSheet({ post, visible, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user }      = useApp();
  const { addComment } = useData();

  const [text, setText]   = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const inputRef = useRef<TextInput>(null);
  const listRef  = useRef<FlatList>(null);

  // ── Slide-in/out (native driver) ──────────────────────────
  const slideAnim   = useRef(new Animated.Value(SHEET_H)).current;
  const backdropOp  = useRef(new Animated.Value(0)).current;

  // ── Keyboard animation (JS driver, separate view) ─────────
  const kbOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0, useNativeDriver: true,
          damping: 26, stiffness: 280, mass: 0.9,
        }),
        Animated.timing(backdropOp, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Keyboard.dismiss();
      setText(""); setReplyTo(null); setEditingId(null);
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: SHEET_H, duration: 200, useNativeDriver: true }),
        Animated.timing(backdropOp, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  // Keyboard listeners — animate bottom offset for the input area
  useEffect(() => {
    const isIOS = Platform.OS === "ios";
    const showEvent = isIOS ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = isIOS ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = Keyboard.addListener(showEvent, (e) => {
      const duration = isIOS ? (e.duration ?? 280) : 220;
      Animated.timing(kbOffset, {
        toValue: e.endCoordinates.height - insets.bottom,
        duration,
        useNativeDriver: false,
      }).start(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    });

    const onHide = Keyboard.addListener(hideEvent, (e) => {
      const duration = isIOS ? (e.duration ?? 240) : 200;
      Animated.timing(kbOffset, { toValue: 0, duration, useNativeDriver: false }).start();
    });

    return () => { onShow.remove(); onHide.remove(); };
  }, [insets.bottom, kbOffset]);

  function handleSend() {
    if (!post || !text.trim()) return;
    if (editingId) {
      // Comment editing — not persisted to DataContext in this version
      setEditingId(null);
    } else {
      addComment(post.id, text.trim());
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 180);
    }
    setText(""); setReplyTo(null);
    Keyboard.dismiss();
  }

  function handleQuickEmoji(emoji: string) {
    setText((p) => p + emoji);
    inputRef.current?.focus();
  }

  function toggleLikeComment(id: string) {
    setLikedComments((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function startReply(name: string) {
    setReplyTo(name);
    setText(`@${name} `);
    inputRef.current?.focus();
  }

  function startEdit(id: string, currentText: string) {
    setEditingId(id);
    setText(currentText);
    inputRef.current?.focus();
  }

  function cancelInput() {
    setText(""); setReplyTo(null); setEditingId(null);
    Keyboard.dismiss();
  }

  const comments = post?.comments ?? [];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOp }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={() => {
          Keyboard.dismiss();
          onClose();
        }} />
      </Animated.View>

      {/* Sheet — translateY is native driver */}
      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: colors.background, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleWrap}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>

        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Комментарии
          </Text>
          <Text style={[styles.count, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {comments.length}
          </Text>
          <View style={{ flex: 1 }} />
          <Pressable onPress={onClose} hitSlop={16}>
            <Feather name="x" size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {/* Likes summary */}
        {post && post.likedBy.length > 0 && (
          <View style={styles.likesSummary}>
            <Feather name="heart" size={13} color="#FF3B6F" />
            <Text style={[styles.likesSummaryText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Нравится{" "}
              <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                {post.likedBy.length.toLocaleString("ru-RU")} людям
              </Text>
            </Text>
          </View>
        )}

        {/* Comment list — flex:1 so it shrinks when input needs space */}
        <FlatList
          ref={listRef}
          style={styles.list}
          data={comments}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="message-circle" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Комментариев пока нет
              </Text>
              <Text style={[styles.emptyHint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Оставьте первый!
              </Text>
            </View>
          }
          renderItem={({ item: c }) => {
            const isOwn = c.authorId === "u_self" || c.authorId === user?.id;
            const author = isOwn
              ? { name: user?.name ?? "Вы", initials: user?.initials ?? "M" }
              : EMPLOYEES_SEED.find((e) => e.id === c.authorId);
            const isLiked = likedComments.has(c.id);
            const canEdit = isOwn && Date.now() - c.at < 15 * 60_000;

            return (
              <View style={styles.commentRow}>
                <Avatar initials={author?.initials ?? "?"} size={34} />
                <View style={styles.commentBody}>
                  {/* bubble */}
                  <View
                    style={[
                      styles.bubble,
                      {
                        backgroundColor: colors.secondary,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.commentAuthor, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                      {author?.name ?? "Мастер"}
                    </Text>
                    <Text style={[styles.commentText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                      {c.text}
                    </Text>
                  </View>

                  {/* meta row */}
                  <View style={styles.commentMeta}>
                    <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {timeAgo(c.at)}
                    </Text>
                    <TouchableOpacity onPress={() => startReply(author?.name ?? "Мастер")} hitSlop={8}>
                      <Text style={[styles.metaBtn, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                        Ответить
                      </Text>
                    </TouchableOpacity>
                    {canEdit && (
                      <TouchableOpacity onPress={() => startEdit(c.id, c.text)} hitSlop={8}>
                        <Text style={[styles.metaBtn, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                          Изменить
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Like comment */}
                <TouchableOpacity onPress={() => toggleLikeComment(c.id)} hitSlop={12} style={styles.commentLike}>
                  <Feather
                    name={isLiked ? "heart" : "heart"}
                    size={14}
                    color={isLiked ? "#FF3B6F" : colors.mutedForeground}
                  />
                  {isLiked && (
                    <Text style={[styles.likeCount, { color: "#FF3B6F", fontFamily: "Inter_600SemiBold" }]}>1</Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          }}
        />

        {/* ── Input area — moves up with keyboard via kbOffset ── */}
        <Animated.View style={[styles.inputWrap, { paddingBottom: Animated.add(kbOffset, insets.bottom + 6) }]}>
          {/* Quick emoji bar */}
          <View style={[styles.emojiBar, { borderTopColor: colors.border }]}>
            {QUICK_EMOJIS.map((e) => (
              <TouchableOpacity key={e} onPress={() => handleQuickEmoji(e)} style={styles.emojiPill} hitSlop={4}>
                <Text style={styles.emojiText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Reply/Edit indicator */}
          {(replyTo || editingId) && (
            <View style={[styles.replyBar, { backgroundColor: colors.secondary }]}>
              <Feather
                name={editingId ? "edit-2" : "corner-down-right"}
                size={13}
                color={colors.mutedForeground}
              />
              <Text style={[styles.replyBarText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {editingId
                  ? "Редактирование комментария"
                  : `Ответ @${replyTo}`}
              </Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={cancelInput} hitSlop={10}>
                <Feather name="x" size={15} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          )}

          {/* Text input row */}
          <View style={[styles.inputRow, { borderTopColor: colors.border }]}>
            <Avatar initials={user?.initials ?? "M"} size={32} />
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                {
                  backgroundColor: colors.secondary,
                  color: colors.foreground,
                  fontFamily: "Inter_400Regular",
                  borderColor: colors.border,
                },
              ]}
              placeholder="Написать комментарий…"
              placeholderTextColor={colors.mutedForeground}
              returnKeyType="send"
              value={text}
              onChangeText={setText}
              onSubmitEditing={handleSend}
              multiline
              maxLength={500}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                { backgroundColor: text.trim() ? "#C8A064" : colors.border },
              ]}
              onPress={handleSend}
              disabled={!text.trim()}
              activeOpacity={0.8}
            >
              <Feather
                name={editingId ? "check" : "send"}
                size={15}
                color={text.trim() ? "#fff" : colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  sheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    height: SHEET_H,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.60)",
  },
  handleWrap:  { alignItems: "center", paddingTop: 12, paddingBottom: 2 },
  handle:      { width: 36, height: 4, borderRadius: 2 },
  titleRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 10, gap: 8,
  },
  title: { fontSize: 17, letterSpacing: -0.3 },
  count: { fontSize: 14 },
  likesSummary: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 20, paddingBottom: 8,
  },
  likesSummaryText: { fontSize: 13 },

  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 18 },

  empty: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyTitle: { fontSize: 16 },
  emptyHint:  { fontSize: 14 },

  commentRow:  { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  commentBody: { flex: 1, gap: 5 },
  bubble: {
    borderRadius: 18, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth, gap: 3,
  },
  commentAuthor: { fontSize: 12 },
  commentText:   { fontSize: 14, lineHeight: 20 },
  commentMeta:   { flexDirection: "row", alignItems: "center", gap: 16, paddingLeft: 4 },
  metaText:      { fontSize: 11 },
  metaBtn:       { fontSize: 11 },
  commentLike:   { paddingTop: 4, paddingLeft: 4, alignItems: "center", gap: 2 },
  likeCount:     { fontSize: 10 },

  inputWrap: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "transparent" },
  emojiBar: {
    flexDirection: "row", paddingHorizontal: 10, paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth, gap: 2,
  },
  emojiPill: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingVertical: 4, borderRadius: 10,
  },
  emojiText: { fontSize: 22 },
  replyBar: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 8, gap: 8,
  },
  replyBarText: { fontSize: 13 },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1, minHeight: 40, maxHeight: 96,
    borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, borderWidth: StyleSheet.hairlineWidth,
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
  },
});
