import React, { useState } from 'react';
import { Copy, Check, Maximize2, WrapText, FileCode2 } from 'lucide-react';
import { ModalShell } from './ModalShell';

interface EnhancedCodeBlockProps {
  code: string;
  language?: string;
}

export const EnhancedCodeBlock: React.FC<EnhancedCodeBlockProps> = ({ code, language = 'text' }) => {
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDiagram = /[─-╿←-⇿▼▲◆|┌┐└├┬┴]/u.test(code);
  const title = isDiagram ? 'Esquema Textual' : 'Exemplo / Código';

  return (
    <div className="enhanced-code-block my-4 min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
      {/* Top action bar */}
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-3.5 py-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <FileCode2 className="h-3.5 w-3.5 text-teal-600" />
          <span>{title}</span>
          {language && language !== 'text' && (
            <span className="ml-1 rounded bg-slate-200/70 px-1.5 py-0.2 text-[10px] font-mono text-slate-600">
              {language}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setWrap((prev) => !prev)}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition ${
              wrap ? 'bg-teal-100 text-teal-900' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
            title={wrap ? 'Desativar quebra de linha' : 'Ativar quebra de linha'}
          >
            <WrapText className="h-3 w-3" />
            <span className="hidden sm:inline">{wrap ? 'Quebrado' : 'Quebrar'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-200/60 hover:text-slate-900"
            title="Copiar texto"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-200/60 hover:text-slate-900"
            title="Expandir em tela cheia"
          >
            <Maximize2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Code viewport */}
      <div className="relative">
        <pre
          className={`m-0 p-3.5 font-mono text-xs leading-relaxed text-slate-800 bg-slate-50/50 ${
            wrap ? 'whitespace-pre-wrap break-words' : 'overflow-x-auto whitespace-pre'
          }`}
        >
          <code>{code}</code>
        </pre>
      </div>

      {/* Modal for full viewing */}
      <ModalShell
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs text-slate-500">Visualização expandida</span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-900 p-4 font-mono text-xs leading-relaxed text-emerald-300">
            <code>{code}</code>
          </pre>
        </div>
      </ModalShell>
    </div>
  );
};
