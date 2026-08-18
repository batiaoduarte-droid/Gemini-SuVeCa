import React, { useState, useMemo } from 'react';
import { BookOpen, CheckCircle2, Building2, Calendar, Search, Copy, Check, Filter } from 'lucide-react';

export interface ExampleItem {
  id?: string;
  sourceText?: string;
  bank?: string;
  agency?: string;
  year?: string;
  sentence: string;
  explanation: string;
  answer?: string;
  code?: string;
}

interface AnnotatedExampleCardProps {
  items: ExampleItem[];
  title?: string;
}

export const AnnotatedExampleCard: React.FC<AnnotatedExampleCardProps> = ({
  items,
  title = 'Exemplos Comentados e Casos de Prova',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState<string>('all');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Extract unique banks for filter
  const availableBanks = useMemo(() => {
    const banks = new Set<string>();
    for (const item of items) {
      if (item.bank) banks.add(item.bank.toUpperCase());
    }
    return Array.from(banks);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesBank =
        selectedBank === 'all' ||
        (item.bank && item.bank.toUpperCase() === selectedBank.toUpperCase());

      if (!matchesBank) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        item.sentence.toLowerCase().includes(q) ||
        item.explanation.toLowerCase().includes(q) ||
        (item.bank && item.bank.toLowerCase().includes(q)) ||
        (item.agency && item.agency.toLowerCase().includes(q)) ||
        (item.answer && item.answer.toLowerCase().includes(q)) ||
        (item.code && item.code.toLowerCase().includes(q))
      );
    });
  }, [items, selectedBank, searchQuery]);

  const handleCopy = (item: ExampleItem, index: number) => {
    const text = `Exemplo:\n"${item.sentence}"\n\nExplicação: ${item.explanation}${
      item.answer ? `\nGabarito: ${item.answer}` : ''
    }`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (items.length === 0) return null;

  return (
    <section className="my-6 space-y-4" aria-label={title}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800 shadow-2xs">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h3 className="m-0 text-sm font-bold text-slate-900">{title}</h3>
            <p className="m-0 text-xs text-slate-500">
              {items.length} exemplos com contextualização normativa, bancas e justificativas
            </p>
          </div>
        </div>
      </div>

      {/* Controls: Search and Bank Filter */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por frase, palavra-chave ou regra..."
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {availableBanks.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedBank('all')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                selectedBank === 'all'
                  ? 'bg-amber-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todas ({items.length})
            </button>
            {availableBanks.map((b) => {
              const count = items.filter((i) => i.bank?.toUpperCase() === b).length;
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBank(b)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    selectedBank === b
                      ? 'bg-amber-800 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {b} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Example Items Grid */}
      <div className="grid gap-3 sm:grid-cols-1">
        {filteredItems.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
            Nenhum exemplo encontrado para o filtro aplicado.
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div
              key={item.id || index}
              className="flex flex-col justify-between rounded-xl border border-amber-200/80 bg-white p-4 shadow-2xs transition hover:border-amber-300"
            >
              <div>
                {/* Header badges */}
                <div className="mb-2.5 flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                    {item.bank && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 font-bold text-amber-900 border border-amber-200/60">
                        <Building2 className="h-3 w-3 text-amber-700" />
                        {item.bank}
                      </span>
                    )}
                    {item.agency && (
                      <span className="rounded-md bg-slate-50 px-2 py-0.5 text-slate-700 border border-slate-200/60 font-medium">
                        {item.agency}
                      </span>
                    )}
                    {item.year && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-slate-600 border border-slate-200/60">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {item.year}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(item, index)}
                    className="inline-flex items-center gap-1 rounded bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600 border border-slate-200 hover:bg-slate-100"
                    title="Copiar exemplo"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-slate-500" /> Copiar
                      </>
                    )}
                  </button>
                </div>

                {/* Quote / sentence */}
                <div className="mb-2.5 rounded-lg border-l-3 border-amber-500 bg-amber-50/40 px-3.5 py-2.5 text-sm italic leading-relaxed text-slate-900 font-serif">
                  "{item.sentence}"
                </div>

                {/* Explanation */}
                {item.explanation && (
                  <p className="m-0 text-xs leading-relaxed text-slate-700 font-sans">
                    {item.explanation}
                  </p>
                )}
              </div>

              {/* Answer or Code Badge */}
              {(item.answer || item.code) && (
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                  {item.code ? (
                    <span className="rounded bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 border border-indigo-100">
                      {item.code}
                    </span>
                  ) : <div />}
                  {item.answer && (
                    <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 px-3 py-0.5 text-xs font-bold text-emerald-900 border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                      <span>Gabarito: {item.answer}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
};
