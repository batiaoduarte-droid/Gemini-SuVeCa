import React, { useState, useMemo } from 'react';
import {
  Layers,
  Sparkles,
  Calculator,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  Maximize2,
  Volume2,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { ModalShell } from './ModalShell';

interface SyllablePhoneticsVisualGuideProps {
  rawSource?: string;
}

interface PillarItem {
  id: string;
  title: string;
  badge: string;
  corBorda: string;
  corBg: string;
  corBadge: string;
  corTexto: string;
  items: {
    label: string;
    detail: string;
    exemplos?: string;
    formula?: string;
  }[];
}

const PILLARS_DATA: PillarItem[] = [
  {
    id: 'encontros-vocalicos',
    title: '1. Encontros Vocálicos',
    badge: 'Vogal + Semivogal',
    corBorda: 'border-blue-200 hover:border-blue-400',
    corBg: 'bg-blue-50/40',
    corBadge: 'bg-blue-100 text-blue-800 border-blue-200',
    corTexto: 'text-blue-900',
    items: [
      {
        label: 'Hiato (V + V)',
        detail: 'Duas vogais plenas em sílabas distintas. Não possui semivogal.',
        exemplos: 'ma-te-ri-al, po-e-si-a, e-co-no-mi-a, sa-ú-de, ál-co-ol',
        formula: 'V | V (Sempre separadas)',
      },
      {
        label: 'Ditongo Crescente (SV + V)',
        detail: 'Semivogal + Vogal na mesma sílaba. Passível de virar hiato / proparoxítona eventual (DC = H).',
        exemplos: 'e-mer-gên-cia, cui-da-do, ma-lí-cia, sé-rie, his-tó-ria',
        formula: 'SV + V (DC = H em bancas como Cebraspe)',
      },
      {
        label: 'Ditongo Decrescente (V + SV)',
        detail: 'Vogal + Semivogal na mesma sílaba. Nunca se separa e nunca vira hiato (DD ≠ H).',
        exemplos: 'gra-tui-to, bei-ra, ve-lei-ros, pai, noi-te, pão',
        formula: 'V + SV (Inseparável)',
      },
      {
        label: 'Tritongo (SV + V + SV)',
        detail: 'Uma única vogal central ladeada por duas semivogais. Nunca são "três vogais".',
        exemplos: 'U-ru-guai, quais, en-xá-guem, quão',
        formula: 'SV + V + SV (Ápice vocálico central)',
      },
    ],
  },
  {
    id: 'grafema-fonema',
    title: '2. Relação Letra vs. Fonema',
    badge: 'Cálculo Fonêmico',
    corBorda: 'border-emerald-200 hover:border-emerald-400',
    corBg: 'bg-emerald-50/40',
    corBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    corTexto: 'text-emerald-900',
    items: [
      {
        label: 'Letra vs. Fonema',
        detail: 'Letra (L) = grafema visual escrito. Fonema (F) = som articulado emitido.',
        exemplos: 'Pato (4L = 4F), Hora (4L = 3F, H mudo)',
      },
      {
        label: 'Dígrafo Consonantal (-1 fonema)',
        detail: 'Duas letras que emitem um só som consonantal: CH, LH, NH, RR, SS, SC, SÇ, XC.',
        exemplos: 'cha-ve (5L = 4F), car-ro (5L = 4F), des-cer (6L = 5F)',
        formula: '2 Letras = 1 Fonema (Subtrai 1)',
      },
      {
        label: 'Dígrafo Vocálico (-1 fonema)',
        detail: 'Vogal seguida de M ou N na mesma sílaba atuando como til de nasalização.',
        exemplos: 'tam-pa (5L = 4F), pon-tes (6L = 5F), cam-po (5L = 4F)',
        formula: 'AM, AN, EM, EN, IM, IN, OM, ON, UM, UN',
      },
      {
        label: 'Grupos QU e GU (Teste do U)',
        detail: 'Se U for mudo = Dígrafo (-1). Se U for audível (/w/) = Não é dígrafo, forma Ditongo.',
        exemplos: 'esqueleto (U mudo = dígrafo) vs. quantidade / quase (U audível = ditongo)',
      },
    ],
  },
  {
    id: 'divisao-silabica',
    title: '3. Divisão Silábica e Consoantes',
    badge: 'Mantra da Vogal Única',
    corBorda: 'border-purple-200 hover:border-purple-400',
    corBg: 'bg-purple-50/40',
    corBadge: 'bg-purple-100 text-purple-800 border-purple-200',
    corTexto: 'text-purple-900',
    items: [
      {
        label: 'Consoante Muda Medial',
        detail: 'Consoante sem vogal no meio do vocábulo recua obrigatoriamente para a sílaba anterior.',
        exemplos: 'at-mos-fe-ra, co-lap-so, et-ni-a, felds-pa-to, dig-no, sub-li-nhar',
      },
      {
        label: 'Consoante Muda Inicial',
        detail: 'Consoante desprovida de vogal no início da palavra não se separa; forma monossílabo.',
        exemplos: 'pneu (1 sílaba), psi-co-se (3 sílabas), gno-mo',
      },
      {
        label: 'Dígrafos Separáveis vs. Inseparáveis',
        detail: 'Separáveis: RR, SS, SC, SÇ, XC (car-ro, pas-so). Inseparáveis: CH, LH, NH, GU, QU.',
        exemplos: 'ter-ra, an-das-se, des-cer vs. cha-ve, fi-lho, ni-nho',
      },
      {
        label: 'Paroxítonas em Ditongo',
        detail: 'Divisão clássica padrão na mesma sílaba: ma-lí-cia, su-per-fí-cie, his-tó-ria.',
        exemplos: 'Cebraspe admite dupla divisão: ma-lí-cia (paroxítona) ou ma-lí-ci-a (proparoxítona aparente)',
      },
    ],
  },
  {
    id: 'polifonia-x',
    title: '4. Polifonia do "X" e Dífonos',
    badge: '1 Letra = 2 Fonemas',
    corBorda: 'border-amber-200 hover:border-amber-400',
    corBg: 'bg-amber-50/40',
    corBadge: 'bg-amber-100 text-amber-800 border-amber-200',
    corTexto: 'text-amber-900',
    items: [
      {
        label: 'Dífono /ks/ (+1 fonema)',
        detail: 'A letra X representa o par fonético /ks/ ou /cs/. O número de fonemas supera o de letras.',
        exemplos: 'se-xu-al (5L = 6F), co-ne-xão (6L = 6F, -1 dígrafo +1 dífono), tá-xi (4L = 5F), tó-xi-co (6L = 7F)',
        formula: 'X = /ks/ (Soma +1 ao cômputo)',
      },
      {
        label: 'Som de /s/ ou /ss/',
        detail: 'X soa como /s/ ou /ss/ (1L = 1F). Atenção especial à ortoepia de "sintaxe".',
        exemplos: 'ex-pi-rar, êx-ta-se, tex-to, sin-ta-xe (/sin\'tasi/, não é dífono!)',
      },
      {
        label: 'Som de /ch/ (/ʃ/)',
        detail: 'X soa como /ch/ (1L = 1F).',
        exemplos: 'li-xo, pi-xo, en-xa-da, pei-xe',
      },
      {
        label: 'Som de /z/',
        detail: 'X intervocálico que soa como /z/ (1L = 1F).',
        exemplos: 'e-xa-me, e-xaus-ti-va-men-te, e-xér-ci-to',
      },
    ],
  },
];

// Calculation helper for fonemas vs grafemas
export const calculatePhonemes = (word: string) => {
  const clean = word.trim().toLowerCase();
  if (!clean) return null;

  const letras = clean.replace(/[^a-záàâãéêíóôõúç]/g, '').length;
  let digrafosConsonantais = 0;
  let digrafosVocalicos = 0;
  let difonosX = 0;
  let hInicial = clean.startsWith('h') ? 1 : 0;
  const detalhamento: string[] = [];

  if (hInicial > 0) {
    detalhamento.push('H inicial mudo (-1)');
  }

  // Dígrafos consonantais
  const dcList = ['ch', 'lh', 'nh', 'rr', 'ss', 'sc', 'sç', 'xc', 'xs'];
  for (const dc of dcList) {
    const matches = clean.split(dc).length - 1;
    if (matches > 0) {
      digrafosConsonantais += matches;
      detalhamento.push(`Dígrafo consonantal "${dc}" (${matches}x, -${matches})`);
    }
  }

  // Grupos qu/gu com e/i (heurística didática padrão)
  const quMatches = (clean.match(/qu[ei]/g) || []).length;
  const guMatches = (clean.match(/gu[ei]/g) || []).length;
  if (quMatches > 0 && !clean.includes('tranquil') && !clean.includes('cinquent')) {
    digrafosConsonantais += quMatches;
    detalhamento.push(`Grupo "qu" com U mudo (${quMatches}x, -${quMatches})`);
  }
  if (guMatches > 0 && !clean.includes('aguen') && !clean.includes('lingui')) {
    digrafosConsonantais += guMatches;
    detalhamento.push(`Grupo "gu" com U mudo (${guMatches}x, -${guMatches})`);
  }

  // Dígrafos vocálicos (am, an, em, en, im, in, om, on, um, un antes de consoante ou fim de sílaba)
  const dvMatches = (clean.match(/[aeiou][mn](?=[bcdfghjklmnpqrstvwxyz]|$)/g) || []).length;
  if (dvMatches > 0) {
    digrafosVocalicos += dvMatches;
    detalhamento.push(`Dígrafo vocálico nasal (${dvMatches}x, -${dvMatches})`);
  }

  // Dífonos do X
  const difonosConhecidos = [
    'tóxico', 'toxico', 'tóxica', 'toxica', 'táxi', 'taxi', 'sexo', 'sexual', 'sexualidade',
    'nexo', 'conexo', 'conexão', 'conexao', 'fixo', 'fixar', 'crucifixo', 'asfixia', 'intoxicação',
    'complexo', 'reflexo', 'anexo', 'tórax', 'torax', 'clímax', 'climax', 'oxigênio', 'oxigenio'
  ];
  if (difonosConhecidos.some((w) => clean.includes(w))) {
    difonosX += 1;
    detalhamento.push('Dífono X = /ks/ (+1 fonema)');
  }

  const totalDigrafos = digrafosConsonantais + digrafosVocalicos + hInicial;
  const fonemas = letras - totalDigrafos + difonosX;

  return {
    palavra: word.trim(),
    letras,
    digrafos: totalDigrafos,
    difonos: difonosX,
    fonemas,
    detalhamento,
  };
};

export const SyllablePhoneticsVisualGuide: React.FC<SyllablePhoneticsVisualGuideProps> = () => {
  const [activeTab, setActiveTab] = useState<'pilares' | 'calculadora' | 'algoritmo'>('pilares');
  const [testWord, setTestWord] = useState('tóxico');
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const calcResult = useMemo(() => calculatePhonemes(testWord), [testWord]);

  const handleCopyResumo = () => {
    const text = `SÍNTESE DA SÍLABA E FONÉTICA:
1. Mantra da Vogal Única: Toda sílaba tem exatamente 1 Vogal.
2. Hiato (V+V, sílabas separadas) vs. Ditongo Crescente (SV+V, DC=H) vs. Ditongo Decrescente (V+SV, DD≠H).
3. Fórmula Fonêmica: Fonemas = Letras - (Dígrafos + H inicial) + (Dífonos X=/ks/).
4. Consoantes mudas recuam para a sílaba anterior (af-ta, et-ni-a).
5. Ortoepia de "Sintaxe": som de /ss/ (/sin'tasi/), não é dífono.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="syllable-phonetics-guide my-6 overflow-hidden rounded-2xl border border-teal-200/90 bg-white shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-100 bg-gradient-to-r from-teal-950 via-slate-900 to-teal-900 px-4 py-3.5 text-white sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300">
            <Volume2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="m-0 text-sm font-bold tracking-tight sm:text-base text-white">
              Esquema de Sílaba, Fonética e Fonemas
            </h3>
            <p className="m-0 text-xs text-teal-200/80">
              Pilares fonológicos consolidados com calculadora e algoritmo de resolução
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-white/10 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('pilares')}
              className={`rounded-md px-3 py-1.5 transition ${
                activeTab === 'pilares' ? 'bg-white text-teal-950 shadow-xs' : 'text-teal-100 hover:text-white'
              }`}
            >
              4 Pilares
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('algoritmo')}
              className={`rounded-md px-3 py-1.5 transition ${
                activeTab === 'algoritmo' ? 'bg-white text-teal-950 shadow-xs' : 'text-teal-100 hover:text-white'
              }`}
            >
              Algoritmo
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('calculadora')}
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 transition ${
                activeTab === 'calculadora' ? 'bg-white text-teal-950 shadow-xs' : 'text-teal-100 hover:text-white'
              }`}
            >
              <Calculator className="h-3.5 w-3.5" />
              Calculadora
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

      {/* Mantra da Vogal Única Callout */}
      <div className="border-b border-teal-100 bg-teal-50/70 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-teal-950">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-700 text-[10px] font-bold text-white">
              ⚡
            </span>
            <span>
              <strong>Mantra Canônico:</strong> Toda sílaba tem ao menos e somente <strong>UMA vogal</strong>. A letra <strong>"A"</strong> é sempre vogal absoluta.
            </span>
          </div>
          <span className="font-mono font-bold text-teal-800">
            F = L - (Dígrafos + H) + Dífonos(X)
          </span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-6">
        {activeTab === 'pilares' && (
          <div className="grid gap-4 md:grid-cols-2">
            {PILLARS_DATA.map((pillar) => (
              <div
                key={pillar.id}
                className={`rounded-xl border p-4 transition-all duration-200 ${pillar.corBorda} ${pillar.corBg} shadow-2xs hover:shadow-xs`}
              >
                <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                  <h4 className={`m-0 text-sm font-extrabold tracking-tight ${pillar.corTexto}`}>
                    {pillar.title}
                  </h4>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${pillar.corBadge}`}>
                    {pillar.badge}
                  </span>
                </div>

                <div className="space-y-3">
                  {pillar.items.map((item, iIdx) => (
                    <div key={iIdx} className="rounded-lg bg-white/90 p-2.5 text-xs border border-slate-200/70 shadow-2xs">
                      <div className="flex items-center justify-between gap-1.5 font-bold text-slate-900">
                        <span>{item.label}</span>
                        {item.formula && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-mono text-teal-800">
                            {item.formula}
                          </span>
                        )}
                      </div>
                      <p className="m-0 mt-1 text-slate-600 leading-relaxed">
                        {item.detail}
                      </p>
                      {item.exemplos && (
                        <div className="mt-1.5 rounded bg-slate-50 px-2 py-1 text-[11px] text-slate-700 border border-slate-100">
                          <span className="font-semibold text-teal-900">Exemplos: </span>
                          <span className="italic">{item.exemplos}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'algoritmo' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4">
              <h4 className="m-0 text-sm font-bold text-teal-950 mb-1">
                Roteiro Passo a Passo para Contagem Fonêmica em Provas
              </h4>
              <p className="m-0 text-xs text-teal-800">
                Siga esta sequência algorítmica para não errar itens do Cebraspe, FGV e FCC.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-blue-950 mb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-700 text-white text-[11px]">1</span>
                  <span>Contar Letras (L)</span>
                </div>
                <p className="m-0 text-slate-700 leading-relaxed">
                  Conte os grafemas totais visíveis escritos na palavra.
                </p>
                <div className="mt-2 rounded bg-white p-2 text-[11px] font-mono text-blue-900 border border-blue-100">
                  Ex: "TÓXICO" = 6 letras
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-950 mb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-white text-[11px]">2</span>
                  <span>Subtrair Dígrafos (-1)</span>
                </div>
                <p className="m-0 text-slate-700 leading-relaxed">
                  Rastreie dígrafos consonantais (CH, RR, SS...) e vocálicos (AM, EN...). Subtraia 1 fonema por ocorrência.
                </p>
                <div className="mt-2 rounded bg-white p-2 text-[11px] font-mono text-emerald-900 border border-emerald-100">
                  Ex: "CHAVE" (5L - 1 = 4F)
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-950 mb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 text-white text-[11px]">3</span>
                  <span>Somar Dífonos (+1)</span>
                </div>
                <p className="m-0 text-slate-700 leading-relaxed">
                  Se a letra X tiver som de /ks/ (sexo, tóxico, táxi), adicione +1 fonema.
                </p>
                <div className="mt-2 rounded bg-white p-2 text-[11px] font-mono text-amber-900 border border-amber-100">
                  Ex: "TÁXI" (4L + 1 = 5F)
                </div>
              </div>

              <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-3.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-purple-950 mb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-700 text-white text-[11px]">4</span>
                  <span>Fórmula Final</span>
                </div>
                <p className="m-0 text-slate-700 leading-relaxed">
                  Aplique a equação unificada para obter o total exato de fonemas.
                </p>
                <div className="mt-2 rounded bg-white p-2 text-[11px] font-bold font-mono text-purple-900 border border-purple-100">
                  F = L - Dígrafos + Dífonos
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calculadora' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-4">
              <label htmlFor="test-word-input" className="block text-xs font-bold text-teal-950 mb-1.5">
                Digite um vocábulo para testar a contagem fonêmica instantânea:
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  id="test-word-input"
                  type="text"
                  value={testWord}
                  onChange={(e) => setTestWord(e.target.value)}
                  placeholder="Ex: conexão, tóxico, guerra, queijo, sintaxe..."
                  className="flex-1 min-w-[200px] rounded-lg border border-teal-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-900 shadow-2xs focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
                <div className="flex flex-wrap gap-1.5 items-center">
                  {['tóxico', 'conexão', 'guerra', 'queijo', 'sintaxe', 'psicologia', 'pneu'].map((word) => (
                    <button
                      key={word}
                      type="button"
                      onClick={() => setTestWord(word)}
                      className="rounded-md border border-teal-200 bg-white px-2 py-1 text-xs font-semibold text-teal-800 hover:bg-teal-50"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {calcResult && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="grid gap-3 sm:grid-cols-4 text-center">
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <span className="text-xs text-slate-500 font-medium">Palavra</span>
                    <div className="text-base font-bold text-slate-900">{calcResult.palavra}</div>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-3 border border-blue-100">
                    <span className="text-xs text-blue-700 font-medium">Letras (L)</span>
                    <div className="text-xl font-extrabold text-blue-900">{calcResult.letras}</div>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-3 border border-amber-100">
                    <span className="text-xs text-amber-700 font-medium">Ajustes (Dígrafos/X)</span>
                    <div className="text-sm font-bold text-amber-900">
                      -{calcResult.digrafos} / +{calcResult.difonos}
                    </div>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-100">
                    <span className="text-xs text-emerald-700 font-medium">Fonemas Finais (F)</span>
                    <div className="text-xl font-extrabold text-emerald-900">{calcResult.fonemas}</div>
                  </div>
                </div>

                {calcResult.detalhamento.length > 0 && (
                  <div className="mt-3 border-t border-slate-100 pt-2.5">
                    <span className="text-xs font-bold text-slate-700 block mb-1">Fenômenos Detectados:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {calcResult.detalhamento.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 rounded bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-900 border border-teal-100"
                        >
                          <CheckCircle2 className="h-3 w-3 text-teal-600" />
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Tela Cheia */}
      <ModalShell
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Esquema Consolidado de Sílaba e Fonética"
        maxWidth="max-w-5xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs text-slate-500">Visualização de Alta Resolução</span>
            <button
              type="button"
              onClick={handleCopyResumo}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copiado!' : 'Copiar Resumo'}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {PILLARS_DATA.map((pillar) => (
              <div key={pillar.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="font-bold text-sm text-slate-900 mb-2">{pillar.title}</div>
                <div className="space-y-2">
                  {pillar.items.map((item, i) => (
                    <div key={i} className="rounded bg-white p-2 text-xs border border-slate-200/60">
                      <div className="font-semibold text-teal-950">{item.label}</div>
                      <div className="text-slate-600 mt-0.5">{item.detail}</div>
                      {item.exemplos && <div className="text-[11px] text-slate-500 italic mt-1">{item.exemplos}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ModalShell>
    </div>
  );
};
