import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MarkdownContent } from './MarkdownContent';

describe('MarkdownContent pedagógico', () => {
  it('estrutura tabelas, mapas, matemática e questões sem perder o texto', () => {
    render(<MarkdownContent pedagogical content={`# Unidade

## Quadro comparativo

| Conceito | Critério | Exemplo |
| --- | --- | --- |
| Hiato | Vogais em sílabas distintas | sa-ú-de |

## Mapa de Relações

\`\`\`text
PALAVRA
  │
  └──▼ SÍLABA
\`\`\`

## Exemplos comentados

### Questão 01: Hiato (FGV 2024)

- **Enunciado:** Assinale a palavra com hiato.
A) pai
B) saúde
C) mau
- **Resolução e Justificativa:** Em $saúde$, as vogais ficam separadas.
- **Gabarito:** **B**.
`} />);

    expect(screen.getByRole('navigation', { name: /sumário desta unidade/i })).toBeInTheDocument();
    expect(screen.getByText(/deslize para comparar/i)).toBeInTheDocument();
    expect(screen.getByRole('list', { name: /versão linear do mapa/i })).toHaveTextContent('PALAVRA');
    const question = screen.getByRole('heading', { name: /questão 01/i }).closest('article')!;
    expect(within(question).getByText('FGV')).toBeInTheDocument();
    expect(within(question).getByText('2024')).toBeInTheDocument();
    expect(within(question).getAllByText('saúde').length).toBeGreaterThan(0);
    expect(document.querySelector('.katex')).toBeInTheDocument();
  });

  it('expande uma subseção pelo sumário', async () => {
    const user = userEvent.setup();
    render(<MarkdownContent pedagogical content={`# Unidade

## Primeira

Conteúdo inicial.

## Segunda

Conteúdo posterior.
`} />);

    const secondDetails = screen.getByText('Conteúdo posterior.').closest('details');
    expect(secondDetails).not.toHaveAttribute('open');
    await user.click(screen.getByRole('button', { name: /segunda/i }));
    expect(secondDetails).toHaveAttribute('open');
  });

  it('renderiza o Guia Visual dos 4 Porquês com cards nativos e regras de substituição', () => {
    render(<MarkdownContent content={`
\`\`\`text
EMPREGO DOS PORQUÊS │ ┌────────┬────────┴────────┬────────┐ ▼ ▼ ▼ ▼ PORQUÊ PORQUE POR QUÊ POR QUE
\`\`\`
`} />);

    expect(screen.getByText(/Guia Visual do Emprego dos 4 Porquês/i)).toBeInTheDocument();
    expect(screen.getByText('Por que')).toBeInTheDocument();
    expect(screen.getByText('Por quê')).toBeInTheDocument();
    expect(screen.getByText('Porque')).toBeInTheDocument();
    expect(screen.getByText('Porquê')).toBeInTheDocument();
    expect(screen.getByText(/Macete das Bancas/i)).toBeInTheDocument();
  });

  it('renderiza o Esquema em Árvore Estruturada com categorias e grupos visuais', () => {
    render(<MarkdownContent content={`
\`\`\`text
SINTAXE DO PERÍODO COMPOSTO
├── 1. Fundamentos
├── 2. Subclasses Adverbiais (6C + FTP)
└── 3. Relações Lógicas
\`\`\`
`} />);

    expect(screen.getByRole('heading', { name: /SINTAXE DO PERÍODO COMPOSTO/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /1\. Fundamentos/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /2\. Subclasses Adverbiais/i })).toBeInTheDocument();
  });
});
