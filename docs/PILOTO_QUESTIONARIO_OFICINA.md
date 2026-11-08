> **Atualização 1.4.10:** agora há um [controle standalone dos onze gates](controle-piloto.html), com exportação/importação de declarações privadas, verificação de hashes e bloqueio de sequência incoerente. Consulte [o relatório do ciclo](CICLO_2026-11-08_CONTROLE_EXECUCAO_PILOTO.md). O controle não constitui autorização organizacional, comprovação de identidade, registro de participantes ou liberação operacional. Nenhum avaliador humano participou até esta versão.

# Ciclo 1.4.9 — Preparação do piloto de perguntas de manutenção

**08/11/2026 · Pacote de aplicação real pronto; participantes ainda não recrutados · Nenhuma avaliação externa realizada**

## Problema resolvido

A versão 1.4.8 disponibilizou três interfaces de avaliação independentes, mas **não tinha um roteiro de campo executável e possuía riscos de custódia de dados**: (1) reaproveitar diretório de saída do reconciliador poderia deixar gabarito antigo em uma pasta depois de uma tentativa com conflitos; (2) o avaliador externo aceitava gravar perguntas e respostas humanas em diretórios potencialmente públicos; (3) duas declarações de revisão não cega podiam alcançar o caminho de emissão do gabarito. O ciclo 1.4.9 corrige os três pontos e prepara a primeira aplicação com colaboradores.

## Protocolo de execução, por responsável

