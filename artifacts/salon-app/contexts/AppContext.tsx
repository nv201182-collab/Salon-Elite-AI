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
};

export type PointsRecord = { id: string; amount: number; reason: string; at: number };

export type MyStory = { text: string; mediaUri?: string; createdAt: number };

type Ctx = {
  user: User | null;
  isLoading: boolean;
  pointsHistory: PointsRecord[];
  myStory: MyStory | null;
  login: (phone: string, name: string) => void;
  logout: () => Promise<void>;
  addPoints: (amount: number, reason?: string) => void;
  setRole: (role: UserRole) => void;
  publishStory: (text: string, mediaUri?: string) => void;
  clearStory: () => void;
};

const AppContext = createContext<Ctx | null>(null);
const STORAGE_USER = "@maison/user/v1";
const STORAGE_HISTORY = "@maison/history/v1";
const STORAGE_STORY = "@maison/story/v1";

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "M";
  const first = parts[0]?.[0] ?? "M";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pointsHistory, setPointsHistory] = useState<PointsRecord[]>([]);
  const [myStory, setMyStory] = useState<MyStory | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await AsyncStorage.getItem(STORAGE_USER);
        const h = await AsyncStorage.getItem(STORAGE_HISTORY);
        if (cancelled) return;
        const st = await AsyncStorage.getItem(STORAGE_STORY);
        if (st) setMyStory(JSON.parse(st));
        if (u) {
          setUser(JSON.parse(u));
        } else {
          const guestName = "Мастер";
          setUser({
            id: "u_self",
            name: guestName,
            phone: "",
            role: "employee",
            salonId: "salon_msk",
            specialty: "Парикмахер-стилист",
            points: 2350,
            joinedAt: Date.now(),
            initials: initialsFrom(guestName),
          });
          setPointsHistory([
            { id: "h0", amount: 50, reason: "Добро пожаловать в APIA", at: Date.now() },
          ]);
        }
        if (h) setPointsHistory(JSON.parse(h));
      } catch {
        // ignore
      }
      if (!cancelled) setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        AsyncStorage.setItem(STORAGE_USER, JSON.stringify(user)).catch(() => {});
      } else {
        AsyncStorage.removeItem(STORAGE_USER).catch(() => {});
      }
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(STORAGE_HISTORY, JSON.stringify(pointsHistory)).catch(() => {});
    }
  }, [pointsHistory, isLoading]);

  const login = useCallback((phone: string, name: string) => {
    const trimmed = name.trim() || "Гость дома";
    const newUser: User = {
      id: "u_self",
      name: trimmed,
      phone,
      role: "employee",
      salonId: "salon_msk",
      specialty: "Парикмахер-стилист",
      points: 2350,
      joinedAt: Date.now(),
      initials: initialsFrom(trimmed),
    };
    setUser(newUser);
    setPointsHistory([
      { id: "h0", amount: 50, reason: "Регистрация в APIA", at: Date.now() },
    ]);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([STORAGE_USER, STORAGE_HISTORY]);
    setUser(null);
    setPointsHistory([]);
  }, []);

  const addPoints = useCallback((amount: number, reason: string = "Активность") => {
    if (amount <= 0) return;
    setUser((u) => (u ? { ...u, points: u.points + amount } : u));
    setPointsHistory((h) => [
      { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), amount, reason, at: Date.now() },
      ...h,
    ].slice(0, 80));
  }, []);

  const setRole = useCallback((role: UserRole) => {
    setUser((u) => (u ? { ...u, role } : u));
  }, []);

  const publishStory = useCallback((text: string, mediaUri?: string) => {
    const story: MyStory = { text: text.trim(), mediaUri: mediaUri && mediaUri !== "text_only" ? mediaUri : undefined, createdAt: Date.now() };
    setMyStory(story);
    AsyncStorage.setItem(STORAGE_STORY, JSON.stringify(story)).catch(() => {});
  }, []);

  const clearStory = useCallback(() => {
    setMyStory(null);
    AsyncStorage.removeItem(STORAGE_STORY).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, pointsHistory, myStory, login, logout, addPoints, setRole, publishStory, clearStory }),
    [user, isLoading, pointsHistory, myStory, login, logout, addPoints, setRole, publishStory, clearStory]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
