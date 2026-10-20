# Ciclo FMEA v1.3.9 — Capacidade discriminante dos seis testes prioritários

**Data:** 20/10/2026 · **Escopo:** exclusivamente FMEA Database Mining · **Status:** matriz qualitativa revisável, nenhuma evidência de campo ou homologação OEM por série.

## Objetivo

Na v1.3.8 foram estabelecidos **48 requisitos de evidência** e **24 cadeias aguardando curadoria**, com seis investigações priorizadas como P0. Este ciclo avalia **o que cada método de fato consegue e não consegue distinguir**, incluindo explicações alternativas e fatores de confusão. Foco no método, **não na prevalência ou probabilidade dos mecanismos**.

A camada [discriminative-tests.v1.json](../data/quality/discriminative-tests.v1.json) contém **seis avaliações metodológicas**, ligadas 1:1 a `evidenceRequirementId` e `chainId/investigationId` preexistentes. Preserva as duas hipóteses alternativas originais de cada cadeia, com avaliação individual de por que cada uma **permanece plausível** após o teste proposto.

### Fontes e limites de pesquisa

- [ISO 13379-1:2025](https://www.iso.org/standard/88027.html): resumo oficial sobre conceitos e seleção de abordagens diagnósticas. **Texto integral não foi consultado** e as quatro classes qualitativas abaixo são **propostas editoriais deste projeto**, não classes normativas.
- [Caterpillar — Inspeção de mangueiras hidráulicas](https://www.cat.com/en_US/blog/inspect-cat-hydraulic-hose-assemblies.html): abrasão, torção, fissuras, roteamento e inspeção de áreas ocultas. Exige OMM específico antes de procedimento real.
- [Caterpillar — Bujões magnéticos do trem de força](https://www.cat.com/en_US/blog/inspect-drive-train-magnetic-plugs.html): fotos/histórico e morfologia ajudam a avaliar desgaste, **não identificam automaticamente engrenagem ou rolamento**. Classificações gerais publicadas não são critérios específicos de comando final CAT 777 sem confirmação OEM.
- [Caterpillar — Cuidados com radiador](https://www.cat.com/pt_BR/support/maintenance/self-service-options/radiator.html): limpeza de aletas para prevenir obstrução externa, distintos de contaminação/corrosão do circuito interno.
- [Caterpillar — Material rodante de tratores](https://www.cat.com/en_US/articles/for-owners/dozer-undercarriage-maintenance.html) e [guia de rodantes de mineração](https://www.cat.com/en_US/blog/mining/articles/dozer-undercarriage-maintenance-and-management.html): detritos podem impedir rotação, inspeção de vedação/fixadores e necessidade de CTS. OMM determina método e limites por configuração.
- [Nord-Lock — Why do bolts loosen?](https://www.nord-lock.com/learnings/knowledge/2018/why-do-bolts-loosen/?cachebreak=true): diferencia afrouxamento rotacional de assentamento/relaxação sem rotação. **Não fornece procedimento de aperto de sapatas Cat**.
- [Caterpillar — Bomba de água](https://www.cat.com/pt_BR/support/maintenance/self-service-options/water-pump.html): função do conjunto e necessidade de procedimentos de reparo específicos do modelo. Não fornece curva de circulação de CAT 395/6030/D9.

## Quatro classes de capacidade — proposta editorial

| Classe | Significado | O que não pode alegar |
| --- | --- | --- |
| `detecta_condicao_sem_isolar_causa` | Observação específica pode confirmar aspecto visível da condição | Componente causal, ruptura ou efeito sistêmico |
| `detecta_tendencia_sem_atribuir_origem` | Monitoramento identifica tendência comparável | Peça que gerou o contaminante ou origem externa |
| `detecta_indicio_nao_discriminante` | Sinal indireto é compartilhado por mecanismos diferentes | Diagnóstico causal unívoco |
| `discrimina_desempenho_funcional_condicionado` | Ensaio de função **pode** avaliar atendimento de requisito sob OMM e variáveis controladas | Defeito interno exato ou falha confirmada sem teste executado |

**Nenhuma classe inclui sensibilidade, especificidade, razão de verossimilhança ou grau de confiança numérico**. Esses campos são `null` até estudo empírico apropriado; classificação descritiva não substitui evidência.

## Auditoria dos seis testes P0

| Código | Teste atual | O que o teste detecta | O que permanece indeterminado | Próximo discriminador |
| --- | --- | --- | --- | --- |
| `FC-HOSE-001/I1` | Inspeção visual de mangueira | Abrasão e contato acessível | Origem de óleo e integridade interna da mangueira | Inspeção de roteiro/folgas e histórico de montagem |
| `FC-FD-001/I2` | Análise/tendência de óleo | Alteração compatível de contaminante/desgaste | Abrasivo externo vs partícula endógena; rolamento vs engrenagem | Bujão magnético, morfologia, verificação de água/ingresso |
| `FC-COOL-001/I1` | Inspeção externa de colmeia | Detrito entre aletas e módulos acessíveis | Obstrução interna, ventilador insuficiente, falha de circulação | Tendência térmica comparável e teste funcional OEM |
| `FC-TRACK-001/I2` | Termometria de rolete | Diferença térmica comparável sob condição registrada | Detritos travando rolete, vedação/rolamento, tensão de esteira | Inspeção visual de detritos/fugas e medições por posição/CTS |
| `FC-TRACK-005/I2` | Montagem/condição de junta | Fixador solto, interface deslocada e falha aparente de montagem | Rotação do parafuso vs assentamento; fratura por sobrecarga | Exame da junta e cronologia de instalação |
| `FC-COOL-007/I2` | Ensaio de circulação, somente OEM | Desempenho de circulação do circuito em condição controlada | Bomba interna vs termostato/obstrução; deficiência de ar | Testar circuito/regulação, correlacionar carga/temperatura |

Para cada teste, o JSON registra **quatro fatores de confusão**, as **duas hipóteses concorrentes originais**, **duas verificações complementares** com métodos do vocabulário e três orientações de interpretação. Todos os testes adicionais permanecem `proposto_nao_executado`.

## Refinamentos de engenharia

### 1. Abrasão não equivale a vazamento

Capa marcada por atrito é evidência de uma condição mecânica na superfície observada. Nem a fuga nem sua origem estão demonstradas sem localizar o fluido. **Nunca aproximar mão/corpo de vazamento hidráulico pressurizado para confirmar fuga**.

### 2. Análise de óleo não separa ingresso de degradação interna

Tendência de partículas/metais pode sustentar preocupação com o comando final, mas partículas podem ter entrado no sistema ou ter sido produzidas por dano interno pré-existente. Bujões, filtros, morfologia e histórico são controles complementares, sem identificação universal da peça avariada.

### 3. Radiador externamente sujo não é radiador internamente obstruído

Aletas com detritos podem reduzir passagem de ar; funcionamento do ventilador, carga térmica, nível e circulação são alternativas independentes. Limpeza sem condições comparáveis de antes/depois **não prova resolução causal**.

### 4. Rolete quente não prova travamento por detritos

Diferença térmica depende de posição, emissividade, carga, tempo após deslocamento e ambiente. Vedação/rolamento e tensão inadequada permanecem concorrentes. CTS mede geometria e desgaste, não causa raiz.

### 5. Parafuso frouxo não explica por que perdeu pré-carga

Autoafrouxamento rotacional e assentamento sem rotação são mecanismos distintos. Torque de desaperto isolado não informa a força inicial da junta. Não propor torque-turn sem valor/arranjo efetivo de fabricante.

### 6. Circulação insuficiente não identifica rotor avariado

Mesmo um teste funcional correto de circulação identifica **desempenho** sob condições especificadas. Termostato, restrições e demanda térmica podem compartilhar sintomas. Atribuir defeito interno ao rotor exige exame técnico próprio.

## Validação automatizada e governança

- **[Matriz](../data/quality/discriminative-tests.v1.json):** 6 testes, 12 alternativas que permanecem em aberto e 12 verificações complementares planejadas.
- **[Contrato](../schemas/discriminative-tests.schema.json):** estrutura versionada, estados `null`, sem estatísticas inventadas.
- **[12 regressões sintéticas](../data/quality/discrimination-regressions.v1.json):** testa interpretação de sinais quando há ou não baseline/contexto; exemplos sintéticos de elegibilidade não representam medições reais.
- **[Validador](../scripts/validate-discriminative-tests.mjs):** confronta IDs e interpretações originais, proíbe rejeição automática das hipóteses concorrentes, exige fontes e controles de confusão, impede conclusões/likelihood numéricos.
- `npm run discrimination:validate` integra a auditoria de discriminabilidade ao GitHub Actions.

**Status das seis avaliações:** `analise_metodologica_nao_homologada`; nenhum `resultObserved`, nenhuma série OEM validada, nenhum código SAP promovido ou parecer de revisão humana inventado.

## Próximo ciclo sugerido — v1.3.10

1. **Aprimorar os testes complementares dos P0**: atribuir explicitamente qual alternativa cada complemento ajuda a diferenciar, e quais permanecem indistintas.
2. **Saneamento causal SAP:** revisar `Afrouxado` versus `Folga ou afrouxamento`, mantendo fenômeno, mecanismo e causa em níveis separados.
3. **Piloto OEM por série** para uma família (prioridade D9 material rodante ou conjunto CAT 777), apenas com documentação aplicável e disponível legalmente.
4. **Revisão mecânica humana** dos seis P0, sem promoção de status enquanto não houver parecer rastreável.
5. Criar exportação por `release` de conhecimento público com natureza/limites para consumidores externos — sem modificar consumidores neste repositório.

**As 10 lacunas SAP de manutenção preventiva permanecem pendentes; continuam 24 cadeias e 48 investigações totais.**
