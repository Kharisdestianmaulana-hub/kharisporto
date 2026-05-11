import React from 'react';
import { useWindowStore } from '../../store/useWindowStore';
import { Image, Monitor } from 'lucide-react';
import { cn } from '../../lib/utils';

// Read all image files from public/wallpapers/ dynamically
const wallpaperFiles = import.meta.glob('/public/wallpapers/*.{png,jpg,jpeg,webp,gif,svg}', { eager: true });

const wallpapers = Object.keys(wallpaperFiles).map((path, index) => {
  // path is something like "/public/wallpapers/my-image.png"
  const url = path.replace('/public', ''); // For public files, the URL in browser drops '/public'
  const name = path.split('/').pop()?.split('.')[0] || `Wallpaper ${index + 1}`;
  return { id: String(index), url, name };
});

// Fallback if empty
if (wallpapers.length === 0) {
  wallpapers.push({ id: 'default', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop', name: 'Default Gradient' });
}

export const Settings: React.FC = () => {
  const { wallpaper, setWallpaper } = useWindowStore();

  return (
    <div className="h-full overflow-y-auto scrollbar-hide bg-slate-50/90 dark:bg-slate-900/90">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 border-r border-slate-200 dark:border-slate-800 p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 px-2">
            Settings
          </div>
          <button className="w-full flex items-center space-x-3 px-3 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg transition-colors">
            <Monitor size={18} />
            <span className="font-medium">Appearance</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Appearance</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4 flex items-center space-x-2">
                <Image size={20} className="text-slate-500" />
                <span>Desktop Wallpaper</span>
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
                        // Fallback if image not found
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop';
                      }}
                    />
                    
                    {/* Active Indicator */}
                    {wallpaper === wp.url && (
                      <div className="absolute inset-0 border-4 border-blue-500 rounded-xl pointer-events-none" />
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-medium">{wp.name}</span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Put your custom wallpapers in <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">public/wallpapers/</code>. You can use any name and formats like <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">.png</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">.jpg</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">.webp</code>, or <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">.gif</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
