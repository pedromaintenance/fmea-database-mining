> **Atualização 1.4.9:** o primeiro piloto agora dispõe do [kit imprimível](piloto-oficina.html), dos [11 gates de prontidão](../data/quality/field-pilot-readiness.v1.json) e de um [procedimento de campo](PILOTO_QUESTIONARIO_OFICINA.md). A CLI de reconciliação exige um `--out-dir` **novo** dentro de `private/`; a CLI de pontuação, ao receber `--input` humano, recusa entrada ou saída fora de `private/`. Pareceres não cegos ou sem revisão de privacidade não produzem gabarito. Sem coleta humana executada até esta versão.

# Ciclo 1.4.8 — Coleta independente, dupla revisão cega e adjudicação

**07/11/2026 · Público: instrumentos vazios e metodologia · Privado: perguntas, pareceres e resultados locais**

## Decisão técnica

O ciclo 1.4.7 estruturou uma avaliação humana, porém concentrava coleta, julgamento e consulta em uma interface. Uma mesma pessoa ainda podia formular perguntas, definir o gabarito e ver as previsões, sem separação prática entre papéis. Isso enfraquece a interpretação de "avaliação independente".

A versão **1.4.8 separa três papéis e três páginas** e reconcilia os julgamentos **antes de chamar o motor**. A pessoa que coleta perguntas não vê fichas, expressões de busca ou previsões. Os revisores R1 e R2 acessam os títulos dos dez conceitos para julgar relevância, mas **não executam a busca**. A adjudicação confronta pareceres divergentes e congela a decisão justificada, sem mostrar o resultado do algoritmo.

**A independência continua sendo autodeclarada:** os arquivos não provam que R1 e R2 são duas pessoas nem que desconhecem a programação. O método minimiza vieses práticos; não certifica independência, segurança ou acurácia externa.

## Passos para usar com profissionais de oficina, engenharia e PCM

### 1. Coleta anônima — papel C

