import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet } from "react-native";

export function LiquidBg() {
  return (
    <LinearGradient
      colors={["#FAF8F4", "#F3EDE5", "#EDE4D8"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={StyleSheet.absoluteFillObject}
    />
  );
}
