# Tratamento de resultados de integração reprovados ou inconclusivos

**Versão:** 1.3.28 — 21/10/2026. **Tipo:** procedimento de referência e testes sintéticos de governança; não é ferramenta conectada de manutenção, SIEM ou gestão de incidentes.

## 1. Definição da ocorrência

Não se deve tratar todo resultado não aprovado como falha mecânica ou mesmo como falha de um controle de segurança. A [política](../data/governance/staging-result-exception-workflow.v1.json) distingue:

| Classificação | Sintoma no ensaio | Interpretação permitida | Ação inicial |
|---|---|---|---|
| `control_failure` | Controle retornou `fail` | Pode haver não conformidade do controle testado | Manter o requisito bloqueado; investigar, identificar correção e solicitar contraprova |
| `inconclusive_evidence` | Ensaio retornou `inconclusive` | Não se consegue discriminar atendimento do requisito | Solicitar metadados, qualidade de prova e possível novo teste |
| `verifier_infrastructure_error` | Serviço, transporte ou verificador retornou `blocked` | A condição do controle não foi confiavelmente medida | Restabelecer/verificar infraestrutura de ensaio antes de avaliar o controle |

A classe refere-se exclusivamente aos **controles do staging de TI** e **não** determina modo de falha de equipamento pesado, causa raiz de óleo, bomba ou engrenamento.

## 2. Etapas obrigatórias

O fluxo contém **sete eventos** e nove estados, incluindo os três terminais.

1. **Abertura da triagem:** guardar classificação e identificador original do teste, sem eliminar resultado reprovado/inconclusivo.
2. **Solicitação de esclarecimento:** revisor técnico descreve, em ambiente privado futuro, qual evidência falta, hipótese alternativa e condição de teste questionada.
3. **Recebimento da informação:** solicitante anexa documento/declaração somente ao cofre corporativo, mantendo o evento original.
4. **Determinação de reexecução:** revisor técnico indica método, condições de teste, limites e critérios que devem ser verificados.
5. **Recebimento do reteste:** custodiante registra **novo identificador de execução**, não substituindo o original; resultado `pass`, `fail` ou `inconclusive`.
6. **Pedido de revisão independente:** técnico encaminha histórico completo, incluindo contraprovas e explicações concorrentes.
7. **Decisão independente motivada:** outro revisor registra sua avaliação da triagem e o estado associado ao resultado, sem aprovar infraestrutura.

Esta ordem é rígida. O código rejeita salto de esclarecimento, reteste com ID do run original, revisão por pessoa com função conflitante, mudança de caso/tenant e edição da prova original.

## 3. Estados terminais e consequências

| Resultado do novo teste | Estado do **processo de triagem** | Consequência operacional |
|---|---|---|
| `fail` | `closed_blocked` | Histórico de triagem encerrado como **bloqueado**. A não conformidade subjacente continua controlada e requer remediação real |
| `inconclusive` | `closed_inconclusive` | Histórico encerrado sem discriminação suficiente; risco, pendência e restrição continuam existentes |
| `pass` | `retest_passed_needs_manual_security_review` | Um controle fictício foi reensaiado como satisfatório, mas **nenhum aceite de Segurança** foi concedido |

Em caso de falha recorrente ou suspeita de mecanismo de falha, registrar nova ação corretiva no sistema corporativo de TI apropriado, mantendo rastreio entre ocorrências. Não fechar automaticamente incidente, risco residual ou solicitação de mudança da FMEA só porque o reteste passou.

## 4. Trilha de decisão e confiabilidade

A [biblioteca](../scripts/lib/staging-exception-workflow.mjs) monta eventos fictícios `TEST-*` ligados a um caso, tenant, run original e rerun único. Valida sete ações com papel previsto, token de evidência por evento, timestamps UTC crescentes e cadeia SHA-256 confrontada com uma **âncora simulada e fornecida externamente**.

**Limite crítico:** SHA-256 local, sem WORM, assinatura real ou âncora sob administração independente, não oferece custódia efetiva nem impede exclusão/regravação corporativa. O validador não persiste eventos nem executa consulta a rede, IdP, SIEM ou cofre. O sistema real exigirá log assinado, revogação, autorizador backend, controle transacional de replay e governança de retenção.

O código intencionalmente não registra nomes, dados reais de ativo, foto, documento OEM, URL interna, metadados pessoais, número de série ou medições. Os marcadores `TEST-*` não representam evidência efetiva.

## 5. Checagens de qualidade e encaminhamento

O [validador v1.3.28](../scripts/validate-staging-exceptions.mjs) e [64 fixtures](../data/quality/staging-exception-regressions.v1.json) cobrem 24 históricos completos (8 cenários STG × 3 classes) e 40 alterações indevidas. Entre elas: prova original apagada, reteste sem novo run, omissão de esclarecimento ou parecer independente, autorrevisão, relógio invertido, evidência ausente, violação de tenant, adulteração e fechamento/publicação indevidos.

Para uso corporativo, TI/Segurança deverá ainda estabelecer: retenção e consequência de `closed_blocked`, regra de risco residual, prazo de correção, criticidade de desvios, natureza do plano de ação, sistema de tickets, pareceres autenticados, monitoramento de reincidência e trilha de aprovação externa. Nenhum desses elementos está ativo nesta versão.

## 6. Resultado que o sistema **não** entrega

O mock **não** homologa controles de segurança reais, não libera máquina, não confirma dano físico, não cria nota SAP, não aprova novo `FC-*` ou `ME-*`, não exporta documentos e não atesta que a correção descrita foi executada.

A futura implantação deve preservar esta separação: *teste realizado ≠ requisito aprovado ≠ revisão independente ≠ diagnóstico mecânico confirmado*.
