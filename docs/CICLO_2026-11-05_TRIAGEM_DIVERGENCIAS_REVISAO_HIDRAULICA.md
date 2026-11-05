# Ciclo proposto v1.3.96 — Triagem de divergências na revisão independente hidráulica

**05/11/2026 · Proposta documental para revisão · Base v1.3.95**

## Escopo e estado de evidência
O ciclo v1.3.95 entrega uma rubrica anônima de cinco dimensões e 20 exercícios sintéticos. **Não há avaliações humanas recebidas ou autenticadas.** Este documento especifica como tratar futuras discordâncias editoriais sem inferir diagnóstico, eficácia de teste, criticidade operacional ou aprovação de FMEA. O banco permanece independente dos consumidores, do SAP e dos procedimentos OEM.

## Unidade de análise
A menor unidade de triagem é o par `(caseId, dimensão editorial)`, preservando os registros individuais de revisão sem identificadores pessoais. Uma escolha de alternativa (`recommendedChoiceCode`) é registrada separadamente de uma avaliação de dimensão (`adequate`, `needs_revision`, `critical_issue`, `unreviewed`). A contagem de revisões não equivale à contagem de especialistas independentes: a ferramenta é anônima, não autentica identidade e pode receber respostas repetidas.

## Regras de triagem — sem voto automático

| Sinal observado no lote | Encaminhamento editorial | Proibição |
| --- | --- | --- |
| Nenhuma revisão ou só `unreviewed` | `AWAITING_REVIEW` | Não atribuir aprovação tácita |
| Pelo menos um `critical_issue` em segurança/barreiras | `SAFETY_HOLD`: suspender uso didático do caso até análise humana documentada | Não neutralizar por maioria `adequate` |
| `critical_issue` em qualquer outra dimensão | `CRITICAL_EDITORIAL_REVIEW`: examinar texto e distratores | Não converter em causa confirmada |
| Alternativas recomendadas diferentes entre revisões | `ANSWER_DISAGREEMENT`: confrontar justificativas e possível ambiguidade do caso | Não escolher gabarito por maioria |
| `needs_revision` em pelo menos uma dimensão | `REVISION_BACKLOG`: preparar proposta editorial revisável | Não alterar gabarito sem análise |
| Apenas avaliações `adequate`, sem divergência, em revisões não autenticadas | `NO_ISSUE_REPORTED` — não significa homologado | Não classificar como `APPROVED` |

A ordem de precedência é `SAFETY_HOLD` → `CRITICAL_EDITORIAL_REVIEW` → `ANSWER_DISAGREEMENT` → `REVISION_BACKLOG` → `NO_ISSUE_REPORTED`; falta de revisão é `AWAITING_REVIEW`. As categorias podem coexistir e devem ser preservadas no registro; a precedência apenas determina a fila inicial de trabalho.

## Método de adjudicação técnica
1. **Reproduzir a pergunta, sem mostrar o gabarito original** ao responsável pela revisão independente; verificar se existem múltiplas respostas defensáveis na leitura literal.
2. **Separar as camadas**: condição/sintoma reportado, falha funcional, mecanismos concorrentes, possíveis danos, hipóteses de causa, evidência discriminante e barreira de segurança.
3. **Checar aplicabilidade**: nenhum valor, componente, procedimento ou teste publicado genericamente pode migrar para modelo/série sem o respectivo documento OEM e configuração instalada.
4. **Classificar a decisão humana**: `KEEP_WITH_RATIONALE`, `REWRITE_PROMPT`, `REWRITE_DISTRACTOR`, `REVISE_EXPECTED_CHOICE` ou `WITHDRAW_CASE`. É possível registrar `DEFER_PENDING_EVIDENCE`.
5. **Registrar o motivo**, fontes públicas e quais outros casos, circuitos e rubricas foram afetados. Uma alteração de gabarito requer segunda revisão independente do autor da proposta.
6. **Testar regressão** do benchmark, esquema, HTML offline e auditorias adversariais antes de mesclar. Nunca alterar silenciosamente o benchmark de origem v1.3.94 ou um contrato público já publicado.

## Regra de suspensão didática
Qualquer indicação plausível de teste com linha pressurizada exposta, carga sem sustentação, bypass de proteção ou risco de movimento involuntário exige verificação prioritária, mesmo que todas as demais avaliações sejam favoráveis. Se uma questão exigir parâmetros ou procedimentos privados para haver apenas uma resposta defensável, retirar/reformular o caso público em vez de inventar o parâmetro.

## Registro de decisão recomendado
O registro de curadoria pode conter apenas: `caseId`, `reviewBatchId` não identificante, `issueCategories`, `triageStatus`, `adjudicationDecision`, `reasoningSummary` sem dados reais/restritos, `publicSourceRefs`, `affectedArtifacts`, `secondReviewStatus` e `releaseReference`. Não incorporar nomes, dados pessoais, número de série, tag de equipamento, medições, OS, SAP privado ou documento OEM licenciado. Este é um **contrato conceitual**; não foi implementado esquema nem coletado qualquer registro.

## Exemplos inteiramente sintéticos
- **Caso A:** duas revisões anônimas divergem entre `VERIFY_OEM_DISCRIMINANT` e `PREMATURE_CAUSE`. Encaminhar para `ANSWER_DISAGREEMENT`, pois a pergunta pode estar induzindo causalidade prematura; não mudar gabarito por contagem.
- **Caso B:** uma revisão marca `critical_issue` em segurança, outras quatro marcam `adequate`. Encaminhar para `SAFETY_HOLD`; o suposto consenso não substitui a barreira.
- **Caso C:** todas as dimensões foram marcadas `adequate` em dez respostas anônimas. Registrar apenas `NO_ISSUE_REPORTED`; não declarar dez profissionais independentes nem homologação.

## Critérios de aceite para uma futura implementação automatizada
- O algoritmo deve preservar todas as categorias e selecionar precedência determinística, sem oferecer saída `APPROVED`.
- Revisões repetidas ou identidades desconhecidas não podem ser interpretadas como independência estatística.
- A lógica de suspensão de segurança deve resistir a adição de avaliações positivas.
- Dados inesperados ou com aparência de dados privados devem falhar fechados na importação/exportação.
- Relatórios gerados precisam identificar `synthetic`, `editorial` e `not_equipment_evidence`.
- FMEAs, PM×SAP (10 bloqueios), gates privados (8 `NO_GO`) e consumidores não podem ser promovidos ou alterados.

## Próxima ação material
Antes de programar agregação, realizar **revisão de mesa** deste protocolo por Engenharia e Manutenção, usando apenas os três exemplos sintéticos. Após aceite documental, implementar contrato JSON estrito, analisador de lotes anônimos, HTML offline de curadoria, testes de mutação e CI. **Nenhuma aprovação ou coleta de feedback é alegada nesta proposta.**
