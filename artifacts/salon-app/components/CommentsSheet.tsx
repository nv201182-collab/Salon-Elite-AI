/**
 * Slide-up bottom sheet showing post comments.
 * - Swipe down or tap backdrop to dismiss
 * - Pull handle at top
 */
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { EMPLOYEES_SEED, type Post } from "@/data/seed";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "./Avatar";

const { height: H } = Dimensions.get("window");
const SHEET_H = H * 0.68;

type Props = {
  post: Post | null;
  visible: boolean;
  onClose: () => void;
};

function timeAgo(at: number) {
  const diff = Date.now() - at;
  const h = Math.round(diff / 3_600_000);
  if (h < 1) return "только что";
  if (h < 24) return `${h} ч`;
  return `${Math.round(h / 24)} дн`;
}

export function CommentsSheet({ post, visible, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useApp();

  const slideAnim = useRef(new Animated.Value(SHEET_H)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 260,
          mass: 0.9,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Keyboard.dismiss();
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SHEET_H,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropOpacity]);

  const comments = post?.comments ?? [];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.card,
            transform: [{ translateY: slideAnim }],
            paddingBottom: insets.bottom + 8,
          },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleWrap}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>

        {/* Title */}
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Комментарии
          </Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Feather name="x" size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {/* Comments list */}
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {comments.length === 0 ? (
            <View style={styles.empty}>
              <Feather name="message-circle" size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Пока нет комментариев
              </Text>
            </View>
          ) : (
            comments.map((c) => {
              const author =
                c.authorId === "u_self"
                  ? { name: user?.name ?? "Вы", initials: user?.initials ?? "M" }
                  : EMPLOYEES_SEED.find((e) => e.id === c.authorId);
              return (
                <View key={c.id} style={styles.commentRow}>
                  <Avatar initials={author?.initials ?? "?"} size={34} />
                  <View style={styles.commentBubble}>
                    <View style={[styles.bubbleBg, { backgroundColor: "rgba(255,255,255,0.62)", borderColor: "rgba(255,255,255,0.72)" }]}>
                      <Text style={[styles.commentAuthor, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                        {author?.name ?? "Мастер"}
                      </Text>
                      <Text style={[styles.commentText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                        {c.text}
                      </Text>
                    </View>
                    <Text style={[styles.commentTime, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {timeAgo(c.at)}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Reply input */}
        <View style={[styles.inputRow, { borderTopColor: colors.border }]}>
          <Avatar initials={user?.initials ?? "M"} size={30} />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: "rgba(255,255,255,0.55)",
                color: colors.foreground,
                fontFamily: "Inter_400Regular",
                borderColor: "rgba(255,255,255,0.72)",
              },
            ]}
            placeholder="Оставить комментарий…"
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="send"
          />
          <Pressable style={[styles.sendBtn, { backgroundColor: colors.pink }]} hitSlop={8}>
            <Feather name="send" size={15} color="#fff" />
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_H,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 24,
  },
  handleWrap: { alignItems: "center", paddingTop: 10, paddingBottom: 2 },
  handle: { width: 36, height: 4, borderRadius: 2 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: { fontSize: 17 },
  listContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12, gap: 14 },
  empty: { alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 14 },
  commentRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  commentBubble: { flex: 1, gap: 4 },
  bubbleBg: {
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    gap: 2,
  },
  commentAuthor: { fontSize: 12 },
  commentText: { fontSize: 13, lineHeight: 18 },
  commentTime: { fontSize: 11, paddingLeft: 4 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 14,
    fontSize: 13,
    borderWidth: 1,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
