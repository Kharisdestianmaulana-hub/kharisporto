import React from 'react';
import { ImageOff } from 'lucide-react';

interface ImageViewerProps {
  title: string;
  src: string | null;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ title, src }) => {
  if (!src) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 bg-slate-950 text-slate-400">
        <ImageOff size={42} className="opacity-60" />
        <p className="text-sm font-medium">Project image is not available.</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-950 flex flex-col">
      <div className="h-10 px-4 flex items-center border-b border-white/10 text-slate-300 text-sm font-medium shrink-0">
        <span className="truncate">{title}</span>
      </div>
      <div className="flex-1 min-h-0 flex items-center justify-center p-6 overflow-auto">
        <img
          src={src}
          alt={title}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
};
