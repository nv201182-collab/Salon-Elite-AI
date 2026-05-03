import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  initials: string;
  size?: number;
  variant?: "default" | "gold";
  avatarUri?: string;
};

export function Avatar({ initials, size = 40, variant = "default", avatarUri }: Props) {
  const colors = useColors();

  if (avatarUri) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 3,
          elevation: 3,
        }}
      >
        <Image
          source={{ uri: avatarUri }}
          style={{ width: size, height: size }}
          contentFit="cover"
        />
      </View>
    );
  }

  if (variant === "gold") {
    return (
      <LinearGradient
        colors={[colors.pink, colors.purple]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.base,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            shadowColor: colors.gold,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.50,
            shadowRadius: size * 0.38,
            elevation: 5,
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: "#FFFFFF",
              fontSize: size * 0.36,
              fontFamily: "Inter_600SemiBold",
            },
          ]}
        >
          {initials.slice(0, 2).toUpperCase()}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.secondary,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.foreground,
            fontSize: size * 0.36,
            fontFamily: "Inter_600SemiBold",
          },
        ]}
      >
        {initials.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    includeFontPadding: false,
    letterSpacing: 0.3,
  },
});
