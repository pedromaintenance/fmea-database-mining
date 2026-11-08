# Ciclo 1.4.11 — Piloto congelado: quatro pacotes offline por papel

**08/11/2026 · Biblioteca técnica pública · Início da coleta humana: não realizado**

## Justificativa técnica

Uma avaliação de recuperação só é interpretável quando fica claro **qual algoritmo**, **qual corpus** e **qual ordem dos registros** estavam disponíveis na data da coleta. Os ciclos anteriores separaram o trabalho de coletor, revisores e adjudicação, mas as ferramentas públicas usavam links para o estado mais recente do GitHub Pages. Isso criava risco de uma alteração posterior no buscador ou nas dez fichas tornar a comparação irreproduzível.

O ciclo 1.4.11 congela a versão técnica **sem modificar o algoritmo v2 nem qualquer uma das dez fichas**. O bloqueio não é uma declaração abstrata: ele consulta os IDs de blob Git da base no commit de referência e falha caso o conteúdo de qualquer arquivo tenha mudado.

### Versão de referência

- Commit da biblioteca: **f8deaf9328dbad7e99d76ed265cbfd2dab944dae** (v1.4.10).
- Arquivo de travamento: **data/quality/pilot-frozen-baseline.v1.json**.
- Conjunto travado: **um mecanismo lexical de recuperação + dez artigos técnicos conceituais + o arquivo que define sua ordem e caminhos**.
- Para cada objeto: ID Git de conteúdo; na distribuição derivada: SHA-256 do arquivo individual e SHA-256 composto do corpus.
- Registros continuam **CONCEPTUAL**, **PENDING_REVIEW**, sem teste real, série verificada, limite de aceitação OEM ou decisão automática autorizada.

**Limite criptográfico:** SHA-1 de blob Git prova correspondência ao conteúdo conhecido do commit, não autoria humana nem segurança de equipamento. SHA-256 nos manifestos protege contra trocas não percebidas nos arquivos entregues, dependendo de como a origem do manifesto foi verificada. Nenhum hash comprova que R1 e R2 são pessoas distintas ou que uma avaliação foi realmente cega.

## Entrega pública: quatro arquivos fechados

