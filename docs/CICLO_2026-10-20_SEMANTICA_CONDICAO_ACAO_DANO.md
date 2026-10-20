# Ciclo v1.3.6 — Condição detectada ≠ atividade preventiva ≠ dano do componente

**Data editorial:** 20/10/2026  
**Escopo:** somente FMEA Database Mining, banco público de conceitos e hipóteses  
**Status:** modelo semântico autoral, validado estruturalmente, **não homologado para máquina/série**

## Problema corrigido

Na v1.3.5, a auditoria mostrou dez regras preventivas sem correspondência SAP. Duas são especialmente esclarecedoras: `fuel-tank-water` tentava representar água no combustível como dano do dreno; `cooling-radiator-blockage` tentava representar sujidade externa como um par de dano/causa de obstrução do trocador. **São problemas de natureza semântica, não necessariamente ausência de uma peça fisicamente instalada.**

O novo modelo [condition-action-damage.v1.json](../data/ontology/condition-action-damage.v1.json) introduz três tipos com identificadores próprios:

| Entidade | Pergunta respondida | Exemplo | O que não autoriza |
| --- | --- | --- | --- |
| **Condição** `COND-*` | O que observar/medir? | Água no combustível; material entre aletas | Inferir filtro/dreno/radiador danificado |
| **Atividade** `ACT-*` | Qual ação seria feita, se autorizada? | Drenar separador; inspecionar/limpar aletas | Afirmar execução ou conserto efetivo |
| **Dano candidato** `DMG-*` | Que componente poderia estar fisicamente alterado? | Elemento filtrante restringido; perda de estanqueidade | Promover hipótese a dano confirmado sem investigação independente |

**Inventário inicial:** 7 condições, 8 atividades, 4 danos hipotéticos, 4 agrupamentos por regra preventiva e 22 relações tipadas. O vínculo ao modelo, série, instalação SAP, peça, dano e causa catalogados é **nulo** em todos os danos candidatos. As 25 regras anteriores permanecem preservadas, com 10 bloqueios de junção pendentes.

## Dois exemplos discriminantes

### Água no separador combustível

1. Inspecionar/medir uma condição de presença de água em amostra representativa (`COND-FUEL-WATER`).
2. Coletar ou drenar, se previsto no OMM específico (`ACT-FUEL-REPRESENTATIVE-SAMPLE`; `ACT-FUEL-DRAIN-SEPARATOR`).
3. Se necessário, investigar separadamente possível restrição de filtro ou falha funcional do dreno (`DMG-FUEL-FILTER-RESTRICTION`; `DMG-FUEL-DRAIN-FAILURE`) **com ensaio independente**.

A água pode estar presente com o separador operando corretamente: sua presença não comprova dreno avariado, nem a drenagem demonstra que a origem do ingresso foi eliminada. Não foram criados ppm, limites nem intervalos de serviço.

### Sujidade externa do radiador

1. Registrar condição-alvo de material entre aletas (`COND-COOL-EXTERNAL-DEBRIS`).
2. Inspecionar visualmente e, se indicado e autorizado, limpar conforme OMM (`ACT-COOL-FINS-INSPECT`; `ACT-COOL-FINS-CLEAN`).
3. Diferenciar **restrição de ar externa** de **restrição interna de líquido arrefecedor** (`COND-COOL-INTERNAL-FLOW-RESTRICTION`) e **temperatura elevada** (`COND-COOL-HIGH-TEMPERATURE`).
4. Somente propor dano interno do radiador (`DMG-COOL-INTERNAL-BLOCKAGE`) após teste de circulação conforme método OEM aplicável.

Limpeza de colmeia não comprova que o radiador foi reparado, nem temperatura elevada condena o radiador. Vazamento externo recebe condição e inspeção próprias, distinguindo origem no radiador de mangueira/conexão adjacente.

## Pesquisa técnica consultada

