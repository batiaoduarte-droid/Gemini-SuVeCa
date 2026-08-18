import React, { isValidElement, useMemo, useState, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ChevronDown, ListTree } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { ResponsiveTable } from './ResponsiveTable';
import { ConnectionMap, looksLikeConnectionMap } from './ConnectionMap';
import { EnhancedCodeBlock } from './EnhancedCodeBlock';
import { QuestionBlock, type QuestionBlockModel } from './QuestionBlock';
import { PitfallCard, type PitfallItem } from './PitfallCard';
import { MnemonicCard, type MnemonicItem } from './MnemonicCard';
import { ResolutionStepper, type ResolutionGuide, type ResolutionStep } from './ResolutionStepper';
import { AnnotatedExampleCard, type ExampleItem } from './AnnotatedExampleCard';
import { GlossaryGrid, type GlossaryItem } from './GlossaryGrid';
import { ActiveRecallChecklist, type RecallItem } from './ActiveRecallChecklist';
import { ContrastViewerCard } from './ContrastViewerCard';
import { DeepExplanationViewer } from './DeepExplanationViewer';
import { PedagogicalCallout } from './PedagogicalCallout';
import { SuvecaConnectionViewer } from './SuvecaConnectionViewer';
import { PrerequisitesMentalModelViewer } from './PrerequisitesMentalModelViewer';
import { DecisiveRulesViewer } from './DecisiveRulesViewer';

interface MarkdownContentProps {
  content: string;
  className?: string;
  /** Enables a table of contents and collapsible sections in long study units. */
  pedagogical?: boolean;
}

interface DocumentSection {
  id: string;
  title: string;
  body: string;
}

type ContentSegment =
  | { kind: 'markdown'; content: string }
  | ({ kind: 'question' } & QuestionBlockModel);

const slug = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .slice(0, 72);

