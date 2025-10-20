import React from 'react';
import { ShortsCard } from './ShortsCard';
import type { ShortClip } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface ShortsSuggestionsProps {
  clips: ShortClip[];
  onPreview: (clip: ShortClip) => void;
  aspectRatio: string;
  videoDuration: number;
  onClipTimeChange: (clipId: string, newTimes: { startTime: number; endTime: number }) => void;
  videoUrl: string | null;
  videoDimensions: { width: number, height: number } | null;
}

export const ShortsSuggestions: React.FC<ShortsSuggestionsProps> = ({ clips, onPreview, aspectRatio, videoDuration, onClipTimeChange, videoUrl, videoDimensions }) => {
  return (
    <div className="space-y-6">
       <div className="flex items-center space-x-2">
         <SparklesIcon className="w-8 h-8 text-teal-400"/>
         <h2 className="text-3xl font-bold">AI Generated Shorts</h2>
       </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {clips.map((clip) => (
          <ShortsCard
            key={clip.id}
            clip={clip}
            onPreview={() => onPreview(clip)}
            aspectRatio={aspectRatio}
            videoDuration={videoDuration}
            onClipTimeChange={onClipTimeChange}
            videoUrl={videoUrl}
            videoDimensions={videoDimensions}
          />
        ))}
      </div>
    </div>
  );
};