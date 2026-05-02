import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { type Contest } from "@/data/seed";
import { useColors } from "@/hooks/useColors";
import { PressableScale } from "./PressableScale";

type Props = { contest: Contest };

export function ContestCard({ contest }: Props) {
  const colors = useColors();
  const router = useRouter();
  const days = Math.max(0, Math.ceil((contest.endsAt - Date.now()) / 86_400_000));

  return (
    <PressableScale
      onPress={() => router.push({ pathname: "/contests/[id]", params: { id: contest.id } })}
      scaleTo={0.97}
    >
      <View style={styles.card}>
        <Image source={contest.cover} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient
          colors={["rgba(10,8,5,0.05)", "rgba(10,8,5,0.55)", "rgba(10,8,5,0.96)"]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <LinearGradient
              colors={[colors.pink, colors.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.badge}
            >
              <Text style={[styles.badgeText, { color: "#FFFFFF", fontFamily: "Inter_600SemiBold" }]}>
                Конкурс
              </Text>
            </LinearGradient>
            <View style={[styles.daysWrap, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
              <Feather name="clock" size={11} color="#FFFFFF" />
              <Text style={[styles.days, { color: "#FFFFFF", fontFamily: "Inter_500Medium" }]}>
                {days} дн.
              </Text>
            </View>
          </View>

          <View style={{ gap: 6 }}>
            <Text style={[styles.title, { color: "#FFFFFF", fontFamily: "Inter_600SemiBold" }]}>
              {contest.title}
            </Text>
            <Text style={[styles.prize, { color: "#FFE3EC", fontFamily: "Inter_400Regular" }]}>
              {contest.prize}
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.participants, { color: "#FFFFFF", fontFamily: "Inter_400Regular" }]}>
              {contest.participants.length} участников
            </Text>
            <Text style={[styles.cta, { color: "#FFFFFF", fontFamily: "Inter_600SemiBold" }]}>
              Открыть →
            </Text>
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 256,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    shadowColor: "#1A0E00",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 6,
  },
  content: { flex: 1, justifyContent: "space-between", padding: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { fontSize: 11, letterSpacing: 0.2 },
  daysWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  days: { fontSize: 11, letterSpacing: 0.2 },
  title: { fontSize: 24, letterSpacing: -0.6, lineHeight: 28 },
  prize: { fontSize: 13, lineHeight: 18, letterSpacing: 0.2, opacity: 0.85 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  participants: { fontSize: 12, letterSpacing: 0.1 },
  cta: { fontSize: 13, letterSpacing: 0.1 },
});
