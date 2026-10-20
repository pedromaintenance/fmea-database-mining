# Arquitetura do conhecimento FMEA Mining — contrato de domínio

## 1. Fronteira permanente do projeto

Este repositório é **produtor de conhecimento técnico de manutenção e confiabilidade**. Pode servir jogos, consultas, sistemas de treinamento e futuras análises; **não desenvolve, instala ou altera qualquer consumidor**. Compatibilidade externa é responsabilidade de um contrato de dados versionado, independente de interfaces gráficas.

Os dados não são FMEA aprovada, histórico empírico ou procedimento de serviço. Toda transição de `inferido` para `validado` exige registro de revisão e evidência adequada. O nome FMEA do projeto não autoriza afirmar conformidade com IEC 60812.

## 2. Entidades e significado mecânico

| Entidade | Pergunta | Exemplo genérico | Não confundir com |
| --- | --- | --- | --- |
| `EquipmentModel` | Em que arquitetura? | Escavadeira hidráulica | Máquina individual ou prefixo de série confirmado |
| `FunctionalLocation` | Onde? | Motor / arrefecimento / ventilador | Componente, dano, causa |
| `Function` | O que deve fazer? | Dissipar calor suficiente em carga definida | Tarefa de preventiva |
| `FunctionalFailure` | Qual requisito deixa de atender? | Não manter temperatura requerida | Mecanismo que gerou a falha |
| `FailureMode` | Como a função local deixa de ser entregue? | Vazão insuficiente, perda de estanqueidade | Código de dano ou causa raíz necessariamente |
| `Component` | Qual item concreto? | Mangueira, sensor, rolamento | Local funcional |
| `Damage` | Que alteração ocorreu? | Trincado, desgastado, corroído | Falha funcional |
| `Mechanism` | Qual processo material leva ao dano? | Fadiga, abrasão, corrosão | Evidência de que ocorreu |
| `Cause` | Que condição desencadeou/contribuiu? | Lubrificação insuficiente, montagem inadequada | Efeito percebido pelo operador |
| `Local/SystemEffect` | Que impacto provoca? | Perda de pressão, restrição de movimento | Frequência empírica |
| `Symptom` | Que manifestação é relatada? | Ruído crescente sob carga | Causa comprovada |
| `TestMethod` | O que discrimina alternativas? | Medição de pressão, inspeção de filtro | Resultado do teste |
| `Evidence` | O que foi obtido? | Resultado e condição da medição | Exame planejado não executado |
| `PreventiveTask` | Qual mecanismo a PM procura prevenir/detectar? | Inspecionar condição de vedação | Registro de falha real |
| `TechnicalSource` | Quem sustenta a afirmação e para que configuração? | Norma geral, manual por série | Licença para copiar o documento |

Relação geral: **Localiza função → identifica falha funcional → descreve modo/mecanismo → examina dano/causa → associa sintomas → testa hipóteses**. A direção inversa (sintoma → causa) **não é determinística**.

## 3. Tipos de relações no grafo

- `located_in`: componente, sistema ou método aplicável ao local;
- `may_manifest_as`: falha pode produzir sintoma, sem garantir que ocorrerá;
- `may_be_detected_by`: técnica pode detectar manifestações;
- `consistent_with` / `inconsistent_with`: evidência interpretada sob condições documentadas;
- `may_cause` / `may_contribute_to`: mecanismo e condições causais possíveis;
- `prevention_targets`: tarefa busca evitar/detectar determinada condição.

As arestas devem ter **`sourceId`, `evidenceNature`, `reviewStatus`, `applicability`, `limitations`**. Não usar uma aresta de material genérico como prova de aplicabilidade a uma máquina e série.

## 4. Duas naturezas de dado distintas

**Fatos documentais/cadastrais:** nomenclatura e códigos de um cadastro; conteúdo conceitual de fonte primária; intervalos de PM apenas quando origem e vigência forem conhecidas.

**Inferências e simulações:** associação de dano/causa, hipótese concorrente, ensaio proposto, resultado de laboratório fictício, probabilidade de decisão, custo de jogo.

Os dois tipos nunca devem ser promovidos por uma simples junção entre tabelas. `test_planned` não é `test_observed`. `causal_explanation_plausible` não é `root_cause_confirmed`.

## 5. Fluxo de promoção

```text
importado / extraído
   └─ verifica proveniência e direitos
inferido
   └─ revisão mecânica de coerência e configuração
revisado_por_especialista
   └─ bibliografia OEM efetiva e condições de teste coerentes
aplicabilidade_oem_confirmada
   └─ revisão independente do caso didático e resultados discriminantes
validado_com_evidencias (didáticas ou empíricas, natureza discriminada)
```

