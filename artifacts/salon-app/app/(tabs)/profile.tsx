import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { Chip } from "@/components/Chip";
import { GlassCard } from "@/components/GlassCard";
import { LevelBar } from "@/components/LevelBar";
import { LiquidBg } from "@/components/LiquidBg";
import { PressableScale } from "@/components/PressableScale";
import { StatCard } from "@/components/StatCard";
import { getLevel, getRoleLabel, useApp, type UserRole } from "@/contexts/AppContext";
import { useData } from "@/contexts/DataContext";
import { useTabBar } from "@/contexts/TabBarContext";
import { useColors } from "@/hooks/useColors";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "employee", label: "Сотрудник" },
  { value: "manager", label: "Руководитель" },
  { value: "hq", label: "HQ" },
];

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
  const { user, logout, pointsHistory, setRole } = useApp();
  const { courses, posts, getCourseProgress, salons, achievements } = useData();
  const { onScroll } = useTabBar();

  if (!user) return null;

  const completedCount = courses.filter((c) => getCourseProgress(c.id).ratio >= 1).length;
  const myPosts = posts.filter((p) => p.authorId === user.id).length;
  const salonName = salons.find((s) => s.id === user.salonId)?.name ?? "APIA";
  const isManager = user.role !== "employee";
  const level = getLevel(user.points);

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
    <View style={{ flex: 1 }}>
      <LiquidBg />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        {/* Profile header */}
        <View style={[styles.header, { paddingTop: headerPad }]}>
          <View style={styles.avatarRing}>
            <Avatar initials={user.initials} size={88} variant="gold" />
          </View>
          <Text style={[styles.name, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{user.name}</Text>
          <Text style={[styles.specialty, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {user.specialty} · {salonName}
          </Text>
          <LinearGradient
            colors={[colors.pink, colors.purple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.roleBadge}
          >
            <Text style={[styles.roleText, { color: "#FFFFFF", fontFamily: "Inter_600SemiBold" }]}>
              {getRoleLabel(user.role)}
            </Text>
          </LinearGradient>
        </View>

        <GlassCard style={{ marginHorizontal: 20, marginTop: 8 }} borderRadius={24}>
          <LevelBar points={user.points} compact />
        </GlassCard>

        <View style={styles.statsRow}>
          <StatCard label="Уровень" value={level.label} />
          <StatCard label="Баллы" value={user.points.toLocaleString("ru-RU")} accent />
        </View>
        <View style={styles.statsRow}>
          <StatCard label="Курсов" value={String(completedCount)} hint={`из ${courses.length}`} />
          <StatCard label="Публикаций" value={String(myPosts)} hint="всего" />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Режим доступа
          </Text>
          <View style={styles.chipsRow}>
            {ROLE_OPTIONS.map((r) => (
              <Chip key={r.value} label={r.label} active={user.role === r.value} onPress={() => setRole(r.value)} />
            ))}
          </View>
          <Text style={[styles.hint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Только для демонстрации. В рабочем приложении роль назначает HQ.
          </Text>
        </View>

        <View style={styles.menu}>
          <MenuItem icon="zap" label="AI ассистент" sub="Скрипты, подсказки, обучение" onPress={() => router.push("/ai")} />
          <MenuItem icon="award" label="Конкурсы" sub="Активные и закрытые" onPress={() => router.push("/contests")} />
          {isManager && (
            <MenuItem icon="bar-chart-2" label="Аналитика команды" sub="Доступ для руководителей" onPress={() => router.push("/analytics")} />
          )}
          <MenuItem icon="log-out" label="Выйти" sub={user.phone} onPress={onLogout} destructive />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Достижения</Text>
          <Text style={[styles.hint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {achievements.filter((a) => user.points >= a.threshold).length} из {achievements.length} открыто.
          </Text>
          <View style={styles.achGrid}>
            {achievements.map((a) => {
              const unlocked =
                (a.id.startsWith("a_top_") && user.points >= a.threshold) ||
                (a.id === "a_first_post" && myPosts >= 1) ||
                (a.id === "a_ten_posts" && myPosts >= 10) ||
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
                    <Feather name={a.icon as keyof typeof Feather.glyphMap} size={18} color={unlocked ? colors.pink : colors.mutedForeground} />
                  </View>
                  <Text numberOfLines={2} style={[styles.achTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{a.title}</Text>
                  <Text numberOfLines={2} style={[styles.achSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{a.description}</Text>
                  <Text style={[styles.achReward, { color: colors.pink, fontFamily: "Inter_600SemiBold" }]}>+{a.reward}</Text>
                </GlassCard>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Последние баллы</Text>
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
                  <Text style={[styles.histPts, { color: colors.pink, fontFamily: "Inter_600SemiBold" }]}>+{rec.amount}</Text>
                </View>
              ))}
            </GlassCard>
          )}
        </View>
      </ScrollView>
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
        <Feather name={icon} size={18} color={destructive ? colors.destructive : colors.pink} />
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
  header: { alignItems: "center", paddingHorizontal: 20, paddingBottom: 14, gap: 10 },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(200,160,100,0.40)",
    backgroundColor: "rgba(255,255,255,0.30)",
  },
  name: { fontSize: 24, letterSpacing: -0.4, marginTop: 4 },
  specialty: { fontSize: 13, letterSpacing: 0.1, textAlign: "center" },
  roleBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, marginTop: 4 },
  roleText: { fontSize: 11, letterSpacing: 0.2 },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginTop: 10 },
  section: { paddingHorizontal: 20, marginTop: 28, gap: 12 },
  sectionLabel: { fontSize: 16, letterSpacing: -0.1 },
  chipsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  hint: { fontSize: 12, lineHeight: 17, letterSpacing: 0.1 },
  menu: { marginTop: 24, marginHorizontal: 20, gap: 10 },
  menuInner: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 14, gap: 14 },
  menuIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 14, letterSpacing: 0.1 },
  menuSub: { fontSize: 12, letterSpacing: 0.1, marginTop: 2 },
  achGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  achIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  achTitle: { fontSize: 13, letterSpacing: 0.1, lineHeight: 17 },
  achSub: { fontSize: 11, letterSpacing: 0.1, lineHeight: 14 },
  achReward: { fontSize: 12, letterSpacing: 0.1, marginTop: 2 },
  histRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 12 },
  histReason: { fontSize: 13, letterSpacing: 0.1 },
  histTime: { fontSize: 11, letterSpacing: 0.1, marginTop: 2 },
  histPts: { fontSize: 14, letterSpacing: 0.1 },
});
