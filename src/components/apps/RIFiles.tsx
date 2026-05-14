import React, { useEffect, useState } from 'react';
import { fetchProjects, getProjectImageFiles } from '../../lib/api';
import type { Project } from '../../types';
import { ArrowLeft, FileImage, FileText, Filter, Folder, FolderOpen, ImageOff, Loader2, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ImageViewer } from './viewers/ImageViewer';
import { MarkdownViewer } from './viewers/MarkdownViewer';

type ProjectFile =
  | { id: string; name: string; type: 'image'; url: string | null }
  | { id: 'description'; name: 'DescriptionProject.md'; type: 'markdown'; content: string };

type ViewerState =
  | { type: 'image'; title: string; src: string | null }
  | { type: 'markdown'; title: string; content: string }
  | null;

export const RIFiles: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewer, setViewer] = useState<ViewerState>(null);

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

  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))];

  const filteredProjects = projects.filter(p => {
    const matchesFilter = filter === 'All' || p.category === filter;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
      id: 'description',
      name: 'DescriptionProject.md',
      type: 'markdown',
      content: selectedProject.content_body || 'No description provided.',
    });
  }

  const filteredFiles = projectFiles.filter(file => file.name.toLowerCase().includes(search.toLowerCase()));

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setViewer(null);
    setSearch('');
  };

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
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:accent-text transition-colors">
                      {project.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500 truncate mt-0.5">
                      {project.category || 'Uncategorized'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
