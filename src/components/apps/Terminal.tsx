import React, { useEffect, useState } from 'react';
import { fetchSkills } from '../../lib/api';
import type { TechStack } from '../../types';

export const Terminal: React.FC = () => {
  const [skills, setSkills] = useState<TechStack[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>(['ri-system@shiftos:~$ systemctl status skills.service', 'Loading skills modules...']);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const data = await fetchSkills();
        setSkills(data);
        setLogs(prev => [...prev, `[OK] Loaded ${data.length} skill modules.`]);
      } catch (error) {
        setLogs(prev => [...prev, `[FAIL] Failed to load skill modules.`]);
      } finally {
        setLoading(false);
      }
    };
    
    // Simulate terminal delay
    const timer = setTimeout(() => {
      loadSkills();
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full bg-slate-950 text-emerald-500 font-mono text-sm p-4 overflow-y-auto scrollbar-hide">
      {logs.map((log, i) => (
        <div key={i} className="mb-1">{log}</div>
      ))}
      
      {!loading && skills.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-slate-400">--- SYSTEM SKILLS ALLOCATION ---</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {skills.map(skill => (
              <div key={skill.$id} className="flex flex-col">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-400">{skill.name}</span>
                  <span className="text-slate-500">[{skill.category}] {skill.proficiency}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-emerald-500" 
                    style={{ width: `${skill.proficiency}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-slate-400">--------------------------------</div>
        </div>
      )}
      
      {!loading && (
        <div className="mt-4 flex items-center">
          <span className="text-emerald-500 mr-2">ri-system@shiftos:~$</span>
          <span className="w-2 h-4 bg-emerald-500 animate-pulse"></span>
        </div>
      )}
    </div>
  );
};
