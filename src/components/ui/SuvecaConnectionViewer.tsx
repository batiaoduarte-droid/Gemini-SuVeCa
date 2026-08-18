import React, { useMemo, useState } from 'react';
import { Workflow, Check, Copy, ArrowRight, ShieldAlert, Zap, Compass, CheckCircle2, ChevronRight } from 'lucide-react';

interface SuvecaConnectionViewerProps {
  content: string;
  title?: string;
}

interface ParsedSuveca {
  headline: string;
  connectionLevel?: { label: string; text: string; type: 'central' | 'strong' | 'support' | 'other' };
  applicationSteps: string[];
  decisiveTests: Array<{ title: string; description: string }>;
  methodLimit?: string;
  otherText: string[];
}

const parseSuvecaContent = (raw: string): ParsedSuveca => {
  const lines = raw.split(/\r?\n/);
  let headline = '';
  let connectionLevel: ParsedSuveca['connectionLevel'] = undefined;
  const applicationSteps: string[] = [];
  const decisiveTests: Array<{ title: string; description: string }> = [];
  let methodLimit: string | undefined = undefined;
  const otherText: string[] = [];

  let currentSection: 'intro' | 'steps' | 'tests' | 'limit' | 'none' = 'intro';
  const limitLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed === '---') continue;

    // Check headings
    if (/^###\s+Como aplicar/i.test(trimmed)) {
      currentSection = 'steps';
      continue;
    }
    if (/^###\s+Testes decisivos/i.test(trimmed)) {
      currentSection = 'tests';
      continue;
    }
    if (/^>\s*\*\*Limite do m[eé]todo:?\*\*/i.test(trimmed) || /^>\s*Limite do m[eé]todo/i.test(trimmed)) {
      currentSection = 'limit';
      limitLines.push(trimmed.replace(/^>\s*/, '').replace(/^\*\*Limite do m[eé]todo:?\*\*\s*/i, '').trim());
      continue;
    }

    if (currentSection === 'limit') {
      if (trimmed.startsWith('>')) {
        limitLines.push(trimmed.replace(/^>\s*/, '').trim());
        continue;
      } else {
        currentSection = 'none';
      }
    }

    // Connection level detection (e.g. **Apoio estrutural:**, **Conexão forte:**, **Método central:**)
    const levelMatch = trimmed.match(/^\*\*(Apoio estrutural|Conex[aã]o forte|M[eé]todo central|Central|Fora do n[uú]cleo|Revis[aã]o|Indireta):\*\*\s*(.*)$/i);
    if (levelMatch) {
      const label = levelMatch[1].trim();
      const text = levelMatch[2].trim();
      const normLabel = label.toLowerCase();
      let type: 'central' | 'strong' | 'support' | 'other' = 'other';
      if (normLabel.includes('central')) type = 'central';
      else if (normLabel.includes('forte')) type = 'strong';
      else if (normLabel.includes('apoio') || normLabel.includes('estrutural')) type = 'support';

      connectionLevel = { label, text, type };
      continue;
    }

    if (trimmed.includes('SuVeCA =')) {
      headline = trimmed.replace(/\*\*/g, '').trim();
      continue;
    }

    if (currentSection === 'steps') {
      if (/^\d+\.\s+/.test(trimmed)) {
        applicationSteps.push(trimmed.replace(/^\d+\.\s+/, '').trim());
      } else if (trimmed.startsWith('-')) {
        applicationSteps.push(trimmed.replace(/^-\s+/, '').trim());
      }
      continue;
    }

    if (currentSection === 'tests') {
      if (trimmed.startsWith('-') || /^\d+\.\s+/.test(trimmed)) {
        const itemText = trimmed.replace(/^[-\d.]\s+/, '').trim();
        const colonIdx = itemText.indexOf(':');
        if (colonIdx > 0 && colonIdx < 50) {
          decisiveTests.push({
            title: itemText.slice(0, colonIdx).trim(),
            description: itemText.slice(colonIdx + 1).trim(),
          });
        } else {
          decisiveTests.push({
            title: 'Teste Diagnóstico',
            description: itemText,
          });
        }
      }
      continue;
    }

    if (!trimmed.startsWith('#')) {
      otherText.push(trimmed);
    }
  }

  if (limitLines.length > 0) {
    methodLimit = limitLines.join(' ').trim();
  }

  return {
    headline: headline || 'SuVeCA = Sujeito + Verbo + Complemento + Adjunto + Predicativo',
    connectionLevel,
    applicationSteps,
    decisiveTests,
    methodLimit,
    otherText,
  };
};

