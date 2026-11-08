> **Atualização 1.4.8:** o protocolo passou a oferecer três etapas com papéis separados: [coleta](coleta-perguntas.html), [revisão cega R1/R2](revisao-cega.html) e [adjudicação](adjudicacao-tecnica.html), além de reconciliação local com gabarito privado. Consulte [o procedimento de dupla revisão](AVALIACAO_DUPLA_REVISAO.md). A interface da versão 1.4.7 permanece disponível para compatibilidade, mas avaliações com duplo parecer devem seguir o novo fluxo. Ainda não há perguntas ou revisores humanos reais.

# Ciclo 1.4.7 — Laboratório de avaliação técnica com julgamento humano

**Data: 07/11/2026 | Natureza: protocolo e infraestrutura de coleta | Status da avaliação externa: NÃO INICIADA**

## Problema material

A biblioteca possui dez fichas conceituais de fundamentos e uma busca lexical técnica v2. O teste anterior atingiu **18/24 em um conjunto de perguntas conhecido pelos autores**, após a base lexical antiga atingir 4/24. O conjunto anterior não pode ser denominado holdout independente para v2, pois seus exemplos foram consultados durante o desenvolvimento. Publicar esse desempenho como precisão externa, segurança em campo ou inteligência semântica da IA seria incorreto.

A versão **1.4.7 não inventa perguntas de trabalhadores, revisões de especialistas, métricas de acerto ou independência inexistente**. A entrega é um processo **executável e auditável** para coletar esse material posteriormente, com limites explícitos.

## Base metodológica

A iniciativa toma como referência a separação entre consultas, conjunto documental, respostas dos sistemas e julgamentos de relevância no **NIST Text REtrieval Conference — TREC**, sem alegar participação ou aderência integral ao TREC:

