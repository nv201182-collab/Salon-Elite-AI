import React from "react";
import { StyleSheet, View } from "react-native";

export function LiquidBg() {
  return <View style={[StyleSheet.absoluteFillObject, styles.bg]} />;
}

const styles = StyleSheet.create({
  bg: { backgroundColor: "#FFFFFF" },
});
