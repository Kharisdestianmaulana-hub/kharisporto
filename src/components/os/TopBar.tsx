import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Battery, BatteryCharging, Wifi, Search, Moon, Sun } from 'lucide-react';
import { useWindowStore } from '../../store/useWindowStore';
import { WidgetsOverlay } from './WidgetsOverlay';

interface BrowserBatteryManager extends EventTarget {
  level: number;
  charging: boolean;
}

interface BatteryNavigator extends Navigator {
  getBattery?: () => Promise<BrowserBatteryManager>;
}

export const TopBar: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState(false);
  const [isWidgetsOpen, setIsWidgetsOpen] = useState(false);
  
  const { toggleSpotlight, openWindow, theme, setTheme } = useWindowStore();
  const dateTimeLabel = `${time.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).replace(',', '')} ${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let batteryManager: BrowserBatteryManager | null = null;
    let handleBatteryChange: (() => void) | null = null;

    const updateBattery = (b: BrowserBatteryManager) => {
      setBatteryLevel(Math.round(b.level * 100));
      setIsCharging(b.charging);
    };

    const batteryNavigator = navigator as BatteryNavigator;
    if (batteryNavigator.getBattery) {
      batteryNavigator.getBattery().then((b) => {
        batteryManager = b;
        updateBattery(b);
        handleBatteryChange = () => updateBattery(b);
        b.addEventListener('levelchange', handleBatteryChange);
        b.addEventListener('chargingchange', handleBatteryChange);
      });
    }

    return () => {
      if (batteryManager && handleBatteryChange) {
        batteryManager.removeEventListener('levelchange', handleBatteryChange);
        batteryManager.removeEventListener('chargingchange', handleBatteryChange);
      }
    };
  }, []);

  return (
    <>
    <div className="h-8 w-full topbar-glass fixed top-0 z-[100] flex items-center justify-between px-4 text-xs font-medium">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/70 dark:bg-white/20" />
      <div className="flex items-center space-x-4">
        <span data-guide-id="topbar-logo" onClick={() => openWindow('os-info', 'About Shift OS', { width: 400, height: 500 })} className="font-bold text-sm tracking-wide cursor-pointer hover:opacity-80 transition-opacity">Shift OS</span>
        <span data-guide-id="topbar-file" onClick={() => openWindow('ri-files', 'RI-Files')} className="hidden sm:inline hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-1 rounded cursor-pointer transition-colors">File</span>
        <span data-guide-id="topbar-edit" onClick={() => openWindow('terminal', 'Terminal')} className="hidden sm:inline hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-1 rounded cursor-pointer transition-colors">Edit</span>
        <span data-guide-id="topbar-view" onClick={() => openWindow('settings', 'Settings')} className="hidden sm:inline hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-1 rounded cursor-pointer transition-colors">View</span>
        <span data-guide-id="topbar-help" onClick={() => openWindow('system-info', 'About This PC')} className="hidden sm:inline hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-1 rounded cursor-pointer transition-colors">Help</span>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          data-guide-id="topbar-theme"
          aria-label="Toggle theme"
          className="hover:bg-slate-200 dark:hover:bg-slate-700 p-1 rounded transition-colors"
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <Wifi size={14} />
        <div className="flex items-center space-x-1">
          <span>{batteryLevel !== null ? `${batteryLevel}%` : '100%'}</span>
          {isCharging ? <BatteryCharging size={14} /> : <Battery size={14} />}
        </div>
        <button onClick={toggleSpotlight} data-guide-id="topbar-search" aria-label="Open Spotlight" className="hover:bg-slate-200 dark:hover:bg-slate-700 p-1 rounded transition-colors">
          <Search size={14} />
        </button>
        <button
          onClick={() => setIsWidgetsOpen((open) => !open)}
          data-guide-id="topbar-widgets"
          className="font-semibold whitespace-nowrap hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-1 rounded transition-colors"
        >
          {dateTimeLabel}
        </button>
      </div>
    </div>
    <AnimatePresence>
      {isWidgetsOpen && <WidgetsOverlay time={time} onClose={() => setIsWidgetsOpen(false)} />}
    </AnimatePresence>
    </>
  );
};
