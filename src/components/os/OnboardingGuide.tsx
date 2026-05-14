import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const ONBOARDING_STORAGE_KEY = 'shiftos_onboarding_complete';
const DIALOG_ESTIMATED_HEIGHT = 220;
const DOCK_TARGET_PADDING = 8;
const TOPBAR_TARGET_PADDING_X = 5;
const TOPBAR_TARGET_PADDING_Y = 2;

interface GuideStep {
  targetId: string;
  title: string;
  description: string;
  placement?: 'top' | 'bottom';
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface OnboardingGuideProps {
  onComplete?: () => void;
}

const guideSteps: GuideStep[] = [
  {
    targetId: 'topbar-logo',
    title: 'Shift OS Menu',
    description: 'Klik nama Shift OS untuk membuka informasi sistem web ini.',
    placement: 'bottom',
  },
  {
    targetId: 'topbar-file',
    title: 'File',
    description: 'Shortcut untuk membuka RI-Files, tempat project portfolio ditampilkan seperti folder.',
    placement: 'bottom',
  },
  {
    targetId: 'topbar-edit',
    title: 'Edit',
    description: 'Shortcut cepat ke Terminal untuk melihat command profile, skills, project, dan kontak.',
    placement: 'bottom',
  },
  {
    targetId: 'topbar-view',
    title: 'View',
    description: 'Buka Settings untuk mengganti tema, accent color, ukuran dock, dan wallpaper.',
    placement: 'bottom',
  },
  {
    targetId: 'topbar-help',
    title: 'Help',
    description: 'Buka About This PC untuk melihat ringkasan profil utama.',
    placement: 'bottom',
  },
  {
    targetId: 'topbar-theme',
    title: 'Theme Toggle',
    description: 'Ganti tampilan antara dark mode dan light mode.',
    placement: 'bottom',
  },
  {
    targetId: 'topbar-search',
    title: 'Spotlight Search',
    description: 'Buka pencarian cepat untuk menemukan dan menjalankan app.',
    placement: 'bottom',
  },
  {
    targetId: 'topbar-widgets',
    title: 'Widgets',
    description: 'Klik tanggal dan jam untuk membuka panel widget.',
    placement: 'bottom',
  },
  {
    targetId: 'dock-system-info',
    title: 'About PC',
    description: 'App ini untuk melihat ringkasan profil saya dan link sosial utama.',
    placement: 'top',
  },
  {
    targetId: 'dock-ri-files',
    title: 'RI-Files',
    description: 'App ini untuk membuka explorer project portfolio saya, lengkap dengan gambar dan deskripsi project.',
    placement: 'top',
  },
  {
    targetId: 'dock-terminal',
    title: 'Terminal',
    description: 'App ini untuk melihat profil saya lewat command seperti about, skills, projects, dan contact.',
    placement: 'top',
  },
  {
    targetId: 'dock-app-store',
    title: 'App Store',
    description: 'App ini untuk melihat katalog layanan digital yang bisa saya kerjakan.',
    placement: 'top',
  },
  {
    targetId: 'dock-experience',
    title: 'Experience',
    description: 'App ini untuk melihat pengalaman, pendidikan, sertifikasi, dan aktivitas yang relevan dengan CV saya.',
    placement: 'top',
  },
  {
    targetId: 'dock-changelogs',
    title: 'Changelogs',
    description: 'App ini untuk melihat catatan update dan rilis project saya.',
    placement: 'top',
  },
  {
    targetId: 'dock-gallery',
    title: 'Gallery',
    description: 'App ini untuk melihat koleksi media, desain, dan karya visual saya.',
    placement: 'top',
  },
  {
    targetId: 'dock-cv-download',
    title: 'Download CV',
    description: 'App ini untuk HRD yang ingin download CV saya.',
    placement: 'top',
  },
  {
    targetId: 'dock-contacts',
    title: 'Contacts',
    description: 'App ini untuk melihat kontak saya dan mengirim email lewat composer sederhana.',
    placement: 'top',
  },
  {
    targetId: 'dock-browser',
    title: 'Browser',
    description: 'App ini untuk membaca tulisan, artikel, dan devlog saya di Articles Hub.',
    placement: 'top',
  },
  {
    targetId: 'dock-settings',
    title: 'Settings',
    description: 'App ini untuk mengatur tampilan desktop, tema, accent color, ukuran dock, dan boot screen.',
    placement: 'top',
  },
];

const getElementRect = (targetId: string): TargetRect | null => {
  const element = document.querySelector<HTMLElement>(`[data-guide-id="${targetId}"]`);
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  if (rect.width === 0 || rect.height === 0 || style.display === 'none' || style.visibility === 'hidden') {
    return null;
  }

  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
};

const getDialogPosition = (rect: TargetRect, placement: GuideStep['placement']) => {
  const dialogWidth = Math.min(360, window.innerWidth - 32);
  const left = Math.min(
    Math.max(16, rect.left + rect.width / 2 - dialogWidth / 2),
    window.innerWidth - dialogWidth - 16
  );
  const preferredTop = placement === 'top'
    ? rect.top - DIALOG_ESTIMATED_HEIGHT - 30
    : rect.top + rect.height + 24;
  const top = Math.min(Math.max(16, preferredTop), window.innerHeight - DIALOG_ESTIMATED_HEIGHT - 16);

  return { left, top, width: dialogWidth };
};

const getPaddedTargetRect = (step: GuideStep, rect: TargetRect): TargetRect => {
  const isTopBarTarget = step.targetId.startsWith('topbar-');
  const paddingX = isTopBarTarget ? TOPBAR_TARGET_PADDING_X : DOCK_TARGET_PADDING;
  const paddingY = isTopBarTarget ? TOPBAR_TARGET_PADDING_Y : DOCK_TARGET_PADDING;

  return {
    top: Math.max(8, rect.top - paddingY),
    left: Math.max(8, rect.left - paddingX),
    width: Math.min(window.innerWidth - 16, rect.width + paddingX * 2),
    height: Math.min(window.innerHeight - 16, rect.height + paddingY * 2),
  };
};

const OverlayBlocks: React.FC<{ rect: TargetRect }> = ({ rect }) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const overlayClass = 'absolute bg-slate-950/70 backdrop-blur-[2px]';

