import React, { useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Chip } from "@/components/Chip";
import { CourseCard } from "@/components/CourseCard";
import { useData } from "@/contexts/DataContext";
import { type Course } from "@/data/seed";
import { useColors } from "@/hooks/useColors";

const CATEGORIES: { key: Course["category"] | "Все"; label: string }[] = [
  { key: "Все", label: "Все" },
  { key: "Адаптация", label: "Адаптация" },
  { key: "Сервис", label: "Сервис" },
  { key: "Продажи", label: "Продажи" },
  { key: "Парикмахерское", label: "Парикмахерское" },
  { key: "Маникюр", label: "Маникюр" },
  { key: "Брови", label: "Брови" },
  { key: "Макияж", label: "Макияж" },
  { key: "Уход", label: "Уход" },
  { key: "Менеджмент", label: "Менеджмент" },
];

export default function LearnScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { courses, getCourseProgress } = useData();
  const [filter, setFilter] = useState<Course["category"] | "Все">("Все");

  const filtered = useMemo(
    () => (filter === "Все" ? courses : courses.filter((c) => c.category === filter)),
    [courses, filter]
  );

  const completedCount = courses.filter((c) => getCourseProgress(c.id).ratio >= 1).length;

  const headerPad = insets.top + (Platform.OS === "web" ? 56 : 12);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 84 : 100);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: headerPad }]}>
        <Text style={[styles.eyebrow, { color: colors.pink, fontFamily: "Inter_500Medium" }]}>
          Обучение
        </Text>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          Программа APIA
        </Text>
        <Text
          style={[
            styles.summary,
            { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
          ]}
        >
          {completedCount} из {courses.length} курсов завершено. Каждый урок начисляет баллы и открывает следующий.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {CATEGORIES.map((c) => (
          <Chip
            key={c.key}
            label={c.label}
            active={filter === c.key}
            onPress={() => setFilter(c.key)}
          />
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, gap: 14, paddingTop: 8 }}>
        {filtered.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 14, gap: 6 },
  eyebrow: { fontSize: 12, letterSpacing: 0.1, marginBottom: 4 },
  title: { fontSize: 30, letterSpacing: -0.6 },
  summary: { fontSize: 13, lineHeight: 19, letterSpacing: 0.1, marginTop: 8 },
  chipsRow: { gap: 8, paddingHorizontal: 20, paddingVertical: 8, paddingBottom: 16 },
});
