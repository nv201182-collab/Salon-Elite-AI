import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { useApp } from "@/contexts/AppContext";

const GOLD = "#C8A064";

export default function StoryNewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, publishStory } = useApp();

  const [mediaUri, setMediaUri]   = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"photo" | "video">("photo");
  const [text, setText]           = useState("");
  const [editingText, setEditingText] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const canPublish = !!mediaUri || text.trim().length > 0;

  // ── Выбор медиа из галереи ─────────────────────────────────
  async function pickMedia(type: "photo" | "video" | "all") {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        type === "photo" ? ImagePicker.MediaTypeOptions.Images
        : type === "video" ? ImagePicker.MediaTypeOptions.Videos
        : ImagePicker.MediaTypeOptions.All,
      quality: 0.88,
      allowsEditing: true,
      aspect: [9, 16],
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setMediaUri(asset.uri);
      setMediaType(asset.type === "video" ? "video" : "photo");
    }
  }

  // ── Камера ────────────────────────────────────────────────
  async function openCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.88,
      allowsEditing: true,
      aspect: [9, 16],
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setMediaUri(asset.uri);
      setMediaType(asset.type === "video" ? "video" : "photo");
    }
  }

  // ── Публикация ────────────────────────────────────────────
  function handlePublish() {
    Keyboard.dismiss();
    publishStory(text.trim(), mediaUri ?? undefined);
    router.back();
  }

  // ── Шапка ─────────────────────────────────────────────────
  const Header = (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} hitSlop={12}>
        <Feather name="x" size={24} color="#FFF" />
      </TouchableOpacity>

      <View style={styles.authorRow}>
        <LinearGradient colors={[GOLD, "#7A4A1E"]} style={styles.ring}>
          <View style={styles.ringInner}>
            <Avatar initials={user?.initials ?? "M"} size={32} />
          </View>
        </LinearGradient>
        <Text style={styles.authorName}>{user?.name ?? "Вы"}</Text>
      </View>

      <TouchableOpacity
        onPress={handlePublish}
        style={[styles.publishBtn, !canPublish && styles.publishBtnOff]}
        disabled={!canPublish}
        activeOpacity={0.8}
      >
        <Text style={[styles.publishBtnText, !canPublish && styles.publishBtnTextOff]}>
          Опубликовать
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ── Экран без медиа: выбор источника ──────────────────────
  if (!mediaUri) {
    return (
      <LinearGradient colors={["#111009", "#1C1408"]} style={styles.screen}>
        {Header}
        <View style={styles.pickArea}>
          <Text style={styles.pickTitle}>Добавьте фото или видео</Text>
          <Text style={styles.pickSub}>Это основа вашей сториз</Text>

          <View style={styles.pickButtons}>
            <TouchableOpacity style={styles.pickBtn} onPress={() => pickMedia("photo")} activeOpacity={0.8}>
              <LinearGradient colors={[GOLD, "#7A4A1E"]} style={styles.pickBtnGrad}>
                <Feather name="image" size={28} color="#FFF" />
              </LinearGradient>
              <Text style={styles.pickBtnLabel}>Фото</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.pickBtn} onPress={() => pickMedia("video")} activeOpacity={0.8}>
              <LinearGradient colors={["#6B4FBB", "#3A1F8B"]} style={styles.pickBtnGrad}>
                <Feather name="video" size={28} color="#FFF" />
              </LinearGradient>
              <Text style={styles.pickBtnLabel}>Видео</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.pickBtn} onPress={openCamera} activeOpacity={0.8}>
              <LinearGradient colors={["#2A6A4A", "#0F3E25"]} style={styles.pickBtnGrad}>
                <Feather name="camera" size={28} color="#FFF" />
              </LinearGradient>
              <Text style={styles.pickBtnLabel}>Камера</Text>
            </TouchableOpacity>
          </View>

          {/* Текстовая сториз без фото */}
          <TouchableOpacity
            style={styles.textOnlyBtn}
            onPress={() => { setMediaUri("text_only"); setEditingText(true); }}
            activeOpacity={0.7}
          >
            <Feather name="type" size={16} color={GOLD} />
            <Text style={styles.textOnlyLabel}>Только текст</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // ── Экран с медиа: превью + текст поверх ─────────────────
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.screen}>
        {/* Фоновое изображение */}
        {mediaUri !== "text_only" ? (
          <Image source={{ uri: mediaUri }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
        ) : (
          <LinearGradient colors={["#1A1208", "#2C1F0E"]} style={StyleSheet.absoluteFillObject} />
        )}

        {/* Тёмный скрим для читаемости */}
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.28)" }]} />

        {/* Шапка */}
        {Header}

        {/* Кнопка смены медиа */}
        {mediaUri !== "text_only" && (
          <View style={styles.changeMediaRow}>
            <TouchableOpacity style={styles.changeBtn} onPress={() => setMediaUri(null)} activeOpacity={0.8}>
              <Feather name="refresh-cw" size={14} color="#FFF" />
              <Text style={styles.changeBtnText}>Изменить</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Центральная зона — текстовый оверлей */}
        <KeyboardAvoidingView
          style={styles.centerZone}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <TouchableWithoutFeedback onPress={() => { inputRef.current?.focus(); setEditingText(true); }}>
            <View style={[styles.textOverlay, editingText && styles.textOverlayActive]}>
              {editingText || text.length > 0 ? (
                <TextInput
                  ref={inputRef}
                  style={styles.overlayInput}
                  placeholder="Добавьте текст…"
                  placeholderTextColor="rgba(255,255,255,0.45)"
                  multiline
                  maxLength={280}
                  value={text}
                  onChangeText={setText}
                  autoFocus={editingText}
                  textAlignVertical="center"
                  textAlign="center"
                  onBlur={() => setEditingText(false)}
                  returnKeyType="done"
                  blurOnSubmit
                />
              ) : (
                <View style={styles.addTextHint}>
                  <Feather name="type" size={18} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.addTextHintLabel}>Нажмите, чтобы добавить текст</Text>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>

          {/* Панель инструментов — видна когда клавиатура открыта */}
          {editingText && (
            <TouchableOpacity style={styles.doneBtn} onPress={Keyboard.dismiss} activeOpacity={0.8}>
              <Text style={styles.doneBtnText}>Готово</Text>
            </TouchableOpacity>
          )}
        </KeyboardAvoidingView>

        {/* Нижняя кнопка публикации */}
        {!editingText && (
          <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
            <TouchableOpacity
              style={[styles.bigBtn, !canPublish && styles.bigBtnOff]}
              onPress={handlePublish}
              disabled={!canPublish}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={canPublish ? [GOLD, "#7A4A1E"] : ["rgba(255,255,255,0.12)", "rgba(255,255,255,0.06)"]}
                style={styles.bigBtnGrad}
              >
                <Feather name="send" size={18} color={canPublish ? "#FFF" : "rgba(255,255,255,0.3)"} />
                <Text style={[styles.bigBtnText, !canPublish && styles.bigBtnTextOff]}>
                  Опубликовать сториз
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#111" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingBottom: 10,
    gap: 10,
    zIndex: 20,
  },
  iconBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  authorRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  ring: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", padding: 2 },
  ringInner: { flex: 1, alignSelf: "stretch", borderRadius: 18, backgroundColor: "#1C1408", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  authorName: { color: "#FFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  publishBtn: {
    backgroundColor: GOLD,
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20,
  },
  publishBtnOff: { backgroundColor: "rgba(255,255,255,0.15)" },
  publishBtnText: { color: "#FFF", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  publishBtnTextOff: { color: "rgba(255,255,255,0.4)" },

  // Экран выбора медиа
  pickArea: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 },
  pickTitle: { color: "#FFF", fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  pickSub: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 24 },
  pickButtons: { flexDirection: "row", gap: 20 },
  pickBtn: { alignItems: "center", gap: 10 },
  pickBtnGrad: { width: 72, height: 72, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  pickBtnLabel: { color: "#FFF", fontSize: 13, fontFamily: "Inter_500Medium" },
  textOnlyBtn: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 28, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: "rgba(200,160,100,0.35)" },
  textOnlyLabel: { color: GOLD, fontSize: 14, fontFamily: "Inter_500Medium" },

  // Экран редактирования
  changeMediaRow: { paddingHorizontal: 16, paddingBottom: 8, zIndex: 10 },
  changeBtn: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", backgroundColor: "rgba(0,0,0,0.45)", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14 },
  changeBtnText: { color: "#FFF", fontSize: 13, fontFamily: "Inter_500Medium" },

  centerZone: { flex: 1, alignItems: "center", justifyContent: "center", zIndex: 10 },
  textOverlay: { minWidth: 200, maxWidth: 300, minHeight: 60, alignItems: "center", justifyContent: "center", padding: 16, borderRadius: 16 },
  textOverlayActive: { backgroundColor: "rgba(0,0,0,0.45)", borderWidth: 1, borderColor: "rgba(200,160,100,0.4)" },
  overlayInput: { color: "#FFF", fontSize: 20, fontFamily: "Inter_600SemiBold", textAlign: "center", minWidth: 200, maxWidth: 280 },
  addTextHint: { alignItems: "center", gap: 8 },
  addTextHintLabel: { color: "rgba(255,255,255,0.6)", fontSize: 14, fontFamily: "Inter_400Regular" },

  doneBtn: { marginTop: 12, backgroundColor: GOLD, paddingHorizontal: 28, paddingVertical: 10, borderRadius: 20 },
  doneBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },

  footer: { paddingHorizontal: 20, paddingTop: 12, zIndex: 10 },
  bigBtn: { borderRadius: 18, overflow: "hidden" },
  bigBtnOff: {},
  bigBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 18 },
  bigBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  bigBtnTextOff: { color: "rgba(255,255,255,0.3)" },
});
