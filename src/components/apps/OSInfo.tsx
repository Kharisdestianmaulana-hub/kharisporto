import React, { useState, useEffect } from 'react';
import { Command } from 'lucide-react';

export const OSInfo: React.FC = () => {
  const [cpu, setCpu] = useState('Unknown CPU');
  const [ram, setRam] = useState('Unknown RAM');
  const [gpu, setGpu] = useState('Unknown GPU');

  useEffect(() => {
    // Read CPU Cores
    if (navigator.hardwareConcurrency) {
      setCpu(`${navigator.hardwareConcurrency} Logical Cores`);
    }
    
    // Read RAM (Note: Browsers cap this for privacy, max is usually 8GB)
    if ('deviceMemory' in navigator) {
      setRam(`~${(navigator as any).deviceMemory} GB`);
    } else {
      setRam('Unknown (Browser Restricted)');
    }
    
    // Read GPU
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          setGpu(renderer || 'Unknown WebGL GPU');
        }
      }
    } catch (e) {
      console.error("Failed to read GPU info", e);
    }
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-8 overflow-y-auto scrollbar-hide">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 shrink-0">
        <Command size={48} className="text-white" />
      </div>
      
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-1 text-center">Shift OS</h1>
      <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 text-center">Version 1.0.0 (Web Edition)</p>
      
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm text-sm">
        <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/50">
          <span className="text-slate-500 dark:text-slate-400">Processor</span>
          <span className="font-medium text-slate-800 dark:text-slate-200 text-right w-1/2 line-clamp-1" title={cpu}>{cpu}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/50">
          <span className="text-slate-500 dark:text-slate-400">Memory</span>
          <span className="font-medium text-slate-800 dark:text-slate-200 text-right w-1/2 line-clamp-1" title={ram}>{ram}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/50">
          <span className="text-slate-500 dark:text-slate-400">Graphics</span>
          <span className="font-medium text-slate-800 dark:text-slate-200 text-right w-2/3 truncate" title={gpu}>{gpu}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-slate-500 dark:text-slate-400">Environment</span>
          <span className="font-medium text-slate-800 dark:text-slate-200 text-right">Browser Sandbox</span>
        </div>
      </div>
      
      <p className="mt-8 text-xs text-slate-400 dark:text-slate-500 text-center">
        ™ and © 2026 Shift OS. All Rights Reserved.<br/>
        Built for portfolio demonstration purposes.
      </p>
    </div>
  );
};
