import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { VideoUploader } from './components/VideoUploader';
import { VideoPlayer } from './components/VideoPlayer';
import { ShortsSuggestions } from './components/ShortsSuggestions';
import Loader from './components/Loader';
import { ExclamationTriangleIcon } from './components/icons/ExclamationTriangleIcon';
import { XMarkIcon } from './components/icons/XMarkIcon';
import { generateShortsFromVideo } from './services/aiService';
import type { ShortClip } from './types';

function App() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [clips, setClips] = useState<ShortClip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string>('Error');
  const [clipToPlay, setClipToPlay] = useState<ShortClip | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [videoDimensions, setVideoDimensions] = useState<{width: number, height: number} | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoUpload = (file: File) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    resetState();
  };
  
  const handleUrlSubmit = (url: string) => {
    setErrorTitle('Feature Not Supported');
    setError("Pasting video links is not supported in this demo. Please upload a file from your device.");
    console.log("Video URL submitted:", url);
  };

  const handleUploadError = (message: string) => {
    setErrorTitle('Upload Failed');
    setError(message);
  };
  
  const handleLoadedMetadata = async () => {
    if (videoRef.current) {
        const duration = videoRef.current.duration;
        setVideoDuration(duration);
        
        const { videoWidth, videoHeight } = videoRef.current;
        setVideoDimensions({ width: videoWidth, height: videoHeight });
        const ar = videoWidth / videoHeight;
        if (ar > 1.2) setAspectRatio('16:9');
        else if (ar < 0.8) setAspectRatio('9:16');
        else setAspectRatio('1:1');
        
        setIsLoading(true);
        setError(null);
        try {
            const generatedClips = await generateShortsFromVideo(duration);
            setClips(generatedClips);
        } catch (e: any) {
            setErrorTitle('Analysis Failed');
            setError(e.message || 'An unknown error occurred while generating clips.');
        } finally {
            setIsLoading(false);
        }
    }
  };
  
  const handlePreview = (clip: ShortClip) => {
    setClipToPlay(clip);
  };

  const handleClipTimeChange = (clipId: string, newTimes: { startTime: number; endTime: number }) => {
    setClips(prevClips => 
        prevClips.map(clip => 
            clip.id === clipId ? { ...clip, ...newTimes } : clip
        )
    );
  };

  const resetState = () => {
    setClips([]);
    setIsLoading(false);
    setError(null);
    setClipToPlay(null);
    setVideoDuration(0);
    setAspectRatio('16:9');
    setVideoDimensions(null);
  };

  const handleReset = () => {
    if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
    }
    setVideoFile(null);
    setVideoUrl(null);
    resetState();
  };

  const ErrorDisplay = () => (
    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
      <strong className="font-bold flex items-center">
        <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
        {errorTitle}
      </strong>
      <span className="block sm:inline ml-7">{error}</span>
      <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
        <XMarkIcon className="h-6 w-6 text-red-300 hover:text-white" />
      </button>
    </div>
  );

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <Header />
      <main className="container mx-auto px-4 md:px-8 py-8">
        {!videoUrl ? (
          <div>
            {error && (
              <div className="mb-8">
                <ErrorDisplay />
              </div>
            )}
            <VideoUploader 
              onVideoUpload={handleVideoUpload} 
              onUrlSubmit={handleUrlSubmit}
              onUploadError={handleUploadError} 
            />
          </div>
        ) : (
          <div>
             <button 
                onClick={handleReset} 
                className="mb-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
             >
                Upload another video
             </button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2">
                <VideoPlayer
                  ref={videoRef}
                  src={videoUrl}
                  clipToPlay={clipToPlay}
                  onLoadedMetadata={handleLoadedMetadata}
                />
              </div>
              <div className="lg:col-span-1">
                {isLoading && (
                  <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg">
                    <Loader />
                    <p className="mt-4 text-lg font-semibold text-teal-400">AI is analyzing your video...</p>
                    <p className="text-sm text-gray-400">This might take a moment.</p>
                  </div>
                )}
                {error && <ErrorDisplay />}
                {clips.length > 0 && !isLoading && (
                  <div className="space-y-4">
                     <p className="text-gray-400 text-sm">Click 'Preview' on any card to watch the clip in the player.</p>
                     <ShortsSuggestions
                        clips={clips}
                        onPreview={handlePreview}
                        aspectRatio={aspectRatio}
                        videoDuration={videoDuration}
                        onClipTimeChange={handleClipTimeChange}
                        videoUrl={videoUrl}
                        videoDimensions={videoDimensions}
                     />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;