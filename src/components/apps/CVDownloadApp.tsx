import React, { useEffect, useMemo, useState } from 'react';
import { Download, ExternalLink, FileText, Loader2, RefreshCw } from 'lucide-react';
import { fetchActiveCVExports, getCVDownloadUrl } from '../../lib/api';
import type { CVExport } from '../../types';

const formatDate = (value?: string) => {
  if (!value) return 'Recently updated';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

const getTemplateLabel = (value?: string) => {
  switch (value) {
    case 'indonesia-standard':
      return 'Indonesia Standard';
    case 'ats-international':
      return 'ATS International';
    case 'custom':
      return 'Custom';
    default:
      return value || 'General CV';
  }
};

export const CVDownloadApp: React.FC = () => {
  const [cvExports, setCvExports] = useState<CVExport[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCVExports = async () => {
    setLoading(true);
    try {
      const data = await fetchActiveCVExports();
      setCvExports(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialCVExports = async () => {
      try {
        const data = await fetchActiveCVExports();
        if (isMounted) setCvExports(data);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadInitialCVExports();

    return () => {
      isMounted = false;
    };
  }, []);

  const downloadableCVs = useMemo(
    () => cvExports.filter(cv => Boolean(cv.file_id)),
    [cvExports]
  );

  return (
    <div className="h-full overflow-y-auto scrollbar-hide bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="relative overflow-hidden bg-slate-950 px-6 py-8 md:px-8">
        <div className="absolute inset-0 opacity-45" style={{ background: 'radial-gradient(circle at 15% 20%, var(--shift-accent), transparent 32%), radial-gradient(circle at 85% 0%, #10b981, transparent 28%)' }} />
        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl text-white">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest">
              <FileText size={14} />
              Public Resume
            </div>
            <h1 className="text-3xl font-black md:text-4xl">Download CV</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-200 md:text-base">
              Active CV files are published from RiRay Hub and served directly from Appwrite Storage.
            </p>
          </div>
          <button
            onClick={() => void refreshCVExports()}
            disabled={loading}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-900 shadow-lg transition hover:bg-slate-100 disabled:opacity-70"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Refresh
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl p-6 md:p-8">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-slate-400" size={32} />
          </div>
        ) : downloadableCVs.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center dark:border-slate-700 dark:bg-slate-900/70">
            <FileText size={42} className="mb-4 text-slate-400" />
            <h2 className="text-xl font-black">No active CV available</h2>
            <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Publish an active CV from RiRay Hub first, then refresh this window.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {downloadableCVs.map(cv => {
              const downloadUrl = getCVDownloadUrl(cv.file_id);

              return (
                <article key={cv.$id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: 'var(--shift-accent)' }}>
                      <FileText size={28} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-xl font-black">{cv.title || cv.file_name || 'Curriculum Vitae'}</h2>
                      <p className="mt-1 truncate text-xs font-medium text-slate-500 dark:text-slate-400">{cv.file_name || 'PDF document'}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full accent-soft-bg px-3 py-1 text-xs font-bold accent-text">
                      {getTemplateLabel(cv.template)}
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {cv.region || 'Global'}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {formatDate(cv.$updatedAt || cv.$createdAt)}
                    </span>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                    {downloadUrl && (
                      <>
                        <a
                          href={downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                          <ExternalLink size={16} />
                          Open
                        </a>
                        <a
                          href={downloadUrl}
                          download={cv.file_name}
                          className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
                          style={{ backgroundColor: 'var(--shift-accent)' }}
                        >
                          <Download size={16} />
                          Download
                        </a>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
