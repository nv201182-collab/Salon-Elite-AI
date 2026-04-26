import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { Chip } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";
import { PostCard } from "@/components/PostCard";
import { PressableScale } from "@/components/PressableScale";
import { useApp } from "@/contexts/AppContext";
import { useData } from "@/contexts/DataContext";
import { type Post } from "@/data/seed";
import { useColors } from "@/hooks/useColors";

const FILTERS: { key: Post["category"] | "all"; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "hair", label: "Окрашивание" },
  { key: "nails", label: "Маникюр" },
  { key: "makeup", label: "Макияж" },
  { key: "brows", label: "Брови" },
  { key: "skin", label: "Уход" },
];

export default function FeedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useApp();
  const { posts, trends, employees } = useData();
  const [filter, setFilter] = useState<Post["category"] | "all">("all");

  const filtered = useMemo(
    () => (filter === "all" ? posts : posts.filter((p) => p.category === filter)),
    [posts, filter]
  );

  const stories = useMemo(
    () => [
      { id: "you", name: "Вы", initials: user?.initials ?? "M", isYou: true },
      ...employees.slice(0, 12).map((e) => ({
        id: e.id,
        name: e.name.split(" ")[0],
        initials: e.initials,
        isYou: false,
      })),
    ],
    [employees, user]
  );

  const headerPad = insets.top + (Platform.OS === "web" ? 56 : 12);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 84 : 100);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        ListHeaderComponent={
          <View>
            <View style={[styles.header, { paddingTop: headerPad }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.eyebrow, { color: colors.pink, fontFamily: "Inter_500Medium" }]}>
                  Лента
                </Text>
                <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  Работы команды
                </Text>
              </View>
              <PressableScale onPress={() => router.push("/post/new")} scaleTo={0.94}>
                <LinearGradient
                  colors={[colors.pink, colors.purple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.addBtn}
                >
                  <Feather name="plus" size={22} color="#FFFFFF" />
                </LinearGradient>
              </PressableScale>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storiesRow}
            >
              {stories.map((s) => (
                <PressableScale
                  key={s.id}
                  onPress={() => (s.isYou ? router.push("/post/new") : null)}
                  scaleTo={0.95}
                >
                  <View style={styles.storyItem}>
                    <LinearGradient
                      colors={[colors.pink, colors.purple]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.storyRing}
                    >
                      <View style={[styles.storyInner, { backgroundColor: colors.background }]}>
                        <Avatar initials={s.initials} size={56} />
                        {s.isYou ? (
                          <View
                            style={[
                              styles.plusPill,
                              { backgroundColor: colors.pink, borderColor: colors.background },
                            ]}
                          >
                            <Feather name="plus" size={12} color="#FFFFFF" />
                          </View>
                        ) : null}
                      </View>
                    </LinearGradient>
                    <Text
                      numberOfLines={1}
                      style={[styles.storyName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}
                    >
                      {s.name}
                    </Text>
                  </View>
                </PressableScale>
              ))}
            </ScrollView>

            <View style={styles.trendsWrap}>
              <View style={styles.trendsHead}>
                <Text style={[styles.trendsEyebrow, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  Тренды APIA
                </Text>
                <Feather name="trending-up" size={14} color={colors.pink} />
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trendsRow}
              >
                {trends.map((t) => (
                  <View
                    key={t.tag}
                    style={[styles.trendChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <Text style={[styles.trendTag, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                      #{t.tag}
                    </Text>
                    <Text style={[styles.trendMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {t.posts}
                    </Text>
                    <View style={[styles.trendBadge, { backgroundColor: colors.pinkSoft }]}>
                      <Feather name="arrow-up-right" size={10} color={colors.pink} />
                      <Text style={[styles.trendGrowth, { color: colors.pink, fontFamily: "Inter_600SemiBold" }]}>
                        {Math.round(t.growth * 100)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {FILTERS.map((f) => (
                <Chip
                  key={f.key}
                  label={f.label}
                  active={filter === f.key}
                  onPress={() => setFilter(f.key)}
                />
              ))}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => <PostCard post={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        ListEmptyComponent={
          <EmptyState
            icon="image"
            title="Пока пусто в этой категории"
            subtitle="Создайте первую публикацию или измените фильтр."
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 12,
  },
  eyebrow: { fontSize: 12, letterSpacing: 0.1, marginBottom: 4 },
  title: { fontSize: 30, letterSpacing: -0.6 },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  storiesRow: { gap: 12, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 },
  storyItem: { alignItems: "center", gap: 6, width: 70 },
  storyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    padding: 2.5,
  },
  storyInner: {
    flex: 1,
    alignSelf: "stretch",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  storyName: { fontSize: 11, letterSpacing: 0.1 },
  plusPill: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  trendsWrap: { paddingTop: 8, paddingBottom: 4 },
  trendsHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  trendsEyebrow: { fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase" },
  trendsRow: { gap: 8, paddingHorizontal: 16 },
  trendChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  trendTag: { fontSize: 13, letterSpacing: 0.1 },
  trendMeta: { fontSize: 11 },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    gap: 2,
  },
  trendGrowth: { fontSize: 10, letterSpacing: 0.1 },
  chipsRow: { gap: 8, paddingHorizontal: 20, paddingVertical: 8, paddingBottom: 16 },
});
