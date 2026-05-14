import React, { useEffect, useRef, useState } from 'react';
import { fetchBio, fetchProjects, fetchSkills, fetchSocialLinks } from '../../lib/api';
import type { Bio, Project, SocialLink, TechStack } from '../../types';

interface TerminalLine {
  id: string;
  content: React.ReactNode;
  muted?: boolean;
}

const PROMPT = 'ri-system@shiftos:~$';
const MIN_FONT_SIZE = 11;
const MAX_FONT_SIZE = 24;
const DEFAULT_FONT_SIZE = 14;

const createLine = (content: React.ReactNode, muted = false): TerminalLine => ({
  id: `${Date.now()}-${Math.random()}`,
  content,
  muted,
});

export const Terminal: React.FC = () => {
  const [skills, setSkills] = useState<TechStack[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [bio, setBio] = useState<Bio | null>(null);
  const [contacts, setContacts] = useState<SocialLink[]>([]);
  const [input, setInput] = useState('');
  const [fontSize, setFontSize] = useState(() => {
    const savedSize = Number(localStorage.getItem('shiftos_terminal_font_size'));
    return Number.isFinite(savedSize) ? Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, savedSize)) : DEFAULT_FONT_SIZE;
  });
  const [showZoomHint, setShowZoomHint] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lines, setLines] = useState<TerminalLine[]>([
    createLine('Booting RI terminal session...', true),
    createLine('Type "help" to list available commands.', true),
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTerminalData = async () => {
      try {
        const [skillData, projectData, bioData, contactData] = await Promise.all([
          fetchSkills(),
          fetchProjects(),
          fetchBio(),
          fetchSocialLinks(),
        ]);
        setSkills(skillData);
        setProjects(projectData);
        setBio(bioData);
        setContacts(contactData);
        setLines(prev => [...prev, createLine(`[OK] Loaded ${skillData.length} skills, ${projectData.length} projects, ${contactData.length} contacts.`, true)]);
      } catch {
        setLines(prev => [...prev, createLine('[FAIL] Failed to load terminal data.', true)]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = window.setTimeout(() => {
      void loadTerminalData();
    }, 500);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: 'end' });
  }, [lines]);

  useEffect(() => {
    const terminal = terminalRef.current;
    if (!terminal) return;

    let hintTimer: number | undefined;

    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;

      event.preventDefault();
      const direction = event.deltaY < 0 ? 1 : -1;
      setFontSize((currentSize) => {
        const nextSize = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, currentSize + direction));
        localStorage.setItem('shiftos_terminal_font_size', String(nextSize));
        return nextSize;
      });
      setShowZoomHint(true);
      window.clearTimeout(hintTimer);
      hintTimer = window.setTimeout(() => setShowZoomHint(false), 900);
    };

    terminal.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      terminal.removeEventListener('wheel', handleWheel);
      window.clearTimeout(hintTimer);
    };
  }, []);

  const renderHelp = () => (
    <div className="space-y-1">
      <div className="text-slate-400">Available commands:</div>
      <div><span className="text-cyan-300">help</span> - show this command list</div>
      <div><span className="text-cyan-300">about</span> - show profile summary</div>
      <div><span className="text-cyan-300">skills</span> - list tech stack modules</div>
      <div><span className="text-cyan-300">projects</span> - list published projects</div>
      <div><span className="text-cyan-300">contact</span> - show public contact links</div>
      <div><span className="text-cyan-300">clear</span> - clear terminal output</div>
    </div>
  );

  const renderAbout = () => (
    <div className="space-y-1">
      <div className="text-cyan-300 font-bold">{bio?.name || 'RI System'}</div>
      <div>{bio?.tagline || 'Portfolio operating environment.'}</div>
      {bio?.email && <div>Email: <span className="text-slate-300">{bio.email}</span></div>}
    </div>
  );

  const renderSkills = () => {
    if (skills.length === 0) return <div>No skill modules found.</div>;

    return (
      <div className="space-y-2">
        <div className="text-slate-400">--- SYSTEM SKILLS ALLOCATION ---</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {skills.map(skill => (
            <div key={skill.$id}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-300">{skill.name}</span>
                <span className="text-slate-500">[{skill.category}] {skill.proficiency}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${skill.proficiency}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    if (projects.length === 0) return <div>No projects found.</div>;

    return (
      <div className="space-y-1">
        {projects.slice(0, 12).map(project => (
          <div key={project.$id} className="flex flex-wrap gap-x-2">
            <span className="text-cyan-300">{project.title}</span>
            <span className="text-slate-500">[{project.category || 'Uncategorized'}]</span>
            <span className="text-amber-300">{project.status}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderContact = () => {
    const contactLines = [
      ...(bio?.email ? [{ $id: 'bio-email', platform: 'Email', username: bio.email, url: `mailto:${bio.email}`, order_index: -1 }] : []),
      ...contacts,
    ];

    if (contactLines.length === 0) return <div>No contact links found.</div>;

    return (
      <div className="space-y-1">
        {contactLines.map(contact => (
          <div key={contact.$id}>
            <span className="text-cyan-300">{contact.platform}</span>
            <span className="text-slate-500"> :: </span>
            <a href={contact.url} target="_blank" rel="noreferrer" className="text-emerald-300 hover:underline">
              {contact.username || contact.url}
            </a>
          </div>
        ))}
      </div>
    );
  };

  const runCommand = (rawCommand: string) => {
    const command = rawCommand.trim().toLowerCase();
    if (!command) return;

    if (command === 'clear') {
      setLines([]);
      return;
    }

    const output = (() => {
      switch (command) {
        case 'help': return renderHelp();
        case 'about': return renderAbout();
        case 'skills': return renderSkills();
        case 'projects': return renderProjects();
        case 'contact': return renderContact();
        default:
          return (
            <span>
              Command not found: <span className="text-rose-300">{rawCommand}</span>. Type <span className="text-cyan-300">help</span>.
            </span>
          );
      }
    })();

    setLines(prev => [
      ...prev,
      createLine(<><span className="text-emerald-500">{PROMPT}</span> {rawCommand}</>),
      createLine(output),
    ]);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading) return;
    runCommand(input);
    setInput('');
  };

  return (
    <div
      ref={terminalRef}
      className="h-full bg-slate-950 text-emerald-500 font-mono p-4 overflow-y-auto scrollbar-hide relative"
      style={{ fontSize }}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="space-y-2">
        {lines.map(line => (
          <div key={line.id} className={line.muted ? 'text-slate-500' : undefined}>
            {line.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex items-center">
        <span className="text-emerald-500 mr-2 shrink-0">{PROMPT}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={isLoading}
          className="min-w-0 flex-1 bg-transparent border-none outline-none text-emerald-300 disabled:opacity-60"
          autoFocus
          spellCheck={false}
        />
        <span className="w-2 h-4 bg-emerald-500 animate-pulse" />
      </form>
      {showZoomHint && (
        <div className="sticky bottom-2 ml-auto w-fit rounded-lg bg-slate-900/90 border border-emerald-500/30 px-3 py-1 text-xs text-emerald-300 shadow-lg">
          Zoom {fontSize}px
        </div>
      )}
      <div ref={scrollRef} />
    </div>
  );
};
