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
            <Image
              source={require("../assets/images/bee.png")}
              style={styles.bee}
              contentFit="cover"
            />
            <Text style={[styles.brand, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
              APIA
            </Text>
            <View style={styles.taglineRow}>
              <Text style={[styles.taglineWord, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                ARCHITECTURE
              </Text>
              <View style={[styles.dot, { backgroundColor: colors.gold }]} />
              <Text style={[styles.taglineWord, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                PEOPLE
              </Text>
              <View style={[styles.dot, { backgroundColor: colors.gold }]} />
              <Text style={[styles.taglineWord, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                INTELLIGENCE
              </Text>
              <View style={[styles.dot, { backgroundColor: colors.gold }]} />
              <Text style={[styles.taglineWord, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                ACTION
              </Text>
            </View>
            <Text
              style={[
                styles.intro,
                { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
              ]}
            >
              Экосистема роста мастеров{"\n"}индустрии красоты
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
              <View
                style={[
                  styles.button,
                  {
                    backgroundColor: valid ? colors.gold : colors.muted,
                    opacity: loading ? 0.7 : 1,
                  },
                ]}
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
              </View>
            </PressableScale>
            <Text
              style={[styles.legal, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}
            >
              APIA — закрытая платформа для мастеров красоты.{"\n"}Подтверждая вход, вы соглашаетесь с правилами сообщества.
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
  header: { alignItems: "center", gap: 12, paddingTop: 24 },
  bee: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 4,
  },
  brand: {
    fontSize: 56,
    letterSpacing: 8,
    includeFontPadding: false,
    marginTop: 4,
  },
  taglineRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  taglineWord: { fontSize: 10, letterSpacing: 1.5 },
  dot: { width: 3, height: 3, borderRadius: 2 },
  intro: { fontSize: 14, textAlign: "center", lineHeight: 21, marginTop: 12 },
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
