# Ciclo v1.3.51 — Freios de disco: fricção, atuação e segurança

**22/10/2026 | Banco 1.3.51 | Ontologia 1.3.16.** Revisão técnica da regra `brake-disc` (`BRA1`, candidatos `CAT777`, `CAT980` e `EQ09`). A existência da regra **não confirma** arquitetura, posição, material, evento de desgaste, falha real ou vínculo SAP aprovado.

## Função e diagnóstico

O sistema de freios converte energia cinética em calor e/ou retém a máquina, conforme atuação hidráulica ou mecanismos específicos. **Desgaste da superfície de fricção, dano térmico, arrasto, deficiência de atuação e insuficiência de desempenho são fenômenos diferentes.** Um resultado de pressão anormal não mede a espessura de disco; um conjunto aquecido não implica, isoladamente, disco condenado; a falta de desaceleração não comprova desgaste de fricção.

## Variantes que não podem ser confundidas

| Fonte pública | Arquitetura descrita | Limite de evidência |
| --- | --- | --- |
| CAT 777 (05), dianteiro | Disco com pinça (*caliper*) | A efetividade por número de série e se a pinça é seca depende do arranjo real; não aplicar inspeção de pacote de discos úmidos |
| CAT 777 (05), traseiro | Multidiscos arrefecidos a óleo | Não generalizar procedimento de freio dianteiro ou de outra revisão |
| CAT 777 (07), dianteiro e traseiro | Multidiscos arrefecidos a óleo | Não atribuir automaticamente a um 777 (05) |
| CAT 980, freio de serviço | Freios hidráulicos com discos úmidos fechados | Confirmar série, variante, freio de estacionamento separado e estrutura OEM |

A fonte CAT 777 (05) identifica pinça frontal e multidiscos úmidos traseiros; a 777 (07), multidiscos arrefecidos a óleo nos dois eixos. A 980 usa freios de serviço úmidos fechados na ficha pública e pode ter freio de estacionamento por pinça — são funções distintas. Configurações e opcionais variam; as fichas não equivalem a BOM/SIS por série.

## Sete condições semânticas

- `COND-BRAKE-DISC-WEAR`: suspeita de desgaste de disco, placa ou material de atrito.
- `COND-BRAKE-DISC-THERMAL`: alteração térmica localizada ainda não confirmada.
- `COND-BRAKE-FRICTION-CONTAMINATION`: suspeita de alteração da superfície; óleo é esperado em **freio úmido**, não deve ser tratado como contaminação por definição.
- `COND-BRAKE-LOW-DECEL`: desempenho de frenagem suspeito de insuficiência, sem prova de componente.
- `COND-BRAKE-ACTUATION-PRESSURE`: pressão/energia de atuação a verificar contra o circuito OEM.
- `COND-BRAKE-DRAG-RELEASE`: arrasto ou liberação incompleta com várias causas possíveis.
- `COND-BRAKE-WEAR-INDICATOR`: indicação a confirmar por posição e configuração.

Todos os itens são `condition_hypothesis_not_observed`, com `observedValue:null` e sem ensaio real.

## Diferenciais de dano e ações

Os três danos permanecem candidatos **não aprovados**: `DMG-BRAKE-FRICTION-WEAR-CANDIDATE` (desgaste do atrito), `DMG-BRAKE-FRICTION-THERMAL-CANDIDATE` (dano térmico do atrito) e `DMG-BRAKE-ACTUATOR-CANDIDATE` (eventual mecanismo de atuação/liberação). Nenhum possui componente, localização, causa ou código SAP validado.

As quatro ações propostas e **não executadas** são: identificar arquitetura/BOM e posição por série; inspecionar material, indicador e dano térmico conforme OMM; diferenciar problemas de atuação, pressão/energia acumulada e retorno; e revisar evidências e critérios de segurança para qualquer decisão futura de liberação operacional.

**Segurança — barreira obrigatória:** falha de freio é potencialmente catastrófica. Equipamento com suspeita crítica requer isolamento, imobilização e avaliação competente. Proibidos testes dinâmicos improvisados em vias, declives ou com veículo carregado, e desmontagem sem controle de energias hidráulicas/acumuladas, calços e bloqueio. Somente procedimento OEM por série e avaliação de risco podem definir local, condições, velocidade, carga e responsabilidades dos ensaios. A **ISO 3450:2011** trata requisitos de desempenho e testes de sistemas de serviço, secundário e estacionamento; não aprova ensaios informais nem fornece limite de desgaste do disco específico a estas máquinas.

## Fontes e limites

- [Caterpillar — 777 (05)](https://www.cat.com/en_IN/products/new/equipment/off-highway-trucks/off-highway-trucks/126280.html): pinça dianteira, multidiscos úmidos traseiros, sem comprovar a montagem em cada máquina.
- [Caterpillar — 777 (07)](https://www.cat.com/en_US/products/new/equipment/off-highway-trucks/off-highway-trucks/115560.html): freios multidiscos arrefecidos a óleo nas rodas dianteiras/traseiras, sem transposição a 777 (05).
- [Caterpillar — 980](https://www.cat.com/en_US/products/new/equipment/wheel-loaders/medium-wheel-loaders/130318.html): freios de serviço hidráulicos com disco úmido fechado e funções distintas de freio de estacionamento.
- [ISO 3450:2011](https://www.iso.org/standard/42076.html): requisitos e procedimentos de desempenho para freios de serviço, secundário e estacionamento de máquinas sobre pneus.

Somente descrições e limites gerais estão publicados no repositório; sem copiar manual proprietário, tolerância específica, PN ou resultado corporativo.

## Evolução, testes e pontos pendentes

| Indicador | v1.3.50 | v1.3.51 |
| --- | ---: | ---: |
| Regras PM | 25 | 25 |
| Bundles detalhados | 17 | **18** |
| Regras ainda sem bundle | 8 | **7** |
| Condições | 58 | **65** |
| Ações propostas | 44 | **48** |
| Danos candidatos | 26 | **29** |
| Relações tipadas | 139 | **153** |
| Cenários sintéticos | 30 | **32** |
| Links PM candidatos | 115 | **115** |
| Bloqueios PM × SAP | 10 | **10** |

O auditor `npm run pm:brake:disc:audit` tenta **32 adulterações adversariais** (20 de ontologia, 8 de política e 4 de cenários), incluindo liberar máquina, generalizar arquitetura, simular pressão/medição e aprovar dano sem evidência. Relatório do CI: `reports/pm-brake-disc.generated.json`. Os cenários SEM-31 e SEM-32 são simulações sem evento real.

**Pendências para Engenharia/PCM:** obter BOM e OMM por série/posição; classificar funções serviço, secundário, estacionamento e retardador; identificar sensores, placas, pinças, pacotes, circuitos e valores específicos; elaborar método seguro de inspeção e critérios de imobilização/liberação; manter decisão de dano/causa SAP bloqueada até evidência independente. Preservados 24 FC/15 ME, contrato/conteúdo público 1.0.0, preview 1.3.12 e consumidores.