  return (
    <>
      <motion.div
        className={overlayClass}
        animate={{ top: 0, left: 0, width: viewportWidth, height: rect.top }}
        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      />
      <motion.div
        className={overlayClass}
        animate={{ top: rect.top + rect.height, left: 0, width: viewportWidth, height: Math.max(0, viewportHeight - rect.top - rect.height) }}
        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      />
      <motion.div
        className={overlayClass}
        animate={{ top: rect.top, left: 0, width: rect.left, height: rect.height }}
        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      />
      <motion.div
        className={overlayClass}
        animate={{ top: rect.top, left: rect.left + rect.width, width: Math.max(0, viewportWidth - rect.left - rect.width), height: rect.height }}
        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      />
    </>
  );
};

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState<GuideStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  const startGuide = useCallback(() => {
    const availableSteps = guideSteps.filter(step => getElementRect(step.targetId));
    if (availableSteps.length > 0) {
      setVisibleSteps(availableSteps);
      setCurrentIndex(0);
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true') return;

    const timer = window.setTimeout(startGuide, 650);

    return () => window.clearTimeout(timer);
  }, [startGuide]);

  useEffect(() => {
    const handleStartTour = () => {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      window.setTimeout(startGuide, 80);
    };

    window.addEventListener('shiftos:start-tour', handleStartTour);
    return () => window.removeEventListener('shiftos:start-tour', handleStartTour);
  }, [startGuide]);

  const currentStep = visibleSteps[currentIndex];

  const updateTargetRect = useCallback(() => {
    if (!currentStep) return;
    setTargetRect(getElementRect(currentStep.targetId));
  }, [currentStep]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = window.requestAnimationFrame(updateTargetRect);

    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [isOpen, updateTargetRect]);

  const completeGuide = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setIsOpen(false);
    window.setTimeout(() => onComplete?.(), 180);
  };

  const goNext = () => {
    if (currentIndex >= visibleSteps.length - 1) {
      completeGuide();
      return;
    }

    setCurrentIndex(index => index + 1);
  };

  const goBack = () => {
    setCurrentIndex(index => Math.max(0, index - 1));
  };

  const dialogPosition = useMemo(() => {
    if (!targetRect || !currentStep) return null;
    return getDialogPosition(targetRect, currentStep.placement);
  }, [targetRect, currentStep]);

  if (!currentStep || !targetRect || !dialogPosition) return null;

  const paddedRect = getPaddedTargetRect(currentStep, targetRect);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] pointer-events-auto">
          <OverlayBlocks rect={paddedRect} />

          <motion.div
            className="pointer-events-none absolute rounded-2xl border-2 border-white bg-transparent"
            animate={{
              top: paddedRect.top,
              left: paddedRect.left,
              width: paddedRect.width,
              height: paddedRect.height,
            }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            style={{ boxShadow: '0 0 0 2px var(--shift-accent), 0 0 34px var(--shift-accent)' }}
          />

          <motion.div
            className="absolute rounded-2xl border border-white/25 bg-white/95 p-5 text-slate-900 shadow-2xl dark:bg-slate-900/95 dark:text-slate-100"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, ...dialogPosition }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 text-xs font-black uppercase tracking-widest" style={{ color: 'var(--shift-accent)' }}>
                  Guide {currentIndex + 1} of {visibleSteps.length}
                </div>
                <h2 className="text-xl font-black">{currentStep.title}</h2>
              </div>
              <button
                onClick={completeGuide}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Close guide"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{currentStep.description}</p>

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                onClick={completeGuide}
                className="rounded-xl px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Skip
              </button>
              <div className="flex gap-2">
                <button
                  onClick={goBack}
                  disabled={currentIndex === 0}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
                <button
                  onClick={goNext}
                  className="inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-black text-white transition hover:opacity-90"
                  style={{ backgroundColor: 'var(--shift-accent)' }}
                >
                  {currentIndex === visibleSteps.length - 1 ? 'Finish' : 'Next'}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
