# Ciclo 1.4.2 — Inventário semântico reproduzível e primeira ficha técnica fundamental

**05/11/2026 · Biblioteca de engenharia de manutenção**

## Por que este ciclo existe
O inventário da versão 1.4.1 comprovou a existência de 500 arquivos no commit examinado, mas não explicava que informações técnicas cada dataset guarda nem quais fontes sustentam seus registros. O objetivo do ciclo 1.4.2 é melhorar a capacidade de **encontrar e conferir informação existente**, não produzir mais exercícios de falha.

## Entregas realizadas
1. **Mapa semântico de dados estruturados**: o comando \`npm run knowledge:atlas:build\` percorre \`data/knowledge\`, \`data/quality\`, \`data/ontology\`, \`data/research\`, \`data/governance\`, \`data/catalog\` e \`data/cases\`. Ele produz \`reports/semantic-atlas.generated.json\` com schema, versão, status/natureza declarados, coleções e contagens, vínculos de fonte explícitos, itens não resolvidos pelo registro bibliográfico e hashes SHA-256 para duplicações **exatas de bytes**. Não tenta inferir corretamente a engenharia por um nome de arquivo.
2. **Portal interativo gerado**: \`reports/mapa-semantico.generated.html\` é um HTML standalone com o índice embutido. O GitHub Pages disponibiliza o arquivo em \`/mapa-semantico.html\` e o JSON correspondente em \`/semantic-atlas.v1.json\`. A página \`docs/mapa-semantico.html\` é o **template vazio**; o gerador produz a página completa. A busca é totalmente local no navegador.
3. **Contrato de ficha de engenharia**: \`schemas/technical-knowledge-record.schema.json\` (JSON Schema draft 2020-12) introduz campos de função, mecanismo físico, sintomas, efeito funcional, hipóteses concorrentes, evidências discriminantes, fontes, ontologia, limites e segurança. A estrutura exige \`CONCEPTUAL\`, \`PENDING_REVIEW\`, zero modelos/séries verificados e ausência de aprovação operacional/SAP ou diagnóstico automático.
4. **Primeiro verbete fundamental**: \`data/knowledge/fundamentals/hydraulic-inlet-restriction.v1.json\` discute restrição de sucção e ingresso de ar na alimentação hidráulica, cruzando as três hipóteses de \`HC-DIFF-01\` com \`ME-12\` e \`ME-08\` como referências conceituais. Três fontes gerais Caterpillar já presentes no registro bibliográfico são ligadas por IDs; **nenhuma delas certifica o comportamento de uma máquina ou série específica**.
5. **Rastreabilidade e regressão**: a auditoria \`scripts/audit-technical-knowledge-record.mjs\` valida a ficha com o contrato estrito, confirma o caso e as fontes, rejeita falsas aprovações e verifica paridade entre atlas JSON e HTML. É executada na CI, em conjunto com o catálogo anterior.

## O que o atlas consegue — e o que não consegue
| Recurso | Evidência disponível | Interpretação correta |
| --- | --- | --- |
| Schema, versão, natureza | Campos declarados no JSON | Metadados autoexplicativos; não confirmação externa |
| Perfil (\`profile\`) | Caminho, natureza e estrutura | Grupo editorial aproximado |
| Tópico (\`topicHint\`) | Nome do arquivo | Indício heurístico; pode estar errado |
| \`sourceIdsResolvedInRegistry\` | Associação a ID existente na bibliografia | Vínculo identificado, não fonte original checada |
| \`sourceIdsNotInRegistry\` | ID explícito não encontrado na bibliografia | Pista para revisão de modelo de dados; não prova de erro |
| Duplicações de SHA-256 | Bytes idênticos | Duplicação binária; não identifica paráfrases |
| Ausência de \`sourceIds\` | Nenhum campo reconhecido | Não implica falta de fontes nem invalidade do material |

O gerador é determinístico para o mesmo conjunto de arquivos, ignora artefatos \`*.generated.*\` e **não faz requisições de rede**. Os arquivos do atlas representam uma fotografia do branch no momento do build, não um catálogo eternamente atualizado.

## Hipótese técnica do primeiro verbete
Uma manifestação de lentidão em várias funções pode resultar de alimentação/sucção, comando da bomba ou regulação. A hipótese de ar admitido ou cavitação **não** é causa confirmada. O documento só indica questões de observabilidade e documentação; não prescreve ensaio em equipamento, não publica pressão/vazão limite e não transfere procedimento de outro modelo.

## Critérios de aceite
- O gerador cria o JSON e a página HTML na mesma execução sem inconsistência.
- A ficha segue o schema e referencia apenas IDs realmente existentes no registro e caso de origem.
- Todos os modelos/séries permanecem não verificados, medições e aprovações em zero.
- Nenhuma alteração em SAP, ordens de serviço, consumidores ou limites operacionais.
- O Pages entrega o atlas pronto para consulta, e os dados canônicos continuam versionados no GitHub.

## Próximas pesquisas recomendadas (1.4.3+)
1. **Curadoria semântica de verdade**: revisar manualmente grupos de arquivos de maior valor, eliminando duplicidades de conteúdo, reconhecendo artefatos derivados de simuladores e mapeando relações função→componente→mecanismo.
2. **Novas fichas fundamentais**: degradação de filme lubrificante, cavitação vs. aeração, falha de vedação, perda de pré-carga, falha de rolamentos, resfriamento e mecanismos de freio/direção, cada uma com citações e discriminação.
3. **Recuperação avaliada**: 50 perguntas técnicas de referência, com negativos e consultas difíceis. Medir fonte correta, limites e rejeições.
4. **Benchmarks quantitativos reais**: formular contrato de métrica, denominador, população e período **antes** de registrar números.
5. **Interoperabilidade MCP read-only**: explorar somente depois de estabilizar o contrato de fonte e uma política de privacidade rigorosa.

**Norte de qualidade:** cada novo dado deve aumentar a capacidade de responder uma pergunta concreta com fonte, definição e limite de validade; não basta aumentar contagens.
