import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { GlassCard } from "@/components/GlassCard";
import { LevelBar } from "@/components/LevelBar";
import { FocusFadeView } from "@/components/FocusFadeView";
import { LiquidBg } from "@/components/LiquidBg";
import { PressableScale } from "@/components/PressableScale";
import { StatCard } from "@/components/StatCard";
import { CommentsSheet } from "@/components/CommentsSheet";
import { getLevel, getRoleLabel, useApp, type UserRole } from "@/contexts/AppContext";
import * as Haptics from "expo-haptics";
import { useData } from "@/contexts/DataContext";
import { useTabBar } from "@/contexts/TabBarContext";
import { type Post } from "@/data/seed";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_W } = Dimensions.get("window");
const GRID_GAP = 1.5;
const GRID_CELL = (SCREEN_W - GRID_GAP * 2) / 3;

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "employee", label: "Сотрудник" },
  { value: "manager", label: "Руководитель" },
  { value: "hq", label: "HQ" },
];

const HIGHLIGHTS = [
  { id: "h1", label: "Лучшее", icon: "star" },
  { id: "h2", label: "Работы", icon: "scissors" },
  { id: "h3", label: "Курсы", icon: "book-open" },
  { id: "h4", label: "Команда", icon: "users" },
];

type GridTab = "posts" | "tagged";

