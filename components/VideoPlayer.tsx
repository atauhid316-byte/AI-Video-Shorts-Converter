
import React, { forwardRef, useEffect, useRef } from 'react';
import type { ShortClip } from '../types';

interface VideoPlayerProps {
  src: string;
  clipToPlay: ShortClip | null;
  onLoadedMetadata: () => void;
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(({ src, clipToPlay, onLoadedMetadata }, ref) => {
  const intervalRef = useRef<number | null>(null);
  
  const internalRef = useRef<HTMLVideoElement>(null);

  const playerRef = (ref || internalRef) as React.RefObject<HTMLVideoElement>;

  useEffect(() => {
    const videoElement = playerRef.current;
    if (!videoElement) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (clipToPlay) {
      videoElement.currentTime = clipToPlay.startTime;
      videoElement.play();

      intervalRef.current = window.setInterval(() => {
        if (videoElement.currentTime >= clipToPlay.endTime) {
          videoElement.pause();
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, 100);
    } else {
        videoElement.pause();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [clipToPlay, playerRef]);

  return (
    <video
      ref={playerRef}
      src={src}
      controls
      className="w-full rounded-lg shadow-lg aspect-video bg-black"
      onLoadedMetadata={onLoadedMetadata}
    />
  );
});
