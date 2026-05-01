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
      <View style={styles.card}>
        <View style={styles.imageWrap}>
          <Image source={course.cover} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient
            colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.85)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.imageOverlay}>
            <View style={[styles.levelPill, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
              <Text style={[styles.levelText, { color: "#FFFFFF", fontFamily: "Inter_500Medium" }]}>
                {course.level}
              </Text>
            </View>
            <LinearGradient
              colors={[colors.pink, colors.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rewardWrap}
            >
              <Feather name="award" size={12} color="#FFFFFF" />
              <Text style={[styles.reward, { color: "#FFFFFF", fontFamily: "Inter_600SemiBold" }]}>
                +{course.reward}
              </Text>
            </LinearGradient>
          </View>
          <View style={styles.imageBottom}>
            <Text style={[styles.eyebrow, { color: "#FFE3EC", fontFamily: "Inter_500Medium" }]}>
              {course.category}
            </Text>
            <Text numberOfLines={2} style={[styles.title, { color: "#FFFFFF", fontFamily: "Inter_600SemiBold" }]}>
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
              <Text style={[styles.completeTag, { color: colors.pink, fontFamily: "Inter_600SemiBold" }]}>
                Пройдено
              </Text>
            ) : isStarted ? (
              <Text style={[styles.completeTag, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                {Math.round(ratio * 100)}%
              </Text>
            ) : (
              <Text style={[styles.completeTag, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                Начать
              </Text>
            )}
          </View>
          <View style={[styles.track, { backgroundColor: colors.muted }]}>
            <LinearGradient
              colors={[colors.pink, colors.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.fill, { width: `${Math.max(2, ratio * 100)}%` }]}
            />
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.68)",
    backgroundColor: "rgba(250,246,240,0.70)",
    shadowColor: "#8B7355",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 3,
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
  imageBottom: { paddingHorizontal: 18, paddingBottom: 18, gap: 4, zIndex: 2 },
  levelPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  levelText: { fontSize: 11, letterSpacing: 0.2 },
  rewardWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  reward: { fontSize: 12, letterSpacing: 0.2 },
  eyebrow: { fontSize: 11, letterSpacing: 0.3 },
  title: { fontSize: 18, letterSpacing: -0.2, lineHeight: 22 },
  body: { padding: 16, gap: 10 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  meta: { fontSize: 12, letterSpacing: 0.1 },
  completeTag: { fontSize: 12, letterSpacing: 0.1 },
  track: { height: 6, width: "100%", borderRadius: 3, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3 },
});