function fmtTime(at: number): string {
  const diff = Date.now() - at;
  const h = Math.round(diff / 3600_000);
  if (h < 1) return "только что";
  if (h < 24) return `${h} ч назад`;
  const d = Math.round(h / 24);
  return `${d} дн назад`;
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout, pointsHistory, setRole, setAvatarUri } = useApp();
  const { courses, posts, getCourseProgress, salons, achievements } = useData();
  const { onScroll } = useTabBar();
  const [gridTab, setGridTab] = useState<GridTab>("posts");
  const [openPost, setOpenPost] = useState<Post | null>(null);

  if (!user) return null;

  const completedCount = courses.filter((c) => getCourseProgress(c.id).ratio >= 1).length;
  const myPosts = posts.filter((p) => p.authorId === user.id || p.authorId === "u_self");
  const salonName = salons.find((s) => s.id === user.salonId)?.name ?? "APIA";
  const isManager = user.role !== "employee";
  const level = getLevel(user.points);

  // Derive followers/following from points + employees count
  const followersCount = Math.min(980, Math.round(user.points * 0.4 + 48));
  const followingCount = 62;

  const pickAvatar = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Доступ к фото", "Разрешите доступ к галерее в настройках.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  }, [setAvatarUri]);

  const onLogout = () => {
    Alert.alert("Выйти из APIA?", "Учётные данные будут удалены с устройства.", [
      { text: "Отмена", style: "cancel" },
      { text: "Выйти", style: "destructive", onPress: async () => { await logout(); router.replace("/login"); } },
    ]);
  };

  const headerPad = insets.top + (Platform.OS === "web" ? 56 : 12);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 84 : 100);

  const handleScroll = useCallback((e: { nativeEvent: { contentOffset: { y: number } } }) => {
    onScroll(e.nativeEvent.contentOffset.y);
  }, [onScroll]);

  return (
    <FocusFadeView style={{ flex: 1 }}>
      <LiquidBg />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        {/* ── Top bar ─────────────────────────────────────── */}
        <View style={[styles.topBar, { paddingTop: headerPad }]}>
          <Text style={[styles.topBarHandle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {user.name.split(" ")[0].toLowerCase()}_{user.name.split(" ")[1]?.toLowerCase() ?? ""}
          </Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.topIcon} onPress={() => router.push("/post/new")}>
            <Feather name="plus-square" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topIcon}>
            <Feather name="menu" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* ── Profile info ─────────────────────────────────── */}
        <View style={styles.profileSection}>
          {/* Avatar + stats */}
          <View style={styles.avatarStatsRow}>
            <TouchableOpacity onPress={pickAvatar} activeOpacity={0.85}>
              <View style={[styles.avatarRing, { borderColor: "rgba(200,160,100,0.60)" }]}>
                <Avatar
                  initials={user.initials}
                  size={82}
                  variant="gold"
                  avatarUri={user.avatarUri}
                />
              </View>
              {/* Camera badge */}
              <View style={styles.cameraBadge}>
                <Feather name="camera" size={12} color="#fff" />
              </View>
            </TouchableOpacity>
            <View style={styles.statsCol}>
              <StatItem value={String(myPosts.length)} label="Публикации" />
              <StatItem value={followersCount >= 1000 ? `${(followersCount / 1000).toFixed(1)}K` : String(followersCount)} label="Подписчики" />
              <StatItem value={String(followingCount)} label="Подписки" />
            </View>
          </View>

          {/* Name & bio */}
          <Text style={[styles.name, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {user.name}
          </Text>
          <Text style={[styles.bioLine, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {user.specialty} · {salonName}
          </Text>
          <Text style={[styles.bioLine, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
            ✨ {level.label} · {user.points.toLocaleString("ru-RU")} баллов
          </Text>

          {/* Action buttons */}
          <View style={styles.actionBtns}>
            <TouchableOpacity style={[styles.editBtn, { backgroundColor: "rgba(255,255,255,0.72)", borderColor: "rgba(200,160,100,0.35)" }]}>
              <Text style={[styles.editBtnText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Редактировать профиль
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareBtn, { backgroundColor: "rgba(255,255,255,0.72)", borderColor: "rgba(200,160,100,0.35)" }]}>
              <Feather name="user-plus" size={16} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Story highlights ─────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.highlightsRow}
        >
          {HIGHLIGHTS.map((h) => (
            <TouchableOpacity key={h.id} style={styles.highlightItem}>
              <LinearGradient
                colors={["rgba(200,160,100,0.25)", "rgba(139,94,60,0.20)"]}
                style={styles.highlightRing}
              >
                <View style={[styles.highlightInner, { backgroundColor: "rgba(248,243,236,0.92)" }]}>
                  <Feather name={h.icon as any} size={22} color="#C8A064" />
                </View>
              </LinearGradient>
              <Text style={[styles.highlightLabel, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                {h.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.highlightItem}>
            <View style={[styles.highlightRing, { backgroundColor: "rgba(255,255,255,0.55)", borderWidth: 1.5, borderColor: "rgba(200,160,100,0.30)", borderRadius: 32 }]}>
              <View style={[styles.highlightInner, { backgroundColor: "transparent" }]}>
                <Feather name="plus" size={22} color={colors.mutedForeground} />
              </View>
            </View>
            <Text style={[styles.highlightLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Добавить
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ── Grid tab bar ─────────────────────────────────── */}
        <View style={[styles.gridTabs, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.gridTab, gridTab === "posts" && { borderBottomWidth: 1.5, borderBottomColor: colors.foreground }]}
            onPress={() => setGridTab("posts")}
          >
            <MaterialCommunityIcons name="grid" size={22} color={gridTab === "posts" ? colors.foreground : colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.gridTab, gridTab === "tagged" && { borderBottomWidth: 1.5, borderBottomColor: colors.foreground }]}
            onPress={() => setGridTab("tagged")}
          >
            <MaterialCommunityIcons name="tag-outline" size={22} color={gridTab === "tagged" ? colors.foreground : colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* ── 3-column post grid ───────────────────────────── */}
        {gridTab === "posts" ? (
          myPosts.length > 0 ? (
            <View style={styles.grid}>
              {myPosts.map((p, i) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setOpenPost(p)}
                  style={[
                    styles.gridCell,
                    { marginRight: (i + 1) % 3 === 0 ? 0 : GRID_GAP, marginBottom: GRID_GAP },
                  ]}
                >
                  <Image
                    source={p.image}
                    style={{ width: GRID_CELL, height: GRID_CELL }}
                    contentFit="cover"
                  />
                  {p.video && (
                    <View style={styles.gridVideoIcon}>
                      <Feather name="video" size={12} color="#fff" />
                    </View>
                  )}
                  {/* Likes overlay */}
                  <View style={styles.gridOverlay}>
                    <Feather name="heart" size={13} color="#fff" />
                    <Text style={[styles.gridOverlayText, { fontFamily: "Inter_600SemiBold" }]}>
                      {p.likedBy.length}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyGrid}>
              <Feather name="camera" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyGridTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Нет публикаций
              </Text>
              <TouchableOpacity onPress={() => router.push("/post/new")}>
                <Text style={[styles.emptyGridLink, { color: "#C8A064", fontFamily: "Inter_600SemiBold" }]}>
                  Опубликовать первую работу
                </Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          <View style={styles.emptyGrid}>
            <MaterialCommunityIcons name="tag-outline" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyGridTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Отметок пока нет
            </Text>
          </View>
        )}

        {/* ── Level & Points ──────────────────────────────── */}
        <GlassCard style={{ marginHorizontal: 16, marginTop: 24 }} borderRadius={24}>
          <LevelBar points={user.points} compact />
        </GlassCard>

        <View style={styles.statsRow}>
          <StatCard label="Уровень" value={level.label} />
          <StatCard label="Баллы" value={user.points.toLocaleString("ru-RU")} accent />
        </View>
        <View style={styles.statsRow}>
          <StatCard label="Курсов" value={String(completedCount)} hint={`из ${courses.length}`} />
          <StatCard label="Публикаций" value={String(myPosts.length)} hint="всего" />
        </View>

        {/* ── Role switcher ────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
            Режим доступа
          </Text>
          <View style={styles.chipsRow}>
            {ROLE_OPTIONS.map((r) => (
              <TouchableOpacity
                key={r.value}
                onPress={() => setRole(r.value)}
                style={[
                  styles.roleChip,
                  {
                    backgroundColor: user.role === r.value ? "#C8A064" : "rgba(255,255,255,0.55)",
                    borderColor: user.role === r.value ? "#C8A064" : "rgba(200,160,100,0.35)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.roleChipText,
                    {
                      color: user.role === r.value ? "#fff" : colors.foreground,
                      fontFamily: user.role === r.value ? "Inter_600SemiBold" : "Inter_400Regular",
                    },
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Menu ────────────────────────────────────────── */}
        <View style={styles.menu}>
          <MenuItem icon="zap" label="AI ассистент" sub="Скрипты, подсказки, обучение" onPress={() => router.push("/ai")} />
          <MenuItem icon="award" label="Конкурсы" sub="Активные и закрытые" onPress={() => router.push("/contests")} />
          {isManager && (
            <MenuItem icon="bar-chart-2" label="Аналитика команды" sub="Доступ для руководителей" onPress={() => router.push("/analytics")} />
          )}
          <MenuItem icon="log-out" label="Выйти" sub={user.phone} onPress={onLogout} destructive />
        </View>

        {/* ── Achievements ─────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>Достижения</Text>
          <Text style={[styles.hint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {achievements.filter((a) => user.points >= a.threshold).length} из {achievements.length} открыто.
          </Text>
          <View style={styles.achGrid}>
            {achievements.map((a) => {
              const unlocked =
                (a.id.startsWith("a_top_") && user.points >= a.threshold) ||
                (a.id === "a_first_post" && myPosts.length >= 1) ||
                (a.id === "a_ten_posts" && myPosts.length >= 10) ||
                (a.id === "a_first_course" && completedCount >= 1) ||
                (a.id === "a_five_courses" && completedCount >= 5);
              return (
                <GlassCard
                  key={a.id}
                  style={{ width: "48%", opacity: unlocked ? 1 : 0.5 }}
                  innerStyle={{ gap: 6, padding: 14 }}
                  borderRadius={18}
                  tintOpacity={unlocked ? 0.28 : 0.15}
                >
                  <View style={[styles.achIcon, { backgroundColor: unlocked ? "rgba(200,160,100,0.18)" : "rgba(0,0,0,0.04)" }]}>
                    <Feather name={a.icon as keyof typeof Feather.glyphMap} size={18} color={unlocked ? "#C8A064" : colors.mutedForeground} />
                  </View>
                  <Text numberOfLines={2} style={[styles.achTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{a.title}</Text>
                  <Text numberOfLines={2} style={[styles.achSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{a.description}</Text>
                  <Text style={[styles.achReward, { color: "#C8A064", fontFamily: "Inter_600SemiBold" }]}>+{a.reward}</Text>
                </GlassCard>
              );
            })}
          </View>
        </View>

        {/* ── Points history ───────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>Последние баллы</Text>
          {pointsHistory.length === 0 ? (
            <Text style={[styles.hint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Пока пусто. Завершите урок или опубликуйте работу — баллы появятся здесь.
            </Text>
          ) : (
            <GlassCard borderRadius={18} innerStyle={{ padding: 0, paddingHorizontal: 16 }}>
              {pointsHistory.slice(0, 8).map((rec, idx) => (
                <View
                  key={rec.id}
                  style={[styles.histRow, idx > 0 ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(200,160,100,0.20)" } : null]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.histReason, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{rec.reason}</Text>
                    <Text style={[styles.histTime, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{fmtTime(rec.at)}</Text>
                  </View>
                  <Text style={[styles.histPts, { color: "#C8A064", fontFamily: "Inter_600SemiBold" }]}>+{rec.amount}</Text>
                </View>
              ))}
            </GlassCard>
          )}
        </View>
      </ScrollView>

      {/* Post detail overlay (comments) */}
      <CommentsSheet post={openPost} visible={!!openPost} onClose={() => setOpenPost(null)} />
    </FocusFadeView>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  const colors = useColors();
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{label}</Text>
    </View>
  );
}

function MenuItem({ icon, label, sub, onPress, destructive }: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  sub: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  const colors = useColors();
  const fg = destructive ? colors.destructive : colors.foreground;
  return (
    <GlassCard onPress={onPress} scaleTo={0.99} borderRadius={18} innerStyle={styles.menuInner}>
      <View style={[styles.menuIcon, { backgroundColor: destructive ? "rgba(229,72,77,0.12)" : "rgba(200,160,100,0.15)" }]}>
        <Feather name={icon} size={18} color={destructive ? colors.destructive : "#C8A064"} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, { color: fg, fontFamily: "Inter_600SemiBold" }]}>{label}</Text>
        <Text style={[styles.menuSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{sub}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 8, gap: 4,
  },
  topBarHandle: { fontSize: 20, letterSpacing: -0.3 },
  topIcon: { padding: 6 },

  profileSection: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 8 },
  avatarStatsRow: { flexDirection: "row", alignItems: "center", gap: 24 },
  avatarRing: {
    width: 98, height: 98, borderRadius: 49,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2.5,
  },
  cameraBadge: {
    position: "absolute", bottom: 2, right: 2,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "#C8A064",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#fff",
  },
  statsCol: { flex: 1, flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center", gap: 2 },
  statValue: { fontSize: 18, letterSpacing: -0.3 },
  statLabel: { fontSize: 11, letterSpacing: 0.1, textAlign: "center" },

  name: { fontSize: 15, letterSpacing: -0.1, marginTop: 4 },
  bioLine: { fontSize: 13, lineHeight: 18 },

  actionBtns: { flexDirection: "row", gap: 8, marginTop: 4 },
  editBtn: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingVertical: 7, borderRadius: 10, borderWidth: 1,
  },
  editBtnText: { fontSize: 13 },
  shareBtn: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },

  highlightsRow: { gap: 16, paddingHorizontal: 16, paddingVertical: 12 },
  highlightItem: { alignItems: "center", gap: 5, width: 64 },
  highlightRing: {
    width: 62, height: 62, borderRadius: 31,
    alignItems: "center", justifyContent: "center",
    padding: 2,
  },
  highlightInner: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
  },
  highlightLabel: { fontSize: 11, textAlign: "center" },

  gridTabs: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  gridTab: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingVertical: 10,
  },

  grid: { flexDirection: "row", flexWrap: "wrap" },
  gridCell: { position: "relative", overflow: "hidden" },
  gridVideoIcon: {
    position: "absolute", top: 6, right: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 4, padding: 3,
  },
  gridOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 6, paddingVertical: 5,
    backgroundColor: "rgba(0,0,0,0.30)",
  },
  gridOverlayText: { color: "#fff", fontSize: 11 },

  emptyGrid: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyGridTitle: { fontSize: 16 },
  emptyGridLink: { fontSize: 14 },

  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: 10 },
  section: { paddingHorizontal: 16, marginTop: 28, gap: 12 },
  sectionLabel: { fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase" as const, opacity: 0.55 },
  chipsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  roleChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 10, borderWidth: 1,
  },
  roleChipText: { fontSize: 13 },
  hint: { fontSize: 12, lineHeight: 17 },
  menu: { marginTop: 20, marginHorizontal: 16, gap: 10 },
  menuInner: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 14, gap: 14 },
  menuIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 14 },
  menuSub: { fontSize: 12, marginTop: 2 },
  achGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  achIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  achTitle: { fontSize: 13, lineHeight: 17 },
  achSub: { fontSize: 11, lineHeight: 14 },
  achReward: { fontSize: 12, marginTop: 2 },
  histRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 12 },
  histReason: { fontSize: 13 },
  histTime: { fontSize: 11, marginTop: 2 },
  histPts: { fontSize: 14 },
});
