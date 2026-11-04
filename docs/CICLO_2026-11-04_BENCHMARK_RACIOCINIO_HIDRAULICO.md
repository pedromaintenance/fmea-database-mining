# Ciclo v1.3.94 — Exercícios de raciocínio diagnóstico hidráulico sem dados de campo

**04/11/2026 · FMEA Database Mining · Qualidade técnica e formação para manutenção.**

## Decisão de escopo

As versões v1.3.90–v1.3.93 criaram 10 matrizes de circuitos, distinguiram fontes OEM comerciais e construíram controles documentais por série. Como não há registros reais, teste de campo nem revisão privada autorizados, **não ampliamos os supostos FMEAs homologados ou inventamos um piloto operacional**.

Neste ciclo, o ganho de qualidade é criar um conjunto **testável e reutilizável de situações sintéticas** que exponham falhas de raciocínio antes da avaliação de um caso verdadeiro. É material de formação, não modelo probabilístico ou algoritmo de diagnóstico real.

## O que foi acrescentado

O dataset `data/quality/hydraulic-diagnostic-reasoning-benchmark.v1.json` contém **20 casos**, agrupados em dois exercícios para cada uma das 10 fichas `HC-DIFF-01..10`:

1. **10 casos ambíguos:** a conduta defensável é pedir uma contraprova que diferencie os três mecanismos, após identificar a documentação OEM aplicável. Nenhum sintoma é convertido em causa.
2. **10 contracasos:** o relato contém risco operacional ou problemas de observabilidade; a conduta correta é interromper uma reprodução insegura (**6 casos**) ou reconciliar fonte, unidade, estado e condição da observação (**4 casos**).

O conjunto referencia as **30 hipóteses concorrentes** previamente modeladas, sem adicionar código de falha aprovado, série, pressão de aceitação ou medição real.

### Cobertura e contradições por sistema

| Cenário | Problema técnico investigado |
| --- | --- |
| HC-DIFF-01 | Alimentação compartilhada: rotação/comando da bomba versus sucção versus regulação |
| HC-DIFF-02 | Lentidão de uma função: válvula versus cilindro/atrito versus restrição |
| HC-DIFF-03 | Pressão supostamente baixa: bomba versus alívio versus proveniência |
| HC-DIFF-04 | Força insuficiente: distribuição local versus passagem interna versus carga/geometria |
| HC-DIFF-05 | Deriva de implemento: vedação versus sustentação versus distribuidor |
| HC-DIFF-06 | Aquecimento: perdas/alívio versus resfriamento versus condição de óleo |
| HC-DIFF-07 | Ruído e espuma: sucção/cavitação versus ar versus falha mecânica |
| HC-DIFF-08 | Movimento irregular: piloto/eletrônica versus carretel versus atrito |
| HC-DIFF-09 | Assimetria: geometria versus válvulas por sentido versus contrapressão |
| HC-DIFF-10 | Leituras divergentes: transdutor versus pontos distintos versus transientes |

### Rubrica de resposta

- `VERIFY_OEM_DISCRIMINANT`: organizar evidência independente e procedimento por série, sem aceitar causa prematura;
- `SAFETY_STOP`: interromper qualquer tentativa de gerar evidência expondo pessoas a linha pressurizada, carga sem suporte, alarme ou bypass;
- `RECONCILE_OBSERVABILITY`: só comparar medições quando ponto, faixa, sincronismo, carga e condições são equivalentes;
- `PREMATURE_CAUSE`: erro — componente condenado por sintoma sem contraprova;
- `UNSAFE_TEST`: erro — reproduzir condição perigosa sem OMM e autorização;
- `APPLY_UNRELATED_REFERENCE`: erro — importar valor de outra série, circuito ou condição.

As quatro primeiras são classes de decisão e de erro **no cenário hipotético**; nenhuma resposta implica que o exercício autorizou uma intervenção.

## Aplicações técnicas

- Treinar revisores de nota de manutenção a rejeitar atribuições prematuras de bomba, válvula e pistão;
- Treinar PCM a formular pedidos de evidência que permitam diferenciar hipóteses na inspeção futura;
- Treinar Engenharia a separar efeito, mecanismo, causa e contraprova;
- Verificar se uma nova integração com assistente/BI teria tendência a oferecer substituição de peças ou testes inseguros na ausência de documentação.

O recurso não calcula probabilidade, RPN, MTBF, severidade ou confiabilidade de ativo. Não fornece procedimento de pressurização, desconexão ou estol. A pontuação mede apenas **consistência com o gabarito didático**; não é certificação.

## Fontes e limites

- [Caterpillar — Your Guide to Cat Hydraulics Technical Analysis Tests](https://www.cat.com/en_US/blog/cat-hydraulics-tests-hydraulic-system-inspection.html), `CAT-HYD-TECHNICAL-ANALYSIS`. A Caterpillar diferencia deriva, tempos de ciclo e pressão, e remete critérios às instruções SIS efetivas.
- [Parker Hannifin — Hydraulic Cylinder Service Manual, Troubleshooting Hints](https://www.parker.com/content/dam/Parker-com/Literature/Mobile-Cylinder/hy18-0008-service.pdf), `PARKER-CYL-DRIFT-SERVICE`. Exemplifica a multiplicidade de mecanismos de deriva e outros sintomas em cilindros. O manual não homologa arquitetura ou procedimento CAT.
- [Caterpillar — Cat Hydraulic Pumps and Motors](https://www.cat.com/en_US/support/maintenance/hydraulics/pumps-and-motors.html), `CAT-HYD-PUMPS-MOTORS`. Contexto genérico de famílias de bombas.

As referências são **conceituais**. Nenhum parâmetro OEM é transposto por modelo, não foram reproduzidas passagens extensas nem diagramas licenciados.

## Arquivos e teste

- `data/quality/hydraulic-diagnostic-reasoning-benchmark.v1.json`: 20 casos, alternativas, hipóteses, gabarito, explicação e rastreabilidade.
- `schemas/hydraulic-diagnostic-reasoning-benchmark.schema.json`: contrato rígido de integridade e segurança.
- `scripts/lib/hydraulic-reasoning.mjs`: avaliação e exportação anônima.
- `docs/treino-diagnostico-hidraulico.html`: **standalone offline**, sem backend/CDN, para realizar as escolhas e exportar resultados em JSON.
- `scripts/audit-hydraulic-reasoning-benchmark.mjs`: testes dos 20 gabaritos, todos os distratores, 24 alterações adversariais, paridade do JavaScript offline, rastreio de fontes e proteção de marcador confidencial.
- `npm run pm:hydraulic:reasoning:audit`: integrado a QA e GitHub Actions.

Não há dados pessoais nem corporativos na exportação: apenas identificadores de caso, código de resposta e se acertou conforme gabarito. Nem mesmo um resultado perfeito concede homologação, permissão de teste ou liberação.

## Resultado de maturidade e próxima ação

Mantidas **25 regras PM conceituais**, **10 exceções PM×SAP bloqueadas** e **8 gates privados NO_GO**. Zero laudos, séries, testes executados, falhas confirmadas ou aprovações inseridos.

**Próxima ação material:** utilizar o treinamento com profissionais em ambiente adequado e coletar feedback não sensível sobre ambiguidade ou qualidade das perguntas. Para avançar em uma FMEA aplicada, um ativo e circuito reais precisam da documentação OEM efetiva por série e da revisão autorizada, mantendo evidência privada. **Os resultados do treinamento nunca entram como evidência de falha em campo.**