| Etapa | Papel | Entrega | Gate operacional |
| --- | --- | --- | --- |
| Autorizar e organizar | Coordenador de piloto | Autorização interna e participantes informados do propósito | G01 |
| Coletar sem induzir | Facilitador que não alterou o mecanismo | Perguntas escritas espontaneamente | G02 |
| Remover material restrito | Facilitador e responsável técnico | Lote anônimo, sem tags, códigos ou pessoas | G03 |
| Congelar mecanismo | Responsável técnico | SHA-256 do código e dos dez artigos | G04 |
| Julgar R1 | Primeiro revisor | IDs relevantes, classe, justificativa | G05 |
| Julgar R2 | Segundo revisor | Julgamento separado, sem acesso a R1 | G06 |
| Adjudicar | Terceiro papel, preferencialmente | Resolução justificada dos conflitos | G07 |
| Proteger arquivos | Responsável técnico | Todos os arquivos de pessoas em \`private/\` | G08 |
| Medir depois | Responsável técnico | Pontuação e erros por classe com denominadores | G09 |
| Interpretar | Engenharia + revisores | Distinção entre erro de busca e limite de fonte/OEM | G10 |
| Publicar (se autorizado) | Coordenador | Somente agregado autorizado e desidentificado | G11 |

Os gates são definidos em \`data/quality/field-pilot-readiness.v1.json\`. Alguns são verificáveis por CI ou CLI; os demais dependem de seres humanos e **não podem ser marcados como concluídos automaticamente**.

A meta inicial de **20 perguntas** é apenas uma escolha operacional de piloto para obter casos de discussão. Não é seleção probabilística, cálculo de poder, amostra representativa ou limiar suficiente para certificar uma ferramenta.

## Ferramentas disponíveis para o campo

1. [Folha do piloto em HTML imprimível](https://pedromaintenance.github.io/fmea-database-mining/piloto-oficina.html): instruções breves, roteiro de facilitação, checklist e formulário vazio. A página não armazena ou envia respostas.
2. [Coletor digital de perguntas](https://pedromaintenance.github.io/fmea-database-mining/coleta-perguntas.html): 1–100 perguntas por lote; exportação de JSON local sem palavras-chave da busca.
3. [Parecer R1 e R2](https://pedromaintenance.github.io/fmea-database-mining/revisao-cega.html): julgamento de relevância e justificativa sem previsões da máquina.
4. [Adjudicação de discrepâncias](https://pedromaintenance.github.io/fmea-database-mining/adjudicacao-tecnica.html): registro documentado do desempate, sem execução do mecanismo.
5. Comandos locais: \`knowledge:dual:reconcile\` e \`knowledge:external:evaluate\`, **nessa ordem**.

Antes de aplicar, escolha um ambiente sem exposição de dados corporativos. Não grave nomes de participantes, matrículas, ordem SAP, número de série, laudo SOS, ID de ativo, relatos identificáveis ou informações sujeitas a sigilo. A detecção automática de certos padrões é incompleta: a anonimização depende de revisão humana.

### Abordagem sugerida ao trabalhador

> Estamos avaliando se uma biblioteca consegue encontrar explicações técnicas para perguntas de manutenção. Não é uma prova do seu conhecimento nem um diagnóstico da máquina. Escreva uma dúvida que você faria em uma oficina, com suas palavras, sem citar equipamentos, pessoas ou ocorrências específicas. A participação é voluntária e não precisa conter seu nome. Depois, outros profissionais avaliarão quais fontes seriam pertinentes, sem conhecer a resposta do sistema.

Evite sugerir termos como “cavitação” ou “fadiga de contato” antes que a pessoa formule a pergunta. Essa intervenção mudaria artificialmente a facilidade de recuperação.

## Controles técnicos implantados

**A. Gabarito não cego não deve ser emitido.** O contrato de dupla revisão agora recusa gabarito quando algum parecer declara ter consultado a resposta do motor, trocado opiniões com o outro revisor antes do congelamento, ou não ter revisado a privacidade. Declarações de “fora do desenvolvimento” falsas são permitidas exclusivamente para calibração interna, nunca interpretadas como validação independente.

**B. Diretório de saída deve ser novo e privado.** \`npm run knowledge:dual:reconcile\` exige subdiretório **inexistente** de \`private/\`, recusando sobrescrever uma pasta que poderia guardar um gabarito anterior. Bloqueia caminhos com links simbólicos e tentativas de gravar em locais rastreados.

**C. Resultados com perguntas humanas só podem ser gravados em \`private/\`.** A CLI de avaliação rejeita \`--input\` ou \`--out\` fora dessa área quando houver dados humanos. Sem \`--input\`, o comando continua gerando o relatório público com \`NO_EXTERNAL_SAMPLE\`, métricas \`null\` e zero participantes.

**D. Sem envio de dados.** As páginas HTML são offline/standalone, sem chamadas de rede e sem armazenamento persistente. Arquivos criados pelo navegador são responsabilidade do operador e devem ser transferidos apenas por meios autorizados. A página publicada não inclui respostas, listas de pessoas ou julgamentos.

**E. Regressão adversarial.** Novos testes end-to-end sintéticos exercitam saída nova, bloqueio de sobrescrita, conflito, ausência de gabarito, revisão que viu previsões, e rejeição de saída pública. Os resultados sintéticos não são apresentados como avaliações de pessoas.

## Interpretação e responsabilidades

Concordância bruta, concordância exata por ID e **kappa de Cohen** devem ser apresentados separadamente. Kappa é sensível à distribuição das categorias e pode ser de difícil interpretação em amostras pequenas e não representativas; não extrapolar uma faixa de classificação para garantia de qualidade operacional. O artigo [High Agreement and High Prevalence: The Paradox of Cohen’s Kappa](https://pmc.ncbi.nlm.nih.gov/articles/PMC5712640/) discute essas restrições. A referência [NIST — How To TREC](https://trec.nist.gov/howto.html) descreve o papel distinto do corpus, consultas, julgamentos de relevância e resultados dos sistemas; a iniciativa adota esse princípio, não suas certificações nem seu volume de avaliação.

Para uma pergunta operacional perigosa, **nenhuma ficha conceitual autoriza liberar equipamento**, testar válvula com carga suspensa, definir pressão de sistema por aproximação, abrir SAP ou transferir número de peça. Resultado de busca é apontador de literatura, não instrução OEM.

## Estado verificado neste ciclo

- Perguntas externas recolhidas: **0**.
- R1/R2 reais e adjudicadores participantes: **0**.
- Avaliações independentes concluídas: **0**.
- Concordância e acurácia externa: **não disponíveis (\`null\`)**.
- Questionário, revisão e auditoria de custódia: **implementados em código**, sujeitos às verificações da CI.
- Motor de recuperação: **inalterado em relação a 1.4.6** para permitir avaliação futura sem recalibragem.

## Próxima ação fora do repositório

Definir quem está autorizado a coordenar a aplicação, selecionar os revisores e distribuir a folha do piloto. Recolher as primeiras perguntas espontâneas, aplicar a revisão cega e retornar somente o **resumo agregado não identificável** ou, se houver permissão, um pacote privado e desidentificado para análise local. Nenhum dos resultados desse piloto é considerado existente antes da coleta.

**Meta material:** iniciar a medição real de recuperação sem expor o trabalhador, os dados da operação ou a autoridade técnica da manutenção.
