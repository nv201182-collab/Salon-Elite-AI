/**
 * PinchZoomImage — Instagram 2026 style full-screen zoom.
 *
 * Pinch on any photo → image "breaks out" of the card and fills the screen,
 * background fades to dark. Release → springs back to original position.
 * Double-tap is handled by PostCard (adds like), not here.
 */
import { Image } from "expo-image";
import React, { useCallback, useRef, useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { GestureHandlerRootView, Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

import { type ImageSrc } from "@/data/seed";

type Props = { source: ImageSrc; style?: object };

const SPRING_BACK = { damping: 32, stiffness: 400, mass: 0.65 } as const;
const MAX_SCALE   = 6;

type Layout = { x: number; y: number; w: number; h: number };

export function PinchZoomImage({ source, style }: Props) {
  const containerRef = useRef<View>(null);
  const [modal, setModal]     = useState(false);
  const [layout, setLayout]   = useState<Layout>({ x: 0, y: 0, w: 0, h: 0 });

  // Shared values — driven by the Modal's gesture handler
  const scale    = useSharedValue(1);
  const tx       = useSharedValue(0);
  const ty       = useSharedValue(0);
  const savedSc  = useSharedValue(1);
  const savedTx  = useSharedValue(0);
  const savedTy  = useSharedValue(0);

  const openModal = useCallback(() => {
    containerRef.current?.measureInWindow((x, y, w, h) => {
      setLayout({ x, y, w, h });
      setModal(true);
    });
  }, []);

  const closeModal = useCallback(() => {
    setModal(false);
    scale.value    = 1;
    tx.value       = 0;
    ty.value       = 0;
    savedSc.value  = 1;
    savedTx.value  = 0;
    savedTy.value  = 0;
  }, [scale, tx, ty, savedSc, savedTx, savedTy]);

  // ── Gesture on original image: detect pinch start ──────────────────
  const startGesture = Gesture.Pinch()
    .onBegin(() => {
      runOnJS(openModal)();
    });

  // ── Gestures inside the Modal ──────────────────────────────────────
  const modalPinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(MAX_SCALE, Math.max(1, savedSc.value * e.scale));
    })
    .onEnd(() => {
      if (scale.value < 1.08) {
        scale.value  = withSpring(1, SPRING_BACK, () => runOnJS(closeModal)());
        tx.value     = withSpring(0, SPRING_BACK);
        ty.value     = withSpring(0, SPRING_BACK);
      } else {
        savedSc.value = scale.value;
        savedTx.value = tx.value;
        savedTy.value = ty.value;
      }
    });

  const modalPan = Gesture.Pan()
    .minPointers(2)
    .averageTouches(true)
    .onUpdate((e) => {
      tx.value = savedTx.value + e.translationX;
      ty.value = savedTy.value + e.translationY;
    })
    .onEnd(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    });

  // Single-finger pan while zoomed → dismiss
  const dismissPan = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .onUpdate((e) => {
      if (scale.value <= 1.1) {
        ty.value = e.translationY * 0.5;
      }
    })
    .onEnd((e) => {
      if (scale.value <= 1.1 && Math.abs(e.translationY) > 80) {
        scale.value = withSpring(1, SPRING_BACK, () => runOnJS(closeModal)());
        tx.value    = withSpring(0, SPRING_BACK);
        ty.value    = withSpring(0, SPRING_BACK);
      } else {
        ty.value = withSpring(0, SPRING_BACK);
      }
    });

  const modalGesture = Gesture.Exclusive(
    Gesture.Simultaneous(modalPinch, modalPan),
    dismissPan,
  );

  // ── Animated styles ────────────────────────────────────────────────
  const overlayStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: layout.x,
    top:  layout.y,
    width:  layout.w,
    height: layout.h,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    opacity: interpolate(scale.value, [1, 2], [0, 0.88], Extrapolation.CLAMP),
  }));

  return (
    <>
      {/* Original image (hidden while modal is open) */}
      <GestureDetector gesture={startGesture}>
        <View
          ref={containerRef}
          collapsable={false}
          style={style}
        >
          <Image
            source={source}
            style={[{ width: "100%", height: "100%" }, modal && { opacity: 0 }]}
            contentFit="cover"
          />
        </View>
      </GestureDetector>

      {/* Full-screen zoom overlay */}
      <Modal
        visible={modal}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <GestureDetector gesture={modalGesture}>
            <View style={{ flex: 1 }}>
              {/* Dark backdrop fades in as scale increases */}
              <Animated.View style={backdropStyle} />

              {/* Zoomed image anchored at original screen position */}
              <Animated.View style={overlayStyle}>
                <Image
                  source={source}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              </Animated.View>
            </View>
          </GestureDetector>
        </GestureHandlerRootView>
      </Modal>
    </>
  );
}
