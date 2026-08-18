import React, { useState } from 'react';
import { BookOpen, CheckCircle2, HelpCircle, Sparkles, Copy, Check, ArrowRightLeft } from 'lucide-react';

interface PorquesVisualGuideProps {
  rawSource?: string;
}

interface PorquItem {
  id: string;
  forma: string;
  tipo: string;
  estrutura: string;
  significadoRegra: string;
  substituicoes: string[];
  exemplos: { frase: string; destaque: string; explicacao: string }[];
  dicaMnemica: string;
  corBorda: string;
  corBg: string;
  corBadge: string;
  corTexto: string;
}

const PORQUES_DATA: PorquItem[] = [
  {
    id: 'por-que',
    forma: 'Por que',
    tipo: 'Interrogativo ou Relativo',
    estrutura: 'Separado e Sem Acento',
    significadoRegra: 'Usado no início/meio de frases interrogativas (diretas ou indiretas) ou como pronome relativo equivalendo a "pelo qual".',
    substituicoes: ['por qual razão', 'por qual motivo', 'pelo qual / pela qual'],
    exemplos: [
      {
        frase: 'Por que você não compareceu à aula ontem?',
        destaque: 'Por que',
        explicacao: 'Início de pergunta direta (= por qual razão).',
      },
      {
        frase: 'Não entendi por que todos riram da situação.',
        destaque: 'por que',
        explicacao: 'Pergunta indireta no meio do período (= por qual motivo).',
      },
      {
        frase: 'Os caminhos por que passei eram difíceis.',
        destaque: 'por que',
        explicacao: 'Pronome relativo (= pelos quais passei).',
      },
    ],
    dicaMnemica: 'Separado para perguntar ou ligar orações (equivale a "por qual razão" ou "pelo qual").',
    corBorda: 'border-blue-200 hover:border-blue-400',
    corBg: 'bg-blue-50/40',
    corBadge: 'bg-blue-100 text-blue-800 border-blue-200',
    corTexto: 'text-blue-900',
  },
  {
    id: 'por-que-acento',
    forma: 'Por quê',
    tipo: 'Tônico de Fim de Frase',
    estrutura: 'Separado e Com Acento',
    significadoRegra: 'Usado imediatamente antes de ponto final (.), interrogação (?) ou exclamação (!), ou isolado como pergunta. A proximidade da pausa torna o "quê" tônico.',
    substituicoes: ['por qual razão (ao final)', 'por qual motivo (ao final)'],
    exemplos: [
      {
        frase: 'Eles resolveram cancelar o projeto, mas ninguém sabe por quê.',
        destaque: 'por quê.',
        explicacao: 'Final de período, antes do ponto final.',
      },
      {
        frase: 'Você não vai ao concurso? Por quê?',
        destaque: 'Por quê?',
        explicacao: 'Isolado como oração interrogativa unívoca.',
      },
    ],
    dicaMnemica: 'O acento circunflexo é o "chapéu" que ele ganha quando bate na parede da pontuação.',
    corBorda: 'border-amber-200 hover:border-amber-400',
    corBg: 'bg-amber-50/40',
    corBadge: 'bg-amber-100 text-amber-800 border-amber-200',
    corTexto: 'text-amber-900',
  },
  {
    id: 'porque',
    forma: 'Porque',
    tipo: 'Conjunção Causal ou Explicativa',
    estrutura: 'Junto e Sem Acento',
    significadoRegra: 'Usado para introduzir justificativas, causas, respostas ou explicações. Liga orações indicando motivo ou finalidade.',
    substituicoes: ['pois', 'já que', 'visto que', 'para que'],
    exemplos: [
      {
        frase: 'Fui aprovado porque estudei com o Método SuVeCA.',
        destaque: 'porque',
        explicacao: 'Causa/justificativa (= pois / já que estudei).',
      },
      {
        frase: 'Não se preocupe, porque tudo dará certo no edital.',
        destaque: 'porque',
        explicacao: 'Explicação oracional (= visto que).',
      },
    ],
    dicaMnemica: 'Junto porque é uma resposta unida que justifica e explica a oração.',
    corBorda: 'border-emerald-200 hover:border-emerald-400',
    corBg: 'bg-emerald-50/40',
    corBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    corTexto: 'text-emerald-900',
  },
  {
    id: 'porque-acento',
    forma: 'Porquê',
    tipo: 'Substantivo Masculino Pleno',
    estrutura: 'Junto e Com Acento',
    significadoRegra: 'Funciona como substantivo que significa "o motivo", "a razão". É obrigatoriamente precedido por artigo, pronome, numeral ou adjetivo (determinante) e aceita plural.',
    substituicoes: ['o motivo', 'a razão', 'a causa'],
    exemplos: [
      {
        frase: 'Ele não explicou o porquê de tanta ansiedade.',
        destaque: 'o porquê',
        explicacao: 'Precedido pelo artigo "o" (= o motivo).',
      },
      {
        frase: 'Existem muitos porquês para continuarmos focados.',
        destaque: 'muitos porquês',
        explicacao: 'Substantivo pluralizado acompanhado do pronome "muitos".',
      },
    ],
    dicaMnemica: 'Vem sempre de terno (determinante na frente: "o", "um", "este", "meu") e aceita plural.',
    corBorda: 'border-purple-200 hover:border-purple-400',
    corBg: 'bg-purple-50/40',
    corBadge: 'bg-purple-100 text-purple-800 border-purple-200',
    corTexto: 'text-purple-900',
  },
];

