import React, { useState } from 'react';
import { useWindowStore } from '../../store/useWindowStore';
import { X, Minus, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface WindowHeaderProps {
  id: string;
  title: string;
  isActive: boolean;
  onDoubleClick: () => void;
}

export const WindowHeader: React.FC<WindowHeaderProps> = ({ id, title, isActive, onDoubleClick }) => {
  const { closeWindow, minimizeWindow, maximizeWindow } = useWindowStore();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={cn(
        "window-drag-handle h-10 w-full flex items-center justify-between px-4 cursor-default rounded-t-xl transition-colors duration-200",
        isActive ? "bg-white/50 dark:bg-slate-800/50" : "bg-white/30 dark:bg-slate-800/30",
        "border-b border-white/20 dark:border-white/5"
      )}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex space-x-2 w-20">
        <button 
          onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
          className="w-3.5 h-3.5 rounded-full flex items-center justify-center bg-rose-500/80 hover:bg-rose-500 transition-colors"
        >
          {isHovered && <X size={10} className="text-black/60" />}
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }}
          className="w-3.5 h-3.5 rounded-full flex items-center justify-center bg-amber-500/80 hover:bg-amber-500 transition-colors"
        >
          {isHovered && <Minus size={10} className="text-black/60" />}
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); maximizeWindow(id); }}
          className="w-3.5 h-3.5 rounded-full flex items-center justify-center bg-emerald-500/80 hover:bg-emerald-500 transition-colors"
        >
          {isHovered && <Plus size={10} className="text-black/60" />}
        </button>
      </div>
      
      <div className={cn(
        "font-medium text-sm flex-1 text-center truncate pointer-events-none select-none",
        isActive ? "text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"
      )}>
        {title}
      </div>
      
      <div className="w-20"></div> {/* Spacer for centering title */}
    </div>
  );
};
