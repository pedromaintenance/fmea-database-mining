# Ciclo v1.3.79 — Matriz consolidada de maturidade da evidência PM

**28/10/2026 · Catálogo 1.3.79 · Análise conceitual de confiabilidade, sem validação em campo**

## Resultado de engenharia

O repositório passa a oferecer **uma explicação integrada por cada uma das 15 regras preventivas sem prioridade documental**, cruzando três componentes já existentes:

- **v1.3.76 — Observabilidade:** sintoma e método literais do cadastro; duas alternativas mecânicas abertas por regra, sem sinal físico confirmado.
- **v1.3.77 — Detectabilidade:** confusores, risco qualitativo de atribuição indevida e não detecção; sensibilidade e especificidade não mensuradas.
- **v1.3.78 — Metrologia e proveniência:** dez condições de validade, aplicabilidade e custódia **não avaliadas** por inspeção; nenhum instrumento ou certificado examinado.

Os três relatórios continuam independentes e suas hipóteses não foram substituídas. A nova matriz agrega **dependências e bloqueios**, não cria um índice estatístico ou score de risco. *Uma regra modelada não equivale a uma hipótese confirmada.*

## O que impede uma conclusão técnica?

Para cada regra, os bloqueios explícitos do relatório são:

| Camada | Estado público atual | Evidência privada necessária |
| --- | --- | --- |
| Modelo conceitual | Descrição presente, não verificada no equipamento | Confronto do modelo e hipóteses com a configuração e evidência independente |
| Limites de detecção | Limitações qualitativas identificadas, não calibradas | Revisão das condições de observação e da capacidade discriminante do método |
| Qualidade metrológica | Dez requisitos ainda sem avaliação | Segurança, configuração, OEM, instrumento, calibração, condições, repetibilidade, incerteza, custódia e contraprova |
| Efetividade OEM | Método e variante/série não verificados | Aplicabilidade sob licença, configurada por variante e série reais |
| Revisão humana | Sem parecer e aceite independente | Revisão de Engenharia/Confiabilidade, registro privado e julgamento causal |
| Execução e SAP | Sem autorização | Fluxos corporativos separados, após gates formais; **nenhuma OS ou remapeamento automático** |

As **seis camadas não são um ranking** e sua posição não indica gravidade. A contagem de bloqueios não deve ser transformada em criticidade, disponibilidade, índice de confiança ou urgência de manutenção.

A matriz contém **90 posições de bloqueio** (6 por regra) e **150 posições documentais pendentes** (10 por regra). Essas quantidades se referem a tipos diferentes de requisito e não representam 240 falhas, avaliações de campo ou documentos efetivamente faltantes.

## Exemplo de raciocínio causal

**Regra `final-drive-gear` — material magnético/óleo/ruído no comando final.**

O sintoma estrutural e o método de inspeção constam do cadastro preventivo. A hipótese de desgaste de engrenagem compete com mecanismos associados a rolamentos e demais superfícies ferrosas. O método possui risco qualitativo de atribuição indevida porque partículas ferrosas não identificam isoladamente a origem, e um defeito incipiente pode não produzir sinal evidente na coleta disponível.

Antes de atribuir dano físico ou causa raiz, seriam necessários **componentes e série efetivos**, método OEM adequado, contexto de amostragem, confiabilidade de instrumento quando aplicável, contraprovas e exame técnico independente. Até lá, o resultado adequado permanece **inconclusivo**, sem liberar operação, alterar SAP ou determinar manutenção pela mera existência de uma hipótese.

## Ensaio de decisões contraditórias

O auditor combina seis situações sintéticas por regra, somando **90 interpretações**. Exemplos:

1. **Sinal presente + documentação hipoteticamente completa:** exige contraprovas e revisão independente; não aprova causa raiz.
2. **Sinal ausente + documentação hipoteticamente completa:** ausência de sinal não prova saúde; não libera a máquina.
3. **Sinal ambíguo + documentação hipoteticamente completa:** diagnóstico inconclusivo e avaliação humana.
4. **Sinal presente + método OEM não demonstrado:** bloquear interpretação até comprovação de efetividade e licença.
5. **Ambiguidade + condição insegura:** prioridade de segurança, sem permitir a verificação prática.
6. **Sinal presente + calibração alegada como não aplicável:** exige revisão humana da justificativa, sem dispensa automática.

Os testes do classificador **não são avaliações de campo**. As entradas aceitam somente IDs públicos de regras, estados e cenários enumerados. Tags, assinaturas e valores de medição passados como campos extras são recusados.

## Implementação

- `data/quality/pm-evidence-maturity-policy.v1.json`: seis dependências causais, requisitos e seis cenários conservadores.
- `scripts/lib/pm-evidence-maturity.mjs`: compilador determinístico, rastreando os três relatórios originais sem copiar evidência privada.
- `scripts/audit-pm-evidence-maturity.mjs`: verificações do upstream, roteamento sintético e ataques contra promoção indevida de causa, calibração, risco, autorização, OS, SAP ou liberação.
- `reports/pm-evidence-maturity.generated.json`: matriz consolidada gerada em QA/CI.

Comando: `npm run pm:evidence:maturity:audit`.

## Limites e critérios de continuidade

Permanecem **25 regras conceituais**, **15 regras sem prioridade documental** (não significa baixo risco), **10 exceções PM×SAP** (5 P0/5 P1) e **oito gates privados bloqueados**. Nenhuma evidência real, método OEM por série, laudo, causa raiz, assinatura, autorização de trabalho ou revisão SAP é promovida.

**Estado:** `NO_GO_NO_REAL_EVIDENCE_NO_AUTOMATIC_PROMOTION`.

O avanço fora do modelo público depende de análise privada efetiva, por funções habilitadas, a partir de equipamento identificado, documentação OEM licenciada e evidência íntegra. A matriz atual serve para **preparar a revisão**, não para executá-la ou aprová-la.
