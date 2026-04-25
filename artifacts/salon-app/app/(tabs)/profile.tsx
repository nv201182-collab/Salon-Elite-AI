import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { Chip } from "@/components/Chip";
import { LevelBar } from "@/components/LevelBar";
import { PressableScale } from "@/components/PressableScale";
import { StatCard } from "@/components/StatCard";
import { getLevel, getRoleLabel, useApp, type UserRole } from "@/contexts/AppContext";
import { useData } from "@/contexts/DataContext";
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
  const { courses, posts, getCourseProgress, salons } = useData();

  if (!user) return null;

  const completedCount = courses.filter((c) => getCourseProgress(c.id).ratio >= 1).length;
  const myPosts = posts.filter((p) => p.authorId === user.id).length;
  const salonName = salons.find((s) => s.id === user.salonId)?.name ?? "Maison Beauté";
  const isManager = user.role !== "employee";
  const level = getLevel(user.points);

  const onLogout = () => {
    Alert.alert("Выйти из Maison?", "Учётные данные будут удалены с устройства.", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Выйти",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const headerPad = insets.top + (Platform.OS === "web" ? 67 : 12);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 84 : 100);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: headerPad }]}>
        <Avatar initials={user.initials} size={84} variant="gold" />
        <Text style={[styles.name, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
          {user.name}
        </Text>
        <Text style={[styles.specialty, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {user.specialty} · {salonName}
        </Text>
        <View style={[styles.roleBadge, { borderColor: colors.gold }]}>
          <Text style={[styles.roleText, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
            {getRoleLabel(user.role).toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={[styles.heroCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <LevelBar points={user.points} compact />
      </View>

      <View style={styles.statsRow}>
        <StatCard label="УРОВЕНЬ" value={level.label} />
        <StatCard label="БАЛЛЫ" value={user.points.toLocaleString("ru-RU")} accent />
      </View>
      <View style={styles.statsRow}>
        <StatCard label="КУРСОВ" value={String(completedCount)} hint={`из ${courses.length}`} />
        <StatCard label="ПУБЛИКАЦИЙ" value={String(myPosts)} hint="всего" />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
          РЕЖИМ ДОСТУПА
        </Text>
        <View style={styles.chipsRow}>
          {ROLE_OPTIONS.map((r) => (
            <Chip
              key={r.value}
              label={r.label}
              active={user.role === r.value}
              onPress={() => setRole(r.value)}
              variant="gold"
            />
          ))}
        </View>
        <Text style={[styles.hint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Только для демонстрации. В рабочем приложении роль назначает HQ.
        </Text>
      </View>

      <View style={styles.menu}>
        <MenuItem icon="zap" label="AI ассистент" sub="Скрипты, подсказки, обучение" onPress={() => router.push("/ai")} />
        <MenuItem icon="award" label="Конкурсы" sub="Активные и закрытые" onPress={() => router.push("/contests")} />
        {isManager ? (
          <MenuItem
            icon="bar-chart-2"
            label="Аналитика команды"
            sub="Доступ для руководителей"
            onPress={() => router.push("/analytics")}
            accent
          />
        ) : null}
        <MenuItem icon="log-out" label="Выйти" sub={user.phone} onPress={onLogout} destructive />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
          ПОСЛЕДНИЕ БАЛЛЫ
        </Text>
        {pointsHistory.length === 0 ? (
          <Text style={[styles.hint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Пока пусто. Завершите урок или опубликуйте работу — баллы появятся здесь.
          </Text>
        ) : (
          <View style={{ gap: 0 }}>
            {pointsHistory.slice(0, 8).map((rec) => (
              <View
                key={rec.id}
                style={[styles.historyRow, { borderBottomColor: colors.border }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.historyReason, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                    {rec.reason}
                  </Text>
                  <Text style={[styles.historyTime, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {fmtTime(rec.at)}
                  </Text>
                </View>
                <Text style={[styles.historyPts, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
                  +{rec.amount}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function MenuItem({
  icon,
  label,
  sub,
  onPress,
  accent,
  destructive,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  sub: string;
  onPress: () => void;
  accent?: boolean;
  destructive?: boolean;
}) {
  const colors = useColors();
  const fg = destructive ? colors.destructive : colors.foreground;
  return (
    <PressableScale onPress={onPress} scaleTo={0.99}>
      <View
        style={[
          styles.menuRow,
          {
            borderBottomColor: colors.border,
            backgroundColor: accent ? colors.card : "transparent",
          },
        ]}
      >
        <Feather name={icon} size={18} color={accent ? colors.gold : fg} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.menuLabel, { color: fg, fontFamily: "Inter_500Medium" }]}>{label}</Text>
          <Text style={[styles.menuSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {sub}
          </Text>
        </View>
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", paddingHorizontal: 20, paddingBottom: 14, gap: 10 },
  name: { fontSize: 24, letterSpacing: -0.4, marginTop: 6 },
  specialty: { fontSize: 13, letterSpacing: 0.3, textAlign: "center" },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    marginTop: 4,
  },
  roleText: { fontSize: 9, letterSpacing: 2 },
  heroCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginTop: 10 },
  section: { paddingHorizontal: 20, marginTop: 28, gap: 12 },
  sectionLabel: { fontSize: 9, letterSpacing: 2 },
  chipsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  hint: { fontSize: 11, lineHeight: 16, letterSpacing: 0.2 },
  menu: { marginTop: 24, marginHorizontal: 20 },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 14,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuLabel: { fontSize: 14, letterSpacing: 0.2 },
  menuSub: { fontSize: 11, letterSpacing: 0.2, marginTop: 2 },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  historyReason: { fontSize: 13, letterSpacing: 0.1 },
  historyTime: { fontSize: 11, letterSpacing: 0.2, marginTop: 2 },
  historyPts: { fontSize: 14, letterSpacing: 0.2 },
});
