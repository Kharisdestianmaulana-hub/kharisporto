import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BootScreenProps {
  onComplete: () => void;
}

export const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [showLogo, setShowLogo] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  const bootLogs = [
    "Loading kernel...",
    "Initializing hardware abstractions...",
    "Mounting file systems...",
    "Starting display manager...",
    "Welcome to Shift OS (RI-System)"
  ];

  useEffect(() => {
    let currentLog = 0;
    const interval = setInterval(() => {
      if (currentLog < bootLogs.length) {
        setLogs(prev => [...prev, bootLogs[currentLog]]);
        currentLog++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowLogo(true), 500);
        setTimeout(() => onComplete(), 2500);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-[9999] bg-black text-white font-mono text-sm flex flex-col items-center justify-center overflow-hidden"
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {!showLogo ? (
        <div className="absolute top-10 left-10 w-full">
          {logs.map((log, index) => (
            <div key={index} className="mb-1 text-green-400">
              [ OK ] {log}
            </div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-6"
        >
          {/* Logo representation: a circle with 4 nodes */}
          <div className="relative w-32 h-32 rounded-full border-4 border-slate-700 flex items-center justify-center animate-pulse">
            <div className="absolute top-0 w-4 h-4 bg-indigo-500 rounded-full -mt-2"></div>
            <div className="absolute bottom-0 w-4 h-4 bg-emerald-500 rounded-full -mb-2"></div>
            <div className="absolute left-0 w-4 h-4 bg-rose-500 rounded-full -ml-2"></div>
            <div className="absolute right-0 w-4 h-4 bg-amber-500 rounded-full -mr-2"></div>
            <div className="w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm border border-white/20"></div>
          </div>
          <h1 className="text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
            SHIFT OS
          </h1>
        </motion.div>
      )}
    </motion.div>
  );
};
