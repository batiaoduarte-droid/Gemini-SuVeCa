import React, { useState, useMemo } from 'react';
import { BookMarked, Search, Tag } from 'lucide-react';

export interface GlossaryItem {
  term: string;
  category?: string;
  definition: string;
}

interface GlossaryGridProps {
  items: GlossaryItem[];
  title?: string;
}

export const GlossaryGrid: React.FC<GlossaryGridProps> = ({
  items,
  title = 'Glossário Operacional',
}) => {
  const [search, setSearch] = useState('');

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) => item.term.toLowerCase().includes(q) || item.definition.toLowerCase().includes(q),
    );
  }, [items, search]);

  if (items.length === 0) return null;

  return (
    <section className="my-6 space-y-4" aria-label={title}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-800">
            <BookMarked className="h-4 w-4" />
          </div>
          <div>
            <h3 className="m-0 text-sm font-bold text-slate-900">{title}</h3>
            <p className="m-0 text-xs text-slate-500">Conceitos normativos e definições operacionais</p>
          </div>
        </div>

        {items.length > 3 && (
          <div className="relative min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar termo..."
              className="w-full rounded-lg border border-slate-200 bg-white py-1 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filteredItems.map((item, index) => (
          <div
            key={`${item.term}-${index}`}
            className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs transition hover:border-cyan-300"
          >
            <div>
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <h4 className="m-0 text-xs font-bold text-cyan-950 flex items-center gap-1.5">
                  <Tag className="h-3 w-3 text-cyan-600 shrink-0" />
                  {item.term}
                </h4>
                {item.category && (
                  <span className="rounded bg-cyan-50 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-700">
                    {item.category}
                  </span>
                )}
              </div>
              <p className="m-0 text-xs leading-relaxed text-slate-700">{item.definition}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
          Nenhum termo encontrado para "{search}".
        </div>
      )}
    </section>
  );
};
