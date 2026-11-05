# FMEA Database Mining — Plataforma aberta de conhecimento técnico

**Decisão de arquitetura: 05/11/2026 — Ciclo de fundação 1.4.0**

## Missão
O repositório é um **acervo técnico de engenharia de manutenção e equipamentos móveis** para pesquisa, educação, formação de hipóteses e comparação metodológica. FMEA/FMECA, diagnóstico diferencial, estratégias de manutenção, monitoramento de condição, confiabilidade e treinamento são **produtos derivados** da biblioteca — não seu único objetivo.

## Auditoria inicial do que existe
- Registro bibliográfico `data/research/sources.v1.json`: **87 referências**, fonte de títulos, links e limites; não evidencia que todas as fontes estão atualizadas, licenciadas para republicação ou aplicáveis a uma máquina.
- Domínio hidráulico: 10 matrizes de circuitos com 30 hipóteses concorrentes, 9 cenários de mangueiras, pré-piloto público CAT 395 e 20 exercícios sintéticos.
- Domínio de manutenção: 25 regras PM conceituais; 10 exceções PM×SAP continuam bloqueadas. Roteiros, triagens e interfaces existem, porém a navegação principal continua centrada em FMEA/PM.
- `docs/consulta-fmea.html`: consulta offline das regras, mas não é um portal geral de literatura, técnicas e benchmarks.
- Há validações fortes de dados; isso não comprova uma biblioteca ampla e curada.

## Separar quatro classes de verdade
| Classe | O que responde | Condições para publicação |
| --- | --- | --- |
| **Fundamentos** | função, arquitetura genérica, mecanismo físico, diagnóstico diferencial, princípios de manutenção | fonte pública citada, revisão e escopo declarados |
| **Catálogo / variante** | quais informações publicadas referem-se a fabricante, linha e variante | documento do fabricante, edição, região, ressalva de número de série |
| **Benchmark industrial** | resultados comparativos, distribuições e definições de KPI | população, denominador, período, unidade, fórmula, procedência, método, viés, licença e aplicabilidade |
| **Evidência operacional restrita** | uma leitura, teste ou causa confirmada em ativo real | custódia corporativa privada, efetividade OEM, revisão humana; nunca publicada por padrão |

### Principal mudança
Não escrever uma nova ficha apenas quando houver defeito ou exercício. Escrever também verbetes sobre:
1. função requerida e limites de sistema;
2. mecanismos físicos (fadiga, cavitação, contaminação, corrosão, desgaste, perda de pré-carga);
3. arquitetura e componentes;
4. inspeção e observabilidade (instrumento, condição, sincronismo, falsos positivos/negativos);
5. manutenção e planejabilidade;
6. confiabilidade e indicadores;
7. comparações entre tecnologias, modelos e variantes;
8. literatura, revisão de fontes e lacunas documentais.

## Camadas do acervo
- **L0 fontes:** `data/research/sources.v1.json` e futuro inventário de licenças/datas.
- **L1 conhecimento canônico:** JSON/Markdown sobre função, sistema, componente, mecanismo, métrica, método e contexto; referências cruzadas por IDs estáveis.
- **L2 índice:** `data/catalog/knowledge-index.v1.json` com entrada navegável e localização do documento canônico; **seleção piloto, não cobertura total**.
- **L3 apresentação humana:** `docs/biblioteca-tecnica.html` funciona como índice offline; textos integrais dependem do repositório ou internet.
- **L4 interface IA:** `AGENTS.md`, `skills/consultar-acervo-manutencao/SKILL.md`, `docs/AI_RETRIEVAL_CONTRACT.md`, `llms.txt`, futuros JSONL/MCP/RAG.
- **L5 aplicações:** investigação FMEA, PCM, diagnóstico, treinamento, BI e consumidores independentes.

A mesma ficha canônica deve sustentar todas as interfaces. O portal e as skills são projeções do conhecimento, não cópias editoriais sem controle.

## Política de benchmarks
**Não** confundir exercício sintético de decisão hidráulica com benchmark de manutenção industrial. O acervo de benchmark deverá registrar:
- métrica e descrição normalizada;
- setor, tipo de equipamento, população, janela de medição e regime;
- definição de numerador/denominador e critérios de exclusão;
- fonte/ano/licença e se há amostra ou informação autodeclarada;
- unidade, estimativa/distribuição, método estatístico e incerteza;
- critérios de comparabilidade entre frotas/plantas;
- advertência expressa contra metas universais sem contexto.

Sem esses campos, incluir como **alegação não comparável**, sem número publicado. Não criar valores artificiais de MTBF, MTTR, DF, OEE, custo por hora ou aderência PM.

## Critérios de qualidade de ficha
`traceable_source`, `scope_defined`, `effectivity_defined`, `terms_separated`, `counterhypotheses`, `safety_limits`, `last_reviewed`, `rights_reviewed`, `human_review_status`.
O índice não deve inventar preenchimento de critérios que não existem na ficha; questões ausentes entram no backlog.

## Fluxo editorial proposto
Descobrir fonte → avaliar licença e autoridade → produzir resumo autoral → tipar conhecimento → cruzar com outra evidência quando possível → documentar hipóteses e conflitos → curadoria técnica humana → indexar → testar busca e navegação → publicar. Manter a distinção `PENDING_REVIEW` versus `APPROVED`, sem estados falsos de validação OEM/SAP.

## Padrões consultados (escopo e cautela)
- [IEC 60812:2018](https://webstore.iec.ch/en/publication/26359): metodologia de FMEA/FMECA.
- [ISO 14224:2016](https://www.iso.org/standard/64076.html): taxonomia de confiabilidade, dados de equipamentos/falha/manutenção **originada no setor de petróleo/gás**, não norma específica de mineração.
- [ISO 55000:2024](https://www.iso.org/standard/83053.html): princípios da gestão de ativos.
- [ISO 13374-1:2003](https://www.iso.org/standard/21832.html): sistemas de processamento/apresentação de monitoramento de condição.
- [SMRP — Best Practices, Metrics & Guidelines](https://smrp.org/Learning-Resources/SMRP-Library/Best-Practices-Metrics-Guidelines): definições de métricas; acesso integral/licença precisam ser verificados.
- [Agent Skills Specification](https://github.com/agentskills/agentskills/blob/main/docs/specification.mdx): SKILL.md e metadados.
- [AGENTS.md](https://agents.md/): orientações portáveis para agentes.
- [MCP — arquitetura](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/docs/2026-07-28/learn/architecture.mdx): separação resources/tools/prompts, **não implementada** neste repositório.

Não transcrever integrais de normas pagas, conteúdo de SIS/OMM licenciado, esquemas OEM restritos ou dados corporativos. O registro desta arquitetura é uma proposta editorial, não certificação de aderência à norma.

## Publicação e pesquisa futura
Uma URL pública e um servidor MCP podem ampliar o alcance, mas **a biblioteca Git versionada é a origem da verdade**. Só liberar endpoints de leitura com contrato de proveniência, versionamento, sanitização e controle de acesso. Não depender de um fornecedor de IA ou de serviços pagos para o núcleo do conhecimento.
