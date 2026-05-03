import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassCard } from "@/components/GlassCard";
import { LiquidBg } from "@/components/LiquidBg";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "");

const LOCAL_USERS: Record<string, { id: string; name: string; initials: string; specialty: string; phone: string }> = {
  "+79855202226": { id: "u_vlad",  name: "Владислав", initials: "ВЛ", specialty: "Мастер APIA", phone: "+79855202226" },
  "+79639703820": { id: "u_user2", name: "Антон",     initials: "АН", specialty: "Мастер APIA", phone: "+79639703820" },
};

type Screen = "phone" | "otp";

function formatRuPhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);

  let out = "+7";
  if (d.length > 1) out += " " + d.slice(1, 4);
  if (d.length > 4) out += " " + d.slice(4, 7);
  if (d.length > 7) out += "-" + d.slice(7, 9);
  if (d.length > 9) out += "-" + d.slice(9, 11);
  return out;
}

export default function LoginScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const { loginWithApiUser } = useApp();

  const [screen, setScreen]   = useState<Screen>("phone");
  const [phone, setPhone]     = useState("+7");
  const [code, setCode]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const codeRef = useRef<TextInput>(null);

  const cleanPhone = phone.replace(/[\s\-]/g, "");

  function haptic() {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }

  function handleSendCode() {
    setError(null);
    if (cleanPhone.replace(/\D/g, "").length < 11) {
      setError("Введите номер: +7 XXX XXX-XX-XX");
      return;
    }
    if (!LOCAL_USERS[cleanPhone]) {
      setError("Номер не найден в системе APIA");
      return;
    }
    haptic();
    setScreen("otp");
    setTimeout(() => codeRef.current?.focus(), 150);
    // Fire-and-forget to server (not required)
    if (API_BASE) {
      fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      }).catch(() => {});
    }
  }

  function handleVerify() {
    setError(null);
    if (code.length !== 4) { setError("Введите 4-значный код"); return; }
    if (code !== "1234") { setError("Неверный код. Используйте 1234"); return; }
    haptic();
    const localUser = LOCAL_USERS[cleanPhone];
    if (!localUser) { setError("Номер не найден"); return; }
    loginWithApiUser(localUser);
  }

  const topPad = insets.top + (Platform.OS === "web" ? 48 : 20);

  return (
    <View style={styles.root}>
      <LiquidBg />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: topPad, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand header */}
          <View style={styles.header}>
            <View style={[styles.beeBg, { borderColor: "rgba(200,160,100,0.35)" }]}>
              <Image
                source={require("../assets/images/bee.png")}
                style={styles.bee}
                contentFit="cover"
              />
            </View>
            <Text style={[styles.logoText, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
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
          </View>

          {/* Form card */}
          <GlassCard borderRadius={26} innerStyle={styles.card} tintOpacity={0.28}>
            {screen === "phone" ? (
              <View style={styles.formBody}>
                <Text style={[styles.formTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  Войти в APIA
                </Text>
                <Text style={[styles.formSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Введите российский номер телефона
                </Text>

                <View style={[styles.inputWrap, { backgroundColor: "rgba(255,255,255,0.55)", borderColor: colors.border }]}>
                  <TextInput
                    value={phone}
                    onChangeText={(t) => setPhone(formatRuPhone(t))}
                    keyboardType="phone-pad"
                    placeholder="+7 999 000-00-00"
                    style={[styles.textInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                    placeholderTextColor={colors.mutedForeground}
                    autoFocus
                  />
                </View>

                {error && <Text style={styles.err}>{error}</Text>}

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: colors.primary }, loading && { opacity: 0.55 }]}
                  onPress={handleSendCode}
                  disabled={false}
                  activeOpacity={0.82}
                >
                  {loading
                    ? <ActivityIndicator color="#FFF" />
                    : <Text style={[styles.btnText, { fontFamily: "Inter_700Bold" }]}>ПОЛУЧИТЬ КОД</Text>
                  }
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formBody}>
                <Text style={[styles.formTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  Введите код
                </Text>
                <Text style={[styles.formSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Тестовый код:{" "}
                  <Text style={{ color: colors.accent, fontFamily: "Inter_700Bold" }}>1234</Text>
                </Text>

                <View style={[styles.inputWrap, { backgroundColor: "rgba(255,255,255,0.55)", borderColor: code.length === 4 ? colors.accent : colors.border }]}>
                  <TextInput
                    ref={codeRef}
                    value={code}
                    onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 4))}
                    keyboardType="number-pad"
                    placeholder="0 0 0 0"
                    maxLength={4}
                    style={[styles.textInput, styles.codeInput, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>

                {error && <Text style={styles.err}>{error}</Text>}

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: colors.primary }, loading && { opacity: 0.55 }]}
                  onPress={handleVerify}
                  disabled={false}
                  activeOpacity={0.82}
                >
                  {loading
                    ? <ActivityIndicator color="#FFF" />
                    : <Text style={[styles.btnText, { fontFamily: "Inter_700Bold" }]}>ВОЙТИ</Text>
                  }
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { setScreen("phone"); setCode(""); setError(null); }}>
                  <Text style={[styles.backLink, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    ← Изменить номер
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </GlassCard>

          <Text style={[styles.legal, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            APIA — закрытая платформа для мастеров красоты
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "space-between", paddingHorizontal: 24, gap: 28 },
  header: { alignItems: "center", gap: 10 },
  beeBg: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.65)", borderWidth: 1,
    shadowColor: "#7A6030", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18, shadowRadius: 20, elevation: 5,
  },
  bee:         { width: 68, height: 68, borderRadius: 34 },
  logoText:    { fontSize: 60, letterSpacing: 12 },
  taglineRow:  { flexDirection: "row", alignItems: "center", flexWrap: "wrap", justifyContent: "center", gap: 7 },
  taglineWord: { fontSize: 8.5, letterSpacing: 2.2 },
  dot:         { width: 2.5, height: 2.5, borderRadius: 2 },
  card:        { padding: 24 },
  formBody:    { gap: 14 },
  formTitle:   { fontSize: 24, letterSpacing: -0.3 },
  formSub:     { fontSize: 14, opacity: 0.72 },
  inputWrap:   { borderRadius: 16, paddingHorizontal: 18, borderWidth: 1.2 },
  textInput:   { height: 54, fontSize: 17, letterSpacing: 0.4 },
  codeInput:   { textAlign: "center", fontSize: 28, letterSpacing: 10 },
  err:         { color: "#C8384A", fontSize: 13, fontFamily: "Inter_400Regular" },
  btn: {
    height: 56, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
    marginTop: 4,
    shadowColor: "#8B6030", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28, shadowRadius: 14, elevation: 6,
  },
  btnText:  { color: "#FFF", fontSize: 15, letterSpacing: 1.2 },
  backLink: { textAlign: "center", fontSize: 14, marginTop: 6, opacity: 0.7 },
  legal:    { textAlign: "center", fontSize: 12, lineHeight: 18, opacity: 0.5 },
});
