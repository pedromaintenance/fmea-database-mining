# Ciclo curto de pesquisa e refinamento — 20/10/2026

**Release:** v1.3.1 · **Famílias:** mangueiras hidráulicas e comandos finais · **Estado:** conhecimento causal inicial, sem aprovação OEM por número de série.

## Critério de seleção

As duas famílias permitem cruzar os padrões preventivos já normalizados (`hydraulic-hose-*` e `final-drive-*`) com (1) referências primárias da Caterpillar sobre inspeção, mangueiras e bujões magnéticos e (2) pesquisas SKF sobre desgaste, contaminação e fadiga de rolamentos. A documentação consultada sustenta **mecanismos gerais**. Ela não comprova que eles ocorreram numa determinada máquina, nem valida um código de peça SAP.

## Evidências documentais pesquisadas

| Fonte | Afirmação sustentada pela fonte | O que **não** é permitido deduzir |
| --- | --- | --- |
| [Cat — manutenção de mangueiras](https://www.cat.com/en_US/blog/inspect-cat-hydraulic-hose-assemblies.html) | Inspeção de abrasão, torção, bolhas, trincas e vazamento; importância de prensagem, roteamento e raio de curvatura | Raio mínimo, pressão, terminal, periodicidade ou causa confirmada para CAT 395 ou 6030 |
| [Cat — prevenção de falhas de mangueiras](https://www.cat.com/en_US/blog/hydraulic-hoses-maintenance.html) | Atrito, montagem e sinais de degradação motivam inspeção preventiva e correção do conjunto | Um vazamento implica necessariamente falha interna de bomba |
| [Cat — bujões magnéticos](https://www.cat.com/en_US/blog/inspect-drive-train-magnetic-plugs.html) | Tamanho/aspecto do depósito magnético e acompanhamento histórico ajudam a avaliar desgaste em transmissões, diferenciais e comandos finais | Rolamento ou engrenagem específicos e limites de remoção universal para CAT 777 |
| [SKF — classificação ISO 15243](https://evolution.skf.com/us/bearing-damage-analysis-iso-15243-is-here-to-help-you/) | Distingue fadiga de contato, desgaste, corrosão e danos de montagem; água, contaminação e lubrificação afetam pistas de rolamento | Que todo metal magnético provém de rolamento, nem que um código de ruído identifique componente |
| [SKF — desgaste e fadiga superficial](https://evolution.skf.com/en/wear-and-surface-fatigue-in-rolling-bearings/) | Contaminantes, filme inadequado e alteração geométrica da pista podem favorecer fadiga de contato | Taxas de falha ou vida remanescente por modelo de comando final |
| [Cat — análise de fluidos](https://www.cat.com/pt_BR/support/maintenance/sos-services/analysis-101.html) | A interpretação de óleo deve reunir metais, contaminantes, partículas e condição do lubrificante | Condenação de componente por um único elemento químico |

## Oito cadeias adicionadas

| ID | Modo de perda funcional proposto | Hipóteses concorrentes | Métodos de evidência |
| --- | --- | --- | --- |
| FC-HOSE-001 | Abrasão externa e possível perda de contenção | Falha de conexão; fuga vinda de ponto superior | Visual, fixações/roteamento |
| FC-HOSE-002 | Torção/curvatura e solicitação indevida | Abrasão externa; ataque térmico/químico | Visual, geometria/roteamento |
| FC-HOSE-003 | Fuga na união mangueira-terminal | Ruptura do tubo; fuga na porta/adaptador | Visual, conferência de montagem |
| FC-HOSE-004 | Degradação térmica de cobertura/composto | Incompatibilidade química; abrasão | Visual, avaliação térmica |
| FC-FD-001 | Contaminantes sólidos e desgaste de engrenagens/rolamentos | Depósito de regime estável; falha interna gerando partículas | Bujão magnético, análise de óleo |
| FC-FD-002 | Água no óleo e evolução para corrosão/desgaste | Coleta contaminada; fluido identificado incorretamente | Teste de contaminação, inspeção de vedação |
| FC-FD-003 | Filme lubrificante inadequado com desgaste progressivo | Mudança de baseline autorizada; defeito mecânico prévio | Histórico, óleo/viscosidade/tendência |
| FC-FD-004 | Fadiga de contato em rolamento de redução | Dano em engrenagem; ruído externo ao conjunto | Partículas magnéticas, vibração/ruído |

## Modelagem e controles

Arquivo: [data/knowledge/causal-chains.v1.json](../data/knowledge/causal-chains.v1.json).

Cada cadeia oferece `operatingFunction`, `functionalFailureId`, `failureMode`, `mechanismIds`, `initiatingConditionCandidates`, `possibleDamage`, `symptomIds`, `evidenceMethodIds`, `sourceClaims`, `competingHypotheses`, `investigations` e `preventionRuleIds`. Todas as investigações têm os três campos `supports`, `weakens`, `inconclusive`.

**Zero** associações diretas a modelo, lado, caminho SAP, código de peça, dano ou causa; **zero** medições reais; **zero** ocorrências empíricas. A literatura sustenta o princípio físico; a cadeia causal completa permanece **inferida**, para revisão. O campo `confirmedRootCause=false` é obrigatório.

Validação: `node scripts/validate-causal-chains.mjs`. O pipeline rejeita IDs órfãos, códigos de ontologia não definidos, testes sem contraprovas, ausência de fontes e promoção de hipótese a ocorrência real.

## Refinamentos metodológicos

1. **Bujão magnético não identifica peça:** ele indica condição do conjunto; morfologia, histórico e localização de ruído ainda precisam discriminar engrenagem versus rolamento e origem externa.
2. **Sintoma não equivale a dano:** capa de mangueira com abrasão pode ser detectada *antes* de haver perda de contenção; a consequência de ruptura exige outra evidência.
3. **Ruído não diagnostica rolamento:** falhas de engrenagem, freio, pneu e estrutura também podem produzir som semelhante.
4. **Água no óleo não identifica o caminho de ingresso:** lavagem, vedação, respiro, condensação e erro de amostragem devem ser distinguidos.
5. **Aplicabilidade é pendente:** valores de pressão, montagem de mangueira, classificação de desgaste e política de intervenção devem ser confirmados nas publicações específicas de máquina, série e compartimento.

## Pendências para o próximo ciclo

- Analisar relatórios de qualidade e verificar se regras de mangueira ainda cruzam sistemas não hidráulicos.
- Revisar tecnicamente as quatro cadeias por sistema com especialista de campo.
- Levantar manual OEM efetivo por série/prefixo antes de preencher `sapMapping`.
- Comparar a evidência esperada para engrenagens e rolamentos; não inventar limites de partículas, ppm ou temperatura.
- Expandir a seguir **arrefecimento e material rodante** com a mesma estrutura, priorizando referências oficiais.

### Observação editorial

Este ciclo aumentou **conhecimento estruturado**, não o número de falhas empiricamente comprovadas. O caráter público do repositório exige não introduzir procedimentos corporativos e manuais OEM integrais.
