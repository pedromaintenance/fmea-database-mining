# Ciclo 1.4.5 — Arquitetura funcional e desafio de recuperação não calibrado

**07/11/2026 | Biblioteca técnica pública | Status: artefatos conceituais sujeitos a revisão**

## Decisão de engenharia de conhecimento
A biblioteca não pode depender apenas de verbetes isolados. O ciclo 1.4.5 organiza **função → componente → perda funcional possível → mecanismo físico → evidência discriminante → fonte**, sem afirmar causa observada em campo. O resultado é um grafo conceitual legível por humanos e por agentes.

### Grafo funcional: dois sistemas ilustrativos
| Modelo editorial | Componentes | Relações | Fonte estrutural |
| --- | ---: | ---: | --- |
| `SYS-HYD-IMPLEMENT`: circuito de implementos hidráulicos | 8 | 10 | `data/quality/hydraulic-circuit-differential.v1.json`, `genericCircuitGraph` |
| `SYS-BRG-LUBE`: conjunto de rolamento lubrificado | 5 | 5 | síntese editorial de fundamentos existentes e literatura SKF |
| **Total** | **13** | **15** | não representa esquema OEM por série |

**Na hidráulica**, foram preservados os IDs, as relações e a condição `conditional:true` da topologia já presente no repositório. Os componentes contemplam reservatório/alimentação, bomba/controle, piloto, válvula/regulação, retenção de carga, atuador, retorno/filtragem e instrumentação. Não há confirmação de número de bombas, portas de teste, válvulas efetivas nem pressão por número de série.

**No rolamento**, o modelo editorial separa eixo/interface de carga, contato rolante, mancal, óleo/graxa/suprimento e vedação. Diferentes montagens podem ser seladas, lubrificadas por graxa ou óleo e podem não possuir elementos externos representados no mesmo formato. O modelo não deve ser utilizado como desenho de montagem.

Cada componente possui: `requiredFunction`, `potentialFunctionalEffect`, `mechanismConceptIds`, `knowledgeRecordIds`, `evidenceQuestions`, `sourceIds` e indicadores explícitos de ausência de verificação em ativo. As referências bibliográficas vêm do registro público; não há validação de parâmetros ou efetividade OEM.

**Fontes âncora:** os registros existentes [Caterpillar — How to Inspect Your Cat Hydraulic System](https://www.cat.com/en_US/blog/hydraulic-system-inspection-steps.html) e [SKF — A basic guide to bearing housing selection](https://evolution.skf.com/en/a-basic-guide-to-bearing-housing-selection/) mais os demais registros SKF, Parker e CAT ligados diretamente nos nós. A bibliografia passou de 94 para **95** entradas; o novo material foi registrado como `SKF-BEARING-HOUSING-SELECTION`. Consulta dirigida não representa revalidação global de todas as fontes.

**Arquivos criados:**
- `data/knowledge/functional-architecture.v1.json` — grafo canônico JSON.
- `docs/arquitetura-funcional.html` — template offline do portal.
- `scripts/build-functional-architecture.mjs` — geração do HTML completo e JSON público sem servidor.
- `scripts/audit-functional-architecture.mjs` — verificação de IDs, topologia hidráulica original, vínculos de ontologia/bibliografia, links canônicos, HTML e ausência de aprovação real.

**Entregas públicas (após deploy):**
- `/arquitetura-funcional.html` — consulta de componentes e relações possíveis.
- `/arquitetura-funcional.v1.json` — grafo e projeções de fontes e verbetes para agentes.

## Segundo eixo: desafio de 24 perguntas não calibradas
A versão 1.4.4 obteve 50/50 num conjunto cujas perguntas e palavras-chave haviam sido desenvolvidas juntas. Essa pontuação não mede generalização. Neste ciclo foi produzido um conjunto *novo*, **posterior** à criação das regras lexicais, sem alterar a implementação congelada de `scripts/lib/fundamentals-retrieval.mjs` (Git blob `4d4356489691200c97c65b64660aaabc99fcfe3d`, commit-base `50caa628`).

A nova população contém **12 paráfrases conceituais**, **6 pedidos de decisão operacional sem evidência**, **4 perguntas que misturam mecanismos** e **2 fora do corpus de seis artigos**. Os rótulos esperados são definidos por interpretação editorial. Isso **não é julgamento humano cego, teste de modelo generativo, nem avaliação estatisticamente representativa de trabalhadores**.

Os arquivos `data/quality/fundamentals-unseen-challenge.v1.json` e `scripts/audit-fundamentals-unseen-challenge.mjs` produzem `reports/fundamentals-uncalibrated-challenge.generated.json`. É obrigatório registrar a **taxa real de correspondência estrita** e falhas individuais. A integridade exige que nenhuma questão perigosa receba resposta conceitual como se fosse liberação. Para essa linha de base, `NOT_FOUND_IN_CATALOG` também evita aconselhamento inseguro, mas **não equivale a correta detecção de risco**.

**Resultado medido pela CI, sem ajuste de regra:** 4/24 correspondências exatas (**16,7%**). As 12 paráfrases conceituais tiveram 0 correspondências exatas; quatro perguntas combinando mecanismos tiveram 0; entre seis pedidos operacionais, duas foram reconhecidas como `ABSTAIN_UNSUPPORTED_OPERATIONAL` e as outras quatro ficaram sem correspondência; as duas consultas fora do corpus foram corretamente indicadas como ausentes. **Zero dos seis pedidos operacionais recebeu resposta conceitual indevida** nesta amostra. O mecanismo lexical mostrou baixa cobertura e identificação incompleta de intenção operacional; não está pronto para responder sozinho a perguntas livres de campo.

**Não alteramos os aliases ou regex de segurança para elevar os pontos desse desafio.** Eventuais erros serão encaminhados como dívida de cobertura de recuperação para ciclos futuros. O índice curado passa de 21 para **23** entradas, incluindo arquitetura e desafio.

## Critérios de aceite e limites
- Todas as 15 conexões têm `conditional:true` e `flowConfirmed:false`; nenhuma série/ativo verificado.
- Links de mecanismo, verbete e bibliografia devem existir nos arquivos canônicos.
- Nenhum plano de manutenção, OS, SAP, dado corporativo restrito, valor de inspeção OEM ou autorização de uso é introduzido.
- A auditoria pode **passar com cobertura baixa no desafio de busca**: ela atesta fidelidade da medição, congelamento do algoritmo e ausência de vazamento para conselho operacional; a qualidade da recuperação é exibida como resultado, não maquiada.
- Integração no Pages usa apenas conteúdo público e gera páginas offline com JSON embutido.

## Próximo ciclo técnico recomendado — 1.4.6
1. Reavaliar o desafio por especialistas ou usuários externos ao conjunto de desenvolvimento, sem revelar aliases, coletando erros de compreensão e formulação.
2. Projetar **busca semântica read-only** que amplie cobertura, mas preserve abstenções, citações canônicas e fronteiras de aplicabilidade.
3. Completar lacunas de funções sem verbete: alimentação piloto, retenção/sustentação de cargas, atuadores e instrumentação; e aprofundar vedações e apoio estrutural de rolamentos.
4. Avaliar impacto de cada ampliação em um conjunto efetivamente retido e não usado para calibração, reportando ganhos e falhas novos.
5. Consolidar esquema de comparação quantitativa industrial somente com unidade, população, período, denominador, método e licença.

**Norte:** um mapa de perguntas e evidências útil a engenheiros e agentes, sem atribuir falsa autoridade a inferências conceituais.
