import React, { useMemo, useState } from "react";
import { Platform, ScrollView, SectionList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChatRow } from "@/components/ChatRow";
import { Chip } from "@/components/Chip";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

type ChatFilter = "all" | "groups" | "dms";

const FILTERS: { key: ChatFilter; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "groups", label: "Команда" },
  { key: "dms", label: "Личные" },
];

export default function ChatTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { chats } = useData();
  const [filter, setFilter] = useState<ChatFilter>("all");

  const sections = useMemo(() => {
    const visible = chats.filter((c) => {
      if (filter === "groups") return c.kind !== "dm";
      if (filter === "dms") return c.kind === "dm";
      return true;
    });
    const pinned = visible.filter((c) => c.pinned);
    const groups = visible.filter((c) => !c.pinned && c.kind !== "dm");
    const dms = visible.filter((c) => c.kind === "dm" && !c.pinned);
    const out: { title: string; data: typeof chats }[] = [];
    if (pinned.length) out.push({ title: "Закреплённые", data: pinned });
    if (groups.length) out.push({ title: "Группы", data: groups });
    if (dms.length) out.push({ title: "Личные", data: dms });
    return out;
  }, [chats, filter]);

  const headerPad = insets.top + (Platform.OS === "web" ? 56 : 12);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 84 : 100);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        ListHeaderComponent={
          <View>
            <View style={[styles.header, { paddingTop: headerPad }]}>
              <Text style={[styles.eyebrow, { color: colors.pink, fontFamily: "Inter_500Medium" }]}>
                Чаты
              </Text>
              <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Команда APIA
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {FILTERS.map((f) => (
                <Chip key={f.key} label={f.label} active={filter === f.key} onPress={() => setFilter(f.key)} />
              ))}
            </ScrollView>
          </View>
        }
        renderSectionHeader={({ section: { title } }) => (
          <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
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
  header: { paddingHorizontal: 20, paddingBottom: 14, gap: 6 },
  eyebrow: { fontSize: 12, letterSpacing: 0.1, marginBottom: 4 },
  title: { fontSize: 30, letterSpacing: -0.6 },
  chipsRow: { gap: 8, paddingHorizontal: 20, paddingVertical: 4, paddingBottom: 12 },
  sectionHeader: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 6 },
  sectionText: { fontSize: 12, letterSpacing: 0.1 },
});
