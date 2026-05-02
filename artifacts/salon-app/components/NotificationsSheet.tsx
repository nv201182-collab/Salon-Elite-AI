import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useMemo } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { useData } from "@/contexts/DataContext";
import { EMPLOYEES_SEED } from "@/data/seed";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "./Avatar";

const { height: H } = Dimensions.get("window");
const SHEET_H = H * 0.78;

type NotifItem = {
  id: string;
  type: "like" | "comment" | "follow" | "mention";
  actor: { name: string; initials: string };
  text: string;
  at: number;
};

function timeAgo(at: number) {
  const diff = Date.now() - at;
  const m = Math.round(diff / 60_000);
  if (m < 1) return "только что";
  if (m < 60) return `${m} мин`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ч`;
  return `${Math.round(h / 24)} дн`;
}

type Props = { visible: boolean; onClose: () => void };

export function NotificationsSheet({ visible, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useApp();
  const { posts } = useData();

  const slideAnim = useRef(new Animated.Value(SHEET_H)).current;
  const backdropOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 260 }),
        Animated.timing(backdropOp, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: SHEET_H, duration: 200, useNativeDriver: true }),
        Animated.timing(backdropOp, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  // Build simulated notifications from post activity
  const notifications = useMemo<NotifItem[]>(() => {
    const items: NotifItem[] = [];
    const myPosts = posts.filter((p) => p.authorId === "u_self" || p.authorId === user?.id);

    // Likes on my posts
    myPosts.forEach((p) => {
      p.likedBy.forEach((likerId) => {
        if (likerId === user?.id) return;
        const emp = EMPLOYEES_SEED.find((e) => e.id === likerId);
        if (!emp) return;
        items.push({
          id: `like-${p.id}-${likerId}`,
          type: "like",
          actor: { name: emp.name.split(" ")[0], initials: emp.initials },
          text: `понравилась ваша публикация`,
          at: p.createdAt + Math.round(Math.random() * 3_600_000),
        });
      });
    });

    // Comments on my posts
    myPosts.forEach((p) => {
      p.comments.forEach((c) => {
        if (c.authorId === "u_self") return;
        const emp = EMPLOYEES_SEED.find((e) => e.id === c.authorId);
        if (!emp) return;
        items.push({
          id: `comment-${c.id}`,
          type: "comment",
          actor: { name: emp.name.split(" ")[0], initials: emp.initials },
          text: `прокомментировал(а): «${c.text.slice(0, 40)}${c.text.length > 40 ? "…" : ""}»`,
          at: c.at,
        });
      });
    });

    // Simulated follow notifications from top employees
    EMPLOYEES_SEED.slice(0, 5).forEach((emp, i) => {
      items.push({
        id: `follow-${emp.id}`,
        type: "follow",
        actor: { name: emp.name.split(" ")[0], initials: emp.initials },
        text: "подписался(ась) на вас",
        at: Date.now() - i * 3_600_000 * 4,
      });
    });

    return items.sort((a, b) => b.at - a.at).slice(0, 40);
  }, [posts, user]);

  const notifIcon = (type: NotifItem["type"]) => {
    if (type === "like") return { name: "heart" as const, color: "#FF3B6F" };
    if (type === "comment") return { name: "message-circle" as const, color: "#C8A064" };
    if (type === "follow") return { name: "user-plus" as const, color: "#7C6FD4" };
    return { name: "at-sign" as const, color: "#C8A064" };
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOp }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

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

        {/* Title */}
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Активность
          </Text>
          <View style={{ flex: 1 }} />
          <Pressable onPress={onClose} hitSlop={14}>
            <Feather name="x" size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {/* Notification list */}
        <FlatList
          data={notifications}
          keyExtractor={(n) => n.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="bell" size={36} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Пока тихо
              </Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Уведомления появятся здесь
              </Text>
            </View>
          }
          renderItem={({ item: n, index }) => {
            const icon = notifIcon(n.type);
            const isNew = index < 3;
            return (
              <View
                style={[
                  styles.notifRow,
                  {
                    backgroundColor: isNew ? "rgba(200,160,100,0.06)" : "transparent",
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.avatarWrap}>
                  <Avatar initials={n.actor.initials} size={40} />
                  <View style={[styles.notifIconBadge, { backgroundColor: colors.background }]}>
                    <Feather name={icon.name} size={12} color={icon.color} />
                  </View>
                </View>
                <View style={styles.notifBody}>
                  <Text style={[styles.notifText, { color: colors.foreground }]}>
                    <Text style={{ fontFamily: "Inter_600SemiBold" }}>{n.actor.name} </Text>
                    <Text style={{ fontFamily: "Inter_400Regular" }}>{n.text}</Text>
                  </Text>
                  <Text style={[styles.notifTime, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {timeAgo(n.at)}
                  </Text>
                </View>
                {isNew && (
                  <View style={[styles.newDot, { backgroundColor: "#C8A064" }]} />
                )}
              </View>
            );
          }}
        />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    height: SHEET_H,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    shadowColor: "#000", shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.16, shadowRadius: 24, elevation: 24,
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },
  handleWrap: { alignItems: "center", paddingTop: 12, paddingBottom: 2 },
  handle: { width: 40, height: 4, borderRadius: 2 },
  titleRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 10,
  },
  title: { fontSize: 18, letterSpacing: -0.3 },
  listContent: { paddingTop: 4 },
  notifRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, gap: 12,
  },
  avatarWrap: { position: "relative" },
  notifIconBadge: {
    position: "absolute", bottom: -2, right: -2,
    width: 20, height: 20, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.8)",
  },
  notifBody: { flex: 1, gap: 3 },
  notifText: { fontSize: 14, lineHeight: 19 },
  notifTime: { fontSize: 12 },
  newDot: { width: 8, height: 8, borderRadius: 4 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 16 },
  emptyText: { fontSize: 14 },
});
