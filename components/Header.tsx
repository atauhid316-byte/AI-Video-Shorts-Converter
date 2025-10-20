
import React from 'react';
import { FilmIcon } from './icons/FilmIcon';
import { SparklesIcon } from './icons/SparklesIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FilmIcon className="h-8 w-8 text-teal-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">
            AI Video Shorts
          </h1>
        </div>
        <div className="flex items-center space-x-2 text-sm text-teal-400">
            <SparklesIcon className="w-5 h-5" />
            <span>Powered by Gemini</span>
        </div>
      </div>
    </header>
  );
};
