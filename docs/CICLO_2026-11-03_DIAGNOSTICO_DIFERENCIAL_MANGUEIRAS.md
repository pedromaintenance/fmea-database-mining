# Ciclo v1.3.89 — Diagnóstico diferencial de conjuntos de mangueiras hidráulicas

**03/11/2026 · FMEA Database Mining · Pesquisa conceitual, sem eventos de campo nem homologação.**

## Objetivo e novidade

Ampliar a interpretação do conjunto de mangueira, sem reescrever os bundles PM existentes `BUNDLE-06` (fuga) e `BUNDLE-12` (abrasão). A nova base `data/quality/hydraulic-hose-differential.v1.json` contempla **9 sinais/cenários e 19 hipóteses concorrentes**, cada uma com contraprova proposta e evidências documentais a solicitar. Não há cálculo de ocorrência, probabilidade, RPN, severidade ou pressão de ensaio.

O princípio é separar **local de evidência** (óleo sobre cobertura, terminal, assento, corpo), **fenômeno observável** (abrasão, fuga, fissura, torção), **mecanismo candidato** (contato, carregamento axial, pressão, flexão, incompatibilidade, instalação) e **causa demonstrada** (inexistente neste ciclo). Os mecanismos podem coexistir.

## Matriz técnica de investigação

| Ficha | Indício | Hipóteses a discriminar | Encaminhamento conceitual |
| --- | --- | --- | --- |
| HH-DIFF-01 | Óleo superficial sem origem identificada | Escorrimento externo × fuga do corpo | Isolar e localizar origem com método seguro; não declarar mangueira perfurada |
| HH-DIFF-02 | Desgaste externo sem fuga e sem reforço confirmado | Contato/abrasão × degradação químico-térmica | Inspecionar cobertura, interferências e referência OEM; nenhuma liberação implícita |
| HH-DIFF-03 | Reforço exposto | Atrito progressivo × corte/impacto | Retirada segura e avaliação de substituição, independentemente de fuga |
| HH-DIFF-04 | Ruptura no corpo | Pulsos/pressão × flexão/raio × dano externo | Retirada segura e investigação do conjunto retirado |
| HH-DIFF-05 | Ruptura junto ao terminal | Tração/comprimento/raio × montagem/prensagem | Retirada segura, revisão de roteamento e rastreabilidade do conjunto |
| HH-DIFF-06 | Fuga no assento ou rosca | Falha de vedação × geometria/montagem da união | Isolar a união, confirmar origem e avaliar conjunto/vedação conforme OEM |
| HH-DIFF-07 | Exsudação na crimpagem ou terminal solto | Montagem/prensagem × esforço axial excessivo | Retirada segura; não remendar nem tentar retenção improvisada |
| HH-DIFF-08 | Fissuras, dureza, carbonização, bolhas | Efeito térmico × incompatibilidade/envelhecimento | Retirada segura, identificar fonte térmica e material/fluido |
| HH-DIFF-09 | Torção, marcação helicoidal, vinco | Instalação com torção × deslocamento operacional inadequado | Se confirmado, retirar de serviço; revisar trajeto/instalação por OEM |

**Ressalva de segurança:** a classificação de retirada é uma recomendação conservadora oriunda de fabricantes para condições de dano efetivamente constatadas; não significa que esta base identificou um defeito na frota. A autorização de inspeção, isolamento e troca depende de responsáveis e procedimentos aplicáveis. O banco **não autoriza pressão de teste, trabalho com circuito energizado ou continuidade operacional**.

## Evidência mínima de campo — futura e privada

1. Identificação da mangueira e seus terminais pelo arranjo, equipamento e série, com documentação OEM aplicável.
2. Estado do circuito, energia hidráulica armazenada, zona de carga e procedimento seguro; nenhuma busca de fuga com mão/corpo.
3. Fotos da localização e do indício, com contexto da superfície e conexões superiores; inspeção de peças retiradas somente se autorizada.
4. Descrição de rota, fixação, interferência, raio, eventual torção, movimento e ambiente, confrontada a especificações reais.
5. Registro da proveniência, método e qualidade da medição ou da observação, com hipótese alternativa e parecer independente.
6. Mapeamento de dano/causa SAP separado do diagnóstico físico e sujeito à curadoria de Dados Mestres.

## Fontes consultadas e limites

- **CAT-HYD-HOSE-INSPECT** — [Caterpillar: inspeção e manutenção de conjuntos hidráulicos](https://www.cat.com/en_US/blog/inspect-cat-hydraulic-hose-assemblies.html). Suporta vigilância de abrasão, bolhas, torção, vazamentos, roteamento e crimpagem; não fornece critérios por número de série.
- **CAT-HYD-HOSE-FAILURE** — [Caterpillar: causas e prevenção](https://www.cat.com/en_US/blog/hydraulic-hoses-maintenance.html). Suporta substituição de conjunto danificado, não reparo de mangueira avariada.
- **GATES-SAFE-HYDRAULICS-2025** — [Gates: Safe Hydraulics Pocket Guide](https://www.gates.com/content/dam/documents-library/operating-manuals/safe-hydraulics-pocket-guide-en.pdf), pp. 24–25. Distingue abrasão, ruptura no corpo, junto à conexão, fuga em assento, exsudação e desengate; orientação **geral**, não substitui OMM.
- **PARKER-HOSE-FAILURES-2023** — [Parker Hannifin / Power & Motion: morfologias comuns de falha](https://www.powermotiontech.com/hydraulics/hose-tubing/article/21884482/parker-hannifin-corp-hose-products-div-a-guide-to-recognizing-the-causes-of-hose-failure). Exemplos diferenciais, sem atribuição causal à mina.

As fontes não autorizam pressões/torques/raios de curvatura específicos para CAT 6030, 395, 777 ou outras máquinas. Nenhum texto OEM licenciado foi reproduzido integralmente.

## Qualidade e integração

- `schemas/hydraulic-hose-differential.schema.json` estabelece contrato estrutural conceitual.
- `npm run pm:hydraulic:hose:differential:audit` verifica proveniência, dupla hipótese, natureza não observada, desvios críticos, vínculo com bloqueios existentes e **15 alterações adversariais**.
- A auditoria participa de `npm run qa` e gera `reports/hydraulic-hose-differential.generated.json`.
- **Invariantes:** 25 regras PM; duas regras de mangueiras com `subgroup_not_in_scope`; dez exceções PM×SAP bloqueadas; oito gates privados NO_GO; zero medições, inspeções, ensaios, homologações ou alterações de consumidores.
- Conteúdo público/contrato público, ontologia central, códigos SAP e HTML existentes não são alterados.

## Ações reais que permanecem pendentes

Engenharia deve obter ficha e BOM de uma montagem efetiva e revisar hipóteses e substituição segura. PCM/Dados Mestres devem validar a árvore funcional HYSY/IMAT sem reutilizar `HSVV` de outro sistema. Segurança/Execução devem definir procedimento de inspeção e controle de energia. Todas essas atividades dependem de infraestrutura e autorizações fora do repositório público.
