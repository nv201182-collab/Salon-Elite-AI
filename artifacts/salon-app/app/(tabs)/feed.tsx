import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Chip } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";
import { PostCard } from "@/components/PostCard";
import { PressableScale } from "@/components/PressableScale";
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
  const { posts } = useData();
  const [filter, setFilter] = useState<Post["category"] | "all">("all");

  const filtered = useMemo(
    () => (filter === "all" ? posts : posts.filter((p) => p.category === filter)),
    [posts, filter]
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
    paddingBottom: 16,
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
  chipsRow: { gap: 8, paddingHorizontal: 20, paddingVertical: 8, paddingBottom: 16 },
});
