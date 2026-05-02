import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassCard } from "@/components/GlassCard";
import { LiquidBg } from "@/components/LiquidBg";
import { PressableScale } from "@/components/PressableScale";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useApp();
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const valid = name.trim().length >= 2;

  const onSubmit = () => {
    if (!valid || loading) return;
    setLoading(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    setTimeout(() => {
      login("", name);
      router.replace("/(tabs)");
    }, 600);
  };

  const topPad = insets.top + (Platform.OS === "web" ? 48 : 16);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 28 : 20);

  return (
    <View style={[styles.container]}>
      <LiquidBg />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.kav, { paddingTop: topPad, paddingBottom: bottomPad }]}
      >
        <View style={styles.inner}>
          <View style={styles.header}>
            <View style={styles.beeBg}>
              <Image
                source={require("../assets/images/bee.png")}
                style={styles.bee}
                contentFit="cover"
              />
            </View>
            <Text style={[styles.brand, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              APIA
            </Text>
            <View style={styles.taglineRow}>
              {["ARCHITECTURE", "PEOPLE", "INTELLIGENCE", "ACTION"].map((w, i) => (
                <React.Fragment key={w}>
                  {i > 0 && <View style={[styles.dot, { backgroundColor: colors.gold }]} />}
                  <Text style={[styles.taglineWord, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                    {w}
                  </Text>
                </React.Fragment>
              ))}
            </View>
            <Text style={[styles.intro, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Экосистема роста мастеров{"\n"}индустрии красоты
            </Text>
          </View>

          <GlassCard borderRadius={28} innerStyle={styles.formInner} tintOpacity={0.30}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                Имя и фамилия
              </Text>
              <View style={[styles.inputWrap, { backgroundColor: "rgba(255,255,255,0.55)", borderColor: "rgba(200,160,100,0.25)" }]}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Например, Анна Морозова"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="words"
                  style={[styles.input, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}
                />
              </View>
            </View>
          </GlassCard>

          <View style={{ gap: 14 }}>
            <PressableScale onPress={onSubmit} disabled={!valid || loading} scaleTo={0.97}>
              <View style={[styles.button, { backgroundColor: valid ? colors.gold : "rgba(200,160,100,0.35)", opacity: loading ? 0.7 : 1 }]}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={[styles.buttonText, { color: valid ? "#FFFFFF" : colors.mutedForeground, fontFamily: "Inter_700Bold" }]}>
                    ВОЙТИ
                  </Text>
                )}
              </View>
            </PressableScale>
            <Text style={[styles.legal, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              APIA — закрытая платформа для мастеров красоты.{"\n"}Подтверждая вход, вы соглашаетесь с правилами сообщества.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  kav: { flex: 1, paddingHorizontal: 24 },
  inner: { flex: 1, justifyContent: "space-between", paddingVertical: 12 },
  header: { alignItems: "center", gap: 10, paddingTop: 20 },
  beeBg: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.68)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.90)",
    shadowColor: "#7A6030",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6,
  },
  bee: { width: 72, height: 72, borderRadius: 36 },
  brand: { fontSize: 62, letterSpacing: 12, includeFontPadding: false, marginTop: 8 },
  taglineRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  taglineWord: { fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase" as const },
  dot: { width: 2.5, height: 2.5, borderRadius: 2 },
  intro: { fontSize: 14, textAlign: "center", lineHeight: 22, opacity: 0.75 },
  formInner: { gap: 14, padding: 22 },
  field: { gap: 8 },
  label: { fontSize: 13, marginLeft: 2 },
  inputWrap: {
    borderRadius: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  input: { height: 54, fontSize: 16, letterSpacing: 0.2 },
  button: {
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8B6030",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 18,
    elevation: 6,
  },
  buttonText: { fontSize: 16, letterSpacing: 1.5 },
  legal: { fontSize: 12, lineHeight: 18, textAlign: "center" },
});
