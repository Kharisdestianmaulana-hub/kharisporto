import React, { useEffect, useState } from 'react';
import { fetchProjects, getProjectImageFiles } from '../../lib/api';
import type { Project } from '../../types';
import { ArrowLeft, Check, Copy, FileImage, FileText, Filter, Folder, FolderOpen, ImageOff, Loader2, MonitorUp, Pin, Search, Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ImageViewer } from './viewers/ImageViewer';
import { MarkdownViewer } from './viewers/MarkdownViewer';
import {
  DESKTOP_PROJECT_IDS_KEY,
  DOCK_PROJECT_IDS_KEY,
  FAVORITE_PROJECT_IDS_KEY,
  OPEN_PROJECT_EVENT,
  readStoredProjectIds,
  writeStoredProjectIds,
} from '../../lib/projectShortcuts';

type ProjectFile =
  | { id: string; name: string; type: 'image'; url: string | null }
  | { id: string; name: string; type: 'markdown'; content: string };

type ViewerState =
  | { type: 'image'; title: string; src: string | null }
  | { type: 'markdown'; title: string; content: string }
  | null;

type ContextMenuState = {
  project: Project;
  x: number;
  y: number;
} | null;

export const RIFiles: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewer, setViewer] = useState<ViewerState>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [desktopProjectIds, setDesktopProjectIds] = useState<string[]>(() => readStoredProjectIds(DESKTOP_PROJECT_IDS_KEY));
  const [favoriteProjectIds, setFavoriteProjectIds] = useState<string[]>(() => readStoredProjectIds(FAVORITE_PROJECT_IDS_KEY));
  const [dockProjectIds, setDockProjectIds] = useState<string[]>(() => readStoredProjectIds(DOCK_PROJECT_IDS_KEY));
  const [copiedLabel, setCopiedLabel] = useState('');
  const [pendingOpenProjectId, setPendingOpenProjectId] = useState('');

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    const syncProjectShortcutState = () => {
      setDesktopProjectIds(readStoredProjectIds(DESKTOP_PROJECT_IDS_KEY));
      setFavoriteProjectIds(readStoredProjectIds(FAVORITE_PROJECT_IDS_KEY));
      setDockProjectIds(readStoredProjectIds(DOCK_PROJECT_IDS_KEY));
    };

    window.addEventListener('storage', syncProjectShortcutState);
    window.addEventListener('shiftos:project-shortcuts-updated', syncProjectShortcutState);
    return () => {
      window.removeEventListener('storage', syncProjectShortcutState);
      window.removeEventListener('shiftos:project-shortcuts-updated', syncProjectShortcutState);
    };
  }, []);

  const categories = [
    'All',
    ...(favoriteProjectIds.length > 0 ? ['Favorites'] : []),
    ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))
  ];

  const filteredProjects = projects.filter(p => {
    const matchesFilter = filter === 'All' || (filter === 'Favorites' ? favoriteProjectIds.includes(p.$id) : p.category === filter);
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const parseTechStack = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value
        .flatMap(item => parseTechStack(item))
        .filter(Boolean);
    }

    if (typeof value !== 'string') return [];

    const trimmedValue = value.trim();
    if (!trimmedValue) return [];

    try {
      const parsed = JSON.parse(trimmedValue);
      if (Array.isArray(parsed)) return parseTechStack(parsed);
    } catch {
      // Fall back to comma-separated tech stack from RiRay Hub form.
    }

    return trimmedValue.split(',').map(item => item.trim()).filter(Boolean);
  };

  const createProjectInfo = (project: Project) => {
    const techStack = parseTechStack(project.tech_stack || '');

    return [
      `# ${project.title}`,
      '',
      `**Category:** ${project.category || 'Uncategorized'}`,
      `**Status:** ${project.status || 'Unknown'}`,
      '',
      '## Tech Stack',
      techStack.length > 0
        ? techStack.map(tech => `- ${tech}`).join('\n')
        : 'No tech stack listed.',
    ].join('\n');
  };

  const projectFiles: ProjectFile[] = [];
  if (selectedProject) {
    getProjectImageFiles(selectedProject).forEach((image) => {
      projectFiles.push({
        id: `image-${image.id}`,
        name: image.name,
        type: 'image',
        url: image.url,
      });
    });

    projectFiles.push({
      id: 'project-info',
      name: 'ProjectInfo.md',
      type: 'markdown',
      content: createProjectInfo(selectedProject),
    });

    projectFiles.push({
      id: 'description',
      name: 'DescriptionProject.md',
      type: 'markdown',
      content: selectedProject.content_body || 'No description provided.',
    });
  }

  const filteredFiles = projectFiles.filter(file => file.name.toLowerCase().includes(search.toLowerCase()));
  const selectedProjectTechStack = parseTechStack(selectedProject?.tech_stack);

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setViewer(null);
    setSearch('');
    setContextMenu(null);
  };

  useEffect(() => {
    const handleOpenProject = (event: Event) => {
      const projectId = (event as CustomEvent<{ projectId?: string }>).detail?.projectId;
      if (!projectId) return;
      const project = projects.find(item => item.$id === projectId);
      if (project) {
        openProject(project);
      } else {
        setPendingOpenProjectId(projectId);
      }
    };

    window.addEventListener(OPEN_PROJECT_EVENT, handleOpenProject);
    return () => window.removeEventListener(OPEN_PROJECT_EVENT, handleOpenProject);
  }, [projects]);

  useEffect(() => {
    if (!pendingOpenProjectId) return;
    const project = projects.find(item => item.$id === pendingOpenProjectId);
    if (project) {
      openProject(project);
      setPendingOpenProjectId('');
    }
  }, [pendingOpenProjectId, projects]);

  const goBack = () => {
    if (viewer) {
      setViewer(null);
      return;
    }
    setSelectedProject(null);
    setSearch('');
  };

  const openFile = (file: ProjectFile) => {
    if (file.type === 'image') {
      setViewer({ type: 'image', title: file.name, src: file.url });
      return;
    }
    setViewer({ type: 'markdown', title: file.name, content: file.content });
  };

  const openProjectInfo = (project: Project) => {
    setSelectedProject(project);
    setViewer({ type: 'markdown', title: 'ProjectInfo.md', content: createProjectInfo(project) });
    setSearch('');
    setContextMenu(null);
  };

  const openProjectDescription = (project: Project) => {
    setSelectedProject(project);
    setViewer({ type: 'markdown', title: 'DescriptionProject.md', content: project.content_body || 'No description provided.' });
    setSearch('');
    setContextMenu(null);
  };

  const viewProjectImages = (project: Project) => {
    const firstImage = getProjectImageFiles(project)[0];
    setSelectedProject(project);
    setSearch('');
    setViewer(firstImage ? { type: 'image', title: firstImage.name, src: firstImage.url } : null);
    setContextMenu(null);
  };

  const updateStoredIds = (key: string, ids: string[]) => {
    writeStoredProjectIds(key, ids);
  };

  const addToDesktop = (project: Project) => {
    updateStoredIds(DESKTOP_PROJECT_IDS_KEY, [...desktopProjectIds.filter(id => id !== project.$id), project.$id].slice(-3));
    setContextMenu(null);
  };

  const removeFromDesktop = (project: Project) => {
    updateStoredIds(DESKTOP_PROJECT_IDS_KEY, desktopProjectIds.filter(id => id !== project.$id));
    setContextMenu(null);
  };

  const toggleFavorite = (project: Project) => {
    const nextIds = favoriteProjectIds.includes(project.$id)
      ? favoriteProjectIds.filter(id => id !== project.$id)
      : [...favoriteProjectIds, project.$id];
    updateStoredIds(FAVORITE_PROJECT_IDS_KEY, nextIds);
    setContextMenu(null);
  };

  const toggleDockPin = (project: Project) => {
    const nextIds = dockProjectIds.includes(project.$id)
      ? dockProjectIds.filter(id => id !== project.$id)
      : [...dockProjectIds.filter(id => id !== project.$id), project.$id].slice(-3);
    updateStoredIds(DOCK_PROJECT_IDS_KEY, nextIds);
    setContextMenu(null);
  };

  const copyText = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedLabel(label);
      window.setTimeout(() => setCopiedLabel(''), 1200);
    } catch (error) {
      console.error('Failed to copy project data:', error);
    } finally {
      setContextMenu(null);
    }
  };

  const getProjectSummary = (project: Project) => {
    const techStack = parseTechStack(project.tech_stack).join(', ') || 'No tech stack listed';
    return [
      `Project: ${project.title}`,
      `Category: ${project.category || 'Uncategorized'}`,
      `Status: ${project.status || 'Unknown'}`,
      `Tech Stack: ${techStack}`,
    ].join('\n');
  };

  const openContextMenu = (event: React.MouseEvent, project: Project) => {
    event.preventDefault();
    setContextMenu({
      project,
      x: Math.min(event.clientX, window.innerWidth - 260),
      y: Math.min(event.clientY, window.innerHeight - 380),
    });
  };

  useEffect(() => {
    if (!contextMenu) return;

    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    window.addEventListener('keydown', close);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('keydown', close);
    };
  }, [contextMenu]);

  return (
    <div className="h-full flex flex-col bg-slate-50/90 dark:bg-slate-900/90">
      
      {/* Toolbar */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shrink-0">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <button
              onClick={goBack}
              disabled={!selectedProject && !viewer}
              className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
              title="Back"
            >
              <ArrowLeft size={16} />
            </button>
            <button className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors opacity-50">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors opacity-50">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-2"></div>
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center min-w-0">
            {selectedProject ? (
              <FolderOpen size={16} className="accent-text mr-2 shrink-0" fill="currentColor" />
            ) : (
              <Folder size={16} className="accent-text mr-2 shrink-0" fill="currentColor" />
            )}
            <span className="truncate">
              Projects{selectedProject ? ` / ${selectedProject.title}` : ''}{viewer ? ` / ${viewer.title}` : ''}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search files..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={!!viewer}
              className="pl-9 pr-3 py-1.5 bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 accent-ring transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 border-r border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 p-3 overflow-y-auto hidden md:block">
          {!selectedProject ? (
            <>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Categories</div>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={cn(
                      "w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-sm transition-colors",
                      filter === cat
                        ? "accent-bg text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                    )}
                  >
                    <Filter size={14} />
                    <span className="truncate">{cat}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4 px-2 text-sm">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project</div>
                <div className="font-semibold text-slate-700 dark:text-slate-200 leading-snug">{selectedProject.title}</div>
                <div className="mt-1 text-xs text-slate-500">{selectedProject.category || 'Uncategorized'}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</div>
                <div className="inline-flex rounded-full accent-soft-bg px-2.5 py-1 text-xs font-semibold accent-text">
                  {selectedProject.status}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tech Stack</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProjectTechStack.length > 0 ? (
                    selectedProjectTechStack.slice(0, 8).map(tech => (
                      <span key={tech} className="rounded-md bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {tech}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No stack listed</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {viewer?.type === 'image' ? (
            <div className="h-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <ImageViewer title={viewer.title} src={viewer.src} />
            </div>
          ) : viewer?.type === 'markdown' ? (
            <div className="h-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <MarkdownViewer title={viewer.title} content={viewer.content} />
            </div>
          ) : loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="animate-spin text-slate-400" />
            </div>
          ) : selectedProject ? (
            filteredFiles.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <FileText size={48} className="mb-4 opacity-50" />
                <p>No files found in this project.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredFiles.map(file => (
                  <button
                    key={file.id}
                    onDoubleClick={() => openFile(file)}
                    onClick={() => openFile(file)}
                    className="group flex flex-col items-center p-3 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer select-none"
                  >
                    <div className="relative w-16 h-16 mb-3 rounded-xl flex items-center justify-center">
                      {file.type === 'image' ? (
                        file.url ? (
                          <img src={file.url} alt={file.name} className="h-16 w-16 rounded-xl object-cover shadow-sm" />
                        ) : (
                          <div className="h-16 w-16 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                            <ImageOff size={30} className="text-slate-400" />
                          </div>
                        )
                      ) : (
                        <FileText className="w-14 h-14 text-slate-500 dark:text-slate-400" />
                      )}
                      {file.type === 'image' && <FileImage size={16} className="absolute -bottom-1 -right-1 accent-text bg-white dark:bg-slate-900 rounded" />}
                    </div>
                    <div className="text-center w-full">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:accent-text transition-colors">
                        {file.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 truncate mt-0.5">
                        {file.type === 'image' ? 'Image file' : 'Markdown file'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : filteredProjects.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Folder size={48} className="mb-4 opacity-50" />
              <p>No projects found in this directory.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredProjects.map(project => (
                <div 
                  key={project.$id}
                  className="group flex flex-col items-center p-3 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer select-none"
                  onClick={() => openProject(project)}
                  onContextMenu={(event) => openContextMenu(event, project)}
                >
                  <div className="relative w-16 h-16 mb-3">
                    <Folder className="w-full h-full accent-text" fill="currentColor" />
                    {project.status === 'Completed' && (
                      <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      </div>
                    )}
                  </div>
                  <div className="text-center w-full">
                    <div className="flex items-center justify-center gap-1 text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:accent-text transition-colors">
                      {favoriteProjectIds.includes(project.$id) && <Star size={12} className="fill-amber-400 text-amber-400" />}
                      {project.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500 truncate mt-0.5">
                      {project.category || 'Uncategorized'}
                    </div>
                    {project.tech_stack && (
                      <div className="mt-1 truncate text-[11px] text-slate-400">
                        {parseTechStack(project.tech_stack).slice(0, 2).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {copiedLabel && (
        <div className="fixed bottom-28 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-xl">
          Copied {copiedLabel}
        </div>
      )}
      {contextMenu && (
        <div
          className="fixed z-[1000] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-2 text-sm shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="border-b border-slate-200 px-3 py-2 dark:border-slate-700">
            <div className="truncate font-black text-slate-800 dark:text-slate-100">{contextMenu.project.title}</div>
            <div className="truncate text-xs text-slate-500">{contextMenu.project.category || 'Project'}</div>
          </div>
          {[
            { label: 'Open', icon: FolderOpen, action: () => openProject(contextMenu.project) },
            { label: 'Open Project Info', icon: FileText, action: () => openProjectInfo(contextMenu.project) },
            { label: 'Open Description', icon: FileText, action: () => openProjectDescription(contextMenu.project) },
            { label: 'View Images', icon: FileImage, action: () => viewProjectImages(contextMenu.project) },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button key={item.label} onClick={item.action} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                <Icon size={16} className="accent-text" />
                {item.label}
              </button>
            );
          })}
          <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
          {desktopProjectIds.includes(contextMenu.project.$id) ? (
            <button onClick={() => removeFromDesktop(contextMenu.project)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
              <MonitorUp size={16} className="accent-text" />
              Remove from Desktop
            </button>
          ) : (
            <button onClick={() => addToDesktop(contextMenu.project)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
              <MonitorUp size={16} className="accent-text" />
              Show on Desktop
            </button>
          )}
          <button onClick={() => toggleFavorite(contextMenu.project)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
            <Star size={16} className={favoriteProjectIds.includes(contextMenu.project.$id) ? 'fill-amber-400 text-amber-400' : 'accent-text'} />
            {favoriteProjectIds.includes(contextMenu.project.$id) ? 'Remove Favorite' : 'Mark as Favorite'}
          </button>
          <button onClick={() => toggleDockPin(contextMenu.project)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
            {dockProjectIds.includes(contextMenu.project.$id) ? <Check size={16} className="text-emerald-500" /> : <Pin size={16} className="accent-text" />}
            {dockProjectIds.includes(contextMenu.project.$id) ? 'Unpin from Dock' : 'Pin to Dock'}
          </button>
          <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
          <button onClick={() => void copyText('project name', contextMenu.project.title)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
            <Copy size={16} className="accent-text" />
            Copy Project Name
          </button>
          <button onClick={() => void copyText('tech stack', parseTechStack(contextMenu.project.tech_stack).join(', '))} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
            <Copy size={16} className="accent-text" />
            Copy Tech Stack
          </button>
          <button onClick={() => void copyText('project summary', getProjectSummary(contextMenu.project))} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
            <Copy size={16} className="accent-text" />
            Copy Project Summary
          </button>
        </div>
      )}
    </div>
  );
};
