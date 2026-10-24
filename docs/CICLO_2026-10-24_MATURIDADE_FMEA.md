# Ciclo v1.3.60 — Matriz de maturidade e fila de homologação FMEA

**24/10/2026 · Catálogo 1.3.60 · Ontologia 1.3.23 (sem mudanças de hipóteses)**

## Objetivo e regra fundamental

Os 25 `BUNDLE-01` a `BUNDLE-25` já cobrem as 25 regras preventivas PM. A matriz **não mede eficácia de manutenção** e não atribui RPN, probabilidade, criticidade ou nível fictício de confiabilidade. Ela registra somente o nível de evidência **disponível no repositório** e a próxima validação que falta antes de considerar um modo de falha aplicável à frota.

**100% de cobertura semântica não é 100% de homologação de engenharia.** Referência pública não prova aplicabilidade por número de série; fixture sintético não é evento real; peça no catálogo não é posição funcional aprovada; regra sem exceção registrada não equivale a SAP homologado.

## Sete gates independentes

| Gate | Situação do catálogo | Evidência que faltará para aprovação |
| --- | --- | --- |
| 1. Modelagem semântica | 25 modeladas como candidatas | Parecer técnico sobre função e modo de falha |
| 2. Proveniência técnica | 73 vínculos de referência genérica/pública | Conferir fonte e manual efetivos da variante/série |
| 3. Efetividade OEM | Nenhuma verificação por série registrada | Placa, configuração, manual, BOM e revisão corretos |
| 4. Inspeção/ensaio discriminante | Nenhum resultado de campo neste repositório | Medição executada, condições e hipóteses concorrentes |
| 5. Dano físico / causa | Nenhuma confirmação registrada | Prova independente de mecanismo, dano e causa |
| 6. Compatibilidade PM×SAP | Dez exceções bloqueadas; 15 sem exceção cadastrada | Objeto e códigos aprovados por curadoria independente |
| 7. Revisão de engenharia | Nenhuma homologação registrada | Aprovação técnica rastreável, com autoridade e data |

**Nota:** os 73 vínculos são contagens de menções a IDs de fonte nos bundles, não 73 documentos OEM específicos, nem 73 evidências validadas.

## Fila de curadoria com prioridade previamente documentada

A ordenação abaixo **preserva** o P0/P1 que já existe em `pm-gap-review.v1.json`; não é uma nova classificação de severidade FMEA e não deve ser aplicada a regras sem prioridade existente.

| Prioridade | Regra | Bloqueio registrado | Revisão necessária |
| --- | --- | --- | --- |
| P0 | `cooling-radiator-blockage` | `damage_cause_not_permitted` | Separar sujeira externa, restrição interna e códigos de dano/causa |
| P0 | `fuel-filter-contamination` | `component_not_registered` | Confirmar filtro/separador e posição SAP |
| P0 | `fuel-tank-water` | `damage_cause_not_permitted` | Diferenciar contaminação de falha física |
| P0 | `hydraulic-hose-abrasion` | `subgroup_not_in_scope` | Comprovar classe funcional e componente de mangueira |
| P0 | `hydraulic-hose-leak` | `subgroup_not_in_scope` | Validar subgrupo, localização e defeito real da linha |
| P1 | `drill-compressor-filter` | `subgroup_not_in_scope` | COMR grupo, não subgrupo; verificar circuito e elemento |
| P1 | `drill-compressor-pressure` | `component_not_registered` | VPAR não confirma a mangueira de pressão |
| P1 | `drill-rotary-bearing` | `component_not_registered` | Confirmar arquitetura, módulo e PN por série |
| P1 | `engine-oil-filter` | `component_not_registered` | Confirmar filtro efetivo e estrutura LUSY |
| P1 | `track-idler-wear` | `component_not_registered` | Confirmar roda-guia, localização e limites OEM |

As **15 demais regras não têm exceção formal nesta lista e permanecem sem prioridade de curadoria atribuída**, não aprovadas. Seus gates OEM, campo e revisão independente continuam pendentes.

O campo `minimumEvidence` de cada exceção é transcrito programaticamente da matriz de gates existente `pm-exception-evidence-gates.v1.json`. Os tipos de disciplina são **sugestões de revisão, não designação nominal de responsável**. Documentos OEM privados, resultados de testes e registros SAP precisam permanecer em ambiente restrito.

## Artefatos reproduzíveis

- `data/quality/pm-maturity-policy.v1.json`: sete gates, critérios de passagem, proibição de aprovação e regras de priorização.
- `data/quality/pm-maturity-matrix.v1.json`: fotografia estruturada de todas as 25 regras, 10 exceções e 15 regras não priorizadas, com fontes por ID, próximo gate e evidências mínimas.
- `scripts/lib/pm-maturity-matrix.mjs`: junção determinística de seeds PM, bundles semânticos, catálogo de fontes, gaps e gates de exceção.
- `scripts/audit-pm-maturity.mjs`: recomputa a fotografia sem acessar aplicações externas e rejeita **24 mutações adversariais**.
- `reports/pm-maturity.generated.json`: relatório de auditoria gerado no CI.

Use `npm run pm:generate` antes de `npm run pm:maturity:audit` quando executar a validação isoladamente em checkout limpo, pois o auditor também verifica os 115 vínculos preventivos gerados. `npm run qa` e GitHub Actions fazem essa preparação automaticamente.

A matriz não muda estrutura SAP, código de causa/dano, status de bloqueio, planos preventivos, ordens, consumidores, manuais OEM ou peças cadastradas.

## Próximo ciclo técnico: intake seguro de evidências

O ciclo seguinte deve definir o formulário/contrato para **receber em ambiente autorizado** identificação de ativo/série, revisão de manual/BOM, medições reais, laudos e decisão de curadoria sem despejar dados privados no GitHub. A fila P0 pode orientar a primeira revisão documental, porém não substitui avaliação de risco operacional feita pela engenharia/supervisão.