- [NIST/TREC — About](https://trec.nist.gov/about.html), organização de consultas, sistemas participantes, julgamentos de relevância e comparação de resultados.
- [NIST/TREC — How to TREC](https://trec.nist.gov/howto.html), papéis do assessor e os julgamentos de relevância (qrels).
- [NIST/TREC — Relevance judgments](https://trec.nist.gov/data/reljudge_eng.html), importância de combinar coleção documental e julgamentos pertinentes.
- [NIST AI RMF 1.0](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf), necessidade de definir conjuntos realistas e documentar metodologia, falsos positivos/negativos e validade externa.
- [NIST — Don't Use LLMs to Make Relevance Judgments (2025)](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=958495), alerta de que gerar julgamentos de relevância por LLM não substitui os julgamentos humanos como verdade de referência.

Os julgamentos desta biblioteca são **humanos, prospectivos, específicos de um conjunto de dez fichas conceituais**, e não os julgamentos de relevância do TREC.

## Fluxo operacional do laboratório

### 1. Coletar perguntas independentes

A equipe de desenvolvimento da biblioteca deve **não escrever as perguntas** do teste externo. Convidar pessoas da manutenção, planejamento, engenharia e inspeção a formular dúvidas em linguagem própria **sem acesso ao código das expressões de recuperação**. Não inserir dados de frota, séries, OS, OEM restrito, laudos de óleo, nomes, contatos ou observações corporativas.

Os textos podem ser digitados no [Laboratório de avaliação humana](https://pedromaintenance.github.io/fmea-database-mining/laboratorio-avaliacao.html), um HTML standalone que não faz chamadas de rede e não persiste informações. Para continuar em outra sessão, exportar **rascunho JSON** e reimportá-lo. O arquivo fica sob responsabilidade de quem o criou.

### 2. Rotular sem ver o resultado

Uma pessoa tecnicamente capaz, **que não tenha participado do ajuste da busca v2**, deve atribuir a cada pergunta uma das classes:

- \`FOUND_CONCEPTUAL\`: uma ficha relevante, com seu ID.
- \`MULTIPLE_CONCEPTS\`: duas ou mais fichas relevantes e seus IDs.
- \`ABSTAIN_UNSUPPORTED_OPERATIONAL\`: pedido de liberação, ajuste, parâmetro OEM, intervenção ou diagnóstico sem base suficiente; exige recusa de decisão automatizada.
- \`NOT_FOUND_IN_CATALOG\`: a resposta não está representada nas **dez** fichas deste corpus, e não necessariamente no restante da biblioteca.
- \`NEEDS_ADJUDICATION\`: dúvida ou desacordo no julgamento; excluído do denominador de acerto e contado separadamente.

O avaliador também registra classe da pergunta e **justificativa técnica**. Até o congelamento do gabarito, o HTML não apresenta as previsões do algoritmo. A seleção de IDs de fichas pode exigir consulta ao catálogo, mas não ao resultado da busca. **Independência é uma declaração do operador da avaliação, não uma garantia criptográfica.**

### 3. Congelar, executar e auditar

O avaliador clica em **Congelar gabarito e avaliar** após revisar todas as perguntas. A página passa a exibir o estado e IDs previstos, os esperados, as divergências e as métricas. Ela bloqueia alterações na sessão e permite exportar separadamente:

- \`revisao-humana-gabarito.json\` com perguntas, classes, IDs e justificativas assinados apenas por declaração técnica **sem dados pessoais**;
- \`revisao-humana-relatorio.json\` com resultados e discrepâncias.

O lote inclui SHA-256 do **código de recuperação** e do conjunto dos dez artigos, para detectar se os resultados foram recalculados com uma versão diferente. Não inclui assinatura de especialista, hash de testemunho externo ou prova de independência. O schema é \`schemas/external-review-batch.v1.schema.json\`.

É possível reproduzir a avaliação em Node, localmente:

\`\`\`bash
npm run knowledge:external:evaluate -- --input revisao-humana-gabarito.json --out reports/revisao-local.generated.json
\`\`\`

O comando rejeita IDs inválidos, versão de corpus incompatível, falta de justificativa, rótulo incompleto e alterações no fingerprint do motor. O JSON com perguntas e resultados permanece **local**. Não realizar commit ou upload público de revisão real sem autorização e revisão de privacidade.

## Métricas e denominadores

| Métrica | Denominador | Por que importa |
| --- | --- | --- |
| Correspondência exata de estado e IDs | Perguntas com julgamento definido, excluindo \`NEEDS_ADJUDICATION\` | Exige que a busca encontre as fichas julgadas relevantes e classifique corretamente a intenção |
| Pelo menos uma ficha esperada recuperada | Perguntas conceituais julgadas | Mostra cobertura parcial sem atribuir acerto completo |
| Todas as fichas esperadas recuperadas | Perguntas conceituais julgadas | Verifica capacidade de preservar alternativas |
| Abstenção explícita em decisão arriscada | Perguntas humanas rotuladas como \`ABSTAIN_UNSUPPORTED_OPERATIONAL\` | Identifica se o sistema reconhece o limite de autoridade |
| Vazamento conceitual em decisão arriscada | Mesmo denominador de risco | Registra casos perigosos em que o sistema devolve hipótese como resposta à intenção operacional |
| Abstenção falsa em pergunta conceitual | Perguntas conceituais julgadas | Captura recusas indevidas |
| Pendentes de julgamento | Todos os itens enviados | Mantém visíveis os conflitos editoriais |

Quando um denominador é zero, a taxa é \`null\` (**não zero e não 100%**). A recomendação interna inicial é **20 perguntas julgadas** antes de fazer uma análise descritiva minimamente útil; não é um requisito estatístico certificado nem número recomendado pelo NIST. Resultados devem ser desagregados por tipo de pergunta, incluindo consultas com implicação de segurança.

Mesmo com 20 ou mais perguntas, o status correto é **\`SELF_ATTESTED_REVIEW_NOT_EXTERNALLY_VERIFIED\`** quando as declarações de independência são verdadeiras. Não é validação independente certificada; não existe prova automática de que as pessoas eram externas nem da qualidade dos julgamentos.

## Arquitetura e integridade

Novos arquivos:
- \`schemas/external-review-batch.v1.schema.json\` — contrato de lote sem dados pessoais e revisão humanamente determinada.
- \`data/quality/external-review-empty-template.v1.json\` — rascunho **sem perguntas ou avaliações**.
- \`scripts/lib/external-review-core.mjs\` — validação e cálculo das métricas, com controles de risco.
- \`scripts/evaluate-external-review.mjs\` — avaliador CLI; **sem \`--input\` produz \`NO_EXTERNAL_SAMPLE\` e taxas nulas**.
- \`docs/laboratorio-avaliacao.html\` — interface offline, controle de três etapas e exportações JSON.
- \`scripts/build-external-review-lab.mjs\` — gera o HTML preenchido com os **mesmos** dez registros e motor lexical v2; sem API.
- \`scripts/audit-external-review.mjs\` — exercícios sintéticos **em memória**, verificações de integridade, mutações adversariais e ausência de qualquer resultado externo fabricado.

Os artefatos publicados no Pages são a página standalone, o schema e um **status de avaliação vazia**. Perguntas e julgamentos humanos não são incluídos automaticamente no Pages nem nos relatórios públicos.

## Estado real neste ciclo

- **Pessoas convidadas/avaliadoras externas:** nenhuma identificada ou conectada ao processo.
- **Perguntas externas recebidas e julgadas:** **0**.
- **Casos reais de diagnóstico de máquina:** **0**.
- **Acurácia externa medida:** **não disponível** (\`null\`).
- **Certificação de independência:** não existe.
- **Mudanças ao motor lexical v2:** **nenhuma**. Mantemos a versão congelada para poder comparar.

Este ciclo termina com **infraestrutura de avaliação pronta**, não com um benchmark concluído.

## Próxima ação concreta

Aplicar o laboratório a perguntas de pessoas de manutenção **fora da equipe de desenvolvimento**, anonimizadas. Pedir a pelo menos um segundo profissional de disciplina diferente para revisar divergências e distinguir *relevância bibliográfica* de *recomendação executável*. Consolidar os resultados por categoria e não otimizar o buscador nesse mesmo lote antes de congelar a primeira avaliação. Somente após isso considerar um mecanismo híbrido de recuperação.

**Regra central:** nenhum sistema de consulta ao acervo concede autoridade para intervir em equipamento, inventar limites OEM ou liberar máquina.
