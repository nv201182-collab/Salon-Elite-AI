import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";

import { type ImageSrc } from "@/data/seed";

type Props = {
  source: ImageSrc;
  isActive: boolean;
};

export function VideoInFeed({ source, isActive }: Props) {
  const player = useVideoPlayer(source as never, (p) => {
    p.loop = true;
    p.muted = true;
  });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  return (
    <VideoView
      style={StyleSheet.absoluteFillObject}
      player={player}
      nativeControls={false}
      allowsFullscreen={false}
      contentFit="cover"
    />
  );
}
