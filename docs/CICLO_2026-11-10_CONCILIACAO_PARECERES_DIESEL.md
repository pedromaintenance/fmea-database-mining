# Ciclo v1.4.18 — Conciliação local de pareceres editoriais sobre motores diesel

**10/11/2026 · Ferramentas públicas de leitura; os pareceres reais devem permanecer fora do repositório.**

## Necessidade material

A v1.4.17 permite que profissionais examinem as 18 relações conceituais do dossiê diesel sem ver a classificação escolhida pelo autor. A próxima capacidade útil é **confrontar** duas respostas mantendo privacidade, sem tomar concordância como validação humana autenticada, nem transformar número de arquivos em número de pessoas independentes.

O instrumento publicado não coleta revisões, identidades, sensores, amostras, nomes, número de série ou OS SAP. **Até este ciclo: zero pareceres recebidos e zero revisores autenticados**.

## Regra técnica: segurança domina a concordância

O avaliador usa um contrato `fail-closed` compartilhado pelo HTML e CLI. Cada arquivo deve obedecer ao schema v1.4.17: 18 IDs ordenados, cinco dimensões, códigos permitidos e SHA-256 exato do dossiê v1.4.16. Campos extras e versões diferentes são recusados.

Os estados de cada interpretação seguem **precedência de decisão editorial**, que não constitui gravidade FMEA nem RPN:

1. `SAFETY_CONCERN` — qualquer crítico na rubrica ou etiqueta `unsafe_operational_implication`, mesmo com revisão parcial;
2. `INCOMPLETE` — uma das entradas não classificou relação e as cinco dimensões;
3. `RELATION_DISAGREEMENT` — classificação causal diferente;
4. `RUBRIC_DISAGREEMENT` — divergência em uma das cinco notas;
5. `UNDETERMINED_OR_EDITORIAL_CONCERN` — incerteza assumida, nota de revisão ou etiqueta de objeção;
6. `CONCORDANT_NOT_APPROVED` — concordância editorial plena; **não** é aprovação de motor, procedimento ou FMEA.

Se ambos os arquivos estão vazios, status `NO_REVIEW_EVIDENCE`. Se as respostas estruturadas são idênticas, status `POSSIBLE_DUPLICATE_SUBMISSIONS`, impedindo tratar a contagem de arquivos como evidência de pessoas distintas. Mesmo com arquivos diferentes, competência e independência continuam **não verificadas**. Todas as interpretações exigem decisão editorial humana quando houver revisão real.

## Interface local

[Conciliação de pareceres diesel](conciliacao-pareceres-diesel.html) recebe dois arquivos JSON selecionados conscientemente no navegador; compara sem rede, armazenamento persistente, servidor, cookies ou telemetria. Exibe divergências, estados, classificações A/B e etiquetas; não embute nenhuma revisão real.

O botão de exportação gera apenas **resumo reduzido**, com IDs, estados, contagens, status e fingerprint. Arquivos de revisão originais **não** são exportados novamente, reproduzidos em bibliotecas públicas ou anexados a Issues.

### CLI sob custódia corporativa privada

```bash
npm run knowledge:engine:bridge:reconcile -- \
  --left private/reviewer-a.json \
  --right private/reviewer-b.json \
  --out private/conciliacao-local.json
```

O CLI exige entradas e saída em `private/` ignorado pelo Git, recusa sobrescrita, caminhos repetidos, arquivos acima do limite, symlinks e incompatibilidades de versão. A saída local contém o resultado de comparação; o terminal só recebe estatísticas não confidenciais. Caso nenhum argumento seja passado, retorna `NO_PRIVATE_REVIEW_INPUTS`, sem criar arquivo nem simular revisão.

## Contratos e testes

- `data/quality/diesel-bridge-reconciliation-policy.v1.json` — hierarquia de estados, proibições de promoção automática e status público zero;
- `scripts/lib/diesel-bridge-reconciliation-core.mjs` — função pura e portável de conciliação e projeção reduzida;
- `docs/conciliacao-pareceres-diesel.html` — interface offline com dois arquivos locais;
- `scripts/build-diesel-bridge-reconciliation.mjs` — compilação do HTML e pacote público **sem pareceres**;
- `scripts/reconcile-diesel-bridge-reviews.mjs` — consumo privado pelo terminal, sem upload;
- `scripts/audit-diesel-bridge-reconciliation.mjs` — mutações adversariais e comparações sintéticas dos quatro fenômenos de divergência, segurança e parcialidade;
- integração de QA, biblioteca, índice e GitHub Pages.

A verificação de invariância do piloto 1.4.11 confirma os 11 objetos bloqueados e a estrutura do grafo. Nenhum índice lexical, ficha congelada, mapeamento SAP ou sistema de manutenção é alterado.

## Fronteira de evidência

Os resultados automatizados comprovam **integridade de entrada e comportamento determinístico** da ferramenta no conjunto testado. Não comprovam coerência física dos mecanismos, aceitação OEM por série, identidade ou independência dos revisores e muito menos uma causa raiz real.

**Ação material seguinte:** buscar dois pareceres efetivamente preenchidos e de profissionais distintos por canal organizacional autorizado, preservá-los privados, registrar justificativas e inconformidades com especialistas e só depois publicar uma nova versão editorial. Em paralelo, o piloto congelado de perguntas reais permanece dependente de coleta externa e dos seus 11 gates.
