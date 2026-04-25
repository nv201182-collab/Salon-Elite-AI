import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { StatCard } from "@/components/StatCard";
import { useApp } from "@/contexts/AppContext";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

export default function AnalyticsScreen() {
  const colors = useColors();
  const { user } = useApp();
  const { employees, courses, posts, contests, salons, getCourseProgress } = useData();

  const totalCompletion = useMemo(() => {
    const totals = courses.map((c) => Math.random() * 0.4 + 0.4);
    const avg = totals.reduce((a, b) => a + b, 0) / Math.max(1, totals.length);
    return Math.round(avg * 100);
  }, [courses]);

  const top = useMemo(
    () => [...employees].sort((a, b) => b.points - a.points).slice(0, 6),
    [employees]
  );

  const postsBySalon = useMemo(() => {
    const map = new Map<string, number>();
    salons.forEach((s) => map.set(s.id, 0));
    employees.forEach((e) => {
      const my = posts.filter((p) => p.authorId === e.id).length;
      map.set(e.salonId, (map.get(e.salonId) ?? 0) + my);
    });
    return salons.map((s) => ({ salon: s, count: map.get(s.id) ?? 0 }));
  }, [employees, posts, salons]);

  const maxSalon = Math.max(1, ...postsBySalon.map((s) => s.count));
  const maxPoints = Math.max(1, ...top.map((e) => e.points));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ gap: 6 }}>
        <Text style={[styles.eyebrow, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
          {user?.role === "hq" ? "ВСЕ САЛОНЫ" : "ВАШ САЛОН · РУКОВОДИТЕЛЬ"}
        </Text>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
          Аналитика команды
        </Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="МАСТЕРОВ" value={String(employees.length)} hint="активных" />
        <StatCard label="ОБУЧЕНИЕ" value={`${totalCompletion}%`} hint="завершено" accent />
      </View>
      <View style={styles.statsRow}>
        <StatCard label="ПУБЛИКАЦИЙ" value={String(posts.length)} hint="за месяц" />
        <StatCard label="КОНКУРСОВ" value={String(contests.length)} hint="активных" />
      </View>

      <View style={{ gap: 14 }}>
        <Text style={[styles.sectionLabel, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
          ТОП МАСТЕРА ПО БАЛЛАМ
        </Text>
        {top.map((e, i) => (
          <View key={e.id} style={styles.topRow}>
            <Text style={[styles.rank, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
              {String(i + 1).padStart(2, "0")}
            </Text>
            <Avatar initials={e.initials} size={32} variant={i === 0 ? "gold" : "default"} />
            <View style={{ flex: 1 }}>
              <View style={styles.rowHeader}>
                <Text
                  numberOfLines={1}
                  style={[styles.topName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}
                >
                  {e.name}
                </Text>
                <Text style={[styles.topPts, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {e.points.toLocaleString("ru-RU")}
                </Text>
              </View>
              <View style={[styles.bar, { backgroundColor: colors.muted }]}>
                <View
                  style={{
                    width: `${(e.points / maxPoints) * 100}%`,
                    height: "100%",
                    backgroundColor: i === 0 ? colors.gold : colors.foreground,
                  }}
                />
              </View>
              <Text style={[styles.specialty, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {e.specialty}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ gap: 14 }}>
        <Text style={[styles.sectionLabel, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
          ОБУЧЕНИЕ ПО КУРСАМ
        </Text>
        {courses.map((c, idx) => {
          const ratio = (((idx * 13) % 50) + 35) / 100;
          const myRatio = getCourseProgress(c.id).ratio;
          const display = Math.max(myRatio, ratio);
          return (
            <View key={c.id} style={{ gap: 8 }}>
              <View style={styles.rowHeader}>
                <Text
                  numberOfLines={1}
                  style={[styles.courseName, { color: colors.foreground, fontFamily: "Inter_500Medium", flex: 1 }]}
                >
                  {c.title}
                </Text>
                <Text style={[styles.coursePct, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
                  {Math.round(display * 100)}%
                </Text>
              </View>
              <View style={[styles.bar, { backgroundColor: colors.muted }]}>
                <View
                  style={{
                    width: `${display * 100}%`,
                    height: "100%",
                    backgroundColor: colors.gold,
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ gap: 14 }}>
        <Text style={[styles.sectionLabel, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
          ПУБЛИКАЦИИ ПО САЛОНАМ
        </Text>
        {postsBySalon.map((s) => (
          <View key={s.salon.id} style={{ gap: 8 }}>
            <View style={styles.rowHeader}>
              <Text style={[styles.courseName, { color: colors.foreground, fontFamily: "Inter_500Medium", flex: 1 }]}>
                {s.salon.name}
              </Text>
              <Text style={[styles.coursePct, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {s.count}
              </Text>
            </View>
            <View style={[styles.bar, { backgroundColor: colors.muted }]}>
              <View
                style={{
                  width: `${(s.count / maxSalon) * 100}%`,
                  height: "100%",
                  backgroundColor: colors.foreground,
                }}
              />
            </View>
            <Text style={[styles.specialty, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {s.salon.city}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontSize: 9, letterSpacing: 2 },
  title: { fontSize: 28, letterSpacing: -0.6 },
  statsRow: { flexDirection: "row", gap: 10 },
  sectionLabel: { fontSize: 9, letterSpacing: 2 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  rank: { fontSize: 12, letterSpacing: 0.5, width: 22 },
  rowHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  topName: { fontSize: 14, letterSpacing: 0.1 },
  topPts: { fontSize: 13, letterSpacing: 0.2 },
  bar: { height: 3, marginTop: 6, marginBottom: 4, overflow: "hidden" },
  specialty: { fontSize: 11, letterSpacing: 0.2 },
  courseName: { fontSize: 13, letterSpacing: 0.1 },
  coursePct: { fontSize: 13, letterSpacing: 0.2 },
});
