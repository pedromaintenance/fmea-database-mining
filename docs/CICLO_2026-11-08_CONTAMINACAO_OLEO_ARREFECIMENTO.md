# Ciclo 1.4.13 — Contaminação cruzada entre lubrificação e arrefecimento de motores diesel

**Data: 08/11/2026 | Natureza: síntese bibliográfica conceitual | Escopo: manutenção e confiabilidade de motores, não diagnóstico de ativo**

## Problema material

Detectar uma película oleosa no reservatório de líquido de arrefecimento, indícios de glicol no óleo lubrificante ou queda do nível de refrigerante **não é a mesma observação**. O sintoma não identifica sozinho o mecanismo de falha nem sua causa raiz. Confundir essas evidências pode resultar em desmontagens desnecessárias ou na continuidade da operação com lubrificação e arrefecimento potencialmente comprometidos.

Funções requeridas: o circuito de óleo deve garantir a lubrificação e a remoção de calor dos componentes, e o circuito de arrefecimento deve controlar a condição térmica do motor. Interfaces como o trocador de calor, juntas e passagens internas dependem de sua configuração específica e da integridade da separação entre meios.

### Diferença entre os três estados de evidência

| Manifestação | O que pode ser observado | O que não se conclui |
| --- | --- | --- |
| **Óleo no refrigerante** | Película, resíduo, aparência anormal ou resultado analítico | Não comprova que o trocador ou a junta estejam defeituosos |
| **Refrigerante no óleo** | Indícios de água, glicol ou marcadores elementares no lubrificante | Sódio, potássio, FTIR e resultado isolado não atribuem uma peça |
| **Contaminação cruzada não confirmada** | Nível do coolant reduzindo, espuma, temperatura anormal | Não demonstra ingresso em outro circuito nem falha de cabeçote |

**Pressões locais dependem das condições de operação e parada.** É possível que a orientação do fluxo por uma interface defeituosa varie; não assumir uma direção universal para motores diesel. A literatura pública escolhida não estabelece o gradiente de pressão de nenhuma máquina da mina.

## Fontes consultadas e limites

