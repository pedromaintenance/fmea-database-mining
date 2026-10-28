# Ciclo v1.3.76 — Observabilidade e diagnóstico diferencial das 15 regras PM sem prioridade documental

**27/10/2026 · Catálogo v1.3.76 · Natureza: desenho conceitual, não inspeção real**

## Por que este ciclo não avança o SEC-01

O handoff SEC-01 está preparado desde a v1.3.75. A aprovação institucional, a licença OEM, a privacidade e as assinaturas dependem de pessoas autorizadas em processo corporativo. Produzir outros memorandos públicos não remove o bloqueio.

Este ciclo volta à **qualidade técnica do catálogo de falhas**. A matriz de maturidade da v1.3.60 registra **25 regras preventivas**, **10 exceções PM×SAP** com prioridade documental já existente (5 P0 / 5 P1) e **15 regras sem prioridade documental atribuída**.

**Sem prioridade atribuída não significa baixo risco.** Não criamos uma prioridade nova nem usamos quantidade de vínculos, visibilidade de sintoma ou severidade aparente como critério para inferir ranking.

## Nova análise de observabilidade

Para cada uma das 15 regras, o relatório deriva **literalmente** do arquivo `data/knowledge/pm-prevention/seed-rules.json` o sistema, subgrupo candidato, componente, sintoma e método de inspeção.

Depois associa **duas hipóteses concorrentes propostas pela Engenharia** e **duas solicitações qualitativas de evidência** para distinguir mecanismos físicos. São hipóteses didáticas de planejamento, não achados documentados de campo, procedimentos OEM ou conclusões de causa raiz.

| Família | Regras incluídas | Principal cuidado de interpretação |
| --- | --- | --- |
| Arrefecimento | `cooling-radiator-leak`, `cooling-fan-bearing`, `cooling-fan-belt` | Origem de vazamento, ruído e correia requerem isolamento físico e identificação de fonte |
| Motor e transmissão | `engine-exhaust`, `differential-gear`, `final-drive-bearing`, `final-drive-gear` | Fuligem, ruído e partículas de óleo não identificam isoladamente trinca, rolamento ou engrenagem |
| Rodante e fixações | `track-roller-wear`, `track-bolt-loose` | Desgaste e afrouxamento não revelam sozinhos o mecanismo primário |
| Pneus e freios | `wheel-tire-damage`, `wheel-tire-wear`, `brake-disc` | Inspeção superficial requer critérios OEM/fabricante e controle de perigos antes de qualquer ação |
| Hidráulico e implementos | `hydraulic-pump-seal`, `implement-cylinder` | Fluido escorrido pode ter origem em outro ponto; risco de injeção e carga retida |
| Perfuratriz | `drill-feed-chain` | Corrente e roda dentada podem ter mecanismos concorrentes; inspeção segura e dimensional efetiva |

## Exemplo de leitura técnica

**Regra:** `final-drive-gear`.

**Texto da fonte:** sintoma “Desgaste de engrenagens do comando final”; método “inspecao_oleo_bujao_magnetico_e_ruido”. Esses são campos estruturados do cadastro preventivo, não observações efetivamente realizadas.

**Hipótese proposta A:** desgaste de engrenagens. **Hipótese proposta B:** desgaste de rolamentos ou outros elementos ferrosos do compartimento.

**Evidência que faltaria:** caracterização e tendência de partículas, dados da amostragem e inspeção autorizada por configuração. **Limite:** partículas magnéticas não confirmam, isoladamente, a engrenagem como origem.

A auditoria exige que as duas hipóteses continuem não exclusivas e não confirmadas. Não é permitido propor limite numérico OEM, frequência de troca, desmontagem ou procedimento de teste sem efetividade de série e autorização competente.

## Política de uso

- **Não executar testes** com base nesses pacotes públicos: antes, aprovar método OEM específico, análise de risco, isolamento de energias, competência e recursos.
- **Não codificar dano/causa SAP** a partir de sintomas ou de hipóteses concorrentes sem validação.
- **Não elevar maturidade**: zero inspeções, medições, efetividades OEM e aprovações de Engenharia.
- **Não alterar prioridades**: dez exceções permanecem exatamente nas categorias anteriores; 15 regras continuam sem prioridade documental atribuída.

## Arquivos e auditoria

- `data/quality/pm-unranked-observability-policy.v1.json` — 15 desenhos de observação e 30 alternativas com requisições de contraprova e alerta de segurança.
- `scripts/lib/pm-unranked-observability.mjs` — reconciliador determinístico de sementes, matriz de maturidade e bloqueios existentes.
- `scripts/audit-pm-unranked-observability.mjs` — ataques contra falsa certeza, prioridade inventada, homologação OEM, execução, SAP e operação.
- `reports/pm-unranked-observability.generated.json` — matriz detalhada gerada no QA/CI (artefato, não evidência de campo).

Comando: `npm run pm:unranked:observability:audit`.

**Estado preservado:** `NO_GO_PUBLIC_OBSERVABILITY_ONLY`. Os oito gates privados do SEC-01 ao PIL-08 e dez exceções PM×SAP continuam bloqueados.

**Próximo avanço técnico plausível:** analisar a qualidade de detecção e os limites de interpretação dos métodos de inspeção de maneira transversal, usando estas 15 alternativas e os 5 P0, sem transformar resultados sintéticos em frequência ou gravidade operacional.