const SUVECA_PILLS = [
  { key: 'Su', label: 'Sujeito', desc: 'Polo nominal determinante', color: 'bg-blue-100 text-blue-900 border-blue-300' },
  { key: 'Ve', label: 'Verbo', desc: 'Motor oracional relacional', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { key: 'C', label: 'Complemento', desc: 'Objetos direto / indireto / CN', color: 'bg-teal-100 text-teal-900 border-teal-300' },
  { key: 'A', label: 'Adjunto', desc: 'Adverbial ou adnominal circunstancial', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  { key: 'Pred', label: 'Predicativo', desc: 'Atributo do sujeito ou objeto', color: 'bg-purple-100 text-purple-900 border-purple-300' },
];

export const SuvecaConnectionViewer: React.FC<SuvecaConnectionViewerProps> = ({
  content,
  title = 'Conexão com o Método SuVeCA',
}) => {
  const parsed = useMemo(() => parseSuvecaContent(content), [content]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelBadge = () => {
    if (!parsed.connectionLevel) return null;
    const { label, type } = parsed.connectionLevel;
    const styles = {
      central: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      strong: 'bg-teal-50 text-teal-800 border-teal-300',
      support: 'bg-violet-50 text-violet-800 border-violet-300',
      other: 'bg-slate-100 text-slate-800 border-slate-300',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${styles[type]}`}>
        <span className="h-2 w-2 rounded-full bg-current" />
        {label}
      </span>
    );
  };

  return (
    <div className="my-5 space-y-5 rounded-2xl border border-teal-200 bg-white p-4 shadow-sm sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
            <Workflow className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                {title.replace(/^\d+[\.\-\)]\s*/, '')}
              </h3>
              {getLevelBadge()}
            </div>
            <p className="text-xs text-slate-500">
              Mapa de ancoragem sintático-funcional para desarmar inversões de prova
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          title="Copiar método"
          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-slate-500" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      {/* SuVeCA Interactive Element Pills */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Fórmula Sintática Fundamental
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            Ordem Canônica vs. Inversões
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {SUVECA_PILLS.map((pill, idx) => (
            <div
              key={pill.key}
              className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center shadow-2xs transition-transform hover:scale-[1.02] ${pill.color}`}
            >
              <div className="text-xs font-black tracking-wider uppercase">{pill.key}</div>
              <div className="text-xs font-bold">{pill.label}</div>
              <div className="mt-0.5 text-[10px] opacity-85 leading-tight">{pill.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Connection Level Narrative */}
      {parsed.connectionLevel && (
        <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
          <div className="text-xs font-bold text-teal-950 mb-1 flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-teal-700" />
            <span>Papel no Eixo SuVeCA: {parsed.connectionLevel.label}</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-700">
            {parsed.connectionLevel.text}
          </p>
        </div>
      )}

      {/* Narrative Context */}
      {parsed.otherText.length > 0 && (
        <div className="space-y-2 text-sm leading-relaxed text-slate-700">
          {parsed.otherText.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      )}

      {/* Application Steps */}
      {parsed.applicationSteps.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Zap className="h-4 w-4 text-amber-600" />
            <span>Como Aplicar Neste Tema (Passo a Passo)</span>
          </div>
          <div className="grid gap-2.5">
            {parsed.applicationSteps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-black text-teal-900">
                  {idx + 1}
                </div>
                <div className="text-sm leading-relaxed text-slate-800">
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decisive Diagnostic Tests */}
      {parsed.decisiveTests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-900">
            <CheckCircle2 className="h-4 w-4 text-teal-700" />
            <span>Testes Diagnósticos Decisivos</span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {parsed.decisiveTests.map((test, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-xl border border-teal-200/80 bg-teal-50/30 p-3.5 shadow-2xs"
              >
                <div>
                  <span className="inline-block rounded-md bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-900 mb-1.5">
                    {test.title}
                  </span>
                  <p className="text-xs leading-relaxed text-slate-700">
                    {test.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Limit of the Method */}
      {parsed.methodLimit && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <div className="mb-1.5 flex items-center gap-2 text-xs font-bold text-amber-950">
            <ShieldAlert className="h-4 w-4 text-amber-700" />
            <span>Limite do Método e Fronteira Normativa</span>
          </div>
          <p className="text-xs leading-relaxed text-amber-900">
            {parsed.methodLimit}
          </p>
        </div>
      )}
    </div>
  );
};
