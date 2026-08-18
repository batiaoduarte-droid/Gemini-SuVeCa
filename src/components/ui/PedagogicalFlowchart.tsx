import React, { useState, useMemo } from 'react';
import {
  GitMerge,
  ArrowDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
  Maximize2,
  ListOrdered,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { ModalShell } from './ModalShell';

export interface FlowStep {
  id: string;
  number: number;
  title: string;
  description?: string;
  bullets?: string[];
  branches?: {
    condition: string;
    action: string;
    type?: 'positive' | 'negative' | 'neutral' | 'warning';
  }[];
  formula?: string;
  conclusion?: {
    text: string;
    type: 'positive' | 'negative' | 'neutral';
  };
}

interface PedagogicalFlowchartProps {
  source: string;
  title?: string;
}

// Universal parser for pedagogical procedural diagrams and flowcharts
export const parseFlowchartSource = (source: string): { title: string; steps: FlowStep[]; formulaFinal?: string } => {
  const normalized = source.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n').map((l) => l.trim()).filter(Boolean);

  let diagramTitle = 'Roteiro Operacional de Resolução';
  const steps: FlowStep[] = [];
  let currentStep: FlowStep | null = null;
  let formulaFinal: string | undefined;

  // Check top title
  const firstLine = lines[0] || '';
  if (
    /^(ALGORITMO|FLUXOGRAMA|ROTEIRO|PROCEDIMENTO|DECISÃO|TRIAGEM|ESTUDO|PASSO|\[INÍCIO|\[Início)/i.test(firstLine) &&
    !firstLine.startsWith('PASSO 1') &&
    !firstLine.startsWith('[PASSO 1') &&
    !firstLine.startsWith('1.')
  ) {
    diagramTitle = firstLine
      .replace(/[│┌┐└┘├┤┬┴═▼▲►➔→◄←◆|+\\/_[\]]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || diagramTitle;
  }

  // Regex patterns
  const stepHeaderRegex = /^(?:\[?(?:PASSO|Passo)\s*(\d+)[:\s.-]*(.*?)\]?|(\d+)[\s.:)-]+(.*)|\[(\d+)\.\s*(.*?)\]|\[(?:INÍCIO|Início)[:\s]*(.*?)\])$/i;
  const branchRegex = /(?:├──|└──|├─|└─|├──|➔|►|->|──►|\+--->|\+->|\+-->)\s*(?:\[(.*?)\]|([^:►─]+))\s*(?:──►|─►|->|:|➔|-------->|--->)\s*(.*)/;
  const formulaRegex = /\[?(?:FÓRMULA\s*FINAL|FÓRMULA|EQUAÇÃO|CÔMPUTO|RESULTADO)[:\s]*(.*?)\]?$/i;

  // Preprocess lines: handle single-line condensed blocks
  const expandedLines: string[] = [];
  for (const rawLine of lines) {
    // If the line contains multiple steps like [1. ...] [2. ...] or PASSO 1 ... PASSO 2 ...
    const stepSplits = rawLine.split(/(?=\[(?:PASSO|Passo|\d+\.)|\bPASSO\s+\d+:|\bPasso\s+\d+:)/i);
    if (stepSplits.length > 1) {
      expandedLines.push(...stepSplits);
    } else {
      expandedLines.push(rawLine);
    }
  }

  for (let i = 0; i < expandedLines.length; i++) {
    const rawLine = expandedLines[i];
    const cleanLine = rawLine
      .replace(/^[│┌┐└┘├┤┬┴═▼▲►➔→◄←◆|+\\/_.-]+\s*/, '')
      .replace(/\s*[│┌┐└┘├┤┬┴═▼▲►➔→◄←◆|+\\/_.-]+$/, '')
      .trim();

    if (!cleanLine) continue;

    // Check for formula
    const formMatch = formulaRegex.exec(cleanLine);
    if (formMatch) {
      formulaFinal = cleanLine.replace(/[│┌┐└┘├┤┬┴═▼▲►➔→◄←◆|+\\/_[\]]+/g, ' ').replace(/\s+/g, ' ').trim();
      continue;
    }

    // Check step start
    const stepMatch = stepHeaderRegex.exec(cleanLine);
    if (stepMatch) {
      if (currentStep) {
        steps.push(currentStep);
      }
      const num = parseInt(stepMatch[1] || stepMatch[3] || stepMatch[5] || String(steps.length + 1), 10) || (steps.length + 1);
      const title = (stepMatch[2] || stepMatch[4] || stepMatch[6] || stepMatch[7] || cleanLine)
        .replace(/[│┌┐└┘├┤┬┴═▼▲►➔→◄←◆|+\\/_[\]]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      currentStep = {
        id: `step-${num}-${steps.length}`,
        number: num,
        title: title || `Etapa ${num}`,
        bullets: [],
        branches: [],
      };
      continue;
    }

    // Check branch / condition
    const bMatch = branchRegex.exec(cleanLine);
    if (bMatch && currentStep) {
      const cond = (bMatch[1] || bMatch[2] || '').trim();
      const action = (bMatch[3] || '').replace(/[│┌┐└┘├┤┬┴═▼▲►➔→◄←◆|+\\/_[\]]+/g, ' ').trim();
      
      let branchType: 'positive' | 'negative' | 'neutral' | 'warning' = 'neutral';
      const upper = (cond + ' ' + action).toUpperCase();
      if (upper.includes('SIM') || upper.includes('CERTO') || upper.includes('OBRIGATÓRIA') || upper.includes('VÁLIDO') || upper.includes('SOMAR')) {
        branchType = upper.includes('ERRO') ? 'negative' : 'positive';
      } else if (upper.includes('NÃO') || upper.includes('ERRADO') || upper.includes('PROIBIDA') || upper.includes('SEM CRASE') || upper.includes('ERRO')) {
        branchType = 'negative';
      } else if (upper.includes('FACULTATIVA') || upper.includes('MANTER') || upper.includes('CURTO')) {
        branchType = 'warning';
      }

      currentStep.branches?.push({
        condition: cond,
        action,
        type: branchType,
      });
      continue;
    }

    // Regular bullet or description inside current step
    if (currentStep) {
      const bulletText = cleanLine
        .replace(/^[•\-\*]\s*/, '')
        .replace(/[│┌┐└┘├┤┬┴═▼▲►➔→◄←◆|+\\/_[\]]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (bulletText.length > 2) {
        if (!currentStep.description && !bulletText.startsWith('(')) {
          currentStep.description = bulletText;
        } else {
          currentStep.bullets?.push(bulletText);
        }
      }
    } else {
      // First orphan line before any explicit step
      if (cleanLine.length > 3 && !cleanLine.startsWith('[')) {
        currentStep = {
          id: `step-1`,
          number: 1,
          title: cleanLine,
          bullets: [],
          branches: [],
        };
      }
    }
  }

  if (currentStep) {
    steps.push(currentStep);
  }

  // If no steps were parsed via regex, fallback to heuristic line splitting
  if (steps.length === 0) {
    const rawSegments = source
      .split(/\r?\n/)
      .map((l) => l.replace(/[─-╿←-⇿▼▲◆|+\\/_=[\]<>.-]+/gu, ' ').trim())
      .filter((l) => l.length > 2);

    rawSegments.forEach((seg, idx) => {
      steps.push({
        id: `fallback-${idx}`,
        number: idx + 1,
        title: seg,
        bullets: [],
        branches: [],
      });
    });
  }

  return { title: diagramTitle, steps, formulaFinal };
};

export const PedagogicalFlowchart: React.FC<PedagogicalFlowchartProps> = ({ source, title: propTitle }) => {
  const [viewMode, setViewMode] = useState<'flow' | 'checklist' | 'raw'>('flow');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const parsed = useMemo(() => parseFlowchartSource(source), [source]);
  const diagramTitle = propTitle || parsed.title;

  const toggleStep = (id: string) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopy = () => {
    const lines = [
      diagramTitle.toUpperCase(),
      ...parsed.steps.map((s) => {
        let text = `${s.number}. ${s.title}`;
        if (s.description) text += `\n   ${s.description}`;
        if (s.bullets && s.bullets.length > 0) {
          text += '\n' + s.bullets.map((b) => `   • ${b}`).join('\n');
        }
        if (s.branches && s.branches.length > 0) {
          text += '\n' + s.branches.map((br) => `   ➔ [${br.condition}]: ${br.action}`).join('\n');
        }
        return text;
      }),
      parsed.formulaFinal ? `\nFÓRMULA / CONCLUSÃO: ${parsed.formulaFinal}` : '',
    ];
    navigator.clipboard.writeText(lines.filter(Boolean).join('\n\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pedagogical-flowchart my-6 overflow-hidden rounded-2xl border border-teal-200/90 bg-white shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-100 bg-gradient-to-r from-teal-950 via-slate-900 to-teal-900 px-4 py-3.5 text-white sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300">
            <GitMerge className="h-5 w-5" />
          </div>
          <div>
            <h3 className="m-0 text-sm font-bold tracking-tight sm:text-base text-white">
              {diagramTitle}
            </h3>
            <p className="m-0 text-xs text-teal-200/80">
              Roteiro de resolução algorítmica ({parsed.steps.length} etapas guiadas)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-white/10 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('flow')}
              className={`rounded-md px-3 py-1.5 transition ${
                viewMode === 'flow' ? 'bg-white text-teal-950 shadow-xs' : 'text-teal-100 hover:text-white'
              }`}
            >
              Fluxo
            </button>
            <button
              type="button"
              onClick={() => setViewMode('checklist')}
              className={`rounded-md px-3 py-1.5 transition ${
                viewMode === 'checklist' ? 'bg-white text-teal-950 shadow-xs' : 'text-teal-100 hover:text-white'
              }`}
            >
              Checklist
            </button>
            <button
              type="button"
              onClick={() => setViewMode('raw')}
              className={`rounded-md px-3 py-1.5 transition ${
                viewMode === 'raw' ? 'bg-white text-teal-950 shadow-xs' : 'text-teal-100 hover:text-white'
              }`}
            >
              Original
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-teal-400/30 bg-teal-800/40 px-2.5 py-1.5 text-xs font-medium text-teal-100 transition hover:bg-teal-700/50 hover:text-white"
            title="Copiar etapas"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 rounded-lg border border-teal-400/30 bg-teal-800/40 px-2 py-1.5 text-xs font-medium text-teal-100 transition hover:bg-teal-700/50 hover:text-white"
            title="Expandir em tela cheia"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-4 sm:p-6">
        {viewMode === 'flow' && (
          <div className="space-y-4">
            {parsed.steps.map((step, idx) => (
              <div key={step.id} className="relative">
                {/* Step Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-teal-300 hover:shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-800 text-xs font-extrabold text-white shadow-2xs">
                        {step.number}
                      </span>
                      <h4 className="m-0 text-sm font-bold text-slate-900 sm:text-base">
                        {step.title}
                      </h4>
                    </div>
                  </div>

                  {step.description && (
                    <p className="m-0 mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm pl-10">
                      {step.description}
                    </p>
                  )}

                  {/* Bullet points */}
                  {step.bullets && step.bullets.length > 0 && (
                    <div className="mt-2.5 space-y-1.5 pl-10">
                      {step.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2 text-xs text-slate-700">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
                          <span className="leading-relaxed">{bullet}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Decision Branches */}
                  {step.branches && step.branches.length > 0 && (
                    <div className="mt-3 grid gap-2 pl-10 sm:grid-cols-2">
                      {step.branches.map((branch, brIdx) => {
                        let badgeBg = 'bg-slate-100 text-slate-800 border-slate-200';
                        let actionBg = 'bg-slate-50 text-slate-800 border-slate-200';
                        if (branch.type === 'positive') {
                          badgeBg = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
                          actionBg = 'bg-emerald-50/80 text-emerald-950 border-emerald-200 font-semibold';
                        } else if (branch.type === 'negative') {
                          badgeBg = 'bg-rose-100 text-rose-900 border-rose-300 font-bold';
                          actionBg = 'bg-rose-50/80 text-rose-950 border-rose-200 font-semibold';
                        } else if (branch.type === 'warning') {
                          badgeBg = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
                          actionBg = 'bg-amber-50/80 text-amber-950 border-amber-200 font-semibold';
                        }

                        return (
                          <div
                            key={brIdx}
                            className={`flex flex-col gap-1 rounded-lg border p-2.5 text-xs ${actionBg}`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className={`rounded px-1.5 py-0.5 text-[11px] border ${badgeBg}`}>
                                {branch.condition || 'Condição'}
                              </span>
                              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                            <span className="mt-0.5 text-xs leading-snug">{branch.action}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Connector Arrow to next step */}
                {idx < parsed.steps.length - 1 && (
                  <div className="my-1 flex items-center justify-center text-teal-600">
                    <ArrowDown className="h-4 w-4 animate-pulse" />
                  </div>
                )}
              </div>
            ))}

            {/* Formula / Final Decision Banner */}
            {parsed.formulaFinal && (
              <div className="mt-4 rounded-xl border border-teal-300 bg-gradient-to-r from-teal-900 to-slate-900 p-4 text-white shadow-xs">
                <div className="flex items-center gap-2 font-bold text-sm text-teal-200 mb-1">
                  <ShieldCheck className="h-5 w-5 text-teal-300" />
                  <span>Fórmula / Conclusão Decisória:</span>
                </div>
                <div className="text-sm sm:text-base font-extrabold text-white font-mono bg-white/10 rounded-lg p-2.5 border border-white/10">
                  {parsed.formulaFinal}
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'checklist' && (
          <div className="space-y-3">
            <div className="rounded-lg bg-teal-50 p-3 text-xs text-teal-900 border border-teal-100 mb-3">
              Marque os passos à medida que executa a análise mental da questão:
            </div>
            {parsed.steps.map((step) => {
              const isChecked = completedSteps.has(step.id);
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => toggleStep(step.id)}
                  className={`w-full text-left rounded-xl border p-3.5 transition flex items-start gap-3 ${
                    isChecked ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="mt-0.5">
                    {isChecked ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {step.number}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold ${isChecked ? 'text-emerald-950 line-through' : 'text-slate-900'}`}>
                      {step.title}
                    </div>
                    {step.description && (
                      <p className="m-0 mt-1 text-xs text-slate-600 leading-relaxed">
                        {step.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {viewMode === 'raw' && (
          <div className="rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
            <pre className="m-0 whitespace-pre">{source}</pre>
          </div>
        )}
      </div>

      {/* Modal Tela Cheia */}
      <ModalShell
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={diagramTitle}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs text-slate-500">Visualização de Alta Resolução</span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copiado!' : 'Copiar Roteiro'}
            </button>
          </div>

          <div className="space-y-3">
            {parsed.steps.map((step) => (
              <div key={step.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="font-bold text-sm text-slate-900">
                  {step.number}. {step.title}
                </div>
                {step.description && <p className="text-xs text-slate-600 mt-1">{step.description}</p>}
                {step.branches && step.branches.length > 0 && (
                  <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    {step.branches.map((b, i) => (
                      <div key={i} className="rounded bg-white p-2 text-xs border border-slate-200">
                        <span className="font-bold text-teal-800">[{b.condition}]:</span> {b.action}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {parsed.formulaFinal && (
              <div className="rounded-lg bg-teal-900 p-3 text-white font-mono text-xs font-bold">
                {parsed.formulaFinal}
              </div>
            )}
          </div>
        </div>
      </ModalShell>
    </div>
  );
};
