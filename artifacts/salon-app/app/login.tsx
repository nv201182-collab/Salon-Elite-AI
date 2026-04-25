import * as Haptics from "expo-haptics";
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

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 20);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 24);

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
            <View style={[styles.monogramBox, { borderColor: colors.gold }]}>
              <Text style={[styles.monogram, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
                M
              </Text>
            </View>
            <Text style={[styles.brand, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              MAISON BEAUTÉ
            </Text>
            <Text
              style={[
                styles.tagline,
                { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
              ]}
            >
              Внутренняя сеть для команды дома
            </Text>
          </View>

          <View style={{ gap: 24 }}>
            <View>
              <Text style={[styles.label, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
                ТЕЛЕФОН
              </Text>
              <TextInput
                value={phone}
                onChangeText={(v) => setPhone(formatPhone(v))}
                placeholder="+7 (___) ___-__-__"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="phone-pad"
                style={[styles.input, { color: colors.foreground, borderBottomColor: colors.border }]}
              />
            </View>
            <View>
              <Text style={[styles.label, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
                ИМЯ И ФАМИЛИЯ
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Например, Анна Морозова"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="words"
                style={[styles.input, { color: colors.foreground, borderBottomColor: colors.border }]}
              />
            </View>
          </View>

          <View style={{ gap: 18 }}>
            <PressableScale onPress={onSubmit} disabled={!valid || loading} scaleTo={0.97}>
              <View
                style={[
                  styles.button,
                  {
                    backgroundColor: valid ? colors.gold : colors.muted,
                    opacity: loading ? 0.7 : 1,
                    borderColor: valid ? colors.gold : colors.border,
                  },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={colors.accentForeground} />
                ) : (
                  <Text
                    style={[
                      styles.buttonText,
                      {
                        color: valid ? colors.accentForeground : colors.mutedForeground,
                        fontFamily: "Inter_600SemiBold",
                      },
                    ]}
                  >
                    ВОЙТИ
                  </Text>
                )}
              </View>
            </PressableScale>
            <Text
              style={[styles.legal, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}
            >
              Закрытая система. Доступ только сотрудникам Maison Beauté. Подтверждая вход, вы принимаете внутренние правила дома.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28 },
  inner: { flex: 1, justifyContent: "space-between", paddingVertical: 12 },
  header: { alignItems: "center", gap: 14, paddingTop: 24 },
  monogramBox: {
    width: 84,
    height: 84,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  monogram: { fontSize: 46, includeFontPadding: false },
  brand: { fontSize: 14, letterSpacing: 4 },
  tagline: { fontSize: 12, textAlign: "center", letterSpacing: 0.5 },
  label: { fontSize: 9, letterSpacing: 2, marginBottom: 10 },
  input: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    fontSize: 18,
    letterSpacing: 0.4,
  },
  button: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  buttonText: { fontSize: 12, letterSpacing: 3 },
  legal: { fontSize: 11, lineHeight: 17, textAlign: "center", letterSpacing: 0.3 },
});