const splitDocumentSections = (content: string) => {
  const lines = content.split(/\r?\n/);
  const sections: DocumentSection[] = [];
  const intro: string[] = [];
  let current: { title: string; lines: string[] } | null = null;
  let fenced = false;

  const finish = () => {
    if (!current) return;
    const cleanTitle = current.title.replace(/^\d+[\.\-\)]\s*/, '').trim();
    const baseId = slug(cleanTitle) || `secao-${sections.length + 1}`;
    const duplicates = sections.filter((section) => section.id.startsWith(baseId)).length;
    sections.push({
      id: duplicates ? `${baseId}-${duplicates + 1}` : baseId,
      title: cleanTitle,
      body: current.lines.join('\n').trim(),
    });
  };

  for (const line of lines) {
    if (/^\s*```/.test(line)) fenced = !fenced;
    const heading = !fenced ? /^##\s+(.+?)\s*$/.exec(line) : null;
    if (heading) {
      finish();
      current = { title: heading[1].replace(/^\d+[\.\-\)]\s*/, '').trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else {
      intro.push(line);
    }
  }
  finish();
  return { intro: intro.join('\n').trim(), sections };
};

const extractQuestionMetadata = (title: string) => {
  const metadata = /\(([^()]*)\)\s*$/.exec(title);
  if (!metadata) return { title };
  const year = /\b(?:19|20)\d{2}\b/.exec(metadata[1])?.[0];
  const board = metadata[1]
    .replace(/\b(?:19|20)\d{2}\b/g, '')
    .replace(/^[\s,;\/-]+|[\s,;\/-]+$/g, '')
    .trim();
  return {
    title: title.slice(0, metadata.index).trim(),
    board: board || undefined,
    year,
  };
};

const splitAlternatives = (statement: string) => {
  const pattern = /(?:^|\n|\s)([A-E])\)\s*([\s\S]*?)(?=(?:\n|\s)[A-E]\)\s|$)/g;
  const matches = [...statement.matchAll(pattern)];
  if (matches.length < 2) return { prompt: statement.trim(), options: [] as Array<{ letter: string; text: string }> };
  const firstIndex = matches[0].index ?? statement.length;
  return {
    prompt: statement.slice(0, firstIndex).trim(),
    options: matches.map((match) => ({ letter: match[1], text: match[2].trim() })),
  };
};

const parseQuestion = (title: string, body: string): QuestionBlockModel => {
  const fields: Record<'prompt' | 'solution' | 'answer' | 'extra', string[]> = {
    prompt: [], solution: [], answer: [], extra: [],
  };
  let active: keyof typeof fields = 'extra';

  for (const line of body.split('\n')) {
    const field = /^\s*-\s+\*\*(Enunciado|Resolução(?: e Justificativa)?|Gabarito):\*\*\s*(.*)$/i.exec(line);
    if (field) {
      active = /^enunciado/i.test(field[1]) ? 'prompt' : /^gabarito/i.test(field[1]) ? 'answer' : 'solution';
      if (field[2]) fields[active].push(field[2]);
    } else {
      fields[active].push(line);
    }
  }

  const { prompt, options } = splitAlternatives(fields.prompt.join('\n').trim());
  return {
    ...extractQuestionMetadata(title),
    prompt: prompt || undefined,
    options,
    solution: fields.solution.join('\n').trim() || undefined,
    answer: fields.answer.join('\n').trim() || undefined,
    extra: fields.extra.join('\n').trim() || undefined,
  };
};

const splitQuestionSegments = (markdown: string): ContentSegment[] => {
  const lines = markdown.split(/\r?\n/);
  const segments: ContentSegment[] = [];
  let markdownLines: string[] = [];
  let question: { title: string; level: number; lines: string[] } | null = null;
  let fenced = false;

  const flushMarkdown = () => {
    const content = markdownLines.join('\n').trim();
    if (content) segments.push({ kind: 'markdown', content });
    markdownLines = [];
  };
  const flushQuestion = () => {
    if (!question) return;
    segments.push({ kind: 'question', ...parseQuestion(question.title, question.lines.join('\n')) });
    question = null;
  };

  for (const line of lines) {
    if (/^\s*```/.test(line)) fenced = !fenced;
    const heading = !fenced ? /^(#{3,6})\s+(Quest(?:ã|a)o\s+\d+[^\n]*)$/i.exec(line) : null;
    const otherHeading = !fenced ? /^(#{1,6})\s+/.exec(line) : null;
    const boundary = Boolean(question && otherHeading && otherHeading[1].length <= question.level);
    if (heading) {
      flushQuestion();
      flushMarkdown();
      question = { title: heading[2], level: heading[1].length, lines: [] };
    } else if (boundary) {
      flushQuestion();
      markdownLines.push(line);
    } else if (question) {
      question.lines.push(line);
    } else {
      markdownLines.push(line);
    }
  }
  flushQuestion();
  flushMarkdown();
  return segments;
};

const extractCodeSource = (children: ReactNode) => {
  const child = React.Children.toArray(children)[0];
  if (!isValidElement<{ children?: ReactNode }>(child)) return null;
  return String(child.props.children || '').replace(/\n$/, '');
};

const parsePitfalls = (body: string): PitfallItem[] | null => {
  const lines = body.split(/\r?\n/);
  const items: PitfallItem[] = [];
  let currentProblem: string[] = [];
  let currentSolution: string[] = [];
  let currentBank: string | undefined = undefined;
  let inItem = false;

  const flush = () => {
    if (currentProblem.length > 0 && currentSolution.length > 0) {
      const probText = currentProblem
        .join(' ')
        .replace(/^-\s*(?:Problema|Armadilha|Erro):\s*/i, '')
        .trim();
      const solText = currentSolution
        .join(' ')
        .replace(/^-\s*(?:Como Evitar|Vacina|Solu[çc][aã]o):\s*/i, '')
        .trim();

      if (probText.length > 3 && solText.length > 3) {
        items.push({
          bank: currentBank,
          problem: probText,
          solution: solText,
        });
      }
    }
    currentProblem = [];
    currentSolution = [];
    inItem = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/^Arquivo de origem:/i.test(line)) {
      const bankMatch = line.match(/\b(FGV|VUNESP|FCC|CEBRASPE|CESGRANRIO|AOCP|QUADRIX|IBFC)\b/i);
      if (bankMatch) currentBank = bankMatch[1].toUpperCase();
      continue;
    }
    if (/^-\s*(?:Problema|Armadilha|Erro):/i.test(line)) {
      flush();
      inItem = true;
      currentProblem.push(line);
    } else if (/^-\s*(?:Como Evitar|Vacina|Solu[çc][aã]o):/i.test(line)) {
      currentSolution.push(line);
    } else if (inItem) {
      if (currentSolution.length > 0) {
        if (line.startsWith('-') || line.startsWith('#')) {
          flush();
        } else if (line.length > 0 && !/^Arquivo de origem:/i.test(line)) {
          currentSolution.push(line);
        }
      } else if (currentProblem.length > 0) {
        if (line.startsWith('-') || line.startsWith('#')) {
          flush();
        } else if (line.length > 0 && !/^Arquivo de origem:/i.test(line)) {
          currentProblem.push(line);
        }
      }
    }
  }
  flush();

  return items.length > 0 ? items : null;
};

