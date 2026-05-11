import React, { useEffect, useState, useMemo } from 'react';
import { fetchChangelogs } from '../../lib/api';
import type { ChangelogEntry } from '../../types';
import { Loader2, GitCommit, Rocket, Star, Bug, Wrench, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ChangelogsApp: React.FC = () => {
  const [changelogs, setChangelogs] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('All Projects');

  useEffect(() => {
    const loadChangelogs = async () => {
      try {
        const data = await fetchChangelogs();
        setChangelogs(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadChangelogs();
  }, []);

  const projects = useMemo(() => {
    const uniqueProjects = Array.from(new Set(changelogs.map(log => log.project_name || log.project_id || 'Unknown')));
    return ['All Projects', ...uniqueProjects];
  }, [changelogs]);

  const filteredLogs = useMemo(() => {
    if (selectedProject === 'All Projects') return changelogs;
    return changelogs.filter(log => (log.project_name || log.project_id) === selectedProject);
  }, [changelogs, selectedProject]);

  const getIconForType = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'release': return <Rocket size={16} className="text-white" />;
      case 'feature': return <Star size={16} className="text-white" />;
      case 'bugfix': return <Bug size={16} className="text-white" />;
      case 'improvement': return <Wrench size={16} className="text-white" />;
      case 'breaking change': return <AlertTriangle size={16} className="text-white" />;
      default: return <GitCommit size={16} className="text-white" />;
    }
  };

  const getColorForType = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'release': return 'bg-emerald-500';
      case 'feature': return 'bg-purple-500';
      case 'bugfix': return 'bg-rose-500';
      case 'improvement': return 'bg-blue-500';
      case 'breaking change': return 'bg-orange-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto scrollbar-hide flex flex-col">
      {/* Header Banner */}
      <div className="shrink-0 relative h-32 bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center px-8">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-white w-full max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <GitCommit size={32} />
            Changelogs
          </h1>
          <p className="text-purple-100 font-medium">Project Updates & Version History</p>
        </div>
      </div>

      <div className="p-6 md:p-8 flex-1 flex flex-col w-full max-w-4xl mx-auto">
        {/* Toolbar: Category Pills */}
        <div className="flex overflow-x-auto scrollbar-hide pb-2 mb-8 gap-2">
          {projects.map(project => (
            <button
              key={project}
              onClick={() => setSelectedProject(project)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border-2",
                selectedProject === project
                  ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
              )}
            >
              {project}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-slate-400 w-8 h-8" /></div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
            <GitCommit size={48} className="mb-4 opacity-20" />
            <p>No changelogs found.</p>
          </div>
        ) : (
          <div className="relative pl-4 md:pl-0">
            {/* Main Timeline Line */}
            <div className="absolute left-4 md:left-[39px] top-0 bottom-0 w-1 bg-slate-200 dark:bg-slate-700/50 rounded-full hidden md:block"></div>
            
            <div className="space-y-6">
              {filteredLogs.map((log) => (
                <div key={log.$id} className="relative flex flex-col md:flex-row gap-4 md:gap-8 group">
                  {/* Timeline Node */}
                  <div className="hidden md:flex shrink-0 w-20 flex-col items-center">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shadow-md z-10 border-4 border-slate-50 dark:border-slate-900 transition-transform group-hover:scale-110", getColorForType(log.type))}>
                      {getIconForType(log.type)}
                    </div>
                  </div>
                  
                  {/* Glassmorphism Card */}
                  <div className="flex-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-all duration-300 group-hover:border-purple-500/30">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                      {/* Project Name (if 'All Projects' is selected) */}
                      {selectedProject === 'All Projects' && (
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          {log.project_name || log.project_id}
                        </span>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Version Badge */}
                        <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-mono font-bold px-3 py-1 rounded-lg text-sm shadow-sm">
                          {log.version}
                        </div>
                        
                        {/* Type Badge */}
                        <div className={cn("font-bold px-3 py-1 rounded-full text-xs text-white shadow-sm", getColorForType(log.type))}>
                          {log.type}
                        </div>
                        
                        {/* Date */}
                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full">
                          {log.release_date || new Date(log.$createdAt || '').toISOString().split('T')[0]}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
                      {log.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
