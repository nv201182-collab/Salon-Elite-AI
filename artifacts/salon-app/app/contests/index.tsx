import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { ContestCard } from "@/components/ContestCard";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

export default function ContestsList() {
  const colors = useColors();
  const { contests } = useData();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 14 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.intro, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        Активные конкурсы дома. Победители определяются советом мастеров и руководителем направления. Призы — деньги, поездки, оборудование, доступ к закрытым программам.
      </Text>
      {contests.map((c) => (
        <ContestCard key={c.id} contest={c} />
      ))}
      <View style={{ height: 12 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 13, lineHeight: 19, letterSpacing: 0.1, marginBottom: 4 },
});
