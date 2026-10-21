# FMEA Database Mining — Ciclo v1.3.25: pacote de aceite de staging

**Data editorial:** 21/10/2026. **Natureza:** projeto e testes de coerência do pacote de homologação, não staging executado.

## Entregas

A [v1.3.24](CICLO_2026-10-21_ARQUITETURA_CORPORATIVA_RESTRITA.md) propôs componentes de IdP, RBAC, cofre, auditoria e retenção. A v1.3.25 transforma essa arquitetura em uma **matriz de verificação de aceitação**:

- [Plano governado](../data/governance/staging-acceptance-plan.v1.json): 8 domínios, 32 controles, responsáveis institucionais e evidências esperadas, com 6 gates corporativos explicitamente pendentes.
- [Suíte sintética](../data/quality/staging-acceptance-regressions.v1.json): 8 cenários positivos de elegibilidade **apenas documental**, 32 casos com controle faltante que devem ser recusados e 12 mutações de política/resultado/aprovação rejeitadas — **52 testes ao todo**.
- [Biblioteca de regras](../scripts/lib/staging-acceptance-gates.mjs), [validador](../scripts/validate-staging-acceptance.mjs), [JSON Schema](../schemas/staging-acceptance-plan.schema.json), nova tarefa `npm run staging:acceptance:validate` no QA/CI, métricas e [runbook](RUNBOOK_HOMOLOGACAO_STAGING.md).

## Condição de homologação

Um cenário sintético com as quatro condições marcadas verdadeiras retorna `eligible_for_manual_staging_review`, nunca `real_staging_accepted`. A função de prontidão real retorna **não pronto** para o plano publicado. Campos de execução permanecem `not_executed`, pareceres e referências são nulos, assinaturas estão `pending`.

O validador barra modificações que afirmem artificialmente infraestrutura ativa, parecer assinado, execução de teste, aprovação OEM, causa raiz ou liberação pública. Nenhum número de série, laudo, OMM/SIS, dado corporativo, link privado ou credencial foi incorporado.

## Dependências reais

IdP e MFA, backend autorizador, cofre privado criptografado, log de integridade com controle externo, backup restaurável, retenção e legal hold aprovados, teste de isolamento por tenant/caso, revisão independente de Segurança, Engenharia e Privacidade. Nenhuma dessas pendências pode ser marcada concluída pelo CI deste repositório público.

## Compatibilidade

Permanecem as 24 cadeias `FC-*`, 15 mecanismos `ME-*`, três candidatas CAND e quatro refinamentos editoriais. Sem atualização de consumidores. Contrato e conteúdo público **1.0.0**, preview histórico **1.3.12** e checksum invariantes.

**Próximo ciclo sugerido:** definir adaptador de testes de integração para execução exclusivamente sob staging **já provisionado e autorizado**, com dados artificiais, sem endpoints pré-configurados no GitHub. A próxima etapa não é autorização para armazenar dados reais.
