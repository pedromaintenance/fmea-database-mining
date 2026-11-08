# Ciclo 1.4.10 — Controle de execução do piloto de manutenção

**08/11/2026 · Objetivo: ativar a coleta real com gates verificáveis sem alegar que ela aconteceu**

## Decisão de execução

Os ciclos 1.4.7–1.4.9 construíram protocolo, coleta offline, duas revisões técnicas cegas, adjudicação e um kit de campo. Faltava um **controle de execução compartilhável entre sessões**, com pendências operacionais visíveis e transições que impedissem interpretar uma parte do fluxo como piloto concluído.

A versão 1.4.10 publica o [Controle de execução do piloto](https://pedromaintenance.github.io/fmea-database-mining/controle-piloto.html), com os **11 gates da especificação 1.4.9 preservados**, papéis responsáveis e um JSON que pode ser exportado localmente, transferido por meios autorizados e reimportado em outra sessão. Não existe API externa, cadastro de participantes, armazenamento persistente nem coleta de perguntas neste painel.

**Nenhuma marcação realizada no painel é evidência certificada.** Ela representa exclusivamente o que seu operador declara ter verificado. O sistema não consegue confirmar uma autorização de chefia, identificar indivíduos, verificar a efetividade de uma avaliação ou homologar um procedimento OEM.

## Evolução das fases

As etapas do projeto agora são explicitamente condicionadas:

| Fase | Gates exigidos | O que representa |
| --- | --- | --- |
| Organização de coleta | G01 | Coordenação declara ter obtido autorização; não prova autorização corporativa |
| Revisão cega | G01–G04 | Coleta espontânea, privacidade e configuração técnica declaradas |
| Pontuação local | G01–G08 | Pareceres separados, adjudicação e custódia declarados |
| Interpretação | G01–G09 | Pontuação local declarada como realizada |
| Resumo público | G01–G11 | Interpretação e autorização de comunicação declaradas |

Se uma etapa posterior for marcada sem seus pré-requisitos (ex.: G09, pontuação, antes de G07, adjudicação), o controle retorna \`INCONSISTENT_SEQUENCE\`. Não oculta as contradições nem inventa conclusões. O estado de qualquer fase satisfatória carrega o sufixo \`SELF_ATTESTED\`, mesmo quando todos os onze itens estão marcados. Não existe estado \`CERTIFIED\` ou \`OPERATING_APPROVED\`.

O gate G04 (fingerprint antes de classificar) e outros classificados como “automated” na especificação só podem ser assinalados depois de uma **verificação realmente executada**. O aplicativo não altera os flags automaticamente nem presume acesso a servidores, arquivos humanos, SAP, sensores ou OEM.

## Arquivos e operações

- \`docs/controle-piloto.html\` — interface standalone; cada gate exibe papel, critério, tipo de evidência e status.
- \`scripts/lib/pilot-readiness-core.mjs\` — funções puras para avaliar integridade, estados de fase, requisitos ausentes e contradições.
- \`scripts/build-pilot-gates.mjs\` — incorpora o checklist canônico e hashes SHA-256 do buscador e das dez fichas no HTML offline e no bundle público.
- \`scripts/check-pilot-gates.mjs\` — reproduz a avaliação de flags exportados localmente, recusando dados em caminhos rastreados pelo Git.
- \`scripts/audit-pilot-gates.mjs\` — testa fases, inconsistências, mudanças de hash, entradas falsificadas, paths públicos, sobrescritas e links simbólicos com casos **sintéticos** que não entram na avaliação de trabalhadores.
- \`reports/pilot-gates-public-status.generated.json\` — estado público sem declarações reais (\`NO_MANUAL_ATTESTATIONS\`), métricas e identidade nulas.

### Usar o painel durante a preparação

1. Abrir o [Controle de execução do piloto](https://pedromaintenance.github.io/fmea-database-mining/controle-piloto.html).
2. Consultar os 11 critérios com a pessoa responsável por cada fase. Marcar apenas aqueles efetivamente verificados por meios organizacionais autorizados.
3. Salvar \`controle-piloto-privado.json\` ao terminar a sessão. Mover o arquivo para um local privado apropriado, não para o repositório público.
4. Na sessão seguinte, importar esse JSON e confirmar se o ambiente continua na mesma versão de código e corpus. Arquivos com fingerprints divergentes são rejeitados para evitar pontuação em versão diferente.
5. Antes de qualquer pontuação, conferir G01–G08, a inexistência de contradições e a documentação dos pareceres cegos, além de confirmar que a organização autorizou a atividade.
6. Apenas depois de gabarito humano congelado, usar \`knowledge:dual:reconcile\` e \`knowledge:external:evaluate\` com arquivos reais mantidos em \`private/\`.

A linha de comando permite reproduzir somente a **checagem de declarações**, em ambiente local:

~~~bash
npm run knowledge:pilot:gates -- \
  --input private/controle-piloto-privado.json \
  --out private/controle-checado.json
~~~

Esse comando devolve estados e pendências; **não valida a prova humana que deveria sustentar cada marcação**. A saída fica em \`private/\`, não pode substituir arquivo preexistente nem atravessar symlinks. Sem \`--input\`, a ferramenta só mostra o estado inicial de um checklist vazio, sem criar resultados fictícios.

## Segurança do dado e protocolo

O dashboard é estritamente **sem perguntas**, campos de nomes ou notas livres. Só exporta onze booleanos, versão e hashes da base. Isso minimiza exposição e dificulta introduzir incidentalmente relatos de acidentes ou dados da frota.

As interfaces existentes de coleta de perguntas, revisão R1/R2 e adjudicação permanecem separadas da busca lexical. O motor v2 e os dez fundamentos continuam congelados. A futura avaliação humana permanece autodeclarada; três páginas públicas não demonstram que três pessoas independentes participaram.

A publicação por GitHub Pages inclui somente a interface vazia, a definição dos gates e o status \`NO_MANUAL_ATTESTATIONS\`. Não publica declarações, perguntas, pareceres ou pontuações de participantes.

## Estado material desta entrega

- **Perguntas reais coletadas:** zero.
- **Revisores reais participantes:** zero.
- **Declarações de execução recebidas:** zero.
- **Acurácia externa:** não disponível.
- **Autorização institucional:** não confirmada por este repositório.
- **Capacidade entregue:** checklist com estados, JSON de retomada, assinatura por fingerprint da versão do mecanismo/corpus, verificação local e auditoria adversarial.

Não é apropriado abrir um novo ciclo de otimização lexical com base nos 24 exemplos conhecidos, nem simular avaliações humanas, antes da primeira coleta real.

## Próxima ação concreta

Designar coordenação e responsáveis pelos gates G01–G04, autorizar e realizar a coleta anônima, transferir o mesmo lote para R1 e R2 sem compartilhar pareceres e executar a adjudicação antes da pontuação. Em seguida, revisar a matriz de erros, com atenção especial a casos de **abstenção ausente em decisão de segurança**. A seleção inicial de cerca de 20 questões é apenas de conveniência operacional, não constitui inferência estatística para a frota.

**Regra de autoridade:** nenhuma checklist, ficha conceitual ou busca read-only autoriza manutenção, ajuste, teste ou liberação de uma máquina sem procedimento OEM e avaliação humana competente.
