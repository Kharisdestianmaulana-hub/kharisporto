import React, { useEffect, useMemo, useState } from 'react';
import { fetchBio, fetchSocialLinks } from '../../lib/api';
import type { Bio, SocialLink } from '../../types';
import { AtSign, Camera, Check, Code, Copy, ExternalLink, Loader2, Mail, MessageCircle, Phone, Send, UserRound } from 'lucide-react';
import { cn } from '../../lib/utils';

type ContactKind = 'email' | 'whatsapp' | 'phone' | 'github' | 'instagram' | 'link';

interface ContactItem {
  id: string;
  label: string;
  value: string;
  href: string;
  kind: ContactKind;
}

interface MailDraft {
  to: string;
  subject: string;
  message: string;
}

const getContactKind = (platform: string, url: string): ContactKind => {
  const text = `${platform} ${url}`.toLowerCase();
  if (text.includes('mail') || text.includes('email') || url.startsWith('mailto:')) return 'email';
  if (text.includes('whatsapp') || text.includes('wa.me')) return 'whatsapp';
  if (text.includes('phone') || text.includes('tel:') || text.includes('nomor') || text.includes('hp')) return 'phone';
  if (text.includes('github')) return 'github';
  if (text.includes('instagram')) return 'instagram';
  return 'link';
};

const cleanPhoneNumber = (value: string) => value.replace(/[^\d+]/g, '');

const getContactHref = (kind: ContactKind, url: string, value: string) => {
  if (kind === 'email') {
    const email = url.replace(/^mailto:/, '') || value;
    return `mailto:${email}`;
  }

  if (kind === 'whatsapp') {
    if (url.startsWith('http')) return url;
    const phone = cleanPhoneNumber(url || value).replace(/^\+/, '');
    return `https://wa.me/${phone}`;
  }

  if (kind === 'phone') {
    if (url.startsWith('tel:')) return url;
    return `tel:${cleanPhoneNumber(url || value)}`;
  }

  return url;
};

const getContactValue = (link: SocialLink) => {
  if (link.username) return link.username;
  if (link.url.startsWith('mailto:')) return link.url.replace(/^mailto:/, '');
  if (link.url.startsWith('tel:')) return link.url.replace(/^tel:/, '');
  return link.url;
};

const getIcon = (kind: ContactKind) => {
  switch (kind) {
    case 'email': return <Mail size={22} />;
    case 'whatsapp': return <MessageCircle size={22} />;
    case 'phone': return <Phone size={22} />;
    case 'github': return <Code size={22} />;
    case 'instagram': return <Camera size={22} />;
    default: return <AtSign size={22} />;
  }
};

const getColor = (kind: ContactKind) => {
  switch (kind) {
    case 'email': return 'bg-blue-500';
    case 'whatsapp': return 'bg-emerald-500';
    case 'phone': return 'bg-cyan-500';
    case 'github': return 'bg-slate-900 dark:bg-slate-700';
    case 'instagram': return 'bg-rose-500';
    default: return 'bg-violet-500';
  }
};

const createContacts = (bio: Bio | null, links: SocialLink[]): ContactItem[] => {
  const contacts = links.map((link) => {
    const kind = getContactKind(link.platform, link.url);
    const value = getContactValue(link);
    return {
      id: link.$id,
      label: link.platform,
      value,
      href: getContactHref(kind, link.url, value),
      kind,
    };
  });

  const hasEmail = contacts.some(contact => contact.kind === 'email');
  if (bio?.email && !hasEmail) {
    contacts.unshift({
      id: 'bio-email',
      label: 'Email',
      value: bio.email,
      href: `mailto:${bio.email}`,
      kind: 'email',
    });
  }

  return contacts;
};

