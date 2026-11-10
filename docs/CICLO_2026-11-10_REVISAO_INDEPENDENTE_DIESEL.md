# Ciclo v1.4.17 — Revisão editorial independente do diagnóstico combinado diesel

**10/11/2026 · Instrumento de crítica técnica externa, sem parecer recebido.**

## Problema material

A versão [1.4.16](CICLO_2026-11-10_DIAGNOSTICO_COMBINADO_DIESEL.md) criou seis contextos sintéticos de motor diesel e 18 interpretações de simultaneidade entre anomalias térmicas e suspeitas de contaminação óleo–refrigerante. A coerência mecânica e a estrutura documental precisam ser confrontadas por pessoas experientes **sem confundir aprovação de software com revisão humana**. O pesquisador que elaborou as 18 relações não deve ser o único avaliador da plausibilidade de suas relações.

## Solução entregue

**Interface:** [Revisão técnica diesel](revisao-diesel-especialistas.html), publicada em HTML autônomo no Pages após build. O revisor avalia cada interpretação sem ver a etiqueta de classificação causal originalmente escolhida pelo autor e sem ver a conclusão inválida. Esse ocultamento é apenas **editorial**: o JSON original continua público, portanto não é cegamento criptográfico nem comprovação de independência.

Cada uma das 18 fichas apresenta cenário fictício, sintomas, explicação proposta, contraprova e IDs das hipóteses e documentos. A resposta exige uma **classificação própria**, com possibilidade explícita `UNDETERMINED`, mais cinco dimensões: coerência mecânica, limite causal, efetividade OEM, evidência discriminante e segurança. Cada dimensão aceita `unreviewed`, `adequate`, `needs_revision` ou `critical_issue`. O revisor também pode indicar oito categorias fechadas de divergência.

A sessão pode ser exportada **parcialmente** e importada em outra ocasião como JSON de campos controlados. Toda exportação inclui as 18 IDs (as não avaliadas ficam nulas) e um SHA-256 do dossiê original, para impedir aplicar uma sessão a versão alterada. Sem backend, telemetria, localStorage, nomes, comentários livres, laudos ou dados de frota.

## Fronteiras e fluxo de análise

1. Confirmar autorização institucional e escopo editorial; o formulário pode ser distribuído a engenheiros ou especialistas diesel/arrefecimento, mas **não identifica nem autentica** o participante.
2. Solicitar pareceres separados. Não compartilhar resultados anteriores antes do julgamento inicial.
3. Preservar exportações somente em meio privado autorizado; não versionar respostas de trabalhadores ou relatórios da mina no repositório público.
4. Confrontar classificações `INDEPENDENT`, `SHARED_CONTEXT`, `POSSIBLE_COUPLING`, `MEASUREMENT_ARTIFACT` e `UNDETERMINED`, marcando divergências e `critical_issue` para curadoria técnica independente.
5. Corrigir a ficha de conhecimento apenas após revisão técnica justificada, nova versão canônica e nova auditoria. **Nenhum voto ou nota altera automaticamente a ontologia, o corpus ou um gabarito.**

A existência de fontes de fabricantes **fundamenta mecanismos individuais**, não certifica a relação conjunta entre sintomas nem a efetividade de um circuito de uma série real. Testes, reparos, SAP e liberação operacional continuam processos corporativos independentes.

## Artefatos

- `data/quality/diesel-bridge-expert-review-protocol.v1.json` — protocolo e dimensões, inicialmente com **zero avaliações recebidas**;
- `data/quality/diesel-bridge-review-empty.v1.json` — exemplo público totalmente vazio; a distribuição compilada incorpora o digest real da ficha;
- `schemas/diesel-bridge-review-sheet.schema.json` — esquema JSON com proibição de campos extras;
- `scripts/lib/diesel-bridge-review-core.mjs` — geração, validação e assessment **editorial somente**;
- `docs/revisao-diesel-especialistas.html` — revisão offline; export/import local sem resposta original;
- `scripts/build-diesel-bridge-review.mjs` — gerador de bundle e HTML publicado;
- `scripts/audit-diesel-bridge-review.mjs` — verificação contra **26 mutações inválidas**, dois exemplos sintéticos positivos e integridade do piloto congelado.

## Critérios de fechamento deste ciclo

CI e Pages precisam executar geração e auditoria sem erros, os 18 IDs e cinco dimensões devem manter paridade, a classe original não pode aparecer no bundle de revisão e o hash do corpus congelado 1.4.11 deve permanecer intacto.

**Resultado medido de revisão humana:** não disponível. **Pareceres externos efetivamente recebidos:** 0. **Causas confirmadas / ativos / homologação OEM / decisão SAP / liberação:** 0.

## Próximo passo concreto

Distribuir o instrumento a **dois especialistas independentes** (Engenharia de Motores e Arrefecimento, sempre que houver disponibilidade) e preservar seus JSONs em meio privado. Caso não exista autorização para consulta externa, manter o estado "pendente" em vez de simular avaliações. Em paralelo, o piloto de perguntas espontâneas do motor de busca 1.4.11 permanece uma iniciativa **diferente** e deve seguir seus 11 gates; revisar estas 18 interpretações não mede acurácia do buscador.
