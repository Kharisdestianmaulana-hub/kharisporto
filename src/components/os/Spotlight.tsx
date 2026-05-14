import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowStore } from '../../store/useWindowStore';
import type { AppId } from '../../store/useWindowStore';
import { Search, Folder, User, Terminal, ShoppingBag, Globe, Settings as SettingsIcon, Briefcase, GitCommit, Mail, Image, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SearchResult {
  id: AppId;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const apps: SearchResult[] = [
  { id: 'system-info', name: 'About This PC', icon: <User size={20} className="text-white" />, color: 'bg-purple-500' },
  { id: 'ri-files', name: 'RI-Files', icon: <Folder size={20} className="text-white" />, color: 'bg-blue-500' },
  { id: 'terminal', name: 'Terminal', icon: <Terminal size={20} className="text-white" />, color: 'bg-zinc-800' },
  { id: 'app-store', name: 'App Store', icon: <ShoppingBag size={20} className="text-white" />, color: 'bg-emerald-500' },
  { id: 'experience', name: 'Experience', icon: <Briefcase size={20} className="text-white" />, color: 'bg-orange-500' },
  { id: 'changelogs', name: 'Changelogs', icon: <GitCommit size={20} className="text-white" />, color: 'bg-purple-600' },
  { id: 'gallery', name: 'Gallery', icon: <Image size={20} className="text-white" />, color: 'bg-fuchsia-500' },
  { id: 'cv-download', name: 'Download CV', icon: <FileText size={20} className="text-white" />, color: 'bg-sky-500' },
  { id: 'contacts', name: 'Contacts', icon: <Mail size={20} className="text-white" />, color: 'bg-cyan-500' },
  { id: 'browser', name: 'Browser', icon: <Globe size={20} className="text-white" />, color: 'bg-rose-500' },
  { id: 'settings', name: 'Settings', icon: <SettingsIcon size={20} className="text-white" />, color: 'bg-slate-500' },
];

export const Spotlight: React.FC = () => {
  const { isSpotlightOpen, toggleSpotlight, closeSpotlight, openWindow } = useWindowStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSpotlight();
      }
      if (e.key === 'Escape' && isSpotlightOpen) {
        closeSpotlight();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpotlightOpen, toggleSpotlight, closeSpotlight]);

  const results = query 
    ? apps.filter(app => app.name.toLowerCase().includes(query.toLowerCase()))
    : apps;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isSpotlightOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
    }
  }, [isSpotlightOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0) {
        launchApp(results[selectedIndex]);
      }
    }
  };

  const launchApp = (app: SearchResult) => {
    openWindow(app.id, app.name);
    closeSpotlight();
  };

  return (
    <AnimatePresence>
      {isSpotlightOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={closeSpotlight}
          />
          
          {/* Search Box */}
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full max-w-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-2xl rounded-2xl overflow-hidden border border-white/50 dark:border-white/10"
          >
            <div className="flex items-center px-4 py-4 border-b border-slate-200/50 dark:border-slate-800/50">
              <Search className="text-slate-400 mr-3" size={24} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Spotlight Search"
                className="flex-1 bg-transparent border-none outline-none text-2xl font-light text-slate-800 dark:text-slate-100 placeholder:text-slate-400/70"
              />
            </div>
            
            {results.length > 0 ? (
              <div className="max-h-[60vh] overflow-y-auto py-2">
                {results.map((app, index) => (
                  <div
                    key={app.id}
                    onClick={() => launchApp(app)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "flex items-center px-4 py-3 mx-2 rounded-xl cursor-pointer transition-colors",
                      selectedIndex === index
                        ? "text-white"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                    style={selectedIndex === index ? { backgroundColor: 'var(--shift-accent)' } : undefined}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center mr-4 shadow-sm", 
                      app.color
                    )}>
                      {app.icon}
                    </div>
                    <span className="font-medium text-lg">{app.name}</span>
                    <span className="ml-auto text-xs opacity-50 uppercase tracking-widest">Application</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                <p className="text-lg">No results found for "{query}"</p>
              </div>
            )}
            
            <div className="bg-slate-100/50 dark:bg-slate-950/50 px-4 py-2 text-xs text-slate-500 dark:text-slate-500 flex justify-end space-x-4">
              <span><kbd className="font-sans border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5">↑</kbd> <kbd className="font-sans border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5">↓</kbd> to navigate</span>
              <span><kbd className="font-sans border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5">Enter</kbd> to open</span>
              <span><kbd className="font-sans border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5">Esc</kbd> to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
