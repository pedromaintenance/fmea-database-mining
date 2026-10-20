# Ciclo FMEA v1.3.12 — Quatro níveis causais e preview público versionado

**Data editorial:** 20/10/2026  
**Escopo:** somente o repositório FMEA Database Mining. Nenhuma alteração nos jogos ou demais consumidores.  
**Natureza:** expansão de conhecimento autoral, sem resultados reais de campo, parâmetros OEM por série ou causas raízes homologadas.

## Objetivo

Concluir a separação de **fenômeno detectável**, **mecanismo físico imediato**, **fatores contribuintes** e **hipótese de causa raiz sistêmica** nas 24 cadeias causais. Na v1.3.11 existiam três roteiros detalhados; a v1.3.12 aplica estrutura equivalente às **outras 21 cadeias**, mantendo os três originais sem reescrita.

Em paralelo, foi entregue um **preview público versionado** que pode ser utilizado por futuros consumidores, mas **não** concede aplicabilidade operacional. Sua geração e validação são independentes de PORCARIA ou qualquer outro repositório.

## Fontes e fronteira de inferência

| Referência primária | O que fundamenta | Limitação |
| --- | --- | --- |
| [IEC 60812:2018](https://webstore.iec.ch/en/publication/26359) | Separar modos de falha, efeitos locais/globais e possíveis causas; análise sistemática de função | A divisão autoral em quatro níveis não é requisito literal da norma; texto integral não foi reproduzido |
| [ISO 14224:2016](https://www.iso.org/standard/64076.html) | Distinguir dados de equipamento, falha e manutenção; registrar taxonomia, causas e consequências | Norma setorial de petróleo/gás; aplicação em mineração é adaptação metodológica, não declaração de conformidade |
| [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12/) | Descrever estrutura, tipos e regras de validação de contratos JSON | Schema valida forma, não comprova plausibilidade mecânica nem fonte OEM |
| Fontes CAT, SKF e Nord-Lock já vinculadas a cada cadeia | Princípios de desgaste, lubrificação, mangueiras, rodantes, fixação e arrefecimento | Não fornecem efetividade automática por série, arranjo, código SAP ou inspeção executada |

Nenhuma fonte foi convertida em valor numérico de pressão, torque, temperatura, limite CTS ou concentração de contaminante.

## 1. Expansão dos quatro níveis causais

**Fonte editada:** [data/ontology/causal-levels.v1.json](../data/ontology/causal-levels.v1.json).

| Família | Cadeias | Situações tratadas |
| --- | ---: | --- |
| Mangueiras hidráulicas | 4 | Abrasão, raio/torção, terminal e exposição térmica |
| Comando final | 4 | Partículas, água, filme lubrificante e fadiga de contato |
| Arrefecimento | 8 | Radiador, mangueira, ventilação, termostato e bomba |
| Material rodante | 8 | Roletes, roda-guia, tensão, parafusos e interface sapata–elo |
| **Total** | **24** | 3 preservadas da v1.3.11 e **21 ampliadas** |

Cada registro possui:
- `observedPhenomenon`: **descrição daquilo que poderia ser observado**. O nome do campo é mantido por compatibilidade, mas `observation.hasObservedEvent=false`.
- `immediatePhysicalMechanismCandidate`: processo material ou funcional capaz de explicar o fenômeno, ainda não comprovado.
- `contributingConditionCandidates`: condições antecedentes possíveis, recuperadas da cadeia original e documentadas como candidatas.
- `rootCauseCandidates`: hipóteses sobre controle de projeto, montagem, lubrificação, inspeção ou operação, descritas **condicionalmente**, sem atribuir responsabilidades.
- `rootCauseNotEstablishedBecause`: o que precisa ser visto/medido antes de sequer cogitar homologação causal.

**Atenção de engenharia:** causa contribuinte e causa raiz sistêmica não são sinônimos. O fato de uma mangueira estar abrasada não comprova falha de projeto, de montagem ou de inspeção. A presença de água no óleo não comprova falha do procedimento de coleta nem deficiência de vedação. Para processos, históricos e decisões de manutenção, exige-se evidência própria e revisão independente.

### Três exemplos

**Mangueira hidráulica com torção ou raio inadequado (`FC-HOSE-002`)**: o fenômeno pode ser geometria aparente ou fissuração; mecanismo potencial é solicitação mecânica cíclica; contribuição depende de contato, montagem e movimento real; uma causa de processo só poderá ser atribuída após conferir desenhos, limites da mangueira e registros de instalação.

**Comando final com água (`FC-FD-002`)**: água pode reduzir condição de filme e favorecer corrosão, mas ingresso no equipamento, contaminação durante coleta, lavagem e condensação são explicações que precisam de discriminação. Não afirmar corrosão física sem inspeção nem atribuir causalidade organizacional pelo laudo isolado.

**Termostato com passagem insuficiente (`FC-COOL-005`)**: aumento de temperatura e suspeita de fluxo insuficiente não provam termostato travado. Verificar bomba, ventilação, arranjo de bypass, peça efetiva e ensaio OEM antes de condenar o elemento.

## 2. Preview público com allowlist explícita

**Arquivos-fonte:**
- [Política de exportação](../data/governance/public-export-policy.v1.json)
- [Gerador determinístico](../scripts/export-public-knowledge.mjs)
- [Validador e checksum](../scripts/validate-public-knowledge.mjs)
- [Contrato dos níveis](../schemas/causal-levels.schema.json)
- [Contrato do preview](../schemas/public-knowledge-preview.schema.json)

**Saídas produzidas em CI, e não versionadas em main:**
`reports/public-knowledge.v1.json` e `reports/public-manifest.v1.json`.

O preview integra por **ID estável** as 24 cadeias, seus níveis causais, efeitos locais e sistêmicos **potenciais**, hipóteses concorrentes, investigações ainda não realizadas e bibliografia referenciada. A lista positiva de campos e o manifesto SHA-256 evitam exportação inadvertida de colunas não aprovadas e permitem verificar integridade de bytes.

### Contrato de segurança da exportação

| Campo ou categoria | Comportamento |
| --- | --- |
| ID, função, modo, família e mecanismo | Exportação permitida |
| Hipóteses concorrentes e testes | Exportados somente com `not_performed` |
| Níveis causais e efeitos | Somente inferidos; `possible_unobserved` |
| Bibliografia pública | Somente fontes efetivamente referenciadas, com escopo/limitação |
| Identificação de máquina, serial/arranjo, local SAP validado | **Nulo ou omitido**; efetividade não confirmada |
| Nota/OS, plano bruto corporativo, medição real, resultado laboratorial e manual integral | **Não exportados** |
| Aprovação para procedimento de oficina | **false** (`approvedForOperationalUse=false`) |
| Frequência, severidade, RPN, probabilidade e causa confirmada | Não inventados; ocorrências empíricas = **0** |

**Não confundir checksum com certificação técnica.** Um manifesto íntegro demonstra que o arquivo não mudou em relação à geração registrada, mas não aprova a análise mecânica.

## 3. Verificações automatizadas

`npm run causal:levels:validate` exige:
- 24 IDs distintos, todos existentes na biblioteca causal;
- 21 registros novos e 3 idênticos aos roteiros anteriores;
- fontes e requisitos de evidência já registrados;
- causa raiz sempre não confirmada e condição de aplicabilidade por série vazia;
- ausência de observações de campo ou revisão humana fictícia.

`npm run public:export` gera o preview ordenado de maneira estável; `npm run public:validate` confronta o arquivo com a allowlist, fontes, IDs e hash SHA-256. Ambos são executados no GitHub Actions, que publica o preview e manifesto como **artefatos do workflow**, além das auditorias existentes.

## 4. O que não avançou por falta de evidência

- As 24 cadeias seguem **inferidas, não homologadas**;
- As 48 investigações continuam **propostas**, não executadas;
- As **10 lacunas de regras PM/SAP** permanecem abertas;
- Os 12 pontos diagnósticos da matriz anterior ainda não foram fechados por ensaio de campo;
- O piloto de material rodante CAT D9 permanece bloqueado até documentação OEM efetiva e revisão humana.

## 5. Próximo ciclo recomendado — v1.3.13

1. Realizar **auditoria mecânica crítica das 21 novas hipóteses sistêmicas**, separando gestão de risco de atribuição indevida de culpa.
2. Reforçar o contrato público com política semântica explícita de mudanças incompatíveis e exemplos de consumo que **não** dependam dos jogos.
3. Preparar checklist de efetividade D9 por prefixo/arranjo, OMM e CTS, a preencher somente com documentação autorizada.
4. Revisar candidatos para combustível, arrefecimento e hidráulica que seguem sem correspondência no catálogo SAP.
5. Continuar pesquisa discriminante de bomba/termostato/ventilação sem importar limites de outras configurações.

**Este ciclo agrega controle e portabilidade do conhecimento; não acrescenta ocorrências reais nem modifica consumidores.**
