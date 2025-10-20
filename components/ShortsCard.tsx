import React, { useState } from 'react';
import type { ShortClip } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { PlayIcon } from './icons/PlayIcon';
import { CopyIcon } from './icons/CopyIcon';

interface ShortsCardProps {
  clip: ShortClip;
  onPreview: () => void;
  aspectRatio: string;
  videoDuration: number;
  onClipTimeChange: (clipId: string, newTimes: { startTime: number; endTime: number }) => void;
}

export const ShortsCard: React.FC<ShortsCardProps> = ({ clip, onPreview, aspectRatio, videoDuration, onClipTimeChange }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [copyStatus, setCopyStatus] = useState('Copy');

  const handleExport = () => {
    setIsExporting(true);
    setExportSuccess(false);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000); // Reset after 3 seconds
    }, 2000);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(clip.captions[language]);
    setCopyStatus('Copied!');
    setTimeout(() => setCopyStatus('Copy'), 2000);
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

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col justify-between transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <div>
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
              onClick={handleCopy}
              className="absolute top-3 right-3 p-2 bg-gray-700/80 rounded-full text-gray-300 hover:bg-teal-500 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500"
              aria-label="Copy caption"
            >
              {copyStatus === 'Copy' ? (
                <CopyIcon className="w-5 h-5" />
              ) : (
                <span className="text-xs font-semibold px-1">{copyStatus}</span>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-700/50 p-3 flex items-center justify-between mt-auto">
        <button
          onClick={onPreview}
          className="flex items-center space-x-2 text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors"
        >
          <PlayIcon className="w-5 h-5" />
          <span>Preview</span>
        </button>
        <button
          onClick={handleExport}
          disabled={isExporting || exportSuccess}
          className="flex items-center space-x-2 text-sm font-semibold bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isExporting ? (
            <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Exporting...</span>
            </>
          ) : exportSuccess ? (
            <span>Exported!</span>
          ) : (
            <>
              <DownloadIcon className="w-5 h-5" />
              <span>Export HD</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};