# FMEA Database Mining — Ciclo v1.3.19: cobertura 12/12 PBs e crosswalk PB–FC

**Data editorial:** 20/10/2026. **Escopo:** banco de conhecimento, não jogos, SAP produtivo ou procedimentos OEM. **Natureza:** hipóteses e roteiros propostos, sem ensaio ou causa observada.

## 1. Escopo e correção de cobertura

A base contém 12 playbooks sintéticos `PB-*`, 24 cadeias de falha `FC-*`, seis roteiros `PATH-*` mecanísticos previamente aprofundados e seis deepdives por PB da v1.3.18. **Essas camadas são diferentes.** A v1.3.19 acrescentou seis deepdives por playbook, completando **12/12 PBs documentalmente aprofundados**, mas não a validação de FMEAs, casos de campo ou vínculos SAP/OEM.

Arquivos: [seis PBs novos](../data/quality/playbook-deepdives-remaining.v1.json), [seis PBs anteriores](../data/quality/playbook-deepdives.v1.json), [matriz de equivalências candidatas](../data/quality/playbook-causal-crosswalk.v1.json), [validador](../scripts/validate-playbook-deepdives-remaining.mjs).

## 2. Quadro de investigação diferencial

| Playbook | H1 | H2 | H3 | Contraprova relevante |
|---|---|---|---|---|
| CAT 395 – pressão hidráulica | Vedação externa da bomba | Linha/conexão próxima | Desempenho sem fuga demonstrada | Origem física do óleo, pressão/vazão OEM, comando e sucção |
| CAT 395 – mangueira | Fuga em conexão | Abrasão no corpo | Óleo que escorre de cima | Primeira área úmida, proteção/roteamento e histórico por posição |
| CAT 6030 – arrefecimento | Passagem de ar restrita | Perda de líquido | Falha de ventilação | Inspeção fria, demanda/resposta do ventilador e circulação independente |
| CAT 777 – comando final | Rolamento deteriorado | Desgaste de engrenagem | Alteração/contaminação do óleo sem dano confirmado | Baseline do óleo, morfologia de detritos, origem independente de ruído |
| CAT D9 – rodante | Rolete | Roda-guia | Tensão/fixadores | CTS/OMM por série e revisão de montagens prévias |
| CAT 980 – radiador | Obstrução externa | Vazamento | Bomba, termostato ou ventilação | Inspeção do pacote, carga/temperatura, ensaio OEM de circulação |

Cada um possui **três etapas propostas** com sinais para H1/H2/H3, limites de interpretação, condição inconclusiva, metadados e fronteiras de segurança. S1 e S2 rastreiam T1/T2 do playbook original; S3 propõe uma contraprova adicional. **Aptidão para revisão não é confirmação de uma hipótese.**

## 3. Correspondência PB–FC sem aprovações falsas

A matriz examina as 18 hipóteses H1/H2/H3 dos seis PBs deste ciclo. Há **13 hipóteses com ao menos um candidato**, somando **18 vínculos conceituais**, e **cinco hipóteses sem cadeia equivalente demonstrada**. Exemplo crítico: a vedação de bomba hidráulica da CAT 395 não pode ser vinculada à cadeia `FC-COOL-008` de vedação de *bomba d’água*, pois sistemas e mecanismos aplicáveis são distintos. O desgaste de engrenagens e a condição de fluido sem dano também não têm correspondência automática apenas pelo sintoma.

Toda relação candidata exige descrição de sobreposição física e limitação de aplicabilidade. Os campos `confirmedMapping`, `approvedSerialOrArrangement`, `approvedSapLocation` e `observedCase` permanecem respectivamente `false/null/null/null`. **Nenhum vínculo foi homologado, exportado para consumidores nem aplicado ao SAP.**

## 4. Testes e segurança

O [validador](../scripts/validate-playbook-deepdives-remaining.mjs) cruza as seis fichas com os PBs originais para impedir modificações de H1/H2/H3, T1/T2, ID de modelo e estado sintético; compara ainda 18 slots da matriz com candidaturas autorizadas editorialmente. Rodar `npm run playbooks:remaining:validate` após checkout, ou usar `npm run qa` para os gates completos.

O conjunto de [regressões](../data/quality/playbook-deepdives-remaining-regressions.v1.json) testa **18 checklists de prontidão**, **16 mutações inválidas de dados dos PBs** e **12 alterações indevidas da matriz**, incluindo serial, local SAP, causa raiz, aprovação humana inventada, método ausente, segurança removida e vínculo para FC inexistente. Testes são estritamente sintéticos.

Nenhum dado real da mina ou literatura OEM licenciada entrou no repositório. Procedimentos de fluido pressurizado, implementos suspensos, partes móveis, óleo quente, fixadores e material rodante continuam condicionados ao OMM/SIS efetivo e bloqueios de energia.

## 5. Preservação e próxima etapa

- Catálogo interno: **1.3.19**; contrato público: **1.0.0**; release de conteúdo: **1.0.0**; preview legado: **1.3.12**, 24 registros e 20 fontes; hash SHA-256 inalterado.
- Piloto CAT D9: **sete documentos ainda não verificados** e revisão independente pendente.
- Preventivas PM × SAP: **dez exceções permanecem sem vínculo estrito**.
- Próximo ciclo: avaliar as cinco lacunas taxonômicas e preparar possível expansão de mecanismos físicos sob fontes técnicas aplicáveis; manter rota de aprovação de evidências reais segregada de dados públicos sintéticos.
