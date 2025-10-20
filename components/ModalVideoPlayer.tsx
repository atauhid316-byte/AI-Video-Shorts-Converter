import React, { useEffect, useRef } from 'react';
import type { ShortClip } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface ModalVideoPlayerProps {
  videoUrl: string;
  clip: ShortClip;
  aspectRatio: string;
  onClose: () => void;
}

export const ModalVideoPlayer: React.FC<ModalVideoPlayerProps> = ({ videoUrl, clip, aspectRatio, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const stopInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    videoElement.currentTime = clip.startTime;
    videoElement.play().catch(e => console.error("Modal preview play failed", e));

    intervalRef.current = window.setInterval(() => {
      if (videoElement.currentTime >= clip.endTime) {
        // Loop the clip
        videoElement.currentTime = clip.startTime;
        videoElement.play().catch(e => console.error("Modal preview loop failed", e));
      }
    }, 100);
    
    return () => {
      stopInterval();
      if (videoElement) {
        videoElement.pause();
      }
    };
  }, [clip.startTime, clip.endTime]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const [w, h] = aspectRatio.split(':').map(Number);
  const videoContainerStyle = {
    aspectRatio: `${w} / ${h}`,
  };

  return (
    <div 
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        style={{ animation: 'fadeIn 0.3s ease-out' }}
        onClick={onClose}
    >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      <div 
        className="relative w-full max-w-4xl bg-gray-900 rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors"
          aria-label="Close player"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div style={videoContainerStyle} className="w-full bg-black">
          <video
            ref={videoRef}
            src={`${videoUrl}#t=${clip.startTime},${clip.endTime}`}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
        </div>
        <div className="p-3 bg-gray-800 text-center border-t border-gray-700">
            <p className="text-sm text-gray-300">Previewing clip: <span className="font-bold text-white">{clip.title}</span> ({aspectRatio})</p>
        </div>
      </div>
    </div>
  );
};