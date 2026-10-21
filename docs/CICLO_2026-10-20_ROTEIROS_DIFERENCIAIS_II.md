# FMEA v1.3.17 — Segundo lote de diagnóstico diferencial

**Data editorial:** 20/10/2026  
**Escopo:** somente FMEA Database Mining; novos roteiros internos, sem publicar avaliações operacionais ou alterar consumidores.  
**Resultado:** +3 roteiros, +9 etapas, +12 requisitos de prontidão documental, +21 regressões; 0 ensaios reais, 0 causas raiz confirmadas.

## Decisão de escopo

O piloto CAT D9 mantém [sete entradas documentais sem aprovação](../data/quality/oem-d9-evidence-intake.v1.json): prefixo/série, OMM, peças, fixadores, CTS, estrutura SAP e parecer independente. Não é correto afirmar que o D9 foi validado por documentação pública genérica nem supor torques, dimensões ou PN de outra configuração. O ciclo avança, portanto, a segunda frente do roadmap: roteiros diferenciais para hipóteses que já possuem fontes e análise crítica catalogadas.

Os três [roteiros históricos v1.3.11](../data/quality/diagnostic-pathways.v1.json) não foram editados, pois validadores anteriores preservam sua origem. O [lote v1.3.17](../data/quality/diagnostic-pathway-expansion.v1.json) é adicional, não uma sobreposição ou promoção dos três originais. No total, seis roteiros estão aprofundados, enquanto a biblioteca de doze playbooks ainda tem seis a aprofundar.

## Matriz de comparação de hipóteses

| Cadeia | Hipótese A | Hipótese B | Confundidor que permanece aberto |
|---|---|---|---|
| `FC-COOL-001` | Sujidade e detritos restringem ar pela colmeia | Comando/atuação do ventilador não gera fluxo suficiente | Baixo nível ou circulação insuficiente do líquido |
| `FC-TRACK-001` | Detritos compactados travam o rolete externamente | Anomalia interna de rolamento ou vedação | Tensionamento impróprio da esteira |
| `FC-COOL-007` | Conjunto de bomba não sustenta circulação adequada | Termostato ou bypass restringe passagem | Ventilação/fluxo de ar insuficiente |

### 1. Colmeia × ventilação

A inspeção visual documenta sujidade e passagens de ar, mas não mede isoladamente perda de capacidade térmica. A telemetria de demanda/resposta do ventilador só é discriminante se canais, arranjo, carga e critério OEM forem efetivos e comparáveis; há máquinas sem ventilador reversível ou com arquitetura diferente. O terceiro passo exige confrontar nível e circulação de líquido para não atribuir à ventilação uma falha hidráulica do arrefecimento. Não executar teste em ventilador em movimento com pessoas na zona de risco.

**Fontes da base:** `CAT-RADIATOR-CARE`, `CAT-EXC-COOL-CHECKLIST`, `CAT-COOLING-FAN-REVERSE` e `ISO-17359-2018` (uso conceitual, sem assumir configuração OEM).

### 2. Rolete × detritos

Material compacto ao redor de um rolete pode produzir arrasto, mas também pode coexistir com falha interna e tensão incorreta. Foto antes da intervenção, termometria com referência de carga/emissividade e exame do comportamento do rolete **somente sob procedimento OEM seguro** constituem etapas diferentes. A decisão exige contraprova do tensionamento pela referência OMM; sem ela, a alegação interna/externa permanece inconclusiva. Não reproduzir rotação de esteira ou liberar energia acumulada para testes improvisados.

**Fontes da base:** `CAT-DOZER-UC-MAINT`, `CAT-STEEL-TRACKS`, `CAT-MINING-UC-WEAR-MANAGEMENT`, `CAT-CTS-UNDERCARRIAGE`. Nenhum limite CTS foi incorporado.

### 3. Bomba × termostato/bypass

Elevação de temperatura em telemetria é **efeito/sintoma**, não prova de defeito de bomba. O exame funcional do termostato e do bypass é independente da medição de vazão/pressão da bomba; ambos dependem de arquitetura OEM específica, medição instrumentada e controle de nível, restrições e ventilação. Resultado fora de referência não identifica sozinho a causa raiz de manutenção. Não abrir circuito quente nem realizar ensaios de pressão fora do procedimento autorizado.

**Fontes da base:** `CAT-WATER-PUMP-REPLACEMENT`, `CAT-THERMOSTAT-REPLACEMENT`, `CAT-RADIATOR-CARE` e `ISO-17359-2018`, sem acesso a critérios de cada série.

## Modelo de dados e validação

Os três roteiros possuem, individualmente, comparação A/B, três métodos da ontologia EV-01–EV-16 com resultados alternativos (`supportsA`, `supportsB`, `notDiscriminating`), metadados de controle da medição e fronteiras de segurança, quatro requisitos prévios de evidência, referências bibliográficas e os quatro níveis causais copiados fielmente do registro original. `applicableSerialOrArrangement=null`, `executionStatus=not_performed`, `fieldEvents=0`, `independentEvidenceVerified=false` e `rootCauseConfirmed=false` são condições obrigatórias.

O [validador](../scripts/validate-pathway-expansion.mjs) confere IDs contra cadeia, fonte e [matriz de alternativas](../data/quality/complementary-discrimination.v1.json), preserva integridade com os três roteiros antigos, recusa fonte inexistente e executa 21 [regressões sintéticas](../data/quality/pathway-expansion-regressions.v1.json): nove checklists com disposição inconclusiva/pronta para revisão, mais doze mutações que tentam promover a causa ou alterar evidência, método e segurança. Estar **apto para revisão** não equivale a falha confirmada.

Comando: `npm run pathways:expand:validate`, integrado ao `npm run qa` e ao GitHub Actions. O [JSON Schema](../schemas/diagnostic-pathway-expansion.schema.json) documenta o novo lote.

## Próximo incremento

Aprofundar, em lotes curados, os seis playbooks restantes e preparar a coleta de evidências autorizadas separada do repositório público. Manter o piloto CAT D9 bloqueado até receber literatura efetiva e revisão de engenharia/oficina. O contrato público permanece `1.0.0`, o release de conteúdo `1.0.0`, o preview legado `1.3.12` e seu SHA-256 histórico inalterado.