export const ContactApp: React.FC = () => {
  const [bio, setBio] = useState<Bio | null>(null);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<MailDraft | null>(null);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const [bioData, linkData] = await Promise.all([fetchBio(), fetchSocialLinks()]);
        setBio(bioData);
        setLinks(linkData);
      } catch (error) {
        console.error('Failed to load contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  const contacts = useMemo(() => createContacts(bio, links), [bio, links]);

  const copyValue = async (contact: ContactItem) => {
    await navigator.clipboard.writeText(contact.value.replace(/^@/, ''));
    setCopiedId(contact.id);
    window.setTimeout(() => setCopiedId(null), 1400);
  };

  const openEmailComposer = (contact: ContactItem) => {
    setDraft({
      to: contact.href.replace(/^mailto:/, ''),
      subject: '',
      message: '',
    });
  };

  const sendMail = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft) return;

    const params = new URLSearchParams();
    if (draft.subject.trim()) params.set('subject', draft.subject.trim());
    if (draft.message.trim()) params.set('body', draft.message.trim());

    window.location.href = `mailto:${draft.to}?${params.toString()}`;
  };

  const openContact = (contact: ContactItem) => {
    if (contact.kind === 'email') {
      openEmailComposer(contact);
      return;
    }

    window.open(contact.href, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="h-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {loading ? (
        <div className="h-full flex items-center justify-center">
          <Loader2 className="animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="h-full flex flex-col md:flex-row">
          <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-6">
            <div className="flex items-center gap-4">
              {bio?.avatar_url ? (
                <img src={bio.avatar_url} alt={bio.name} className="h-16 w-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700" />
              ) : (
                <div className="h-16 w-16 rounded-2xl accent-bg text-white flex items-center justify-center">
                  <UserRound size={30} />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="font-black text-lg truncate">{bio?.name || 'Contact'}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{bio?.tagline || 'Available for contact'}</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border accent-border accent-soft-bg p-4">
              <p className="text-xs font-bold uppercase tracking-widest accent-text mb-2">Mail Client</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Select a contact method, then send a message or open the linked profile.
              </p>
            </div>
          </aside>

          <main className="flex-1 min-w-0 overflow-y-auto p-6 md:p-8">
            {draft ? (
              <form onSubmit={sendMail} className="mx-auto max-w-2xl">
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest accent-text mb-2">New Message</p>
                  <h1 className="text-3xl font-black">Compose Email</h1>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <div className="grid grid-cols-[72px_1fr] border-b border-slate-200 dark:border-slate-800">
                    <label className="px-4 py-3 text-sm font-bold text-slate-500">To</label>
                    <input value={draft.to} readOnly className="min-w-0 bg-transparent px-4 py-3 text-sm outline-none" />
                  </div>
                  <div className="grid grid-cols-[72px_1fr] border-b border-slate-200 dark:border-slate-800">
                    <label className="px-4 py-3 text-sm font-bold text-slate-500">Subject</label>
                    <input
                      value={draft.subject}
                      onChange={(event) => setDraft({ ...draft, subject: event.target.value })}
                      className="min-w-0 bg-transparent px-4 py-3 text-sm outline-none"
                      placeholder="Project inquiry, collaboration, or hello"
                    />
                  </div>
                  <textarea
                    value={draft.message}
                    onChange={(event) => setDraft({ ...draft, message: event.target.value })}
                    className="h-64 w-full resize-none bg-transparent p-4 text-sm outline-none"
                    placeholder="Write your message..."
                  />
                </div>

                <div className="mt-5 flex justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setDraft(null)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl accent-bg px-5 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  >
                    <Send size={16} />
                    Send with Email App
                  </button>
                </div>
              </form>
            ) : (
              <div className="mx-auto max-w-4xl">
                <div className="mb-8">
                  <p className="text-xs font-bold uppercase tracking-widest accent-text mb-2">Address Book</p>
                  <h1 className="text-3xl font-black">Contacts</h1>
                </div>

                {contacts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center text-slate-500">
                    No contact links found.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn('h-12 w-12 shrink-0 rounded-xl text-white flex items-center justify-center', getColor(contact.kind))}>
                            {getIcon(contact.kind)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-black truncate">{contact.label}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{contact.value}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => openContact(contact)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white px-4 py-2 text-sm font-bold text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
                          >
                            {contact.kind === 'email' ? <Mail size={16} /> : <ExternalLink size={16} />}
                            {contact.kind === 'email' ? 'Write Email' : contact.kind === 'whatsapp' ? 'Open WhatsApp' : 'Open'}
                          </button>
                          {(contact.kind === 'whatsapp' || contact.kind === 'phone') && (
                            <button
                              onClick={() => copyValue(contact)}
                              className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Copy number"
                            >
                              {copiedId === contact.id ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};
