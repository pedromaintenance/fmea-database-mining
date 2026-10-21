# FMEA Database Mining — Ciclo v1.3.42: separar roda-guia de rolete na ontologia

**21/10/2026 — correção controlada de semântica técnica.** A auditoria de catálogo v1.3.41 permanece válida: no recorte da regra `track-idler-wear`, os oito caminhos IDLE não continham descrição explícita de Rolamento; os resultados cadastrados de rolamento pertenciam a subgrupos ROLL. Esta etapa **não** adiciona componentes nem resolve aquele bloqueio SAP.

## Problema e mecanismo de erro informacional

A versão anterior de `BUNDLE-09` (roda-guia) monitorava `COND-TRACK-ROLLER-HEAT` e propunha `ACT-TRACK-ROLLER-SEAL-CHECK`, ambos descritos para roletes. Essa associação entre componentes distintos tinha potencial para produzir inferências incorretas quando dados fossem consumidos em treinamento ou futuras análises. Além disso, o dano `DMG-TRACK-IDLER-WEAR` era rotulado como **“Desgaste confirmado”** apesar de possuir `confirmed:false`, `reviewStatus:not_approved` e mapeamento SAP nulo.

A correção atinge **apenas a ontologia genérica de investigação**. O significado técnico é uma hipótese a avaliar, não evidência de campo. Nenhum percentual CTS, número de série, item OEM ou resultado medido foi adicionado.

## Nova separação por componente

| Entidade | Rolete — conceitos históricos preservados | Roda-guia — conceitos ativos |
| --- | --- | --- |
| Desgaste/contato | `COND-TRACK-ROLLER-WEAR` | `COND-TRACK-IDLER-WEAR` |
| Aquecimento suspeito | `COND-TRACK-ROLLER-HEAT` | **`COND-TRACK-IDLER-HEAT`** (novo) |
| Possível perda de vedação | `COND-TRACK-ROLLER-SEAL-LEAK` | **`COND-TRACK-IDLER-SEAL-LEAK`** (novo) |
| Inspeção dimensional | `ACT-TRACK-ROLLER-CTS` | `ACT-TRACK-IDLER-CTS` |
| Inspeção de vedação/detritos | `ACT-TRACK-ROLLER-SEAL-CHECK` | **`ACT-TRACK-IDLER-SEAL-CHECK`** (novo) |

O bundle `BUNDLE-09` monitora agora as três condições de roda-guia e propõe exclusivamente as duas ações de roda-guia. Suas arestas `REL-050` e `REL-052` foram redirecionadas, e `REL-054` registra a condição adicional de possível fuga na vedação. `BUNDLE-08` permanece exclusivo de roletes. Nenhum conceito pré-existente foi excluído ou renumerado.

## Limites de interpretação

- **CTS e desgaste externo:** medição dimensionada por perfil e posição, com referência e tolerância efetivas da configuração, ajuda a caracterizar tendência de desgaste. Ela não é prova isolada de defeito de rolamento/apoio interno.
- **Aquecimento da roda-guia:** uma diferença térmica pode decorrer de carga, condição de contato, detritos, tensionamento, alinhamento ou apoio; investigar método e condições, sem atribuição causal automática.
- **Vestígio na roda-guia:** a existência de vedação/lubrificação depende da configuração física do conjunto. Fluido migrado de rolete adjacente não confirma vazamento da roda-guia.
- **Rolamento interno:** a presença de uma peça denominada rolamento em subgrupo ROLL do SAP não valida rolamento separado em IDLE. O desenho e a BOM OEM efetivos por série permanecem necessários.
- **Rótulo de dano:** corrigido para **“Desgaste da roda-guia ou dano do apoio interno sob investigação”**. Estado confirmado permanece falso, código SAP nulo e revisão pendente.

A Caterpillar descreve inspeções distintas de rodas-guia e roletes, e reforça o uso de OMM específico do equipamento para medição, ajustes e segurança: [Dozer Undercarriage Maintenance](https://www.cat.com/en_US/articles/for-owners/dozer-undercarriage-maintenance.html) e [Dozer Undercarriage Maintenance and Management](https://www.cat.com/en_US/blog/mining/articles/dozer-undercarriage-maintenance-and-management.html). Os exemplos públicos não estabelecem tolerâncias nem danos reais na frota.

## Auditoria de retrocompatibilidade

`npm run pm:idler:semantics:audit` verifica:
- IDs legados de rolete e `BUNDLE-08` preservados;
- IDs, tipos de entidade, fontes OEM genéricas e arestas de `BUNDLE-09` segregados;
- novos conceitos não observados e ação não executada;
- diferença entre dano hipotético e falha confirmada;
- integridade dos cenários anteriores de rolete e roda-guia, mais dois cenários sintéticos novos;
- 24 adulterações artificiais rejeitadas (20 de ontologia, quatro de fixtures);
- `track-idler-wear` ainda bloqueada por `component_not_registered`.

Resultado do primeiro GitHub Actions: **20 condições, 19 ações, nove danos diferenciais, nove bundles, 54 relações tipadas, 16 cenários sintéticos**; zero aprovação SAP, zero observação e zero execução. A ontologia evoluiu para **1.3.8**, pacote para **1.3.42**. O contrato/conteúdo público de cadeias (1.0.0) e o preview histórico (1.3.12) são gerados e testados independentemente e não recebem esses conceitos por alteração implícita.

## Pendências de execução

A alteração melhora a qualidade semântica, mas **não** prova configuração física, método de medição CTS, vazamento de vedação, defeito de apoio ou reparabilidade da roda-guia. O cadastro IDLE e a regra PM continuam à espera de evidência OEM/SAP efetiva e revisão independente, conforme relatório [v1.3.41](CICLO_2026-10-21_RODA_GUIA_CTS.md). Dados reais de inspeção e BOM por série devem ser mantidos em meio corporativo autorizado, fora do GitHub público.

**Base preservada:** 25 regras preventivas, 115 vínculos candidatos, dez exceções bloqueadas, 24 cadeias FC e 15 mecanismos ME, sem alteração dos aplicativos consumidores.
