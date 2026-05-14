import React from 'react';

interface MarkdownViewerProps {
  title: string;
  content: string;
}

type MarkdownBlock =
  | { type: 'blank'; text: string }
  | { type: 'code'; text: string }
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'list'; text: string }
  | { type: 'paragraph'; text: string };

const renderInline = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="rounded bg-slate-200 px-1 py-0.5 text-[0.9em] dark:bg-slate-800">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};

const parseMarkdown = (content: string): MarkdownBlock[] => {
  const lines = content.trim() ? content.split(/\r?\n/) : ['No description provided.'];
  const blocks: MarkdownBlock[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  lines.forEach((line) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({ type: 'code', text: codeLines.join('\n') });
        codeLines = [];
      }
      inCodeBlock = !inCodeBlock;
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (!line.trim()) {
      blocks.push({ type: 'blank', text: '' });
      return;
    }

    if (line.startsWith('### ')) {
      blocks.push({ type: 'heading', level: 3, text: line.slice(4) });
      return;
    }

    if (line.startsWith('## ')) {
      blocks.push({ type: 'heading', level: 2, text: line.slice(3) });
      return;
    }

    if (line.startsWith('# ')) {
      blocks.push({ type: 'heading', level: 1, text: line.slice(2) });
      return;
    }

    if (line.startsWith('- ')) {
      blocks.push({ type: 'list', text: line.slice(2) });
      return;
    }

    blocks.push({ type: 'paragraph', text: line });
  });

  if (codeLines.length > 0) {
    blocks.push({ type: 'code', text: codeLines.join('\n') });
  }

  return blocks;
};

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ title, content }) => {
  const blocks = parseMarkdown(content);

  return (
    <div className="h-full overflow-y-auto bg-white p-8 text-slate-800 dark:bg-slate-950 dark:text-slate-200">
      <article className="mx-auto max-w-3xl">
        <div className="mb-8 border-b border-slate-200 pb-5 dark:border-slate-800">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-500">Markdown Preview</p>
          <h1 className="text-3xl font-black tracking-tight">{title}</h1>
        </div>

        <div className="space-y-3 text-sm leading-7">
          {blocks.map((block, index) => {
            if (block.type === 'code') {
              return (
                <pre key={index} className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
                  <code>{block.text}</code>
                </pre>
              );
            }

            if (block.type === 'blank') return <div key={index} className="h-2" />;
            if (block.type === 'heading' && block.level === 3) return <h3 key={index} className="pt-3 text-lg font-bold">{renderInline(block.text)}</h3>;
            if (block.type === 'heading' && block.level === 2) return <h2 key={index} className="pt-4 text-xl font-bold">{renderInline(block.text)}</h2>;
            if (block.type === 'heading' && block.level === 1) return <h1 key={index} className="pt-4 text-2xl font-black">{renderInline(block.text)}</h1>;
            if (block.type === 'list') return <p key={index} className="pl-4 before:mr-2 before:content-['-']">{renderInline(block.text)}</p>;

            return <p key={index}>{renderInline(block.text)}</p>;
          })}
        </div>
      </article>
    </div>
  );
};
