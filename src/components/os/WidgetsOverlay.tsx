import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CloudSun, Clock3, Plus, TimerReset } from 'lucide-react';

interface WidgetsOverlayProps {
  time: Date;
  onClose: () => void;
}

const getCalendarDays = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
};

export const WidgetsOverlay: React.FC<WidgetsOverlayProps> = ({ time, onClose }) => {
  const dayName = time.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = time.toLocaleDateString('en-US', { month: 'short' });
  const monthLong = time.toLocaleDateString('en-US', { month: 'long' });
  const dateNumber = time.getDate();
  const calendarDays = getCalendarDays(time);
  const hour = time.getHours() % 12;
  const minute = time.getMinutes();
  const second = time.getSeconds();
  const hourRotation = hour * 30 + minute * 0.5;
  const minuteRotation = minute * 6;
  const secondRotation = second * 6;

  return (
    <motion.div
      className="fixed inset-0 z-[95]"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="absolute inset-0 bg-slate-950/5 dark:bg-slate-950/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.14 }}
      />
      <motion.aside
        className="absolute right-4 top-12 bottom-24 w-[360px] max-w-[calc(100vw-2rem)] overflow-y-auto scrollbar-hide transform-gpu will-change-transform"
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, x: 380 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 380 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-3xl bg-slate-900/90 text-white border border-white/10 p-5 shadow-2xl backdrop-blur-md">
            <p className="text-xs font-black uppercase tracking-widest text-rose-400">{dayName}</p>
            <div className="text-5xl font-light leading-none mt-2">{dateNumber}</div>
            <div className="mt-5 space-y-2 text-xs">
              <div className="border-l-4 border-fuchsia-500 pl-2">
                <p className="font-bold text-fuchsia-300">Shift OS</p>
                <p className="text-slate-400">Widget panel active</p>
              </div>
              <div className="border-l-4 border-emerald-500 pl-2">
                <p className="font-bold text-emerald-300">Workspace</p>
                <p className="text-slate-400">Ready to build</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-sky-500/90 text-white p-5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">Jakarta</p>
                <div className="text-5xl font-light leading-none mt-2">30°</div>
              </div>
              <CloudSun size={34} className="text-yellow-200" />
            </div>
            <p className="mt-7 text-sm font-medium">Mostly Sunny</p>
            <p className="text-xs text-sky-100">H:33° L:26°</p>
          </div>

          <div className="col-span-2 rounded-3xl bg-black/80 text-white border border-white/10 p-4 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 mb-4">
              <TimerReset size={16} className="text-emerald-300" />
              <p className="text-sm font-black">System Activity</p>
            </div>
            <div className="space-y-3">
              {[
                ['Portfolio UI', '92%', 'bg-emerald-400'],
                ['Backend Setup', '68%', 'bg-blue-400'],
                ['Learning Queue', '41%', 'bg-orange-400'],
              ].map(([label, value, color]) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{label}</span>
                    <span className="font-bold">{value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: value }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900/90 text-white border border-white/10 p-5 shadow-2xl backdrop-blur-md flex items-center justify-center">
            <div className="relative h-36 w-36 rounded-full bg-white text-slate-950 shadow-inner">
              {Array.from({ length: 12 }, (_, index) => (
                <span
                  key={index}
                  className="absolute left-1/2 top-1/2 text-sm font-black"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${index * 30}deg) translateY(-55px) rotate(-${index * 30}deg)`,
                  }}
                >
                  {index === 0 ? 12 : index}
                </span>
              ))}
              <div className="absolute left-1/2 top-1/2 h-10 w-1 origin-bottom rounded-full bg-slate-900" style={{ transform: `translate(-50%, -100%) rotate(${hourRotation}deg)` }} />
              <div className="absolute left-1/2 top-1/2 h-14 w-0.5 origin-bottom rounded-full bg-slate-900" style={{ transform: `translate(-50%, -100%) rotate(${minuteRotation}deg)` }} />
              <div className="absolute left-1/2 top-1/2 h-14 w-px origin-bottom rounded-full bg-orange-500" style={{ transform: `translate(-50%, -100%) rotate(${secondRotation}deg)` }} />
              <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500" />
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900/90 text-white border border-white/10 p-5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-rose-400">{monthName}</p>
                <p className="font-bold">{monthLong}</p>
              </div>
              <CalendarDays size={18} className="text-slate-400" />
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {calendarDays.map((day, index) => (
                <span
                  key={`${day ?? 'empty'}-${index}`}
                  className={day === dateNumber ? 'rounded-full bg-rose-500 text-white font-black py-1' : 'py-1 text-slate-300'}
                >
                  {day || ''}
                </span>
              ))}
            </div>
          </div>

          <button className="col-span-2 mx-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-white/20 transition-colors">
            <Plus size={14} />
            Edit Widgets
          </button>

          <div className="col-span-2 rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-xs text-white/80 backdrop-blur-md">
            <Clock3 size={14} className="inline mr-2" />
            Click outside this panel to close widgets.
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
};
