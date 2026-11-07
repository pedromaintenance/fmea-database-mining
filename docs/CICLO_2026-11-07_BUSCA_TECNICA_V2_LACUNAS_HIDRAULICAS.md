# Ciclo 1.4.6 — Cobertura hidráulica funcional e busca lexical de conceitos v2

**07/11/2026 · Biblioteca técnica pública de engenharia de manutenção**

## Contexto e decisão

A versão 1.4.5 revelou que o roteador lexical congelado só acertou **4/24** consultas reformuladas, contra **50/50** perguntas curadas conjuntamente com as regras da 1.4.4. O resultado de 4/24 foi deliberadamente preservado sem ajustes. Nesta versão, o desafio de 24 perguntas passa a ser um **conjunto conhecido de desenvolvimento**: qualquer comparação subsequente com essas perguntas está sujeita a contaminação por conhecimento prévio e NÃO mede generalização a exemplos externos.

O ciclo trata dois problemas concretos: (a) lacunas de fichas fundamentais em quatro nós hidráulicos e (b) recuperação pouco flexível de perguntas técnicas em português. Não foi implantado modelo de linguagem, API de IA, embedding, RAG, MCP servidor nem mecanismo de decisão operacional.

## Novas fichas fundamentais

| ID | Componente funcional | Mecanismo e principal distinção |
| --- | --- | --- |
| `TK-HYD-PILOT-001` | N-PIL: Comando e alimentação piloto | Sinal piloto, comando direcional, lógica/intertravamento e hipótese concorrente de falta de suprimento |
| `TK-HYD-HOLD-001` | N-HLD: Retenção e sustentação de carga | Contrabalanço versus retenção, vazamento em válvula versus atuador; **risco grave de movimento involuntário** |
| `TK-HYD-ACTUATOR-001` | N-ACT: Atuador hidráulico | Fuga interna do cilindro versus perda de comando, variação de carga ou defeito mecânico |
| `TK-HYD-SENSORS-001` | N-SEN: Instrumentação e eletrônica | Falha física do processo versus alimentação/sinal de sensor, ECM, fiação e intertravamentos |

Os quatro registros são `CONCEPTUAL`, `PENDING_REVIEW`, com hipóteses concorrentes explicitamente não confirmadas. Não possuem dados de teste, série verificada, parâmetros de aceitação, autorização operacional ou alteração SAP. O contrato `technical-knowledge-record.v2.schema.json` preserva compatibilidade com os registros de 1.4.3/1.4.4 e permite o identificador de versão 1.4.6.

O **mapa funcional** foi ampliado de seis para **dez vínculos de fichas**; seus dois sistemas, 13 componentes e 15 conexões condicionais permanecem os mesmos. Os quatro nós hidráulicos que antes não tinham ficha agora apontam para conteúdo conceitual: **zero nós hidráulicos sem ficha ligada**. Isso é cobertura do mapa editorial, não diagnóstico certificado da frota.

## Revisão bibliográfica — duas novas referências

