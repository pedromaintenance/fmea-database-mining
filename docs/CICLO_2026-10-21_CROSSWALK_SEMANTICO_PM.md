# FMEA Database Mining — Ciclo v1.3.43: auditoria transversal de coerência semântica

**21/10/2026 — cobertura e fronteiras de condição/ação/dano em regras PM.** Esta auditoria não representa inspeção de campo, homologação SAP, verificação OEM por série ou conclusão de falha.

## Escopo e cobertura efetiva

O banco contém **25 regras PM**, das quais **9 possuem bundle semântico explícito** no arquivo `data/ontology/condition-action-damage.v1.json` (ontologia v1.3.8). Outras **16 regras ainda não possuem bundles de condições, ações e danos**; portanto, a avaliação cobre a interligação destas nove estruturas e inventaria lacunas das 16 restantes. Não significa que todas as 25 tenham sido modeladas e curadas em igual profundidade.

| Métrica derivada | Resultado |
| --- | ---: |
| Regras PM examinadas quanto à existência de bundle | 25 |
| Bundles semânticos inspecionados | 9 |
| Regras ainda sem bundle | **16** |
| Condições distintas presentes na ontologia | 20 |
| Ações distintas na ontologia | 19 |
| Hipóteses de dano distintas | 9 |
| Nós semânticos distintos efetivamente referenciados | 48 |
| Referências de condições, ações e danos nos bundles | 54 |
| Nós compartilhados entre duas regras | **6** |
| Nós de dano físico compartilhados por regras diferentes | **0** |
| Observações reais / ações executadas / danos confirmados | **0 / 0 / 0** |

O scanner deriva as cardinalidades da ontologia e dos 25 registros de regras, sem inferir eventos. As **54 referências** incluem seis reutilizações de um mesmo nó, não 54 falhas ou ordens de manutenção.

## Seis compartilhamentos e suas fronteiras

| Tipo de conceito | Regras que compartilham | Significado seguro e requisito de diagnóstico |
| --- | --- | --- |
| Água no combustível | `fuel-tank-water`, `fuel-filter-contamination` | Condição do fluido, sem inferir falha de dreno ou filtro; rastrear origem e dispositivo efetivo |
| Sedimentos no combustível | As mesmas duas regras | Sedimento em coleta não demonstra filtro restrito nem origem da contaminação |
| Amostragem representativa de combustível | As mesmas duas regras | Ação proposta, não executada; usar procedimento e ponto de coleta OEM efetivos |
| Vazamento hidráulico externo | `hydraulic-hose-leak`, `hydraulic-pump-seal` | Óleo superficial pode vir de mangueira, bomba ou conexão; localizar origem antes de atribuir dano |
| Pressão hidráulica potencialmente insuficiente | As mesmas duas regras | Sintoma de sistema com múltiplas causas: bomba, válvula, fuga, viscosidade e indicação |
| Verificação funcional de pressão hidráulica | As mesmas duas regras | Um tipo de teste possível, mas os pontos e limites de execução dependem do circuito e da máquina |

Esses compartilhamentos são **genéricos dentro do sistema** e constam em `data/quality/pm-semantic-crosswalk-policy.v1.json` com a discriminação independente exigida. Nenhum deles autoriza equivalência entre componentes ou prova de causa raiz. Qualquer compartilhamento novo deve ser examinado editorialmente, antes da aprovação do CI.

## Separação entre rolete e roda-guia

O controle da v1.3.42 foi preservado. `track-roller-wear` só contém condições, atividades e dano da classe `ROLLER`; `track-idler-wear` só contém conceitos `IDLER`. Não foram identificadas novas referências cruzadas entre as duas estruturas no catálogo semântico atual.

## Lacunas de modelagem

As regras a seguir têm cadastro de hipótese preventiva, mas **não** possuem bundle semântico em `condition-action-damage.v1.json`:

`brake-disc`, `cooling-fan-bearing`, `cooling-fan-belt`, `differential-gear`, `drill-compressor-filter`, `drill-compressor-pressure`, `drill-feed-chain`, `drill-rotary-bearing`, `engine-exhaust`, `final-drive-bearing`, `final-drive-gear`, `hydraulic-hose-abrasion`, `implement-cylinder`, `track-bolt-loose`, `wheel-tire-damage` e `wheel-tire-wear`.

Recomenda-se criar bundles gradualmente por família funcional com distinções de meio, componente e mecanismos concorrentes. A existência de regra PM ou vínculo candidato no catálogo não dispensa essa curadoria. Regras hoje bloqueadas por código SAP devem continuar bloqueadas após a modelagem semântica.

## Nova pendência de nomenclatura

A varredura de rótulos sinalizou `DMG-COOL-INTERNAL-BLOCKAGE`: **“Obstrução interna efetiva do trocador de calor”**. O registro, porém, está em `reviewStatus:not_approved` e `confirmed:false`, com mapeamento SAP nulo. A palavra *efetiva* pode induzir leitura de dano verificado. Tratar como **alerta editorial**, não como falha confirmada, e corrigir em ciclo controlado após revisão de consumidores e testes contratuais. **Nenhum rótulo de ontologia foi editado na v1.3.43.**

## Verificações automáticas e aceitação

- `scripts/lib/pm-semantic-crosswalk.mjs`: reconcilia as 25 regras, os 9 bundles, identidade de sistema para cada referência, natureza condição/ação/dano e matriz explícita dos seis compartilhamentos.
- `scripts/audit-pm-semantic-crosswalk.mjs`: confronta regras, exceções e conceitos com o catálogo, verifica links e rejeita mudanças sintéticas inseguras.
- CI e `npm run pm:semantic:crosswalk:audit`: **20 mutações adversariais da ontologia + 9 mutações da política**, que tentam transpor sistemas, trocar componentes, reutilizar danos, falsificar eventos, permitir remapeamento e eliminar a discriminação.
- Relatório reproduzível no artefato `reports/pm-semantic-crosswalk.generated.json`, com inventário de 16 lacunas e fila de rótulos ambíguos.

**Resultado:** 29 adulterações rejeitadas, nenhuma aprovação de dano/causa, nenhuma ação efetivamente executada. Os 25 padrões PM, 115 vínculos candidatos, dez exceções bloqueadas, 24 cadeias FMEA/15 mecanismos, contrato/conteúdo públicos 1.0.0 e preview 1.3.12 permanecem sem alteração funcional.

## Próxima ação técnica

Selecionar uma família dentre as 16 ainda não modeladas para novo bundle revisado, sem extrapolar configuração OEM. Separadamente, rever o rótulo de bloqueio interno do trocador e implementar testes que impeçam novos termos de certeza em conceitos com `confirmed:false`.
