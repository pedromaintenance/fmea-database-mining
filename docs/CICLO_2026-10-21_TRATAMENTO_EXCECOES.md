# FMEA Database Mining — Ciclo v1.3.28: triagem de falhas e inconclusões

**Data editorial:** 21/10/2026. **Condição:** implementação offline sintética, sem implantação de staging.

## Problema endereçado

A v1.3.27 demonstrou integridade de recibos por quatro atestações sintéticas, mas resultados reprovados, inconclusivos ou bloqueados pelo verificador careciam de um caminho explícito de tratamento, prova complementar, reteste e revisão independente.

A v1.3.28 acrescenta [workflow de exceções](../data/governance/staging-result-exception-workflow.v1.json) sem alterar recibos assinados anteriores. São três categorias de evento, sete ações sequenciais, três encerramentos da **triagem**, identificação de execução original e reteste, exigência de segundo revisor e proibição de aceite automático.

## Entregas

- [Política JSON](../data/governance/staging-result-exception-workflow.v1.json) e [Schema estrito](../schemas/staging-exception-case.schema.json).
- [Biblioteca](../scripts/lib/staging-exception-workflow.mjs) com histórico sintético, verificador de transições e encadeamento SHA-256 **demonstrativo**.
- [64 regressões](../data/quality/staging-exception-regressions.v1.json): 24 históricos válidos (8 STG × falha, inconclusivo, erro de infraestrutura), mais 40 alterações rejeitadas.
- [Validador](../scripts/validate-staging-exceptions.mjs) adicionado ao QA/CI e aos indicadores de integridade de processo.
- [Runbook](TRATAMENTO_EXCECOES_STAGING.md), changelog, README e roadmap atualizados.

## Causalidade e aprovação

`closed_blocked` ou `closed_inconclusive` encerram **a simulação da triagem**, não a não conformidade real. Um reteste `pass` exige avaliação **manual** de Segurança e não demonstra conformidade institucional ou causa raiz mecânica.

Os tokens `TEST-*`, timestamps e âncora são simulados; nenhum laudo, certificado corporativo, assinatura humana, dado OEM, identificador de ativo ou evidência de campo foi introduzido. Nenhum consumidor foi alterado.

## Compatibilidade

Núcleo FMEA: **24 FC / 15 ME**, três CAND e quatro refinamentos mantidos. Contrato público e conteúdo público: **1.0.0**. Preview legado: **1.3.12**, checksum preservado.

**Dependência externa:** homologação de staging restrito, trilha real de auditoria, autenticação de revisores e gestão corporativa de desvios. Próxima evolução sugerida: catálogo de planos de remediação e reincidência, também mantido sintético até autorização.
