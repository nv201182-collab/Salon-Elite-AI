/**
 * Pinch-to-zoom image — Instagram 2026 style.
 *
 * Gestures:
 *  • Pinch: zoom 1× – 5×
 *  • Pan (while zoomed): drag with clamped bounds
 *  • Double-tap: toggle 1× ↔ 2.5× centered at tap point
 *  • Pinch release < 1.05×: spring back to 1×
 */
import { Image } from "expo-image";
import React from "react";
import { useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { type ImageSrc } from "@/data/seed";

type Props = { source: ImageSrc; style?: object };

const SPRING_BACK  = { damping: 28, stiffness: 380, mass: 0.7 } as const;
const SPRING_IN    = { damping: 22, stiffness: 340, mass: 0.8 } as const;
const MAX_SCALE    = 5;
const ZOOM_SCALE   = 2.5;

export function PinchZoomImage({ source, style }: Props) {
  const { width: W } = useWindowDimensions();

  const scale    = useSharedValue(1);
  const savedSc  = useSharedValue(1);
  const tx       = useSharedValue(0);
  const ty       = useSharedValue(0);
  const savedTx  = useSharedValue(0);
  const savedTy  = useSharedValue(0);

  function resetAll() {
    "worklet";
    scale.value   = withSpring(1, SPRING_BACK);
    tx.value      = withSpring(0, SPRING_BACK);
    ty.value      = withSpring(0, SPRING_BACK);
    savedSc.value = 1;
    savedTx.value = 0;
    savedTy.value = 0;
  }

  function clampTx(rawTx: number, sc: number) {
    "worklet";
    const maxShift = (W * (sc - 1)) / 2;
    return Math.max(-maxShift, Math.min(maxShift, rawTx));
  }

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(MAX_SCALE, Math.max(1, savedSc.value * e.scale));
    })
    .onEnd(() => {
      if (scale.value < 1.05) {
        resetAll();
      } else {
        savedSc.value = scale.value;
        tx.value = clampTx(tx.value, scale.value);
        ty.value = clampTx(ty.value, scale.value);
        savedTx.value = tx.value;
        savedTy.value = ty.value;
      }
    });

  const pan = Gesture.Pan()
    .minPointers(1)
    .averageTouches(true)
    .onUpdate((e) => {
      if (scale.value > 1) {
        tx.value = clampTx(savedTx.value + e.translationX, scale.value);
        ty.value = clampTx(savedTy.value + e.translationY, scale.value);
      }
    })
    .onEnd(() => {
      if (scale.value <= 1) {
        tx.value = withSpring(0, SPRING_BACK);
        ty.value = withSpring(0, SPRING_BACK);
        savedTx.value = 0;
        savedTy.value = 0;
      } else {
        savedTx.value = tx.value;
        savedTy.value = ty.value;
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(300)
    .onEnd((e) => {
      "worklet";
      if (scale.value > 1) {
        // Zoom back out
        resetAll();
      } else {
        // Zoom to 2.5× centred at tap point
        const targetScale = ZOOM_SCALE;
        // Offset to bring tap point to screen centre
        // e.x / e.y are coordinates relative to the element (0 = top-left)
        // Image centre is at (W/2, W/2) assuming square aspect
        const halfW = W / 2;
        const rawTx = (halfW - e.x) * (targetScale - 1);
        const rawTy = (halfW - e.y) * (targetScale - 1);
        scale.value   = withSpring(targetScale, SPRING_IN);
        tx.value      = withSpring(clampTx(rawTx, targetScale), SPRING_IN);
        ty.value      = withSpring(clampTx(rawTy, targetScale), SPRING_IN);
        savedSc.value = targetScale;
        savedTx.value = clampTx(rawTx, targetScale);
        savedTy.value = clampTx(rawTy, targetScale);
      }
    });

  const composed = Gesture.Simultaneous(pinch, pan);
  const gesture  = Gesture.Exclusive(doubleTap, composed);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[style, animStyle]}>
        <Image
          source={source}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
        />
      </Animated.View>
    </GestureDetector>
  );
}