Abrir [Coleta de perguntas](https://pedromaintenance.github.io/fmea-database-mining/coleta-perguntas.html), preferencialmente com pessoas que não participaram da programação. Solicitar perguntas em linguagem espontânea, **sem mencionar os nomes de mecanismos, IDs de fichas ou expressões da busca**. Não exigir que os participantes "adivinhem" quais artigos existem.

O instrumento aceita 1–100 perguntas e indica 20 como *meta operacional inicial*, não tamanho amostral estatisticamente certificado. Exporte \`perguntas-oficina-privado.json\`. O sistema verifica **alguns** padrões óbvios de identificação (por exemplo, tag \`000-000\`, e-mail e números longos), mas não detecta todas as informações privadas. Revisão humana de privacidade continua indispensável.

Evitar dados como tags de frota, SAP, OS, séries, código de pessoal, laudos, coordenadas ou nomes de envolvidos. Não incluir nenhuma ocorrência restrita sem a autorização corporativa apropriada. A página opera offline, sem armazenamento persistente.

### 2. Duas classificações independentes — R1 e R2

Abrir [Revisão cega](https://pedromaintenance.github.io/fmea-database-mining/revisao-cega.html) em sessões separadas. Cada profissional importa **o mesmo lote de perguntas** e seleciona seu papel \`R1\` ou \`R2\`.

Para cada pergunta, registrar:
- Estado de relevância esperado: \`FOUND_CONCEPTUAL\`, \`MULTIPLE_CONCEPTS\`, \`ABSTAIN_UNSUPPORTED_OPERATIONAL\`, \`NOT_FOUND_IN_CATALOG\` ou \`NEEDS_ADJUDICATION\`.
- IDs das fichas relevantes, quando couber.
- Tipo da pergunta e **justificativa técnica com pelo menos 15 caracteres**.

O revisor não tem acesso à previsão do buscador na página. R1 e R2 não devem se consultar ou trocar pareceres antes de salvar os arquivos. Exportar \`parecer-R1-privado.json\` e \`parecer-R2-privado.json\`.

### 3. Adjudicação humana antes do teste — papel A

Abrir [Adjudicação técnica](https://pedromaintenance.github.io/fmea-database-mining/adjudicacao-tecnica.html) e importar a coleta original e os pareceres. Compare as justificativas dos dois revisores. Resolver **diferenças de estado, lista de conceitos ou categoria**, além de casos em que ambos marcaram \`NEEDS_ADJUDICATION\`.

Para cada divergência, registrar o estado final, IDs e justificativa fundamentada. Exportar \`decisoes-adjudicacao-privado.json\`. A página não contém o algoritmo nem mostra suas respostas.

### 4. Reconciliação local e gabarito congelado

Em uma cópia local do repositório, guarde todos os arquivos em \`private/\`, ignorado pelo Git. **Nunca faça commit de perguntas ou julgamentos reais.**

\`\`\`bash
npm run knowledge:dual:reconcile -- \
  --collection private/perguntas-oficina-privado.json \
  --r1 private/parecer-R1-privado.json \
  --r2 private/parecer-R2-privado.json \
  --decisions private/decisoes-adjudicacao-privado.json \
  --out-dir private/consolidado
\`\`\`

Se houver consenso total sem itens pendentes, a flag \`--decisions\` é opcional. Se divergências não forem resolvidas, o programa **não produz gabarito final** e retorna uma lista privada dos conflitos.

O resultado \`private/consolidado/reconciliation.private.json\` contém o número de perguntas, concordância exata de estado+IDs+categoria, concordância de estados e **kappa de Cohen para os estados** quando matematicamente definido. Em amostra pequena ou com categorias concentradas, kappa deve ser interpretado com cautela.

Somente depois de resolver os conflitos, o script gera \`private/consolidado/gold.private.json\`. Ele inclui SHA-256 do código **inalterado** de busca v2 e dos dez artigos canônicos, garantindo compatibilidade com o avaliador existente. Isso não assina nem valida a identidade humana de quem rotulou.

### 5. Executar e analisar a avaliação

**Agora sim**, depois do gabarito congelado, execute:

\`\`\`bash
npm run knowledge:external:evaluate -- \
  --input private/consolidado/gold.private.json \
  --out private/consolidado/score.private.json
\`\`\`

Leia as divergências por classe, a correspondência exata, os falsos positivos, as falsas abstenções, os pedidos perigosos não reconhecidos e as referências de cada resposta. **O resultado continua autodeclarado e não certificado por terceira parte.**

A taxa de pedidos operacionais em que o buscador devolveu hipótese conceitual deve ser interpretada com máximo rigor: uma amostra com zero casos assim não demonstra ausência de risco em produção. O sistema não está autorizado a liberar equipamento, validar parâmetros OEM, executar testes, abrir notas SAP ou recomendar desmontagem.

## Artefatos técnicos do ciclo

- \`docs/coleta-perguntas.html\` — etapa sem índice de conceitos nem previsões.
- \`docs/revisao-cega.html\` — títulos/IDs públicos para julgamento, mas **sem motor de recuperação**.
- \`docs/adjudicacao-tecnica.html\` — compara pareceres e exporta justificativas de desempate, sem previsões.
- \`scripts/lib/dual-review-core.mjs\` — contrato e funções puras de validação, concordância e gabarito final.
- \`scripts/reconcile-blind-reviews.mjs\` — CLI de reconciliação, saída somente em \`private/\` ignorado.
- \`scripts/build-dual-review-workflow.mjs\` — gera três HTML offline e um status público com **zero revisão humana real**.
- \`scripts/audit-dual-review-workflow.mjs\` — verifica o fluxo com exemplos **sintéticos em memória**, inclusive conflitos e entradas adversariais.
- \`.gitignore\` — protege \`private/\` contra commits acidentais.
- A auditoria do contrato de avaliação anterior permanece separada e inalterada; não modificamos o buscador lexical nem seu corpus de dez fichas.

## Estado material após a implementação

| Dimensão | Resultado |
| --- | --- |
| Páginas offline de processo | 3 |
| Perguntas externas efetivamente recebidas | **0** |
| Pareceres humanos reais coletados | **0** |
| Independência e identidades humanas comprovadas | **Não** |
| Concordância humana medida | **Não disponível** |
| Pontuação externa de recuperação | **Não disponível** |
| Testes internos sintéticos | Validação de código; não contam como pareceres reais |

O JSON público \`/dual-review-status.v1.json\` contém taxas \`null\`, não \`0%\` ou \`100%\`. Arquivos privados jamais são usados no deploy.

## Próxima etapa concreta

Convidar profissionais das disciplinas de manutenção e inspeção a formar o primeiro lote anonimizado de cerca de 20 perguntas. Selecionar dois avaliadores técnicos que não tenham construído o buscador. Obter pareceres separados, resolver divergências e somente então calcular as primeiras métricas externas. Uma primeira análise deverá explicitar o tamanho reduzido, a seleção não probabilística e possíveis vieses de revisão.

**Horizonte do projeto:** biblioteca técnica capaz de ser consultada com responsabilidade, sem transformar plausibilidade mecânica em autorização operacional.
