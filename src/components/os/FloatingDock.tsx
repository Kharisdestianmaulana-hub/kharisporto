import React from 'react';
import { motion } from 'framer-motion';
import { useWindowStore } from '../../store/useWindowStore';
import type { AppId } from '../../store/useWindowStore';
import { User, Folder, Terminal, ShoppingBag, Globe, Settings as SettingsIcon, Briefcase, GitCommit } from 'lucide-react';
import { cn } from '../../lib/utils';

const apps: { id: AppId; name: string; icon: React.ReactNode; color: string }[] = [
  { id: 'system-info', name: 'About PC', icon: <User size={24} className="text-white" />, color: 'bg-indigo-500' },
  { id: 'ri-files', name: 'RI-Files', icon: <Folder size={24} className="text-white" />, color: 'bg-blue-500' },
  { id: 'terminal', name: 'Terminal', icon: <Terminal size={24} className="text-white" />, color: 'bg-zinc-800' },
  { id: 'app-store', name: 'App Store', icon: <ShoppingBag size={24} className="text-white" />, color: 'bg-emerald-500' },
  { id: 'experience', name: 'Experience', icon: <Briefcase size={24} className="text-white" />, color: 'bg-orange-500' },
  { id: 'changelogs', name: 'Changelogs', icon: <GitCommit size={24} className="text-white" />, color: 'bg-purple-600' },
  { id: 'browser', name: 'Browser', icon: <Globe size={24} className="text-white" />, color: 'bg-rose-500' },
  { id: 'settings', name: 'Settings', icon: <SettingsIcon size={24} className="text-white" />, color: 'bg-slate-500' },
];

export const FloatingDock: React.FC = () => {
  const openWindow = useWindowStore(state => state.openWindow);
  const windows = useWindowStore(state => state.windows);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100]">
      <div className="glass-panel-heavy px-4 py-3 rounded-3xl flex items-center space-x-4 shadow-2xl">
        {apps.map((app) => {
          const isOpen = windows.some(w => w.appId === app.id);
          
          return (
            <div key={app.id} className="relative group">
              <motion.button
                whileHover={{ scale: 1.15, y: -10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openWindow(app.id, app.name)}
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-200",
                  app.color
                )}
              >
                {app.icon}
              </motion.button>
              
              {/* App Name Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-800/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap backdrop-blur-md">
                {app.name}
              </div>
              
              {/* Active Indicator */}
              {isOpen && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-slate-800 dark:bg-white rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
