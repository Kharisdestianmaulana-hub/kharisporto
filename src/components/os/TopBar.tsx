import React, { useState, useEffect } from 'react';
import { Battery, BatteryCharging, Wifi, Search, Moon, Sun } from 'lucide-react';
import { useWindowStore } from '../../store/useWindowStore';

export const TopBar: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [isDark, setIsDark] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState(false);
  
  const { toggleSpotlight, openWindow } = useWindowStore();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let batteryManager: any = null;

    const updateBattery = (b: any) => {
      setBatteryLevel(Math.round(b.level * 100));
      setIsCharging(b.charging);
    };

    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((b: any) => {
        batteryManager = b;
        updateBattery(b);
        b.addEventListener('levelchange', () => updateBattery(b));
        b.addEventListener('chargingchange', () => updateBattery(b));
      });
    }

    return () => {
      if (batteryManager) {
        batteryManager.removeEventListener('levelchange', () => updateBattery(batteryManager));
        batteryManager.removeEventListener('chargingchange', () => updateBattery(batteryManager));
      }
    };
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="h-8 w-full glass-panel-heavy fixed top-0 z-[100] flex items-center justify-between px-4 text-xs font-medium">
      <div className="flex items-center space-x-4">
        <span onClick={() => openWindow('os-info', 'About Shift OS', { width: 400, height: 500 })} className="font-bold text-sm tracking-wide cursor-pointer hover:opacity-80 transition-opacity">Shift OS</span>
        <span onClick={() => openWindow('ri-files', 'RI-Files')} className="hidden sm:inline hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-1 rounded cursor-pointer transition-colors">File</span>
        <span onClick={() => openWindow('terminal', 'Terminal')} className="hidden sm:inline hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-1 rounded cursor-pointer transition-colors">Edit</span>
        <span onClick={() => openWindow('settings', 'Settings')} className="hidden sm:inline hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-1 rounded cursor-pointer transition-colors">View</span>
        <span onClick={() => openWindow('system-info', 'About This PC')} className="hidden sm:inline hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-1 rounded cursor-pointer transition-colors">Help</span>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setIsDark(!isDark)}
          className="hover:bg-slate-200 dark:hover:bg-slate-700 p-1 rounded transition-colors"
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <Wifi size={14} />
        <div className="flex items-center space-x-1">
          <span>{batteryLevel !== null ? `${batteryLevel}%` : '100%'}</span>
          {isCharging ? <BatteryCharging size={14} /> : <Battery size={14} />}
        </div>
        <button onClick={toggleSpotlight} className="hover:bg-slate-200 dark:hover:bg-slate-700 p-1 rounded transition-colors">
          <Search size={14} />
        </button>
        <span className="font-semibold">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
