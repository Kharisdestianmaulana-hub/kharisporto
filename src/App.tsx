import { useEffect, useState } from 'react';
import { BootScreen } from './components/os/BootScreen';
import { TopBar } from './components/os/TopBar';
import { FloatingDock } from './components/os/FloatingDock';
import { WindowContainer } from './components/os/WindowContainer';
import { Spotlight } from './components/os/Spotlight';
import { RoadmapWidget } from './components/os/RoadmapWidget';
import { useWindowStore } from './store/useWindowStore';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [hasBooted, setHasBooted] = useState(() => {
    return sessionStorage.getItem('hasBooted') === 'true';
  });
  const { wallpaper, theme, accentColor, reduceMotion } = useWindowStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
    document.documentElement.style.setProperty('--shift-accent', `var(--accent-${accentColor})`);
  }, [theme, accentColor, reduceMotion]);

  const handleBootComplete = () => {
    setHasBooted(true);
    sessionStorage.setItem('hasBooted', 'true');
  };

  return (
    <div 
      className="w-screen h-screen overflow-hidden flex flex-col relative bg-cover bg-center transition-all duration-500"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      <AnimatePresence>
        {!hasBooted && <BootScreen onComplete={handleBootComplete} />}
      </AnimatePresence>

      {hasBooted && (
        <>
          <TopBar />
          
          <div className="flex-1 w-full relative z-[50] mt-8 mb-20 pointer-events-none">
            <WindowContainer />
          </div>

          <FloatingDock />
          <Spotlight />
          <RoadmapWidget />
        </>
      )}
    </div>
  );
}

export default App;
