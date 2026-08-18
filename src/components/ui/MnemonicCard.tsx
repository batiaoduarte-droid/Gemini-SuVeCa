import React, { useState } from 'react';
import { Brain, Sparkles, Check, Copy, Zap } from 'lucide-react';

export interface MnemonicItem {
  id?: string;
  hook?: string;
  body: string;
}

interface MnemonicCardProps {
  items: MnemonicItem[];
  title?: string;
}

export const MnemonicCard: React.FC<MnemonicCardProps> = ({ items, title = 'Memorização Inteligente & Mnemônicos' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section className="my-6 space-y-4" aria-label={title}>
      <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
          <Brain className="h-4 w-4" />
        </div>
        <div>
          <h3 className="m-0 text-sm font-bold text-slate-900">{title}</h3>
          <p className="m-0 text-xs text-slate-500">Gatilhos mnemônicos e fórmulas de fixação acelerada</p>
        </div>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-1 md:grid-cols-2">
        {items.map((item, index) => {
          // Detect formulas or key mnemonics in quotes or uppercase
          const formulaMatch = item.body.match(/(".*?"|[A-Z0-9]{2,}\s*\+\s*[A-Z0-9]{2,}|[A-ZÀ-Ú\s]{3,}(?=\s*\(|\s*=|\s*:))/);
          const formulaTag = formulaMatch ? formulaMatch[0].replace(/"/g, '') : null;

          return (
            <div
              key={item.id || index}
              className="group relative flex flex-col justify-between rounded-2xl border border-indigo-100/90 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 p-4.5 shadow-2xs transition hover:border-indigo-300 hover:shadow-xs"
            >
              <div>
                <div className="mb-2.5 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 text-indigo-700">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    {formulaTag ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-2xs">
                        <Zap className="h-3 w-3" />
                        {formulaTag}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-indigo-900">Mnemônico #{index + 1}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(item.body, index)}
                    className="inline-flex items-center gap-1 rounded-lg border border-indigo-200/70 bg-white/90 px-2 py-1 text-[11px] font-semibold text-indigo-800 transition hover:bg-indigo-50"
                    title="Copiar mnemônico"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-indigo-600" /> Copiar
                      </>
                    )}
                  </button>
                </div>

                <p className="m-0 text-sm leading-relaxed text-slate-800">{item.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
