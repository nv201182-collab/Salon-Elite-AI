import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useData } from "@/contexts/DataContext";
import { type Course } from "@/data/seed";
import { useColors } from "@/hooks/useColors";
import { PressableScale } from "./PressableScale";

type Props = { course: Course };

export function CourseCard({ course }: Props) {
  const colors = useColors();
  const router = useRouter();
  const { getCourseProgress } = useData();
  const { ratio, completed } = getCourseProgress(course.id);
  const totalMin = course.lessons.reduce((sum, l) => sum + l.duration, 0);
  const isStarted = completed.length > 0;
  const isComplete = ratio >= 1;

  return (
    <PressableScale
      onPress={() => router.push({ pathname: "/course/[id]", params: { id: course.id } })}
      scaleTo={0.98}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.imageWrap}>
          <Image source={course.cover} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient
            colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.85)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.imageOverlay}>
            <View style={[styles.levelPill, { borderColor: colors.gold }]}>
              <Text style={[styles.levelText, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
                {course.level.toUpperCase()}
              </Text>
            </View>
            <View style={styles.rewardWrap}>
              <Feather name="award" size={12} color={colors.gold} />
              <Text style={[styles.reward, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
                +{course.reward}
              </Text>
            </View>
          </View>
          <View style={styles.imageBottom}>
            <Text style={[styles.eyebrow, { color: "#C9A961", fontFamily: "Inter_500Medium" }]}>
              {course.category.toUpperCase()}
            </Text>
            <Text numberOfLines={2} style={[styles.title, { color: "#F5F1EA", fontFamily: "Inter_500Medium" }]}>
              {course.title}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {course.lessons.length} уроков · {totalMin} мин
            </Text>
            {isComplete ? (
              <Text style={[styles.completeTag, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
                ПРОЙДЕНО
              </Text>
            ) : isStarted ? (
              <Text style={[styles.completeTag, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {Math.round(ratio * 100)}%
              </Text>
            ) : (
              <Text style={[styles.completeTag, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                НАЧАТЬ
              </Text>
            )}
          </View>
          <View style={[styles.track, { backgroundColor: colors.muted }]}>
            <View
              style={{
                width: `${Math.max(2, ratio * 100)}%`,
                height: "100%",
                backgroundColor: isComplete ? colors.gold : colors.foreground,
              }}
            />
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  imageWrap: {
    width: "100%",
    aspectRatio: 16 / 11,
    justifyContent: "space-between",
  },
  imageOverlay: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 14,
    zIndex: 2,
  },
  imageBottom: { paddingHorizontal: 16, paddingBottom: 16, gap: 4, zIndex: 2 },
  levelPill: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  levelText: { fontSize: 9, letterSpacing: 1.5 },
  rewardWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 999,
  },
  reward: { fontSize: 11, letterSpacing: 0.4 },
  eyebrow: { fontSize: 10, letterSpacing: 2 },
  title: { fontSize: 18, letterSpacing: -0.2, lineHeight: 22 },
  body: { padding: 16, gap: 10 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  meta: { fontSize: 12, letterSpacing: 0.2 },
  completeTag: { fontSize: 10, letterSpacing: 1.5 },
  track: { height: 2, width: "100%", overflow: "hidden" },
});
