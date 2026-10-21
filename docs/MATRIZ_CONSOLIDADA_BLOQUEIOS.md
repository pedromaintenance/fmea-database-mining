# Matriz consolidada de bloqueios — execução e critérios de liberação

**Versão editorial:** 1.3.30 · **Data:** 21/10/2026 · **Escopo:** FMEA Database Mining independente de consumidores. **Status:** preparo documental, sem ações corporativas executadas, sem homologação OEM por série.

## 1. Visão executiva com procedência

| Frente | Quantidade *na fonte* | Situação documentada | Disciplina responsável proposta | Próxima ação controlada |
|---|---:|---|---|---|
| Documentação OEM D9 | 7 insumos | 2 não fornecidos, 4 não verificados, 1 revisão não executada | Engenharia de ativos | Obter série/arranjo e referências SIS/OMM, PN/torque, CTS, dados mestres e revisão de campo em ambiente autorizado |
| Regras PM × SAP | 10 regras | Todas bloqueadas; remapeamento automático proibido | Engenharia/SAP PM | Analisar caso a caso condição, dano, componente, subgrupo e par dano/causa permitido |
| Cadeias FMEA | 24 cadeias FC | Revisão técnica pendente; literatura geral não constitui homologação por série | Engenharia de manutenção | Priorizar fonte OEM efetiva, ensaio/contraprova e revisão independente |
| Causas sistêmicas | 48 alegações sobre 24 FC | Sem desvios de processo comprovados | Confiabilidade/Engenharia | Solicitar registros de processo e examinar explicações alternativas sem atribuir culpa |
| Candidatas físicas | 3 cadeias CAND | Não incorporadas ao núcleo | Confiabilidade/Engenharia | Verificar vedação de bomba, perdas volumétricas e dano superficial de engrenagem, com discriminadores |
| Refinamentos ME | 4 conceitos/submodos | Conceitos editoriais; nenhum novo ME aprovado | Engenharia mecânica | Separar fuga normal/excessiva e abrasão/adesão/fadiga de flanco com evidência física |
| Infraestrutura privada | 7 componentes | Nenhum provisionado ou avaliado efetivamente | TI/Segurança/Plataforma | Deliberar implantação IdP, RBAC, cofre, metadados, auditoria, retenção e mudança |
| Staging corporativo | 6 aceites institucionais | Todos pendentes; nenhuma execução real de staging | TI, Segurança, Engenharia, Privacidade | Homologar ambiente isolado com dados sintéticos e registrar seis decisões independentes |

**Nota matemática:** 7 + 10 + 24 + 48 + 3 + 4 + 7 + 6 = 109 ocorrências *nas unidades originais*, **não 109 tarefas independentes**. Exemplo: as 48 alegações sistêmicas estão vinculadas às 24 cadeias, e as quatro propostas de mecanismo derivam de candidatas já contadas. Não consolidar em KPI de backlog de OS, MTTR ou % de máquinas cobertas.

## 2. Cinco caminhos de desbloqueio

**A — Efetividade OEM e diagnóstico físico.** A [entrada D9](../data/quality/oem-d9-evidence-intake.v1.json) exige prefixo/série, OMM, peças, fixações, CTS, estrutura SAP e exame de campo — cada qual com evidência e checagem independente. A [fila de 24 revisões](../data/governance/technical-review-register.v1.json) precisa de fonte efetiva e contraprova. D9 não é dependência universal de toda cadeia; é um piloto de demonstração específico.

**B — Três candidatas e quatro mecanismos propostos.** A [lista CAND](../data/quality/proposed-causal-chains.v1.json) e os [refinamentos](../data/quality/mechanism-refinements.v1.json) não provam falhas na bomba de uma CAT 395 ou no comando final de uma CAT 777 específica. Diferenciar vazão útil, vazamento normal de projeto, vedação e regulação; em dentes, não confundir cavidade em rolamento com fadiga de flanco ou qualquer Fe em óleo com desgaste por partículas de origem localizada. A revisão só pode ocorrer após documentação de arranjo e inspeção real autorizada.

**C — PM × SAP.** As [dez regras bloqueadas](../data/quality/pm-exception-evidence-gates.v1.json) precisam de evidência e revisão do componente efetivo e da relação dano/causa. Não criar código de falha, peça, PN, localização nem mapeamento SAP somente porque a nomenclatura parece equivalente.

**D — Causalidade sistêmica.** As [48 alegações](../data/governance/systemic-root-audit.v1.json) são candidatas de processo, não demonstração de erro humano, supervisão ou falha organizacional. Exigem registros independentes do mecanismo físico e hipóteses alternativas que possam enfraquecer o nexo causal.

**E — Custódia e homologação de staging.** A [arquitetura de sete componentes](../data/governance/restricted-infrastructure-design.v1.json) não está ativa. Os [seis aceites](../data/governance/staging-acceptance-plan.v1.json) não são meros checkboxes: cada um requer ensaio e assinatura real da autoridade competente em sistema restrito.

## 3. Prioridades — hipótese editorial, não atribuição gerencial

Recomenda-se **P0 para obter a primeira evidência OEM útil**, resolver um bloqueio PM × SAP verificável e definir responsável institucional pelo ambiente de custódia. As revisões sistêmicas e refinamentos conceituais são relevantes, mas sua conclusão depende da qualidade da prova e não deve ser antecipada.

É possível continuar desenvolvendo conhecimento editorial baseado em fontes públicas sem cofre corporativo. Porém a **ingestão de evidências reais, laudos, manuais licenciados e identificadores de equipamentos** exige custódia institucional própria. Não transformar essas frentes paralelas em um bloqueio artificial único.

A [matriz JSON](../data/governance/consolidated-blockers.v1.json) registra `priorityProposal`, `ownerDiscipline`, `dependsOn`, `nextControlledAction` e `releaseEvidence` de cada frente. Nenhuma pessoa ou prazo concreto foi fornecido, portanto **não há responsável nomeado nem SLA**. Propostas P0/P1 precisam de validação da liderança.

## 4. Critérios antes de qualquer marcação de conclusão

1. Identificar documento OEM efetivo, série/arranjo, metodologia e limite aplicáveis sem publicar material protegido.
2. Obter observação física ou processo rastreável com condições, instrumentação, contexto e explicação alternativa documentadas.
3. Exigir revisão independente por autoridade humana identificada em sistema restrito.
4. Separar decisão de liberação operacional, autorização de publicação e inclusão na ontologia FMEA/SAP.
5. Só então atualizar o **arquivo de origem** e registrar decisão formal; a matriz consolidada deve refletir a fonte, **nunca contornar sua revisão**.

O comando `npm run blockers:validate` valida toda procedência e impede promoção arbitrária. A [suíte de 40 regressões](../data/quality/consolidated-blocker-regressions.v1.json) tenta fabricar evidência, responsáveis, prazos, approvals, novas tarefas independentes e dependencies inconsistentes.

## 5. Decisão externa de maior retorno

A próxima ação concreta é indicar **qual processo corporativo receberá documentação OEM aplicável e qual autoridade aprovará a revisão técnica**. Em paralelo, TI deve decidir se disponibilizará um cofre/staging institucional ou outra solução já homologada, com direitos e acesso controlados. Isso reduzirá as lacunas de campo; mais ciclos de mock isolados não as eliminam.

**Conclusão documentada:** oito frentes permanecem pendentes, 24 FC/15 ME inalterados, nenhuma causa material confirmada e nenhum consumidor modificado.
