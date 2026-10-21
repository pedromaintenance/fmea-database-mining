# FMEA Database Mining — Ciclo v1.3.40: classificação do filtro de óleo do motor

**Data editorial:** 21/10/2026. **Investigação:** regra `engine-oil-filter` bloqueada por `component_not_registered` no subgrupo LUSY, com família funcional ENGN do motor diesel.

## Pergunta de engenharia

A regra procura `Filtro` em **LUSY**; há locais funcionais LUSY cadastrados, mas seu tipo de objeto não inclui descrição correspondente. Isso pode refletir modelagem funcional incompleta, associação equivocada do componente ao subgrupo, tipo de objeto inadequado ou ausência de representação na extração; nenhuma alternativa pode ser homologada por semelhança textual.

A auditoria `npm run pm:engine:oilfilter:audit` verifica todos os locais de nível 3 nos modelos elegíveis, restringe à raiz funcional do motor e ao grupo ENGN e compara **LUSY**, **outros subgrupos ENGN** e **outros grupos** em camadas separadas. Não modifica `seed-rules.json`, estrutura SAP, peças ou vínculos PM.

## Resultado reproduzido pelo GitHub Actions

| Indicador | Resultado |
| --- | ---: |
| Caminhos de nível 3 dos modelos da regra | 307 |
| Caminhos nas raízes funcionais do motor | 83 |
| Caminhos pertencentes ao grupo ENGN | 40 |
| Caminhos ENGN/LUSY | 8 |
| Caminhos LUSY contendo descrição explícita de filtro | **0** |
| Caminhos em outros subgrupos ENGN contendo filtro | 16 |
| Ocorrências textuais de filtros nos subgrupos ENGN vizinhos | 40 |
| Ocorrências **explicitamente de óleo** nos subgrupos vizinhos | **8** |
| Ocorrências de óleo com par 03.02/C2.09 elegível no catálogo | **8** |
| Subgrupos identificados como candidatos textuais | ETBE e IKSY |
| Aprovações SAP/OEM, inspeções de campo e falhas confirmadas | **0** |

**Interpretação obrigatória:** as 40 ocorrências englobam **filtros de ar, combustível, óleo e descrições sem meio identificado**. Em IKSY, as ocorrências são relativas a **ar**, sem correspondência textual de filtro de óleo. Em ETBE, há descrições de vários tipos de filtros, com **oito ocorrências textuais de óleo** contabilizadas pelos caminhos/modelos. Os totais são ocorrências cadastrais, **não códigos distintos de material, números de filtros instalados ou conjuntos completos**. Além disso, ETBE e IKSY podem aparecer em diferentes raízes funcionais; não descartar o caminho de sistema e grupo durante a curadoria.

O par 03.02/C2.09 é **permitido no cadastro** para as ocorrências destacadas, mas isso não prova perda de capacidade de filtragem ou o mecanismo da obstrução. A relação ETBE → filtro de óleo **não está aprovada** como substituta de LUSY.

## Fenômenos mecânicos que não devem ser fundidos

1. **Restrição diferencial no filtro:** investigar indicação de diferença de pressão de entrada/saída com método, condição de operação e disposição física efetivos por fabricante.
2. **Partículas no óleo ou no filtro removido:** condição do lubrificante/desgaste a caracterizar, sem atribuir automaticamente causa ao elemento filtrante.
3. **Baixa pressão geral de lubrificação:** pode depender de bomba, folgas internas, viscosidade, condição térmica, válvula, sensor e outros fatores; não comprova obstrução do elemento.
4. **Troca preventiva do filtro:** ação de manutenção, não falha observada. Quando houver inspeção destrutiva do elemento usado, seguir procedimento OEM, substituir o elemento e registrar separadamente a evidência encontrada; não reinstalar elemento inspecionado destrutivamente.

A ontologia v1.3.7 já oferece essas três condições diagnósticas, três ações propostas e uma hipótese de dano ao elemento ainda não aprovada. Este ciclo **reutiliza** essa distinção, sem criar duplicatas.

## Evidência primária utilizada e seus limites

- [Caterpillar — How to Change a Cat Engine Oil Filter](https://www.cat.com/en_US/blog/change-cat-engine-oil-filter.html): operação genérica de substituição, inspeção do elemento removido e necessidade de OMM por máquina. Não comprova que o filtro esteja montado em ETBE, nem define diferencial admissível.
- [Caterpillar — Filtros de óleo do motor](https://www.cat.com/pt_BR/products/new/parts/filters/engine-oil-filters.html): função de retenção de contaminantes; não estabelece eficiência, número de peça, modo de falha ou instalação nos modelos do banco.
- [SAP — Estrutura de locais funcionais](https://help.sap.com/docs/SAP_ERP_SPV/f0e0dd7850e64947aa66a647f8d3af09/0ab7b853dcfcb44ce10000000a174cb4.html?locale=en-US&state=PRODUCTION&version=6.18.24): estrutura de objetos não equivale à BOM montada no ativo.

## Próximas evidências exigidas em ambiente corporativo privado

- Conferir estrutura de **ENGN/LUSY e ENGN/ETBE** por modelo e conjunto específico, incluindo possíveis motores duplos ou variantes.
- Consultar SIS/OMM, arranjo de filtragem e BOM efetiva por máquina/série; estabelecer posição física, tipo de elemento (cartucho/spin-on), base, linhas de pressão e mecanismos de bypass existentes.
- Comparar a correspondência do tipo de objeto SAP ao elemento efetivamente montado e sua função, com revisão independente de Engenharia/Dados Mestres.
- Se houver queixa real de restrição, exigir evidência de diagnóstico aplicável ao motor, com alternativa para baixa pressão, viscosidade e indicação; não inferir causa pela troca de filtro nem por laudo de partículas isolado.
- Manter o bloqueio da regra e só propor correção de subgrupo/componente quando o conjunto efetivo tiver sido comprovado.

## Rastreabilidade e segurança

Relatório de build `reports/pm-engine-oil-filter-scope.generated.json`. Scanner de função e texto `scripts/lib/pm-engine-oil-filter-scope.mjs`; auditor `scripts/audit-pm-engine-oil-filter.mjs`. **Nove testes lexicais e treze mutações adversariais** protegem separação de filtros por fluido, grupo, modelo, código de dano/causa e ausência de homologação.

**Status final:** 25 regras PM, 115 vínculos candidatos e 10 exceções bloqueadas. Os 24 FC/15 ME, o contrato e o conteúdo públicos 1.0.0 e o preview 1.3.12 não foram modificados. Nenhuma ordem SAP, medição ou intervenção foi gerada pelo auditor.
