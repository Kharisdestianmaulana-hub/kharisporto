import React from 'react';
import { motion } from 'framer-motion';
import { useWindowStore } from '../../store/useWindowStore';
import type { AppId } from '../../store/useWindowStore';
import { User, Folder, Terminal, ShoppingBag, Globe, Settings as SettingsIcon, Briefcase, GitCommit, Mail, Image, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';

const apps: { id: AppId; name: string; icon: React.ReactNode; color: string }[] = [
  { id: 'system-info', name: 'About PC', icon: <User size={24} className="text-white" />, color: 'bg-indigo-500' },
  { id: 'ri-files', name: 'RI-Files', icon: <Folder size={24} className="text-white" />, color: 'bg-blue-500' },
  { id: 'terminal', name: 'Terminal', icon: <Terminal size={24} className="text-white" />, color: 'bg-zinc-800' },
  { id: 'app-store', name: 'App Store', icon: <ShoppingBag size={24} className="text-white" />, color: 'bg-emerald-500' },
  { id: 'experience', name: 'Experience', icon: <Briefcase size={24} className="text-white" />, color: 'bg-orange-500' },
  { id: 'changelogs', name: 'Changelogs', icon: <GitCommit size={24} className="text-white" />, color: 'bg-purple-600' },
  { id: 'gallery', name: 'Gallery', icon: <Image size={24} className="text-white" />, color: 'bg-fuchsia-500' },
  { id: 'cv-download', name: 'Download CV', icon: <FileText size={24} className="text-white" />, color: 'bg-sky-500' },
  { id: 'contacts', name: 'Contacts', icon: <Mail size={24} className="text-white" />, color: 'bg-cyan-500' },
  { id: 'browser', name: 'Browser', icon: <Globe size={24} className="text-white" />, color: 'bg-rose-500' },
  { id: 'settings', name: 'Settings', icon: <SettingsIcon size={24} className="text-white" />, color: 'bg-slate-500' },
];

export const FloatingDock: React.FC = () => {
  const openWindow = useWindowStore(state => state.openWindow);
  const windows = useWindowStore(state => state.windows);
  const dockSize = useWindowStore(state => state.dockSize);
  const iconSizeClass = dockSize === 'compact' ? 'w-10 h-10' : dockSize === 'large' ? 'w-14 h-14' : 'w-12 h-12';
  const iconPixelSize = dockSize === 'compact' ? 20 : dockSize === 'large' ? 28 : 24;
  const dockPaddingClass = dockSize === 'compact' ? 'px-3 py-2 space-x-3' : dockSize === 'large' ? 'px-5 py-4 space-x-5' : 'px-4 py-3 space-x-4';

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100]">
      <div className={cn("dock-glass rounded-3xl flex items-center relative overflow-visible", dockPaddingClass)}>
        <div className="pointer-events-none absolute inset-x-4 top-1 h-px bg-white/70 dark:bg-white/25 rounded-full" />
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-black/5 dark:ring-white/5" />
        {apps.map((app) => {
          const isOpen = windows.some(w => w.appId === app.id);
          const icon = React.isValidElement(app.icon)
            ? React.cloneElement(app.icon as React.ReactElement<{ size?: number }>, { size: iconPixelSize })
            : app.icon;
          
          return (
            <div key={app.id} className="relative group">
              <motion.button
                whileHover={{ scale: 1.15, y: -10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openWindow(app.id, app.name)}
                data-guide-id={`dock-${app.id}`}
                aria-label={app.name}
                className={cn(
                  "rounded-xl flex items-center justify-center shadow-lg transition-all duration-200",
                  iconSizeClass,
                  app.color
                )}
              >
                {icon}
              </motion.button>
              
              {/* App Name Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-800/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap backdrop-blur-md">
                {app.name}
              </div>
              
              {/* Active Indicator */}
              {isOpen && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--shift-accent)' }}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
