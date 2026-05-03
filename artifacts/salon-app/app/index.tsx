import { Redirect } from "expo-router";
import { View } from "react-native";

import { useApp } from "@/contexts/AppContext";

export default function RootIndex() {
  const { user, isLoading } = useApp();

  // Ждём пока загрузится состояние авторизации
  if (isLoading) return <View style={{ flex: 1 }} />;

  // Перенаправляем в зависимости от состояния авторизации
  return <Redirect href={user ? "/(tabs)/feed" : "/login"} />;
}
