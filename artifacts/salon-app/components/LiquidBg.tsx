import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";

export function LiquidBg() {
  return (
    <>
      <LinearGradient
        colors={["#F8F3EC", "#F1E9D9", "#EDE0C8", "#F2EBD8"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[StyleSheet.absoluteFillObject, styles.orb1]} />
      <View style={[StyleSheet.absoluteFillObject, styles.orb2]} />
    </>
  );
}

const styles = StyleSheet.create({
  orb1: {
    top: -120,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(200,160,100,0.10)",
    position: "absolute",
    left: undefined,
    bottom: undefined,
  } as never,
  orb2: {
    bottom: 180,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(180,140,90,0.07)",
    position: "absolute",
    top: undefined,
    right: undefined,
  } as never,
});