- [Caterpillar — Guide to Checking Filters & Fluids](https://www.cat.com/en_US/blog/check-filters-fluids-equipment.html): orientação de inspeção de filtros, drenagem de separador água/combustível e checagem visual de trocadores; sempre remete ao OMM específico.
- [Caterpillar — Radiador](https://www.cat.com/pt_BR/support/maintenance/self-service-options/radiator.html): recomenda inspecionar componentes e limpar aletas para prevenir obstruções; descreve contaminação do fluido e corrosão como outro mecanismo.
- [Caterpillar — Fuel and Water Separator Filter](https://parts.cat.com/en/catcorp/product/483-1002): função geral do separador, **não** valida peça aplicada à frota.
- [ISO 17359:2018](https://www.iso.org/standard/71194.html): orientação geral para implantação de monitoramento de condição em máquinas.
- [ISO 13379-1:2025](https://www.iso.org/standard/88027.html): resumo oficial sobre conceitos, dados, interpretação e seleção de abordagem de diagnóstico; **texto integral não foi consultado**, portanto não há alegação de conformidade normativa.
- [SAP Help — Key Figures for Damage Description](https://help.sap.com/docs/SAP_ERP_SPV/0fdc23a7692c4198808a075443509bcb/5812c453f57eb44ce10000000a174cb4.html): distinção cadastral entre descrições de danos, causas e atividades.

Fontes já existentes foram reutilizadas; a norma ISO 13379-1:2025 foi indexada em [sources.v1.json](../data/research/sources.v1.json).

## Arquitetura e testes de segurança semântica

```text
Regra preventiva de origem
 ├── monitora condição possível           [rule_monitors_condition]
 ├── propõe atividade de inspeção/serviço  [rule_proposes_action]
 └── lista dano para investigação          [rule_lists_differential_damage]
      └── NÃO confirma dano automaticamente
```

- [JSON Schema](../schemas/condition-action-damage.schema.json) descreve o contrato versionado;
- [Validador de referência e estados](../scripts/validate-condition-action-damage.mjs) verifica IDs, fontes, métodos, regras e cadeias, além de proibir informação de campo inventada;
- [Sete cenários sintéticos](../data/quality/semantic-regression-fixtures.v1.json) abrangem água identificada, água drenada, sólidos, radiador sujo, radiador limpo, temperatura elevada e líquido com origem não identificada;
- Cada cenário exige **zero danos confirmados** na ausência de prova independente, ainda que uma condição seja positiva ou uma ação seja considerada executada na simulação.

Esses testes verificam a consistência dos registros e a **impossibilidade de promoção automática**, não a precisão de um diagnóstico OEM.

## Conservação de dados e restrições

Nenhum arquivo bruto de plano, número de patrimônio, laudo real, limite OEM ou procedimento completo foi publicado. Não há horários de execução, resultados de inspeção, ordens encerradas, amostras reais nem falhas confirmadas. O modelo não cria correspondências SAP para preencher lacunas cadastrais por conveniência.

## Próximo ciclo recomendado

1. **Aplicar a separação em mais regras:** restrição do filtro de óleo; desgaste de rolete; contaminação do sistema hidráulico e diagnóstico de pressão.
2. **Criar eventos opcionais, segregados:** resultado de inspeção real autorizado, atividade executada e modo de falha verificado, com data, método, equipamento aplicável, origem e permissão de acesso.
3. **Especificar efeitos locais/sistêmicos** para cada cadeia, mantendo mecanismos e danos distintos.
4. **Revisar as 10 lacunas SAP**, sem inventar subgrupos ou PNs; priorizar representação física de filtro/separador e linhas hidráulicas.
5. **Curadoria mecânica/OEM:** obter literatura efetiva por família/série antes de elevar qualquer vínculo a status homologado.

O consumidor do banco pode ler o novo contrato por versão, mas nenhum repositório externo foi alterado neste ciclo.
