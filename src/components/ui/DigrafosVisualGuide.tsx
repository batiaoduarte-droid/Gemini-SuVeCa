import React, { useState } from 'react';
import { Layers, Copy, Check, Info } from 'lucide-react';

interface DigrafosVisualGuideProps {
  rawSource?: string;
}

export const DigrafosVisualGuide: React.FC<DigrafosVisualGuideProps> = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `DÍGRAFOS (2 Letras = 1 Fonema):\n• Consonantais: CH, LH, NH, RR, SS, SC, SÇ, XC, XS, GU, QU\n• Vocálicos: AM, EM, IM, OM, UM / AN, EN, IN, ON, UN`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-teal-200 bg-white shadow-xs">
      <div className="flex flex-wrap items-center justify-between border-b border-teal-100 bg-gradient-to-r from-teal-900 to-slate-900 px-4 py-3 text-white sm:px-5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">Quadro Sinótico de Dígrafos</span>
            <span className="ml-2 hidden text-xs text-teal-200/80 sm:inline">2 Letras = 1 Som (F = L - 1)</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-lg bg-teal-800/80 px-2.5 py-1 text-xs font-semibold text-teal-100 hover:bg-teal-700"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-300" /> Copiado!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-teal-300" /> Copiar Quadro
            </>
          )}
        </button>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Dígrafos Consonantais */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h4 className="m-0 text-xs font-bold text-blue-950 uppercase tracking-wide">
                1. Dígrafos Consonantais
              </h4>
              <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                Som Consonantal Único
              </span>
            </div>
            <p className="m-0 text-xs text-slate-700 leading-relaxed mb-3">
              Duas letras geram uma única consoante na pronúncia.
            </p>
            <div className="rounded-lg bg-white p-3 border border-blue-100 space-y-2 text-xs">
              <div>
                <span className="font-bold text-blue-900 block mb-1">Ocorrências Fixas:</span>
                <div className="flex flex-wrap gap-1">
                  {['CH', 'LH', 'NH', 'RR', 'SS', 'SC', 'SÇ', 'XC', 'XS', 'GU', 'QU'].map((d) => (
                    <span key={d} className="rounded bg-blue-50 px-2 py-0.5 font-mono font-bold text-blue-900 border border-blue-100">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-[11px] text-slate-600">
                <strong>Exemplos:</strong> <span className="italic">chave (/x/), guerra (/g/), pilha (/λ/), carro (/r/)</span>
              </div>
            </div>
          </div>

          {/* Dígrafos Vocálicos */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h4 className="m-0 text-xs font-bold text-emerald-950 uppercase tracking-wide">
                2. Dígrafos Vocálicos
              </h4>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Vogal Nasalizada
              </span>
            </div>
            <p className="m-0 text-xs text-slate-700 leading-relaxed mb-3">
              Vogal seguida de M ou N na mesma sílaba. O M/N atua apenas como til (~).
            </p>
            <div className="rounded-lg bg-white p-3 border border-emerald-100 space-y-2 text-xs">
              <div>
                <span className="font-bold text-emerald-900 block mb-1">Ocorrências Fixas:</span>
                <div className="flex flex-wrap gap-1">
                  {['AM / AN', 'EM / EN', 'IM / IN', 'OM / ON', 'UM / UN'].map((d) => (
                    <span key={d} className="rounded bg-emerald-50 px-2 py-0.5 font-mono font-bold text-emerald-900 border border-emerald-100">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-[11px] text-slate-600">
                <strong>Exemplos:</strong> <span className="italic">campo (/kãpu/), vento (/vẽtu/), limpo (/lĩpu/), mundo (/mũdu/)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
