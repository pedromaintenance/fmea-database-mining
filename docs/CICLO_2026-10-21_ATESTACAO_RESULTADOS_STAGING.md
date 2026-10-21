# FMEA Database Mining — v1.3.27 | Custódia e atestação de resultados privados

**Data editorial:** 21/10/2026. **Escopo:** especificação e testes criptográficos offline para futuro staging corporativo.

## Entregas

O contrato da v1.3.26 documentava um adaptador offline mas não a autenticidade ou a custódia dos resultados, nem autoria das revisões. Agora há:

- [Contrato privado](../data/governance/private-result-custody-contract.v1.json), com 4 papéis assinantes (serviço, custodiante, técnico e revisor independente), seis etapas de prontidão e separação entre verificação de dados e decisão corporativa.
- [Schema restritivo](../schemas/private-staging-result-attestation.schema.json) para **futuro armazenamento privado**, sem autorização para inserir instâncias reais no GitHub.
- [Biblioteca Ed25519](../scripts/lib/private-result-attestation.mjs): verifica recibo, estado da chave, trust registry injetado, digests encadeados, tenant/caso/run, horário, evidências TEST e segregação de funções. Chaves de teste efêmeras.
- [Validador](../scripts/validate-private-result-custody.mjs) com [48 casos sintéticos](../data/quality/private-result-custody-regressions.v1.json): 8 exemplos assinados e 40 tentativas de burlar assinatura, integridade, ator, tempo, replay, resultado, contraprova ou liberação.
- [Runbook técnico](CUSTODIA_RESULTADOS_STAGING.md), CI/QA e indicadores.

## Limite explícito

Todas as atestações são inventadas **durante o teste**. Não há certificado empresarial, usuário real, revisor real, resultado físico de máquina, publicação, homologação de segurança ou infraestrutura habilitada. Uma assinatura que passa atesta somente integridade do conteúdo de teste sob uma chave confiável fornecida ao verificador — **não** exatidão técnica nem conformidade OEM.

O estado máximo devolvido pelo modelo é `eligible_for_manual_change_control_review`. A decisão humana e o ambiente corporativo ainda precisam existir.

## Compatibilidade

Continuam 24 cadeias FMEA e 15 mecanismos oficiais; 3 candidatas e 4 refinamentos editoriais aguardam documentação OEM efetiva. Contrato público **1.0.0**, conteúdo público **1.0.0**, preview legado **1.3.12** e seu checksum não foram modificados. Nenhum consumidor foi editado.

**Próxima etapa:** ampliar o fluxo de revisão simulada de resultados inconsistentes, criando trilha de esclarecimentos, reexecução e decisão independente sem assinar fatos inexistentes.
