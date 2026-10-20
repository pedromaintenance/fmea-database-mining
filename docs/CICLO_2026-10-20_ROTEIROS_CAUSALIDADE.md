# Ciclo FMEA v1.3.11 — Três roteiros diagnósticos e níveis de causalidade

**Data editorial:** 20/10/2026  
**Repositório:** FMEA Database Mining (somente produtor de conhecimento; consumidores externos não alterados)  
**Status:** conhecimento técnico-didático inferido; **nenhum teste executado ou causa raiz homologada**.

## Objetivo e ponto de partida

A v1.3.10 deixou **12 lacunas diagnósticas abertas** nos seis testes P0. Neste ciclo foram selecionadas três lacunas relevantes que exigem evidências de tipos diferentes: origem de óleo em mangueira, origem de partículas em comando final e perda de pré-carga de parafuso de sapata. Não foram declaradas resolvidas.

O novo [arquivo de roteiros](../data/quality/diagnostic-pathways.v1.json) registra **3 roteiros × 3 etapas = 9 investigações encadeadas**. Cada etapa possui método `EV-*`, pergunta técnica, sinais que poderiam favorecer cada hipótese, resultado não discriminante, metadados e limite de segurança. O documento preserva a distinção entre **checklist de prontidão** e **decisão diagnóstica baseada em evidências reais**.

## Literatura consultada e alcance

