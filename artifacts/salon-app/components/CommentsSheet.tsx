import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
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
const SHEET_H = H * 0.72;
const QUICK_EMOJIS = ["❤️", "🔥", "😍", "👏", "✨", "😊", "💯", "🙌"];

type Props = { post: Post | null; visible: boolean; onClose: () => void };

function timeAgo(at: number) {
  const diff = Date.now() - at;
  const m = Math.round(diff / 60_000);
  if (m < 1) return "только что";
  if (m < 60) return `${m} мин`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ч`;
  return `${Math.round(h / 24)} дн`;
}

export function CommentsSheet({ post, visible, onClose }: Props) {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const { user } = useApp();
  const { addComment } = useData();

  const [text, setText]         = useState("");
  const [replyTo, setReplyTo]   = useState<string | null>(null); // имя того, кому отвечают
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const inputRef = useRef<TextInput>(null);
  const listRef  = useRef<FlatList>(null);

  const slideAnim    = useRef(new Animated.Value(SHEET_H)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 260, mass: 0.9 }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 240, useNativeDriver: true }),
      ]).start();
    } else {
      Keyboard.dismiss();
      setText("");
      setReplyTo(null);
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: SHEET_H, duration: 210, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 190, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  function handleSend() {
    if (!post || !text.trim()) return;
    addComment(post.id, text.trim());
    setText("");
    setReplyTo(null);
    Keyboard.dismiss();
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 150);
  }

  function handleQuickEmoji(emoji: string) {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  }

  function toggleLikeComment(id: string) {
    setLikedComments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function startReply(name: string) {
    setReplyTo(name);
    setText(`@${name} `);
    inputRef.current?.focus();
  }

  const comments = post?.comments ?? [];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[styles.sheet, { backgroundColor: colors.background, transform: [{ translateY: slideAnim }] }]}>
        {/* Handle */}
        <View style={styles.handleWrap}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>

        {/* Title */}
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Комментарии
          </Text>
          <Text style={[styles.count, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {comments.length}
          </Text>
          <View style={{ flex: 1 }} />
          <Pressable onPress={onClose} hitSlop={14}>
            <Feather name="x" size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {/* Likes summary */}
        {post && post.likedBy.length > 0 && (
          <View style={styles.likesSummary}>
            <Feather name="heart" size={13} color="#FF3B6F" />
            <Text style={[styles.likesSummaryText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Нравится <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{post.likedBy.length} людям</Text>
            </Text>
          </View>
        )}

        {/* Comments list */}
        <FlatList
          ref={listRef}
          data={comments}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="message-circle" size={36} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Комментариев пока нет
              </Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Будьте первым!
              </Text>
            </View>
          }
          renderItem={({ item: c }) => {
            const author =
              c.authorId === "u_self"
                ? { name: user?.name ?? "Вы", initials: user?.initials ?? "M" }
                : EMPLOYEES_SEED.find((e) => e.id === c.authorId);
            const isLiked = likedComments.has(c.id);
            return (
              <View style={styles.commentRow}>
                <Avatar initials={author?.initials ?? "?"} size={32} />
                <View style={styles.commentBody}>
                  <View style={[styles.bubble, { backgroundColor: "rgba(255,255,255,0.62)", borderColor: "rgba(255,255,255,0.68)" }]}>
                    <Text style={[styles.commentAuthor, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                      {author?.name ?? "Мастер"}
                    </Text>
                    <Text style={[styles.commentText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                      {c.text}
                    </Text>
                  </View>
                  <View style={styles.commentMeta}>
                    <Text style={[styles.commentTime, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {timeAgo(c.at)}
                    </Text>
                    <TouchableOpacity onPress={() => startReply(author?.name ?? "Мастер")} hitSlop={8}>
                      <Text style={[styles.replyBtn, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                        Ответить
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {/* Like comment */}
                <TouchableOpacity onPress={() => toggleLikeComment(c.id)} hitSlop={10} style={styles.commentLike}>
                  <Feather name="heart" size={14} color={isLiked ? "#FF3B6F" : colors.mutedForeground} />
                </TouchableOpacity>
              </View>
            );
          }}
        />

        {/* Bottom input area */}
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0}>
          {/* Quick emoji bar */}
          <View style={[styles.emojiBar, { borderTopColor: colors.border }]}>
            {QUICK_EMOJIS.map((e) => (
              <TouchableOpacity key={e} onPress={() => handleQuickEmoji(e)} style={styles.emojiPill} hitSlop={4}>
                <Text style={styles.emojiText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Reply indicator */}
          {replyTo && (
            <View style={[styles.replyIndicator, { backgroundColor: colors.card }]}>
              <Text style={[styles.replyIndicatorText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Ответ <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>@{replyTo}</Text>
              </Text>
              <TouchableOpacity onPress={() => { setReplyTo(null); setText(""); }} hitSlop={8}>
                <Feather name="x" size={14} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          )}

          {/* Input row */}
          <View style={[styles.inputRow, { borderTopColor: colors.border, paddingBottom: insets.bottom + 6 }]}>
            <Avatar initials={user?.initials ?? "M"} size={30} />
            <TextInput
              ref={inputRef}
              style={[styles.input, { backgroundColor: "rgba(255,255,255,0.55)", color: colors.foreground, fontFamily: "Inter_400Regular", borderColor: "rgba(255,255,255,0.72)" }]}
              placeholder="Написать комментарий…"
              placeholderTextColor={colors.mutedForeground}
              returnKeyType="send"
              value={text}
              onChangeText={setText}
              onSubmitEditing={handleSend}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: text.trim() ? "#C8A064" : colors.border }]}
              onPress={handleSend}
              disabled={!text.trim()}
              activeOpacity={0.8}
            >
              <Feather name="send" size={15} color={text.trim() ? "#fff" : colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.48)" },
  sheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    height: SHEET_H,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    shadowColor: "#000", shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18, shadowRadius: 24, elevation: 24,
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },
  handleWrap: { alignItems: "center", paddingTop: 12, paddingBottom: 2 },
  handle: { width: 40, height: 4, borderRadius: 2 },
  titleRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 10, gap: 8,
  },
  title: { fontSize: 17, letterSpacing: -0.3 },
  count: { fontSize: 14 },
  likesSummary: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 20, paddingBottom: 10,
  },
  likesSummaryText: { fontSize: 13 },
  listContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 16 },
  empty: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyTitle: { fontSize: 16 },
  emptyText: { fontSize: 14 },
  commentRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  commentBody: { flex: 1, gap: 5 },
  bubble: { borderRadius: 16, padding: 10, borderWidth: 1, gap: 3 },
  commentAuthor: { fontSize: 12 },
  commentText: { fontSize: 13, lineHeight: 19 },
  commentMeta: { flexDirection: "row", alignItems: "center", gap: 16, paddingLeft: 4 },
  commentTime: { fontSize: 11 },
  replyBtn: { fontSize: 11 },
  commentLike: { paddingTop: 4, paddingLeft: 4 },
  emojiBar: {
    flexDirection: "row", paddingHorizontal: 12, paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth, gap: 4,
  },
  emojiPill: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingVertical: 4, borderRadius: 12,
  },
  emojiText: { fontSize: 22 },
  replyIndicator: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 8,
  },
  replyIndicatorText: { fontSize: 13 },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1, minHeight: 38, maxHeight: 88,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    fontSize: 13, borderWidth: 1,
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
});
