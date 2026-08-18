import React, { useState, useMemo } from 'react';
import { GitBranch, LayoutGrid, ListTree, Copy, Check, Maximize2, Minimize2, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { ModalShell } from './ModalShell';
import { linearizeMap } from './ConnectionMap';

interface PedagogicalTreeDiagramProps {
  source: string;
}

interface TreeItem {
  id: string;
  label: string;
  badge?: string;
  detail?: string;
  examples?: string[];
  subItems?: TreeItem[];
}

interface CategoryGroup {
  id: string;
  title: string;
  badge?: string;
  items: TreeItem[];
}

// Clean and normalize tree line
const cleanLine = (raw: string) =>
  raw.replace(/[│┌┐└├┬┴─═\s]+$/u, '').replace(/^[│┌┐└├┬┴─═\s]+/u, '').trim();

export const parseAsciiTree = (source: string): { title: string; groups: CategoryGroup[]; raw: string } => {
  const normalized = source.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return { title: 'Esquema Gramatical', groups: [], raw: source };

  // Check if first line contains title
  let title = 'Esquema Gramatical';
  let startIndex = 0;

  const firstLineClean = cleanLine(lines[0]);
  if (firstLineClean.length > 3 && !firstLineClean.startsWith('├──') && !firstLineClean.startsWith('└──')) {
    title = firstLineClean.replace(/[│┌┐└├┬┴─═\s▼▲]+/gu, ' ').trim();
    startIndex = 1;
  }

  const groups: CategoryGroup[] = [];
  let currentGroup: CategoryGroup | null = null;

  // Check if the source contains multiple column headers on a single line (e.g. ENCONTROS VOCÁLICOS RELAÇÃO LETRA/FONEMA DIVISÃO SILÁBICA)
  const columnMatch = source.match(/([A-ZÀ-Ú\s"\/]{4,}(?:VOCÁLICOS|FONEMA|SILÁBICA|"X"|SÍLABA|CONSONANTAIS|FUNDAMENTOS|SUBCLASSES|ORAÇÕES|REGRAS)[A-ZÀ-Ú\s"\/]*)/g);

  // Pre-expand lines if multiple tree items are chained on one line
  const expandedLines: string[] = [];
  for (let i = startIndex; i < lines.length; i++) {
    const rawLine = lines[i];
    // Split by tree branches if condensed
    const branchSplits = rawLine.split(/(?=[├└][─-]|(?<=[\]\)])\s+(?=[A-ZÀ-Ú0-9]{3,}))/u);
    if (branchSplits.length > 1) {
      expandedLines.push(...branchSplits);
    } else {
      expandedLines.push(rawLine);
    }
  }

  for (let i = 0; i < expandedLines.length; i++) {
    const rawLine = expandedLines[i];
    const text = cleanLine(rawLine);
    if (!text || text === '│' || text === '──' || text === '▼' || text === '▲') continue;

    // Detect major categories (e.g., "1. Fundamentos", "ENCONTROS VOCÁLICOS", "RELAÇÃO LETRA/FONEMA", "DIVISÃO SILÁBICA", "POLIFONIA DO "X"")
    const isMajorCategory =
      /^(?:\d+\.|\b(?:[A-Z0-9]{1,4}\b|\bGrupo|\bBloco|\bParte|\bMnemônico|\bCategoria)\b|[A-ZÀ-Ú\s"\/]{4,}:?)/i.test(text) &&
      !text.includes('("') &&
      !text.startsWith('Exemplo') &&
      !text.startsWith('Função') &&
      (text.length < 50 || /^[A-ZÀ-Ú\s"\/0-9.-]{4,}$/.test(text));

    if (isMajorCategory && !text.includes('=')) {
      // Extract optional badge from parentheses
      const badgeMatch = text.match(/\(([^)]+)\)/);
      const cleanTitle = text.replace(/\([^)]+\)/, '').replace(/[│┌┐└├┬┴─═\s▼▲]+/gu, ' ').trim();

      if (cleanTitle.length > 2) {
        currentGroup = {
          id: `group-${groups.length + 1}`,
          title: cleanTitle,
          badge: badgeMatch ? badgeMatch[1] : undefined,
          items: [],
        };
        groups.push(currentGroup);
        continue;
      }
    }

    // Otherwise, it's an item in the current group or default group
    if (!currentGroup) {
      currentGroup = {
        id: 'group-default',
        title: 'Pontos e Regras',
        items: [],
      };
      groups.push(currentGroup);
    }

    // Parse item: key vs definition (e.g., "Hiato (V-V): Separados em sílabas distintas [ma-te-ri-al]")
    const colonIndex = text.indexOf(':');
    let label = text;
    let detail = '';
    let badge: string | undefined = undefined;

    if (colonIndex > 0 && colonIndex < 45) {
      label = text.slice(0, colonIndex).trim();
      detail = text.slice(colonIndex + 1).trim();

      // Check for badge like (V-V) or (-1 fonema) or (1L = 2F)
      const badgeMatch = label.match(/\(([^)]+)\)/);
      if (badgeMatch) {
        badge = badgeMatch[1];
        label = label.replace(/\([^)]+\)/, '').trim();
      }
    } else {
      // Look for parenthesized formulas at end
      const badgeMatch = text.match(/\(([^)]+)\)$/);
      if (badgeMatch) {
        badge = badgeMatch[1];
        label = text.replace(/\(([^)]+)\)$/, '').trim();
      }
    }

    // Extract example brackets like [at-mos-fe-ra, co-lap-so]
    const exampleMatch = detail.match(/\[(.*?)\]/);
    let examples: string[] | undefined = undefined;
    if (exampleMatch) {
      examples = exampleMatch[1].split(',').map((e) => e.trim());
    }

    if (label.length > 1) {
      currentGroup.items.push({
        id: `item-${currentGroup.items.length + 1}-${i}`,
        label: label.replace(/[│┌┐└├┬┴─═▼▲]+/gu, ' ').trim(),
        badge,
        detail: detail ? detail.replace(/[│┌┐└├┬┴─═▼▲]+/gu, ' ').trim() : undefined,
        examples,
      });
    }
  }

  // If no groups were parsed, extract lines as items in fallback group
  if (groups.length === 0) {
    const rawSegments = source
      .split(/\r?\n/)
      .map((l) => cleanLine(l))
      .filter((l) => l.length > 2);

    const fallbackGroup: CategoryGroup = {
      id: 'group-fallback',
      title: title || 'Estrutura Canônica',
      items: rawSegments.map((seg, idx) => ({
        id: `fb-${idx}`,
        label: seg,
      })),
    };
    groups.push(fallbackGroup);
  }

  return { title, groups, raw: source };
};

