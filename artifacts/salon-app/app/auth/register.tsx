/**
 * Registration screen — Phone → OTP → Name/Email
 *
 * Current state: local mock only (no SMS sent, OTP = "123456").
 * TODO: wire up to actual API endpoints when backend is ready.
 */
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import {
  isValidEmail,
  isValidName,
  isValidPhone,
  PHONE_REGIONS,
  type PhoneRegion,
  type RegistrationInput,
} from "@/types/auth";

type Step = "phone" | "otp" | "profile";

const MOCK_OTP = "123456"; // TODO: replace with real SMS API

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useApp();

  const [step, setStep]         = useState<Step>("phone");
  const [region, setRegion]     = useState<PhoneRegion>("RU");
  const [rawPhone, setRawPhone] = useState("");
  const [otp, setOtp]           = useState("");
  const [otpError, setOtpError] = useState(false);
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);

  const phoneRef = useRef<TextInput>(null);
  const otpRef   = useRef<TextInput>(null);
  const nameRef  = useRef<TextInput>(null);

  const meta       = PHONE_REGIONS[region];
  const fullPhone  = meta.prefix + rawPhone.replace(/\D/g, "");
  const phoneValid = isValidPhone(fullPhone);
  const canNext    =
    step === "phone"   ? phoneValid :
    step === "otp"     ? otp.length === 6 :
    step === "profile" ? isValidName(name) : false;

  function handleSendOtp() {
    if (!phoneValid) return;
    setLoading(true);
    // TODO: call POST /auth/otp/send with { phone: fullPhone }
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      setTimeout(() => otpRef.current?.focus(), 300);
    }, 800);
  }

  function handleVerifyOtp() {
    if (otp !== MOCK_OTP) {
      setOtpError(true);
      setTimeout(() => setOtpError(false), 1500);
      return;
    }
    // TODO: call POST /auth/otp/verify with { phone, code }
    setStep("profile");
    setTimeout(() => nameRef.current?.focus(), 300);
  }

  async function handleRegister() {
    if (!isValidName(name)) return;
    setLoading(true);
    const input: RegistrationInput = {
      phone: fullPhone,
      region,
      name: name.trim(),
      email: email.trim() || undefined,
    };
    // TODO: call POST /auth/register with input + registrationToken
    // For now: use existing local login
    setTimeout(() => {
      setLoading(false);
      login(fullPhone, name.trim());
      router.replace("/(tabs)/feed");
    }, 800);
  }

  const headerPad = insets.top + 16;

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={["#FAFAFA", "#F2F2F7"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: headerPad }]}>
        {step !== "phone" && (
          <TouchableOpacity
            onPress={() => {
              if (step === "otp") setStep("phone");
              else if (step === "profile") setStep("otp");
            }}
            style={styles.backBtn}
            hitSlop={12}
          >
            <Feather name="arrow-left" size={22} color="#111" />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        {step === "phone" && (
          <TouchableOpacity onPress={() => router.replace("/(tabs)/feed")} hitSlop={10}>
            <Text style={styles.skipText}>Пропустить</Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          {/* APIA logo */}
          <View style={styles.logoRow}>
            <View style={styles.logoBee}>
              <Text style={styles.logoEmoji}>🐝</Text>
            </View>
            <Text style={styles.logoText}>APIA</Text>
          </View>

          {/* ── Step: phone ──────────────────────────────── */}
          {step === "phone" && (
            <>
              <Text style={styles.title}>Добро пожаловать</Text>
              <Text style={styles.sub}>Введите номер телефона для входа или регистрации</Text>

              {/* Region selector */}
              <View style={styles.regionRow}>
                {(Object.keys(PHONE_REGIONS) as PhoneRegion[]).map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.regionBtn, region === r && styles.regionBtnActive]}
                    onPress={() => setRegion(r)}
                  >
                    <Text style={styles.regionFlag}>{PHONE_REGIONS[r].flag}</Text>
                    <Text style={[styles.regionCode, region === r && styles.regionCodeActive]}>
                      {PHONE_REGIONS[r].prefix}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Phone input */}
              <View style={styles.inputRow}>
                <Text style={styles.prefixText}>{meta.prefix}</Text>
                <TextInput
                  ref={phoneRef}
                  style={styles.phoneInput}
                  value={rawPhone}
                  onChangeText={(v) => setRawPhone(v.replace(/[^\d\s\-()]/g, ""))}
                  placeholder={meta.mask.replace(/#/g, "0")}
                  placeholderTextColor="#A0A0A8"
                  keyboardType="phone-pad"
                  maxLength={15}
                  returnKeyType="done"
                  onSubmitEditing={handleSendOtp}
                />
              </View>

              <PrimaryButton
                label={loading ? "Отправка…" : "Получить код"}
                onPress={handleSendOtp}
                disabled={!phoneValid || loading}
              />

              <Text style={styles.legal}>
                Продолжая, вы соглашаетесь с{" "}
                <Text style={styles.legalLink}>Условиями использования</Text>
                {" "}и{" "}
                <Text style={styles.legalLink}>Политикой конфиденциальности</Text>
              </Text>
            </>
          )}

          {/* ── Step: OTP ──────────────────────────────────── */}
          {step === "otp" && (
            <>
              <Text style={styles.title}>Код подтверждения</Text>
              <Text style={styles.sub}>
                Отправили SMS на{"\n"}{meta.prefix} {rawPhone}
              </Text>

              <TextInput
                ref={otpRef}
                style={[styles.otpInput, otpError && styles.otpInputError]}
                value={otp}
                onChangeText={(v) => setOtp(v.replace(/\D/g, "").slice(0, 6))}
                placeholder="• • • • • •"
                placeholderTextColor="#A0A0A8"
                keyboardType="number-pad"
                maxLength={6}
                textAlign="center"
                returnKeyType="done"
                onSubmitEditing={handleVerifyOtp}
              />
              {otpError && (
                <Text style={styles.errorText}>Неверный код. Попробуйте ещё раз.</Text>
              )}

              <PrimaryButton
                label="Подтвердить"
                onPress={handleVerifyOtp}
                disabled={otp.length !== 6}
              />

              <TouchableOpacity style={styles.resendBtn} onPress={() => setStep("phone")}>
                <Text style={styles.resendText}>Отправить код повторно</Text>
              </TouchableOpacity>

              <Text style={styles.devNote}>
                Для тестирования код: 123456
              </Text>
            </>
          )}

          {/* ── Step: profile ──────────────────────────────── */}
          {step === "profile" && (
            <>
              <Text style={styles.title}>Ваш профиль</Text>
              <Text style={styles.sub}>Как вас зовут?</Text>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Имя и фамилия *</Text>
                <TextInput
                  ref={nameRef}
                  style={styles.field}
                  value={name}
                  onChangeText={setName}
                  placeholder="София Орлова"
                  placeholderTextColor="#A0A0A8"
                  autoCapitalize="words"
                  maxLength={80}
                  returnKeyType="next"
                  onSubmitEditing={() => {}}
                />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Email (необязательно)</Text>
                <TextInput
                  style={styles.field}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="sofia@apia.ru"
                  placeholderTextColor="#A0A0A8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={120}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
                {email.length > 0 && !isValidEmail(email) && (
                  <Text style={styles.fieldError}>Некорректный формат email</Text>
                )}
              </View>

              <PrimaryButton
                label={loading ? "Создаём профиль…" : "Начать работу"}
                onPress={handleRegister}
                disabled={!canNext || loading}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[styles.primaryBtn, disabled && styles.primaryBtnOff]}
    >
      <LinearGradient
        colors={disabled ? ["#D0D0D8", "#C8C8D0"] : ["#C8A064", "#8B5E3C"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.primaryBtnGrad}
      >
        <Text style={[styles.primaryBtnText, disabled && styles.primaryBtnTextOff]}>
          {label}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 8,
  },
  backBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  skipText: { color: "#8A8A8E", fontSize: 15, fontFamily: "Inter_500Medium" },

  content: {
    flex: 1, paddingHorizontal: 28, paddingTop: 12, paddingBottom: 32, gap: 18,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  logoBee: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: "rgba(200,160,100,0.12)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(200,160,100,0.25)",
  },
  logoEmoji: { fontSize: 24 },
  logoText: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#111", letterSpacing: -1 },

  title: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#111", letterSpacing: -0.6 },
  sub:   { fontSize: 15, color: "#8A8A8E", fontFamily: "Inter_400Regular", lineHeight: 22, marginTop: -8 },

  regionRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  regionBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1, borderColor: "#E5E5EA",
    backgroundColor: "#FFFFFF",
  },
  regionBtnActive: { borderColor: "#C8A064", backgroundColor: "rgba(200,160,100,0.08)" },
  regionFlag: { fontSize: 18 },
  regionCode: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#8A8A8E" },
  regionCodeActive: { color: "#C8A064" },

  inputRow: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderColor: "#E5E5EA",
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: "#FFFFFF", gap: 8,
  },
  prefixText: { fontSize: 17, fontFamily: "Inter_500Medium", color: "#111", minWidth: 36 },
  phoneInput: { flex: 1, fontSize: 17, fontFamily: "Inter_400Regular", color: "#111" },

  otpInput: {
    borderWidth: 1.5, borderColor: "#E5E5EA",
    borderRadius: 16, paddingVertical: 18,
    fontSize: 28, fontFamily: "Inter_700Bold", color: "#111",
    letterSpacing: 10, backgroundColor: "#FFFFFF", textAlign: "center",
  },
  otpInputError: { borderColor: "#C8384A" },
  errorText: { color: "#C8384A", fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: -8 },

  primaryBtn: { borderRadius: 16, overflow: "hidden", marginTop: 4 },
  primaryBtnOff: { opacity: 0.65 },
  primaryBtnGrad: { paddingVertical: 16, alignItems: "center" },
  primaryBtnText: { color: "#FFFFFF", fontSize: 17, fontFamily: "Inter_600SemiBold" },
  primaryBtnTextOff: { color: "rgba(255,255,255,0.6)" },

  resendBtn: { alignItems: "center", paddingVertical: 8 },
  resendText: { color: "#C8A064", fontSize: 15, fontFamily: "Inter_500Medium" },

  devNote: { textAlign: "center", color: "#A0A0A8", fontSize: 12, fontFamily: "Inter_400Regular" },

  legal: { color: "#A0A0A8", fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 18 },
  legalLink: { color: "#C8A064" },

  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#8A8A8E" },
  field: {
    borderWidth: 1.5, borderColor: "#E5E5EA",
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, fontFamily: "Inter_400Regular", color: "#111",
    backgroundColor: "#FFFFFF",
  },
  fieldError: { color: "#C8384A", fontSize: 12, fontFamily: "Inter_400Regular" },
});
