import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

type MediaType = "photo" | "video";

function VideoPreviewPlayer({ uri }: { uri: string }) {
  const player = useVideoPlayer({ uri }, (p) => {
    p.loop = true;
    p.play();
  });
  return (
    <VideoView
      style={StyleSheet.absoluteFillObject}
      player={player}
      allowsFullscreen={false}
      contentFit="cover"
    />
  );
}

export default function NewPostScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { publishPost } = useData();

  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>("photo");
  const [caption, setCaption] = useState<string>("");
  const [tagsRaw, setTagsRaw] = useState<string>("");
  const [category, setCategory] = useState<Post["category"]>("hair");

  const requestPermission = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Нужен доступ к галерее",
        "Откройте настройки приложения и разрешите доступ к медиатеке.",
      );
      return false;
    }
    return true;
  };

  const pickPhoto = async (source: "camera" | "library") => {
    try {
      let result: ImagePicker.ImagePickerResult;
      if (source === "camera") {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert("Нужен доступ к камере", "Откройте настройки и разрешите камеру.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 0.85,
          allowsEditing: true,
          aspect: [3, 4],
        });
      } else {
        if (!(await requestPermission())) return;
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.85,
          allowsEditing: true,
          aspect: [3, 4],
        });
      }
      if (!result.canceled && result.assets[0]) {
        setMediaUri(result.assets[0].uri);
        setMediaType("photo");
      }
    } catch {
      Alert.alert("Ошибка", "Не удалось открыть медиатеку. Попробуйте ещё раз.");
    }
  };

  const pickVideo = async () => {
    try {
      if (!(await requestPermission())) return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
        videoMaxDuration: 120,
        allowsEditing: true,
      });
      if (!result.canceled && result.assets[0]) {
        setMediaUri(result.assets[0].uri);
        setMediaType("video");
      }
    } catch {
      Alert.alert("Ошибка", "Не удалось выбрать видео. Попробуйте ещё раз.");
    }
  };

  const clearMedia = () => {
    setMediaUri(null);
  };

  const onPublish = () => {
    if (!mediaUri) {
      Alert.alert("Добавьте фото или видео", "Публикация без медиа невозможна.");
      return;
    }
    const tags = tagsRaw
      .split(/[,#\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 6);

    const imageSource = { uri: mediaUri };
    const videoSource = mediaType === "video" ? { uri: mediaUri } : undefined;

    publishPost(imageSource, caption, tags, category, videoSource);
    router.back();
  };

  const canPublish = !!mediaUri;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.background }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
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
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 80,
          gap: 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {mediaUri ? (
          <View style={[styles.previewCard, { borderColor: colors.border, backgroundColor: "#111" }]}>
            {mediaType === "video" ? (
              <VideoPreviewPlayer uri={mediaUri} />
            ) : (
              <Image
                source={{ uri: mediaUri }}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
                transition={200}
              />
            )}

            {mediaType === "video" ? (
              <View style={[styles.videoBadge, { backgroundColor: "rgba(0,0,0,0.65)" }]}>
                <Feather name="video" size={12} color="#fff" />
                <Text style={[styles.videoBadgeText, { fontFamily: "Inter_600SemiBold" }]}>
                  ВИДЕО
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={clearMedia}
              style={[styles.removeBtn, { backgroundColor: "rgba(10,10,10,0.72)" }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={15} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.pickerBlock}>
            <Text style={[styles.sectionLabel, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
              МЕДИА
            </Text>
            <View style={styles.pickRow}>
              <PressableScale onPress={() => pickPhoto("camera")} scaleTo={0.97} style={styles.pickItem}>
                <View style={[styles.pickTile, { borderColor: colors.gold, backgroundColor: colors.card }]}>
                  <Feather name="camera" size={22} color={colors.gold} />
                  <Text style={[styles.pickLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                    СНЯТЬ
                  </Text>
                  <Text style={[styles.pickSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    Камера
                  </Text>
                </View>
              </PressableScale>

              <PressableScale onPress={() => pickPhoto("library")} scaleTo={0.97} style={styles.pickItem}>
                <View style={[styles.pickTile, { borderColor: colors.border, backgroundColor: colors.card }]}>
                  <Feather name="image" size={22} color={colors.gold} />
                  <Text style={[styles.pickLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                    ФОТО
                  </Text>
                  <Text style={[styles.pickSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    Из галереи
                  </Text>
                </View>
              </PressableScale>

              <PressableScale onPress={pickVideo} scaleTo={0.97} style={styles.pickItem}>
                <View style={[styles.pickTile, { borderColor: colors.border, backgroundColor: colors.card }]}>
                  <Feather name="video" size={22} color={colors.gold} />
                  <Text style={[styles.pickLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                    ВИДЕО
                  </Text>
                  <Text style={[styles.pickSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    Из галереи
                  </Text>
                </View>
              </PressableScale>
            </View>
          </View>
        )}

        <View style={{ gap: 10 }}>
          <Text style={[styles.sectionLabel, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
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
          <Text style={[styles.sectionLabel, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
            ОПИСАНИЕ
          </Text>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Расскажите о работе, технике, приёмах…"
            placeholderTextColor={colors.mutedForeground}
            multiline
            style={[
              styles.captionInput,
              {
                color: colors.foreground,
                borderColor: colors.border,
                backgroundColor: colors.card,
                fontFamily: "Inter_400Regular",
              },
            ]}
          />
        </View>

        <View style={{ gap: 10 }}>
          <Text style={[styles.sectionLabel, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
            ТЕГИ
          </Text>
          <TextInput
            value={tagsRaw}
            onChangeText={setTagsRaw}
            placeholder="balayage, блонд, укладка"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
            style={[
              styles.tagsInput,
              {
                color: colors.foreground,
                borderColor: colors.border,
                backgroundColor: colors.card,
                fontFamily: "Inter_400Regular",
              },
            ]}
          />
          <Text style={[styles.hint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Разделяйте запятыми или пробелами · максимум 6 тегов
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
            <Feather
              name={mediaType === "video" ? "video" : "image"}
              size={15}
              color={canPublish ? colors.accentForeground : colors.mutedForeground}
              style={{ marginRight: 8 }}
            />
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
  pickerBlock: { gap: 14 },
  sectionLabel: { fontSize: 9, letterSpacing: 2 },
  pickRow: { flexDirection: "row", gap: 10 },
  pickItem: { flex: 1 },
  pickTile: {
    aspectRatio: 0.9,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  pickLabel: { fontSize: 10, letterSpacing: 1.5 },
  pickSub: { fontSize: 10, letterSpacing: 0.2 },
  previewCard: {
    aspectRatio: 3 / 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  videoBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  videoBadgeText: {
    fontSize: 10,
    color: "#fff",
    letterSpacing: 1,
  },
  removeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  chipsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  captionInput: {
    minHeight: 110,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    fontSize: 14,
    textAlignVertical: "top",
    letterSpacing: 0.1,
    lineHeight: 20,
    borderRadius: 14,
  },
  tagsInput: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    letterSpacing: 0.1,
    borderRadius: 14,
  },
  hint: { fontSize: 11, letterSpacing: 0.2 },
  publishBtn: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    marginTop: 4,
  },
  publishText: { fontSize: 12, letterSpacing: 1.5 },
});
