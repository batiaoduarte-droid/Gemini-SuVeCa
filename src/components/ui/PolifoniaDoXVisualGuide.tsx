import React, { useState } from 'react';
import { Volume2, Sparkles, Copy, Check, Info } from 'lucide-react';

interface PolifoniaDoXVisualGuideProps {
  rawSource?: string;
}

const X_SOUNDS = [
  {
    id: 's',
    sound: 'Som de /s/',
    relation: '1 Letra = 1 Som',
    badge: 'Neutro (0)',
    corBadge: 'bg-blue-100 text-blue-800 border-blue-200',
    corBorder: 'border-blue-200',
    corBg: 'bg-blue-50/40',
    exemplos: ['experiência', 'excesso', 'exceder', 'excelente', 'trouxe'],
    regra: 'Em "exceder" e "excelente", o dígrafo XC produz som único de /s/.',
  },
  {
    id: 'z',
    sound: 'Som de /z/',
    relation: '1 Letra = 1 Som',
    badge: 'Neutro (0)',
    corBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    corBorder: 'border-emerald-200',
    corBg: 'bg-emerald-50/40',
    exemplos: ['exílio', 'exemplo', 'exame', 'êxodo', 'exército'],
    regra: 'Ocorre com o X em posição intervocálica após a letra E inicial.',
  },
  {
    id: 'ch',
    sound: 'Som de /ʃ/ (CH)',
    relation: '1 Letra = 1 Som',
    badge: 'Neutro (0)',
    corBadge: 'bg-purple-100 text-purple-800 border-purple-200',
    corBorder: 'border-purple-200',
    corBg: 'bg-purple-50/40',
    exemplos: ['caixa', 'mexer', 'mexicano', 'enxada', 'lixo'],
    regra: 'Som de quieto / chiado. Mantém a relação padrão de 1 letra para 1 fonema.',
  },
  {
    id: 'ks',
    sound: 'Som de /ks/ (Dífono)',
    relation: '1 Letra = 2 SONS',
    badge: 'Dífono (+1 F)',
    corBadge: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    corBorder: 'border-amber-300',
    corBg: 'bg-amber-50/60',
    exemplos: ['táxi (4L = 5F)', 'complexo (8L = 9F)', 'fixo (4L = 5F)', 'tórax (5L = 6F)', 'nexo (4L = 5F)'],
    regra: 'Único caso que altera o cálculo numérico: soma-se +1 fonema (F = L + 1).',
  },
];

export const PolifoniaDoXVisualGuide: React.FC<PolifoniaDoXVisualGuideProps> = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (soundName: string, exemplos: string[], index: number) => {
    const text = `Polifonia do X - ${soundName}:\nExemplos: ${exemplos.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-teal-200 bg-white shadow-xs">
      <div className="flex flex-wrap items-center justify-between border-b border-teal-100 bg-gradient-to-r from-teal-900 to-slate-900 px-4 py-3 text-white sm:px-5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300">
            <Volume2 className="h-4 w-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">Quadro da Polifonia da Letra "X"</span>
            <span className="ml-2 hidden text-xs text-teal-200/80 sm:inline">4 valores sonoros em concursos</span>
          </div>
        </div>
        <span className="rounded-full bg-teal-800/80 px-2.5 py-0.5 text-[11px] font-semibold text-teal-200">
          Foco: Dífono /ks/ (+1 Fonema)
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="mb-4 rounded-xl border border-teal-100 bg-teal-50/50 p-3 text-xs leading-relaxed text-teal-950 flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 text-teal-700 mt-0.5" />
          <span>
            A letra <strong>X</strong> possui 4 realizações sonoras. Apenas o som de <strong>/ks/</strong> constitui um <strong>dífono</strong> (uma letra gerando dois fonemas simultâneos), aumentando a contagem total de fonemas em +1.
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {X_SOUNDS.map((sound, index) => (
            <div
              key={sound.id}
              className={`flex flex-col justify-between rounded-xl border ${sound.corBorder} ${sound.corBg} p-3.5 shadow-2xs`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <h4 className="m-0 text-xs font-bold text-slate-900">{sound.sound}</h4>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] border ${sound.corBadge}`}>
                    {sound.badge}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-600 mb-2">
                  {sound.relation}
                </div>
                <p className="m-0 text-xs text-slate-700 leading-snug mb-3">
                  {sound.regra}
                </p>

                <div className="rounded-lg bg-white/90 p-2 text-xs border border-slate-200/70">
                  <div className="text-[11px] font-bold text-slate-500 mb-1">Exemplos:</div>
                  <div className="flex flex-wrap gap-1">
                    {sound.exemplos.map((ex) => (
                      <span
                        key={ex}
                        className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-800"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 border-t border-slate-200/50 pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleCopy(sound.sound, sound.exemplos, index)}
                  className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50"
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
