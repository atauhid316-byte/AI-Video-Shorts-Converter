import React, { useCallback, useState } from 'react';
import { FilmIcon } from './icons/FilmIcon';

interface VideoUploaderProps {
  onVideoUpload: (file: File) => void;
  onUrlSubmit: (url: string) => void;
  onUploadError: (message: string) => void;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoUpload, onUrlSubmit, onUploadError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [url, setUrl] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('video/')) {
        onVideoUpload(file);
      } else {
        onUploadError("Invalid file type. Please upload a video file.");
      }
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        onVideoUpload(file);
      } else {
        onUploadError("Invalid file type. Please upload a video file.");
      }
    }
  }, [onVideoUpload, onUploadError]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUrlSubmit(url);
  };

  return (
    <div className="text-center p-8 bg-gray-800 rounded-lg shadow-2xl">
      <h2 className="text-3xl font-extrabold mb-4 text-teal-400">Transform Your Video Content</h2>
      <p className="mb-8 text-gray-400 max-w-2xl mx-auto">
        Upload your long-form video, and our AI will instantly identify the most viral-worthy moments and package them into ready-to-post shorts.
      </p>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`border-4 border-dashed rounded-lg p-10 transition-all duration-300 ${isDragging ? 'border-teal-400 bg-gray-700' : 'border-gray-600 hover:border-teal-500'}`}
      >
        <input
          type="file"
          id="video-upload"
          className="hidden"
          accept="video/*"
          onChange={handleFileChange}
        />
        <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center">
          <FilmIcon className="h-16 w-16 text-gray-500 mb-4" />
          <span className="text-xl font-semibold text-white">Drag & Drop your video here</span>
          <span className="text-gray-400 mt-2">or</span>
          <span className="mt-2 bg-teal-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-600 transition-colors">
            Browse Files
          </span>
        </label>
      </div>
      <div className="mt-8">
        <form onSubmit={handleUrlSubmit} className="flex items-center gap-2 max-w-lg mx-auto">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Or paste a video link here..."
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
            aria-label="Video URL"
          />
          <button
            type="submit"
            className="bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-500 transition-colors"
          >
            Load
          </button>
        </form>
      </div>
    </div>
  );
};