# FMEA Database Mining — Ciclo v1.3.35: fronteiras HSVV e COMR

**Data editorial:** 21/10/2026. **Escopo:** qualidade da classificação funcional de candidatos PM × SAP.

## Mudança operacional

- O gerador de vínculos PM passa a usar `classifyPmPath`, com quatro verificações estritas: profundidade 3; modelo elegível; raiz e grupo corretos; subgrupo explícito. Correspondência apenas de descrição de peça ou reutilização de um código fora de contexto não produz vínculo.
- A auditoria `scripts/audit-pm-functional-boundaries.mjs` varre os caminhos efetivamente contidos no catálogo e agrega sua ocorrência por sistema/grupo/subgrupo e modelos de referência; não exporta identificadores de locais, números de série, PN nem desenhos OEM.
- Quatro regras continuam bloqueadas: `hydraulic-hose-leak` e `hydraulic-hose-abrasion` (HSVV não localizado no circuito hidráulico requerido), `fuel-filter-contamination` (HSVV não fornece componente filtro) e `drill-compressor-filter` (COMR é grupo, não subgrupo elegível).
- 15 testes de classificação sintéticos e oito mutações adversariais bloqueiam colisões de funções e níveis, remapeamento automático, vínculos inventados e alegação de aprovação técnica.

## Mecanismos e contraprovas

**HSVV:** o subgrupo aparece em múltiplos contextos. Uma mangueira no sistema de combustível, freios, direção ou arrefecimento não identifica automaticamente uma mangueira do circuito de implementos. Para a regra de filtro de combustível, o erro é a *atribuição de função*: a presença de água/sedimentos não comprova defeito do filtro, muito menos falha de mangueira/valvulagem.

**COMR:** em AISY, `COMR` atua no nível de grupo. Um eventual filtro exige subgrupo e componente comprovados por árvore funcional SAP e lista técnica da perfuratriz; um código de grupo não deve ser duplicado como subgrupo por conveniência.

## O que falta obter (fora do repositório público)

1. Engenharia/Dados Mestres: estrutura SAP e BOM real para um circuito hidráulico de implementos por modelo e arranjo.
2. Engenharia/Especialista Sandvik: árvore AISY → COMR, subgrupos efetivos e filtro, contrastados com diagrama OEM/licença vigente.
3. Parecer independente de engenharia e governança de alterações, com evidências custodidas em plataforma restrita.
4. A solicitação OEM D9 permanece separadamente pendente na [issue #31](https://github.com/pedromaintenance/fmea-database-mining/issues/31).

## Limites do ciclo

**0 inspeções reais, 0 validações por série, 0 componentes homologados, 0 falhas confirmadas.** Estrutura catalogada e casos de teste não demonstram instalação, modo de falha ou causa raiz. Não corrigir automaticamente os dez bloqueios. Preservar 24 FC, 15 ME, contrato e conteúdo públicos 1.0.0, preview histórico 1.3.12 e consumidores sem alterações.
