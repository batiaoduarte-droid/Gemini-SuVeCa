import React, { useState } from 'react';
import { GitBranch, ArrowDown, ChevronRight, Layers, Sparkles } from 'lucide-react';
import { PorquesVisualGuide } from './PorquesVisualGuide';
import { SyllablePhoneticsVisualGuide } from './SyllablePhoneticsVisualGuide';
import { PedagogicalFlowchart } from './PedagogicalFlowchart';
import { PedagogicalTreeDiagram } from './PedagogicalTreeDiagram';
import { EnhancedCodeBlock } from './EnhancedCodeBlock';

interface ConnectionMapProps {
  source: string;
}

const connectorOnly = /^[\s─-╿←-⇿▼▲◆|+\\/_=[\]<>.-]+$/u;

export const linearizeMap = (source: string) =>
  source
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/[─-╿←-⇿▼▲◆|+\\/_[\]<>]+/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter((line) => line.length > 1 && !connectorOnly.test(line))
    .filter((line, index, lines) => index === 0 || line !== lines[index - 1]);

export const isPorquesDiagram = (source: string) => {
  const normalized = source.toUpperCase();
  return (
    normalized.includes('EMPREGO DOS PORQUÊS') ||
    normalized.includes('EMPREGO DOS PORQUES') ||
    (normalized.includes('PORQUÊ') &&
      normalized.includes('PORQUE') &&
      normalized.includes('POR QUÊ') &&
      normalized.includes('POR QUE'))
  );
};

export const isSyllablePhoneticsDiagram = (source: string) => {
  const normalized = source.toUpperCase();
  return (
    normalized.includes('ESTUDO DA SÍLABA') ||
    normalized.includes('ESTUDO DA SILABA') ||
    (normalized.includes('ENCONTROS VOCÁLICOS') && normalized.includes('DÍGRAFO')) ||
    (normalized.includes('ENCONTROS VOCÁLICOS') && normalized.includes('DIVISÃO SILÁBICA')) ||
    (normalized.includes('POLIFONIA DO "X"') && normalized.includes('FONEMA')) ||
    (normalized.includes('MANTRA DA VOGAL ÚNICA') || (normalized.includes('DÍGRAFOS CONSONANTAIS') && normalized.includes('DÍFONOS')))
  );
};

export const isFlowchartDiagram = (source: string) => {
  const normalized = source.toUpperCase();
  const hasStepIndicators =
    /(\bPASSO\s+\d+|\[PASSO\s+\d+|\[\d+\.\s*|\[INÍCIO|\[Início|ALGORITMO|FLUXOGRAMA|TRIAGEM|ROTEIRO|PROCEDIMENTO)/i.test(source);
  const hasArrows =
    /[▼▲►➔→◄←]|\+--->|\+->|──►|─►|->|v\s*\+/u.test(source);
  const hasDecision =
    /(\bSIM\b|\bNÃO\b|\bCERTO\b|\bERRADO\b|\bOBRIGATÓRIA\b|\bFACULTATIVA\b|\bPROIBIDA\b|\bFÓRMULA FINAL\b|\bSEM CRASE\b)/i.test(source);

  return (hasStepIndicators && (hasArrows || hasDecision)) || (hasArrows && hasDecision);
};

export const isTreeDiagram = (source: string) => {
  const treeSymbols = (source.match(/[├└│┌┬┴─]/g) || []).length;
  const lines = source.split(/\r?\n/).filter(Boolean).length;
  return treeSymbols >= 2 || (treeSymbols >= 1 && lines >= 2);
};

export const looksLikeConnectionMap = (source: string) => {
  if (
    isPorquesDiagram(source) ||
    isSyllablePhoneticsDiagram(source) ||
    isFlowchartDiagram(source) ||
    isTreeDiagram(source)
  ) {
    return true;
  }
  const connectorMatches = source.match(/[─-╿←-⇿▼▲►➔→◄←◆|+\\/_=[\]]/gu)?.length || 0;
  return connectorMatches >= 2;
};

export const ConnectionMap: React.FC<ConnectionMapProps> = ({ source }) => {
  // 1. Specialized native visual guide for Porquês
  if (isPorquesDiagram(source)) {
    return <PorquesVisualGuide rawSource={source} />;
  }

  // 2. Specialized native visual guide for Syllable & Phonetics
  if (isSyllablePhoneticsDiagram(source)) {
    return <SyllablePhoneticsVisualGuide rawSource={source} />;
  }

  // 3. Specialized native visual flowchart for procedural algorithms and decisions
  if (isFlowchartDiagram(source)) {
    return <PedagogicalFlowchart source={source} />;
  }

  // 4. Specialized native visual tree for taxonomies and syntax hierarchies
  if (isTreeDiagram(source)) {
    return <PedagogicalTreeDiagram source={source} />;
  }

  // 5. General Connection Map with steps, visual flow, and code block
  const nodes = linearizeMap(source);
  const summary = nodes.length
    ? `Mapa de conexões em ${nodes.length} etapas: ${nodes.join('; ')}.`
    : 'Mapa visual de conexões do conteúdo.';

  return (
    <figure className="connection-map my-6 min-w-0 max-w-full overflow-hidden rounded-2xl border border-teal-200/90 bg-white shadow-xs">
      <figcaption className="flex items-center justify-between border-b border-teal-100 bg-gradient-to-r from-teal-900 to-slate-900 px-4 py-3 text-white sm:px-5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300">
            <GitBranch className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-white">Mapa de Relações e Conexões</span>
        </div>
        <span className="text-xs text-teal-200/80">{nodes.length} etapas</span>
      </figcaption>
      <p className="sr-only">{summary}</p>

      <div className="p-4 sm:p-5">
        {/* Linear Step Cards (Responsive on both Mobile and Desktop) */}
        <ol
          className="m-0 grid list-none gap-2.5 p-0 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Versão linear do mapa de conexões"
        >
          {nodes.map((node, index) => (
            <li
              key={`${node}-${index}`}
              className="relative flex flex-col justify-between rounded-xl border border-teal-100 bg-teal-50/40 p-3.5 pl-11 text-xs leading-relaxed text-slate-800 shadow-2xs transition hover:border-teal-300 hover:bg-teal-50/70"
            >
              <span className="absolute left-3 top-3.5 flex h-6 w-6 items-center justify-center rounded-full bg-teal-700 text-[11px] font-bold text-white shadow-xs">
                {index + 1}
              </span>
              <span className="font-semibold text-teal-950">{node}</span>
            </li>
          ))}
        </ol>

        {/* Enhanced Code Block with formatting, copy, wrap and modal */}
        <div className="mt-4">
          <EnhancedCodeBlock code={source} language="diagrama" />
        </div>
      </div>
    </figure>
  );
};
