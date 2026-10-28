# Ciclo v1.3.81 — Consulta técnica completa das 25 regras preventivas

**28 de outubro de 2026 · FMEA Database Mining v1.3.81 · Fonte pública conceitual, sem homologação corporativa**

## Avanço funcional

A interface offline [`docs/consulta-fmea.html`](consulta-fmea.html) foi ampliada de **15 para 25 regras preventivas**, distribuídas em **13 sistemas**. Mantém arquivo único responsivo para desktop/celular, sem servidor, APIs externas ou acesso ao SAP.

O navegador agora permite filtros independentes de **sistema**, **trilha de revisão** e **prioridade documental P0/P1**, além da pesquisa textual por regra, componente, sintoma, método, hipótese, achado e evidências propostas. Os dois percursos têm informações diferentes e deliberadamente não são tratados como equivalentes.

## Duas trilhas, sem misturar escopos

| Trilha | Quantidade | Dados sustentados | O que não deve ser inferido |
| --- | ---: | --- | --- |
| Sem prioridade documental | **15** | Sintoma e inspeção da semente; 30 hipóteses mecânicas abertas; limites qualitativos; 150 requisitos de qualidade ainda não avaliados; 90 posições de bloqueio de maturidade | Ausência de prioridade **não equivale a risco baixo**; hipóteses não são falhas confirmadas |
| Exceções PM×SAP | **10** | Prioridade documental original (**5 P0 e 5 P1**); impedimento do enquadramento; achado técnico; próxima análise proposta; disciplina; evidências mínimas e IDs de referência | P0/P1 **não são ranking de severidade/criticidade operacional**; as exceções não receberam automaticamente as fichas de detectabilidade/metrologia das outras 15 |

**P0 e P1** estão preservados como os códigos originais do campo `priority` da fila de revisão de lacunas. Não foram normalizados, reponderados ou convertidos em prioridade de notificação, risco de segurança ou impacto no equipamento. A associação causa-dano, o objeto SAP e a efetividade do método permanecem **não homologados**.

## Dez exceções, exatamente conforme as fontes

| Regra | Posição documental | Tipo de bloqueio |
| --- | --- | --- |
| `cooling-radiator-blockage` | P0 | `damage_cause_not_permitted` |
| `fuel-filter-contamination` | P0 | `component_not_registered` |
| `fuel-tank-water` | P0 | `damage_cause_not_permitted` |
| `hydraulic-hose-leak` | P0 | `subgroup_not_in_scope` |
| `hydraulic-hose-abrasion` | P0 | `subgroup_not_in_scope` |
| `engine-oil-filter` | P1 | `component_not_registered` |
| `track-idler-wear` | P1 | `component_not_registered` |
| `drill-rotary-bearing` | P1 | `component_not_registered` |
| `drill-compressor-pressure` | P1 | `component_not_registered` |
| `drill-compressor-filter` | P1 | `subgroup_not_in_scope` |

Os campos `finding`, `nextInspection`, `sourceIds`, `reviewDiscipline` e `minimumEvidence` são apresentados da fonte versionada. Não afirmamos ter executado testes, coletado amostras ou obtido acesso a manuais OEM licenciados. As referências são IDs de documentos catalogados, não arquivos OEM redistribuídos.

## Implementação e uso

- `scripts/lib/pm-technical-explorer.mjs`: reconciliação determinística das **25 sementes**, da fila de **10 exceções** e dos **15 pacotes de observabilidade/detectabilidade**; separação explícita `reviewTrack` e `documentaryPriority`.
- `docs/consulta-fmea.html`: nova seleção de trilha e prioridade, ficha técnica distinta para cada tipo de regra e exportação textual mantendo o enquadramento.
- `scripts/audit-pm-technical-explorer.mjs`: comparação integral do JSON incorporado contra as oito fontes versionadas, testes de busca e filtros, mais ataques contra alterações de P0/P1, causas, aprovação SAP, evidência e desbloqueio indevidos.
- `reports/pm-technical-explorer.generated.json`: catálogo e auditoria produzidos pelo CI.

Para uso local, abra [o HTML no GitHub](consulta-fmea.html), selecione **Raw** ou **Download raw file**, salve o arquivo e abra-o em um navegador moderno. A cópia de resumo e o TXT são documentos **não homologados de apoio à revisão**, não uma nota/ordem SAP.

Comando de QA: `npm run pm:technical:explorer:audit`.

## Fronteiras preservadas

Todas as dez exceções seguem com `bloqueado_aguardando_curadoria` e `autoRemapAllowed: false`; os **oito gates de implantação privada** permanecem `BLOCK` e `NO_GO`. Não há alteração de entidades SAP, importação de dados reais, autorização de intervenção, revisão de manual OEM por série, prova de causa raiz ou liberação operacional. Nenhum repositório consumidor foi alterado.

A consulta é uma **biblioteca pública de conhecimento e pendências**, não um sistema de diagnóstico automático. Em caso de risco de segurança, os procedimentos de campo aprovados e a autoridade operacional continuam prevalecendo.
