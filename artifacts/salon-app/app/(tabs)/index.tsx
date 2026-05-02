/**
 * Explore screen — Instagram-style discovery:
 *  • Search bar
 *  • Category chips
 *  • Masonry-style 3-column grid of all posts
 *  • Tap → full-screen post detail with comments
 */
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { useBeeRefresh } from "@/components/BeeRefreshIndicator";
import { CommentsSheet } from "@/components/CommentsSheet";
import { FocusFadeView } from "@/components/FocusFadeView";
import { LiquidBg } from "@/components/LiquidBg";
import { useApp } from "@/contexts/AppContext";
import { useData } from "@/contexts/DataContext";
import { useTabBar } from "@/contexts/TabBarContext";
import { EMPLOYEES_SEED, type Post } from "@/data/seed";
import { useColors } from "@/hooks/useColors";

const { width: W } = Dimensions.get("window");
const COL_GAP = 2;
const COL_W = (W - COL_GAP * 2) / 3;

const CATEGORIES = [
  { key: "all",    label: "Всё" },
  { key: "hair",   label: "Волосы" },
  { key: "nails",  label: "Ногти" },
  { key: "makeup", label: "Макияж" },
  { key: "brows",  label: "Брови" },
  { key: "skin",   label: "Уход" },
] as const;

type Cat = typeof CATEGORIES[number]["key"];

