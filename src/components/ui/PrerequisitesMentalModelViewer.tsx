import React, { useMemo, useState } from 'react';
import { Brain, CheckCircle2, Copy, Check, GitBranch, Terminal, Sparkles, BookOpen, Layers } from 'lucide-react';
import { PedagogicalTreeDiagram, parseAsciiTree } from './PedagogicalTreeDiagram';
import { EnhancedCodeBlock } from './EnhancedCodeBlock';

interface PrerequisitesMentalModelViewerProps {
  content: string;
  title?: string;
}

interface ParsedSection {
  prerequisites: string[];
  codeBlocks: string[];
  notes: string[];
}

/**
 * Unflattens single-line ASCII trees that were collapsed during editorial generation.
 */
export const unflattenTreeSource = (raw: string): string => {
  return raw
    .replace(/\s+│\s+├──\s+/g, '\n│ ├── ')
    .replace(/\s+│\s+└──\s+/g, '\n│ └── ')
    .replace(/\s+│\s+│\s+├──\s+/g, '\n│ │ ├── ')
    .replace(/\s+│\s+│\s+└──\s+/g, '\n│ │ └── ')
    .replace(/\s+├──\s+/g, '\n├── ')
    .replace(/\s+└──\s+/g, '\n└── ')
    .replace(/\s+│\s+┌/g, '\n│ ┌')
    .replace(/\s+│\s+▼/g, '\n│ ▼')
    .replace(/\s+│\s+(\d+\.\s+[A-ZÀ-Ú])/g, '\n│\n└── $1');
};

const parsePrerequisitesAndModel = (content: string): ParsedSection => {
  const prerequisites: string[] = [];
  const codeBlocks: string[] = [];
  const notes: string[] = [];

  const lines = content.split(/\r?\n/);
  let inCode = false;
  let codeBuffer: string[] = [];

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      if (inCode) {
        const fullBlock = codeBuffer.join('\n').trim();
        if (fullBlock) {
          codeBlocks.push(unflattenTreeSource(fullBlock));
        }
        codeBuffer = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed || trimmed === '---') continue;

    // Check for bullet prerequisites
    if (/^-\s+/.test(trimmed)) {
      const cleanPrereq = trimmed.replace(/^-\s+/, '').trim();
      if (cleanPrereq.length > 0) {
        prerequisites.push(cleanPrereq);
      }
    } else if (/^\d+\.\s+/.test(trimmed)) {
      const cleanPrereq = trimmed.replace(/^\d+\.\s+/, '').trim();
      if (cleanPrereq.length > 0) {
        prerequisites.push(cleanPrereq);
      }
    } else if (!/^#+/.test(trimmed)) {
      notes.push(trimmed);
    }
  }

  if (inCode && codeBuffer.length > 0) {
    codeBlocks.push(unflattenTreeSource(codeBuffer.join('\n').trim()));
  }

  return { prerequisites, codeBlocks, notes };
};

export const PrerequisitesMentalModelViewer: React.FC<PrerequisitesMentalModelViewerProps> = ({
  content,
  title = 'Pré-requisitos e Modelo Mental',
}) => {
  const parsed = useMemo(() => parsePrerequisitesAndModel(content), [content]);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasTreeDiagram = parsed.codeBlocks.length > 0;

  return (
    <div className="my-5 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-200">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">
              {title.replace(/^\d+[\.\-\)]\s*/, '')}
            </h3>
            <p className="text-xs text-slate-500">
              Fundamentação conceitual, mapa relacional e pré-requisitos essenciais
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasTreeDiagram && (
            <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setViewMode('visual')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                  viewMode === 'visual'
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <GitBranch className="h-3.5 w-3.5" />
                <span>Visual</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('code')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                  viewMode === 'code'
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Texto / ASCII</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            title="Copiar conteúdo"
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-500" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prerequisites Section */}
      {parsed.prerequisites.length > 0 && (
        <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-900">
            <BookOpen className="h-4 w-4 text-teal-700" />
            <span>Pré-requisitos e Fundamentos Necessários</span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {parsed.prerequisites.map((prereq, idx) => {
              const colonIndex = prereq.indexOf(':');
              const hasPrefix = colonIndex > 0 && colonIndex < 40;
              const titlePart = hasPrefix ? prereq.slice(0, colonIndex) : null;
              const textPart = hasPrefix ? prereq.slice(colonIndex + 1).trim() : prereq;

              return (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 rounded-lg border border-teal-200/70 bg-white p-3 shadow-xs"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                  <div className="text-xs leading-relaxed text-slate-800">
                    {titlePart && (
                      <span className="font-bold text-teal-950 block mb-0.5">
                        {titlePart}
                      </span>
                    )}
                    <span>{textPart}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes / Guidance Text */}
      {parsed.notes.length > 0 && (
        <div className="space-y-2 text-sm leading-relaxed text-slate-700">
          {parsed.notes.map((note, idx) => (
            <p key={idx}>{note}</p>
          ))}
        </div>
      )}

      {/* Tree Diagram / ASCII Mental Model */}
      {parsed.codeBlocks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            <Layers className="h-4 w-4 text-teal-700" />
            <span>Mapa Estrutural e Árvore de Decisão</span>
          </div>

          {parsed.codeBlocks.map((block, idx) => {
            if (viewMode === 'visual') {
              return (
                <div key={idx} className="overflow-hidden rounded-xl">
                  <PedagogicalTreeDiagram source={block} />
                </div>
              );
            }
            return (
              <div key={idx} className="overflow-hidden rounded-xl">
                <EnhancedCodeBlock code={block} language="text" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