O registro de fontes foi de 95 para **97**:
- [Danfoss — Directional control valves](https://powersource.danfoss.com/products/hydraulic-valves/cartridge-valves/directional-control-valves): conceito de válvulas com pilotagem hidráulica, opções de acionamento manual/solenoide e variação por configuração. NÃO comprova que uma válvula Danfoss específica esteja instalada na frota ou define pressão piloto OEM para outro modelo.
- [Parker — E2 Series Counterbalance Valve](https://discover.parker.com/e2-series-counterbalance-valve): princípio de contrabalanço, assistência piloto e controle de cargas que tendem a acelerar. NÃO autoriza ajustes em válvulas de outra família.

Reutilizamos `CAT-HYD-TECHNICAL-ANALYSIS`, `CAT-HYD-CIRCUIT-INSPECTION` e `PARKER-CYL-DRIFT-SERVICE` do registro bibliográfico existente. A inclusão de duas fontes **não é revalidação global** das 97 referências.

**Alerta importante:** nenhuma instrução de pressionar, isolar ou desconectar linhas foi transformada em passo de execução de oficina. Válvulas de carga podem aprisionar energia e seu ajuste requer competência e procedimento OEM específicos. As hipóteses não autorizam levantamento de carga, liberação de máquina ou desativação de segurança.

## Busca técnica v2 — novo mecanismo, sem remover o baseline

Arquivos:
- `scripts/lib/technical-discovery-v2.mjs`: correspondências léxicas e expressões de conceito para **dez** fichas, com normalização de texto, hipóteses concorrentes e precedência de recusa operacional; **não é uma IA semântica treinada**.
- `scripts/query-technical-v2.mjs`: CLI `npm run knowledge:search:v2 -- --query "Qual a diferença entre cavitação e aeração?"`.
- `docs/consulta-tecnica.html`: template offline; `scripts/build-technical-search-v2.mjs` gera `reports/consulta-tecnica.generated.html` embutindo os mesmos dados, as referências e o código de busca da CLI.
- `reports/technical-search-v2-bundle.generated.json`: dados públicos de consulta para agentes, com `__path` canônico e fonte declarada.
- `scripts/audit-technical-search-v2.mjs`: valida 24 perguntas **já vistas no ciclo anterior** e seis provas adicionais de decisão operacional, verificando fontes, HTML e integridade da busca; publica `reports/technical-search-v2-report.generated.json`.

O algoritmo retorna `FOUND_CONCEPTUAL`, `MULTIPLE_CONCEPTS`, `NOT_FOUND_IN_CATALOG` e `ABSTAIN_UNSUPPORTED_OPERATIONAL`. O último não equivale a decisão de segurança aprovada; uma pergunta não reconhecida pode escapar à lógica de risco. Mesmo em caso de correspondência, os resultados só apontam documentos candidatos. Não se infere causa raiz, probabilidade, gravidade, parâmetro CAT/Sandvik ou necessidade de substituição.

### Interpretação metodológica dos resultados

O relatório compara a linha de base congelada com a nova busca no conjunto de 24 questões **que inspirou o desenvolvimento desta versão**. Melhor resultado indica adequação a esse conjunto conhecido, não robustez em perguntas desconhecidas. Se nenhuma pergunta perigosa dessa amostra receber retorno conceitual, isso é uma verificação de regressão, **não prova de segurança geral**. A validação profissional ainda necessita perguntas de operadores e especialistas independentes, com rotulagem cega e revisão de respostas.

## Publicação e critérios

Páginas e dados, após validação do PR e workflow:
- `/consulta-tecnica.html` — navegador offline, sem chamadas de rede, persistência ou envio de consulta.
- `/technical-search-v2-bundle.v1.json` — registros e bibliografia para acesso por agentes.
- `/technical-search-v2-report.v1.json` — desempenho real de desenvolvimento e verificações de risco.
- `/arquitetura-funcional.html` — quatro nós hidráulicos com fichas ligadas.
- `/fundamentos-hidraulica-tribologia.html` — dez artigos pesquisáveis.

O CI exige: schema e fontes, todas as hipóteses não confirmadas, nenhuma homologação/OS, arquitetura condicional, paridade HTML/JSON, execução da regressão lexical antiga **sem alteração do script congelado**, e zero respostas conceituais para seis probes de risco explicitamente selecionadas. A medição de cobertura não deve ser apresentada como validação de produção.

## Próximo ciclo: 1.4.7

Criar um conjunto externo de perguntas coletadas sem acesso às regras; revisar os resultados por profissionais de manutenção, incluindo falsos positivos. Estudar busca híbrida com recuperação lexical e vetorial, sempre com contexto OEM, fonte, grau de confiança e abstenção. Medir resultados por **tipo de pergunta, qualidade de fonte e gravidade de decisão**, não somente por contagem de correspondência.

**Regra central:** o portal organiza e encontra conhecimento. A decisão técnica sobre um equipamento requer documentação efetiva e responsabilidade humana.
