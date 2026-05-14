import React, { useEffect, useMemo, useState } from 'react';
import { Activity, BookOpen, FolderKanban, Image as ImageIcon, Layers3, Radio, Sparkles } from 'lucide-react';
import { fetchArticles, fetchChangelogs, fetchGalleryItems, fetchProjects, fetchSkills } from '../../lib/api';
import type { Article, ChangelogEntry, GalleryItem, Project, TechStack } from '../../types';
import { useWindowStore } from '../../store/useWindowStore';
import { DESKTOP_PROJECT_IDS_KEY, dispatchOpenProject, PROJECT_SHORTCUTS_EVENT, readStoredProjectIds } from '../../lib/projectShortcuts';

interface DesktopStats {
  projects: Project[];
  skills: TechStack[];
  changelogs: ChangelogEntry[];
  articles: Article[];
  galleryItems: GalleryItem[];
}

const initialStats: DesktopStats = {
  projects: [],
  skills: [],
  changelogs: [],
  articles: [],
  galleryItems: [],
};

const getLatestLabel = (value?: string) => {
  if (!value) return 'No data yet';
  return value.length > 34 ? `${value.slice(0, 34)}...` : value;
};

export const DesktopWidgets: React.FC = () => {
  const [stats, setStats] = useState<DesktopStats>(initialStats);
  const [desktopProjectIds, setDesktopProjectIds] = useState<string[]>(() => readStoredProjectIds(DESKTOP_PROJECT_IDS_KEY));
  const openWindow = useWindowStore(state => state.openWindow);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const [projects, skills, changelogs, articles, galleryItems] = await Promise.all([
        fetchProjects(),
        fetchSkills(),
        fetchChangelogs(),
        fetchArticles(),
        fetchGalleryItems(),
      ]);

      if (isMounted) {
        setStats({ projects, skills, changelogs, articles, galleryItems });
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const syncDesktopProjects = () => setDesktopProjectIds(readStoredProjectIds(DESKTOP_PROJECT_IDS_KEY));

    window.addEventListener('storage', syncDesktopProjects);
    window.addEventListener(PROJECT_SHORTCUTS_EVENT, syncDesktopProjects);
    return () => {
      window.removeEventListener('storage', syncDesktopProjects);
      window.removeEventListener(PROJECT_SHORTCUTS_EVENT, syncDesktopProjects);
    };
  }, []);

  const featuredProjects = useMemo(() => {
    const visibleProjects = stats.projects.filter(project => project.visibility !== false);
    const manualProjects = desktopProjectIds
      .map(id => visibleProjects.find(project => project.$id === id))
      .filter((project): project is Project => Boolean(project));

    if (manualProjects.length > 0) return manualProjects;

    const completedProjects = visibleProjects.filter(project => project.status === 'Completed');
    return (completedProjects.length > 0 ? completedProjects : visibleProjects).slice(0, 3);
  }, [desktopProjectIds, stats.projects]);

  const liveItems = [
    { label: 'Projects', value: stats.projects.length, icon: FolderKanban },
    { label: 'Skills', value: stats.skills.length, icon: Layers3 },
    { label: 'Gallery', value: stats.galleryItems.length, icon: ImageIcon },
  ];

  return (
    <div className="pointer-events-none fixed inset-x-8 top-16 z-10 hidden lg:block">
      <div className="flex items-start justify-between gap-8">
        <section className="pointer-events-auto w-72">
          <div className="rounded-2xl border border-white/40 bg-white/35 p-4 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/35">
            <div className="mb-3 flex items-center gap-2">
              <FolderKanban size={16} className="accent-text" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">Featured Projects</h2>
            </div>

            <div className="space-y-2">
              {featuredProjects.length > 0 ? (
                featuredProjects.map(project => (
                  <button
                    key={project.$id}
                    onClick={() => {
                      openWindow('ri-files', 'RI-Files');
                      window.setTimeout(() => dispatchOpenProject(project.$id), 80);
                    }}
                    className="group flex w-full items-center gap-3 rounded-xl border border-white/40 bg-white/70 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-slate-900/75 dark:hover:bg-slate-900"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl accent-bg text-white">
                      <FolderKanban size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-black text-slate-800 group-hover:accent-text dark:text-slate-100">{project.title}</div>
                      <div className="truncate text-xs text-slate-500 dark:text-slate-400">{project.category || project.status || 'Project'}</div>
                    </div>
                  </button>
                ))
              ) : (
                <p className="rounded-xl bg-white/60 p-3 text-xs font-semibold text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">Featured projects will appear here.</p>
              )}
            </div>
          </div>
        </section>

        <div className="pointer-events-auto flex w-80 flex-col gap-4">
          <section className="rounded-2xl border border-white/40 bg-emerald-100/80 p-4 text-emerald-950 shadow-xl backdrop-blur-2xl dark:border-emerald-300/20 dark:bg-emerald-950/75 dark:text-emerald-50">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio size={16} />
                <h2 className="text-xs font-black uppercase tracking-widest">Availability</h2>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-black uppercase">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Open
              </span>
            </div>
            <div className="space-y-2 text-sm font-bold">
              <div className="rounded-xl bg-white/55 px-3 py-2 dark:bg-white/10">Open for Internship</div>
              <div className="rounded-xl bg-white/55 px-3 py-2 dark:bg-white/10">Open for Freelance</div>
              <div className="rounded-xl bg-white/55 px-3 py-2 dark:bg-white/10">Currently Building Shift OS Portfolio</div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/40 bg-white/35 p-4 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/35">
            <div className="mb-3 flex items-center gap-2">
              <Activity size={16} className="accent-text" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">Live Status</h2>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {liveItems.map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-xl bg-white/70 p-3 text-center dark:bg-slate-900/75">
                    <Icon size={16} className="mx-auto mb-1 accent-text" />
                    <div className="text-lg font-black text-slate-800 dark:text-slate-100">{item.value}</div>
                    <div className="text-[10px] font-bold uppercase text-slate-500">{item.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs dark:bg-slate-900/75">
                <Sparkles size={14} className="accent-text" />
                <span className="min-w-0 truncate text-slate-600 dark:text-slate-300">Latest update: {getLatestLabel(stats.changelogs[0]?.description || stats.changelogs[0]?.version)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs dark:bg-slate-900/75">
                <BookOpen size={14} className="accent-text" />
                <span className="min-w-0 truncate text-slate-600 dark:text-slate-300">Latest article: {getLatestLabel(stats.articles[0]?.title)}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
