import React from 'react';
import { Target, Compass, AlertTriangle, Lightbulb, Info, Quote } from 'lucide-react';

interface PedagogicalCalloutProps {
  children: React.ReactNode;
}

export const PedagogicalCallout: React.FC<PedagogicalCalloutProps> = ({ children }) => {
  // Extract text from children if simple to determine callout type
  const textContent = React.Children.toArray(children)
    .map((c) => (typeof c === 'string' ? c : ''))
    .join(' ');

  // We can also inspect the rendered HTML text content
  const isGoal = /objetivo de aprendizagem/i.test(textContent);
  const isMethodLimit = /limite do m[eé]todo/i.test(textContent);
  const isWarning = /aten[çc][aã]o|cuidado|alerta|perigo/i.test(textContent);
  const isTip = /dica|macete|bizu|importante/i.test(textContent);

  if (isGoal) {
    return (
      <div className="my-5 overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50/80 via-white to-emerald-50/40 p-4 shadow-2xs">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
            <Target className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-900">
            Objetivo de Aprendizagem
          </span>
        </div>
        <div className="text-sm leading-relaxed text-slate-800 [&>p]:m-0 [&>p:not(:last-child)]:mb-2">
          {children}
        </div>
      </div>
    );
  }

  if (isMethodLimit) {
    return (
      <div className="my-5 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-2xs">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
            <Compass className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
            Limite do Método SuVeCA
          </span>
        </div>
        <div className="text-sm leading-relaxed text-slate-800 [&>p]:m-0 [&>p:not(:last-child)]:mb-2">
          {children}
        </div>
      </div>
    );
  }

  if (isWarning) {
    return (
      <div className="my-4 overflow-hidden rounded-2xl border border-rose-200 bg-rose-50/40 p-4 shadow-2xs">
        <div className="mb-1.5 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-rose-900">Atenção</span>
        </div>
        <div className="text-sm leading-relaxed text-slate-800 [&>p]:m-0">{children}</div>
      </div>
    );
  }

  if (isTip) {
    return (
      <div className="my-4 overflow-hidden rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 shadow-2xs">
        <div className="mb-1.5 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-indigo-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">Dica Prática</span>
        </div>
        <div className="text-sm leading-relaxed text-slate-800 [&>p]:m-0">{children}</div>
      </div>
    );
  }

  return (
    <blockquote className="my-4 flex items-start gap-3 rounded-2xl border border-teal-200/80 bg-teal-50/40 p-4 italic text-slate-800 shadow-2xs">
      <Quote className="h-5 w-5 shrink-0 text-teal-600 opacity-60 mt-0.5" />
      <div className="min-w-0 text-sm leading-relaxed [&>p]:m-0 [&>p:not(:last-child)]:mb-2">{children}</div>
    </blockquote>
  );
};