| Pacote | Quem recebe | Conteúdo permitido | Bloqueio |
| --- | --- | --- | --- |
| **collector** | Facilitador/participante de coleta | Formulário de perguntas vazio e kit imprimível | Sem títulos/IDs de fichas e sem busca |
| **reviewer** | R1 e R2, separadamente | Página de julgamento com os 10 títulos e IDs, sem previsões | Não contém motor de recuperação |
| **adjudicator** | Responsável pelo desempate | Comparação de pareceres, registro de decisão fundamentada | Não contém motor de recuperação |
| **evaluator** | Responsável técnico, somente depois do gabarito | Interface de busca, 10 registros congelados, scripts de reconciliação e pontuação | Uso posterior à coleta/julgamento; arquivos de pessoas mantidos em \`private/\` |

Esses artefatos são arquivos \`.tar.gz\` estáticos, criados por \`scripts/build-frozen-pilot-packages.mjs\`. A produção usa lista explícita de arquivos por papel: **nunca copia o diretório \`private/\`**, nem os históricos de pergunta ou rótulo humano. Cada pacote contém \`index.html\`, \`README.txt\` e \`manifest.json\`.

O [portal de distribuição](https://pedromaintenance.github.io/fmea-database-mining/pacotes-piloto.html) mostra os quatro downloads. Para Windows, o comando \`tar -xzf pilot-collector-1.4.11.tar.gz\` descompacta o primeiro pacote; no diretório extraído, abra \`index.html\`. Não é necessária API, login, internet ou serviço de modelos para o uso das ferramentas locais.

### Reprodutibilidade

O arquivo \`pilot-frozen-release-index.v1.json\` expõe:
- versão e commit de referência;
- hash SHA-256 do algoritmo lexical;
- hash SHA-256 da concatenação estrutural ordenada dos dez registros com \`__path\` canônico;
- identificadores Git e hashes SHA-256 dos onze arquivos técnicos travados;
- SHA-256 e tamanho de cada \`.tar.gz\`;
- quatro papéis e a declaração \`containsRealHumanEvidence:false\`.

Os pacotes usam tar ordenado, proprietário/grupo zerados e timestamps normalizados, compactados com gzip determinístico. A auditoria extrai cada um, compara as listagens de arquivos a um manifesto explícito, confere todos os hashes e executa uma avaliação local em modo **sem perguntas**, que deve devolver \`NO_EXTERNAL_SAMPLE\`.

Se qualquer arquivo travado mudar, a geração falha. **Não reescrever esta linha de base para elevar a taxa de acerto** em um conjunto já coletado. Se houver necessidade de editar o motor ou as fontes, criar outro identificador de linha de base e relatar explicitamente a quebra de comparabilidade.

## Procedimento para o primeiro piloto real

1. **G01:** Obter autorização institucional específica e aceitar participação voluntária. Nenhum desses eventos pode ser concluído automaticamente pelo aplicativo.
2. Abrir apenas o **pacote de coleta** com os trabalhadores. Não apresentar exemplos de palavras-chave, títulos ou resultados de buscas. Remover nomes, tags, séries, OS, mensagens internas e ocorrências identificáveis.
3. Entregar aos revisores técnicos R1 e R2 o **mesmo lote de perguntas**, acompanhado apenas do **pacote reviewer**. Exigir classificação de relevância, justificativa e registro de limites; as decisões são independentes e anteriores a qualquer previsão.
4. Entregar o **pacote adjudicator** ao profissional responsável pelo desempate, sem lhe fornecer a saída do motor. Resolver e registrar todos os casos discrepantes ou indecididos.
5. Congelar e validar o gabarito com o **pacote evaluator** em equipamento local autorizado. Usar \`npm run reconcile\` e em seguida \`npm run evaluate\`. Respeitar o diretório \`private/\` e os checksums.
6. Interpretar separadamente cobertura conceitual, IDs de fonte, falsos positivos, abstenções indevidas e perigosas; explicitar denominadores, incerteza e natureza não probabilística da amostra.

O controle de prontidão 1.4.10 permanece útil, mas **não é uma liberação de campo**. Os onze gates autodeclarados só ajudam a organizar pendências. Confirmação de autorização e anonimização exigem responsáveis reais.

## Limites e resultados

- **Perguntas humanas externas recebidas:** zero.
- **Revisores externos que participaram:** zero.
- **Julgamentos cegos reais:** zero.
- **Teste independente de recuperação:** não realizado.
- **Acurácia externa:** \`null\`.
- **Alterações no motor v2:** nenhuma.
- **Alterações no corpus de dez fichas:** nenhuma.
- **Novo conteúdo técnico de mecanismo de falha:** nenhum; o avanço é de replicabilidade da avaliação.

A auditoria de software não deve ser apresentada como validação por OEM, aprovação de intervenção, teste em ativo da mina ou estatística representativa. A prioridade permanece **obter perguntas reais autorizadas** e não prolongar indefinidamente o desenvolvimento de ferramentas sem observações empíricas.

## Próxima decisão material

O passo seguinte depende da organização, não do software: identificar uma pessoa que coordene o piloto, verificar a autorização, distribuir os pacotes sem antecipar as previsões, coletar perguntas espontâneas e realizar a dupla revisão. Quando isso ocorrer, comparar a primeira taxa independente com os **18/24 em desenvolvimento** do ciclo 1.4.6, mas sem tratar amostras diferentes como comparação causal direta.

**Critério final:** o repositório prepara e preserva ferramentas; a engenharia e a manutenção continuam responsáveis por decidir se uma informação se aplica a um ativo e se é seguro intervir.
