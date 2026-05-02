/**
 * HeartBurst — full-screen heart particle burst.
 *
 * Renders inside a transparent Modal so it floats above everything.
 * Tap coordinates are optional; defaults to screen centre.
 * Auto-dismisses by calling onDone() when animation finishes.
 */
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width: W, height: H } = Dimensions.get("window");

const PARTICLES = [
  { angle: -90,  dist: 210, emoji: "❤️",  size: 36, delay: 0   },
  { angle: -55,  dist: 260, emoji: "💕",  size: 28, delay: 25  },
  { angle: -25,  dist: 230, emoji: "❤️",  size: 32, delay: 50  },
  { angle: 10,   dist: 250, emoji: "💖",  size: 24, delay: 30  },
  { angle: 45,   dist: 220, emoji: "❤️",  size: 34, delay: 10  },
  { angle: 80,   dist: 200, emoji: "✨",  size: 22, delay: 60  },
  { angle: 120,  dist: 240, emoji: "💕",  size: 28, delay: 40  },
  { angle: 160,  dist: 220, emoji: "❤️",  size: 30, delay: 20  },
  { angle: 200,  dist: 260, emoji: "💖",  size: 26, delay: 55  },
  { angle: 240,  dist: 230, emoji: "❤️",  size: 36, delay: 15  },
  { angle: 275,  dist: 200, emoji: "💕",  size: 24, delay: 45  },
  { angle: 315,  dist: 250, emoji: "✨",  size: 20, delay: 35  },
  // Extra small burst close to center
  { angle: -70,  dist: 100, emoji: "❤️",  size: 20, delay: 80  },
  { angle: 50,   dist: 120, emoji: "💕",  size: 18, delay: 70  },
  { angle: 170,  dist: 110, emoji: "❤️",  size: 22, delay: 90  },
];

const TO_RAD = Math.PI / 180;

type ParticleAnims = { tx: Animated.Value; ty: Animated.Value; op: Animated.Value; sc: Animated.Value };

type Props = {
  visible: boolean;
  originX?: number;
  originY?: number;
  onDone: () => void;
};

export function HeartBurst({ visible, originX, originY, onDone }: Props) {
  const ox = originX ?? W / 2;
  const oy = originY ?? H * 0.42;

  const refs = useRef<ParticleAnims[]>(
    PARTICLES.map(() => ({
      tx: new Animated.Value(0),
      ty: new Animated.Value(0),
      op: new Animated.Value(0),
      sc: new Animated.Value(0),
    }))
  ).current;

  // Large central heart
  const bigSc = useRef(new Animated.Value(0)).current;
  const bigOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    // Reset
    refs.forEach((r) => { r.tx.setValue(0); r.ty.setValue(0); r.op.setValue(0); r.sc.setValue(0); });
    bigSc.setValue(0); bigOp.setValue(0);

    // Big central heart
    Animated.parallel([
      Animated.spring(bigSc, { toValue: 1, useNativeDriver: true, bounciness: 24 }),
      Animated.sequence([
        Animated.timing(bigOp, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.delay(240),
        Animated.timing(bigOp, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();

    // Particles
    const animations = refs.map((r, i) => {
      const p = PARTICLES[i];
      const rad = p.angle * TO_RAD;
      const tx = Math.cos(rad) * p.dist;
      const ty = Math.sin(rad) * p.dist;

      return Animated.parallel([
        Animated.sequence([
          Animated.delay(p.delay),
          Animated.spring(r.sc, { toValue: 1, useNativeDriver: true, bounciness: 14 }),
        ]),
        Animated.sequence([
          Animated.delay(p.delay),
          Animated.timing(r.tx, { toValue: tx, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(p.delay),
          Animated.timing(r.ty, { toValue: ty, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(p.delay),
          Animated.timing(r.op, { toValue: 1, duration: 100, useNativeDriver: true }),
          Animated.delay(280),
          Animated.timing(r.op, { toValue: 0, duration: 320, useNativeDriver: true }),
        ]),
      ]);
    });

    Animated.parallel(animations).start(() => {
      setTimeout(onDone, 50);
    });
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {/* Particles */}
        {PARTICLES.map((p, i) => (
          <Animated.Text
            key={i}
            style={[
              styles.particle,
              {
                fontSize: p.size,
                left: ox - p.size / 2,
                top: oy - p.size / 2,
                opacity: refs[i].op,
                transform: [
                  { translateX: refs[i].tx },
                  { translateY: refs[i].ty },
                  { scale: refs[i].sc },
                ],
              },
            ]}
          >
            {p.emoji}
          </Animated.Text>
        ))}

        {/* Big central heart */}
        <Animated.Text
          style={[
            styles.bigHeart,
            {
              left: ox - 44,
              top: oy - 44,
              opacity: bigOp,
              transform: [{ scale: bigSc }],
            },
          ]}
        >
          ❤️
        </Animated.Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: "absolute",
    textAlign: "center",
  },
  bigHeart: {
    position: "absolute",
    fontSize: 88,
  },
});
