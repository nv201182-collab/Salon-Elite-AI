import { Feather } from "@expo/vector-icons";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
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
import { answer, SUGGESTED_PROMPTS } from "@/data/aiKnowledge";
import { useColors } from "@/hooks/useColors";

type Msg = { id: string; text: string; fromMe: boolean; at: number };

const GREETING: Msg = {
  id: "init",
  text:
    "Здравствуйте. Я внутренний ассистент Maison Beauté. Помогу с продажами, возражениями, скриптами встречи, программой обучения и баллами. Спросите коротко.",
  fromMe: false,
  at: Date.now(),
};

function shortTime(at: number): string {
  const d = new Date(at);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export default function AIScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useApp();
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [draft, setDraft] = useState<string>("");
  const [thinking, setThinking] = useState<boolean>(false);
  const listRef = useRef<FlatList<Msg>>(null);

  const send = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setDraft("");
    const userMsg: Msg = { id: Date.now().toString(36), text: trimmed, fromMe: true, at: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setThinking(true);
    setTimeout(() => {
      const reply: Msg = {
        id: Date.now().toString(36) + "_a",
        text: answer(trimmed),
        fromMe: false,
        at: Date.now(),
      };
      setMessages((m) => [...m, reply]);
      setThinking(false);
    }, 700);
  }, []);

  const inverted = [...messages].reverse();

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1, backgroundColor: colors.background }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        ref={listRef}
        data={inverted}
        keyExtractor={(m) => m.id}
        inverted
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{ paddingVertical: 14 }}
        ListHeaderComponent={
          thinking ? (
            <View style={styles.thinkingRow}>
              <View style={[styles.thinkingDot, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ActivityIndicator size="small" color={colors.gold} />
                <Text style={[styles.thinkingText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Ассистент печатает…
                </Text>
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <MessageBubble
            text={item.text}
            fromMe={item.fromMe}
            authorName={item.fromMe ? undefined : "Ассистент"}
            time={shortTime(item.at)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      {messages.length <= 2 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 8 }}
        >
          {SUGGESTED_PROMPTS.map((p) => (
            <PressableScale key={p} onPress={() => send(p)} scaleTo={0.95}>
              <View style={[styles.suggest, { borderColor: colors.gold, backgroundColor: colors.card }]}>
                <Text style={[styles.suggestText, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>
                  {p}
                </Text>
              </View>
            </PressableScale>
          ))}
        </ScrollView>
      ) : null}

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
          placeholder={user ? `Спросите что-то, ${user.name.split(" ")[0]}` : "Сообщение"}
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.composerInput,
            { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card },
          ]}
          onSubmitEditing={() => send(draft)}
          returnKeyType="send"
          multiline
        />
        <PressableScale onPress={() => send(draft)} scaleTo={0.9} disabled={!draft.trim()}>
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
  thinkingRow: { paddingHorizontal: 16, paddingVertical: 4 },
  thinkingDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderTopLeftRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
  },
  thinkingText: { fontSize: 12, letterSpacing: 0.2 },
  suggest: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  suggestText: { fontSize: 11, letterSpacing: 1 },
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
    maxHeight: 140,
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