**Nunca usar dados sintéticos para certificar uma ocorrência real.** Observações reais requerem autorização da fonte e processo de desidentificação/autorização antes da publicação.

## 6. Contrato para consumidores externos

A base poderá expor futuramente apenas **pacotes versionados e derivados**. O consumidor determina como mostrar, mas o produtor disponibiliza:

- `manifest`: versão semântica, hash, idioma, cobertura, revisão e classes;
- `catalog`: IDs estáveis e descrições em PT/EN;
- `graph`: relações `sourceId`, confiança e limites;
- `diagnostic`: relatos, hipóteses concorrentes, testes e resultados condicionais;
- `provenance`: origem conceitual, revisão técnica e restrições.

Pacotes públicos não incluem arquivos brutos ou identificadores corporativos. A existência de um exportador de prévia não impõe mudança em qualquer produto consumidor.

## 7. Política de pesquisa

Norma e literatura OEM são usadas como **fontes de conceitos e verificação**, não como materiais a copiar. Priorizar IEC 60812 (análise FMEA), ISO 14224 (modelo de informação de confiabilidade, adaptado à mineração), ISO 17359 (monitoramento), Caterpillar SIS/S·O·S e Sandvik por configuração. Registrar texto autoral próprio e apontadores para literatura. Valores de aceitação, códigos de falha, torques, peças e permissivos dependem do manual e efetividade aplicáveis.

## 8. Qualidade mensurável

Distinguir:
- **Cobertura cadastral:** locais com candidatos / locais com caminho completo.
- **Cobertura de curadoria:** relações tecnicamente revisadas / relações elegíveis.
- **Qualidade de evidência:** casos com métodos, contexto e três possibilidades de resultado / casos.
- **Rastreabilidade:** arestas com fonte, edição, nível de revisão e limite de aplicabilidade.
- **Conflitos/lacunas:** regras sem saída, local com subgrupo ambíguo, código de dano não aplicável.
- **Confiabilidade observada:** somente pode ser calculada com população/exposição, período e falhas reais autorizadas.

O relatório `reports/quality-audit.generated.json` é gerado em CI e **não contém taxas empíricas**.

## 9. Fontes de trabalho e controle de direitos

Os sete planos preventivos e os catálogos SAP de origem contêm materiais de trabalho e informações possivelmente confidenciais. Os registros íntegros permanecem fora do GitHub público; os padrões genéricos autorais e contagens agregadas já disponíveis são tratados separadamente. A liberação de novos derivados exige autorização de divulgação.

## 10. Separação semântica de condição, ação e dano (v1.3.6)

A nova [camada estruturada](../data/ontology/condition-action-damage.v1.json) explicita três entidades que não são intercambiáveis:

- `condition`: valor/estado de fluido, ambiente ou desempenho que uma inspeção procura observar; sem evidência, é apenas **condição-alvo**.
- `action`: inspeção, coleta, teste ou serviço proposto; executar a tarefa não demonstra automaticamente que um componente falhou.
- `damageHypothesis`: dano físico/funcional cuja confirmação depende de prova específica e da identificação do componente; nunca é criado por uma condição ou ação isolada.

As relações são tipadas como `rule_monitors_condition`, `rule_proposes_action` e `rule_lists_differential_damage`. A terceira significa **apenas alternativa que merece investigação** — não `confirms_damage` nem `causes_damage`. Este último vínculo não existe no esquema conceitual. Valores, testes executados e medições de campo permanecem vazios.

O [JSON Schema](../schemas/condition-action-damage.schema.json) documenta o contrato público; os [testes](../scripts/validate-condition-action-damage.mjs) verificam referências e as sete regressões sintéticas. Esses controles não substituem curadoria OEM/mecânica nem autorizam publicação de ocorrências corporativas.

**Exemplos restritivos:** água drenada do separador não prova dreno avariado; colmeia externamente limpa não prova que o radiador esteve obstruído internamente; aumento de temperatura não condena bomba ou termostato.


## 11. Efeitos locais e sistêmicos como entidades rastreáveis (v1.3.7)

A [camada de efeitos](../data/knowledge/causal-effects.v1.json) acrescenta **duas manifestações funcionais potenciais** para cada uma das 24 cadeias:

- `localEffect`: impacto possível em peça, vedação, engrenagem, rolete, conexão ou conjunto específico;
- `systemEffect`: consequência **condicional** na função maior — resfriar, transmitir torque, sustentar rodante, manter pressão ou conter fluido;
- `propagationCondition` e `diagnosticCaveat`: contexto causal e o que não pode ser concluído apenas pelo sintoma.

Não confundir **mecanismo** (processo material), **dano local**, **falha funcional**, **efeito sistêmico** e **observação de campo**. Por exemplo, sujidade na colmeia pode reduzir fluxo de ar (condição), eventualmente reduzir capacidade térmica (efeito), mas não demonstra radiador internamente obstruído nem temperatura efetivamente fora da especificação.

