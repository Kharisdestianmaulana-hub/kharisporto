import { create } from 'zustand';

export type AppId = 'system-info' | 'ri-files' | 'terminal' | 'app-store' | 'browser' | 'settings' | 'experience' | 'os-info' | 'changelogs' | 'contacts' | 'gallery';
export type ThemeMode = 'dark' | 'light';
export type AccentColor = 'blue' | 'emerald' | 'fuchsia' | 'orange' | 'rose';
export type DockSize = 'compact' | 'comfortable' | 'large';

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number | string; height: number | string };
}

interface WindowStore {
  windows: WindowState[];
  activeZIndex: number;
  wallpaper: string;
  theme: ThemeMode;
  accentColor: AccentColor;
  reduceMotion: boolean;
  dockSize: DockSize;
  isSpotlightOpen: boolean;
  setWallpaper: (url: string) => void;
  setTheme: (theme: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  setReduceMotion: (enabled: boolean) => void;
  setDockSize: (size: DockSize) => void;
  resetBootScreen: () => void;
  toggleSpotlight: () => void;
  closeSpotlight: () => void;
  openWindow: (appId: AppId, title: string, defaultSize?: { width: number | string, height: number | string }) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  bringToFront: (id: string) => void;
  updatePosition: (id: string, position: { x: number; y: number }) => void;
  updateSize: (id: string, size: { width: number | string; height: number | string }) => void;
}

const DEFAULT_OFFSET = 40;
const INITIAL_Z_INDEX = 10;

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  activeZIndex: INITIAL_Z_INDEX,
  wallpaper: localStorage.getItem('shiftos_wallpaper') || '/wallpapers/1.jpg',
  theme: (localStorage.getItem('shiftos_theme') as ThemeMode) || 'dark',
  accentColor: (localStorage.getItem('shiftos_accent') as AccentColor) || 'blue',
  reduceMotion: localStorage.getItem('shiftos_reduce_motion') === 'true',
  dockSize: (localStorage.getItem('shiftos_dock_size') as DockSize) || 'comfortable',
  isSpotlightOpen: false,
  
  setWallpaper: (url: string) => {
    localStorage.setItem('shiftos_wallpaper', url);
    set({ wallpaper: url });
  },

  setTheme: (theme) => {
    localStorage.setItem('shiftos_theme', theme);
    set({ theme });
  },

  setAccentColor: (accentColor) => {
    localStorage.setItem('shiftos_accent', accentColor);
    set({ accentColor });
  },

  setReduceMotion: (reduceMotion) => {
    localStorage.setItem('shiftos_reduce_motion', String(reduceMotion));
    set({ reduceMotion });
  },

  setDockSize: (dockSize) => {
    localStorage.setItem('shiftos_dock_size', dockSize);
    set({ dockSize });
  },

  resetBootScreen: () => {
    sessionStorage.removeItem('hasBooted');
  },
  
  toggleSpotlight: () => set((state) => ({ isSpotlightOpen: !state.isSpotlightOpen })),
  
  closeSpotlight: () => set({ isSpotlightOpen: false }),
  
  openWindow: (appId, title, defaultSize = { width: 800, height: 600 }) => {
    const { windows, activeZIndex, bringToFront } = get();
    
    const existingWindow = windows.find(w => w.appId === appId);
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        set(state => ({
          windows: state.windows.map(w => 
            w.id === existingWindow.id ? { ...w, isMinimized: false, zIndex: state.activeZIndex + 1 } : w
          ),
          activeZIndex: state.activeZIndex + 1
        }));
      } else {
        bringToFront(existingWindow.id);
      }
      return;
    }
    
    const offset = windows.length * DEFAULT_OFFSET;
    const position = { x: 100 + offset, y: 100 + offset };
    const newZIndex = activeZIndex + 1;
    
    const newWindow: WindowState = {
      id: `${appId}-${Date.now()}`,
      appId,
      title,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: newZIndex,
      position,
      size: defaultSize
    };
    
    set({
      windows: [...windows, newWindow],
      activeZIndex: newZIndex
    });
  },
  
  closeWindow: (id) => set(state => ({
    windows: state.windows.filter(w => w.id !== id)
  })),
  
  minimizeWindow: (id) => set(state => ({
    windows: state.windows.map(w => 
      w.id === id ? { ...w, isMinimized: true } : w
    )
  })),
  
  maximizeWindow: (id) => set(state => {
    const window = state.windows.find(w => w.id === id);
    if (!window) return state;
    
    const newZIndex = state.activeZIndex + 1;
    
    return {
      windows: state.windows.map(w => 
        w.id === id ? { ...w, isMaximized: !w.isMaximized, isMinimized: false, zIndex: newZIndex } : w
      ),
      activeZIndex: newZIndex
    };
  }),
  
  bringToFront: (id) => set(state => {
    const window = state.windows.find(w => w.id === id);
    if (!window || window.zIndex === state.activeZIndex) return state;
    
    const newZIndex = state.activeZIndex + 1;
    return {
      windows: state.windows.map(w => 
        w.id === id ? { ...w, zIndex: newZIndex } : w
      ),
      activeZIndex: newZIndex
    };
  }),
  
  updatePosition: (id, position) => set(state => ({
    windows: state.windows.map(w => 
      w.id === id ? { ...w, position } : w
    )
  })),
  
  updateSize: (id, size) => set(state => ({
    windows: state.windows.map(w => 
      w.id === id ? { ...w, size } : w
    )
  }))
}));