const parseMnemonics = (body: string): MnemonicItem[] | null => {
  const lines = body.split(/\r?\n/);
  const items: MnemonicItem[] = [];
  let buffer: string[] = [];

  const flush = () => {
    const text = buffer.join(' ').replace(/^Arquivo de origem:[^\n]*\s*/i, '').replace(/^-\s*/, '').trim();
    if (text.length > 10) {
      items.push({ body: text });
    }
    buffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flush();
      continue;
    }
    if (/^Arquivo de origem:/i.test(trimmed) || /^-\s+/i.test(trimmed)) {
      flush();
      buffer.push(trimmed);
    } else {
      buffer.push(trimmed);
    }
  }
  flush();

  return items.length > 0 ? items : null;
};

const parseGlossary = (body: string): GlossaryItem[] | null => {
  const lines = body.split(/\r?\n/);
  const items: GlossaryItem[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Matches "- — Termo: Definição" or "- Termo: Definição" or "- **Termo:** Definição"
    const match = trimmed.match(/^-\s*(?:—\s*)?(?:\*\*)?([^*:—]+?)(?:\*\*)?\s*:\s*(.+)$/);
    if (match && match[1].trim().length > 1 && match[2].trim().length > 3) {
      items.push({
        term: match[1].trim(),
        definition: match[2].trim(),
      });
    }
  }

  return items.length >= 2 ? items : null;
};

const parseActiveRecall = (body: string): RecallItem[] | null => {
  const lines = body.split(/\r?\n/);
  const items: RecallItem[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^(\d+)\.\s+(?:\*\*)?([^:*]+?)(?:\*\*)?(?::\s*(.+))?$/);
    if (match) {
      const num = parseInt(match[1], 10);
      const title = match[2].trim();
      const detail = match[3] ? match[3].trim() : undefined;
      if (title.length > 2) {
        items.push({ number: num, title, detail });
      }
    }
  }

  return items.length >= 2 ? items : null;
};

