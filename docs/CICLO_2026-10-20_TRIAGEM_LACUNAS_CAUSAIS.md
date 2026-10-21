# FMEA Database Mining — v1.3.20 | Triagem de cinco lacunas PB–FC

**Data editorial:** 20/10/2026. **Escopo:** banco de conhecimento, sem manipulação de consumidores. **Natureza:** análise de mecanismos plausíveis baseada em fontes públicas gerais, **sem comprovação OEM por série** nem inspeção real.

## 1. Problema encontrado na v1.3.19

A [matriz PB–FC](../data/quality/playbook-causal-crosswalk.v1.json) possui 18 hipóteses de seis playbooks e 18 vínculos conceituais candidatos em 13 delas. **Cinco ficaram sem cadeia equivalente demonstrada**. Isso não significa cinco modos de falha faltantes: algumas hipóteses descrevem sintomas, condições do lubrificante ou a localização de uma fuga.

## 2. Decisão material para cada lacuna

| Gap original | Natureza | Decisão | Justificativa principal |
|---|---|---|---|
| `PB-EXC-PUMP-01/H1` | Falha funcional física plausível | **Propor** vedação externa da bomba | A fuga em vedação de bomba não equivale à fuga por terminal de mangueira ou vedação de bomba d’água |
| `PB-EXC-PUMP-01/H3` | Sintoma exige discriminação causal | **Propor condicionalmente** perdas internas da bomba | Pressão/vazão deficientes podem vir de compensador, válvula, sucção, fluido ou medição; não condenar bomba sem isolar o mecanismo |
| `PB-EXC-HOSE-01/H3` | Localização de origem | **Não gerar cadeia** | Óleo escorrido de cima não demonstra falha na própria mangueira |
| `PB-TRUCK-FINAL-01/H2` | Mecanismo físico plausível | **Propor** degradação de flancos de dentes | Engrenamento danificado deve ser distinguido de rolamento e contaminação; dano visual e morfologia precisam comprovar origem |
| `PB-TRUCK-FINAL-01/H3` | Condição de óleo sem dano | **Não gerar cadeia** | Perfil químico ou formulação diferente, inclusive transição conhecida para FDAO, pode explicar laudo sem dano mecânico |

**Resultado:** três propostas investigáveis + duas interpretações que não configuram modos de falha. Todas as decisões e contraprovas estão em [`data/quality/causal-gap-triage.v1.json`](../data/quality/causal-gap-triage.v1.json).

## 3. Propostas mecânicas (fora do núcleo)

As propostas [`CAND-*`](../data/quality/proposed-causal-chains.v1.json) são deliberadamente **separadas** de `FC-*`, dos efeitos e da auditoria sistêmica existentes. Não existe código SAP, PN, número de série, limite numérico, evidência executada, revisão independente ou causa raiz aprovada. Antes de promover uma proposta é preciso confirmar a função, o arranjo físico e os mecanismos com OMM/SIS efetivo, observação independente e avaliação de sobreposição com as 24 cadeias oficiais.

**Bomba CAT 395 — vedação externa:** observar origem da fuga somente após bloqueio e despressurização; diferenciar vedação de eixo, junta, conexão adjacente e óleo que escorre de cima. Evidência mínima: BOM/arranjo, inspeção de origem rastreável e histórico técnico.

**Bomba CAT 395 — perdas internas:** diferenciar desempenho insuficiente da bomba de restrição de sucção, compensação, controle, válvula, instrumentação e condição do óleo. Pressão baixa ou ciclo lento é **sintoma**; a cadeia candidata é um mecanismo físico de perda interna a demonstrar. Evidência mínima: curva/teste OEM, medições em regime válido e contraprova de elementos externos.

**CAT 777 — dentes de comando final:** investigar desgaste de flanco e fadiga superficial, distinguindo desgaste abrasivo/adesivo, pitting, rolamento e partículas originadas de outra fonte. Sem inspeção localizada, metal alto no óleo e ruído não isolam engrenamento. Evidência mínima: identificação do conjunto, inspeção autorizada de flancos e trilha de partículas/óleo/bujão com baseline.

## 4. Fontes: uso e limites

Foram indexadas fontes primárias públicas e restritas ao que sustentam:

- [Caterpillar — Hydraulic Pumps and Motors](https://www.cat.com/en_US/support/maintenance/hydraulics/pumps-and-motors.html): famílias de bombas e modos gerais de reparo; **não** identifica a bomba CAT 395 da frota.
- [Parker — Hydraulic Pumps Overall Instructions](https://www.parker.com/content/dam/Parker-com/Literature/PMDE/Service_Manuals/Vane_Pumps/HY29-0106-UK.pdf): investigação de vazamento de retentor em bombas de palhetas; mecanismo comparativo, **não** aplicabilidade à bomba de pistões CAT 395.
- [Caterpillar — Hydraulics Technical Analysis](https://www.cat.com/en_US/blog/cat-hydraulics-tests-hydraulic-system-inspection.html): inspeções e testes hidráulicos gerais; nenhum limite foi transportado a outra configuração.
- [ISO 10825-1:2022](https://www.iso.org/standard/78719.html): resumo público sobre classificação de desgaste e dano de dentes; o texto integral licenciado **não** foi consultado.
- [Caterpillar — Drivetrain Repair Indicators](https://www.cat.com/en_US/blog/drivetrain-repairs-preventive-maintenance.html), [Drive Train Oil](https://www.cat.com/en_US/blog/maintain-drive-train-oil.html) e [Fluid Analysis 101](https://www.cat.com/en_US/support/maintenance/sos-services/analysis-101.html/): evidências complementares de fluidos; o baseline por compartimento depende da documentação real e do histórico de trocas.

Nenhuma fonte comprova uma falha efetivamente encontrada em campo. Dados de máquina, laudos privados e literatura licenciada não foram publicados.

## 5. Controles e testes

O [validador](../scripts/validate-causal-gap-triage.mjs) compara os cinco slots originais do crosswalk à triagem, exige fontes catalogadas, mecanismo e alternativa não organizacional, três evidências independentes por proposta e dois testes discriminantes seguros. Impede série, PN, medição, local SAP, revisão fictícia e promoção automática.

O [conjunto de 21 regressões sintéticas](../data/quality/causal-gap-triage-regressions.v1.json) contém cinco controles de classificação e 16 tentativas de promover uma proposta sem base, editar a decisão, apagar contraprova, inventar fonte ou atribuir aprovação indevida. Rodar `npm run causal:gaps:validate`, integrado ao `npm run qa` e GitHub Actions.

**Preservação:** 24 cadeias no núcleo, 48 alegações sistêmicas auditadas editorialmente, 12 playbooks aprofundados por ID, contrato público 1.0.0, conteúdo público 1.0.0, preview 1.3.12 (24 registros/20 fontes), mesmo SHA-256. Nenhum consumidor alterado.

## 6. Próximo passo

Revisar se as três candidatas são mecanicamente separáveis das cadeias atuais e compatíveis com a taxonomia das falhas funcionais. Solicitar, em repositório **restrito**, referências SIS/OMM por arranjo da CAT 395 e do comando final CAT 777; somente após evidências e parecer independente admitir novo `FC-*` no núcleo. As cinco lacunas permanecem formalmente **sem mapeamento homologado**.
