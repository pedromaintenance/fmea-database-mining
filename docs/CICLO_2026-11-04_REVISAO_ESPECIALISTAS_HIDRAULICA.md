# Ciclo v1.3.95 — Protocolo de revisão editorial independente dos exercícios hidráulicos

**04/11/2026 · Catálogo v1.3.95 · Benchmark de origem v1.3.94**

## Por que revisar
Os 20 exercícios sintéticos da v1.3.94 referenciam dez circuitos e 30 hipóteses concorrentes. A aprovação do código e do gabarito por testes automáticos não equivale à avaliação de um engenheiro ou mecânico habilitado. Este ciclo disponibiliza uma **ferramenta de crítica técnica independente**. Nenhum especialista real foi consultado, identificado ou declarado como tendo aprovado o benchmark.

## Rubrica de cinco dimensões

| Dimensão | Questão editorial |
| --- | --- |
| Segurança/barreiras | O caso impede ensaio inseguro, energia não controlada e liberação indevida? |
| Discriminação causal | Sintoma, mecanismo, dano físico e causa raiz continuam separados? |
| Efetividade OEM | A alternativa preserva necessidade de documentação por série, sem inventar limites? |
| Observabilidade | São considerados condições, unidades, instrumentos e sincronismo quando necessários? |
| Distratores | As respostas incorretas representam erros técnicos plausíveis? |

Cada dimensão recebe `unreviewed`, `adequate`, `needs_revision` ou `critical_issue`. O revisor seleciona a alternativa que considera mais defensável e pode marcar oito categorias editoriais fechadas: risco inseguro, causa prematura, OEM, observabilidade, ambiguidade de resposta, distrator inverossímil, explicação fraca e outra dúvida editorial.

## Revisão em HTML standalone

**Abrir:** [Revisão técnica de exercícios hidráulicos](revisao-hidraulica-especialistas.html)

1. Selecionar um dos 20 exercícios e ler somente cenário, pergunta e três alternativas.
2. Escolher a resposta recomendada, classificar as cinco dimensões e indicar tags opcionais.
3. Exportar JSON anônimo; importar o JSON para continuar uma sessão parcial em outro momento.

O HTML **não embute o gabarito** `expectedChoiceCode`, as explicações das respostas nem os campos de feedback do benchmark. Esta ocultação é didática — qualquer pessoa pode abrir o benchmark público no repositório. A aplicação não utiliza backend, telemetria, armazenamento local persistente nem solicita a identidade do revisor.

**Não são exportados nem aceitos:** nomes, empresa, e-mail, número de série, tag real, leitura de campo, procedimento OEM privado, localização SAP, OS, assinatura, URL de documento restrito ou campo de comentário livre. Apenas códigos de casos, escolhas e avaliações controladas.

## Fronteira entre feedback e aprovação

Um revisor pode propor uma alternativa diferente do gabarito. O validador registra a contagem de possíveis divergências para **curadoria editorial manual**, sem alterar a resposta oficial. Uma nota `adequate`, mesmo em todos os 20 casos, não comprova revisão profissional autenticada, certificação, diagnóstico de campo, aprovação SAP, condição de máquina ou liberação operacional.

O template `hydraulic-expert-review-sheet.v1.json` tem **20 linhas sem preenchimento**: não há pareceres humanos recebidos. A interface não registra identidade ou habilitação profissional. Revisões autenticadas exigiriam infraestrutura privada autorizada e governança própria.

## Artefatos entregues

- `data/quality/hydraulic-expert-review-protocol.v1.json` — rubrica, oito categorias e proteção de privacidade.
- `data/quality/hydraulic-expert-review-sheet.v1.json` — 20 linhas inicialmente `unreviewed`.
- `schemas/hydraulic-expert-review-sheet.schema.json` — esquema estrito de exportação e importação.
- `docs/revisao-hidraulica-especialistas.html` — interface offline responsiva, sem gabarito.
- `scripts/lib/hydraulic-expert-review.mjs` — geração e validação de JSON de revisão.
- `scripts/audit-hydraulic-peer-review.mjs` — paridade entre fonte HTML e benchmark, sintaxe JavaScript, contraprova, importação e **36 mutações adversariais**.
- `reports/hydraulic-expert-review.generated.json` — relatório de CI.

## Próximo passo concreto
Solicitar revisão editorial voluntária a mecânicos, planejadores e engenheiros experientes **somente com cenários fictícios públicos**. Comparar discordâncias e problemas críticos, revisar os textos dos exercícios mediante justificativa técnica e submeter alterações de gabarito à curadoria independente antes de publicar nova versão.

**Não houve** acesso a SIS privado, coleta de ensaio real, confirmação de falha ou aprovação corporativa. Os 25 bundles conceituais, dez bloqueios PM×SAP e oito gates privados `NO_GO` permanecem intactos. Nenhum consumidor externo foi alterado.
