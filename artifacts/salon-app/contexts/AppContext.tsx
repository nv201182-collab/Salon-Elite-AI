import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type UserRole = "employee" | "manager" | "hq";

export type Level = {
  key: "novice" | "specialist" | "expert" | "top";
  label: string;
  min: number;
  max: number;
};

export const LEVELS: Level[] = [
  { key: "novice", label: "Новичок", min: 0, max: 1500 },
  { key: "specialist", label: "Специалист", min: 1500, max: 4000 },
  { key: "expert", label: "Эксперт", min: 4000, max: 8000 },
  { key: "top", label: "Топ-мастер", min: 8000, max: 999999 },
];

export function getLevel(points: number): Level {
  return LEVELS.find((l) => points >= l.min && points < l.max) ?? LEVELS[LEVELS.length - 1];
}

export function getRoleLabel(role: UserRole): string {
  if (role === "employee") return "Сотрудник";
  if (role === "manager") return "Руководитель салона";
  return "Администратор HQ";
}

export type User = {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  salonId: string;
  specialty: string;
  points: number;
  joinedAt: number;
  initials: string;
  avatarUri?: string;
};

export type PointsRecord = { id: string; amount: number; reason: string; at: number };

/** Одна сториз пользователя */
export type StoryEntry = {
  id: string;
  text: string;
  mediaUri?: string;
  createdAt: number;
};

export type ApiUser = { id: string; name: string; initials: string; specialty: string; phone?: string };

type Ctx = {
  user: User | null;
  isLoading: boolean;
  pointsHistory: PointsRecord[];
  myStories: StoryEntry[];
  addStory: (text: string, mediaUri?: string) => void;
  updateStory: (id: string, text: string, mediaUri?: string) => void;
  deleteStory: (id: string) => void;
  myReactions: Record<string, string>;
  toggleReaction: (storyId: string, emoji: string) => void;
  login: (phone: string, name: string) => void;
  loginWithApiUser: (apiUser: ApiUser) => void;
  logout: () => Promise<void>;
  addPoints: (amount: number, reason?: string) => void;
  setRole: (role: UserRole) => void;
  setAvatarUri: (uri: string) => void;
};

