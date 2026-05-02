import React, { useCallback, useMemo, useState } from "react";
import { Platform, ScrollView, SectionList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChatRow } from "@/components/ChatRow";
import { Chip } from "@/components/Chip";
import { FocusFadeView } from "@/components/FocusFadeView";
import { LiquidBg } from "@/components/LiquidBg";
import { useData } from "@/contexts/DataContext";
import { useTabBar } from "@/contexts/TabBarContext";
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
  const { onScroll } = useTabBar();
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

  const handleScroll = useCallback((e: { nativeEvent: { contentOffset: { y: number } } }) => {
    onScroll(e.nativeEvent.contentOffset.y);
  }, [onScroll]);

  return (
    <FocusFadeView style={{ flex: 1 }}>
      <LiquidBg />
      <SectionList
        style={styles.list}
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        ListHeaderComponent={
          <View>
            <View style={[styles.header, { paddingTop: headerPad }]}>
              <Text style={[styles.eyebrow, { color: colors.pink, fontFamily: "Inter_500Medium" }]}>Чаты</Text>
              <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Команда APIA</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {FILTERS.map((f) => (
                <Chip key={f.key} label={f.label} active={filter === f.key} onPress={() => setFilter(f.key)} />
              ))}
            </ScrollView>
          </View>
        }
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{title}</Text>
          </View>
        )}
        renderItem={({ item }) => <ChatRow chat={item} />}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </FocusFadeView>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, gap: 6 },
  eyebrow: { fontSize: 10, letterSpacing: 2.5, marginBottom: 6, textTransform: "uppercase" as const },
  title: { fontSize: 30, letterSpacing: -0.8 },
  chipsRow: { gap: 8, paddingHorizontal: 20, paddingVertical: 4, paddingBottom: 12 },
  sectionHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  sectionText: { fontSize: 9, letterSpacing: 2, textTransform: "uppercase" as const, opacity: 0.50 },
});
