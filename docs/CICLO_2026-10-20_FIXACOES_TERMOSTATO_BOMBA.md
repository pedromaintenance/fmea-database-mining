# Ciclo de pesquisa FMEA v1.3.3 — Fixações do rodante e circulação do arrefecimento

**Data editorial:** 20/10/2026  
**Status:** pesquisa técnica e hipóteses causais genericamente plausíveis; **não é FMEA OEM aprovada**  
**Escopo:** somente o banco `fmea-database-mining`; sem qualquer alteração em consumidores

## Critério de pesquisa

Foram confrontadas fontes **Caterpillar** (função de parafusos de sapatas, inspeção do rodante, operação de termostatos e função de bomba d'água) com literatura de engenharia de juntas aparafusadas da **Nord-Lock** (pré-carga, autoafrouxamento, assentamento e ruptura por fadiga).

Esses documentos dão base a **princípios físicos**; não determinam que esses mecanismos estejam ocorrendo em D9/395/6030, nem fornecem procedimento, PN, valor de aperto, temperatura de abertura, curva de bomba ou tolerância de série. A função em um material genérico pode ser reaproveitada como hipótese, mas a aplicabilidade em máquina específica exige SIS/OMM ou catálogo OEM efetivo.

## Descobertas e distinções causais

### Material rodante / parafusos de sapata

| Fenômeno | O que significa | Como diferenciar |
| --- | --- | --- |
| **Autoafrouxamento rotacional** | Deslocamentos relativos entre faces e vibração favorecem rotação do fixador e perda de pré-carga | Evidências de rotação e marcas de movimento, mas nenhuma marca isolada confirma o evento retrospectivamente |
| **Perda de pré-carga sem rotação** | Assentamento, deformação/relaxação das faces reduzem a força de compressão | Histórico de montagem, estado da junta e método de avaliação apropriado; torque residual isolado não mede pré-carga inicial |
| **Ruptura por fadiga** | Tensões cíclicas favorecem iniciação e propagação de trinca até ruptura | Fragmento e superfície preservada para avaliação metalúrgica; não confundir parafuso ausente com parafuso fraturado |
| **Deslocamento da sapata / desgaste de interface** | Micromovimentos, contato e possível ovalização após perda de retenção | Inspeção das interfaces e geometria OEM, diferenciando dano secundário de causa da perda de aperto |

Caterpillar recomenda verificar fixadores soltos, remover detritos e usar o **método torque-turn** previsto para o conjunto; a página **não** informa valores universais. O conceito de **pré-carga insuficiente** e **pré-carga excessiva** deve ser avaliado com base em especificação real, não por heurística de aperto.

### Arrefecimento / termostato e bomba

| Fenômeno | Função afetada | Discriminação necessária |
| --- | --- | --- |
| Termostato com abertura insuficiente | Permitir fluxo ao radiador quando o sistema requer rejeição térmica | Diferenciar circulação da bomba, ventilação do radiador e termostato |
| Termostato aberto antes do requerido | Restringir fluxo ao radiador durante partida fria e regular aquecimento | Separar aquecimento lento real de leitura incorreta e baixa carga/ambiente frio |
| Bomba d'água com circulação insuficiente | Mover o líquido arrefecedor através do circuito | Verificar bomba e seu acionamento conforme configuração, sem atribuir dano de rotor sem exame |
| Vazamento na bomba d'água | Manter estanqueidade do conjunto e volume do circuito | Localizar origem física da trilha, separando bomba, conexão próxima, tampa e radiador |

A Caterpillar explicita que o termostato desvia o líquido do radiador quando frio e abre progressivamente ao aquecer; também alerta que operar **sem termostato** pode manter o bypass aberto e agravar superaquecimento em arquiteturas descritas pelo fabricante. A bomba promove a circulação e, entre os sinais gerais associados à necessidade de investigação, constam vazamento e aquecimento excessivo.

**Observação metodológica importante:** termos como `termostato travado aberto`, `fratura por fadiga` e `circulação insuficiente` são **mecanismos candidatos inferidos a partir dos princípios publicados**; não são constatações dos fabricantes sobre uma unidade da frota.

## Fontes selecionadas e aplicabilidade

| Fonte | Link | Limite |
| --- | --- | --- |
| Caterpillar — Manutenção do rodante de tratores | [Página Cat](https://www.cat.com/en_US/support/maintenance/undercarriage/dozers/) | Requer OMM efetivo para torque-turn, sequência e componentes |
| Caterpillar — Função de parafuso de sapata | [Página Cat Parts](https://parts.cat.com/en/catcorp/product/093-0261) | **Peça de outro modelo**; função mecânica genérica, não PN aplicável ao D9 |
| Nord-Lock — Por que parafusos afrouxam? | [Nota técnica](https://www.nord-lock.com/learnings/knowledge/2018/why-do-bolts-loosen/?cachebreak=true) | Princípios gerais, não especificação de esteira |
| Nord-Lock — Análise de falha de juntas | [Artigo técnico](https://www.nord-lock.com/fr-ch/apercu/knowledge/2015/bolting-failure-analysis/) | Falha por fadiga genérica; confirmação exige inspeção de fratura |
| Nord-Lock — Pré-carga | [Nota técnica](https://www.nord-lock.com/nb-no/innsikt/bolting-tips/2025/what-is-preload-and-why-is-it-important/) | Não estabelece torque ou método Cat |
| Caterpillar — Termostato | [Página Cat](https://www.cat.com/pt_BR/support/maintenance/self-service-options/thermostat.html) | Temperaturas/arquiteturas específicas variam |
| Caterpillar — Bomba d'água | [Página Cat](https://www.cat.com/pt_BR/support/maintenance/self-service-options/water-pump.html) | Sem vazão, pressão ou PN por equipamento |

Todos foram indexados em `data/research/sources.v1.json`. Seus conceitos estão parafraseados, sem transcrever longos procedimentos OEM.

## Itens incorporados (8)

| ID | Família | Tema |
| --- | --- | --- |
| FC-TRACK-005 | Material rodante | Autoafrouxamento rotacional |
| FC-TRACK-006 | Material rodante | Perda de pré-carga sem rotação |
| FC-TRACK-007 | Material rodante | Fratura por fadiga do parafuso |
| FC-TRACK-008 | Material rodante | Deslocamento/desgaste da interface sapata–elo |
| FC-COOL-005 | Arrefecimento | Termostato restringindo fluxo indevidamente |
| FC-COOL-006 | Arrefecimento | Termostato abrindo antes do requerido |
| FC-COOL-007 | Arrefecimento | Circulação insuficiente pela bomba |
| FC-COOL-008 | Arrefecimento | Vazamento da bomba |

**Total acumulado no catálogo:** 24 cadeias, 4 famílias de mecanismos, 48 investigações propostas, 0 ocorrências empíricas e 0 causas raízes homologadas. A ontologia ampliou o conjunto de sintomas de 20 para **22**, incluindo tempo de aquecimento prolongado e discrepância entre indicação e medição independente.

## Refinamento das relações preventivas

`track-bolt-loose` aponta para inspeções da fixação que podem detectar condições relevantes, **mas não prova que houve afrouxamento ou fratura**.

As cadeias `FC-COOL-005` a `008` apontam para regras de inspeção do radiador **apenas como monitoramento contextual de circuito** (`vinculo_preventivo_contextual_sem_alvo_direto`), porque não há no lote atual uma regra OEM validada de inspeção exclusiva do termostato/bomba. A validação automática impede sua promoção indevida a tarefa específica.

## Qualidade, riscos e próximo passo

- `scripts/validate-causal-chains.mjs` exige fontes existentes, mecanismos e sintomas cadastrados, regras PM do mesmo sistema, duas hipóteses alternativas e dois testes com resultados possíveis de sustentar, enfraquecer e ser inconclusivo.
- Não foram criados valores de torque, temperatura, pressão, velocidade, duração ou limiares S·O·S.
- Não há associação direta a local SAP, código de componente, dano/causa catalogada ou série.
- Intervenções em sistema térmico pressurizado, mecanismos tensionados de esteira e fixadores danificados exigem bloqueio e procedimento OEM específico.

**Próximo ciclo recomendado:** auditoria cruzada dos 24 mecanismos com códigos de dano/causa existentes; inclusão de matriz de cobertura **função → modo → consequência local/global → tarefa PM/inspeção**, preservando a distinção entre evidência e inferência. Primeiro preencher fontes de modelo/série para CAT D9 e pelo menos uma configuração de motor CAT antes de qualquer homologação.
