import React, { useEffect, useState } from 'react';
import { fetchExperiences } from '../../lib/api';
import type { Experience } from '../../types';
import { Loader2, Briefcase, GraduationCap, Award, Building, HeartHandshake, ArrowUpDown } from 'lucide-react';
import { cn } from '../../lib/utils';

type Category = 'All' | 'Work' | 'Education' | 'Certification' | 'Internship' | 'Volunteer';

const categories: Category[] = ['All', 'Work', 'Education', 'Certification', 'Internship', 'Volunteer'];

const getIconForType = (type: string) => {
  switch (type) {
    case 'Work': return <Briefcase size={20} className="text-orange-500" />;
    case 'Education': return <GraduationCap size={20} className="text-blue-500" />;
    case 'Certification': return <Award size={20} className="text-emerald-500" />;
    case 'Internship': return <Building size={20} className="text-purple-500" />;
    case 'Volunteer': return <HeartHandshake size={20} className="text-rose-500" />;
    default: return <Briefcase size={20} className="text-slate-500" />;
  }
};

export const ExperienceApp: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    const loadExperiences = async () => {
      try {
        const data = await fetchExperiences();
        setExperiences(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadExperiences();
  }, []);

  const filteredAndSortedExperiences = experiences
    .filter(exp => selectedCategory === 'All' || exp.type === selectedCategory)
    .sort((a, b) => {
      // Default to empty string if $createdAt is missing to prevent errors
      const dateA = new Date(a.$createdAt || 0).getTime();
      const dateB = new Date(b.$createdAt || 0).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto scrollbar-hide flex flex-col">
      {/* Header Banner */}
      <div className="shrink-0 relative h-32 bg-gradient-to-r from-orange-500 to-amber-500 flex items-center px-8">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-white">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Briefcase size={32} />
            Experience
          </h1>
          <p className="text-orange-50 font-medium">My Professional Journey</p>
        </div>
      </div>

      <div className="p-6 md:p-8 flex-1 flex flex-col">
        {/* Toolbar: Categories & Sort */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                  selectedCategory === cat
                    ? "bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900 dark:border-white"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            <ArrowUpDown size={16} />
            {sortOrder === 'desc' ? 'Newest Added' : 'Oldest Added'}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-slate-400 w-8 h-8" /></div>
        ) : filteredAndSortedExperiences.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
            <Briefcase size={48} className="mb-4 opacity-20" />
            <p>No experiences found in this category.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700/50 hidden md:block"></div>
            
            <div className="space-y-8">
              {filteredAndSortedExperiences.map((exp) => (
                <div key={exp.$id} className="relative flex flex-col md:flex-row gap-6">
                  {/* Timeline Dot & Icon */}
                  <div className="hidden md:flex shrink-0 w-12 flex-col items-center">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center shadow-sm z-10">
                      {getIconForType(exp.type)}
                    </div>
                  </div>
                  
                  {/* Card */}
                  <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="md:hidden">
                            {getIconForType(exp.type)}
                          </span>
                          <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100">{exp.role}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                          <span>{exp.company}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                          <span className="text-sm px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md">{exp.type}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-start md:items-end text-sm text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full mb-1">
                          {exp.period}
                        </span>
                        <span className="flex items-center gap-1">
                          {exp.address}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                      {exp.description}
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