1. **Caterpillar — [Engine Oil Cooler Core](https://parts.cat.com/en/catcorp/567-1565).** Confirma a função genérica de transferência térmica do trocador de óleo e a existência de construções com meio de arrefecimento separado. **Não comprova** que esse código de peça exista em determinado ativo, nem que a presença de resíduo confirme falha do núcleo.
2. **Donaldson — [Engine Liquid Filtration Product Guide, FAQ](https://ecatalog.donaldson.com/view/477967314/62/).** Relaciona perda de refrigerante a componentes como juntas, trocadores, radiadores, conexões e bloco; discute espuma, reposição e contaminantes do fluido. **Não atribui causalidade** a um componente de motor específico.
3. **Perkins — [Protecting your agricultural engine](https://www.perkins.com/en_GB/products/sectors/agriculture/protecting-your-agricultural-engine-essential-tips-and-tricks.html).** Trata sinais de mistura entre óleo e refrigerante como indícios a investigar, incluindo vedação do cabeçote. **Não estabelece diagnóstico** por aparência.
4. **Perkins — [Fluid sampling](https://www.perkins.com/en_GB/campaigns/powernews/global-focus/perkins-fluid-sampling.html).** Diferencia análise de óleo, coolant e combustível e descreve parâmetros físico-químicos do refrigerante. **Não substitui** análise de tendência e interpretação por compartimento.
5. **Noria / Machinery Lubrication — [Oil Analysis Tests to Detect Glycol Contamination](https://www.machinerylubrication.com/Read/30478/oil-analysis-tests).** Detalha a interpretação de glicol, sódio/potássio, FTIR e outras técnicas com possíveis interferências. É referência especializada de análise de fluidos, **não OEM** nem norma de condenação da frota.

Foram incorporados **cinco metadados de fontes** ao registro existente, agora com **105 referências**. Esse número é inventário bibliográfico, não quantidade de fontes integralmente auditadas neste ciclo. A revisão externa deste ciclo foi focada nesses cinco links; o restante do inventário não foi revalidado link a link.

## Diagnóstico diferencial, sem atribuição de causa real

| ID | Hipótese concorrente | Verificação documental que falta |
| --- | --- | --- |
| EC-COOLER-CORE | Comunicação entre fluido do motor e refrigerante no trocador | Esquema e tipo real de trocador; evidência técnica independente de estanqueidade |
| EC-HEAD-GASKET | Perda de vedação entre cabeçote, bloco e galerias | Geometria real e evidência específica da vedação |
| EC-CASTING | Fissura/porosidade em cabeçote ou bloco | Inspeção de integridade e exclusão fundamentada de alternativas |
| EC-BULK-CONTAMINATION | Fluido de abastecimento, serviço ou recipiente previamente contaminado | Cadeia de abastecimento, manutenção recente e amostra comparável do produto |
| EC-ANALYTICAL-INTERFERENCE | Falso indício ou interpretação inadequada de ensaio de óleo | Método, matriz, aditivos, interferências e teste confirmatório apropriado |
| EC-RESIDUAL | Resíduo após intervenção anterior; defeito ativo ainda não comprovado | Linha do tempo, condição da limpeza e tendência em amostras representativas |
| EC-NONCROSS-LOSS | Perda externa/espuma/anomalia de coolant sem contato com óleo | Confirmação analítica de contaminação e avaliação do sistema de arrefecimento |

As sete alternativas estão marcadas **UNCONFIRMED** e não recebem ranking ou probabilidade. A hipótese de resíduo pós-intervenção é **inferência de engenharia explícita**, não conclusão atribuída à documentação de um fabricante.

## Seis situações conceituais

O [explorador standalone](https://pedromaintenance.github.io/fmea-database-mining/contaminacao-oleo-arrefecimento.html) permite escolher:
1. película oleosa no reservatório;
2. laudo de óleo com indício de glicol;
3. redução de nível de arrefecimento sem contaminação comprovada;
4. sintoma que persiste após reparo;
5. alterações suspeitas em ambos os fluidos;
6. espuma e temperatura anormal sem contaminação confirmada.

Cada seleção apresenta **várias hipóteses possíveis**, perguntas discriminantes, observações que poderiam favorecer cada mecanismo e os motivos pelos quais os sinais ainda não confirmam uma falha. O mecanismo não conclui causa raiz nem sugere valor de pressão, part number, ensaio físico ou reparo específico.

## Estrutura para Engenharia / PCM

**Sintoma a registrar — exemplo genérico:** "Observada alteração suspeita de aspecto em fluido de arrefecimento/lubrificação, sem mecanismo de comunicação confirmado."

**Hipótese técnica:** "Possível mistura entre circuitos, contaminação externa ou interferência de amostragem; origem indeterminada. Trocador, vedação, galerias estruturais e suprimento de fluido permanecem hipóteses concorrentes somente se existirem na arquitetura aplicável."

**Escopo inicial de engenharia:** "Recuperar identificação e arquitetura do motor, histórico de manutenção, fluidos e intervenções. Identificar as amostras e condições comparáveis, registrar evidência anterior/posterior e avaliar informação de fornecedor/OEM específica. Definir contenção e eventual teste somente com responsável competente e procedimento de segurança autorizado."

**Disciplina:** Engenharia mecânica/motores diesel, lubrificação e monitoramento de condição; laboratório de fluidos e planejamento conforme necessidade.

**Risco de postergação:** "Se houver contaminação cruzada real, a integridade da lubrificação e o controle térmico podem estar comprometidos. Tratar a condição como potencialmente relevante à confiabilidade e segurança até avaliação responsável. Não inferir frequência ou severidade exata para a máquina desconhecida."

**Limite de execução:** nenhuma instrução para abrir motor quente, desmontar trocador, pressurizar reservatório, funcionar máquina para reproduzir evento ou decidir liberação. O conteúdo não é uma nota de serviço para ativo real.

## Artefatos e rastreabilidade

- \`data/knowledge/engine-oil-coolant-differential.v1.json\` — hipótese, sintoma, direção de contaminação, alternativas, pergunta discriminante, fonte e proibições.
- \`docs/contaminacao-oleo-arrefecimento.html\` — interface standalone, sem envio externo ou coleta de dados.
- \`scripts/build-engine-oil-coolant.mjs\` — projeção pública determinística HTML/JSON.
- \`scripts/audit-engine-oil-coolant.mjs\` — controle de origem, documentação, vínculos, ausência de falsa autoridade e integridade do corpus congelado.
- \`data/research/sources.v1.json\`, \`data/catalog/source-discovery.v1.json\` e \`docs/fontes-tecnicas.html\` — bibliografia sincronizada.
- Índice curado atualizado com pesquisa e documento.

**O motor lexical v2, o grafo de seleção e os dez registros do piloto 1.4.11 NÃO foram alterados.** O novo dossiê é posterior ao congelamento e deve ser excluído da avaliação cega para não introduzir vantagem artificial.

## Estado e ação

- Fontes catalogadas: **105**.
- Hipóteses conceituais: **7**, sem confirmação.
- Situações ilustrativas: **6**.
- Testes em motores reais: **0**.
- Números de série/part numbers comprovados: **0**.
- Aprovação OEM ou ordem SAP: **0**.
- Participações reais no piloto independente: **0**.

**Próxima ação material:** realizar revisão de engenharia por profissional de motores diesel e, quando existir evidência autorizada de um motor específico, confrontar mapa de galerias, trocador, fluidos e sintomas com literatura OEM por série. Somente após isso delimitar inspeção ou serviço. A biblioteca fornece hipóteses e evidências a solicitar, não substitui diagnóstico executado.
