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

  it('renderiza os novos layouts de campos: Pegadinhas, Mnemônicos, Roteiros, Glossário e Autoavaliação', async () => {
    const user = userEvent.setup();
    render(<MarkdownContent pedagogical content={`# Unidade Aprofundada

## Erros comuns e pegadinhas

Arquivo de origem: 014 - FGV.md

- Problema: O candidato confunde concessão com adversidade.
- Como Evitar: Lembre-se de que a concessão cede e a oração principal prevalece.

## Memorização inteligente

Arquivo de origem: 011 - VUNESP.md Fixe mentalmente: "6C + FTP" para lembrar todas as 9 subclasses adverbiais.

## Roteiros de resolução

### Objetivo
Identificar com precisão qual oração atua como Causa e qual atua como Consequência.

1. Isolamento dos Fatos: Identifique os dois acontecimentos interconectados.
2. Aplicação do Molde: Encaixe na fórmula universal.
- Se preencher "O fato de" -> Causa.

## Glossário operacional

- — Oração Desenvolvida: Introduzida expressamente por conjunção subordinativa e verbo flexionado.
- — Oração Reduzida: Sem conectivo introdutório e verbo em forma nominal.

## Síntese para recuperação ativa

1. Domínio Estrutural: Identificar e classificar instantaneamente qualquer circunstância adverbial.
2. Operação Lógica de Causalidade: Aplicar o teste mental infalível.
`} />);

    // Expand all sections
    await user.click(screen.getByRole('button', { name: /expandir todas/i }));

    // Check Pitfall Card
    expect(screen.getByText(/Armadilha da Banca/i)).toBeInTheDocument();
    expect(screen.getByText(/Como Evitar \(Vacina\)/i)).toBeInTheDocument();
    expect(screen.getByText(/O candidato confunde concessão com adversidade/i)).toBeInTheDocument();

    // Check Mnemonic Card
    expect(screen.getByText(/6C \+ FTP/i)).toBeInTheDocument();
    expect(screen.getByText(/Fixe mentalmente/i)).toBeInTheDocument();

    // Check Resolution Stepper
    expect(screen.getByText(/Objetivo do Roteiro:/i)).toBeInTheDocument();
    expect(screen.getByText(/Isolamento dos Fatos/i)).toBeInTheDocument();

    // Check Glossary Grid
    expect(screen.getByText(/Oração Desenvolvida/i)).toBeInTheDocument();
    expect(screen.getByText(/Oração Reduzida/i)).toBeInTheDocument();

    // Check Active Recall Checklist
    expect(screen.getByText(/Domínio Estrutural/i)).toBeInTheDocument();
    expect(screen.getByText(/0 de 2 dominadas/i)).toBeInTheDocument();
    const checkbox = screen.getAllByRole('checkbox')[0];
    await user.click(checkbox);
    expect(screen.getByText(/1 de 2 dominadas/i)).toBeInTheDocument();
  });

  it('renderiza os campos aprofundados: Explicação didática, Contrastes e Exemplos Comentados', async () => {
    const user = userEvent.setup();
    render(<MarkdownContent pedagogical content={`# Unidade de Conjunções
## Explicação didática aprofundada

A oração subordinada adverbial exerce função sintática equivalente à de um adjunto adverbial.

1. Orações Desenvolvidas: Introduzidas por conectivos subordinativos.
2. Orações Reduzidas: Com verbos em formas nominais.

## Contrastes que a prova explora

| Conceito | Natureza | Teste Diagnóstico |
| --- | --- | --- |
| Causa | Fato real preexistente | O fato de [X] fez com que [Y] |
| Condição | Hipótese futura | Substituível por caso |

## Exemplos comentados

-  ( / / FGV 2023): "Embora discordasse, aceitou a decisão." $\\rightarrow$ O conectivo expressa ressalva $\\rightarrow$ Gabarito: C (concessão).
-  ( / / VUNESP 2022): "Como choveu, não foi." $\\rightarrow$ Início com como equivale a já que $\\rightarrow$ Gabarito: A (causa).
`} />);

    await user.click(screen.getByRole('button', { name: /expandir todas/i }));

    // Explicação Didática Aprofundada
    expect(screen.getAllByText(/Explicação Didática Aprofundada/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/A oração subordinada adverbial exerce função sintática/i)).toBeInTheDocument();

    // Contrastes que a Prova Explora
    expect(screen.getAllByText(/Contrastes que a Prova Explora/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Fato real preexistente')).toBeInTheDocument();

    // Exemplos Comentados
    expect(screen.getAllByText(/Exemplos Comentados/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/FGV/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/VUNESP/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Gabarito: C \(concessão\)/i)).toBeInTheDocument();
  });

  it('renderiza o Quadro da Polifonia do X sem duplicar o Esquema de Sílaba', () => {
    render(<MarkdownContent content={`
\`\`\`text
QUADRO DA POLIFONIA DO X
- SOM DE /s/: experiência, excesso
- SOM DE /z/: exílio, exemplo
- SOM DE /ʃ/: caixa, lixo
- SOM DE /ks/ (Dífono): táxi, tórax
\`\`\`
`} />);

    expect(screen.getByText(/Quadro da Polifonia da Letra "X"/i)).toBeInTheDocument();
    expect(screen.getByText(/Dífono \(\+1 F\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/Guia Visual do Estudo da Sílaba/i)).not.toBeInTheDocument();
  });

  it('renderiza Conexão com o método SuVeCA com pílulas de ordem sintática e limites do método', async () => {
    const user = userEvent.setup();
    render(<MarkdownContent pedagogical content={`# Unidade
## 1. Conexão com o método SuVeCA

**SuVeCA = Sujeito + Verbo + Complemento + Adjunto + Predicativo.**

**Conexão forte:** O emprego das classes fica mais claro quando a palavra é ligada ao núcleo e à função que exerce como Su, C, A, Pred.

### Como aplicar neste tema

1. Localizar o verbo motor da oração.
2. Destaque o vocábulo sob análise.
3. Aplique a Técnica das Setas.

### Testes decisivos

- Técnica das Setas: perguntar para qual termo a palavra aponta no contexto sintático.
- Teste do que é: converter a relação nominal em oração adjetiva.

> **Limite do método:** A análise sintática é necessária, mas não substitui a regra específica desta matéria.

## 2. Próxima Seção
Conteúdo da próxima seção.
`} />);

    await user.click(screen.getByRole('button', { name: /expandir todas/i }));

    expect(screen.getByText(/Conexão com o Método SuVeCA/i)).toBeInTheDocument();
    expect(screen.getByText(/Conexão forte/i)).toBeInTheDocument();
    expect(screen.getByText('Sujeito')).toBeInTheDocument();
    expect(screen.getByText('Verbo')).toBeInTheDocument();
    expect(screen.getByText('Complemento')).toBeInTheDocument();
    expect(screen.getByText('Localizar o verbo motor da oração.')).toBeInTheDocument();
    expect(screen.getByText(/Técnica das Setas/i)).toBeInTheDocument();
    expect(screen.getByText(/Limite do Método e Fronteira Normativa/i)).toBeInTheDocument();
  });

  it('renderiza Pré-requisitos e Modelo Mental com checklist e árvore interativa', async () => {
    const user = userEvent.setup();
    render(<MarkdownContent pedagogical content={`# Unidade
## 1. Introdução
Visão geral.

## 2. Pré-requisitos e modelo mental

- Morfologia Básica: Conceito de classes invariáveis vs variáveis.
- Noções de Sintaxe Oracional: Distinção elementar entre termos integrantes e acessórios.

\`\`\`text
SISTEMA MORFOLÓGICO DA LÍNGUA PORTUGUESA (10 CLASSES)
├── 1. CLASSES VARIÁVEIS (Admitem flexão)
│   ├── Substantivo: Núcleo do sistema nominal
│   └── Adjetivo: Caracteriza o substantivo
└── 2. CLASSES INVARIÁVEIS (Forma fixa)
    ├── Advérbio: Modifica Verbo, Adjetivo ou Advérbio
    └── Conjunção: Liga orações
\`\`\`
`} />);

    await user.click(screen.getByRole('button', { name: /expandir todas/i }));

    expect(screen.getByText(/Pré-requisitos e Modelo Mental/i)).toBeInTheDocument();
    expect(screen.getByText(/Pré-requisitos e Fundamentos Necessários/i)).toBeInTheDocument();
    expect(screen.getByText(/Morfologia Básica/i)).toBeInTheDocument();
    expect(screen.getByText(/Mapa Estrutural e Árvore de Decisão/i)).toBeInTheDocument();
    expect(screen.getByText(/CLASSES VARIÁVEIS/i)).toBeInTheDocument();
  });

  it('renderiza Regras decisivas com alternância entre cards e tabela', async () => {
    const user = userEvent.setup();
    render(<MarkdownContent pedagogical content={`# Unidade
## 1. Introdução
Visão geral.

## 2. Regras decisivas

| Classe Gramatical | Natureza | Função Básica no Enunciado | Teste / Critério Diagnóstico |
| --- | --- | --- | --- |
| Substantivo | Variável | Nomeia seres, ações, conceitos | Admite anteposição de artigo |
| Artigo | Variável | Determina ou generaliza o substantivo | Antepõe-se ao nome |
| Advérbio | Invariável | Modifica verbo, adjetivo ou advérbio | Invariabilidade morfológica |
`} />);

    await user.click(screen.getByRole('button', { name: /expandir todas/i }));

    expect(screen.getByText(/Regras Decisivas e Priorizadas/i)).toBeInTheDocument();
    expect(screen.getByText('Substantivo')).toBeInTheDocument();
    expect(screen.getByText('Nomeia seres, ações, conceitos')).toBeInTheDocument();
    expect(screen.getByText(/Admite anteposição de artigo/i)).toBeInTheDocument();
  });
});
