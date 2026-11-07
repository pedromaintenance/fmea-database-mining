# Ciclo 1.4.3 — Fundamentos hidráulicos e tribologia por evidência

**Data da revisão: 07/11/2026 · Escopo público e conceitual · Revisão independente ainda pendente**

## Decisão editorial

A missão da FMEA Database é construir um **acervo técnico pesquisável por humanos e agentes**, do qual análises FMEA, diagnóstico diferencial, PCM e treinamentos possam derivar. Neste ciclo, a ampliação veio pelo estudo de três mecanismos físicos e pela separação entre eles, não pelo aumento de testes sintéticos.

| Tema | Mecanismo físico a investigar | Por que a distinção importa |
| --- | --- | --- |
| Cavitação | Formação transitória e colapso de cavidades de vapor em condições desfavoráveis de pressão local | Ruído e desempenho reduzido não provam cavitação, nem confirmam bomba danificada |
| Aeração | Ar livre entranhado no óleo, com resposta volumétrica mais compressível | Entrada de gás, espuma e ruído não são sinônimos de cavitação por vapor |
| Abrasão por partículas | Remoção de material por partículas/asperezas em contato e possíveis indentações/fadiga superficial | Resultado ISO 4406 ou partícula coletada não identifica sozinho o componente danificado |

A nomenclatura da ontologia preexistente possui `ME-08 — Erosão/cavitação`; **esse agrupamento é amplo demais para funcionar como identidade de mecanismo único**. As novas fichas distinguem aeração e cavitação por definição, hipóteses concorrentes e limites. A ontologia original não foi alterada automaticamente.

## Pesquisa, procedência e limites

Foram incorporadas **três novas entradas ao registro de bibliografia**, ampliando o total de 87 para 90, com data de consulta registrada:

- **Parker P1/PD A-Mod, boletim HY28-2665-02/SVC/EN (2019), p. 46** — [manual oficial em PDF](https://www.parker.com/content/dam/Parker-com/Literature/Hydraulic-Pump-Division/P1-PD-18cc-140cc-Service-Manual.pdf). Diferencia ar no fluido, cavitação no grupo rotativo, desalinhamento e falha mecânica como hipóteses concorrentes de ruído de bomba. **Aplica-se à família Parker citada, não a uma CAT por extrapolação.**
- **Parker, The Handbook of Hydraulic Filtration, p. 11** — [manual oficial em PDF](https://www.parker.com/content/dam/Parker-com/Literature/EMHFF/Miscellaneous/HTM-4.pdf). Distingue ar dissolvido de ar livre e discute consequências da compressibilidade e de espuma no fluido. **Não fornece limites OEM por equipamento.**
- **Bosch Rexroth, Failures — causes and advices** — [página pública do fabricante](https://www.boschrexroth.com/en/pl/service-and-support/service/repairs/failures-causes-and-advices/). Apresenta exemplos de partículas em folgas de unidade hidráulica e de exigência de sucção/viscosidade específica. **A ficha da bomba efetiva continua indispensável.**
- **SKF, Wear and surface fatigue in rolling bearings (2019)** — [artigo público](https://evolution.skf.com/en/wear-and-surface-fatigue-in-rolling-bearings/), já presente no registro de fontes. Discute contaminação abrasiva, mudança de microgeometria, deslizamento e fadiga superficial em rolamentos. Não é taxa de falha de frota nem parâmetro para toda transmissão ou bomba.
- **ISO 4406:2021** — [registro bibliográfico](https://www.iso.org/standard/79716.html) já presente no repositório. Pertinente à codificação da contaminação por partículas; **não** demonstra causalidade mecânica nem define limite universal.

As fichas são **sínteses autorais originais e sujeitas à revisão humana**, com o campo `sourceNotes[].supports` e a ressalva `doesNotSupport`. Nenhum texto de manual foi republicado integralmente. Não foram introduzidos valores universais de pressão, cavitação, viscosidade, contaminação, MTBF ou confiabilidade.

## Dados e ferramentas adicionadas

1. `schemas/technical-knowledge-record.v2.schema.json`: novo contrato **extensível** com referências e âncoras por assunto. Preserva integralmente o contrato v1 (1.4.2), específico do primeiro verbete.
2. `data/knowledge/fundamentals/hydraulic-cavitation.v2.json`: `TK-HYD-CAVITATION-001`.
3. `data/knowledge/fundamentals/hydraulic-aeration.v2.json`: `TK-HYD-AERATION-001`.
4. `data/knowledge/fundamentals/particulate-abrasive-wear.v2.json`: `TK-TRIB-ABRASION-001`.
5. `docs/fundamentos-hidraulica-tribologia.html`: template estático; `scripts/build-fundamentals-portal.mjs` gera HTML offline completo e `reports/fundamentals.generated.json` para máquinas, ambos derivados do conteúdo canônico.
6. `scripts/audit-foundational-research.mjs`: testes de schema v2, integridade de fontes e IDs da ontologia, comparações e mutações adversariais que tentam inserir resultados falsos.
7. Índice curado atualizado de 15 para **18 itens**. A bibliografia visível no Pages passou a **90 fontes**; a publicação automática inclui o novo portal e o JSON.

## Ação e critérios de segurança

- Não confundir **hipótese plausível** com causa imediata ou causa raiz confirmada.
- Não confundir código de partículas e desempenho relatado com **dano mecânico comprovado**.
- Não usar catálogo comercial ou manuais Parker/Skf como limite de pressão, desgaste, limpeza ou manutenção de modelos CAT/Sandvik sem documento efetivo.
- Não propor ensaio hidráulico pressurizado sem liberação formal e instrução OEM por série.
- Oito gates privados e exceções PM×SAP existentes permanecem sem promoção de maturidade e sem alterações.

## Próxima prioridade técnica

1. Revisar independentemente as três fichas e corrigir eventuais generalizações.
2. Expandir fundamentos em **contaminação de óleo, filme lubrificante e fadiga de contato** com fontes primárias e evidência discriminante.
3. Testar a recuperação com perguntas que exigem rejeição segura, por exemplo: *“Ruído confirma cavitação?”*, *“Espuma exige trocar bomba?”* e *“Código ISO 4406 identifica qual rolamento falhou?”*.
4. Criar matriz de cobertura por **função → mecanismo → sintoma → evidência → fonte**, contando fichas tecnicamente úteis, não scripts gerados.

**Publicação no Pages e CI demonstram integridade dos artefatos, não validação do projeto de uma máquina real.**
