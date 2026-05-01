import { Image } from "expo-image";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { type ImageSrc } from "@/data/seed";

type Props = {
  source: ImageSrc;
  style?: object;
};

const SPRING = { damping: 18, stiffness: 260, mass: 0.7 } as const;

export function PinchZoomImage({ source, style }: Props) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTX = useSharedValue(0);
  const savedTY = useSharedValue(0);

  const resetAll = () => {
    "worklet";
    scale.value = withSpring(1, SPRING);
    translateX.value = withSpring(0, SPRING);
    translateY.value = withSpring(0, SPRING);
    savedScale.value = 1;
    savedTX.value = 0;
    savedTY.value = 0;
  };

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(6, Math.max(1, savedScale.value * e.scale));
    })
    .onEnd(() => {
      if (scale.value < 1.05) {
        resetAll();
      } else {
        savedScale.value = scale.value;
      }
    });

  const pan = Gesture.Pan()
    .minPointers(1)
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = savedTX.value + e.translationX;
        translateY.value = savedTY.value + e.translationY;
      }
    })
    .onEnd(() => {
      if (scale.value <= 1) {
        translateX.value = withSpring(0, SPRING);
        translateY.value = withSpring(0, SPRING);
        savedTX.value = 0;
        savedTY.value = 0;
      } else {
        savedTX.value = translateX.value;
        savedTY.value = translateY.value;
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd(() => {
      resetAll();
    });

  const composed = Gesture.Simultaneous(pinch, pan);
  const gesture = Gesture.Race(doubleTap, composed);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[style, animatedStyle]}>
        <Image
          source={source}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={200}
        />
      </Animated.View>
    </GestureDetector>
  );
}
