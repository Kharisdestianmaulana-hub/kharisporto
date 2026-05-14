import React from 'react';
import { Rnd } from 'react-rnd';
import { useWindowStore } from '../../store/useWindowStore';
import type { AppId, WindowState } from '../../store/useWindowStore';
import { WindowHeader } from './WindowHeader';
import { cn } from '../../lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

// Import apps
import { SystemInfo } from '../apps/SystemInfo';
import { RIFiles } from '../apps/RIFiles';
import { Terminal } from '../apps/Terminal';
import { AppStore } from '../apps/AppStore';
import { Browser } from '../apps/Browser';
import { Settings } from '../apps/Settings';
import { ExperienceApp } from '../apps/ExperienceApp';
import { OSInfo } from '../apps/OSInfo';
import { ChangelogsApp } from '../apps/ChangelogsApp';
import { ContactApp } from '../apps/ContactApp';
import { GalleryApp } from '../apps/GalleryApp';

const DEFAULT_MIN_SIZE = { width: 520, height: 380 };

const appMinSizes: Partial<Record<AppId, { width: number; height: number }>> = {
  'system-info': { width: 520, height: 420 },
  'ri-files': { width: 680, height: 460 },
  terminal: { width: 560, height: 360 },
  'app-store': { width: 720, height: 520 },
  browser: { width: 720, height: 480 },
  settings: { width: 760, height: 520 },
  experience: { width: 720, height: 520 },
  'os-info': { width: 380, height: 460 },
  changelogs: { width: 700, height: 500 },
  contacts: { width: 680, height: 480 },
  gallery: { width: 720, height: 520 },
};

export const WindowContainer: React.FC = () => {
  const { windows, activeZIndex, bringToFront, updatePosition, updateSize, maximizeWindow } = useWindowStore();

  const getAppComponent = (appId: AppId) => {
    switch (appId) {
      case 'system-info': return <SystemInfo />;
      case 'ri-files': return <RIFiles />;
      case 'terminal': return <Terminal />;
      case 'app-store': return <AppStore />;
      case 'browser': return <Browser />;
      case 'settings': return <Settings />;
      case 'experience': return <ExperienceApp />;
      case 'os-info': return <OSInfo />;
      case 'changelogs': return <ChangelogsApp />;
      case 'contacts': return <ContactApp />;
      case 'gallery': return <GalleryApp />;
      default: return <div className="flex items-center justify-center h-full text-slate-500">App not found</div>;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence>
        {windows.map((window: WindowState) => {
          if (window.isMinimized) return null;
          
          const isActive = window.zIndex === activeZIndex;
          const minSize = appMinSizes[window.appId] || DEFAULT_MIN_SIZE;
          
          return (
            <Rnd
              key={window.id}
              size={window.isMaximized ? { width: '100%', height: '100%' } : window.size}
              position={window.isMaximized ? { x: 0, y: 0 } : window.position}
              onDragStop={(_e, d) => updatePosition(window.id, { x: d.x, y: d.y })}
              onResizeStop={(_e, _direction, ref, _delta, position) => {
                updateSize(window.id, { width: ref.style.width, height: ref.style.height });
                updatePosition(window.id, position);
              }}
              minWidth={minSize.width}
              minHeight={minSize.height}
              bounds={window.isMaximized ? undefined : "parent"}
              dragHandleClassName="window-drag-handle"
              disableDragging={window.isMaximized}
              enableResizing={!window.isMaximized}
              style={{ 
                zIndex: window.zIndex,
                pointerEvents: 'auto' 
              }}
              onMouseDown={() => bringToFront(window.id)}
              className="absolute"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "w-full h-full flex flex-col rounded-xl overflow-hidden glass-panel",
                  isActive ? "window-shadow" : "window-shadow-inactive opacity-[0.98]"
                )}
                style={{
                  borderRadius: window.isMaximized ? '0' : '0.75rem' // rounded-xl is 0.75rem
                }}
              >
                <WindowHeader 
                  id={window.id} 
                  title={window.title} 
                  isActive={isActive} 
                  onDoubleClick={() => maximizeWindow(window.id)}
                />
                <div className="flex-1 overflow-hidden relative bg-white/50 dark:bg-slate-900/50">
                  {getAppComponent(window.appId)}
                </div>
              </motion.div>
            </Rnd>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
