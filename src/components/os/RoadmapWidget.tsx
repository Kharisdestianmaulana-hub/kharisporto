import React, { useEffect, useState } from 'react';
import { fetchActiveRoadmap } from '../../lib/api';
import type { Roadmap } from '../../types';
import { Loader2, CheckCircle2, Circle, Target } from 'lucide-react';

export const RoadmapWidget: React.FC = () => {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchActiveRoadmap();
        setRoadmap(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="fixed left-8 top-1/2 -translate-y-1/2 z-10 w-[280px] pointer-events-auto">
        <div className="bg-amber-100 rounded-2xl p-6 shadow-xl flex items-center justify-center h-40" style={{ boxShadow: '4px 6px 20px rgba(0,0,0,0.15)' }}>
          <Loader2 className="animate-spin text-amber-600 w-6 h-6" />
        </div>
      </div>
    );
  }

  if (!roadmap) return null;

  return (
    <div className="fixed left-8 top-1/2 -translate-y-1/2 z-10 w-[280px] pointer-events-auto">
      {/* Sticky Note */}
      <div 
        className="relative bg-amber-100 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
        style={{ 
          boxShadow: '4px 6px 24px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.08)',
          transform: 'rotate(-1.5deg)',
        }}
      >
        {/* Tape effect */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-7 bg-amber-200/80 backdrop-blur-sm rounded-md" style={{ transform: 'rotate(2deg)', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}></div>
        
        {/* Header */}
        <div className="pt-8 px-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Target size={16} className="text-amber-700" />
            <h3 className="font-black text-amber-900 text-sm uppercase tracking-wider">Roadmaps</h3>
          </div>
          <div className="text-2xl font-black text-amber-950 leading-tight">{roadmap.year}</div>
          <div className="text-xs font-bold text-amber-700 mt-1">{roadmap.title}</div>
        </div>

        {/* Divider */}
        <div className="mx-6 border-t-2 border-amber-300/60 border-dashed"></div>

        {/* Tasks */}
        <div className="px-6 py-4 max-h-[240px] overflow-y-auto scrollbar-hide space-y-2.5">
          {(() => {
            // Parse tasks from Appwrite
            let rawTasks: any[] = [];
            if (Array.isArray(roadmap.tasks)) {
              rawTasks = roadmap.tasks;
            } else if (typeof roadmap.tasks === 'string') {
              try {
                const parsed = JSON.parse(roadmap.tasks);
                rawTasks = Array.isArray(parsed) ? parsed : [roadmap.tasks];
              } catch {
                rawTasks = (roadmap.tasks as string).split('\n').filter(t => t.trim());
              }
            }

            // Each task is an object like { $id, label, done } or a string
            const taskItems = rawTasks.map((t: any) => {
              if (typeof t === 'string') {
                // Parse string tasks, check for JSON
                try {
                  const parsed = JSON.parse(t);
                  return { label: parsed.label || String(parsed), done: !!parsed.done };
                } catch {
                  return { label: t, done: false };
                }
              }
              if (typeof t === 'object' && t !== null) {
                return { label: t.label || t.text || t.title || t.name || '', done: !!t.done };
              }
              return { label: String(t), done: false };
            }).filter((t: any) => t.label);

            return taskItems.length > 0 ? (
              taskItems.map((task: any, idx: number) => (
                <div key={idx} className="flex items-start gap-2.5 group">
                  {task.done ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Circle size={16} className="text-amber-500/60 shrink-0 mt-0.5" />
                  )}
                  <span className={`text-sm leading-snug font-medium ${task.done ? 'text-amber-700/50 line-through' : 'text-amber-900'}`} style={{ fontFamily: "'Caveat', 'Patrick Hand', cursive" }}>
                    {task.label}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-amber-600 italic">No tasks yet...</p>
            );
          })()}
        </div>

        {/* Bottom fold effect */}
        <div className="h-3 bg-gradient-to-t from-amber-200/40 to-transparent"></div>

        {/* Paper texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000\' fill-opacity=\'1\'%3E%3Cpath d=\'M5 0h1L0 5V4zM6 5v1H5z\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>
      </div>
    </div>
  );
};