const parseResolution = (body: string): ResolutionGuide | null => {
  const lines = body.split(/\r?\n/);
  const steps: ResolutionStep[] = [];
  let objective: string | undefined = undefined;
  let currentStep: ResolutionStep | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || /^Arquivo de origem:/i.test(line)) continue;

    const objMatch = line.match(/^(?:###\s*Objetivo|\*\*Objetivo(?::)?\*\*|Objetivo:?)\s*(.*)$/i);
    if (objMatch) {
      if (objMatch[1].trim()) {
        objective = objMatch[1].trim();
      } else if (i + 1 < lines.length && !lines[i + 1].startsWith('#') && !lines[i + 1].match(/^\d+\./)) {
        objective = lines[i + 1].trim();
        i++;
      }
      continue;
    }

    const stepMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (stepMatch) {
      if (currentStep) steps.push(currentStep);
      const fullText = stepMatch[2].trim();
      const colonIdx = fullText.indexOf(':');
      let title = fullText;
      let description: string | undefined = undefined;
      if (colonIdx > 0 && colonIdx < 50) {
        title = fullText.slice(0, colonIdx).trim();
        description = fullText.slice(colonIdx + 1).trim();
      }
      currentStep = {
        number: parseInt(stepMatch[1], 10) || steps.length + 1,
        title,
        description,
        substeps: [],
      };
      continue;
    }

    if (line.startsWith('$$') || line.includes('\\text{')) {
      if (currentStep) {
        currentStep.formula = line.replace(/^\$\$|\$\$$/g, '').trim();
      }
      continue;
    }

    if (line.startsWith('- ') && currentStep) {
      currentStep.substeps = currentStep.substeps || [];
      currentStep.substeps.push(line.slice(2).trim());
    }
  }
  if (currentStep) steps.push(currentStep);

  return steps.length >= 2 ? { objective, steps } : null;
};

const parseAnnotatedExamples = (body: string): ExampleItem[] | null => {
  const lines = body.split(/\r?\n/);
  const items: ExampleItem[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('-') || !trimmed.includes('"')) continue;

    // Pattern: - ( / / PC-SP 2018): "Frase..." $\rightarrow$ Explicação $\rightarrow$ Gabarito: B
    const quoteMatch = trimmed.match(/"([^"]+)"/);
    if (!quoteMatch) continue;

    const sentence = quoteMatch[1];
    const headerPart = trimmed.slice(0, quoteMatch.index).replace(/^-\s*/, '').trim();
    const afterPart = trimmed.slice((quoteMatch.index || 0) + quoteMatch[0].length).trim();

    const metaMatch = headerPart.match(/\(([^)]+)\)/);
    let bank: string | undefined;
    let agency: string | undefined;
    let year: string | undefined;

    if (metaMatch) {
      const parts = metaMatch[1].split('/').map((s) => s.trim()).filter(Boolean);
      for (const p of parts) {
        if (/^(?:19|20)\d{2}$/.test(p)) year = p;
        else if (/\b(?:FGV|VUNESP|FCC|CEBRASPE|AOCP|CESGRANRIO|QUADRIX|IBFC)\b/i.test(p)) bank = p;
        else if (p.length > 1) agency = p;
      }
    }

    const gabaritoMatch = afterPart.match(/(?:Gabarito:?|C[oó]digo:?)\s*:?\s*([^\n]+)/i);
    const answer = gabaritoMatch ? gabaritoMatch[1].replace(/\.$/, '').trim() : undefined;
    const explanation = afterPart
      .replace(/\\rightarrow|\$\s*\\rightarrow\s*\$|->|→/g, ' → ')
      .replace(/(?:Gabarito:?|C[oó]digo:?).*$/i, '')
      .replace(/^\s*→\s*/, '')
      .replace(/\s*→\s*$/, '')
      .trim();

    items.push({
      bank,
      agency,
      year,
      sentence,
      explanation: explanation || 'Aplicação normativa em contexto real.',
      answer,
    });
  }

  return items.length >= 1 ? items : null;
};

