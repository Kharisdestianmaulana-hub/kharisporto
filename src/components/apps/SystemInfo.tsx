import React, { useEffect, useState } from 'react';
import { fetchBio, fetchSocialLinks } from '../../lib/api';
import type { Bio, SocialLink } from '../../types';
import { Code, Briefcase, Camera, MessageSquare, Mail, Link as LinkIcon, Loader2 } from 'lucide-react';

export const SystemInfo: React.FC = () => {
  const [bio, setBio] = useState<Bio | null>(null);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bioData, linksData] = await Promise.all([
          fetchBio(),
          fetchSocialLinks()
        ]);
        setBio(bioData);
        setLinks(linksData);
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
        
      </div>
    </div>
  );
};
