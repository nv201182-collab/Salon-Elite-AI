import React, { useMemo } from "react";
import { Platform, SectionList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChatRow } from "@/components/ChatRow";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

export default function ChatTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { chats } = useData();

  const sections = useMemo(() => {
    const pinned = chats.filter((c) => c.pinned);
    const groups = chats.filter((c) => !c.pinned && c.kind !== "dm");
    const dms = chats.filter((c) => c.kind === "dm" && !c.pinned);
    const out: { title: string; data: typeof chats }[] = [];
    if (pinned.length) out.push({ title: "ЗАКРЕПЛЁННЫЕ", data: pinned });
    if (groups.length) out.push({ title: "ГРУППЫ", data: groups });
    if (dms.length) out.push({ title: "ЛИЧНЫЕ", data: dms });
    return out;
  }, [chats]);

  const headerPad = insets.top + (Platform.OS === "web" ? 67 : 12);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 84 : 100);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        ListHeaderComponent={
          <View style={[styles.header, { paddingTop: headerPad }]}>
            <Text style={[styles.eyebrow, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
              ЧАТЫ
            </Text>
            <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              Команда дома
            </Text>
          </View>
        }
        renderSectionHeader={({ section: { title } }) => (
          <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionText, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
              {title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => <ChatRow chat={item} />}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16, gap: 6 },
  eyebrow: { fontSize: 10, letterSpacing: 3, marginBottom: 4 },
  title: { fontSize: 30, letterSpacing: -0.6 },
  sectionHeader: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8 },
  sectionText: { fontSize: 10, letterSpacing: 2 },
});
