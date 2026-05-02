import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
    "Привет! 👋 Я APIA AI — ваш помощник и источник знаний. Помогу с продажами, возражениями, скриптами встречи, программой обучения и баллами.",
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
  const headerPad = insets.top + (Platform.OS === "web" ? 56 : 12);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1, backgroundColor: colors.background }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={[styles.headerBar, { paddingTop: headerPad }]}>
        <LinearGradient
          colors={[colors.pink, colors.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.orb}
        >
          <Feather name="zap" size={18} color="#FFFFFF" />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            AI-ассистент
          </Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Чем я могу помочь?
          </Text>
        </View>
      </View>

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
              <View style={[styles.thinkingDot, { backgroundColor: colors.card }]}>
                <ActivityIndicator size="small" color={colors.pink} />
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
              <View style={[styles.suggest, { backgroundColor: "rgba(255,255,255,0.68)" }]}>
                <Text style={[styles.suggestText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
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
            paddingBottom: insets.bottom > 0 ? insets.bottom : 14,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={user ? `Задайте вопрос, ${user.name.split(" ")[0]}` : "Задайте вопрос..."}
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.composerInput,
            { color: colors.foreground, backgroundColor: colors.card },
          ]}
          onSubmitEditing={() => send(draft)}
          returnKeyType="send"
          multiline
        />
        <PressableScale onPress={() => send(draft)} scaleTo={0.9} disabled={!draft.trim()}>
          {draft.trim() ? (
            <LinearGradient
              colors={[colors.pink, colors.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendBtn}
            >
              <Feather name="arrow-up" size={20} color="#FFFFFF" />
            </LinearGradient>
          ) : (
            <View style={[styles.sendBtn, { backgroundColor: colors.muted }]}>
              <Feather name="arrow-up" size={20} color={colors.mutedForeground} />
            </View>
          )}
        </PressableScale>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(200,160,100,0.18)",
  },
  orb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8B6030",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 5,
  },
  headerTitle: { fontSize: 20, letterSpacing: -0.5 },
  headerSub: { fontSize: 12, letterSpacing: 0.2, marginTop: 2, opacity: 0.65 },
  thinkingRow: { paddingHorizontal: 16, paddingVertical: 4 },
  thinkingDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
  },
  thinkingText: { fontSize: 12, letterSpacing: 0.2 },
  suggest: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
    shadowColor: "#7A6030",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  suggestText: { fontSize: 13, letterSpacing: 0.1 },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(200,160,100,0.18)",
  },
  composerInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 140,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    borderRadius: 24,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
