import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { LevelBar } from "@/components/LevelBar";
import { PressableScale } from "@/components/PressableScale";
import { SectionHeader } from "@/components/SectionHeader";
import { useApp } from "@/contexts/AppContext";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useApp();
  const { courses, contests, employees, posts, getCourseProgress } = useData();

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 5) return "Поздний час";
    if (h < 12) return "Доброе утро";
    if (h < 18) return "Добрый день";
    return "Добрый вечер";
  }, []);

  const inProgressCourse = useMemo(() => {
    return (
      courses.find((c) => {
        const p = getCourseProgress(c.id);
        return p.completed.length > 0 && p.ratio < 1;
      }) ?? courses.find((c) => getCourseProgress(c.id).ratio < 1) ?? courses[0]
    );
  }, [courses, getCourseProgress]);

  const nextContest = useMemo(() => {
    return [...contests].sort((a, b) => a.endsAt - b.endsAt)[0];
  }, [contests]);

  const topThree = useMemo(
    () => [...employees].sort((a, b) => b.points - a.points).slice(0, 5),
    [employees]
  );

  const recentPosts = posts.slice(0, 2);
  const isManager = user?.role !== "employee";

  const headerPad = insets.top + (Platform.OS === "web" ? 67 : 12);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 84 : 100);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.topBar, { paddingTop: headerPad }]}>
        <View>
          <Text
            style={[
              styles.brandWord,
              { color: colors.gold, fontFamily: "Inter_500Medium" },
            ]}
          >
            MAISON BEAUTÉ
          </Text>
          <Text
            style={[
              styles.greeting,
              { color: colors.foreground, fontFamily: "Inter_500Medium" },
            ]}
          >
            {greeting}, {user?.name?.split(" ")[0] ?? ""}
          </Text>
        </View>
        <PressableScale onPress={() => router.push("/(tabs)/profile")} scaleTo={0.94}>
          <Avatar initials={user?.initials ?? "M"} size={44} />
        </PressableScale>
      </View>

      <View style={[styles.heroCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <LevelBar points={user?.points ?? 0} />
      </View>

      <View style={styles.actionRow}>
        <ActionTile
          icon="zap"
          label="Ассистент"
          subtitle="Скрипты и подсказки"
          onPress={() => router.push("/ai")}
          gold
        />
        <ActionTile
          icon="award"
          label="Конкурсы"
          subtitle={`${contests.length} активных`}
          onPress={() => router.push("/contests")}
        />
        <ActionTile
          icon="plus"
          label="Публикация"
          subtitle="Поделиться работой"
          onPress={() => router.push("/post/new")}
        />
      </View>

      <SectionHeader eyebrow="Сегодня" title="Что важно" />

      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {inProgressCourse ? (
          <PressableScale
            onPress={() =>
              router.push({ pathname: "/course/[id]", params: { id: inProgressCourse.id } })
            }
            scaleTo={0.99}
          >
            <View style={[styles.todayCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={[styles.todayEyebrow, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
                  ОБУЧЕНИЕ
                </Text>
                <Text style={[styles.todayTitle, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {inProgressCourse.title}
                </Text>
                <Text style={[styles.todaySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {Math.round(getCourseProgress(inProgressCourse.id).ratio * 100)}% завершено · {inProgressCourse.lessons.length} уроков
                </Text>
              </View>
              <Feather name="arrow-up-right" size={20} color={colors.gold} />
            </View>
          </PressableScale>
        ) : null}

        {nextContest ? (
          <PressableScale
            onPress={() => router.push({ pathname: "/contests/[id]", params: { id: nextContest.id } })}
            scaleTo={0.99}
          >
            <View style={[styles.todayCard, { borderColor: colors.gold, backgroundColor: colors.card }]}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={[styles.todayEyebrow, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
                  КОНКУРС НЕДЕЛИ
                </Text>
                <Text style={[styles.todayTitle, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {nextContest.title}
                </Text>
                <Text style={[styles.todaySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {Math.max(0, Math.ceil((nextContest.endsAt - Date.now()) / 86_400_000))} дн. · {nextContest.participants.length} участников
                </Text>
              </View>
              <Feather name="arrow-up-right" size={20} color={colors.gold} />
            </View>
          </PressableScale>
        ) : null}

        {isManager ? (
          <PressableScale onPress={() => router.push("/analytics")} scaleTo={0.99}>
            <View style={[styles.todayCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={[styles.todayEyebrow, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
                  АНАЛИТИКА
                </Text>
                <Text style={[styles.todayTitle, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  Команда дома · {employees.length} мастеров
                </Text>
                <Text style={[styles.todaySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Активность, обучение, рейтинг
                </Text>
              </View>
              <Feather name="bar-chart-2" size={20} color={colors.gold} />
            </View>
          </PressableScale>
        ) : null}
      </View>

      <SectionHeader
        eyebrow="Лучшие на неделе"
        title="Рейтинг мастеров"
        action={{ label: "ВСЕ", onPress: () => router.push("/(tabs)/profile") }}
      />
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {topThree.map((emp, i) => (
          <View key={emp.id} style={styles.rankRow}>
            <Text style={[styles.rankNum, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
              {String(i + 1).padStart(2, "0")}
            </Text>
            <Avatar initials={emp.initials} size={36} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.rankName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {emp.name}
              </Text>
              <Text style={[styles.rankSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {emp.specialty}
              </Text>
            </View>
            <Text style={[styles.rankPts, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              {emp.points.toLocaleString("ru-RU")}
            </Text>
          </View>
        ))}
      </View>

      <SectionHeader
        eyebrow="Лента"
        title="Свежие работы"
        action={{ label: "ВСЕ", onPress: () => router.push("/(tabs)/feed") }}
      />
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {recentPosts.map((p) => (
          <PressableScale
            key={p.id}
            onPress={() => router.push({ pathname: "/post/[id]", params: { id: p.id } })}
            scaleTo={0.99}
          >
            <View style={[styles.feedRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Avatar
                initials={
                  employees.find((e) => e.id === p.authorId)?.initials ?? user?.initials ?? "M"
                }
                size={40}
              />
              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={2}
                  style={[styles.feedText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                >
                  {p.caption}
                </Text>
                <Text style={[styles.feedMeta, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
                  {p.likedBy.length} ♡ · {p.comments.length} комментариев
                </Text>
              </View>
            </View>
          </PressableScale>
        ))}
      </View>
    </ScrollView>
  );
}

function ActionTile({
  icon,
  label,
  subtitle,
  onPress,
  gold,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle: string;
  onPress: () => void;
  gold?: boolean;
}) {
  const colors = useColors();
  return (
    <PressableScale onPress={onPress} scaleTo={0.95} style={{ flex: 1 }}>
      <View
        style={[
          actionStyles.tile,
          {
            backgroundColor: gold ? colors.gold : colors.card,
            borderColor: gold ? colors.gold : colors.border,
          },
        ]}
      >
        <Feather name={icon} size={18} color={gold ? colors.accentForeground : colors.gold} />
        <Text
          numberOfLines={1}
          style={[
            actionStyles.label,
            {
              color: gold ? colors.accentForeground : colors.foreground,
              fontFamily: "Inter_500Medium",
            },
          ]}
        >
          {label}
        </Text>
        <Text
          numberOfLines={1}
          style={[
            actionStyles.sub,
            {
              color: gold ? colors.accentForeground : colors.mutedForeground,
              fontFamily: "Inter_400Regular",
              opacity: gold ? 0.7 : 1,
            },
          ]}
        >
          {subtitle}
        </Text>
      </View>
    </PressableScale>
  );
}

const actionStyles = StyleSheet.create({
  tile: {
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
    minHeight: 100,
  },
  label: { fontSize: 12, letterSpacing: 0.4 },
  sub: { fontSize: 10, letterSpacing: 0.3 },
});

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  brandWord: { fontSize: 9, letterSpacing: 3, marginBottom: 6 },
  greeting: { fontSize: 24, letterSpacing: -0.4 },
  heroCard: {
    marginHorizontal: 20,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
  },
  actionRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, paddingTop: 14 },
  todayCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
    gap: 12,
  },
  todayEyebrow: { fontSize: 9, letterSpacing: 2 },
  todayTitle: { fontSize: 17, letterSpacing: -0.2 },
  todaySub: { fontSize: 12, letterSpacing: 0.2 },
  rankRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  rankNum: { fontSize: 13, letterSpacing: 1, width: 22 },
  rankName: { fontSize: 14, letterSpacing: 0.1 },
  rankSub: { fontSize: 11, letterSpacing: 0.1, marginTop: 2 },
  rankPts: { fontSize: 13, letterSpacing: 0.4 },
  feedRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
    gap: 12,
  },
  feedText: { fontSize: 13, lineHeight: 18 },
  feedMeta: { fontSize: 10, letterSpacing: 1, marginTop: 6 },
});
