# FMEA Database Mining v1.3.18 — Seis roteiros diferenciais por playbook

**Data editorial:** 20/10/2026  
**Natureza:** curadoria de cenários sintéticos de treinamento; nenhuma hipótese validada em campo.  
**Escopo:** banco independente de conhecimento, não jogo, SAP produtivo, plano OEM nem ordem de manutenção.

## 1. Correção de premissa de cobertura

A [biblioteca original](../data/knowledge/diagnostic/playbooks.v1.json) tem 12 playbooks (`PB-*`) para equipamentos específicos. Já os [três roteiros antigos](../data/quality/diagnostic-pathways.v1.json) e os [três roteiros acrescentados na v1.3.17](../data/quality/diagnostic-pathway-expansion.v1.json) representam mecanismos `FC-*`. Essa taxonomia não define, por si só, uma relação biunívoca entre PATH e PB. Não se pode dizer que seis playbooks estavam comprovadamente concluídos antes deste ciclo.

Por isso, a v1.3.18 criou [seis revisões identificadas por playbook](../data/quality/playbook-deepdives.v1.json) e uma relação explícita dos **outros seis PBs fora deste lote**, evitando atribuições de cobertura fictícias. Os seis roteiros PATH permanecem independentes, imutáveis e rastreáveis.

## 2. Matriz mecânica dos seis playbooks

| Playbook | Hipóteses preservadas H1 / H2 / H3 | Contraprova que muda o diagnóstico |
|---|---|---|
| `PB-LOADER-CYL-01` — CAT 980 | Vedação externa do cilindro / fuga interna ou válvula / fuga de linha | Deriva isolada não localiza sozinho cilindro, válvula ou mangueira |
| `PB-DRILL-DR410-FEED-01` — DR410i | Corrente de avanço / guias e deslizantes / hidráulica ou comando | Medições de geometria e registros de comando devem ser separados |
| `PB-DRILL-DI650-COMP-01` — DI650i | Restrição da admissão / fuga pneumática / compressor ou comando | Uma pressão baixa sem pontos OEM, estado de carga e sensor não identifica defeito |
| `PB-GRADER-TIRE-01` — CAT 16 | Pressão fora de aplicação / geometria-direção / solo ou pneu incompatível | Desgaste por si só não determina causa histórica; requer pressão fria e geometria |
| `PB-TRUCK-FUEL-01` — CAT 777 | Água/sedimentos / filtro restrito / sensor ou comando | Água no fluido não prova falha do dreno; comparar amostra, filtro e pressão medida |
| `PB-SHOVEL-MOTOR-OIL-01` — CAT 6030 | Filtro de óleo / condição do lubrificante / indicação elétrica | Alarme do painel não comprova baixa pressão nem obstrução de filtro |

Cada playbook possui três etapas com `methodId` validado na ontologia; S1 e S2 conservam referências aos testes originais T1/T2, e S3 introduz contraprova independente. Os sinais são condicionais e individuais para H1, H2 e H3; a ausência de medição, contexto ou literatura mantém o diagnóstico inconclusivo. Os 24 requisitos são condições de **prontidão para revisão**, não prova de causa raiz.

### Segurança e execução

- **CAT 980:** não se aproximar ou executar deriva com implemento sustentado apenas por pressão hidráulica; requer escoramento mecânico e isolamento autorizado.
- **DR410i:** proteger energia acumulada de corrente de avanço, mastro e sistemas hidráulicos; ajustes de corrente apenas pelo manual efetivo.
- **DI650i:** confirmar despressurização de vasos e linhas antes de inspeções; não extrapolar pressão ou arquitetura de outra variante.
- **CAT 16:** inspeção e inflação por profissional habilitado; jamais ajustar pressão de pneu quente ou intervir na linha de projeção.
- **CAT 777:** amostras rastreáveis antes de intervenção, sistema de combustível protegido; não abrir linha de alta pressão.
- **CAT 6030:** coletar óleo antes da troca, avaliar pressão de maneira independente, não reinstalar filtro retirado/aberto e não manter motor com alarme de baixa lubrificação sem avaliação segura.

## 3. Fontes adicionais e limites

Foram indexadas duas referências oficiais Michelin, [inspeção de pneus de máquinas pesadas](https://b2b.middle-east.michelin.com/help-advice/earthmover-vehicles/tyre-maintenance-earthmover-tyre-inspection) e [pressão adequada por aplicação/carga](https://b2b.middle-east.michelin.com/help-advice/earthmover-vehicles/tyre-pressure-for-earthmover-vehicles). São princípios gerais; não autorizam valor de pressão ou decisão de reparo no pneu efetivo da CAT 16.

A [folha Sandvik DI650i S5](https://www.mining.sandvik/globalassets/products/surface-drill-rigs/pdf/di650i-s5-specification-sheet-english2.pdf) apoia apenas a existência de arquitetura de ar/compressores naquela variante; não comprova que o equipamento desta frota seja S5. Para DR410i, utilizam-se as referências gerais e a [página oficial Sandvik](https://www.mining.sandvik/pt-br/produtos/equipamento/equipamentos-de-perfuracao-de-superficie/dr410i/), que encaminha à literatura efetiva em My Sandvik. A biblioteca já continha fontes Caterpillar de óleo, filtros, combustível e hidráulica.

Nenhuma fonte desses materiais foi copiada integralmente, e não foram incluídos dados corporativos, PN por série ou valores operacionais.

## 4. Evidências, testes e contrato público

- **18** estágios (6×3) documentados, sem execução e sem resultado observado.
- **24** requisitos de prontidão documental (6×4), sem revisão técnica efetuada.
- **34** regressões sintéticas: **18** de prontidão (1/3/4 requisitos disponíveis) e **16** mutações que tentam inventar série, peça SAP, resultado observado, aprovação OEM, causa, etapa, método, metadados, evidência e segurança.
- Novo `npm run playbooks:deepdives:validate`, incorporado a `npm run qa` e ao workflow GitHub Actions, cruzando cada H1/H2/H3 com o registro original.
- Catálogo interno **1.3.18**; contrato público **1.0.0**, conteúdo público **1.0.0**, preview legado **1.3.12** e SHA-256 anterior inalterados. Os seis deepdives não entram silenciosamente na exportação.

## 5. Backlog verificável

Os IDs sem este tipo de deepdive na v1.3.18 são: `PB-EXC-HOSE-01`, `PB-SHOVEL-COOL-01`, `PB-TRUCK-FINAL-01`, `PB-DOZER-TRACK-01`, `PB-EXC-PUMP-01` e `PB-LOADER-RADIATOR-01`. Embora haja PATHs mecanicamente relacionados aos cinco primeiros sistemas, isso não substitui revisão individual dos seus três Hs.

O piloto CAT D9 continua com sete entradas documentais pendentes; as dez regras PM sem vínculo estrito permanecem bloqueadas. Próxima etapa sugerida: revisão por PB dos seis IDs acima e criação de matriz PATH–PB somente quando houver correspondência técnica explícita, sem homologia inferida por palavras.
