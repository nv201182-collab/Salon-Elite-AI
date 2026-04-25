import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Chip } from "@/components/Chip";
import { PressableScale } from "@/components/PressableScale";
import { useData } from "@/contexts/DataContext";
import { type Post } from "@/data/seed";
import { useColors } from "@/hooks/useColors";

const CATEGORIES: { key: Post["category"]; label: string }[] = [
  { key: "hair", label: "Окрашивание" },
  { key: "nails", label: "Маникюр" },
  { key: "makeup", label: "Макияж" },
  { key: "brows", label: "Брови" },
  { key: "skin", label: "Уход" },
];

export default function NewPostScreen() {
  const colors = useColors();
  const router = useRouter();
  const { publishPost } = useData();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [tagsRaw, setTagsRaw] = useState<string>("");
  const [category, setCategory] = useState<Post["category"]>("hair");

  const pick = async (source: "camera" | "library") => {
    try {
      if (source === "camera") {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert("Нужен доступ к камере", "Откройте настройки приложения и разрешите камеру.");
          return;
        }
        const r = await ImagePicker.launchCameraAsync({ quality: 0.8 });
        if (!r.canceled && r.assets[0]) setImageUri(r.assets[0].uri);
      } else {
        const r = await ImagePicker.launchImageLibraryAsync({
          quality: 0.8,
          mediaTypes: ["images"],
        });
        if (!r.canceled && r.assets[0]) setImageUri(r.assets[0].uri);
      }
    } catch (e) {
      Alert.alert("Не удалось", "Попробуйте ещё раз.");
    }
  };

  const onPublish = () => {
    if (!imageUri) {
      Alert.alert("Добавьте фото", "Без фотографии работа не публикуется.");
      return;
    }
    const tags = tagsRaw
      .split(/[,#\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 6);
    publishPost({ uri: imageUri }, caption, tags, category);
    router.back();
  };

  const canPublish = !!imageUri;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <Stack.Screen
        options={{
          title: "НОВАЯ РАБОТА",
          headerRight: () => (
            <PressableScale onPress={onPublish} disabled={!canPublish} scaleTo={0.94}>
              <Text
                style={{
                  color: canPublish ? colors.gold : colors.mutedForeground,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 12,
                  letterSpacing: 2,
                }}
              >
                ПУБЛИКАЦИЯ
              </Text>
            </PressableScale>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {imageUri ? (
          <View style={[styles.imageCard, { borderColor: colors.border }]}>
            <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
            <PressableScale onPress={() => setImageUri(null)} scaleTo={0.92}>
              <View style={[styles.imageRemove, { borderColor: colors.gold }]}>
                <Feather name="x" size={14} color={colors.gold} />
              </View>
            </PressableScale>
          </View>
        ) : (
          <View style={styles.imagePickerRow}>
            <PressableScale onPress={() => pick("camera")} scaleTo={0.97} style={{ flex: 1 }}>
              <View style={[styles.pickTile, { borderColor: colors.gold, backgroundColor: colors.card }]}>
                <Feather name="camera" size={20} color={colors.gold} />
                <Text style={[styles.pickLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  СНЯТЬ
                </Text>
              </View>
            </PressableScale>
            <PressableScale onPress={() => pick("library")} scaleTo={0.97} style={{ flex: 1 }}>
              <View style={[styles.pickTile, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Feather name="image" size={20} color={colors.gold} />
                <Text style={[styles.pickLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  ИЗ ГАЛЕРЕИ
                </Text>
              </View>
            </PressableScale>
          </View>
        )}

        <View style={{ gap: 10 }}>
          <Text style={[styles.label, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
            КАТЕГОРИЯ
          </Text>
          <View style={styles.chipsRow}>
            {CATEGORIES.map((c) => (
              <Chip
                key={c.key}
                label={c.label}
                active={category === c.key}
                onPress={() => setCategory(c.key)}
                variant="gold"
              />
            ))}
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <Text style={[styles.label, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
            ОПИСАНИЕ
          </Text>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Расскажите коротко о работе, технике, приёмах…"
            placeholderTextColor={colors.mutedForeground}
            multiline
            style={[
              styles.captionInput,
              {
                color: colors.foreground,
                borderColor: colors.border,
                backgroundColor: colors.card,
              },
            ]}
          />
        </View>

        <View style={{ gap: 10 }}>
          <Text style={[styles.label, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
            ТЕГИ
          </Text>
          <TextInput
            value={tagsRaw}
            onChangeText={setTagsRaw}
            placeholder="balayage, блонд, окрашивание"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
            style={[
              styles.tagsInput,
              {
                color: colors.foreground,
                borderColor: colors.border,
                backgroundColor: colors.card,
              },
            ]}
          />
          <Text style={[styles.hint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Разделяйте запятыми или пробелами. Максимум — шесть тегов.
          </Text>
        </View>

        <PressableScale onPress={onPublish} disabled={!canPublish} scaleTo={0.97}>
          <View
            style={[
              styles.publishBtn,
              {
                backgroundColor: canPublish ? colors.gold : colors.muted,
                borderColor: canPublish ? colors.gold : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.publishText,
                {
                  color: canPublish ? colors.accentForeground : colors.mutedForeground,
                  fontFamily: "Inter_600SemiBold",
                },
              ]}
            >
              ОПУБЛИКОВАТЬ · +50 БАЛЛОВ
            </Text>
          </View>
        </PressableScale>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  imagePickerRow: { flexDirection: "row", gap: 10 },
  pickTile: {
    aspectRatio: 1,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  pickLabel: { fontSize: 11, letterSpacing: 2 },
  imageCard: { aspectRatio: 3 / 4, borderWidth: StyleSheet.hairlineWidth, position: "relative" },
  image: { width: "100%", height: "100%" },
  imageRemove: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(10,10,10,0.7)",
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 9, letterSpacing: 2 },
  chipsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  captionInput: {
    minHeight: 110,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlignVertical: "top",
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  tagsInput: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.1,
  },
  hint: { fontSize: 11, letterSpacing: 0.2 },
  publishBtn: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 6,
  },
  publishText: { fontSize: 12, letterSpacing: 2 },
});
