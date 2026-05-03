import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "");

import {
  ACHIEVEMENTS_SEED,
  CHATS_SEED,
  CONTESTS_SEED,
  COURSES_SEED,
  EMPLOYEES_SEED,
  MESSAGES_SEED,
  POSTS_SEED,
  SALONS_SEED,
  TRENDS_SEED,
  type Achievement,
  type Chat,
  type Contest,
  type Course,
  type Employee,
  type ImageSrc,
  type Message,
  type Post,
  type Salon,
  type Trend,
} from "@/data/seed";
import { useApp } from "./AppContext";

type State = {
  posts: Post[];
  courseProgress: Record<string, string[]>;
  contests: Contest[];
  messagesByChat: Record<string, Message[]>;
};

type Ctx = State & {
  salons: Salon[];
  employees: Employee[];
  courses: Course[];
  chats: Chat[];
  trends: Trend[];
  achievements: Achievement[];
  hydrated: boolean;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  publishPost: (image: ImageSrc, caption: string, tags: string[], category: Post["category"], video?: ImageSrc) => Post;
  completeLesson: (courseId: string, lessonId: string) => number;
  joinContest: (contestId: string) => void;
  sendMessage: (chatId: string, text: string) => void;
  togglePinMessage: (chatId: string, messageId: string) => void;
  getCourseProgress: (courseId: string) => { completed: string[]; ratio: number };
  getEmployee: (id: string) => Employee | undefined;
};

const STORAGE_KEY = "@maison/data/v3";
const DataContext = createContext<Ctx | null>(null);

