import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { PressableScale } from "@/components/PressableScale";
import { useApp } from "@/contexts/AppContext";
import { useData } from "@/contexts/DataContext";
import { EMPLOYEES_SEED } from "@/data/seed";
import { useColors } from "@/hooks/useColors";

export default function ContestDetail() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useApp();
  const { contests, joinContest } = useData();
  const contest = contests.find((c) => c.id === id);

  const leaderboard = useMemo(() => {
    if (!contest) return [];
    return contest.participants
      .map((pid) => {
        if (pid === "u_self" && user) {
          return { id: pid, name: user.name, initials: user.initials, points: user.points };
        }
        const e = EMPLOYEES_SEED.find((emp) => emp.id === pid);
        return e ? { id: e.id, name: e.name, initials: e.initials, points: e.points } : null;
      })
      .filter(Boolean)
      .sort((a, b) => (b!.points - a!.points)) as { id: string; name: string; initials: string; points: number }[];
  }, [contest, user]);

  if (!contest) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <Stack.Screen options={{ title: "" }} />
        <Text style={{ color: colors.mutedForeground }}>Конкурс не найден</Text>
      </View>
    );
  }

  const days = Math.max(0, Math.ceil((contest.endsAt - Date.now()) / 86_400_000));
  const isJoined = !!user && contest.participants.includes(user.id);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ title: "" }} />
      <View style={styles.heroWrap}>
        <Image source={contest.cover} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient
          colors={["rgba(10,10,10,0.0)", "rgba(10,10,10,0.96)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroBody}>
          <View style={[styles.badge, { borderColor: "#C9A961" }]}>
            <Text style={[styles.badgeText, { color: "#C9A961", fontFamily: "Inter_500Medium" }]}>
              КОНКУРС · {days} ДН.
            </Text>
          </View>
          <Text style={[styles.heroTitle, { color: "#F5F1EA", fontFamily: "Inter_500Medium" }]}>
            {contest.title}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={[styles.description, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
          {contest.description}
        </Text>

        <View style={[styles.prizeBlock, { borderColor: colors.gold, backgroundColor: colors.card }]}>
          <Text style={[styles.prizeLabel, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
            ПРИЗ
          </Text>
          <Text style={[styles.prizeValue, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
            {contest.prize}
          </Text>
          <View style={styles.rewardLine}>
            <Feather name="award" size={14} color={colors.gold} />
            <Text style={[styles.rewardText, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
              +{contest.reward} баллов всем участникам, прошедшим в финал
            </Text>
          </View>
        </View>

        <PressableScale onPress={() => joinContest(contest.id)} disabled={isJoined} scaleTo={0.97}>
          <View
            style={[
              styles.joinBtn,
              {
                backgroundColor: isJoined ? colors.muted : colors.gold,
                borderColor: isJoined ? colors.border : colors.gold,
              },
            ]}
          >
            <Text
              style={[
                styles.joinText,
                {
                  color: isJoined ? colors.mutedForeground : colors.accentForeground,
                  fontFamily: "Inter_600SemiBold",
                },
              ]}
            >
              {isJoined ? "ВЫ УЧАСТВУЕТЕ" : "УЧАСТВОВАТЬ"}
            </Text>
          </View>
        </PressableScale>

        <Text style={[styles.sectionLabel, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
          УЧАСТНИКИ · {leaderboard.length}
        </Text>

        {leaderboard.map((p, i) => (
          <View key={p.id} style={[styles.lbRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.lbRank, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
              {String(i + 1).padStart(2, "0")}
            </Text>
            <Avatar initials={p.initials} size={36} variant={i === 0 ? "gold" : "default"} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.lbName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {p.name}
              </Text>
            </View>
            <Text style={[styles.lbPts, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              {p.points.toLocaleString("ru-RU")}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroWrap: { width: "100%", aspectRatio: 4 / 3, justifyContent: "flex-end" },
  heroBody: { padding: 20, gap: 12, zIndex: 2 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
  },
  badgeText: { fontSize: 9, letterSpacing: 2 },
  heroTitle: { fontSize: 28, letterSpacing: -0.6, lineHeight: 32 },
  body: { paddingHorizontal: 20, paddingTop: 20, gap: 18 },
  description: { fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  prizeBlock: {
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  prizeLabel: { fontSize: 9, letterSpacing: 2 },
  prizeValue: { fontSize: 17, lineHeight: 23, letterSpacing: -0.2 },
  rewardLine: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  rewardText: { fontSize: 12, letterSpacing: 0.2 },
  joinBtn: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  joinText: { fontSize: 12, letterSpacing: 3 },
  sectionLabel: { fontSize: 9, letterSpacing: 2, marginTop: 14 },
  lbRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  lbRank: { fontSize: 13, letterSpacing: 1, width: 24 },
  lbName: { fontSize: 14, letterSpacing: 0.1 },
  lbPts: { fontSize: 13, letterSpacing: 0.4 },
});
