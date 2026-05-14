import React, { useState } from 'react';
import { useWindowStore, type AccentColor, type DockSize, type ThemeMode } from '../../store/useWindowStore';
import { Image, Monitor, Moon, Palette, RotateCcw, Sun, ToggleLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

const wallpaperFiles = import.meta.glob('/public/wallpapers/*.{png,jpg,jpeg,webp,gif,svg}', { eager: true });

const wallpapers = Object.keys(wallpaperFiles).map((path, index) => {
  const url = path.replace('/public', '');
  const name = path.split('/').pop()?.split('.')[0] || `Wallpaper ${index + 1}`;
  return { id: String(index), url, name };
});

if (wallpapers.length === 0) {
  wallpapers.push({ id: 'default', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop', name: 'Default Gradient' });
}

const accentOptions: { id: AccentColor; label: string; className: string }[] = [
  { id: 'blue', label: 'Blue', className: 'bg-blue-500' },
  { id: 'emerald', label: 'Emerald', className: 'bg-emerald-500' },
  { id: 'fuchsia', label: 'Fuchsia', className: 'bg-fuchsia-500' },
  { id: 'orange', label: 'Orange', className: 'bg-orange-500' },
  { id: 'rose', label: 'Rose', className: 'bg-rose-500' },
];

const dockSizeOptions: { id: DockSize; label: string }[] = [
  { id: 'compact', label: 'Compact' },
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'large', label: 'Large' },
];

export const Settings: React.FC = () => {
  const {
    wallpaper,
    theme,
    accentColor,
    reduceMotion,
    dockSize,
    setWallpaper,
    setTheme,
    setAccentColor,
    setReduceMotion,
    setDockSize,
    resetBootScreen,
  } = useWindowStore();
  const [bootReset, setBootReset] = useState(false);

  const handleResetBoot = () => {
    resetBootScreen();
    setBootReset(true);
    window.setTimeout(() => setBootReset(false), 1600);
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide bg-slate-50/90 dark:bg-slate-900/90">
      <div className="flex min-h-full">
        <div className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 p-4 space-y-2 hidden md:block">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 px-2">
            Settings
          </div>
          <button className="w-full flex items-center space-x-3 px-3 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg transition-colors">
            <Monitor size={18} />
            <span className="font-medium">Appearance</span>
          </button>
        </div>

        <div className="flex-1 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Appearance</h2>

          <div className="space-y-6 max-w-5xl">
            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Palette size={20} className="text-slate-500" />
                Interface
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Theme</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['dark', 'light'] as ThemeMode[]).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setTheme(mode)}
                        className={cn(
                          'flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-colors',
                          theme === mode
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                        )}
                      >
                        {mode === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                        {mode === 'dark' ? 'Dark' : 'Light'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Accent Color</div>
                  <div className="flex flex-wrap gap-2">
                    {accentOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => setAccentColor(option.id)}
                        className={cn(
                          'h-10 w-10 rounded-full border-4 transition-transform',
                          option.className,
                          accentColor === option.id ? 'border-slate-900 dark:border-white scale-110' : 'border-white/80 dark:border-slate-700'
                        )}
                        title={option.label}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Dock Size</div>
                  <div className="flex flex-wrap gap-2">
                    {dockSizeOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => setDockSize(option.id)}
                        className={cn(
                          'rounded-xl border px-4 py-2 text-sm font-bold transition-colors',
                          dockSize === option.id
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setReduceMotion(!reduceMotion)}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-left"
                  >
                    <span>
                      <span className="block text-sm font-bold text-slate-800 dark:text-white">Reduce Motion</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Minimize animations and transitions.</span>
                    </span>
                    <ToggleLeft size={28} className={reduceMotion ? 'text-blue-500 rotate-180' : 'text-slate-400'} />
                  </button>

                  <button
                    onClick={handleResetBoot}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span>
                      <span className="block text-sm font-bold text-slate-800 dark:text-white">Reset Boot Screen</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{bootReset ? 'Boot screen will show on next reload.' : 'Show Shift OS boot again next session reload.'}</span>
                    </span>
                    <RotateCcw size={20} className="text-slate-500" />
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Image size={20} className="text-slate-500" />
                Desktop Wallpaper
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wallpapers.map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => setWallpaper(wp.url)}
                    className={cn(
                      "relative group rounded-xl overflow-hidden aspect-video border-2 transition-all",
                      wallpaper === wp.url
                        ? "border-blue-500 scale-[1.02] shadow-lg shadow-blue-500/20"
                        : "border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    <img
                      src={wp.url}
                      alt={wp.name}
                      className="w-full h-full object-cover bg-slate-200 dark:bg-slate-800"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop';
                      }}
                    />
                    {wallpaper === wp.url && (
                      <div className="absolute inset-0 border-4 border-blue-500 rounded-xl pointer-events-none" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-medium">{wp.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
