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
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { BeeLoader } from "@/components/BeeLoader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FloatingTabBar } from "@/components/FloatingTabBar";
import colors from "@/constants/colors";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { DataProvider } from "@/contexts/DataContext";
import { TabBarProvider } from "@/contexts/TabBarContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useApp();
  const segments = useSegments();
  const router = useRouter();
  const didInit = React.useRef(false);

  useEffect(() => {
    if (isLoading) return;

    const first  = segments[0] as string | undefined;
    const second = segments[1] as string | undefined;
    const onLogin = first === "login";

    if (!user && !onLogin) {
      router.replace("/login");
      return;
    }

    if (user && onLogin) {
      router.replace("/(tabs)/feed");
      return;
    }

    // При первом запуске с авторизованным пользователем —
    // всегда открывать ленту, а не главную
    if (user && !didInit.current) {
      didInit.current = true;
      if (second !== "feed") {
        router.replace("/(tabs)/feed");
      }
    }
  }, [user, isLoading, segments, router]);

  return <>{children}</>;
}

function RootLayoutNav() {
  const palette = colors.light;
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: palette.background },
          headerTintColor: palette.foreground,
          headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
          contentStyle: { backgroundColor: palette.background },
          headerBackTitle: "Назад",
          animation: "fade_from_bottom",
          animationDuration: 220,
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false, animation: "fade" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: "fade" }} />
        <Stack.Screen
          name="course/[id]"
          options={{ title: "Курс", headerBackTitle: "Назад", animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="post/new"
          options={{ title: "Новая публикация", presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="post/[id]"
          options={{ title: "Публикация", animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="chat/[id]"
          options={{ title: "Чат", animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="contests/index"
          options={{ title: "Конкурсы", animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="contests/[id]"
          options={{ title: "Конкурс", animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="analytics"
          options={{ title: "Аналитика", animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="ai"
          options={{ title: "AI-ассистент", animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="story/new"
          options={{ title: "Новая сториз", presentation: "modal", animation: "slide_from_bottom", headerShown: false }}
        />
        <Stack.Screen name="+not-found" options={{ title: "Не найдено" }} />
      </Stack>
      <FloatingTabBar />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError || timedOut) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, timedOut]);

  if (!fontsLoaded && !fontError && !timedOut) {
    return (
      <SafeAreaProvider>
        <BeeLoader />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AppProvider>
                <DataProvider>
                  <TabBarProvider>
                    <StatusBar style="dark" backgroundColor="#FFFFFF" />
                    <AuthGate>
                      <RootLayoutNav />
                    </AuthGate>
                  </TabBarProvider>
                </DataProvider>
              </AppProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
