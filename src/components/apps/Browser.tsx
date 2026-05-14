import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Home, Loader2, Globe, Tag, ExternalLink } from 'lucide-react';
import { fetchArticles } from '../../lib/api';
import type { Article } from '../../types';

export const Browser: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [inputUrl, setInputUrl] = useState('riray.hub/articles');

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const data = await fetchArticles();
        setArticles(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadArticles();
  }, []);

  const getArticleUrl = (article: Article) => {
    const slug = article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return `riray.hub/article/${slug}`;
  };

  const handleHome = () => {
    setCurrentArticle(null);
    setInputUrl('riray.hub/articles');
  };

  const handleBack = () => {
    if (currentArticle) {
      setCurrentArticle(null);
      setInputUrl('riray.hub/articles');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, form submit just resets if they type something else
    if (inputUrl === 'riray.hub/articles' || inputUrl === 'riray.hub') {
      setCurrentArticle(null);
      setInputUrl('riray.hub/articles');
    }
  };

  const openArticle = (article: Article) => {
    setCurrentArticle(article);
    setInputUrl(getArticleUrl(article));
  };

  const parseTags = (tagsStr: string) => {
    if (!tagsStr) return [];
    return tagsStr.split(',').map(t => t.trim()).filter(Boolean);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Browser Navigation Bar */}
      <div className="h-12 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 px-4 bg-slate-100 dark:bg-slate-950 shrink-0">
        <div className="flex shrink-0 items-center space-x-2 text-slate-500">
          <button 
            onClick={handleBack}
            disabled={!currentArticle}
            className={`p-1.5 rounded transition-colors ${currentArticle ? 'hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer' : 'opacity-50 cursor-default'}`}
          >
            <ChevronLeft size={16} />
          </button>
          <button className="p-1.5 rounded opacity-50 cursor-default"><ChevronRight size={16} /></button>
          <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"><RotateCw size={14} /></button>
          <button onClick={handleHome} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"><Home size={16} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="min-w-0 flex-1">
          <div className="relative flex w-full items-center">
            <Globe size={14} className="absolute left-3 text-slate-400" />
            <input 
              type="text" 
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>
        </form>
      </div>
      
      {/* Browser Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide relative bg-white dark:bg-slate-900">
        {loading ? (
          <div className="absolute inset-0 flex justify-center items-center">
            <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
          </div>
        ) : !currentArticle ? (
          /* List View (Articles Hub) */
          <div className="max-w-5xl mx-auto p-6 md:p-10">
            <div className="mb-10 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">Articles Hub</h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg">My latest writings, tutorials, and tech insights.</p>
            </div>

            {articles.length === 0 ? (
              <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                No published articles found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {articles.map(article => (
                  <div 
                    key={article.$id} 
                    onClick={() => openArticle(article)}
                    className="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    {/* Cover Image */}
                    <div className="w-full h-48 bg-slate-100 dark:bg-slate-900 overflow-hidden relative">
                      {article.cover_image ? (
                        <img 
                          src={article.cover_image} 
                          alt={article.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                          <Globe size={48} />
                        </div>
                      )}
                      
                      {/* Target Website Badge */}
                      {article.target_website && (
                        <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-xs font-semibold px-2 py-1 rounded-md text-slate-700 dark:text-slate-300 flex items-center shadow-sm">
                          <ExternalLink size={12} className="mr-1" />
                          {article.target_website}
                        </div>
                      )}
                    </div>
                    
                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-500 transition-colors">
                        {article.title}
                      </h2>
                      
                      <div className="mt-auto pt-4 flex flex-wrap gap-2">
                        {parseTags(article.tags).slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs font-medium px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md flex items-center">
                            <Tag size={10} className="mr-1 opacity-50" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Article Detail View */
          <div className="max-w-3xl mx-auto py-10 px-6 md:px-12 bg-white dark:bg-slate-900 min-h-full">
            {/* Meta Header */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {currentArticle.target_website && (
                  <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold px-3 py-1 rounded-full text-sm flex items-center">
                    <ExternalLink size={14} className="mr-1.5" />
                    Published on {currentArticle.target_website}
                  </span>
                )}
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {new Date(currentArticle.$createdAt || '').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
                {currentArticle.title}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {parseTags(currentArticle.tags).map((tag, i) => (
                  <span key={i} className="text-sm font-medium px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg flex items-center border border-slate-200 dark:border-slate-700">
                    <Tag size={12} className="mr-1.5 opacity-50" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Cover Image (if exists) */}
            {currentArticle.cover_image && (
              <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-12 shadow-md">
                <img 
                  src={currentArticle.cover_image} 
                  alt={currentArticle.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-slate dark:prose-invert max-w-none prose-lg">
              <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentArticle.content}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
