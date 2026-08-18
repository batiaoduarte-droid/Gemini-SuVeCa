import React from 'react';
import { ListOrdered, Target, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface ResolutionStep {
  number: number;
  title: string;
  description?: string;
  substeps?: string[];
  formula?: string;
}

export interface ResolutionGuide {
  objective?: string;
  steps: ResolutionStep[];
}

interface ResolutionStepperProps {
  guide: ResolutionGuide;
  title?: string;
}

export const ResolutionStepper: React.FC<ResolutionStepperProps> = ({
  guide,
  title = 'Roteiro de Resolução Passo a Passo',
}) => {
  if (!guide.steps || guide.steps.length === 0) return null;

  return (
    <section className="my-6 space-y-4" aria-label={title}>
      <div className="flex items-center gap-2 border-b border-teal-100 pb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
          <ListOrdered className="h-4 w-4" />
        </div>
        <div>
          <h3 className="m-0 text-sm font-bold text-slate-900">{title}</h3>
          <p className="m-0 text-xs text-slate-500">Procedimento mental algorítmico para não errar a questão</p>
        </div>
      </div>

      {guide.objective && (
        <div className="flex items-start gap-2.5 rounded-xl border border-teal-200/80 bg-teal-50/50 p-3.5 text-sm text-teal-950">
          <Target className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
          <div>
            <strong className="font-semibold text-teal-900">Objetivo do Roteiro:</strong> {guide.objective}
          </div>
        </div>
      )}

      <div className="relative space-y-4 pl-4 sm:pl-6 before:absolute before:left-3.5 sm:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-teal-200">
        {guide.steps.map((step) => (
          <div key={step.number} className="relative flex items-start gap-3.5">
            {/* Number badge */}
            <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-teal-600 bg-white text-xs font-bold text-teal-800 shadow-2xs">
              {step.number}
            </div>

            {/* Step card */}
            <div className="min-w-0 flex-1 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <h4 className="m-0 text-sm font-bold text-slate-900">{step.title}</h4>

              {step.description && (
                <p className="mt-1.5 mb-0 text-xs leading-relaxed text-slate-700">{step.description}</p>
              )}

              {step.formula && (
                <div className="my-2.5 rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-center font-mono text-xs font-semibold text-indigo-900">
                  {step.formula}
                </div>
              )}

              {step.substeps && step.substeps.length > 0 && (
                <ul className="mt-2.5 space-y-1.5 border-t border-slate-100 pt-2 pl-0 list-none">
                  {step.substeps.map((sub, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2 text-xs text-slate-700">
                      <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
                      <span>{sub}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
