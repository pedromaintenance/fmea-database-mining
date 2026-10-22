# FMEA Database Mining — Ciclo v1.3.46: fixadores de sapatas, pré-carga e afrouxamento

**21/10/2026 · Ontologia 1.3.11 · Banco 1.3.46.** Investigação técnica de `track-bolt-loose` com distinção entre **condição de campo hipotética**, **mecanismo físico candidato**, **dano ao componente** e **ações não executadas**. Nenhum resultado real, torque de montagem, número de peça ou série foi presumido.

## Função e premissa do conjunto

Parafusos e porcas de sapata formam a união entre a sapata e os elos da esteira. A pré-carga obtida na montagem mantém o contato e a capacidade de retenção requerida para cargas dinâmicas. Essa força não deve ser confundida com o valor de torque aplicado, com indícios de rotação ou com um torque residual de verificação. Quando o conjunto não se mantém adequadamente unido, pode haver movimento relativo, desgaste do assento e aumento de esforços alternados nos fixadores, mas a causalidade deve ser discriminada por evidência.

**Atenção:** a orientação pública Caterpillar recomenda verificar fixadores soltos e seguir *torque-turn* para ferragens de rodante; isso **não define torque, ângulo, sequência, classe de material ou reutilização de fixadores** em D9, escavadeiras ou variantes específicas. Somente procedimento OEM efetivo por configuração/série pode autorizar a montagem ou substituição.

## Quatro diferenciais semânticos

| Fenômeno | Indício a verificar | O que o indício não prova |
| --- | --- | --- |
| **Afrouxamento rotacional** | Marcas de referência ou deslocamento angular com base histórica válida | Pré-carga medida, causa raiz ou confirmação de falha por vibração |
| **Perda de pré-carga sem rotação** | Assentamento, deformação superficial, fretting e marca de contato na interface sapata-elo | Autoafrouxamento, torque original de montagem ou incapacidade definitiva do material |
| **Parafuso frouxo ou ausente** | Folga, falta de fixador e abertura de junta com componente identificado | Se houve rotação, fratura, erro de montagem ou outra origem |
| **Dano/fratura do fixador** | Trinca, quebra, alongamento aparente, fragmento ou perda física | Fadiga comprovada; ruptura por sobrecarga e efeitos de montagem continuam hipóteses |

**Perda de pré-carga não implica rotação**: acomodação/assentamento ou relaxação podem reduzir a força de aperto. **Rotação não implica fratura**; e um fixador fraturado não é simplesmente um parafuso que perdeu aperto. Os termos representam fenômenos materiais distintos, com critérios de inspeção e riscos diferentes.

## Ontologia adicionada

A regra `track-bolt-loose`, já presente no catálogo como **hipótese preventiva**, recebeu o bundle `BUNDLE-13`.

**Quatro condições propostas:** `COND-TRACK-SHOE-FASTENER-LOOSE`, `COND-TRACK-SHOE-ROTATION-SUSPECT`, `COND-TRACK-SHOE-SEAT-DISTRESS` e `COND-TRACK-SHOE-FASTENER-FRACTURE`.

**Três ações ainda não executadas:** identificar configuração e fixadores da união; inspecionar assento, movimento e integridade do conjunto; avaliar substituição e possível montagem pelo método *torque-turn* **somente conforme OMM/SIS aplicável**.

**Dois danos candidatos, não confirmados:** `DMG-TRACK-SHOE-JOINT-CLAMP-CANDIDATE` (suspeita de perda de capacidade de retenção da junta) e `DMG-TRACK-SHOE-FASTENER-FRACTURE-CANDIDATE` (suspeita de dano físico do fixador). Ambos permanecem com `confirmed:false`, `reviewStatus:not_approved` e cinco campos de mapeamento SAP nulos.

O modelo cria **nove relações tipadas** entre o bundle e seus conceitos, sem associar um dano a código de falha real nem a posição efetiva do equipamento. Não reutiliza condições de **rolete** ou **roda-guia** para caracterizar fixadores de sapatas.

## Evidência e requisitos de planejamento

