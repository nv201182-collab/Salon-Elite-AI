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
      <View style={[styles.card, { borderColor: colors.gold }]}>
        <Image source={contest.cover} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient
          colors={["rgba(10,10,10,0.1)", "rgba(10,10,10,0.95)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={[styles.badge, { borderColor: "#C9A961" }]}>
              <Text style={[styles.badgeText, { color: "#C9A961", fontFamily: "Inter_500Medium" }]}>
                КОНКУРС
              </Text>
            </View>
            <View style={styles.daysWrap}>
              <Feather name="clock" size={11} color="#C9A961" />
              <Text style={[styles.days, { color: "#F5F1EA", fontFamily: "Inter_500Medium" }]}>
                {days} дн.
              </Text>
            </View>
          </View>

          <View style={{ gap: 6 }}>
            <Text style={[styles.title, { color: "#F5F1EA", fontFamily: "Inter_500Medium" }]}>
              {contest.title}
            </Text>
            <Text style={[styles.prize, { color: "#C9A961", fontFamily: "Inter_400Regular" }]}>
              {contest.prize}
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.participants, { color: "#F5F1EA", fontFamily: "Inter_400Regular" }]}>
              {contest.participants.length} участников
            </Text>
            <Text style={[styles.cta, { color: "#C9A961", fontFamily: "Inter_500Medium" }]}>
              ОТКРЫТЬ →
            </Text>
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 220,
    borderRadius: 2,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  content: { flex: 1, justifyContent: "space-between", padding: 18 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  badgeText: { fontSize: 9, letterSpacing: 2 },
  daysWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  days: { fontSize: 11, letterSpacing: 0.5 },
  title: { fontSize: 22, letterSpacing: -0.4, lineHeight: 26 },
  prize: { fontSize: 12, lineHeight: 17, letterSpacing: 0.2 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  participants: { fontSize: 11, letterSpacing: 0.5 },
  cta: { fontSize: 11, letterSpacing: 1.5 },
});