const PRATICA_EXEMPLOS = [
  {
    frase: 'Você não compareceu à revisão de véspera. _____ ?',
    resposta: 'Por quê',
    explicacao: 'Fim de frase antes do ponto de interrogação.',
  },
  {
    frase: 'Não entendi _____ a banca anulou aquela questão de sintaxe.',
    resposta: 'por que',
    explicacao: 'Pergunta indireta (= por qual razão).',
  },
  {
    frase: 'Aprovados comemoraram _____ mantiveram a consistência.',
    resposta: 'porque',
    explicacao: 'Conjunção explicativa/causal (= pois mantiveram).',
  },
  {
    frase: 'O professor explicou todo o _____ da regra do sujeito.',
    resposta: 'porquê',
    explicacao: 'Substantivo acompanhado do artigo determinante "o".',
  },
];

export const PorquesVisualGuide: React.FC<PorquesVisualGuideProps> = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cards' | 'pratica'>('cards');
  const [praticaRespostas, setPraticaRespostas] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const handleCopyResumo = () => {
    const text = `RESUMO RÁPIDO - OS 4 PORQUÊS:
1. Por que (separado/sem acento): Início/meio de perguntas ou pronome relativo (= por qual razão / pelo qual).
2. Por quê (separado/com acento): Fim de frase ou isolado antes de pontuação.
3. Porque (junto/sem acento): Respostas, justificativas e causas (= pois / já que).
4. Porquê (junto/com acento): Substantivo (= o motivo, a razão), exige determinante (o, um, meu) e aceita plural.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="porques-visual-guide my-6 overflow-hidden rounded-2xl border border-teal-200/90 bg-white shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-100 bg-gradient-to-r from-teal-900 to-slate-900 px-4 py-3.5 text-white sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="m-0 text-sm font-bold tracking-tight sm:text-base text-white">
              Guia Visual do Emprego dos 4 Porquês
            </h3>
            <p className="m-0 text-xs text-teal-200/80">
              Esquema prático comparativo com regras de substituição imediata
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-white/10 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('cards')}
              className={`rounded-md px-3 py-1.5 transition ${
                activeTab === 'cards' ? 'bg-white text-teal-950 shadow-xs' : 'text-teal-100 hover:text-white'
              }`}
            >
              Cards Didáticos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pratica')}
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 transition ${
                activeTab === 'pratica' ? 'bg-white text-teal-950 shadow-xs' : 'text-teal-100 hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Treino Rápido
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyResumo}
            className="flex items-center gap-1.5 rounded-lg border border-teal-400/30 bg-teal-800/40 px-2.5 py-1.5 text-xs font-medium text-teal-100 transition hover:bg-teal-700/50 hover:text-white"
            title="Copiar resumo rápido"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'cards' ? (
        <div className="p-4 sm:p-6">
          {/* Regra Mnemônica Rápida */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-100 bg-teal-50/60 px-4 py-3 text-xs text-teal-950">
            <div className="flex items-center gap-2 font-medium">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-700 text-[10px] font-bold text-white">
                💡
              </span>
              <span>
                <strong>Macete das Bancas:</strong> Separado pergunta; junto responde; com acento no fim; sem acento no começo.
              </span>
            </div>
            <span className="text-teal-700">Clique nos cards para destacar</span>
          </div>

          {/* Grid dos 4 Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {PORQUES_DATA.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(isSelected ? null : item.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${item.corBorda} ${item.corBg} ${
                    isSelected ? 'ring-2 ring-teal-600 shadow-md scale-[1.01]' : 'hover:shadow-sm'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedId(isSelected ? null : item.id)}
                  aria-pressed={isSelected}
                >
                  {/* Cabeçalho do Card */}
                  <div className="mb-2.5 flex items-start justify-between gap-2">
                    <div>
                      <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${item.corBadge}`}>
                        {item.estrutura}
                      </span>
                      <h4 className={`m-0 mt-1.5 text-xl font-extrabold tracking-tight ${item.corTexto}`}>
                        {item.forma}
                      </h4>
                    </div>
                    <span className="rounded-full bg-white/80 px-2 py-1 text-[11px] font-bold text-slate-600 shadow-2xs">
                      {item.tipo.split(' ')[0]}
                    </span>
                  </div>

                  {/* Descrição / Regra */}
                  <p className="m-0 mb-3 text-xs leading-relaxed text-slate-700">
                    {item.significadoRegra}
                  </p>

                  {/* Macete de Substituição */}
                  <div className="mb-3 rounded-lg bg-white/80 p-2.5 border border-slate-200/60 text-xs">
                    <div className="flex items-center gap-1 font-bold text-slate-800 mb-1">
                      <ArrowRightLeft className="h-3 w-3 text-teal-600" />
                      <span>Substitua mentalmente por:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.substituicoes.map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="rounded bg-teal-50 px-1.5 py-0.5 text-[11px] font-semibold text-teal-900 border border-teal-100"
                        >
                          "{sub}"
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Exemplos */}
                  <div className="space-y-1.5">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Exemplos em Prova:
                    </span>
                    {item.exemplos.map((ex, eIdx) => (
                      <div key={eIdx} className="rounded-md bg-white/90 p-2 text-xs border border-slate-100">
                        <p className="m-0 font-medium text-slate-800">
                          {ex.frase}
                        </p>
                        <span className="mt-0.5 block text-[11px] text-slate-500 italic">
                          ↳ {ex.explicacao}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Dica Mnemônica */}
                  <div className="mt-3 border-t border-slate-200/60 pt-2 text-[11px] text-slate-600">
                    <span className="font-bold text-slate-700">Mnemônico: </span>
                    {item.dicaMnemica}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Aba de Treino Rápido */
        <div className="p-4 sm:p-6">
          <div className="mb-4">
            <h4 className="m-0 text-sm font-bold text-slate-900">
              Fixação Rápida: Escolha o porquê correto
            </h4>
            <p className="m-0 text-xs text-slate-600">
              Revele a justificativa sintática para cada frase típica de concurso.
            </p>
          </div>

          <div className="space-y-3">
            {PRATICA_EXEMPLOS.map((item, idx) => {
              const isRevealed = Boolean(praticaRespostas[idx]);
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="m-0 text-sm font-medium text-slate-900">
                      <span className="mr-2 font-bold text-teal-700">{idx + 1}.</span>
                      {item.frase}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setPraticaRespostas((prev) => ({
                          ...prev,
                          [idx]: !prev[idx],
                        }))
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-white px-3 py-1.5 text-xs font-bold text-teal-800 shadow-2xs hover:bg-teal-50"
                    >
                      {isRevealed ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          Ocultar Gabarito
                        </>
                      ) : (
                        <>
                          <HelpCircle className="h-3.5 w-3.5 text-teal-600" />
                          Ver Resposta
                        </>
                      )}
                    </button>
                  </div>

                  {isRevealed && (
                    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-950 animate-in fade-in duration-200">
                      <div className="font-bold text-emerald-900">
                        Correto: <span className="underline">{item.resposta}</span>
                      </div>
                      <div className="mt-1 text-slate-700">{item.explicacao}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
