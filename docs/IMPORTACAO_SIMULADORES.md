# Extração dos jogos de treinamento — base v1.1.0

## Origem

- [Códigos de Falha](https://github.com/pedromaintenance/porcaria-codigos-de-falha): `js/data.js` (SHA `c605b4a80323641e73bc2f64513f1266f3356377`).
- [Análise de Óleo](https://github.com/pedromaintenance/porcaria-analise-de-oleo): `js/cases.js` (SHA `a29b06749d2f0dab9457daac5108d82cbb6510fd`) e `js/library.js` (SHA `c3a4d75ac5cc7498cc949b4d63de5ab9768c8ecf`).

Importação fiel dos campos de origem em arquivos `source-cases.json`; registros orientados à FMEA em `diagnostic-records.json`. Os links externos citados pelo jogo **não foram revalidados** nesta extração.

## Inventário

| Conteúdo | Eletrônica | Análise de óleo |
| --- | ---: | ---: |
| Casos de treinamento | 72 | 72 |
| Agrupamentos | 24 códigos/situações x 3 causas | 24 arquétipos x 3 variações |
| Textos da biblioteca | 22 | 17 |
| Evidências adicionais simuladas | 216 | 72 |
| Capítulos | 8 | 8 |

Eletrônica inclui também **54 entradas de índice, das quais 23 FMI**, além de **27 referências externas** registradas no jogo. Total: **144 casos, 288 observações simuladas, 144 sintomas e 144 hipóteses**.

## Arquivos e relações

```text
data/knowledge/
  manifest.json
  electronic/
    source-cases.json
    diagnostic-records.json
    differential-sets.json
    code-index.json
    fmi-index.json
    manuals.json
    sources.json
    chapters.json
    simulation-items.json
  oil/
    source-cases.json
    diagnostic-records.json
    archetypes.json
    manuals.json
    chapters.json
    simulation-assets.json
  symptoms-index.json
  observations-index.json
  hypotheses-index.json
```

Os IDs `ELEC-CF-...` e `OIL-CASE-...` identificam os cenários; `sourceId` preserva o vínculo à fonte. Cada observação em `observations-index.json` aponta ao `caseId`. Em `differential-sets.json`, cada código contextual possui três possíveis causas **dentro do simulador**.

## Como usar corretamente

**DTC não é defeito confirmado.** No mesmo código eletrônico, a inspeção, a medição e o histórico simulados distinguem conector, chicote e sensor. Confirmação real exige publicação OEM por ECM, modelo, série e revisão de software.

**Análise de óleo não aponta peça única.** Contaminação por água/poeira, metais, viscosidade, mudança de baseline, combustível e aditivos podem exigir reteste, inspeção, monitoramento ou intervenção. Não foram extraídos laudos quantitativos reais, valores de referência operacionais, nem séries temporais de laboratório.

**Não fazer mapeamento SAP inventado.** `modelCandidate` em alguns registros é apenas correspondência textual ao modelo; `sapLocationId: null` sinaliza ausência de correspondência validada. Não associar automaticamente `componentCode`, `damageId` ou `causeId` ao banco de 518.832 combinações heurísticas.

**Separação da interface.** Inicialmente expor `reported` e `code`. `simulatedEvidence` deve surgir somente após a escolha de inspeção/teste. `hypothesis` e `handling` são gabaritos restritos, jamais enviados à tela de investigação sem controle de revelação. Somente casos curados poderão alimentar a campanha do jogo.

**Dinheiro e peças virtuais.** Os arquivos `simulation-items.json` e `simulation-assets.json` registram economia fictícia; não representam preço de materiais, HH, ordens SAP ou orçamento OEM.

## Limitações

São **casos autorais e fictícios**, não ocorrência histórica de equipamento real, FMEA homologada, catálogo OEM completo nem fonte de instruções de campo. As referências externas permanecem referências a verificar antes de afirmar aplicabilidade em uma configuração específica.