const AppContext = createContext<Ctx | null>(null);
const STORAGE_USER      = "@maison/user/v1";
const STORAGE_HISTORY   = "@maison/history/v1";
const STORAGE_STORIES   = "@maison/stories/v2";
const STORAGE_REACTIONS = "@maison/reactions/v1";

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "M";
  const first  = parts[0]?.[0] ?? "M";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]               = useState<User | null>(null);
  const [isLoading, setIsLoading]     = useState<boolean>(true);
  const [pointsHistory, setPointsHistory] = useState<PointsRecord[]>([]);
  const [myStories, setMyStories]     = useState<StoryEntry[]>([]);
  const [myReactions, setMyReactions] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [u, h, st, re] = await Promise.all([
          AsyncStorage.getItem(STORAGE_USER),
          AsyncStorage.getItem(STORAGE_HISTORY),
          AsyncStorage.getItem(STORAGE_STORIES),
          AsyncStorage.getItem(STORAGE_REACTIONS),
        ]);
        if (cancelled) return;

        if (st) {
          const parsed = JSON.parse(st);
          // Миграция: старый формат был объект, новый — массив
          setMyStories(Array.isArray(parsed) ? parsed : [parsed]);
        }
        if (re) setMyReactions(JSON.parse(re));

        if (u) {
          const parsed = JSON.parse(u);
          // Migration: ignore stale guest users from before phone auth
          if (parsed?.phone && parsed.phone.length > 5) {
            setUser(parsed);
          }
        }
        // No auto-guest: user must log in with phone number
        if (h) setPointsHistory(JSON.parse(h));
      } catch { /* ignore */ }
      if (!cancelled) setIsLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // Persist user
  useEffect(() => {
    if (!isLoading) {
      if (user) AsyncStorage.setItem(STORAGE_USER, JSON.stringify(user)).catch(() => {});
      else AsyncStorage.removeItem(STORAGE_USER).catch(() => {});
    }
  }, [user, isLoading]);

  // Persist history
  useEffect(() => {
    if (!isLoading) AsyncStorage.setItem(STORAGE_HISTORY, JSON.stringify(pointsHistory)).catch(() => {});
  }, [pointsHistory, isLoading]);

  // Persist stories
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_STORIES, JSON.stringify(myStories)).catch(() => {});
  }, [myStories]);

  // Persist reactions
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_REACTIONS, JSON.stringify(myReactions)).catch(() => {});
  }, [myReactions]);

  const login = useCallback((phone: string, name: string) => {
    const trimmed = name.trim() || "Гость дома";
    setUser({
      id: "u_self", name: trimmed, phone,
      role: "employee", salonId: "salon_msk",
      specialty: "Парикмахер-стилист",
      points: 2350, joinedAt: Date.now(),
      initials: initialsFrom(trimmed),
    });
    setPointsHistory([{ id: "h0", amount: 50, reason: "Регистрация в APIA", at: Date.now() }]);
  }, []);

  const loginWithApiUser = useCallback((apiUser: ApiUser) => {
    setUser({
      id:        apiUser.id,
      name:      apiUser.name,
      phone:     apiUser.phone ?? "",
      role:      "employee",
      salonId:   "salon_msk",
      specialty: apiUser.specialty,
      points:    0,
      joinedAt:  Date.now(),
      initials:  apiUser.initials,
    });
    setPointsHistory([{ id: "h0", amount: 50, reason: "Добро пожаловать в APIA", at: Date.now() }]);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([STORAGE_USER, STORAGE_HISTORY]);
    setUser(null);
    setPointsHistory([]);
  }, []);

  const addPoints = useCallback((amount: number, reason = "Активность") => {
    if (amount <= 0) return;
    setUser((u) => (u ? { ...u, points: u.points + amount } : u));
    setPointsHistory((h) => [
      { id: uid(), amount, reason, at: Date.now() },
      ...h,
    ].slice(0, 80));
  }, []);

  const setRole = useCallback((role: UserRole) => {
    setUser((u) => (u ? { ...u, role } : u));
  }, []);

  const setAvatarUri = useCallback((uri: string) => {
    setUser((u) => (u ? { ...u, avatarUri: uri } : u));
  }, []);

  const addStory = useCallback((text: string, mediaUri?: string) => {
    const entry: StoryEntry = {
      id: uid(),
      text: text.trim(),
      mediaUri: mediaUri && mediaUri !== "text_only" ? mediaUri : undefined,
      createdAt: Date.now(),
    };
    setMyStories((prev) => [...prev, entry]);
  }, []);

  const updateStory = useCallback((id: string, text: string, mediaUri?: string) => {
    setMyStories((prev) => prev.map((s) =>
      s.id === id
        ? { ...s, text: text.trim(), mediaUri: mediaUri && mediaUri !== "text_only" ? mediaUri : undefined }
        : s
    ));
  }, []);

  const deleteStory = useCallback((id: string) => {
    setMyStories((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const toggleReaction = useCallback((storyId: string, emoji: string) => {
    setMyReactions((prev) => {
      const current = prev[storyId];
      if (current === emoji) {
        const next = { ...prev };
        delete next[storyId];
        return next;
      }
      return { ...prev, [storyId]: emoji };
    });
  }, []);

  const value = useMemo(() => ({
    user, isLoading, pointsHistory,
    myStories, addStory, updateStory, deleteStory,
    myReactions, toggleReaction,
    login, loginWithApiUser, logout, addPoints, setRole, setAvatarUri,
  }), [user, isLoading, pointsHistory, myStories, addStory, updateStory, deleteStory, myReactions, toggleReaction, login, loginWithApiUser, logout, addPoints, setRole, setAvatarUri]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