const SectionBodyRenderer: React.FC<{ title: string; body: string }> = ({ title, body }) => {
  const normTitle = title.toLowerCase();

  // 1. Conexão com o método SuVeCA
  if (/conex[aã]o com o m[eé]todo suveca|suveca/i.test(normTitle)) {
    return <SuvecaConnectionViewer content={body} title={title} />;
  }

  // 2. Pré-requisitos e modelo mental
  if (/pr[eé]-requisitos e modelo mental|modelo mental|pr[eé]-requisitos/i.test(normTitle)) {
    return <PrerequisitesMentalModelViewer content={body} title={title} />;
  }

  // 3. Explicação didática aprofundada
  if (/explica[çc][aã]o did[aá]tica|fundamenta[çc][aã]o did[aá]tica/i.test(normTitle)) {
    return <DeepExplanationViewer content={body} title={title} />;
  }

  // 4. Regras decisivas / Regras priorizadas
  if (/regras decisivas|regras priorizadas|quadro de regras/i.test(normTitle)) {
    return <DecisiveRulesViewer content={body} title={title} />;
  }

  // 5. Contrastes que a prova explora
  if (/contrastes que a prova explora|contrastes/i.test(normTitle)) {
    return <ContrastViewerCard content={body} title={title} />;
  }

  // 6. Erros comuns e pegadinhas
  if (/erros comuns|pegadinha|armadilha/i.test(normTitle)) {
    const pitfalls = parsePitfalls(body);
    if (pitfalls && pitfalls.length > 0) {
      return <PitfallCard items={pitfalls} title={title} />;
    }
  }

  // 7. Exemplos comentados
  if (/exemplos comentados|exemplos para recupera[çc][aã]o|exemplos de aplica[çc][aã]o/i.test(normTitle)) {
    const examples = parseAnnotatedExamples(body);
    if (examples && examples.length > 0) {
      return <AnnotatedExampleCard items={examples} title={title} />;
    }
  }

  // 8. Memorização inteligente
  if (/memoriza[çc][aã]o inteligente|mnem[oô]nico/i.test(normTitle)) {
    const mnemonics = parseMnemonics(body);
    if (mnemonics && mnemonics.length > 0) {
      return <MnemonicCard items={mnemonics} title={title} />;
    }
  }

  // 9. Glossário operacional
  if (/gloss[aá]rio operacional|termos can[oô]nicos/i.test(normTitle)) {
    const glossary = parseGlossary(body);
    if (glossary && glossary.length > 0) {
      return <GlossaryGrid items={glossary} title={title} />;
    }
  }

  // 10. Síntese para recuperação ativa
  if (/s[ií]ntese para recupera[çc][aã]o ativa|protocolo de revis[aã]o ativa|s[ií]ntese estruturada/i.test(normTitle)) {
    const recall = parseActiveRecall(body);
    if (recall && recall.length > 0) {
      return <ActiveRecallChecklist items={recall} title={title} />;
    }
  }

  // 11. Roteiros de resolução
  if (/roteiros de resolu[çc][aã]o|algoritmo de resolu[çc][aã]o|roteiro de resolu[çc][aã]o/i.test(normTitle)) {
    const resolution = parseResolution(body);
    if (resolution && resolution.steps.length > 0) {
      return <ResolutionStepper guide={resolution} title={title} />;
    }
  }

  // Clean raw file origin traces before plain markdown rendering
  const cleanedBody = body.replace(/Arquivo de origem:\s*[0-9a-zA-Z\s.,-]+\.md\s*/g, '');

  return <MarkdownRenderer content={cleanedBody} />;
};

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  let tableNumber = 0;
  // Clean raw file origins from plain markdown view
  const cleanedContent = useMemo(
    () => content.replace(/Arquivo de origem:\s*[0-9a-zA-Z\s.,-]+\.md\s*/g, ''),
    [content],
  );
  const segments = useMemo(() => splitQuestionSegments(cleanedContent), [cleanedContent]);
  const renderPlainMarkdown = (markdown: string) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
      components={{
        table: ({ children }) => {
          tableNumber += 1;
          return <ResponsiveTable caption={`Tabela ${tableNumber} — conteúdo pedagógico`}>{children}</ResponsiveTable>;
        },
        pre: ({ children }) => {
          const source = extractCodeSource(children);
          if (source !== null && looksLikeConnectionMap(source)) return <ConnectionMap source={source} />;
          if (source !== null) return <EnhancedCodeBlock code={source} />;
          return (
            <div className="my-4 min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
              <pre className="overflow-x-auto"><code>{children}</code></pre>
            </div>
          );
        },
        code: ({ children, className: codeClassName }) => (
          <code className={`font-mono text-xs text-teal-800 ${codeClassName || ''}`}>{children}</code>
        ),
        blockquote: ({ children }) => <PedagogicalCallout>{children}</PedagogicalCallout>,
      }}
    >
      {markdown}
    </ReactMarkdown>
  );

  return <>{segments.map((segment, index) => segment.kind === 'question' ? (
    <QuestionBlock key={`${segment.title}-${index}`} {...segment} renderMarkdown={renderPlainMarkdown} />
  ) : (
    <React.Fragment key={index}>{renderPlainMarkdown(segment.content)}</React.Fragment>
  ))}</>;
};

