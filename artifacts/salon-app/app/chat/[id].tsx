import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MessageBubble } from "@/components/MessageBubble";
import { PressableScale } from "@/components/PressableScale";
import { useApp } from "@/contexts/AppContext";
import { useData } from "@/contexts/DataContext";
import { EMPLOYEES_SEED } from "@/data/seed";
import { useColors } from "@/hooks/useColors";

function shortTime(at: number): string {
  const d = new Date(at);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export default function ChatDetail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useApp();
  const { chats, messagesByChat, sendMessage, togglePinMessage } = useData();
  const [draft, setDraft] = useState<string>("");

  const chat = chats.find((c) => c.id === id);
  const messages = messagesByChat[id ?? ""] ?? [];
  const inverted = useMemo(() => [...messages].reverse(), [messages]);
  const pinned = messages.find((m) => m.pinned);

  if (!chat) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <Stack.Screen options={{ title: "" }} />
        <Text style={{ color: colors.mutedForeground }}>Чат не найден</Text>
      </View>
    );
  }

  const onSend = () => {
    if (!draft.trim()) return;
    sendMessage(chat.id, draft);
    setDraft("");
  };

  const onLongPress = (msgId: string) => {
    Alert.alert("Действия с сообщением", undefined, [
      { text: "Отмена", style: "cancel" },
      { text: "Закрепить / открепить", onPress: () => togglePinMessage(chat.id, msgId) },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1, backgroundColor: colors.background }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <Stack.Screen
        options={{
          title: (chat.title || "").toUpperCase(),
          headerTitleStyle: { fontFamily: "Inter_500Medium", fontSize: 12, letterSpacing: 2 },
        }}
      />

      {pinned ? (
        <View style={[styles.pinned, { borderColor: colors.gold, backgroundColor: colors.card }]}>
          <Feather name="bookmark" size={14} color={colors.gold} />
          <Text
            numberOfLines={2}
            style={[styles.pinnedText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          >
            {pinned.text}
          </Text>
        </View>
      ) : null}

      <FlatList
        data={inverted}
        keyExtractor={(m) => m.id}
        inverted
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{ paddingVertical: 14 }}
        renderItem={({ item }) => {
          const fromMe = item.authorId === user?.id;
          const author =
            item.authorId === "u_self"
              ? user?.name ?? "Вы"
              : EMPLOYEES_SEED.find((e) => e.id === item.authorId)?.name ?? "Сотрудник";
          return (
            <PressableScale
              onPress={() => {}}
              onLongPress={() => onLongPress(item.id)}
              scaleTo={0.99}
              haptic={false}
            >
              <MessageBubble
                text={item.text}
                fromMe={fromMe}
                authorName={fromMe ? undefined : author.split(" ")[0]}
                time={shortTime(item.at)}
                pinned={item.pinned}
              />
            </PressableScale>
          );
        }}
        showsVerticalScrollIndicator={false}
      />

      <View
        style={[
          styles.composer,
          {
            borderTopColor: colors.border,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 14,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Сообщение"
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.composerInput,
            { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card },
          ]}
          onSubmitEditing={onSend}
          returnKeyType="send"
          multiline
        />
        <PressableScale onPress={onSend} scaleTo={0.9} disabled={!draft.trim()}>
          <View
            style={[
              styles.sendBtn,
              {
                backgroundColor: draft.trim() ? colors.gold : colors.muted,
                borderColor: draft.trim() ? colors.gold : colors.border,
              },
            ]}
          >
            <Feather
              name="arrow-up"
              size={18}
              color={draft.trim() ? colors.accentForeground : colors.mutedForeground}
            />
          </View>
        </PressableScale>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pinned: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderLeftWidth: 2,
  },
  pinnedText: { flex: 1, fontSize: 12, lineHeight: 17, letterSpacing: 0.1 },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  composerInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
});
