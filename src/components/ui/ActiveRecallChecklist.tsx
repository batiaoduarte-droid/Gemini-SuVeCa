import React, { useState } from 'react';
import { CheckSquare2, Sparkles, Award } from 'lucide-react';

export interface RecallItem {
  id?: string;
  number: number;
  title: string;
  detail?: string;
}

interface ActiveRecallChecklistProps {
  items: RecallItem[];
  title?: string;
}

export const ActiveRecallChecklist: React.FC<ActiveRecallChecklistProps> = ({
  items,
  title = 'Síntese para Recuperação Ativa (Active Recall)',
}) => {
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());

  if (items.length === 0) return null;

  const toggleCheck = (number: number) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(number)) {
        next.delete(number);
      } else {
        next.add(number);
      }
      return next;
    });
  };

  const progress = Math.round((checkedIds.size / items.length) * 100);
  const allCompleted = checkedIds.size === items.length;

  return (
    <section className="my-6 space-y-4" aria-label={title}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
            <CheckSquare2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="m-0 text-sm font-bold text-slate-900">{title}</h3>
            <p className="m-0 text-xs text-slate-500">
              Teste mentalmente cada competência antes de marcar como dominada
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
          <span>{checkedIds.size} de {items.length} dominadas</span>
          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {allCompleted && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs font-bold text-emerald-900 animate-fadeIn">
          <Award className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Excelente! Você consolidou todas as competências operacionais desta unidade!</span>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => {
          const isChecked = checkedIds.has(item.number);
          return (
            <div
              key={item.number}
              onClick={() => toggleCheck(item.number)}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                isChecked
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : 'border-slate-200/90 bg-white hover:border-emerald-200'
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => {}} // handled by parent onClick
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    <span className="text-emerald-700 font-bold mr-1">{item.number}.</span>
                    {item.title}
                  </span>
                </div>
                {item.detail && (
                  <p className="mt-1 mb-0 text-xs leading-relaxed text-slate-600">{item.detail}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
