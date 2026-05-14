import React, { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, Clock3, Download, ExternalLink, FileText, HandCoins, Loader2, Mail, MessageCircle, RefreshCw, UsersRound } from 'lucide-react';
import { fetchActiveCVExports, fetchBio, fetchSocialLinks, getCVDownloadUrl } from '../../lib/api';
import type { Bio, CVExport, SocialLink } from '../../types';

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

const getWhatsappUrl = (links: SocialLink[]) => {
  const whatsapp = links.find(link => {
    const text = `${link.platform} ${link.url}`.toLowerCase();
    return text.includes('whatsapp') || text.includes('wa.me');
  });

  return whatsapp?.url || '';
};

export const CVDownloadApp: React.FC = () => {
  const [cvExports, setCvExports] = useState<CVExport[]>([]);
  const [bio, setBio] = useState<Bio | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCVExports = async () => {
    setLoading(true);
    try {
      const [cvData, bioData, linkData] = await Promise.all([
        fetchActiveCVExports(),
        fetchBio(),
        fetchSocialLinks(),
      ]);
      setCvExports(cvData);
      setBio(bioData);
      setSocialLinks(linkData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialCVExports = async () => {
      try {
        const [cvData, bioData, linkData] = await Promise.all([
          fetchActiveCVExports(),
          fetchBio(),
          fetchSocialLinks(),
        ]);
        if (isMounted) {
          setCvExports(cvData);
          setBio(bioData);
          setSocialLinks(linkData);
        }
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
  const primaryCV = downloadableCVs[0];
  const primaryDownloadUrl = getCVDownloadUrl(primaryCV?.file_id);
  const emailHref = bio?.email ? `mailto:${bio.email}?subject=Work%20Opportunity%20for%20Kharis%20Destian%20Maulana` : '';
  const whatsappUrl = getWhatsappUrl(socialLinks);

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
            <h1 className="text-3xl font-black md:text-4xl">Hire Me / Work With Me</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-200 md:text-base">
              Frontend, backend, game development, and mobile app work. HRD and collaborators can contact me or download my active CV here.
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
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-widest accent-text">Work With Me</p>
              <h2 className="text-2xl font-black">Available for HRD, internship, freelance, and collaboration opportunities.</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Saya terbuka untuk role frontend developer, backend developer, mobile app developer, game developer, dan project web/app berbasis React, Appwrite, maupun workflow custom.
              </p>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                  <BriefcaseBusiness size={18} className="mb-2 accent-text" />
                  <div className="text-xs font-bold uppercase text-slate-500">Target Role</div>
                  <div className="mt-1 text-sm font-bold">Frontend / Fullstack</div>
                </div>
                <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                  <Clock3 size={18} className="mb-2 accent-text" />
                  <div className="text-xs font-bold uppercase text-slate-500">Availability</div>
                  <div className="mt-1 text-sm font-bold">Open to discuss</div>
                </div>
                <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                  <UsersRound size={18} className="mb-2 accent-text" />
                  <div className="text-xs font-bold uppercase text-slate-500">Work Type</div>
                  <div className="mt-1 text-sm font-bold">Remote / Hybrid</div>
                </div>
                <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                  <HandCoins size={18} className="mb-2 accent-text" />
                  <div className="text-xs font-bold uppercase text-slate-500">Freelance Rate</div>
                  <div className="mt-1 text-sm font-bold">By project scope</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl accent-soft-bg p-5">
              <div>
                <h3 className="text-lg font-black">Fast Action</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Hubungi saya langsung atau download CV saya.
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {emailHref && (
                  <a href={emailHref} className="inline-flex items-center gap-2 rounded-xl accent-bg px-4 py-2 text-sm font-black text-white transition hover:opacity-90">
                    <Mail size={16} />
                    Email Me
                  </a>
                )}
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
                    <MessageCircle size={16} />
                    WhatsApp
                  </a>
                )}
                {primaryDownloadUrl && (
                  <a href={primaryDownloadUrl} download={primaryCV?.file_name} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
                    <Download size={16} />
                    Download CV
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

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
