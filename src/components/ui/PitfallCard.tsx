import React, { useState, useMemo } from 'react';
import { AlertTriangle, ShieldCheck, Check, Copy, Search, CheckCircle } from 'lucide-react';

export interface PitfallItem {
  id?: string;
  bank?: string;
  problem: string;
  solution: string;
}

interface PitfallCardProps {
  items: PitfallItem[];
  title?: string;
}

export const PitfallCard: React.FC<PitfallCardProps> = ({
  items,
  title = 'Erros Comuns e Armadilhas de Prova',
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedBank, setSelectedBank] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [masteredItems, setMasteredItems] = useState<Set<number>>(new Set());

  // Deduplicate items with identical problem & solution
  const uniqueItems = useMemo(() => {
    const seen = new Set<string>();
    const result: PitfallItem[] = [];
    for (const item of items) {
      const key = `${item.problem.toLowerCase().slice(0, 40)}|||${item.solution.toLowerCase().slice(0, 40)}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }
    return result;
  }, [items]);

  // Extract unique banks
  const availableBanks = useMemo(() => {
    const banks = new Set<string>();
    for (const item of uniqueItems) {
      if (item.bank) banks.add(item.bank.toUpperCase());
    }
    return Array.from(banks);
  }, [uniqueItems]);

  const filteredItems = useMemo(() => {
    return uniqueItems.filter((item) => {
      const matchesBank =
        selectedBank === 'all' ||
        (item.bank && item.bank.toUpperCase() === selectedBank.toUpperCase());

      if (!matchesBank) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        item.problem.toLowerCase().includes(q) ||
        item.solution.toLowerCase().includes(q) ||
        (item.bank && item.bank.toLowerCase().includes(q))
      );
    });
  }, [uniqueItems, selectedBank, searchQuery]);

  const handleCopy = (item: PitfallItem, index: number) => {
    const text = `🚨 Armadilha de Prova: ${item.problem}\n🛡️ Vacina Definitiva: ${item.solution}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleMastered = (index: number) => {
    setMasteredItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (uniqueItems.length === 0) return null;

  return (
    <section className="my-6 space-y-4" aria-label={title}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700 shadow-2xs">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="m-0 text-sm font-bold text-slate-900">{title}</h3>
            <p className="m-0 text-xs text-slate-500">
              {uniqueItems.length} armadilhas recorrentes mapeadas em bancas de concursos
            </p>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por armadilha ou vacina..."
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>

        {availableBanks.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedBank('all')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                selectedBank === 'all'
                  ? 'bg-rose-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todas ({uniqueItems.length})
            </button>
            {availableBanks.map((b) => {
              const count = uniqueItems.filter((i) => i.bank?.toUpperCase() === b).length;
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBank(b)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    selectedBank === b
                      ? 'bg-rose-800 text-white shadow-2xs'
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

      {/* Pitfall Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-1">
        {filteredItems.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
            Nenhuma pegadinha encontrada para a busca realizada.
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const isMastered = masteredItems.has(index);
            return (
              <div
                key={item.id || index}
                className={`overflow-hidden rounded-2xl border transition shadow-xs ${
                  isMastered
                    ? 'border-emerald-300 bg-emerald-50/20 opacity-80'
                    : 'border-slate-200/90 bg-white hover:border-slate-300'
                }`}
              >
                {item.bank && (
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-xs font-semibold text-slate-600">
                    <span className="inline-flex items-center rounded-md bg-white px-2 py-0.5 font-bold text-slate-800 shadow-2xs border border-slate-200">
                      Banca: {item.bank}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleMastered(index)}
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold transition ${
                        isMastered ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <CheckCircle className={`h-3.5 w-3.5 ${isMastered ? 'text-emerald-600' : 'text-slate-400'}`} />
                      {isMastered ? 'Vacina Dominada' : 'Marcar como Dominada'}
                    </button>
                  </div>
                )}

                <div className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                  {/* Lado da Armadilha */}
                  <div className="bg-rose-50/40 p-4 sm:p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </span>
                      <h4 className="m-0 text-xs font-bold uppercase tracking-wider text-rose-900">
                        Armadilha da Banca
                      </h4>
                    </div>
                    <p className="m-0 text-sm leading-relaxed text-rose-950/90">{item.problem}</p>
                  </div>

                  {/* Lado da Vacina / Solução */}
                  <div className="flex flex-col justify-between bg-emerald-50/40 p-4 sm:p-5">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </span>
                          <h4 className="m-0 text-xs font-bold uppercase tracking-wider text-emerald-900">
                            Como Evitar (Vacina)
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(item, index)}
                          className="inline-flex items-center gap-1 rounded-md border border-emerald-200/80 bg-white px-2 py-1 text-[11px] font-semibold text-emerald-800 transition hover:bg-emerald-50"
                          title="Copiar vacina"
                        >
                          {copiedIndex === index ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" /> Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 text-emerald-600" /> Copiar
                            </>
                          )}
                        </button>
                      </div>
                      <p className="m-0 text-sm leading-relaxed text-emerald-950/90">{item.solution}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
