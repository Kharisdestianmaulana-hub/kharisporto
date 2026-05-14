import React, { useEffect, useState } from 'react';
import { fetchBio, fetchProjects, fetchSkills, fetchSocialLinks, fetchTestimonials } from '../../lib/api';
import type { Bio, Project, SocialLink, TechStack, Testimonial } from '../../types';
import { Code, Briefcase, Camera, MessageSquare, Mail, Link as LinkIcon, Loader2, Quote, Layers3 } from 'lucide-react';

export const SystemInfo: React.FC = () => {
  const [bio, setBio] = useState<Bio | null>(null);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [skills, setSkills] = useState<TechStack[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bioData, linksData, skillData, projectData, testimonialData] = await Promise.all([
          fetchBio(),
          fetchSocialLinks(),
          fetchSkills(),
          fetchProjects(),
          fetchTestimonials()
        ]);
        setBio(bioData);
        setLinks(linksData);
        setSkills(skillData);
        setProjects(projectData);
        setTestimonials(testimonialData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;
  }

  if (!bio) {
    return <div className="p-6 text-center text-rose-500">Failed to load system information.</div>;
  }

  const getIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('github')) return <Code size={18} />;
    if (p.includes('linkedin')) return <Briefcase size={18} />;
    if (p.includes('instagram')) return <Camera size={18} />;
    if (p.includes('twitter') || p.includes('x')) return <MessageSquare size={18} />;
    if (p.includes('email') || p.includes('mail')) return <Mail size={18} />;
    return <LinkIcon size={18} />;
  };

  const normalizeList = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.flatMap(item => normalizeList(item));
    if (typeof value !== 'string') return [];
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return normalizeList(parsed);
    } catch {
      // Fallback to comma-separated values from RiRay Hub forms.
    }

    return trimmed.split(',').map(item => item.trim()).filter(Boolean);
  };

  const groupedSkills = skills.reduce<Record<string, TechStack[]>>((groups, skill) => {
    const category = skill.category || 'Tools';
    groups[category] = [...(groups[category] || []), skill];
    return groups;
  }, {});

  const orderedSkillGroups = Object.entries(groupedSkills).sort(([a], [b]) => a.localeCompare(b));

  const getProjectsUsingSkill = (skillName: string) => {
    const target = skillName.toLowerCase();
    return projects.filter(project => (
      normalizeList(project.tech_stack).some(tech => tech.toLowerCase() === target)
    ));
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide p-6 bg-white/80 dark:bg-slate-900/80">
      <div className="max-w-2xl mx-auto space-y-8 pb-10">
        
        {/* Header Profile */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          {bio.avatar_url ? (
            <img 
              src={bio.avatar_url} 
              alt={bio.name} 
              className="w-32 h-32 rounded-3xl object-cover shadow-xl border-4 border-white/50 dark:border-slate-800/50"
            />
          ) : (
            <div className="w-32 h-32 rounded-3xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-4xl font-bold shadow-xl border-4 border-white/50 dark:border-slate-800/50">
              {bio.name.charAt(0)}
            </div>
          )}
          
          <div className="space-y-2 mt-2">
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">{bio.name}</h1>
            <p className="text-lg text-indigo-600 dark:text-indigo-400 font-medium">{bio.tagline}</p>
            <div className="inline-flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-mono text-slate-500 dark:text-slate-400 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>System Online</span>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">About System</h2>
          <div 
            className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: bio.about || 'No description provided.' }}
          />
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 px-1">Network Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {links.map((link) => (
              <a 
                key={link.$id} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-md group"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                  {getIcon(link.platform)}
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">{link.platform}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate w-32 md:w-40">{link.username || link.url}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Skills Matrix */}
        {skills.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Layers3 size={18} className="accent-text" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Skills Matrix</h2>
            </div>

            <div className="space-y-6">
              {orderedSkillGroups.map(([category, categorySkills]) => (
                <section key={category} className="rounded-2xl border border-slate-200/50 bg-white/50 p-5 shadow-sm backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/50">
                  <h3 className="mb-4 text-xs font-black uppercase tracking-widest accent-text">{category}</h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {categorySkills.map(skill => {
                      const relatedProjects = getProjectsUsingSkill(skill.name);
                      const proficiency = Math.min(100, Math.max(0, Number(skill.proficiency) || 0));

                      return (
                        <div key={skill.$id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div>
                              <div className="font-bold text-slate-800 dark:text-slate-100">{skill.name}</div>
                              {relatedProjects.length > 0 && (
                                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                  Used in {relatedProjects.slice(0, 2).map(project => project.title).join(', ')}
                                  {relatedProjects.length > 2 ? ` +${relatedProjects.length - 2}` : ''}
                                </div>
                              )}
                            </div>
                            <span className="rounded-md accent-soft-bg px-2 py-1 text-xs font-black accent-text">{proficiency}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                            <div className="h-full accent-bg" style={{ width: `${proficiency}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Quote size={18} className="accent-text" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Testimonials</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {testimonials.map(testimonial => (
                <article key={testimonial.$id} className="rounded-2xl border border-slate-200/50 bg-white/60 p-5 shadow-sm backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/60">
                  <Quote size={22} className="mb-3 accent-text" />
                  <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">"{testimonial.content}"</p>
                  <div className="mt-5 flex items-center gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                    {testimonial.author_image ? (
                      <img src={testimonial.author_image} alt={testimonial.author_name} className="h-11 w-11 rounded-xl object-cover" />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl accent-soft-bg text-sm font-black accent-text">
                        {testimonial.author_name?.charAt(0) || 'T'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-sm font-black text-slate-800 dark:text-slate-100">{testimonial.author_name}</div>
                      <div className="truncate text-xs text-slate-500 dark:text-slate-400">{testimonial.author_role}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};
