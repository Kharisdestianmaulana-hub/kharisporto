import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Image as ImageIcon, Loader2, Search, X } from 'lucide-react';
import { fetchGalleryItems } from '../../lib/api';
import type { GalleryItem } from '../../types';
import { cn } from '../../lib/utils';

export const GalleryApp: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const data = await fetchGalleryItems();
        setItems(data);
      } catch (error) {
        console.error('Failed to load gallery:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGallery();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(items.map(item => item.category).filter(Boolean)));
    return ['All', ...uniqueCategories];
  }, [items]);

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const query = search.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(query) || item.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden flex flex-col">
      <div className="shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="px-6 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-fuchsia-500 text-white flex items-center justify-center">
                <ImageIcon size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-black">Gallery</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Screenshots, designs, certificates, and visual records.</p>
              </div>
            </div>
          </div>

          <div className="relative w-full lg:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search gallery..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500/40"
            />
          </div>
        </div>

        <div className="px-6 pb-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-1.5 text-sm font-bold transition-colors',
                selectedCategory === category
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-slate-400" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <ImageIcon size={52} className="mb-4 opacity-30" />
            <p className="font-semibold">No gallery items found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredItems.map(item => (
              <button
                key={item.$id}
                onClick={() => setPreview(item)}
                className="group text-left overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="relative aspect-video bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(event) => {
                      (event.currentTarget as HTMLImageElement).src = 'https://placehold.co/900x600/0f172a/94a3b8?text=Image+Unavailable';
                    }}
                  />
                  <span className="absolute top-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                    {item.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-black text-lg line-clamp-1">{item.title}</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Click to preview</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {preview && (
        <div className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-md flex flex-col">
          <div className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-white/10 text-white">
            <div className="min-w-0">
              <h2 className="font-bold truncate">{preview.title}</h2>
              <p className="text-xs text-slate-400">{preview.category}</p>
            </div>
            <div className="flex items-center gap-2">
              {(preview.link_url || preview.image_url) && (
                <a
                  href={preview.link_url || preview.image_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-bold hover:bg-white/20 transition-colors"
                >
                  <ExternalLink size={16} />
                  Open
                </a>
              )}
              <button
                onClick={() => setPreview(null)}
                className="rounded-lg bg-white/10 p-2 hover:bg-white/20 transition-colors"
                title="Close preview"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center p-6 overflow-auto">
            <img src={preview.image_url} alt={preview.title} className="max-h-full max-w-full object-contain rounded-xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
