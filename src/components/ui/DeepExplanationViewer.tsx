import React, { useState } from 'react';
import { BookOpenCheck, Copy, Check, Sparkles, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ResponsiveTable } from './ResponsiveTable';
import { ConnectionMap, looksLikeConnectionMap } from './ConnectionMap';
import { EnhancedCodeBlock } from './EnhancedCodeBlock';
import { PedagogicalCallout } from './PedagogicalCallout';

interface DeepExplanationViewerProps {
  content: string;
  title?: string;
}

const extractCodeSource = (children: React.ReactNode) => {
  const child = React.Children.toArray(children)[0];
  if (!React.isValidElement<{ children?: React.ReactNode }>(child)) return null;
  return String(child.props.children || '').replace(/\n$/, '');
};

export const DeepExplanationViewer: React.FC<DeepExplanationViewerProps> = ({
  content,
  title = 'Explicação Didática Aprofundada',
}) => {
  const [copied, setCopied] = useState(false);

  // Clean raw file origin traces and empty link artifacts
  const cleanedContent = content
    .replace(/Arquivo de origem:\s*[0-9a-zA-Z\s.,-]+\.md\s*/g, '')
    .replace(/-\s*Distingue-se de:\s*\(\s*([^)]+)\s*\)/g, '- **Diferenciação Crítica:** $1')
    .replace(/-\s*Possui dica:\s*\(\s*([^)]+)\s*\)/g, '- **Dica Prática:** $1')
    .trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let tableNumber = 0;

  return (
    <section className="my-6 space-y-4" aria-label={title}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-800 shadow-2xs">
            <BookOpenCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="m-0 text-sm font-bold text-slate-900">{title}</h3>
            <p className="m-0 text-xs text-slate-500">
              Fundamentação gramatical completa, mecanismos de prova e aplicações normativas
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-900 shadow-2xs transition hover:bg-teal-50"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" /> Copiado!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-teal-700" /> Copiar Texto
            </>
          )}
        </button>
      </div>

      {/* Main Formatted Document Container */}
      <div className="deep-explanation-body rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs space-y-4 leading-relaxed text-slate-800 text-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
          components={{
            h3: ({ children }) => (
              <h3 className="mt-6 mb-2 flex items-center gap-2 text-base font-bold text-teal-950 border-b border-teal-100/70 pb-1.5">
                <span className="h-2 w-2 rounded-full bg-teal-600" />
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="mt-4 mb-1.5 text-sm font-bold text-slate-900">
                {children}
              </h4>
            ),
            p: ({ children }) => (
              <p className="my-2.5 leading-relaxed text-slate-700">{children}</p>
            ),
            table: ({ children }) => {
              tableNumber += 1;
              return (
                <ResponsiveTable caption={`Tabela ${tableNumber} — Explicação didática`}>
                  {children}
                </ResponsiveTable>
              );
            },
            pre: ({ children }) => {
              const source = extractCodeSource(children);
              if (source !== null && looksLikeConnectionMap(source)) {
                return <ConnectionMap source={source} />;
              }
              if (source !== null) return <EnhancedCodeBlock code={source} />;
              return (
                <div className="my-4 min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                  <pre className="overflow-x-auto"><code>{children}</code></pre>
                </div>
              );
            },
            code: ({ children, className: codeClassName }) => (
              <code className={`rounded bg-teal-50 px-1.5 py-0.5 font-mono text-xs font-semibold text-teal-900 border border-teal-100 ${codeClassName || ''}`}>
                {children}
              </code>
            ),
            blockquote: ({ children }) => <PedagogicalCallout>{children}</PedagogicalCallout>,
            li: ({ children }) => (
              <li className="my-1.5 text-xs text-slate-700 leading-relaxed">
                {children}
              </li>
            ),
          }}
        >
          {cleanedContent}
        </ReactMarkdown>
      </div>
    </section>
  );
};
