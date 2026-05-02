import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { GlassCard } from "@/components/GlassCard";
import { LevelBar } from "@/components/LevelBar";
import { FocusFadeView } from "@/components/FocusFadeView";
import { LiquidBg } from "@/components/LiquidBg";
import { PressableScale } from "@/components/PressableScale";
import { SectionHeader } from "@/components/SectionHeader";
import { useApp } from "@/contexts/AppContext";
import { useData } from "@/contexts/DataContext";
import { useTabBar } from "@/contexts/TabBarContext";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useApp();
  const { courses, contests, employees, posts, getCourseProgress } = useData();
  const { onScroll } = useTabBar();

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

  const topFive = useMemo(
    () => [...employees].sort((a, b) => b.points - a.points).slice(0, 5),
    [employees]
  );

  const stories = useMemo(
    () => [
      { id: "you", name: "Вы", initials: user?.initials ?? "M", isYou: true },
      ...employees.slice(0, 8).map((e) => ({ id: e.id, name: e.name.split(" ")[0], initials: e.initials, isYou: false })),
    ],
    [employees, user]
  );

  const recentPosts = posts.slice(0, 2);
  const isManager = user?.role !== "employee";

  const headerPad = insets.top + (Platform.OS === "web" ? 56 : 12);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 84 : 100);

  const handleScroll = useCallback((e: { nativeEvent: { contentOffset: { y: number } } }) => {
    onScroll(e.nativeEvent.contentOffset.y);
  }, [onScroll]);

  return (
    <FocusFadeView style={{ flex: 1 }}>
      <LiquidBg />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        {/* Header */}
        <View style={[styles.topBar, { paddingTop: headerPad }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {greeting},{"\n"}{user?.name?.split(" ")[0] ?? ""}!
            </Text>
            <Text style={[styles.sub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Сегодня отличный день, чтобы стать лучше
            </Text>
          </View>
          <PressableScale onPress={() => router.push("/(tabs)/profile")} scaleTo={0.94}>
            <Avatar initials={user?.initials ?? "M"} size={48} variant="gold" />
          </PressableScale>
        </View>

        {/* Stories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesRow}>
          {stories.map((s) => (
            <View key={s.id} style={styles.storyItem}>
              <LinearGradient
                colors={[colors.pink, colors.purple]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.storyRing}
              >
                <View style={[styles.storyInner, { backgroundColor: "rgba(248,243,236,0.9)" }]}>
                  <Avatar initials={s.initials} size={54} />
                </View>
              </LinearGradient>
              <Text numberOfLines={1} style={[styles.storyName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {s.name}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Level card */}
        <GlassCard style={{ marginHorizontal: 20, marginTop: 4 }} borderRadius={24}>
          <LevelBar points={user?.points ?? 0} />
        </GlassCard>

        {/* Action tiles */}
        <View style={styles.actionRow}>
          <ActionTile icon="zap" label="AI ассистент" subtitle="Скрипты" onPress={() => router.push("/ai")} gradient />
          <ActionTile icon="award" label="Конкурсы" subtitle={`${contests.length} активных`} onPress={() => router.push("/contests")} />
          <ActionTile icon="plus" label="Публикация" subtitle="Поделиться" onPress={() => router.push("/post/new")} />
        </View>

        <SectionHeader eyebrow="Сегодня" title="Что важно" />

        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {inProgressCourse ? (
            <GlassCard
              onPress={() => router.push({ pathname: "/course/[id]", params: { id: inProgressCourse.id } })}
              innerStyle={styles.todayInner}
              borderRadius={22}
            >
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={[styles.eyebrow, { color: colors.pink, fontFamily: "Inter_500Medium" }]}>Обучение</Text>
                <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {inProgressCourse.title}
                </Text>
                <Text style={[styles.cardSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {Math.round(getCourseProgress(inProgressCourse.id).ratio * 100)}% завершено · {inProgressCourse.lessons.length} уроков
                </Text>
              </View>
              <View style={[styles.arrowCircle, { backgroundColor: "rgba(200,160,100,0.18)", borderColor: "rgba(200,160,100,0.35)" }]}>
                <Feather name="arrow-up-right" size={18} color={colors.pink} />
              </View>
            </GlassCard>
          ) : null}

          {nextContest ? (
            <PressableScale onPress={() => router.push({ pathname: "/contests/[id]", params: { id: nextContest.id } })} scaleTo={0.99}>
              <LinearGradient
                colors={[colors.pink, colors.purple]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.contestCard]}
              >
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={[styles.eyebrow, { color: "#FFFFFF", opacity: 0.85, fontFamily: "Inter_500Medium" }]}>Конкурс недели</Text>
                  <Text style={[styles.cardTitle, { color: "#FFFFFF", fontFamily: "Inter_600SemiBold" }]}>{nextContest.title}</Text>
                  <Text style={[styles.cardSub, { color: "#FFFFFF", opacity: 0.85, fontFamily: "Inter_400Regular" }]}>
                    {Math.max(0, Math.ceil((nextContest.endsAt - Date.now()) / 86_400_000))} дн. · {nextContest.participants.length} участников
                  </Text>
                </View>
                <View style={[styles.arrowCircle, { backgroundColor: "rgba(255,255,255,0.22)", borderColor: "transparent" }]}>
                  <Feather name="arrow-up-right" size={18} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </PressableScale>
          ) : null}

          {isManager ? (
            <GlassCard onPress={() => router.push("/analytics")} innerStyle={styles.todayInner} borderRadius={22}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={[styles.eyebrow, { color: colors.pink, fontFamily: "Inter_500Medium" }]}>Аналитика</Text>
                <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  APIA · {employees.length} мастеров
                </Text>
                <Text style={[styles.cardSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Активность, обучение, рейтинг
                </Text>
              </View>
              <View style={[styles.arrowCircle, { backgroundColor: "rgba(200,160,100,0.18)", borderColor: "rgba(200,160,100,0.35)" }]}>
                <Feather name="bar-chart-2" size={18} color={colors.pink} />
              </View>
            </GlassCard>
          ) : null}
        </View>

        <SectionHeader
          eyebrow="Лучшие на неделе"
          title="Рейтинг мастеров"
          action={{ label: "Все", onPress: () => router.push("/(tabs)/profile") }}
        />
        <View style={{ paddingHorizontal: 20, gap: 8 }}>
          {topFive.map((emp, i) => (
            <GlassCard key={emp.id} borderRadius={18} innerStyle={styles.rankInner}>
              <View style={[styles.rankBadge, i === 0 ? { backgroundColor: colors.pink } : { backgroundColor: "rgba(200,160,100,0.15)" }]}>
                <Text style={[styles.rankNum, { color: i === 0 ? "#FFFFFF" : colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {i + 1}
                </Text>
              </View>
              <Avatar initials={emp.initials} size={38} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rankName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{emp.name}</Text>
                <Text style={[styles.rankSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{emp.specialty}</Text>
              </View>
              <Text style={[styles.rankPts, { color: colors.pink, fontFamily: "Inter_600SemiBold" }]}>
                {emp.points.toLocaleString("ru-RU")}
              </Text>
            </GlassCard>
          ))}
        </View>

        <SectionHeader
          eyebrow="Лента"
          title="Свежие работы"
          action={{ label: "Все", onPress: () => router.push("/(tabs)/feed") }}
        />
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          {recentPosts.map((p) => (
            <GlassCard
              key={p.id}
              onPress={() => router.push({ pathname: "/post/[id]", params: { id: p.id } })}
              borderRadius={20}
              innerStyle={styles.feedInner}
            >
              <Avatar
                initials={employees.find((e) => e.id === p.authorId)?.initials ?? user?.initials ?? "M"}
                size={42}
              />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={2} style={[styles.feedText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                  {p.caption}
                </Text>
                <Text style={[styles.feedMeta, { color: colors.pink, fontFamily: "Inter_500Medium" }]}>
                  {p.likedBy.length} ♡ · {p.comments.length} комментариев
                </Text>
              </View>
            </GlassCard>
          ))}
        </View>
      </ScrollView>
    </FocusFadeView>
  );
}

function ActionTile({
  icon, label, subtitle, onPress, gradient,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle: string;
  onPress: () => void;
  gradient?: boolean;
}) {
  const colors = useColors();

  if (gradient) {
    return (
      <PressableScale onPress={onPress} scaleTo={0.95} style={{ flex: 1 }}>
        <LinearGradient
          colors={[colors.pink, colors.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tile}
        >
          <Feather name={icon} size={20} color="#FFFFFF" />
          <Text numberOfLines={1} style={[styles.tileLabel, { color: "#FFFFFF", fontFamily: "Inter_600SemiBold" }]}>{label}</Text>
          <Text numberOfLines={1} style={[styles.tileSub, { color: "#FFFFFF", fontFamily: "Inter_400Regular", opacity: 0.85 }]}>{subtitle}</Text>
        </LinearGradient>
      </PressableScale>
    );
  }

  return (
    <GlassCard onPress={onPress} scaleTo={0.95} style={{ flex: 1 }} innerStyle={styles.tile} borderRadius={20}>
      <Feather name={icon} size={20} color={colors.pink} />
      <Text numberOfLines={1} style={[styles.tileLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{label}</Text>
      <Text numberOfLines={1} style={[styles.tileSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{subtitle}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 18, gap: 12 },
  greeting: { fontSize: 32, letterSpacing: -0.9, lineHeight: 38 },
  sub: { fontSize: 13, marginTop: 8, letterSpacing: 0.2, opacity: 0.72 },
  storiesRow: { gap: 14, paddingHorizontal: 20, paddingVertical: 14 },
  storyItem: { alignItems: "center", gap: 6, width: 70 },
  storyRing: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", padding: 2.5 },
  storyInner: { flex: 1, alignSelf: "stretch", borderRadius: 30, alignItems: "center", justifyContent: "center" },
  storyName: { fontSize: 11, letterSpacing: 0.1 },
  actionRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, paddingTop: 16 },
  tile: { paddingVertical: 20, paddingHorizontal: 14, borderRadius: 20, gap: 10, minHeight: 116 },
  tileLabel: { fontSize: 13, letterSpacing: -0.1 },
  tileSub: { fontSize: 11, letterSpacing: 0.2 },
  todayInner: { flexDirection: "row", alignItems: "center", padding: 18, gap: 12 },
  contestCard: { flexDirection: "row", alignItems: "center", padding: 18, borderRadius: 22, gap: 12 },
  eyebrow: { fontSize: 12, letterSpacing: 0.1 },
  cardTitle: { fontSize: 17, letterSpacing: -0.4 },
  cardSub: { fontSize: 12, letterSpacing: 0.1 },
  arrowCircle: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  rankInner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
  rankBadge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  rankNum: { fontSize: 13, letterSpacing: 0.1 },
  rankName: { fontSize: 14, letterSpacing: 0.1 },
  rankSub: { fontSize: 11, letterSpacing: 0.1, marginTop: 2 },
  rankPts: { fontSize: 14, letterSpacing: 0.1 },
  feedInner: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  feedText: { fontSize: 13, lineHeight: 18 },
  feedMeta: { fontSize: 11, letterSpacing: 0.1, marginTop: 6 },
});