const INITIAL: State = {
  posts: POSTS_SEED,
  courseProgress: {},
  contests: CONTESTS_SEED,
  messagesByChat: MESSAGES_SEED,
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user, addPoints } = useApp();
  const [state, setState] = useState<State>(INITIAL);
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<State>;
          setState((s) => {
            const storedPosts: Post[] = parsed.posts ?? [];
            const storedIds = new Set(storedPosts.map((p) => p.id));
            const missingSeeds = POSTS_SEED.filter((p) => !storedIds.has(p.id));
            return {
              posts: storedPosts.length > 0 ? [...missingSeeds, ...storedPosts] : s.posts,
              courseProgress: parsed.courseProgress ?? s.courseProgress,
              contests: parsed.contests ?? s.contests,
              messagesByChat: parsed.messagesByChat ?? s.messagesByChat,
            };
          });
        }
      } catch {}
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, hydrated]);

  // Fetch posts from shared API and merge into feed
  const fetchApiPosts = useCallback(() => {
    if (!API_BASE) return;
    fetch(`${API_BASE}/api/posts`)
      .then(r => r.ok ? r.json() : [])
      .then((apiPosts: Post[]) => {
        if (!apiPosts.length) return;
        setState(s => {
          const localIds = new Set(s.posts.map(p => p.id));
          const newPosts = apiPosts.filter(p => !localIds.has(p.id));
          if (!newPosts.length) return s;
          return { ...s, posts: [...newPosts, ...s.posts] };
        });
      })
      .catch(() => {});
  }, []);

  // Initial fetch + poll every 30s
  useEffect(() => {
    if (!hydrated) return;
    fetchApiPosts();
    const timer = setInterval(fetchApiPosts, 30_000);
    return () => clearInterval(timer);
  }, [hydrated, fetchApiPosts]);

  // Refresh when app comes to foreground
  useEffect(() => {
    if (!hydrated) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") fetchApiPosts();
    });
    return () => sub.remove();
  }, [hydrated, fetchApiPosts]);

  const toggleLike = useCallback(
    (postId: string) => {
      if (!user) return;
      setState((s) => ({
        ...s,
        posts: s.posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                likedBy: p.likedBy.includes(user.id)
                  ? p.likedBy.filter((id) => id !== user.id)
                  : [...p.likedBy, user.id],
              }
            : p
        ),
      }));
      if (API_BASE) {
        fetch(`${API_BASE}/api/posts/${postId}/like`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        }).catch(() => {});
      }
    },
    [user]
  );

  const toggleSave = useCallback(
    (postId: string) => {
      if (!user) return;
      setState((s) => ({
        ...s,
        posts: s.posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                savedBy: p.savedBy.includes(user.id)
                  ? p.savedBy.filter((id) => id !== user.id)
                  : [...p.savedBy, user.id],
              }
            : p
        ),
      }));
      if (API_BASE) {
        fetch(`${API_BASE}/api/posts/${postId}/save`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        }).catch(() => {});
      }
    },
    [user]
  );

  const addComment = useCallback(
    (postId: string, text: string) => {
      if (!user) return;
      const trimmed = text.trim();
      if (!trimmed) return;
      setState((s) => ({
        ...s,
        posts: s.posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [
                  ...p.comments,
                  { id: Date.now().toString(36), authorId: user.id, text: trimmed, at: Date.now() },
                ],
              }
            : p
        ),
      }));
      addPoints(5, "Комментарий к публикации");
    },
    [user, addPoints]
  );

  const publishPost = useCallback(
    (image: ImageSrc, caption: string, tags: string[], category: Post["category"], video?: ImageSrc) => {
      if (!user) throw new Error("not authorized");
      const localId = Date.now().toString(36);
      const post: Post = {
        id: localId,
        authorId: user.id,
        image,
        caption: caption.trim() || "Новая работа APIA",
        tags,
        category,
        likedBy: [],
        savedBy: [],
        comments: [],
        createdAt: Date.now(),
        ...(video ? { video } : {}),
      };
      setState((s) => ({ ...s, posts: [post, ...s.posts] }));
      addPoints(50, "Новая публикация");

      // Sync to shared API in background
      if (API_BASE) {
        (async () => {
          try {
            let imageBase64: string | undefined;
            if (typeof image === "object" && "uri" in image && typeof image.uri === "string") {
              const uri = image.uri;
              if (uri.startsWith("file://") || uri.startsWith("/var/")) {
                imageBase64 = "data:image/jpeg;base64," +
                  await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
              }
            }
            const resp = await fetch(`${API_BASE}/api/posts`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                authorId: user.id,
                caption: post.caption,
                tags: post.tags,
                category: post.category,
                imageBase64,
              }),
            });
            if (resp.ok) {
              const serverPost: Post = await resp.json();
              // Replace local temporary ID with server ID so other users can sync correctly
              setState(s => ({
                ...s,
                posts: s.posts.map(p => p.id === localId ? { ...p, id: serverPost.id } : p),
              }));
            }
          } catch { /* background sync failure is non-critical */ }
        })();
      }

      return post;
    },
    [user, addPoints]
  );

  const completeLesson = useCallback(
    (courseId: string, lessonId: string) => {
      const course = COURSES_SEED.find((c) => c.id === courseId);
      if (!course) return 0;
      const lesson = course.lessons.find((l) => l.id === lessonId);
      if (!lesson) return 0;
      let reward = 0;
      setState((s) => {
        const completed = s.courseProgress[courseId] ?? [];
        if (completed.includes(lessonId)) return s;
        const newCompleted = [...completed, lessonId];
        reward = Math.floor(course.reward / course.lessons.length);
        const allDone = newCompleted.length === course.lessons.length;
        if (allDone) reward += course.reward;
        return {
          ...s,
          courseProgress: { ...s.courseProgress, [courseId]: newCompleted },
        };
      });
      if (reward > 0) {
        addPoints(reward, `Урок: ${lesson.title}`);
      }
      return reward;
    },
    [addPoints]
  );

  const joinContest = useCallback(
    (contestId: string) => {
      if (!user) return;
      let added = false;
      setState((s) => ({
        ...s,
        contests: s.contests.map((c) => {
          if (c.id !== contestId) return c;
          if (c.participants.includes(user.id)) return c;
          added = true;
          return { ...c, participants: [...c.participants, user.id] };
        }),
      }));
      if (added) addPoints(20, "Участие в конкурсе");
    },
    [user, addPoints]
  );

  const sendMessage = useCallback(
    (chatId: string, text: string) => {
      const trimmed = text.trim();
      if (!user || !trimmed) return;
      const msg: Message = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        chatId,
        authorId: user.id,
        text: trimmed,
        at: Date.now(),
      };
      setState((s) => ({
        ...s,
        messagesByChat: {
          ...s.messagesByChat,
          [chatId]: [...(s.messagesByChat[chatId] ?? []), msg],
        },
      }));
    },
    [user]
  );

  const togglePinMessage = useCallback((chatId: string, messageId: string) => {
    setState((s) => ({
      ...s,
      messagesByChat: {
        ...s.messagesByChat,
        [chatId]: (s.messagesByChat[chatId] ?? []).map((m) =>
          m.id === messageId ? { ...m, pinned: !m.pinned } : m
        ),
      },
    }));
  }, []);

  const getCourseProgress = useCallback(
    (courseId: string) => {
      const course = COURSES_SEED.find((c) => c.id === courseId);
      const completed = state.courseProgress[courseId] ?? [];
      const ratio = course && course.lessons.length > 0 ? completed.length / course.lessons.length : 0;
      return { completed, ratio };
    },
    [state.courseProgress]
  );

  const getEmployee = useCallback((id: string) => {
    if (id === "u_self") return undefined;
    return EMPLOYEES_SEED.find((e) => e.id === id);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      salons: SALONS_SEED,
      employees: EMPLOYEES_SEED,
      courses: COURSES_SEED,
      chats: CHATS_SEED,
      trends: TRENDS_SEED,
      achievements: ACHIEVEMENTS_SEED,
      hydrated,
      toggleLike,
      toggleSave,
      addComment,
      publishPost,
      completeLesson,
      joinContest,
      sendMessage,
      togglePinMessage,
      getCourseProgress,
      getEmployee,
    }),
    [
      state,
      hydrated,
      toggleLike,
      toggleSave,
      addComment,
      publishPost,
      completeLesson,
      joinContest,
      sendMessage,
      togglePinMessage,
      getCourseProgress,
      getEmployee,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
