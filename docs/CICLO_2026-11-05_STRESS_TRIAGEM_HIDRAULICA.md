# Ciclo v1.3.97 — Ensaio sintético de robustez da triagem editorial hidráulica

**05/11/2026 · Teste de regressão da triagem v1.3.96 · 100% sintético**

## Objetivo
Testar se a triagem editorial de exercícios hidráulicos diferencia corretamente alertas de segurança, crítica técnica, divergência de alternativa, demanda de revisão, ausência de objeção e ausência de feedback — sem gerar falsos diagnósticos ou homologações.

## Conjunto determinístico
O script `scripts/audit-hydraulic-synthetic-triage-stress.mjs` gera, inteiramente em memória, **seis submissões fictícias**, cada uma contendo as 20 fichas públicas do protocolo v1.3.95. Nenhum nome, empresa, série, leitura OEM, número SAP, OS ou parecer real é utilizado.

As dez primeiras fichas receberam cenários distintos, e as outras dez permanecem avaliações sintéticas `adequate` sem discordância.

| Caso | Contradição introduzida | Resultado obrigatório |
| --- | --- | --- |
| HY-DRILL-01 | uma avaliação `critical_issue` de segurança | `SAFETY_HOLD` |
| HY-DRILL-02 | recomendações de alternativas diferentes | `ANSWER_DISAGREEMENT` |
| HY-DRILL-03 | `critical_issue` em observabilidade | `CRITICAL_EDITORIAL_REVIEW` |
| HY-DRILL-04 | `needs_revision` em distratores | `REVISION_BACKLOG` |
| HY-DRILL-05 | todas as dimensões `adequate` | `NO_ISSUE_REPORTED` |
| HY-DRILL-06 | nenhuma resposta nas seis submissões | `AWAITING_REVIEW` |
| HY-DRILL-07 | tag `unsafe_action_risk` mesmo sem nota crítica | `SAFETY_HOLD` |
| HY-DRILL-08 | tag `answer_key_ambiguity` sem voto divergente | `ANSWER_DISAGREEMENT` |
| HY-DRILL-09 | um alerta crítico de segurança entre respostas favoráveis | `SAFETY_HOLD` |
| HY-DRILL-10 | crítica OEM e respostas divergentes | `CRITICAL_EDITORIAL_REVIEW` preservando a divergência |

Os resultados esperados são **3 `SAFETY_HOLD`**, **2 `CRITICAL_EDITORIAL_REVIEW`**, **2 `ANSWER_DISAGREEMENT`**, **1 `REVISION_BACKLOG`**, **11 `NO_ISSUE_REPORTED`** e **1 `AWAITING_REVIEW`**. Essas contagens são uma **previsão do teste sintético**, não número de objeções humanas efetivamente recebidas.

## Regressões automáticas
1. **Integridade dos seis formulários:** todos passam pelo validador estrito v1.3.95 antes da consolidação.
2. **Invariância de permutação:** resultado idêntico ao inverter/rotacionar a ordem das submissões e das linhas dos 20 exercícios.
3. **Monotonicidade de segurança:** adicionar de 1 a 20 formulários totalmente favoráveis não pode retirar três bloqueios existentes.
4. **Sem falsa independência estatística:** seis submissões continuam com `independentReviewerCount: null`.
5. **Sem falsa aprovação:** qualquer entrada ou saída que tente acrescentar liberação operacional, assinatura ou outro campo privado é rejeitada.
6. **Mutações adversariais:** entradas com identidade, número de série, campos adicionais, notas inválidas, aprovações falsas e alternativas desconhecidas falham fechadas.

## Execução
```bash
npm run pm:hydraulic:triage:stress:audit
npm run pm:hydraulic:triage:demo
```

O primeiro comando gera `reports/hydraulic-synthetic-triage-stress.generated.json` e falha com exit code 1 em qualquer desvio. O segundo gera também `reports/hydraulic-synthetic-triage-demo.generated.json`, que pode ser aberto no painel offline `docs/triagem-hidraulica-editorial.html`. O arquivo de demonstração não deve ser apresentado como avaliação real.

## Restrições e próximos gates
Este ensaio verifica **comportamento de software e regras editoriais**; não determina validade externa dos 20 exercícios, competência de revisores, independência de opiniões nem qualidade de ensaios hidráulicos de campo. O benchmark de origem v1.3.94, os 10 bloqueios PM×SAP, os oito gates privados `NO_GO` e todos os consumidores externos permanecem inalterados.

**Próxima ação concreta:** submeter os exercícios fictícios à crítica técnica independente, em ambiente autorizado, e usar divergências justificadas para elaborar propostas de alteração dos textos. Qualquer modificação de gabarito exige verificação humana separada e regressão específica.
