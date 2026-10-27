# Ciclo v1.3.71 — Cenários sintéticos de qualidade e contradição de evidências P0

**27/10/2026 · Catálogo 1.3.71 · Ontologia 1.3.23 e maturidade 1.3.60 preservadas**

## Objetivo

Submeter os dois pilotos públicos já existentes (radiador e filtro de combustível) a nove classes de situações documentais cada, **sem usar ativo, série, laudo, observação de campo ou aprovação reais**. Em vez de apenas exigir documentos, o ciclo verifica que o classificador não confunde indício aparentemente positivo com confirmação de mecanismo, dano, causa raiz, código SAP ou liberação do equipamento.

Os 15 diferenciais de v1.3.69 e o blueprint de v1.3.70 são fontes; não criamos novos diagnósticos nem duplicamos os contratos corporativos.

## Matriz de situações e encaminhamentos

| Situação sintética | Classificação produzida | Responsável por possível encaminhamento humano |
| --- | --- | --- |
| Sem identidade/variante do ativo | `REQUEST_IDENTITY` | Controle documental |
| Documentos e recibos incompletos | `REQUEST_DOCUMENTATION` | Controle documental |
| Origem/custódia inválida | `REJECT_UNTRUSTED_EVIDENCE` | Controle documental |
| Desenho/manual não aplicável à variante | `REJECT_WRONG_APPLICABILITY` | Controle documental |
| Ausência de contraprova | `REQUEST_COUNTEREVIDENCE` | Engenharia independente |
| Observações incompatíveis | `HOLD_CONFLICTING_EVIDENCE` | Engenharia independente |
| Metrologia inadequada ou sem qualificação | `HOLD_METROLOGY_REVIEW` | Engenharia independente |
| Evidências hipoteticamente favoráveis | `HOLD_PRIVATE_INDEPENDENT_REVIEW` | Engenharia independente |
| Observação inconclusiva/não discriminante | `HOLD_INCONCLUSIVE` | Engenharia independente |

**Cada classe é avaliada uma vez para cada piloto: 18 casos sintéticos.** O recebimento de dados aparentemente bons **não promove** o estado de hipótese, dano, causa ou SAP. Os nomes dos estados são sugestões de rota para uma implementação corporativa futura, e não tickets ou solicitações realmente enviados.

## Critérios de proteção

1. A entrada deve conter **exatamente sete campos sintéticos permitidos**, com enumerações estritas. Tag, série, token real, URLs, assinatura ou propriedades desconhecidas são rejeitadas.
2. Proveniência inválida e configuração OEM incompatível precedem avaliação favorável, mesmo quando a observação parece positiva.
3. Identidade incompleta, documentação incompleta e ausência de contraprova interrompem a análise.
4. Conflito de sinais precede cálculo ou interpretação da medição.
5. Sem integridade metrológica e evidência de mecanismo não se pode sustentar causa; mesmo um cenário hipoteticamente coerente só segue como pendência de revisão privada independente.
6. Engenharia, Dados Mestres SAP e Operação preservam autoridades separadas. Todos os casos têm `publicDecision: NO_GO`, sem OS, cadastro ou intervenção.

A atribuição a uma função responsável indica **quem precisaria avaliar** a situação em uma futura implantação. O repositório não notifica pessoas, não abre nota SAP nem implanta custódia, RBAC, armazenamento ou assinatura digital.

## Integração e artefatos

- `data/quality/pm-p0-synthetic-evidence-outcomes-policy.v1.json`: nove cenários, estados permitidos, regras de precedência e roteamento humano.
- `scripts/lib/pm-p0-synthetic-evidence-outcomes.mjs`: classificador puro, estrito, sem side effects, e matriz derivada dos dois casos preexistentes.
- `scripts/audit-pm-p0-synthetic-evidence-outcomes.mjs`: executa controles positivos/negativos, rejeições de campos não previstos e mutações adversariais contra aprovação falsa, supressão de contraprova e enfraquecimento de gates.
- `reports/pm-p0-synthetic-evidence-outcomes.generated.json`: saída reproduzível de CI; guarda exclusivamente exemplos sintéticos e contagens teóricas.

Comando: `npm run pm:p0:scenarios:audit`. O relatório é incluído no GitHub Actions. Os 25 padrões preventivos, 115 vínculos candidatos, dez exceções SAP e oito gates corporativos privados permanecem intocados.

## Próxima etapa de maturidade

Antes de qualquer piloto real, a empresa precisaria implantar e comprovar sistema restrito com identidade corporativa, custódia imutável, licenciamento e aplicabilidade OEM por número de série, metrologia e procedimentos seguros, responsáveis independentes e segregação operacional. **Nenhuma dessas condições está demonstrada por estes ensaios públicos.** O resultado permanece `NO_GO`.