Todos os efeitos possuem `status=possible_unobserved`, `severityRank=null`, `probability=null`, `oemSerialEffectivity=null` e `actualEventCount=0`. Não calcular RPN com hipóteses qualitativas. O validador exige correspondência 1:1 com as 24 cadeias e fontes preexistentes.

[Contrato de efeitos](../schemas/causal-effects.schema.json) · [Teste de efeitos](../scripts/validate-causal-effects.mjs) · [Ciclo técnico](CICLO_2026-10-20_EFEITOS_MOTOR_HIDRAULICA_RODANTE.md)

## 12. Critérios de evidência e gates editoriais (v1.3.8)

A [camada de requisitos](../data/quality/evidence-requirements.v1.json) relaciona cada par `chainId/investigationId` a um método do vocabulário, critérios de documentação da coleta/ensaio, contexto operativo, baseline aplicável, qualidade do instrumento, três possíveis interpretações e limitações. Há **48 requisitos e nenhum resultado observado**.

O glossário de 67 campos **não significa 67 campos obrigatórios em todos os testes**: `EV-01` exige localização e observação; análise de óleo exige produto/compartimento/ponto/horas/método; medição de pressão exige ponto/carga/temperatura/instrumento. Os procedimentos e limites por série são **`null`** até confirmação OEM. Filtro removido, pressão baixa, rolete quente e código ativo nunca são provas isoladas de causa raiz.

O [registro de governança](../data/governance/technical-review-register.v1.json) especifica os gates de revisão de plausibilidade, verificação técnica independente, efetividade OEM e validação de evidência. Autor e revisores devem ser identificados; a elegibilidade do gate não executa a promoção de status. `reviewerPrimary`, `reviewerIndependent`, `oemSourceId`, `manualRevision`, `verifiedEvidenceIds` estão vazios enquanto não houver revisão real.

A [regressão de qualidade](../data/quality/evidence-gate-regressions.v1.json) é inteiramente sintética e não autoriza eventos reais ou dados privados em repositório público.

[Relatório da v1.3.8](CICLO_2026-10-20_EVIDENCIAS_GOVERNANCA.md) · [Validador](../scripts/validate-evidence-governance.mjs)

## 13. Capacidade discriminante dos testes (v1.3.9)

A [matriz de discriminabilidade](../data/quality/discriminative-tests.v1.json) liga os **seis requisitos P0** aos testes, registrando o sinal observável, fatores de confusão, hipóteses concorrentes e métodos complementares. É uma classificação **qualitativa editorial**, não um teste científico de sensibilidade ou especificidade.

Detectar abrasão de cobertura, partículas no óleo, aletas sujas, aquecimento de rolete ou pré-carga alterada **não prova por si só a causa raiz**. Mesmo o teste funcional de circulação de arrefecedor não isola rotor, termostato e restrição interna sem diagnóstico diferencial.

Nenhuma hipótese alternativa é eliminada automaticamente. Campos quantitativos de confiança permanecem nulos; nenhuma medição foi realizada e **nenhum resultado de equipamento foi registrado**.

[Relatório do ciclo](CICLO_2026-10-20_DISCRIMINACAO_TESTES.md) · [Validador](../scripts/validate-discriminative-tests.mjs)

## 14. Cruzamento de hipóteses alternativas e verificações complementares (v1.3.10)

O banco passou a manter [24 avaliações](../data/quality/complementary-discrimination.v1.json), uma para cada par **hipótese alternativa × teste complementar** da amostra P0. Cada avaliação registra possível apoio, possível enfraquecimento, **ambiguidade residual**, classificação qualitativa e a próxima investigação que ainda falta.

**Limites semânticos:** `nao_discrimina`, `indicio_parcial` e `potencialmente_discriminante_condicional` são avaliações **inferidas**, não sensibilidade, especificidade ou percentuais de acerto. A alternativa concorrente permanece aberta. Nada é promovido por votação de testes, coincidência textual ou semelhança entre códigos SAP.

A [revisão de circularidade](../data/quality/circular-sap-causality.v1.json) separa `damageId=01.15` (Afrouxado) de `causeId=C1.17` (Folga/afrouxamento), que por si só não estabelece mecanismo físico. `FC-TRACK-005` e `FC-TRACK-006` ilustram mecanismos que devem permanecer distintos.

O [piloto D9](../data/quality/oem-pilot-readiness.v1.json) é somente uma **lista de requisitos OEM ainda não cumpridos**: sem série, arranjo, procedimento, tabela de CTS e revisor, não existe aplicação tecnicamente homologada.

[Relatório v1.3.10](CICLO_2026-10-20_DISCRIMINACAO_COMPLEMENTAR.md).
