import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewToken } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { Chip } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";
import { FocusFadeView } from "@/components/FocusFadeView";
import { LiquidBg } from "@/components/LiquidBg";
import { PostCard } from "@/components/PostCard";
import { PressableScale } from "@/components/PressableScale";
import { type StoryItem, StoryViewer } from "@/components/StoryViewer";
import { useApp } from "@/contexts/AppContext";
import { useData } from "@/contexts/DataContext";
import { useTabBar } from "@/contexts/TabBarContext";
import { type ImageSrc, type Post } from "@/data/seed";
import { useColors } from "@/hooks/useColors";

const FILTERS: { key: Post["category"] | "all"; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "hair", label: "Окрашивание" },
  { key: "nails", label: "Маникюр" },
  { key: "makeup", label: "Макияж" },
  { key: "brows", label: "Брови" },
  { key: "skin", label: "Уход" },
];

function toUri(src: ImageSrc): string | null {
  if (typeof src === "object" && "uri" in src) return src.uri;
  return null;
}

export default function FeedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, myStories, myReactions, toggleReaction, deleteStory } = useApp();
  const { posts, trends, employees } = useData();
  const [filter, setFilter] = useState<Post["category"] | "all">("all");
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [storyViewerIdx, setStoryViewerIdx] = useState<number | null>(null);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());
  const [notifCount] = useState(3);

  const handleStoryViewed = useCallback((id: string) => {
    setViewedStories((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 55 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const firstVideo = viewableItems.find((v) => v.isViewable && (v.item as Post).video);
      setActiveVideoId(firstVideo ? (firstVideo.item as Post).id : null);
    }
  ).current;

  const filtered = useMemo(
    () => (filter === "all" ? posts : posts.filter((p) => p.category === filter)),
    [posts, filter]
  );

  const stories = useMemo<StoryItem[]>(() => {
    const empStories: StoryItem[] = employees.slice(0, 14).map((e) => {
      const empPosts = posts.filter((p) => p.authorId === e.id);
      const frames = empPosts
        .slice(0, 3)
        .map((p) => toUri(p.image))
        .filter((u): u is string => u !== null);
      return {
        id: e.id,
        name: e.name.split(" ")[0],
        initials: e.initials,
        specialty: e.specialty,
        frames,
      };
    });

    const youRichFrames = myStories.map((s) => ({
      uri: s.mediaUri,
      text: s.text || undefined,
      storyId: s.id,
    }));

    const youStory: StoryItem = {
      id: "you",
      name: "Вы",
      initials: user?.initials ?? "M",
      specialty: user?.specialty ?? "Мастер",
      frames: myStories.map((s) => s.mediaUri ?? ""),
      richFrames: youRichFrames.length > 0 ? youRichFrames : undefined,
    };

    return [youStory, ...empStories];
  }, [employees, posts, user, myStories]);

  const { onScroll: tabOnScroll } = useTabBar();
  const headerPad = insets.top + (Platform.OS === "web" ? 56 : 10);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 84 : 100);

  const handleScroll = useCallback((e: { nativeEvent: { contentOffset: { y: number } } }) => {
    tabOnScroll(e.nativeEvent.contentOffset.y);
  }, [tabOnScroll]);

  return (
    <FocusFadeView style={{ flex: 1 }}>
      <LiquidBg />
      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        ListHeaderComponent={
          <View>
            {/* ── Header ────────────────────────────────────── */}
            <View style={[styles.header, { paddingTop: headerPad }]}>
              {/* APIA logo */}
              <View style={styles.logoWrap}>
                <Text style={[styles.logoA, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>A</Text>
                <Text style={[styles.logoDot, { color: "#C8A064", fontFamily: "Inter_700Bold" }]}>·</Text>
                <Text style={[styles.logoA, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>P</Text>
                <Text style={[styles.logoDot, { color: "#C8A064", fontFamily: "Inter_700Bold" }]}>·</Text>
                <Text style={[styles.logoA, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>I</Text>
                <Text style={[styles.logoDot, { color: "#C8A064", fontFamily: "Inter_700Bold" }]}>·</Text>
                <Text style={[styles.logoA, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>A</Text>
              </View>

              <View style={{ flex: 1 }} />

              {/* DM button */}
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/(tabs)/chat")}>
                <Feather name="send" size={22} color={colors.foreground} />
              </TouchableOpacity>

              {/* Notifications bell with badge */}
              <TouchableOpacity style={styles.iconBtn}>
                <Feather name="bell" size={22} color={colors.foreground} />
                {notifCount > 0 && (
                  <View style={[styles.badge, { backgroundColor: "#FF3B6F" }]}>
                    <Text style={[styles.badgeText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                      {notifCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* New post button */}
              <PressableScale onPress={() => router.push("/post/new")} scaleTo={0.94}>
                <LinearGradient
                  colors={["#C8A064", "#8B5E3C"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.addBtn}
                >
                  <Feather name="plus" size={20} color="#FFFFFF" />
                </LinearGradient>
              </PressableScale>
            </View>

            {/* ── Stories ──────────────────────────────────── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storiesRow}
            >
              {stories.map((s, idx) => {
                const isYou      = s.id === "you";
                const hasStories = isYou && myStories.length > 0;
                const isViewed   = !isYou && viewedStories.has(s.id);

                const ringColors: [string, string] = isYou
                  ? hasStories
                    ? ["#C8A064", "#8B5E3C"]
                    : ["rgba(180,180,180,0.4)", "rgba(140,140,140,0.3)"]
                  : isViewed
                    ? ["rgba(180,180,180,0.5)", "rgba(140,140,140,0.4)"]
                    : ["#C8A064", "#8B5E3C"];

                return (
                  <PressableScale
                    key={s.id}
                    onPress={() => {
                      if (isYou) {
                        if (!hasStories) { router.push("/story/new"); return; }
                        setStoryViewerIdx(0);
                        return;
                      }
                      setStoryViewerIdx(idx);
                    }}
                    scaleTo={0.95}
                  >
                    <View style={styles.storyItem}>
                      <LinearGradient
                        colors={ringColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.storyRing, isViewed && styles.storyRingViewed]}
                      >
                        <View style={[styles.storyInner, { backgroundColor: "rgba(248,243,236,0.95)" }]}>
                          <Avatar initials={s.initials} size={52} />
                          {isYou && !hasStories ? (
                            <View style={[styles.plusPill, { backgroundColor: "#C8A064", borderColor: "rgba(248,243,236,0.95)" }]}>
                              <Feather name="plus" size={11} color="#FFFFFF" />
                            </View>
                          ) : !isYou && s.frames.length > 0 ? (
                            <View style={[styles.dotPill, { backgroundColor: "#C8A064" }]} />
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
                );
              })}
            </ScrollView>

            {/* ── Divider ─────────────────────────────────── */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* ── Trends ──────────────────────────────────── */}
            <View style={styles.trendsWrap}>
              <View style={styles.trendsHead}>
                <Text style={[styles.trendsEyebrow, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  Тренды APIA
                </Text>
                <Feather name="trending-up" size={14} color="#C8A064" />
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trendsRow}
              >
                {trends.map((t) => (
                  <View
                    key={t.tag}
                    style={[styles.trendChip, { backgroundColor: "rgba(255,255,255,0.62)", borderColor: "rgba(255,255,255,0.68)" }]}
                  >
                    <Text style={[styles.trendTag, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                      #{t.tag}
                    </Text>
                    <Text style={[styles.trendMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {t.posts}
                    </Text>
                    <View style={[styles.trendBadge, { backgroundColor: "rgba(200,160,100,0.15)" }]}>
                      <Feather name="arrow-up-right" size={10} color="#C8A064" />
                      <Text style={[styles.trendGrowth, { color: "#C8A064", fontFamily: "Inter_600SemiBold" }]}>
                        {Math.round(t.growth * 100)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* ── Category filters ─────────────────────────── */}
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
        renderItem={({ item }) => (
          <PostCard post={item} isActive={item.id === activeVideoId} />
        )}
        ItemSeparatorComponent={() => <View style={[styles.postDivider, { backgroundColor: colors.border }]} />}
        ListEmptyComponent={
          <EmptyState
            icon="image"
            title="Пока пусто в этой категории"
            subtitle="Создайте первую публикацию или измените фильтр."
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* ── Story Viewer ─────────────────────────────────── */}
      <StoryViewer
        stories={stories}
        initialIndex={storyViewerIdx ?? 0}
        visible={storyViewerIdx !== null}
        onClose={() => setStoryViewerIdx(null)}
        onViewed={handleStoryViewed}
        myReactions={myReactions}
        onReact={(storyId, emoji) => toggleReaction(storyId, emoji)}
        onEditStory={(storyId) => {
          setStoryViewerIdx(null);
          router.push({ pathname: "/story/new", params: { storyId } });
        }}
        onDeleteStory={(storyId) => deleteStory(storyId)}
        onAddStory={() => {
          setStoryViewerIdx(null);
          router.push("/story/new");
        }}
      />
    </FocusFadeView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  logoWrap: { flexDirection: "row", alignItems: "center", gap: 2 },
  logoA: { fontSize: 20, letterSpacing: 1 },
  logoDot: { fontSize: 18, marginBottom: 1 },
  iconBtn: { padding: 6, position: "relative" },
  badge: {
    position: "absolute", top: 2, right: 2,
    width: 16, height: 16, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  badgeText: { fontSize: 9 },
  addBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
  },
  divider: { height: StyleSheet.hairlineWidth, marginTop: 4 },
  storiesRow: { gap: 10, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10 },
  storyItem: { alignItems: "center", gap: 5, width: 66 },
  storyRing: {
    width: 62, height: 62, borderRadius: 31,
    alignItems: "center", justifyContent: "center",
    padding: 2.5,
  },
  storyRingViewed: { opacity: 0.55 },
  storyInner: {
    flex: 1, alignSelf: "stretch", borderRadius: 28,
    alignItems: "center", justifyContent: "center",
  },
  storyName: { fontSize: 11 },
  plusPill: {
    position: "absolute", bottom: -2, right: -2,
    width: 20, height: 20, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2,
  },
  dotPill: {
    position: "absolute", bottom: 2, right: 2,
    width: 9, height: 9, borderRadius: 5,
    borderWidth: 1.5, borderColor: "rgba(248,243,236,0.95)",
  },
  trendsWrap: { paddingTop: 12, paddingBottom: 4 },
  trendsHead: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 16, paddingBottom: 8,
  },
  trendsEyebrow: { fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase" },
  trendsRow: { gap: 8, paddingHorizontal: 14 },
  trendChip: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, gap: 8,
  },
  trendTag: { fontSize: 13 },
  trendMeta: { fontSize: 11 },
  trendBadge: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 999, gap: 2,
  },
  trendGrowth: { fontSize: 10 },
  chipsRow: { gap: 8, paddingHorizontal: 14, paddingVertical: 10, paddingBottom: 14 },
  postDivider: { height: StyleSheet.hairlineWidth },
});
