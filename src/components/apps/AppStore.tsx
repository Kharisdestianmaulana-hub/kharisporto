import React, { useEffect, useMemo, useState } from 'react';
import { fetchServices } from '../../lib/api';
import type { Service } from '../../types';
import { CheckCircle2, Code2, Database, Layers, Loader2, MonitorSmartphone, Palette, Rocket, Search, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ServiceCatalogItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  timeline: string;
  deliverables: string[];
  icon: React.ReactNode;
  accent: string;
}

const serviceCatalog: ServiceCatalogItem[] = [
  {
    id: 'portfolio',
    name: 'Website Portfolio',
    category: 'Website',
    description: 'Personal portfolio with responsive pages, project showcase, and contact flow.',
    price: 'Start from Rp750K',
    timeline: '5-10 days',
    deliverables: ['Responsive layout', 'Project section', 'Contact links/form', 'Deployment support'],
    icon: <MonitorSmartphone size={28} />,
    accent: 'bg-blue-500',
  },
  {
    id: 'landing-page',
    name: 'Landing Page',
    category: 'Website',
    description: 'Single-page landing for product, event, campaign, or profile with focused conversion.',
    price: 'Start from Rp500K',
    timeline: '3-7 days',
    deliverables: ['Hero section', 'Feature blocks', 'CTA section', 'Basic SEO metadata'],
    icon: <Rocket size={28} />,
    accent: 'bg-emerald-500',
  },
  {
    id: 'mobile-prototype',
    name: 'Mobile App Prototype',
    category: 'Prototype',
    description: 'Clickable app prototype or frontend starter for early product validation.',
    price: 'Start from Rp1.2M',
    timeline: '7-14 days',
    deliverables: ['Screen flow', 'Reusable UI components', 'Navigation prototype', 'Responsive preview'],
    icon: <Layers size={28} />,
    accent: 'bg-orange-500',
  },
  {
    id: 'backend-appwrite-mysql',
    name: 'Backend Setup: MySQL + Appwrite',
    category: 'Backend',
    description: 'Basic backend setup for authentication, database structure, storage, and admin-ready content flows.',
    price: 'Start from Rp900K',
    timeline: '5-12 days',
    deliverables: ['MySQL schema planning', 'Appwrite collections/storage', 'CRUD integration', 'Environment setup notes'],
    icon: <Database size={28} />,
    accent: 'bg-cyan-500',
  },
  {
    id: 'ui-redesign',
    name: 'UI Redesign',
    category: 'Design',
    description: 'Refresh an existing interface so it feels cleaner, easier to scan, and more consistent.',
    price: 'Start from Rp650K',
    timeline: '4-9 days',
    deliverables: ['Visual audit', 'Updated layout', 'Component styling', 'Responsive polish'],
    icon: <Palette size={28} />,
    accent: 'bg-fuchsia-500',
  },
];

const formatCurrency = (value: string) => {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return value;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(numberValue);
};

export const AppStore: React.FC = () => {
  const [cmsServices, setCmsServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await fetchServices();
        setCmsServices(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, []);

  const categories = useMemo(() => ['All', ...Array.from(new Set(serviceCatalog.map(service => service.category)))], []);

  const filteredServices = serviceCatalog.filter(service => {
    const query = search.toLowerCase();
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(query) || service.description.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-full bg-slate-100 dark:bg-slate-950 overflow-y-auto scrollbar-hide text-slate-900 dark:text-slate-100">
      <div className="relative min-h-48 bg-slate-950 flex items-center px-6 md:px-8 py-8 overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(circle at 20% 20%, var(--shift-accent), transparent 34%), radial-gradient(circle at 80% 10%, #10b981, transparent 28%)' }} />
        <div className="relative z-10 text-white max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles size={14} />
            Service Catalog
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-2">App Store</h1>
          <p className="text-slate-200 leading-relaxed">Practical digital services for portfolios, landing pages, app prototypes, backend setup, and UI redesign.</p>
        </div>
      </div>

      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-black">Available Services</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Price and timeline can be adjusted after scope discussion.</p>
          </div>
          <div className="relative w-full lg:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search services..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 accent-ring"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-1.5 text-sm font-bold transition-colors',
                selectedCategory === category
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800'
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filteredServices.map(service => (
            <div key={service.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex gap-4">
                <div className={cn('h-14 w-14 shrink-0 rounded-2xl text-white flex items-center justify-center', service.accent)}>
                  {service.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h3 className="font-black text-lg">{service.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{service.description}</p>
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <div className="font-black text-emerald-600 dark:text-emerald-400">{service.price}</div>
                      <div className="text-xs text-slate-500 mt-1">{service.timeline}</div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {service.deliverables.map(deliverable => (
                      <div key={deliverable} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                        <span>{deliverable}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="mt-8 flex justify-center py-8"><Loader2 className="animate-spin text-slate-400" /></div>
        ) : cmsServices.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <Code2 size={20} className="text-slate-500" />
              <h2 className="text-lg font-black">CMS Featured Services</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {cmsServices.map(service => (
                <div key={service.$id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                  <div className="flex justify-between gap-4">
                    <div>
                      <h3 className="font-bold">{service.service_name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{service.description}</p>
                    </div>
                    <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 shrink-0">{formatCurrency(service.base_price)}</div>
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
