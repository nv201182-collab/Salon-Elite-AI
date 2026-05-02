import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { useApp } from "@/contexts/AppContext";

const GOLD = "#C8A064";
const BG_TOP = "#1A1410";
const BG_BOT = "#2C1F0E";

export default function StoryNewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, publishStory } = useApp();
  const [text, setText] = useState("");
  const inputRef = useRef<TextInput>(null);

  const canPublish = text.trim().length > 0;

  function handlePublish() {
    if (!canPublish) return;
    publishStory(text);
    router.back();
  }

  return (
    <LinearGradient colors={[BG_TOP, BG_BOT]} style={styles.screen}>
      {/* Шапка */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} hitSlop={12}>
          <Feather name="x" size={24} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Новая сториз</Text>

        <TouchableOpacity
          onPress={handlePublish}
          style={[styles.publishBtn, !canPublish && styles.publishBtnDisabled]}
          disabled={!canPublish}
        >
          <Text style={[styles.publishBtnText, !canPublish && styles.publishBtnTextDisabled]}>
            Опубликовать
          </Text>
        </TouchableOpacity>
      </View>

      {/* Авторство */}
      <View style={styles.authorRow}>
        <View style={styles.avatarRing}>
          <LinearGradient
            colors={[GOLD, "#8B5E3C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ringGradient}
          >
            <View style={styles.avatarInner}>
              <Avatar initials={user?.initials ?? "M"} size={44} />
            </View>
          </LinearGradient>
        </View>
        <View>
          <Text style={styles.authorName}>{user?.name ?? "Вы"}</Text>
          <Text style={styles.authorSub}>{user?.specialty ?? "Мастер"}</Text>
        </View>
      </View>

      {/* Поле для текста */}
      <KeyboardAvoidingView
        style={styles.inputArea}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableOpacity
          style={styles.textCard}
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
        >
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Напишите что-нибудь…"
            placeholderTextColor="rgba(255,255,255,0.35)"
            multiline
            maxLength={280}
            value={text}
            onChangeText={setText}
            autoFocus
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{text.length}/280</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* Кнопка внизу */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.bigPublishBtn, !canPublish && styles.bigPublishBtnDisabled]}
          onPress={handlePublish}
          disabled={!canPublish}
          activeOpacity={0.82}
        >
          <LinearGradient
            colors={canPublish ? [GOLD, "#8B5E3C"] : ["rgba(255,255,255,0.12)", "rgba(255,255,255,0.08)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bigPublishGrad}
          >
            <Feather name="send" size={18} color={canPublish ? "#FFF" : "rgba(255,255,255,0.3)"} />
            <Text style={[styles.bigPublishText, !canPublish && styles.bigPublishTextDisabled]}>
              Опубликовать сториз
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  closeBtn: {
    width: 36, height: 36,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    color: "#FFF",
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  publishBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: GOLD,
  },
  publishBtnDisabled: { backgroundColor: "rgba(255,255,255,0.14)" },
  publishBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  publishBtnTextDisabled: { color: "rgba(255,255,255,0.35)" },

  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  avatarRing: { },
  ringGradient: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: "center", justifyContent: "center",
    padding: 2.5,
  },
  avatarInner: {
    flex: 1, alignSelf: "stretch", borderRadius: 24,
    backgroundColor: "#2C1F0E",
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  },
  authorName: {
    color: "#FFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  authorSub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },

  inputArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  textCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(200,160,100,0.25)",
    padding: 18,
    minHeight: 180,
  },
  input: {
    flex: 1,
    color: "#FFF",
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    lineHeight: 28,
  },
  charCount: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    alignSelf: "flex-end",
    marginTop: 8,
  },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  bigPublishBtn: { borderRadius: 16, overflow: "hidden" },
  bigPublishBtnDisabled: {},
  bigPublishGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  bigPublishText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  bigPublishTextDisabled: { color: "rgba(255,255,255,0.3)" },
});
