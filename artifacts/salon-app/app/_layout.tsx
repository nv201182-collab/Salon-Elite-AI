import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import colors from "@/constants/colors";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { DataProvider } from "@/contexts/DataContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const first = segments[0] as string | undefined;
    const onLogin = first === "login";
    if (!user && !onLogin) {
      router.replace("/login");
    } else if (user && onLogin) {
      router.replace("/");
    }
  }, [user, isLoading, segments, router]);

  return <>{children}</>;
}

function RootLayoutNav() {
  const palette = colors.dark ?? colors.light;
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerTintColor: palette.foreground,
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
        contentStyle: { backgroundColor: palette.background },
        headerBackTitle: "Назад",
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="course/[id]"
        options={{ title: "Курс", headerBackTitle: "Назад" }}
      />
      <Stack.Screen
        name="post/new"
        options={{ title: "Новая публикация", presentation: "modal" }}
      />
      <Stack.Screen name="post/[id]" options={{ title: "Публикация" }} />
      <Stack.Screen name="chat/[id]" options={{ title: "Чат" }} />
      <Stack.Screen name="contests/index" options={{ title: "Конкурсы" }} />
      <Stack.Screen name="contests/[id]" options={{ title: "Конкурс" }} />
      <Stack.Screen name="analytics" options={{ title: "Аналитика" }} />
      <Stack.Screen name="ai" options={{ title: "AI-ассистент" }} />
      <Stack.Screen name="+not-found" options={{ title: "Не найдено" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AppProvider>
                <DataProvider>
                  <StatusBar style="light" />
                  <AuthGate>
                    <RootLayoutNav />
                  </AuthGate>
                </DataProvider>
              </AppProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
