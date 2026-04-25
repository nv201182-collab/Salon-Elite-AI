import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { PressableScale } from "@/components/PressableScale";
import { useData } from "@/contexts/DataContext";
import { type Lesson } from "@/data/seed";
import { useColors } from "@/hooks/useColors";

const TYPE_LABEL: Record<Lesson["type"], string> = {
  video: "Видео",
  text: "Текст",
  checklist: "Чек-лист",
  test: "Тест",
};

const TYPE_ICON: Record<Lesson["type"], keyof typeof Feather.glyphMap> = {
  video: "play-circle",
  text: "book-open",
  checklist: "check-square",
  test: "edit-3",
};

export default function CourseDetail() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { courses, completeLesson, getCourseProgress } = useData();
  const course = courses.find((c) => c.id === id);

  if (!course) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <Stack.Screen options={{ title: "" }} />
        <Text style={{ color: colors.mutedForeground }}>Курс не найден</Text>
      </View>
    );
  }

  const { completed, ratio } = getCourseProgress(course.id);
  const totalMin = course.lessons.reduce((s, l) => s + l.duration, 0);
  const isComplete = ratio >= 1;

  const onLessonPress = (lesson: Lesson) => {
    if (completed.includes(lesson.id)) return;
    Alert.alert(
      lesson.title,
      `${TYPE_LABEL[lesson.type]} · ${lesson.duration} мин\n\n${lesson.description}`,
      [
        { text: "Закрыть", style: "cancel" },
        {
          text: "Завершить урок",
          onPress: () => {
            const reward = completeLesson(course.id, lesson.id);
            if (reward > 0) {
              Alert.alert("Урок засчитан", `+${reward} баллов в ваш профиль.`);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ title: "" }} />
      <View style={styles.heroWrap}>
        <Image source={course.cover} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient
          colors={["rgba(10,10,10,0.0)", "rgba(10,10,10,0.96)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroBody}>
          <View style={[styles.levelPill, { borderColor: colors.gold }]}>
            <Text style={[styles.levelText, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
              {course.level.toUpperCase()} · {course.category.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.heroTitle, { color: "#F5F1EA", fontFamily: "Inter_500Medium" }]}>
            {course.title}
          </Text>
          <Text style={[styles.heroDesc, { color: "rgba(245,241,234,0.75)", fontFamily: "Inter_400Regular" }]}>
            {course.description}
          </Text>
        </View>
      </View>

      <View style={[styles.metaRow, { borderColor: colors.border }]}>
        <Meta label="УРОКОВ" value={String(course.lessons.length)} />
        <Meta label="МИНУТ" value={String(totalMin)} />
        <Meta label="БАЛЛОВ" value={`+${course.reward}`} accent />
      </View>

      <View style={[styles.progressBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
            ПРОГРЕСС
          </Text>
          <Text style={[styles.progressValue, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
            {Math.round(ratio * 100)}%
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: colors.muted }]}>
          <View style={[styles.fill, { width: `${Math.max(2, ratio * 100)}%`, backgroundColor: colors.gold }]} />
        </View>
        {isComplete ? (
          <Text style={[styles.completeText, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
            КУРС ЗАВЕРШЁН · НАГРАДА ЗАЧИСЛЕНА
          </Text>
        ) : null}
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 24, gap: 0 }}>
        <Text style={[styles.sectionTitle, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
          СОДЕРЖАНИЕ
        </Text>
        {course.lessons.map((lesson, idx) => {
          const done = completed.includes(lesson.id);
          return (
            <PressableScale key={lesson.id} onPress={() => onLessonPress(lesson)} scaleTo={0.99}>
              <View style={[styles.lessonRow, { borderBottomColor: colors.border }]}>
                <View
                  style={[
                    styles.lessonNum,
                    {
                      backgroundColor: done ? colors.gold : "transparent",
                      borderColor: done ? colors.gold : colors.border,
                    },
                  ]}
                >
                  {done ? (
                    <Feather name="check" size={14} color={colors.accentForeground} />
                  ) : (
                    <Text style={[styles.lessonNumText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                      {String(idx + 1).padStart(2, "0")}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.lessonTitle,
                      {
                        color: done ? colors.mutedForeground : colors.foreground,
                        fontFamily: "Inter_500Medium",
                        textDecorationLine: done ? "line-through" : "none",
                      },
                    ]}
                  >
                    {lesson.title}
                  </Text>
                  <Text style={[styles.lessonMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {TYPE_LABEL[lesson.type]} · {lesson.duration} мин
                  </Text>
                </View>
                <Feather
                  name={done ? "check" : TYPE_ICON[lesson.type]}
                  size={18}
                  color={done ? colors.gold : colors.foreground}
                />
              </View>
            </PressableScale>
          );
        })}
      </View>
    </ScrollView>
  );
}

function Meta({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  const colors = useColors();
  return (
    <View style={styles.metaCell}>
      <Text style={[styles.metaLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.metaValue,
          { color: accent ? colors.gold : colors.foreground, fontFamily: "Inter_500Medium" },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrap: { width: "100%", aspectRatio: 4 / 3, justifyContent: "flex-end" },
  heroBody: { padding: 20, gap: 10, zIndex: 2 },
  levelPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
  },
  levelText: { fontSize: 9, letterSpacing: 2 },
  heroTitle: { fontSize: 28, letterSpacing: -0.6, lineHeight: 32 },
  heroDesc: { fontSize: 13, lineHeight: 19, letterSpacing: 0.1 },
  metaRow: {
    flexDirection: "row",
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  metaCell: { flex: 1, alignItems: "center", gap: 6 },
  metaLabel: { fontSize: 9, letterSpacing: 1.5 },
  metaValue: { fontSize: 22, letterSpacing: -0.4 },
  progressBlock: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  progressHeader: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 9, letterSpacing: 2 },
  progressValue: { fontSize: 16, letterSpacing: -0.2 },
  track: { height: 3, overflow: "hidden" },
  fill: { height: "100%" },
  completeText: { fontSize: 10, letterSpacing: 2, marginTop: 4 },
  sectionTitle: { fontSize: 10, letterSpacing: 2, paddingVertical: 12 },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  lessonNum: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
  },
  lessonNumText: { fontSize: 11, letterSpacing: 0.5 },
  lessonTitle: { fontSize: 14, letterSpacing: 0.1 },
  lessonMeta: { fontSize: 11, letterSpacing: 0.2, marginTop: 4 },
});