| Referência | Base oferecida | Limite |
| --- | --- | --- |
| [Caterpillar — Condition Monitoring](https://www.cat.com/en_US/support/maintenance/condition-monitoring.html) | Monitoramento exige triangulação de inspeções, fluido, dados eletrônicos, histórico e contexto operacional | Não fornece algoritmo universal de confirmação de causa |
| [Caterpillar — Inspeção de mangueiras](https://www.cat.com/en_US/blog/inspect-cat-hydraulic-hose-assemblies.html) | Identificar abrasão, torção, trincas e vazamentos com procedimento seguro | Não identifica o conjunto específico ou garante origem do óleo |
| [Caterpillar — Drive Train Magnetic Plugs](https://www.cat.com/en_US/blog/inspect-drive-train-magnetic-plugs.html) | Inspeção de depósito magnético, foto e tendência podem informar condição do trem de força | Exemplo em outra máquina; classificação do artigo não substitui critérios do 777 |
| [Caterpillar — Drivetrain Repair Indicators](https://www.cat.com/en_US/blog/drivetrain-repairs-preventive-maintenance.html) | Detritos podem estar associados a engrenagens/rolamentos e contaminação externa | Não identifica peça real por análise isolada |
| [Nord-Lock — Why do bolts loosen?](https://www.nord-lock.com/learnings/knowledge/2018/why-do-bolts-loosen/?cachebreak=true) | Diferença física entre rotação e assentamento/relaxação de junta | Não estabelece torque-turn/PN por prefixo Cat |
| [IEC 60812:2018](https://webstore.iec.ch/en/publication/26359) | FMEA distingue modo, consequência local/global e causas possíveis | Apenas resumo oficial; critérios mecânicos elaborados neste banco são inferências |
| [ISO 14224:2016](https://www.iso.org/standard/64076.html) | Separa dados de equipamento, falha e manutenção; recomenda taxonomia/rastreabilidade | É voltada a petróleo/petroquímica/gás; uso em mineração é adaptação metodológica, não conformidade declarada |

As duas referências Caterpillar `CAT-DRIVE-MAINT-PRACTICES` e `CAT-CONDITION-MONITORING-MULTISOURCE` foram acrescentadas ao [índice bibliográfico](../data/research/sources.v1.json). Nenhum texto integral de norma ou procedimento OEM foi republicado.

## Roteiro 1 — Origem da mancha em mangueira hidráulica

**Cadeia:** `FC-HOSE-001` · **Lacuna de origem:** `FC-HOSE-001/ALT2`

**Hipóteses em comparação:** perda de contenção da mangueira abrasada versus óleo de conexão/componente acima que escorre sobre a mangueira.

**Investigação proposta:** (1) inspecionar origem e continuidade da trilha com sistema isolado; (2) examinar contato, suporte e roteamento com arranjo OEM; (3) consultar cronologia de trocas e vazamentos. Evidências de atrito podem confirmar **contato e desgaste**, mas não necessariamente a **origem** do vazamento. Trilha superior pode indicar origem adjacente, mas exige confirmação apropriada e segura.

**Risco:** injeção de fluido sob pressão. É proibido aproximar pele ou provocar fuga como teste. Não há pressão de ensaio definida neste banco.

## Roteiro 2 — Origem de partículas no comando final

**Cadeia:** `FC-FD-001` · **Lacuna de origem:** `FC-FD-001/ALT2`

**Hipóteses em comparação:** partículas abrasivas ingressaram no compartimento versus partículas foram geradas por dano interno de elementos de contato.

**Investigação proposta:** (1) conferir produto/compartimento, ponto, horas e série temporal de análises de óleo; (2) examinar depósito magnético/filtro, quando previsto, sem atribuir peça por morfologia isolada; (3) testar contaminantes com método separado. Um desgaste interno pode **produzir partículas**, que então agravam desgaste em outros componentes. Esse mecanismo de realimentação não permite concluir automaticamente o evento inicial ou causa raiz.

**Risco metodológico:** mudança conhecida de formulação ou baseline, amostra não representativa e confusão entre origem e efeito. Não aplicar valores genéricos de limiar a comando final do CAT 777 sem OMM/SIS efetivo.

## Roteiro 3 — Perda de pré-carga de parafuso de sapata

**Cadeia:** `FC-TRACK-005` · **Lacuna de origem:** `FC-TRACK-005/ALT1`

**Hipóteses em comparação:** autoafrouxamento **por rotação** versus perda de pré-carga **por assentamento/relaxação sem rotação necessariamente presente**.

**Investigação proposta:** (1) comparar registros rastreáveis da junta e eventuais marcas de giro; (2) reconstruir procedimento, instalação e histórico de manutenção; (3) avaliar as interfaces e alterações geométricas com método OEM. A **ausência de marca prévia** não prova que um parafuso nunca girou. Torque de desaperto não deve ser adotado como medida retrospectiva de pré-carga inicial.

**Risco:** componentes sob grandes cargas; não reapertar/desmontar como experimento diagnóstico. Configuração CAT D9 continua sem confirmação de efetividade documental.

## Quatro níveis de informação — modelo editorial

| Nível | Pergunta | Exemplos |
| --- | --- | --- |
| **Fenômeno observável** | O que foi medido/encontrado? | Óleo em superfície; metais no fluido; fixador solto |
| **Mecanismo físico imediato candidato** | Qual processo material produz o estado? | Perda de contenção; desgaste/ingresso; giro/assentamento |
| **Fator contribuinte candidato** | Qual condição facilita o processo? | Roteamento em contato; contaminação; montagem/solicitações |
| **Causa raiz candidata** | Qual condição sistêmica precisa ser demonstrada por investigação organizacional/técnica? | Controle de instalação, estratégia de vedação ou lubrificação, gestão de padrões |

Estes quatro níveis **não são um esquema textual transcrito da IEC 60812 nem da ISO 14224**. São uma modelagem editorial para evitar que uma falha de componente seja automaticamente confundida com uma causa organizacional sem evidência. As três causas raízes candidatas **não foram confirmadas**.

## Validação e qualidade

- [Roteiros de diagnóstico](../data/quality/diagnostic-pathways.v1.json): três, com nove etapas e quatro níveis causais.
- [JSON Schema](../schemas/diagnostic-pathways.schema.json): contratos de estrutura, campo de evidência e estados não homologados.
- [Nove regressões sintéticas](../data/quality/pathway-regressions.v1.json): cada roteiro testado com contexto insuficiente, quase completo e checklist formalmente completo.
- [Validador](../scripts/validate-diagnostic-pathways.mjs): verifica encadeamento com a matriz v1.3.10, métodos, fontes, segurança, quatro requisitos de aceite por roteiro e ausência de resultados de campo.
- `npm run pathways:validate` integrado a CI e ao relatório agregado de qualidade.

**Interpretação do gate:** o status `apto_para_revisao_nao_confirmado` indica apenas que campos de prontidão estão presentes no cenário sintético. Não implica que exista uma medição confiável, resultado de campo, OEM aplicável ou aprovação humana.

**Cobertura inalterada:** 24 cadeias originais, 48 investigações base, 10 regras preventivas sem vínculo estrito SAP. A v1.3.11 não inventa peça, causa, local ou evento para aumentar coberturas.

## Roadmap recomendado — v1.3.12

1. Expandir o esquema de **fenômeno → mecanismo → fator contribuinte → hipótese de causa raiz** às outras 21 cadeias, exigindo distinção material explícita.
2. Criar checklist de **fonte OEM específica** para piloto D9: consultar OMM/SIS com prefixo real, mantendo documentação proprietária fora do GitHub público.
3. Definir exportação pública versionada das camadas com nível de confiança **editorial**, status de revisão, fonte e limites, sem transformar confiança em probabilidade fictícia.
4. Revisar tecnicamente com pessoas responsáveis as três matrizes prioritárias. Não promover seu status por aprovação automática do CI.
5. Investigar restrições de fluido, ventilação e termostato nos casos `FC-COOL-001/007`, mantendo competidores explícitos.

Nenhum repositório consumidor foi alterado.
