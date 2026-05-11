import React, { useEffect, useState } from 'react';
import { fetchServices } from '../../lib/api';
import type { Service } from '../../types';
import { Loader2, Star, CheckCircle } from 'lucide-react';

export const AppStore: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await fetchServices();
        setServices(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, []);

  return (
    <div className="h-full bg-slate-100 dark:bg-slate-900 overflow-y-auto scrollbar-hide">
      
      {/* Header Banner */}
      <div className="relative h-48 bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center px-8">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-white">
          <h1 className="text-3xl font-bold mb-2">Service Hub</h1>
          <p className="text-emerald-50">Professional services and integrations available for deployment.</p>
        </div>
      </div>

      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Featured Services</h2>
          <span className="text-sm text-slate-500">Updated recently</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-400" /></div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No active services available at the moment.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {services.map(service => (
              <div 
                key={service.$id} 
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow"
              >
                <div className="w-20 h-20 shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center border border-slate-300/50 dark:border-slate-600/50 shadow-inner">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{service.service_name}</h3>
                      <div className="flex items-center text-xs text-amber-500 mt-1">
                        <Star size={12} fill="currentColor" />
                        <Star size={12} fill="currentColor" />
                        <Star size={12} fill="currentColor" />
                        <Star size={12} fill="currentColor" />
                        <Star size={12} fill="currentColor" />
                        <span className="text-slate-500 dark:text-slate-400 ml-1">(Pro)</span>
                      </div>
                    </div>
                    <button className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-emerald-600 dark:text-emerald-400 font-semibold rounded-full text-sm flex items-center space-x-1 transition-colors">
                      <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(service.base_price))}</span>
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