function PostThumb({
  post,
  onPress,
}: {
  post: Post;
  onPress: (p: Post) => void;
}) {
  return (
    <TouchableOpacity
      onPress={() => onPress(post)}
      activeOpacity={0.88}
      style={{ width: COL_W, height: COL_W, overflow: "hidden" }}
    >
      <Image source={post.image} style={{ width: COL_W, height: COL_W }} contentFit="cover" />
      {post.video && (
        <View style={styles.vidBadge}>
          <Feather name="video" size={11} color="#fff" />
        </View>
      )}
      {post.likedBy.length >= 10 && (
        <View style={styles.popularBadge}>
          <Feather name="heart" size={10} color="#fff" />
          <Text style={[styles.popularText, { fontFamily: "Inter_600SemiBold" }]}>
            {post.likedBy.length >= 100
              ? `${Math.round(post.likedBy.length / 100) / 10}K`
              : String(post.likedBy.length)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ExploreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useApp();
  const { posts, employees } = useData();
  const { onScroll } = useTabBar();

  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Cat>("all");
  const { refreshing, handleRefresh, beeIndicator } = useBeeRefresh(async () => {
    await new Promise((r) => setTimeout(r, 1000));
  });
  const [focused, setFocused] = useState(false);
  const [openPost, setOpenPost] = useState<Post | null>(null);

  const filtered = useMemo(() => {
    let base = cat === "all" ? posts : posts.filter((p) => p.category === cat);
    if (query.trim()) {
      const q = query.toLowerCase();
      base = base.filter(
        (p) =>
          p.caption.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return base;
  }, [posts, cat, query]);

  // Top creators sorted by likes on their posts
  const topCreators = useMemo(() => {
    return employees
      .map((e) => ({
        ...e,
        totalLikes: posts
          .filter((p) => p.authorId === e.id)
          .reduce((sum, p) => sum + p.likedBy.length, 0),
      }))
      .sort((a, b) => b.totalLikes - a.totalLikes)
      .slice(0, 8);
  }, [employees, posts]);

  const headerPad = insets.top + (Platform.OS === "web" ? 56 : 8);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 84 : 100);

  const handleScroll = useCallback((e: { nativeEvent: { contentOffset: { y: number } } }) => {
    onScroll(e.nativeEvent.contentOffset.y);
  }, [onScroll]);

  // Build grid items: interleave a "creators row" after first 9 posts
  const gridRows = useMemo(() => {
    const rows: ("creators" | Post)[][] = [];
    let col = 0;
    let row: ("creators" | Post)[] = [];
    let insertedCreators = false;

    for (let i = 0; i < filtered.length; i++) {
      if (!insertedCreators && i === 9) {
        // flush current row first
        if (row.length > 0) { rows.push(row); row = []; col = 0; }
        rows.push(["creators"]);
        insertedCreators = true;
      }
      row.push(filtered[i]);
      col++;
      if (col === 3) { rows.push(row); row = []; col = 0; }
    }
    if (row.length > 0) rows.push(row);
    return rows;
  }, [filtered]);

  return (
    <FocusFadeView style={{ flex: 1 }}>
      <LiquidBg />

      {/* ── Search bar ──────────────────────────────────── */}
      <View style={[styles.searchWrap, { paddingTop: headerPad, backgroundColor: "rgba(255,255,255,0.95)" }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
            placeholder="Поиск работ, мастеров, тегов…"
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
              <Feather name="x" size={15} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Category chips ──────────────────────────────── */}
      <View style={[styles.chipsBg, { backgroundColor: "rgba(255,255,255,0.95)" }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.key}
              onPress={() => setCat(c.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: cat === c.key ? "#C8A064" : "rgba(255,255,255,0.70)",
                  borderColor: cat === c.key ? "#C8A064" : "rgba(200,160,100,0.35)",
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: cat === c.key ? "#fff" : colors.foreground,
                    fontFamily: cat === c.key ? "Inter_600SemiBold" : "Inter_400Regular",
                  },
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Grid ────────────────────────────────────────── */}
      <FlatList
        data={gridRows}
        keyExtractor={(_, i) => String(i)}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="transparent"
            colors={["transparent"]}
            progressBackgroundColor="transparent"
          />
        }
        renderItem={({ item: row, index: rowIdx }) => {
          if (row[0] === "creators") {
            return (
              <View style={styles.creatorsSection}>
                <View style={styles.creatorsHead}>
                  <Text style={[styles.creatorsTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                    Топ-мастера
                  </Text>
                  <Feather name="award" size={14} color="#C8A064" />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.creatorsRow}>
                  {topCreators.map((e) => (
                    <TouchableOpacity key={e.id} style={styles.creatorItem}>
                      <LinearGradient
                        colors={["#C8A064", "#8B5E3C"]}
                        style={styles.creatorRing}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <View style={[styles.creatorInner, { backgroundColor: "rgba(255,255,255,0.98)" }]}>
                          <Avatar initials={e.initials} size={44} />
                        </View>
                      </LinearGradient>
                      <Text numberOfLines={1} style={[styles.creatorName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                        {e.name.split(" ")[0]}
                      </Text>
                      <Text style={[styles.creatorLikes, { color: "#C8A064", fontFamily: "Inter_400Regular" }]}>
                        ❤️ {e.totalLikes}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            );
          }

          return (
            <View style={styles.gridRow}>
              {(row as Post[]).map((p) => (
                <PostThumb
                  key={p.id}
                  post={p}
                  onPress={setOpenPost}
                />
              ))}
              {/* fill empty cells in last row */}
              {row.length < 3 &&
                Array.from({ length: 3 - row.length }).map((_, i) => (
                  <View key={`empty-${i}`} style={{ width: COL_W, height: COL_W }} />
                ))}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="search" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Ничего не найдено
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Попробуйте другой запрос или фильтр
            </Text>
          </View>
        }
      />

      {/* Post detail / comments */}
      <CommentsSheet post={openPost} visible={!!openPost} onClose={() => setOpenPost(null)} />
      {beeIndicator}
    </FocusFadeView>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    paddingHorizontal: 14, paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(200,160,100,0.20)",
  },
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
  chipsBg: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(200,160,100,0.15)",
  },
  chipsRow: { gap: 8, paddingHorizontal: 14, paddingVertical: 10 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  chipText: { fontSize: 13 },
  gridRow: {
    flexDirection: "row",
    gap: COL_GAP,
    marginBottom: COL_GAP,
  },
  vidBadge: {
    position: "absolute", top: 6, right: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 4, padding: 3,
  },
  popularBadge: {
    position: "absolute", bottom: 6, left: 6,
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 999, paddingHorizontal: 6, paddingVertical: 3,
  },
  popularText: { color: "#fff", fontSize: 10 },
  creatorsSection: {
    paddingVertical: 16,
    backgroundColor: "rgba(255,255,255,0.80)",
  },
  creatorsHead: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, marginBottom: 12,
  },
  creatorsTitle: { fontSize: 16, letterSpacing: -0.3 },
  creatorsRow: { gap: 16, paddingHorizontal: 14 },
  creatorItem: { alignItems: "center", gap: 5, width: 62 },
  creatorRing: {
    width: 58, height: 58, borderRadius: 29,
    alignItems: "center", justifyContent: "center", padding: 2.5,
  },
  creatorInner: {
    width: 51, height: 51, borderRadius: 26,
    alignItems: "center", justifyContent: "center",
  },
  creatorName: { fontSize: 11, textAlign: "center" },
  creatorLikes: { fontSize: 10 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 16 },
  emptyText: { fontSize: 14 },
});
