import React, { useState, useRef, useEffect } from 'react';
import type { ShortClip } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { PlayIcon } from './icons/PlayIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ModalVideoPlayer } from './ModalVideoPlayer';

interface ShortsCardProps {
  clip: ShortClip;
  onPreview: () => void;
  aspectRatio: string;
  videoDuration: number;
  onClipTimeChange: (clipId: string, newTimes: { startTime: number; endTime: number }) => void;
  videoUrl: string | null;
  videoDimensions: { width: number; height: number } | null;
}

const formatTimeForFFMPEG = (seconds: number): string => {
    const date = new Date(0);
    date.setSeconds(seconds);
    const timeString = date.toISOString().substr(11, 12);
    return timeString;
};


export const ShortsCard: React.FC<ShortsCardProps> = ({ clip, onPreview, aspectRatio, videoDuration, onClipTimeChange, videoUrl, videoDimensions }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [showExportCommand, setShowExportCommand] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [captionCopyStatus, setCaptionCopyStatus] = useState('Copy');
  const [commandCopyStatus, setCommandCopyStatus] = useState('Copy');
  const [exportAspectRatio, setExportAspectRatio] = useState(aspectRatio);
  const [playExportPreview, setPlayExportPreview] = useState(false);
  
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoPreviewRef.current;
    if (video) {
        if (isHovering) {
            if (video.paused) {
                video.currentTime = clip.startTime;
                video.play().catch(error => console.error("Preview autoplay failed:", error));
            }
        } else {
            video.pause();
            video.currentTime = clip.startTime;
        }
    }
  }, [isHovering, clip.startTime]);
  
  useEffect(() => {
    // Reset export aspect ratio if the card's default aspect ratio changes
    setExportAspectRatio(aspectRatio);
  }, [aspectRatio]);


  const handleExportClick = () => {
    setShowExportCommand(!showExportCommand);
  };
  
  const handleCaptionCopy = () => {
    navigator.clipboard.writeText(clip.captions[language]);
    setCaptionCopyStatus('Copied!');
    setTimeout(() => setCaptionCopyStatus('Copy'), 2000);
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = parseFloat(e.target.value);
    if (!isNaN(newStartTime) && newStartTime >= 0 && newStartTime < clip.endTime) {
      onClipTimeChange(clip.id, { startTime: newStartTime, endTime: clip.endTime });
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndTime = parseFloat(e.target.value);
    if (!isNaN(newEndTime) && newEndTime > clip.startTime && newEndTime <= videoDuration) {
      onClipTimeChange(clip.id, { startTime: clip.startTime, endTime: newEndTime });
    }
  };

  const duration = Math.round(clip.endTime - clip.startTime);
  
  const sanitizedTitle = clip.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  
  let ffmpegCommand = '';
  let isCroppingNeeded = false;

  if (videoDimensions && videoDimensions.width > 0 && videoDimensions.height > 0) {
      const sourceAR = videoDimensions.width / videoDimensions.height;
      const [targetW, targetH] = exportAspectRatio.split(':').map(Number);
      const targetAR = targetW / targetH;
      
      if (Math.abs(sourceAR - targetAR) > 0.01) {
          isCroppingNeeded = true;
          let cropFilter: string;
          if (sourceAR > targetAR) {
              // Source is wider than target, crop sides
              cropFilter = `crop=ih*${targetAR}:ih`;
          } else {
              // Source is taller than target, crop top/bottom
              cropFilter = `crop=iw:iw/${targetAR}`;
          }
          ffmpegCommand = `ffmpeg -i your_video.mp4 -ss ${formatTimeForFFMPEG(clip.startTime)} -to ${formatTimeForFFMPEG(clip.endTime)} -vf "${cropFilter}" -c:a copy ${sanitizedTitle}.mp4`;
      }
  }

  if (!isCroppingNeeded) {
      ffmpegCommand = `ffmpeg -i your_video.mp4 -ss ${formatTimeForFFMPEG(clip.startTime)} -to ${formatTimeForFFMPEG(clip.endTime)} -c copy ${sanitizedTitle}.mp4`;
  }

  const handleCommandCopy = () => {
    navigator.clipboard.writeText(ffmpegCommand);
    setCommandCopyStatus('Copied!');
    setTimeout(() => setCommandCopyStatus('Copy'), 2000);
  };


  return (
    <div 
      className="bg-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col justify-between transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
    >
      <div
         onMouseEnter={() => setIsHovering(true)}
         onMouseLeave={() => setIsHovering(false)}
      >
        <div className="relative aspect-video bg-gray-900 group">
          {/* Placeholder - Always rendered, fades out on hover */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center text-gray-500 transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`}>
              <PlayIcon className="w-12 h-12 text-gray-600 transition-colors" />
              <span className="mt-2 text-xs font-semibold">Hover to preview</span>
          </div>

          {/* Video Player - Always rendered, fades in on hover */}
          {videoUrl && (
              <video
                  ref={videoPreviewRef}
                  key={`${clip.id}-preview`}
                  src={`${videoUrl}#t=${clip.startTime},${clip.endTime}`}
                  loop
                  muted
                  playsInline
                  className={`w-full h-full object-cover transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
                  onWaiting={() => setIsPreviewLoading(true)}
                  onCanPlay={() => setIsPreviewLoading(false)}
                  onPlaying={() => setIsPreviewLoading(false)}
                  onError={(e) => {
                      console.error("Video preview error:", e);
                      setIsPreviewLoading(false);
                  }}
              />
          )}
          
          {/* Loading Spinner for video preview */}
          {isPreviewLoading && isHovering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity duration-300">
                  <div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-white"></div>
              </div>
          )}
        </div>


        <div className="p-5">
          <h3 className="text-lg font-bold text-white truncate">{clip.title}</h3>
          <p className="text-sm text-gray-400 mt-1 h-10 overflow-hidden">{clip.description}</p>
           <div className="mt-3 text-xs text-gray-500 font-mono flex justify-between items-center">
              <div>
                <span>{new Date(clip.startTime * 1000).toISOString().substr(14, 5)}</span>
                <span> - </span>
                <span>{new Date(clip.endTime * 1000).toISOString().substr(14, 5)}</span>
                <span className="ml-2 bg-gray-700 px-2 py-1 rounded">~{duration}s</span>
              </div>
              <span className="bg-teal-900/70 text-teal-300 text-xs font-semibold px-2 py-1 rounded">{aspectRatio}</span>
          </div>
        </div>
        
        <div className="px-5 pb-4 border-t border-b border-gray-700/50">
          <h4 className="text-sm font-semibold text-teal-400 my-2">✂️ Trim Clip</h4>
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <label htmlFor={`start-time-${clip.id}`} className="block text-xs font-medium text-gray-400 mb-1">Start (s)</label>
              <input 
                type="number"
                id={`start-time-${clip.id}`}
                value={clip.startTime.toFixed(2)}
                onChange={handleStartTimeChange}
                className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm border border-gray-600 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                step="0.1"
                min="0"
                max={clip.endTime.toFixed(2)}
              />
            </div>
            <div className="flex-1">
              <label htmlFor={`end-time-${clip.id}`} className="block text-xs font-medium text-gray-400 mb-1">End (s)</label>
              <input 
                type="number"
                id={`end-time-${clip.id}`}
                value={clip.endTime.toFixed(2)}
                onChange={handleEndTimeChange}
                className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm border border-gray-600 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                step="0.1"
                min={clip.startTime.toFixed(2)}
                max={videoDuration.toFixed(2)}
              />
            </div>
          </div>
        </div>

        <div className="px-5 pt-4 pb-4">
          <h4 className="text-sm font-semibold text-teal-400 mb-3">✨ Attractive Caption</h4>
          <div className="flex items-center space-x-2 mb-3">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 ${
                language === 'en'
                  ? 'bg-teal-500 text-white shadow-md'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 ${
                language === 'hi'
                  ? 'bg-teal-500 text-white shadow-md'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Hindi
            </button>
          </div>
          <div className="bg-black/40 p-4 rounded-lg relative min-h-[7rem] flex items-center shadow-inner">
            <p className="text-base text-white leading-relaxed pr-14 font-sans">
              {clip.captions[language]}
            </p>
            <button
              onClick={handleCaptionCopy}
              className="absolute top-3 right-3 p-2 bg-gray-700/80 rounded-full text-gray-300 hover:bg-teal-500 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500"
              aria-label="Copy caption"
            >
              {captionCopyStatus === 'Copy' ? (
                <CopyIcon className="w-5 h-5" />
              ) : (
                <CheckIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      
       {showExportCommand && (
        <div className="p-4 bg-gray-900/70 border-t border-gray-700">
            <div className='mb-3'>
              <label htmlFor={`aspect-ratio-${clip.id}`} className="block text-sm font-medium text-gray-300 mb-1">Export Aspect Ratio</label>
              <select
                  id={`aspect-ratio-${clip.id}`}
                  value={exportAspectRatio}
                  onChange={(e) => setExportAspectRatio(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded px-2 py-1.5 text-sm border border-gray-600 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              >
                  <option value="16:9">16:9 (Widescreen)</option>
                  <option value="9:16">9:16 (Vertical)</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="4:3">4:3 (Classic TV)</option>
                  <option value="21:9">21:9 (Cinematic)</option>
              </select>
            </div>
            <p className="text-xs text-gray-400 mb-2">
                Use this command with <a href="https://ffmpeg.org/download.html" target="_blank" rel="noopener noreferrer" className="text-teal-400 underline hover:text-teal-300">FFMPEG</a> installed. 
                {isCroppingNeeded ? " Cropping requires re-encoding." : " No re-encoding needed (fast)."}
            </p>
            <div className="flex items-stretch gap-2">
                <input
                    type="text"
                    readOnly
                    value={ffmpegCommand}
                    className="w-full flex-grow bg-gray-900 text-teal-300 text-xs font-mono p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    onFocus={(e) => e.target.select()}
                    aria-label="FFMPEG export command"
                />
                <button
                    onClick={handleCommandCopy}
                    className="flex-shrink-0 flex items-center justify-center space-x-2 text-sm font-semibold bg-gray-600 text-white py-2 px-3 rounded-md hover:bg-gray-500 transition-colors"
                    title={commandCopyStatus === 'Copy' ? 'Copy command' : 'Copied!'}
                >
                    {commandCopyStatus === 'Copy' ? <CopyIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
                    <span>{commandCopyStatus}</span>
                </button>
            </div>
             <button
                onClick={() => setPlayExportPreview(true)}
                className="mt-3 w-full flex items-center justify-center gap-2 text-sm font-semibold bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-500 transition-colors"
              >
                <PlayIcon className="w-5 h-5" />
                <span>Play Exported Clip</span>
              </button>
        </div>
      )}

      <div className="bg-gray-700/50 p-3 flex items-center justify-between mt-auto">
        <button
          onClick={onPreview}
          className="flex items-center space-x-2 text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors"
        >
          <PlayIcon className="w-5 h-5" />
          <span>Preview</span>
        </button>
        <button
          onClick={handleExportClick}
          className="flex items-center space-x-2 text-sm font-semibold bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600 transition-all duration-200"
        >
          <DownloadIcon className="w-5 h-5" />
          <span>Export</span>
        </button>
      </div>

      {playExportPreview && videoUrl && (
        <ModalVideoPlayer
            videoUrl={videoUrl}
            clip={clip}
            aspectRatio={exportAspectRatio}
            onClose={() => setPlayExportPreview(false)}
        />
      )}
    </div>
  );
};