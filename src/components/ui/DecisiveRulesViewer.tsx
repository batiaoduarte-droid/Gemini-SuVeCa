import React, { useMemo, useState } from 'react';
import { Scale, Search, Table as TableIcon, LayoutGrid, Copy, Check, ShieldCheck, Tag, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ResponsiveTable } from './ResponsiveTable';

interface DecisiveRulesViewerProps {
  content: string;
  title?: string;
}

interface RuleRow {
  id?: string;
  concept: string;
  category?: string;
  rule: string;
  diagnostic?: string;
  rawColumns: string[];
}

const parseMarkdownTable = (markdown: string): { headers: string[]; rows: RuleRow[] } | null => {
  const lines = markdown.split(/\r?\n/).map((l) => l.trim());
  const tableLines = lines.filter((l) => l.startsWith('|') && l.endsWith('|'));
  if (tableLines.length < 3) return null;

  const headerLine = tableLines[0];
  const headers = headerLine
    .slice(1, -1)
    .split('|')
    .map((h) => h.trim());

  const rows: RuleRow[] = [];
  for (let i = 2; i < tableLines.length; i++) {
    const rowLine = tableLines[i];
    const cells = rowLine
      .slice(1, -1)
      .split('|')
      .map((c) => c.trim());
    if (cells.length === 0 || cells.every((c) => !c)) continue;

    // Detect fields based on header names or column positions
    let id: string | undefined = undefined;
    let concept = '';
    let category: string | undefined = undefined;
    let rule = '';
    let diagnostic: string | undefined = undefined;

    // Check if first column is an ID (e.g. KB-..., DEF-01, REG-01)
    const firstCell = cells[0] || '';
    const isIdCol = /^[A-Z0-9_-]{2,15}$/i.test(firstCell) || headers[0].toLowerCase().includes('id');

    if (isIdCol) {
      id = firstCell;
      concept = cells[1] || '';
      rule = cells[2] || '';
      diagnostic = cells[3] || undefined;
    } else {
      concept = cells[0] || '';
      if (cells.length === 2) {
        rule = cells[1] || '';
      } else if (cells.length === 3) {
        category = cells[1] || undefined;
        rule = cells[2] || '';
      } else if (cells.length >= 4) {
        category = cells[1] || undefined;
        rule = cells[2] || '';
        diagnostic = cells[3] || undefined;
      }
    }

    rows.push({
      id,
      concept,
      category,
      rule,
      diagnostic,
      rawColumns: cells,
    });
  }

  return { headers, rows };
};

export const DecisiveRulesViewer: React.FC<DecisiveRulesViewerProps> = ({
  content,
  title = 'Regras Decisivas e Priorizadas',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [copied, setCopied] = useState(false);

  const parsedTable = useMemo(() => parseMarkdownTable(content), [content]);

  const filteredRows = useMemo(() => {
    if (!parsedTable) return [];
    if (!searchTerm.trim()) return parsedTable.rows;
    const term = searchTerm.toLowerCase();
    return parsedTable.rows.filter(
      (r) =>
        r.concept.toLowerCase().includes(term) ||
        (r.category && r.category.toLowerCase().includes(term)) ||
        r.rule.toLowerCase().includes(term) ||
        (r.diagnostic && r.diagnostic.toLowerCase().includes(term))
    );
  }, [parsedTable, searchTerm]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If not a parseable markdown table, render enriched markdown
  if (!parsedTable || parsedTable.rows.length === 0) {
    return (
      <div className="my-5 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-200">
              <Scale className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {title.replace(/^\d+[\.\-\)]\s*/, '')}
            </h3>
          </div>
        </div>
        <div className="prose prose-slate max-w-none text-sm leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  return (
    <div className="my-5 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-200">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">
              {title.replace(/^\d+[\.\-\)]\s*/, '')}
            </h3>
            <p className="text-xs text-slate-500">
              {parsedTable.rows.length} regras normativas e critérios de julgamento da banca
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Tabela</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            title="Copiar regras"
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

      {/* Filter / Search Bar */}
      {parsedTable.rows.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por conceito, classe ou critério diagnóstico..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredRows.map((row, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition-all hover:border-teal-300 hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-bold text-sm text-slate-900">
                    {row.concept}
                  </span>
                  {row.category && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      <Tag className="h-3 w-3 text-slate-400" />
                      {row.category}
                    </span>
                  )}
                </div>

                <p className="text-xs leading-relaxed text-slate-700 mb-2.5">
                  {row.rule}
                </p>
              </div>

              {row.diagnostic && (
                <div className="mt-2 rounded-lg border border-teal-100 bg-teal-50/50 p-2.5 text-xs text-teal-950">
                  <span className="font-bold block mb-0.5 text-teal-900">
                    Critério / Teste Diagnóstico:
                  </span>
                  <span className="leading-snug">{row.diagnostic}</span>
                </div>
              )}
            </div>
          ))}

          {filteredRows.length === 0 && (
            <div className="col-span-2 py-6 text-center text-xs text-slate-500">
              Nenhuma regra encontrada com o termo "{searchTerm}".
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <ResponsiveTable caption={title}>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {parsedTable.headers.map((h, i) => (
                  <th key={i} className="px-3 py-2.5 font-bold text-slate-700">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  {row.rawColumns.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2.5 text-slate-700 leading-relaxed">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </ResponsiveTable>
      )}
    </div>
  );
};
