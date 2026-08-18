import React, { useState } from 'react';
import { ArrowLeftRight, Scale, Check, Copy, Sparkles, Filter } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface ContrastViewerCardProps {
  content: string;
  title?: string;
}

export const ContrastViewerCard: React.FC<ContrastViewerCardProps> = ({
  content,
  title = 'Contrastes que a Prova Explora',
}) => {
  const [copied, setCopied] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  const handleCopyAll = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clean raw file origin traces
  const cleanedContent = content.replace(/Arquivo de origem:\s*[0-9a-zA-Z\s.,-]+\.md\s*/g, '').trim();

  return (
    <section className="my-6 space-y-4" aria-label={title}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800 shadow-2xs">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h3 className="m-0 text-sm font-bold text-slate-900">{title}</h3>
            <p className="m-0 text-xs text-slate-500">
              Matrizes comparativas, oposição semântica e armadilhas de fronteira entre conceitos
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyAll}
          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-900 shadow-2xs transition hover:bg-indigo-50"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" /> Copiado!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-indigo-600" /> Copiar Contrastes
            </>
          )}
        </button>
      </div>

      {/* Main Contrast Content with Enhanced Table & Markdown Styling */}
      <div className="contrast-content-wrapper rounded-2xl border border-indigo-100/90 bg-indigo-50/20 p-4 sm:p-5 shadow-2xs">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
          components={{
            table: ({ children }) => (
              <div className="my-4 overflow-hidden rounded-xl border border-indigo-200/80 bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-800 divide-y divide-indigo-100">
                    {children}
                  </table>
                </div>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gradient-to-r from-indigo-900 via-slate-900 to-teal-900 text-white uppercase tracking-wider text-[11px] font-bold">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="px-4 py-3 font-bold border-b border-indigo-800 text-white">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-3 border-b border-slate-100 leading-relaxed align-top">
                {children}
              </td>
            ),
            tr: ({ children }) => (
              <tr className="transition-colors hover:bg-indigo-50/40 odd:bg-white even:bg-slate-50/60">
                {children}
              </tr>
            ),
            strong: ({ children }) => (
              <strong className="font-bold text-indigo-950">{children}</strong>
            ),
            li: ({ children }) => (
              <li className="my-1.5 text-xs text-slate-800 leading-relaxed flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
                <span className="flex-1">{children}</span>
              </li>
            ),
            ul: ({ children }) => (
              <ul className="m-0 my-2 list-none p-0 space-y-1">{children}</ul>
            ),
          }}
        >
          {cleanedContent}
        </ReactMarkdown>
      </div>
    </section>
  );
};
