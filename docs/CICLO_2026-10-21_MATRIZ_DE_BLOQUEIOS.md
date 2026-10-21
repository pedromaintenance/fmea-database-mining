# FMEA Database Mining — Ciclo v1.3.30: consolidação de bloqueios

**Data:** 21/10/2026. **Escopo:** decisão de engenharia sobre dependências reais versus evolução meramente editorial.

## Resultado

A auditoria das fontes do próprio repositório encontrou **8 frentes sem liberação**:

| Identificador | Fonte verificável | Unidade | Pendentes |
|---|---|---|---:|
| BLK-D9-OEM | `oem-d9-evidence-intake.v1.json` | insumos de documentação | 7 |
| BLK-PM-SAP | `pm-exception-evidence-gates.v1.json` | regras PM bloqueadas | 10 |
| BLK-FC-REVIEW | `technical-review-register.v1.json` | revisões de cadeias | 24 |
| BLK-SYSTEMIC-ROOT | `systemic-root-audit.v1.json` | alegações sistêmicas | 48 |
| BLK-CAUSAL-CANDIDATES | `proposed-causal-chains.v1.json` | candidatas causais | 3 |
| BLK-ME-REFINEMENTS | `mechanism-refinements.v1.json` | refinamentos editoriais | 4 |
| BLK-IT-PLATFORM | `restricted-infrastructure-design.v1.json` | componentes de arquitetura | 7 |
| BLK-STAGING-SIGNOFF | `staging-acceptance-plan.v1.json` | aceites institucionais | 6 |

Essas categorias **não são disjuntas**. O indicador correto é `blockedWorkstreams = 8`, com contagens separadas e sem afirmação de "109 OS ou falhas". Nenhuma categoria contém aprovação corporativa efetuada.

## Mudanças concretas

- [Matriz de bloqueios versionada](../data/governance/consolidated-blockers.v1.json): oito registros com fonte, unidade, bloqueio, próximo passo, critério de evidência, responsável institucional (não nominal), dependências e prioridades P0/P1 explicitamente editoriais.
- [Schema JSON](../schemas/consolidated-blockers.schema.json) e [validador](../scripts/validate-consolidated-blockers.mjs) cruzam os dados com os documentos originais.
- [40 regressões sintéticas](../data/quality/consolidated-blocker-regressions.v1.json): oito baselines e 32 mutações que simulam aprovação fictícia, deriva das fontes, troca de escopo, prazos e nomes inventados ou alteração de salvaguardas.
- [Guia executivo](MATRIZ_CONSOLIDADA_BLOQUEIOS.md), atualização do QA, CI, README, changelog e roadmap.

Nenhuma regra PM, FC, mecanismo, manual OEM, limite, registro de campo, mapeamento SAP, identidade ou cofre privado foi alterado. Contrato e conteúdo públicos **1.0.0**, preview legado **1.3.12** e hash golden permanecem inalterados.

## Bloqueio principal e próxima decisão

O problema crítico deixou de ser falta de validação editorial automatizada. A obtenção de **documentação OEM realmente aplicável**, evidência de campo e revisão humana independente é a dependência fundamental para transformar hipóteses em conhecimento homologado. Custódia/infraestrutura corporativa compõem trilha separada para armazenar esses registros com direitos controlados.

**Ciclo seguinte:** priorizar uma única lacuna OEM de alto valor (piloto D9 ou teste discriminatório de bomba/comando final), preparar pedido formal ao responsável técnico e registrar a resposta em ambiente aprovado — não no GitHub público. A criação de mais camadas sintéticas de governança, por si só, não demonstra progresso de manutenção.