export const PedagogicalTreeDiagram: React.FC<PedagogicalTreeDiagramProps> = ({ source }) => {
  const [viewMode, setViewMode] = useState<'cards' | 'tree' | 'raw'>('cards');
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set());

  const parsed = useMemo(() => parseAsciiTree(source), [source]);
  const nodes = useMemo(() => linearizeMap(source), [source]);

  const handleCopy = () => {
    navigator.clipboard.writeText(source);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="pedagogical-tree-diagram my-6 overflow-hidden rounded-2xl border border-teal-200/90 bg-white shadow-xs">
      {/* Lista acessível para leitores de tela e testes */}
      <ol className="sr-only" aria-label="Versão linear do mapa de conexões">
        {nodes.map((node, index) => (
          <li key={index}>{node}</li>
        ))}
      </ol>
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-100 bg-gradient-to-r from-teal-950 via-slate-900 to-teal-900 px-4 py-3 text-white sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="m-0 text-sm font-bold tracking-tight sm:text-base text-white">
              {parsed.title}
            </h3>
            <p className="m-0 text-xs text-teal-200/80">
              Esquema estruturado de regras e relações sintáticas
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Switch de Visualização */}
          <div className="flex rounded-lg bg-white/10 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 transition ${
                viewMode === 'cards' ? 'bg-white text-teal-950 shadow-xs' : 'text-teal-100 hover:text-white'
              }`}
              title="Visualização em Cards Didáticos"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 transition ${
                viewMode === 'tree' ? 'bg-white text-teal-950 shadow-xs' : 'text-teal-100 hover:text-white'
              }`}
              title="Visualização em Árvore"
            >
              <ListTree className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Árvore</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('raw')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 transition ${
                viewMode === 'raw' ? 'bg-white text-teal-950 shadow-xs' : 'text-teal-100 hover:text-white'
              }`}
              title="Visualização em Texto / Código"
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Original</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-teal-400/30 bg-teal-800/40 px-2.5 py-1.5 text-xs font-medium text-teal-100 transition hover:bg-teal-700/50 hover:text-white"
            title="Copiar esquema"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 rounded-lg border border-teal-400/30 bg-teal-800/40 px-2 py-1.5 text-xs font-medium text-teal-100 transition hover:bg-teal-700/50 hover:text-white"
            title="Expandir em tela cheia"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="p-4 sm:p-6">
        {viewMode === 'cards' && (
          <div className="space-y-4">
            {parsed.groups.map((group, gIdx) => (
              <div
                key={group.id}
                className="overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/50 transition hover:border-teal-200"
              >
                {/* Header do Grupo */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 bg-white px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-100 text-xs font-bold text-teal-800">
                      {gIdx + 1}
                    </span>
                    <h4 className="m-0 text-sm font-bold text-slate-900">
                      {group.title}
                    </h4>
                  </div>
                  {group.badge && (
                    <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
                      {group.badge}
                    </span>
                  )}
                </div>

                {/* Itens do Grupo em Grid */}
                <div className="grid gap-2.5 p-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs hover:border-teal-300"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="text-xs font-bold text-teal-950">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.detail && (
                          <p className="m-0 mt-1.5 text-xs leading-relaxed text-slate-600">
                            {item.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'tree' && (
          <div className="rounded-xl border border-teal-100 bg-teal-50/20 p-4">
            <div className="mb-3 flex items-center gap-2 font-bold text-sm text-teal-950">
              <ListTree className="h-4 w-4 text-teal-700" />
              <span>Hierarquia Visual</span>
            </div>

            <div className="space-y-3">
              {parsed.groups.map((group) => {
                const isExpanded = expandedGroups.has(group.id) || expandedGroups.size === 0;
                return (
                  <div key={group.id} className="rounded-lg border border-slate-200 bg-white p-3">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      className="flex w-full items-center justify-between text-left font-bold text-xs text-slate-900 hover:text-teal-700"
                    >
                      <span className="flex items-center gap-1.5">
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-teal-600" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                        {group.title}
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        {group.items.length} itens
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 ml-4 space-y-1.5 border-l-2 border-teal-200 pl-3">
                        {group.items.map((item) => (
                          <div key={item.id} className="text-xs text-slate-700">
                            <span className="font-semibold text-teal-900">• {item.label}</span>
                            {item.detail && <span className="text-slate-600">: {item.detail}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'raw' && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-900 p-4 text-xs font-mono text-emerald-400 shadow-inner">
            <pre className="m-0 leading-relaxed whitespace-pre font-mono">
              <code>{source}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Modal de Tela Cheia */}
      <ModalShell
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={parsed.title}
        maxWidth="max-w-5xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs text-slate-500">Visualização completa em alta resolução</span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-900 p-5 text-xs font-mono text-emerald-300 leading-relaxed">
            <pre className="m-0 whitespace-pre">
              <code>{source}</code>
            </pre>
          </div>
        </div>
      </ModalShell>
    </div>
  );
};
