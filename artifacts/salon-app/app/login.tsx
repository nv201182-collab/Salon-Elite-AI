import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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

import { PressableScale } from "@/components/PressableScale";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

function formatPhone(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  let out = "+7";
  if (digits.length > 1) out += " (" + digits.slice(1, 4);
  if (digits.length >= 4) out += ") " + digits.slice(4, 7);
  if (digits.length >= 7) out += "-" + digits.slice(7, 9);
  if (digits.length >= 9) out += "-" + digits.slice(9, 11);
  return out;
}

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useApp();
  const [phone, setPhone] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const digits = phone.replace(/\D/g, "");
  const valid = digits.length === 11 && name.trim().length >= 2;

  const onSubmit = () => {
    if (!valid || loading) return;
    setLoading(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    setTimeout(() => {
      login(phone, name);
      router.replace("/(tabs)");
    }, 600);
  };

  const topPad = insets.top + (Platform.OS === "web" ? 48 : 16);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 28 : 20);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: topPad, paddingBottom: bottomPad },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.inner}>
          <View style={styles.header}>
            <LinearGradient
              colors={[colors.pink, colors.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoRing}
            >
              <View style={[styles.logoInner, { backgroundColor: colors.background }]}>
                <Text style={[styles.logoMark, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  M
                </Text>
              </View>
            </LinearGradient>
            <Text style={[styles.brand, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Maison Beauté
            </Text>
            <Text
              style={[
                styles.tagline,
                { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
              ]}
            >
              Социальная сеть и обучающая платформа{"\n"}для команды салонов красоты
            </Text>
          </View>

          <View style={{ gap: 14 }}>
            <View>
              <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                Телефон
              </Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.input }]}>
                <TextInput
                  value={phone}
                  onChangeText={(v) => setPhone(formatPhone(v))}
                  placeholder="+7 (___) ___-__-__"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="phone-pad"
                  style={[styles.input, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}
                />
              </View>
            </View>
            <View>
              <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                Имя и фамилия
              </Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.input }]}>
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
          </View>

          <View style={{ gap: 16 }}>
            <PressableScale onPress={onSubmit} disabled={!valid || loading} scaleTo={0.97}>
              <LinearGradient
                colors={
                  valid
                    ? [colors.pink, colors.purple]
                    : [colors.muted, colors.muted]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.button, { opacity: loading ? 0.7 : 1 }]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.buttonText,
                      {
                        color: valid ? "#FFFFFF" : colors.mutedForeground,
                        fontFamily: "Inter_600SemiBold",
                      },
                    ]}
                  >
                    Войти
                  </Text>
                )}
              </LinearGradient>
            </PressableScale>
            <Text
              style={[styles.legal, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}
            >
              Закрытая платформа для сотрудников Maison Beauté.{"\n"}Подтверждая вход, вы принимаете внутренние правила сети.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  inner: { flex: 1, justifyContent: "space-between", paddingVertical: 12 },
  header: { alignItems: "center", gap: 18, paddingTop: 24 },
  logoRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    padding: 3,
  },
  logoInner: {
    flex: 1,
    alignSelf: "stretch",
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  logoMark: { fontSize: 38, includeFontPadding: false },
  brand: { fontSize: 26, letterSpacing: 0.2 },
  tagline: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  label: { fontSize: 13, marginBottom: 8, marginLeft: 4 },
  inputWrap: {
    borderRadius: 18,
    paddingHorizontal: 18,
  },
  input: {
    height: 56,
    fontSize: 16,
    letterSpacing: 0.2,
  },
  button: {
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontSize: 16, letterSpacing: 0.3 },
  legal: { fontSize: 12, lineHeight: 18, textAlign: "center" },
});