const PedagogicalDocument: React.FC<{ content: string }> = ({ content }) => {
  const { intro, sections } = useMemo(() => splitDocumentSections(content), [content]);
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(sections.slice(0, 1).map((section) => section.id)),
  );

  if (sections.length === 0) return <MarkdownRenderer content={content} />;

  if (sections.length === 1) {
    return (
      <div className="pedagogical-document space-y-4">
        {intro && <MarkdownRenderer content={intro} />}
        <SectionBodyRenderer title={sections[0].title} body={sections[0].body} />
      </div>
    );
  }

  const setSectionOpen = (id: string, open: boolean) => setOpenSections((current) => {
    const next = new Set(current);
    if (open) next.add(id);
    else next.delete(id);
    return next;
  });
  const openFromToc = (id: string) => {
    setSectionOpen(id, true);
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const allOpen = openSections.size === sections.length;

  return (
    <div className="pedagogical-document">
      {intro && <MarkdownRenderer content={intro} />}
      <nav className="my-5 rounded-2xl border border-teal-200 bg-teal-50/50 p-4" aria-label="Sumário desta unidade">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 flex items-center gap-2 text-base font-bold text-teal-950"><ListTree className="h-5 w-5" /> Nesta unidade</h2>
          <button type="button" onClick={() => setOpenSections(allOpen ? new Set() : new Set(sections.map((section) => section.id)))} className="min-h-11 rounded-lg border border-teal-200 bg-white px-3 py-2 text-xs font-bold text-teal-900 hover:bg-teal-50">
            {allOpen ? 'Recolher todas' : 'Expandir todas'}
          </button>
        </div>
        <ol className="m-0 grid list-none gap-1 p-0 sm:grid-cols-2">
          {sections.map((section, index) => (
            <li key={section.id} className="m-0">
              <button type="button" onClick={() => openFromToc(section.id)} className="flex min-h-11 w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm leading-snug text-teal-950 hover:bg-white">
                <span className="font-bold text-teal-700">{index + 1}.</span><span>{section.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-3">
        {sections.map((section, index) => (
          <details key={section.id} id={section.id} open={openSections.has(section.id)} onToggle={(event) => setSectionOpen(section.id, event.currentTarget.open)} className="group scroll-mt-28 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 bg-slate-50/70 px-4 py-3 text-left text-base font-bold text-slate-950 hover:bg-slate-100 sm:px-5">
              <span><span className="mr-2 text-teal-700">{index + 1}.</span>{section.title}</span>
              <ChevronDown className="h-5 w-5 shrink-0 text-teal-700 transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-slate-200 px-4 py-4 sm:px-5 sm:py-5">
              <SectionBodyRenderer title={section.title} body={section.body} />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className = '', pedagogical = false }) => (
  <div className={`reading-content min-w-0 max-w-full text-slate-800 ${className}`}>
    {pedagogical ? <PedagogicalDocument content={content} /> : <MarkdownRenderer content={content} />}
  </div>
);