1. Localização e identificação do conjunto sapata-elo, modelo, variante, lado/posição e estrutura/BOM OEM por número de série.
2. Configuração efetiva de parafusos, porcas, superfícies de apoio, condição de reutilização e critério de inspeção de deformação/assentamento.
3. Orientação de montagem específica do fabricante: sequência, limpeza/preparação, torque, ângulo, substituição e ferramenta calibrada, se aplicáveis.
4. Inspeção controlada de folga, falta de fixadores, deslocamento relativo, desgaste do assento e dano físico do componente. Não buscar diagnóstico por reaperto indiscriminado.
5. Avaliação independente de Engenharia para diferenciar autoafrouxamento, assentamento, fadiga, sobrecarga ou outra hipótese concorrente.
6. Gestão de risco: equipamento estabilizado, bloqueio de energias, controles de esmagamento/movimentação da esteira e não operação quando a retenção da sapata estiver potencialmente comprometida.

**Não** se deve realizar teste improvisado de torque de desaperto ou reaperto “até parar de girar” como método universal de medir pré-carga. Também não é possível derivar torque de instalação ou reaproveitamento a partir dos registros genéricos do banco.

## Fontes técnicas e limites

- [Caterpillar — Undercarriage for Dozers](https://www.cat.com/en_US/support/maintenance/undercarriage/dozers.html): inspeção de parafusos soltos no rodante e recomendação de montagem *torque-turn*; sem valores efetivos de aperto por máquina.
- [Caterpillar — Dozer Undercarriage Maintenance](https://www.cat.com/en_US/articles/for-owners/dozer-undercarriage-maintenance.html): inspeção de fixação entre sapatas e elos; recomendação de consultar OMM específico.
- [Nord-Lock — Why do bolts loosen?](https://www.nord-lock.com/learnings/knowledge/2018/why-do-bolts-loosen/): diferencia autoafrouxamento rotacional, assentamento, fluência e relaxação; não equivale a homologação de elemento de travamento ou torque CAT.
- [Nord-Lock — Extending the Service Life of Studs and Bolts](https://www.nord-lock.com/pt-br/aprendizados/dicas-de-aparafusamento/2014/extend-service-life-of-studs-and-bolts/): fadiga por carga alternada e influência da pré-carga; não determina esforços ou vida remanescente dos parafusos da frota.

Os IDs de fonte correspondentes já estão presentes em `data/research/sources.v1.json`, com seus limites de aplicabilidade. Não foi adicionada literatura privada OEM ao GitHub público.

## Validação e cobertura

| Indicador | v1.3.45 | v1.3.46 |
| --- | ---: | ---: |
| Regras PM cadastradas | 25 | 25 |
| Regras com bundle semântico | 12 | **13** |
| Regras ainda sem bundle | 13 | **12** |
| Condições hipotéticas | 28 | **32** |
| Ações propostas | 25 | **28** |
| Danos candidatos | 12 | **14** |
| Bundles | 12 | **13** |
| Relações tipadas | 71 | **80** |
| Cenários sintéticos | 20 | **22** |
| Vínculos PM candidatos | 115 | **115** |
| Exceções PM bloqueadas | 10 | **10** |

O auditor `npm run pm:track:bolt:audit` confere quatro classes de fenômeno, nove arestas, fontes, distinção entre condição e prova, proibições de torque universal e **32 alterações adversariais** (20 de ontologia, oito da matriz técnica e quatro de casos sintéticos). O relatório do CI é `reports/pm-track-bolt.generated.json`.

**Estado após este ciclo:** não houve observação de campo, registro de torque, falha confirmada, OS emitida ou mapeamento SAP aprovado. 24 cadeias FC, 15 mecanismos ME, contrato/conteúdo público 1.0.0, preview 1.3.12 e consumidores anteriores permanecem preservados, sujeitos à validação integral do CI.

## Próxima decisão de engenharia

Antes de transformar o roteiro em atividade real, obter desenho e instrução OEM efetivos da união específica e validar segurança, fixadores, reutilização, ferramenta de aperto e critério de condenação. A modelagem semântica, sozinha, não é autorização de manutenção.
