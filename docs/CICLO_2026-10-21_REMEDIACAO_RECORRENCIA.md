# FMEA Database Mining — Ciclo v1.3.29: remediação e recorrência

**Data:** 21/10/2026 · **Natureza:** implementação de taxonomia de proposta corretiva e testes offline exclusivamente sintéticos.

## Contexto e entrega

A v1.3.28 criou o tratamento documental de resultado de staging reprovado ou inconclusivo, mas não fornecia um catálogo de ações verificáveis nem método de correlação de ocorrências de um mesmo controle. Esta versão cria:

- [Catálogo v1.3.29](../data/governance/recurrent-remediation-catalog.v1.json): quatro perfis, cinco ações e cinco evidências propostas em cada, separados por natureza física/operacional do **ensaio de TI**, não do equipamento móvel.
- [Biblioteca de avaliação](../scripts/lib/recurrent-remediation.mjs): classificação de problema e geração de planos TEST, contagem de runs distintos, comparação de scope e seleção do overlay de recorrência, verificação de critérios de intervenção e ausência de aprovação real.
- [Schema de plano](../schemas/recurrent-remediation-plan.schema.json) com campos de dados sintéticos obrigatórios e flags de aprovação/execução sempre falsos.
- [52 testes de regressão](../data/quality/recurrent-remediation-regressions.v1.json): 12 baselines sintéticos e 40 casos adversariais de interpretação, qualidade, repetição, evidência, identidade e autoridade.
- Novo `npm run remediation:recurrence:validate` incorporado ao `npm run qa` e CI, com indicadores e [runbook](REMEDIACAO_DESVIOS_RECORRENTES.md).

## Semântica causal e limite de evidência

Um controle que falha não significa falha mecânica. Uma medição de controle inconclusiva não prova não conformidade. Falha de infraestrutura de teste não permite diagnosticar o controle avaliado. E duas ocorrências agregadas **não bastam para atribuir causa comum**.

O limiar "dois runs em 30 dias" é estritamente **parâmetro de simulação**, nunca regra corporativa. O sistema não fecha incidentes nem afirma que a correção foi implementada; no máximo indica `eligible_for_manual_review` para um plano **proposto**.

## Resultado e dependências

Nenhuma conta, laudo, manual OEM, arquivo corporativo, incidente real ou evidência de campo foi inserida. Os 24 FC, 15 ME e os contratos de conteúdo público 1.0.0 permanecem inalterados. Preview 1.3.12 e golden checksum preservados; consumidores não modificados.

**Próxima prioridade:** elaborar quadro consolidado de bloqueios reais de implantação e responsabilidades de aprovação externa, para concentrar esforços em disponibilidade de infraestrutura, direitos de fonte e efetividade OEM.
