# Histórico de alterações

Este documento registra mudanças **de estrutura, fonte, dados e curadoria**, independentemente das versões do jogo.

## [1.3.65] — 2026-10-26 — Prontidão de investigação P0 e pedidos documentais por modelo

- Cinco P0 em três sistemas, 15 hipóteses com evidência discriminante e contraprova, todos sem validação de campo.
- Trinta e cinco posições de chaves candidatas de modelo (não equipamentos) e sete tipos de pedidos cada: 245 lacunas de evidência **no repositório público**, sem afirmar inexistência de documentos corporativos.
- Preservados papéis e limitações das fontes Cat/SAP; nenhum PN, série, limite OEM, ativo, OS, inspeção ou código SAP aprovado.
- Biblioteca determinística, auditor de 53 mutações e integração ao CI/QA. Ontologia 1.3.23, matriz de maturidade 1.3.60, 25 bundles, 115 vínculos candidatos e dez bloqueios PM×SAP intactos.

## [1.3.64] — 2026-10-24 — Segregação de decisões de evidência, engenharia, SAP e operação

- Quatro trilhas de decisão independentes; pacote sintético derivado de dois preflights P0 com 68 requisitos ainda sem verificação e cinco classes de recibo por caso.
- Sete critérios de qualidade para documentação, efetividade OEM, metrologia, hipóteses concorrentes, confirmação de dano/causa, revisão independente e separação de aprovações.
- Biblioteca e auditor com 53 ataques adversariais; proibição de promoção automática para dano, código SAP, liberação operacional ou aprovação de engenharia.
- Preservados ontologia 1.3.23, maturidade 1.3.60, preflight 1.3.63, 25/25 bundles, 115 links PM candidatos e dez exceções SAP bloqueadas. Nenhum backend privado nem evento real adicionado.

## [1.3.63] — 2026-10-24 — Pré-piloto de homologação por ativo e qualidade metrológica

- Preflight sintético de dois casos P0 (radiador RADI e filtro combustível HSVV) com 34 verificações em sete disciplinas e oito gates em NO-GO/PENDING.
- Especificados série/BOM, qualidade da medição, amostra pré-intervenção, contraprovas, segurança e revisão de engenharia independente, sem medições ou limites OEM inventados.
- Biblioteca de geração determinística, snapshot versionado e auditor de 46 mutações no QA/CI; operações reais, liberação SAP e exportação pública de evidências permanecem proibidas.
- Runbook privado 1.3.62, intake 1.3.61, maturidade 1.3.60, ontologia 1.3.23, 25 bundles e dez exceções preservados.

## [1.3.62] — 2026-10-24 — Runbook privado e revisão documental P0

- Plano de implantação privada com oito gates técnicos/organizacionais, dependências e NO-GO formal por padrão; nenhuma infraestrutura declarada ativa.
- Pacote de curadoria P0 regenerável com cinco exceções, dossiês diferenciais aprofundados para radiador e filtro de combustível e outras três regras na fila.
- Mantida incompatibilidade dos pares/códigos SAP RADI e HSVV sem aprovação, incluindo diferença entre condição e dano físico.
- Auditor com 36 mutações para impedir aprovação privada, dados reais inventados, perda de contraprovas e alteração dos bloqueios. Ontologia 1.3.23, maturidade 1.3.60, intake 1.3.61 e 25/25 bundles preservados.

## [1.3.61] — 2026-10-24 — Intake restrito conceitual e controle de revisão PM

- Contrato público sintético para vincular as 25 regras e bundles a comprovantes de evidência por tokens opacos TEST-*; nenhuma evidência bruta no GitHub.
- Fluxo em seis estados e cinco transições, com custódia, revisão técnica, contraprovas, revisão independente e solicitação manual de mudança.
- JSON Schema, biblioteca de verificação pura e auditor de 40 mutações, integrado ao CI e à rotina de QA.
- Preservados os dez bloqueios PM×SAP, 115 candidatos preventivos, matriz de maturidade 1.3.60 e ontologia 1.3.23. Sem implantação privada, assinatura real, conexão corporativa ou homologação.

## [1.3.60] — 2026-10-24 — Matriz de maturidade, evidência e homologação

- Nova matriz versionada e regenerável das 25 regras e sete gates independentes: modelagem, fonte, série/BOM, campo, dano/causa, SAP e revisão.
- Filas P0/P1 reproduzidas sem inventar prioridade para 15 regras: cinco P0, cinco P1, dez bloqueios preservados.
- 73 vínculos de referência pública/genérica catalogados, sem efetividade OEM validada; nenhum evento de campo, dano ou código SAP aprovado.
- Auditor próprio com 24 mutações e relatório CI; ontologia 1.3.23, 25 bundles e 115 candidatos PM preservados. Consumidores e cadastros externos inalterados.

## [1.3.59] — 2026-10-24 — Compressor: separação funcional de filtros e 25/25 regras modeladas

- `BUNDLE-25` para `drill-compressor-filter`: seis condições, cinco ações propostas, três danos físicos candidatos, quatorze relações tipadas e dois casos sintéticos.
- Quatro circuitos distinguem ar de admissão, filtro de óleo de compressor, separação ar–óleo e hipótese de filtragem no receptor, sem instalação confirmada.
- Preservado bloqueio SAP `subgroup_not_in_scope`: COMR grupo não é subgrupo; VPAR não aprovado como remapeamento.
- Ontologia 1.3.23: 107 condições, 82 ações, 51 danos candidatos, 25 bundles, 251 relações e 46 cenários sintéticos. **25/25 regras com cobertura semântica**, não homologação.
- Auditor com 42 mutações adversariais, 10 gates pendentes, 18 salvaguardas, seis limites nulos, 115 vínculos candidatos e dez bloqueios preservados; zero eventos ou aprovação SAP.

## [1.3.58] — 2026-10-24 — Estanqueidade pneumática, pressão diferencial e bloqueio VPAR

- BUNDLE-24 para `drill-compressor-pressure`: seis condições, cinco ações propostas, três danos candidatos, quatorze relações e dois casos sintéticos.
- Distinguidos pressão baixa, perda de vazão, ruído, mangueira, vedação e vaso, sem confundir consumo/controle com vazamento confirmado.
- Bloqueio SAP `component_not_registered` preservado: VPAR não registra Mangueira; zero remapeamentos aprovados.
- Ontologia 1.3.22: 101 condições, 77 ações, 48 danos, 24 bundles, 237 relações e 44 casos sintéticos; cobertura PM 24/25.
- Auditor de 42 mutações, 10 gates pendentes, 18 salvaguardas e seis limites nulos; sem execução, teste pressurizado, dano confirmado ou alteração de consumidores.

## [1.3.57] — 2026-10-24 — Rolamento de cabeça rotativa, módulos e indícios não causais

- BUNDLE-23 para `drill-rotary-bearing`: 6 condições não observadas, 5 ações não executadas, 3 danos candidatos, 14 relações tipadas e 2 casos sintéticos.
- Separadas arquiteturas Sandvik HTRH6, MRH6 e DR410i; sem inferir pré-carga, PN, folga, óleo ou opção instalada.
- Ontologia 1.3.21: 95 condições, 72 ações, 45 danos candidatos, 23 bundles, 223 relações e 42 cenários sintéticos; 23/25 regras modeladas e 2 pendentes.
- 10 gates pendentes, 18 controles de segurança, auditor de 42 mutações no QA/CI; sem dados de campo, teste funcional, código SAP aprovado ou alterações de consumidores.

## [1.3.56] — 2026-10-24 — Corrente de avanço e arquitetura da perfuratriz

- BUNDLE-22 para `drill-feed-chain`: 6 condições, 5 ações, 3 danos candidatos, 14 relações tipadas, 2 casos sintéticos.
- Contraste OEM DR410i (dois cilindros/corrente, pinos manuais padrão, automático opcional) versus DI650i (chain feed sem comprovação de tensão equivalente).
- Ontologia 1.3.20: 89 condições, 67 ações, 42 danos, 22 bundles, 209 relações e 40 cenários sintéticos; cobertura 22/25 regras e três pendentes.
- 10 gates pendentes, 16 controles de segurança e auditor adversarial com 40 mutações, integrado ao CI e ao QA. Preservados 115 vínculos PM candidatos, dez bloqueios, zero medições/OS/SAP homologados e consumidores externos inalterados.

## [1.3.55] — 2026-10-23 — Desgaste de pneus OTR e diagnóstico RTD

- BUNDLE-21 `wheel-tire-wear` independente de TIR1: seis condições, quatro ações planejadas, três danos candidatos, 13 relações e dois cenários sintéticos.
- Diferenciados centro, ombros, assimetria, localização, perfil de RTD e rodagem dupla condicional. Sem causas inferidas de pressão ou alinhamento.
- Ontologia 1.3.19: 83 condições, 62 ações, 39 danos, 21 bundles, 195 relações e 38 casos sintéticos; 21/25 regras modeladas.
- Auditor adversarial, nove gates, dezesseis salvaguardas, sem limites OEM fabricados, dados de campo, códigos SAP ou alteração nos consumidores.

## [1.3.54] — 2026-10-23 — Dano físico do pneu OTR, integridade e segurança

- BUNDLE-20 para `wheel-tire-damage`: seis condições não observadas, cinco ações não executadas, quatro danos candidatos, 15 relações e dois fixtures sintéticos.
- Diferenciados cortes de flanco/banda, reforço exposto, abaulamento, talão versus aro e pressão contextual; `wheel-tire-wear` preservado como regra distinta.
- Fontes Michelin/Bridgestone, nove gates pendentes e 16 salvaguardas. Sem pressões OEM, TKPH, reparabilidade ou decisão automática.
- Ontologia 1.3.18: 77 condições, 58 ações, 36 danos, 20 bundles, 182 relações e 36 fixtures. Cobertura **20/25**, cinco pendentes, 115 candidatos PM, dez bloqueios e consumidores preservados.

## [1.3.53] — 2026-10-22 — Coletor de escape: BUNDLE-19 e discriminação por componente

- Ontologia **1.3.17**: seis condições, cinco ações não executadas e três danos diferenciais não aprovados no `BUNDLE-19` (coletor/junta/fixador); 14 novas relações e dois casos sintéticos.
- Preservada pré-auditoria v1.3.52 com oito gates pendentes, três fontes OEM públicas genéricas e limitações por série.
- Diferenciados fuligem, fissura visual, fuga em flange, resíduo úmido, fole condicional e desempenho; não inferir dano por sintomas inespecíficos.
- Total: 71 condições, 53 ações, 32 danos, 19 bundles, 167 relações, 34 cenários sintéticos; cobertura PM **19/25**; 115 links candidatos e 10 exceções bloqueadas.
- Novo auditor com mutações adversariais no CI e `npm run qa`; sem teste de campo, limite OEM inventado, peça aprovada ou mudanças aos consumidores.

## [1.3.52] — 2026-10-22 — Coletor de escape: pré-auditoria e barreiras de evidência

- Realizada pré-auditoria de `engine-exhaust` sem ampliar indevidamente a ontologia: fuligem, fissura, vedação de flange, resíduo úmido, eventual fole e desempenho do escape permanecem hipóteses distintas.
- Adicionadas 3 fontes CAT genéricas, 6 discriminações, 8 gates pendentes, 10 controles de segurança e auditor com 36 mutações adversariais; validação no CI.
- Preservados 18 bundles/25 regras PM, ontologia 1.3.16, 115 vínculos candidatos, 10 exceções, contratos/exports públicos e consumidores externos. Nenhuma causa, ensaio, peça ou mapeamento SAP homologado.

## [1.3.51] — 2026-10-22 — Freios: arquitetura, atrito e atuação

- Modelada `brake-disc` no **BUNDLE-18**, com sete condições hipotéticas, quatro ações não executadas e três danos diferenciais não aprovados; 14 relações tipadas.
- Distinguido freio dianteiro em pinça CAT777 (05) do pacote úmido traseiro, multidiscos úmidos dianteiro/traseiro CAT777 (07) e disco úmido de serviço CAT980; nenhuma efetividade por série ou PN declarada.
- Separados desgaste de fricção, danos térmicos, contaminação, arrasto, pressão/energia de atuação, indicador e desempenho do sistema. Baixa desaceleração não prova disco condenado.
- ISO 3450:2011 utilizada apenas pelo escopo de desempenho de serviço, secundário e estacionamento; teste dinâmico improvisado e liberação automática proibidos.
- Ontologia **1.3.16** com 65 condições, 48 ações, 29 danos, 18 bundles, 153 relações e 32 cenários sintéticos; cobertura PM **18/25**, sete pendentes.
- Auditor `pm:brake:disc:audit` com 32 mutações adversariais rejeitadas. Preservados 115 vínculos candidatos, dez bloqueios, 24 FC/15 ME, contratos públicos e consumidores.

## [1.3.50] — 2026-10-22 — Cilindros de implementos: deriva, bypass e válvulas concorrentes

- Criado `BUNDLE-17` para `implement-cylinder` com **8 condições hipotéticas, 5 atividades propostas não executadas, 3 danos diferenciais não aprovados e 16 relações tipadas**.
- Separados fuga externa em vedação/conexão, passagem pelo pistão, deriva não comandada, perda de força/velocidade, danos da haste, desalinhamento, vazamento em válvulas e pressão/vazão insuficientes. **Deriva isolada não comprova falha do pistão nem de sua vedação**.
- Fonte Parker de troubleshooting e fonte Caterpillar de análise hidráulica usadas como referências genéricas, sem transportar ensaios invasivos, pontos de pressão ou limites de outra máquina à frota.
- Política de segurança impede teste de sustentação sem contenção positiva, desconexão sob pressão, diagnóstico automático e aprovação SAP sem evidência.
- Ontologia **1.3.15**: 58 condições, 44 ações, 26 danos, 17 bundles, 139 relações e 30 casos sintéticos; cobertura PM **17/25**, com 8 regras ainda sem bundle.
- Auditor `pm:implement:cylinder:audit` com **32 mutações adversariais rejeitadas**; 25 regras, 115 vínculos candidatos, 10 exceções bloqueadas, 24 FC/15 ME, contratos públicos e consumidores preservados.

## [1.3.49] — 2026-10-22 — Diferencial: coroa-pinhão, folga, contato e apoio

- Modelada a regra existente `differential-gear` (CAT777/CAT980) em **BUNDLE-16** com sete condições, quatro ações propostas e três danos não aprovados, ligados por 14 relações tipadas.
- Separados desgaste/pitting físicos, padrão de contato, backlash, pré-carga/suporte dos rolamentos e sinais genéricos de óleo/ruído. **Backlash não mede pré-carga e sinais do redutor não comprovam engrenagem avariada.**
- Usadas referências gerais ISO 10825-1, CAT e SKF, e Dana/Spicer apenas como comparação metodológica. Nenhum torque, tolerância, PN ou procedimento de outro diferencial foi homologado para CAT777/CAT980.
- Criada política `pm-differential-gear-discrimination.v1.json` e auditor `pm:differential:gear:audit` com **30 mutações adversariais rejeitadas**.
- Ontologia **1.3.14**: 50 condições, 39 ações, 23 danos candidatos, 16 bundles, 123 relações e 28 casos sintéticos. Cobertura 16/25 regras, nove sem bundle.
- Preservados 115 links PM candidatos, dez exceções bloqueadas, 24 FC/15 ME, contrato/conteúdo público 1.0.0, preview 1.3.12 e consumidores anteriores.

## [1.3.48] — 2026-10-22 — Rolamentos do comando final: desgaste, fadiga e vedação

- Novo `BUNDLE-15` para `final-drive-bearing`: quatro condições próprias de rolamento/vedação, três ações propostas e três danos diferenciais não aprovados; **15 relações tipadas**.
- Cinco nós **genéricos do comando final** compartilhados com `final-drive-gear`: quatro condições (partículas, óleo, lubrificação, ruído) e uma proposta de amostragem. Nenhum dano físico compartilhado e nenhuma atribuição automática de origem ou causa.
- Fonte SKF/ISO 15243 distingue desgaste, fadiga de contato e falhas de vedação; não foi presumido rolamento separado, vedação exclusiva, limiar OEM, resultado medido ou evento real em máquina.
- Crosswalk 1.3.48 com **11 conceitos genéricos compartilhados** (antes seis) e zero danos compartilhados; 15/25 regras PM representadas, dez ainda sem bundle.
- Ontologia **1.3.13**: 43 condições, 35 ações, 20 danos candidatos, 15 bundles, 109 relações tipadas e 26 casos sintéticos.
- Auditor `pm:drive:bearing:audit` com **32 mutações adversariais** contra falhas, mapeamentos SAP, evidências e diagnósticos inventados; preservados 25 regras, 115 vínculos candidatos, dez exceções, 24 FC/15 ME, contratos públicos e consumidores.

## [1.3.47] — 2026-10-21 — Engrenagem do comando final: desgaste, pitting, fratura e lubrificação

- Criado `BUNDLE-14` para `final-drive-gear` com **7 condições candidatas**, **4 ações não executadas**, **3 danos físicos não aprovados** (desgaste de dente, pitting, fratura) e 14 relações tipadas.
- Separados sintomas **não localizantes** (ruído, partículas no bujão magnético, laudo, formulação e lubrificação) da constatação direta de dano da engrenagem; rolamento de comando final permanece diagnóstico concorrente.
- Aplicada nomenclatura de aparência ISO 10825-1:2022, sem inferir causa a partir dela; fontes Caterpillar genéricas de bujão, análise SOS e cuidados de óleo com limitações OEM por série e óleo FDAO/TDTO.
- Atualizado crosswalk para prefixo DRIVE em `comando_final` e classificação do meio físico (engrenagem/óleo/conjunto), impedindo alteração indevida para óleo hidráulico.
- Ontologia **1.3.12**: 39 condições, 32 ações, 17 danos, 14 bundles, 94 relações e 24 cenários sintéticos. Cobertura 14/25 regras PM, 11 sem bundle.
- Integrado `pm:drive:gear:audit` com **36 alterações adversariais** contra falsas causas, diagnósticos, dados de óleo, intervenção e aprovações; preservados 115 candidatos PM, dez exceções, 24 FC/15 ME, contratos e consumidores.

## [1.3.46] — 2026-10-21 — Fixadores das sapatas: pré-carga, afrouxamento e fratura

- Adicionado `BUNDLE-13` à regra existente `track-bolt-loose`: quatro condições hipotéticas (fixador frouxo/ausente, rotação suspeita, assentamento do assento e fratura), três atividades propostas e dois danos candidatos não aprovados; nove arestas tipadas.
- Distinguida perda de pré-carga sem rotação (assentamento/relaxação), autoafrouxamento rotacional e fratura/fadiga; indício visual não autoriza diagnóstico causal.
- Referências Caterpillar de inspeção do rodante e método torque-turn e Nord-Lock de mecanismos de aperto, **sem importar torques, ângulos, sequência ou números de peça**.
- Auditor `pm:track:bolt:audit`, matriz de quatro diferenciais, 22 cenários sintéticos e **32 mutações adversariais rejeitadas**; zero torque medido, falha confirmada, serviço executado ou mapeamento SAP homologado.
- Ontologia **1.3.11**: 32 condições, 28 ações, 14 danos candidatos, 13 bundles e 80 relações. Cobertura das 25 regras passa a **13 com bundle**, 12 ainda sem bundle.
- Preservados 115 links PM candidatos, dez exceções bloqueadas, 24 FC/15 ME, contratos e consumidores públicos anteriores.

## [1.3.45] — 2026-10-21 — Abrasão versus vazamento de mangueira hidráulica

- Adicionado `BUNDLE-12` a `hydraulic-hose-abrasion`: quatro condições (desgaste de cobertura, armadura exposta, interferência e deformação), duas ações propostas e hipótese de dano do reforço não aprovada; sete novas arestas.
- Armadura exposta exige avaliação de retirada segura e substituição segundo OEM, mesmo sem vazamento; não demonstra ruptura interna, ocorrência real ou causa raiz.
- Mantida a separação de `hydraulic-hose-leak` e os dois bloqueios HSVV `subgroup_not_in_scope`.
- Corrigido rótulo “Abrasion” para “Abrasão” sem alterar identidade nem evidência.
- Ontologia 1.3.10: 28 condições, 25 ações, 12 danos, 12 bundles e 71 arestas, com 20 cenários e 24 regressões adversariais rejeitadas.
- Cobertura semântica 12/25 regras (13 ainda sem bundle), 115 candidatos PM, dez bloqueios e 24 FC/15 ME; contratos públicos e consumidores mantidos.

## [1.3.44] — 2026-10-21 — Ventilador de arrefecimento e rótulo de dano não confirmado

- Corrigida a descrição `DMG-COOL-INTERNAL-BLOCKAGE` de “Obstrução interna efetiva do trocador de calor” para **“Possível obstrução interna do trocador de calor sob investigação”**. ID, status `confirmed:false` e campos de mapeamento SAP permanecem.
- Criados **2 bundles semânticos** `cooling-fan-bearing` e `cooling-fan-belt`, com **4 condições hipotéticas, 4 ações propostas, 2 danos diferenciais não aprovados e 10 relações tipadas**, sem declarar a existência de correia ou rolamento efetivo por modelo/série.
- Ontologia atualizada para **1.3.9**: 24 condições, 23 ações, 11 danos hipotéticos, 11 bundles, 64 relações e 18 cenários sintéticos.
- Cobertura de regras PM aumentou de **9/25 para 11/25**; **14 regras** seguem sem bundle e seis compartilhamentos genéricos continuam controlados.
- Integrado auditor `pm:cooling:fan:audit` com **26 mutações adversariais rejeitadas**, verificação de fontes CAT/SKF e limitações de acionamento, configuração OEM e segurança.
- Validações anteriores de IDLER/ROLLER e crosswalk ajustadas à versão ontológica, sem relaxar as invariantes de causalidade. Preservados 25 padrões PM, 115 vínculos candidatos, 10 exceções bloqueadas, 24 FC/15 ME, contratos e consumidores públicos.

## [1.3.43] — 2026-10-21 — Crosswalk semântico transversal de regras PM

- Auditadas as **25 regras PM** quanto à cobertura semântica: **9 possuem bundles** explícitos de condições/ações/danos e **16 permanecem sem bundle**, evitando anunciar cobertura completa equivocadamente.
- Detectados e documentados **6 nós compartilhados** entre pares de regras: água, sedimentos e amostra representativa de combustível; fuga externa, baixa pressão e verificação de pressão hidráulica. Todos são conceitos genéricos de sistema, **zero danos físicos compartilhados**.
- Política de validação confere sistema, natureza do conceito, vínculo, ausência de observação/execução e isolamento IDLER/ROLLER; **29 mutações adversariais rejeitadas** (20 de ontologia e 9 de política).
- Identificado rótulo `DMG-COOL-INTERNAL-BLOCKAGE` com “obstrução interna efetiva”, apesar de `confirmed:false` e revisão não aprovada: pendência editorial, sem alteração silenciosa do catálogo.
- CI/report `pm:semantic:crosswalk:audit`, matriz de discriminação por compartilhamento e inventário de regras sem ontologia. Preservados 25 regras, 115 vínculos candidatos, 10 bloqueios, 24 FC/15 ME, contrato/conteúdo públicos 1.0.0, preview 1.3.12 e consumidores.

## [1.3.42] — 2026-10-21 — Correção da ontologia: roda-guia ≠ rolete

- Adicionadas duas condições específicas da roda-guia (aquecimento localizado suspeito e vestígio oleoso suspeito), além de ação de inspeção de sua vedação/detritos, **todas não observadas e não executadas**.
- `BUNDLE-09` deixa de referenciar `COND-TRACK-ROLLER-HEAT` e `ACT-TRACK-ROLLER-SEAL-CHECK` e passa a referenciar exclusivamente conceitos `TRACK-IDLER`. `BUNDLE-08` e todos os IDs históricos de rolete foram preservados.
- Rótulo `DMG-TRACK-IDLER-WEAR` alterado de “Desgaste confirmado” para **“Desgaste da roda-guia ou dano do apoio interno sob investigação”**, sem alterar `confirmed:false`, revisão pendente ou códigos SAP.
- Ontologia `1.3.8`: 20 condições, 19 ações, 9 danos hipotéticos, 9 bundles e 54 relações tipadas; 16 fixtures sintéticos após dois casos adicionais. Auditor com 24 mutações adversariais rejeitadas e vínculo SAP bloqueado.
- Validação integral de contratos de exportação: 25 regras PM, 115 vínculos candidatos, dez exceções, 24 FC/15 ME, contrato/conteúdo públicos 1.0.0, preview 1.3.12 e consumidores inalterados.

## [1.3.41] — 2026-10-21 — Roda-guia IDLE: desgaste externo, rolamento interno, vedação e CTS

- Escopo real `track-idler-wear`: **221 caminhos** nos modelos da regra, 40 em UNCR, oito em IDLE. O tipo de objeto IDLE contém oito ocorrências de eixo e oito de guia genérica, mas **zero ocorrências de Rolamento**.
- Em subgrupos UNCR adjacentes, oito ocorrências de Rolamento pertencem a `TRF1/ROLL` e `TRF2/ROLL`, com combinação cadastral 02.01/C1.04 permitida; **rolamento de rolete não pode ser remapeado para roda-guia**.
- A análise revelou empréstimo semântico no bundle IDLE: condição `COND-TRACK-ROLLER-HEAT` e atividade `ACT-TRACK-ROLLER-SEAL-CHECK` referem-se a roletes e não são prova nem inspeção efetiva da roda-guia.
- Plano com quatro mecanismos diferenciais e seis requisitos CTS/OEM/BOM/SAP/segurança/revisão independente. Rótulo `DMG-TRACK-IDLER-WEAR` usa a palavra “confirmado” em hipótese não confirmada; pendência editorial identificada sem promover estado.
- Scanner de descrições e tipo de objeto, 10 casos lexicais e 14 mutações adversariais, adicionados ao QA/CI, com relatório agregado, sem PN, percentual CTS ou evidências falsas.
- Preservados 25 padrões PM, 115 vínculos candidatos, 10 bloqueios, 24 FC/15 ME, contrato e conteúdo públicos 1.0.0, preview 1.3.12 e consumidores.

## [1.3.40] — 2026-10-21 — Filtro de óleo do motor: LUSY × ETBE/IKSY

- Verificada no catálogo real a ausência de componentes com texto de filtragem em **8 caminhos ENGN/LUSY**, embora o subgrupo exista nos modelos de destino.
- Varredura conservadora identifica **16 caminhos em outros subgrupos ENGN** com descrições de filtro, correspondentes a 40 ocorrências de texto, porém apenas **8 ocorrências explicitamente relativas a óleo**, concentradas em ETBE; IKSY contém referências de ar, não equivalentes a filtro de óleo.
- Os oito registros de óleo permitem o par 03.02/C2.09 **no catálogo**, sem afirmar peças distintas, montagem física, falha, causa ou homologação de remapeamento ETBE → LUSY.
- Adicionado scanner com isolamento por modelo, raiz, grupo e subgrupo, 9 testes lexicais e 13 mutações adversariais, relatório público agregado e CI.
- Separadas na ontologia já existente pressão diferencial no filtro, partículas no óleo e baixa pressão de lubrificação, sem inventar testes executados, periodicidades ou limites OEM.
- Mantidos 25 padrões PM, 115 vínculos candidatos, 10 bloqueios sem aprovação, 24 FC/15 ME, contrato e conteúdo públicos 1.0.0, preview 1.3.12 e consumidores inalterados.

## [1.3.39] — 2026-10-21 — Triagem semântica PM de arrefecimento e combustível

- Duas regras P0 com par dano/causa bloqueado agora possuem **roteiros de revisão não executáveis** derivados da ontologia existente: `cooling-radiator-blockage` e `fuel-tank-water`.
- Separadas cinco hipóteses de investigação: obstrução externa de aletas, restrição interna de líquido, temperatura elevada sem causa localizada, água no combustível e sedimentos; condições e ações **não são ocorrências nem danos**.
- Diferencial de dano preservado somente como hipótese não aprovada para restrição interna do núcleo ou falha de dreno, exigindo teste independente e revisão competente.
- Criados plano JSON, biblioteca de validação, gerador de relatório PCM, 16 ataques sintéticos de plano e 10 de relatório, integrados ao CI com reconciliação de 25 regras, 115 vínculos candidatos e 10 bloqueios.
- Nenhuma nota/ordem SAP criada, valor observado, teste executado, código OEM inventado ou alteração na taxonomia. Mantidos 24 FC/15 ME, contrato/conteúdo públicos 1.0.0, preview 1.3.12 e consumidores.

## [1.3.38] — 2026-10-21 — Matriz documental de decisão VPAR por circuito

- Transformadas duas descrições distintas de filtragem no tipo de objeto AISY/COMR/VPAR em **8 cenários editoriais**, cruzando os dois códigos com quatro funções físicas concorrentes (admissão, óleo, separação ar–óleo, reservatório); sem afirmar instalação nem função efetiva.
- Implantada matriz de **sete requisitos por cenário** (configuração, BOM, diagrama, estrutura SAP, discriminação, segurança e revisão independente): 56 verificações pendentes, **zero evidências recebidas**. As verificações são questões, não ordens de serviço ou ativos adicionais.
- Relatório com pseudônimos locais C01/C02: C01 tem descrição ambígua e um par 03.02/C2.09 permitido no catálogo; C02 sugere separação de água, mas par não permitido. A permissão catalogada **não confirma falha real**.
- Biblioteca, plano e auditor v1.3.38 confrontam dados reais do catálogo com proveniência, contraprovas e 19 modificações adversariais rejeitadas; integrados ao CI antes da exportação pública.
- Nenhum novo mapeamento SAP/OEM, PN, revisão de campo, FC, ME ou consumidor. Permanecem 25 regras PM, 115 vínculos candidatos, 10 bloqueios, 24 FC / 15 ME e contrato/conteúdo públicos 1.0.0 (preview 1.3.12).

## [1.3.37] — 2026-10-21 — Proveniência de componentes de filtragem em VPAR

- Reconciliados os **2 códigos distintos** com descrições filtrantes de 1 tipo de objeto SAP, repetido em **2 caminhos AISY/COMR/VPAR** (EQ05/EQ06): **4 ocorrências** de descrição não significam quatro componentes diferentes.
- Dos 2 códigos distintos, **1 permite** o par catalogado 03.02/C2.09, contabilizado duas vezes por localização; **zero causas/instalações homologadas**.
- Verificado que o tipo de objeto aparece apenas nos dois caminhos VPAR do catálogo disponível (**0 outras localizações de nível 3**); inexistência de reutilização transversal no lote não prova composição BOM nem efetividade OEM.
- Classificador textual conservador separa pistas de admissão, filtragem de óleo, separação ar/óleo, água e ambiguidade sem deduzir função; fontes públicas Sandvik CAT C18/Cummins registradas como contexto sem aplicabilidade por série.
- Auditor de proveniência, verificador de campos proibidos e 22 verificações sintéticas (6 de hierarquia, 7 linguísticas e 9 promoções adversariais), integrado ao QA/CI. Não alterados os 115 vínculos PM, 10 bloqueios, 24 FC, 15 ME, contrato/conteúdo públicos 1.0.0, preview 1.3.12 e consumidores.

## [1.3.36] — 2026-10-21 — Triagem estrutural de filtragem FUSY e COMR

- Implementada varredura real dos locais de 3º nível e componentes por tipo de objeto em `scripts/pm-filtration-scan.mjs`, preservando modelo, raiz e grupo, para detectar descrições de filtro/separador fora do subgrupo original **sem gerar vínculo**.
- **Combustível:** 307 caminhos elegíveis por modelo, 16 no grupo FUSY, **0 componentes com descrição de filtragem**, nenhuma indicação de mapeamento aprovado.
- **Compressor:** 94 caminhos por modelo, 12 em AISY/COMR; caminho candidato **VPAR** em EQ05/EQ06, com 4 ocorrências de descrição de filtragem/separação e 2 ocorrências de compatibilidade de código dano/causa. As contagens não representam peças instaladas ou estados de falha.
- Catalogadas quatro fontes públicas primárias Cat/Sandvik; evitada interpretação indevida da atualização de **módulo de bombas** como mudança no compressor de ar.
- Adicionado auditor `pm:filtration:audit` com provas de limite de evidência, testes de filtragem por grupo e verificações adversariais, executado no CI.
- Dez exceções PM-SAP permanecem bloqueadas. Inalterados 115 vínculos candidatos, 24 FC / 15 ME, contrato e conteúdo públicos 1.0.0, preview 1.3.12 e consumidores.

## [1.3.35] — 2026-10-21 — Fronteiras de classificação HSVV e COMR

- Centralizada na geração PM a verificação de modelo, nível de local funcional, sistema/grupo e subgrupo, sem promover grupo a subgrupo.
- Adicionada auditoria dinâmica de caminhos catalogados HSVV/COMR e 23 verificações sintéticas (15 casos de hierarquia e oito mutações adversariais).
- Quatro bloqueios examinados permaneceram sem revisão homologada: duas mangueiras hidráulicas HSVV, filtro de combustível HSVV e filtro de compressor COMR.
- Nenhum dado OEM, série, local SAP, PN, inspeção física, falha observada ou aprovação inventado. Preservados 24 FC / 15 ME, conteúdo e contrato públicos 1.0.0, preview 1.3.12 e consumidores.

## [1.3.34] — 2026-10-21 — Auditoria estrutural das 25 regras PM × SAP

- **Endurecido** o `scripts/validate-pm.mjs`: cada vínculo gerado precisa coincidir com modelo elegível, raiz e grupo, subgrupo, localização SAP, tipo de objeto, componente e texto da regra, par dano/causa, sintoma, método e identidade da geração.
- Rejeita vínculos duplicados, omitidos, inconsistentes ou com ocorrências, inspeções, correspondências SAP e conclusões indevidamente promovidas a **observadas/homologadas**.
- Adicionado `scripts/audit-pm-system-scope.mjs`: contagem dinâmica dos **25 padrões** por modelos elegíveis, subgrupos encontrados, raízes funcionais compatíveis, componentes compatíveis e pares dano/causa válidos; classifica bloqueios sem criar associações forçadas.
- Incluídas **24 mutações adversariais** sobre vínculos reais gerados, além da reconciliação dos **25 registros de regras** e testes específicos de sistemas com subgrupos potencialmente compartilhados.
- Relatório reproduzível `reports/pm-system-scope-audit.generated.json`, integração em `npm run qa` e GitHub Actions, métricas do auditor de qualidade e [guia técnico](docs/AUDITORIA_PM_ESCOPO_FUNCIONAL.md).
- **10 exceções PM-SAP continuam sem liberação de evidência** e nenhum local SAP, PN, procedimento OEM, falha observada ou causa foi inventado.
- Núcleo FMEA **24 FC / 15 ME**, contrato e conteúdo públicos 1.0.0, preview 1.3.12, checksum e consumidores inalterados.

## [1.3.33] — 2026-10-21 — Handoff externo para solicitação OEM D9

- Aberta [issue #31](https://github.com/pedromaintenance/fmea-database-mining/issues/31) com **ação externa real pendente**: designação do destinatário/canal corporativo e encaminhamento da solicitação já preparada.
- [Controle de handoff](data/governance/d9-external-handoff.v1.json): quatro marcos separados (rota, envio, recebimento e análise independente), associados 1:1 aos sete gates originais.
- [Guia de envio e comprovação](docs/D9_HANDOFF_ENVIO_OEM.md) orienta as áreas técnicas, a custódia de SIS/OMM, série e dados SAP, o registro privado do comprovante e a atualização responsável do backlog.
- [Validador](scripts/validate-d9-handoff.mjs), [schema](schemas/d9-external-handoff.schema.json) e **27 casos sintéticos** (7 baselines + 20 tentativas de falsear envio, aprovação, resultados ou dados internos) integrados ao QA/CI.
- **A criação de issue pública não comprova envio ao destinatário corporativo**; o pedido permanece não enviado e os sete requisitos de OEM/inspeção bloqueados.
- Contrato e conteúdo públicos 1.0.0, preview 1.3.12, 24 FC, 15 ME e consumidores preservados.

## [1.3.32] — 2026-10-21 — Pesquisa pública OEM de material rodante D9

- Revisadas **5 referências públicas oficiais Caterpillar**, duas já catalogadas e três adicionadas à matriz específica de pesquisa, sem reprodução de material licenciado.
- Distinguida a oferta de conjuntos General Duty/Heavy Duty/HDXL para a família D9–D11 da **identificação do conjunto realmente instalado**, que continua pendente.
- Orientação geral para inspeção de fixadores, roletes, detritos, tensionamento, método torque-turn e monitoramento CTS Pro classificada como **não efetiva para série/arranjo específico**.
- Relacionadas as fontes a 7 requisitos D9, inclusive marcando explicitamente que **dados SAP corporativos não podem ser fundamentados por páginas públicas Caterpillar**.
- Criados [guia de evidência](docs/PESQUISA_PUBLICA_OEM_D9.md), [matriz JSON](data/research/d9-public-oem-literature.v1.json), schema, validador e **31 regressões sintéticas** no QA/CI.
- **Não foi enviada solicitação**, não houve acesso a SIS licenciado, inspeção física, confirmação de PN/torque/CTS, aprovação independente, dado de campo ou alteração no núcleo FMEA/SAP.
- Preservados os **24 FC e 15 ME**, contrato/conteúdo públicos 1.0.0, preview 1.3.12 e checksum; nenhum consumidor alterado.

## [1.3.31] — 2026-10-21 — Pedido técnico OEM para piloto D9

- Preparado [pedido de documentação](data/governance/d9-oem-evidence-request.v1.json) com **7 gates originais**: prefixo/série, OMM efetivo, desenhos/BOM, procedimento de junta sapata–elo, CTS, dados SAP e parecer de campo.
- Estados preservados: **2 não fornecidos, 4 não verificados, 1 revisão não executada**; nenhuma fonte foi marcada como recebida, solicitada a destinatário real ou aprovada.
- Disponibilizado [texto pronto para encaminhamento interno](docs/SOLICITACAO_TECNICA_OEM_D9.md), com disciplina competente, sequência de verificação, instruções de custódia e contraprova.
- Delimitadas **cinco etapas de inspeção posterior**, todas pendentes, com controle de energias e efetividade OEM como pré-condições, sem PN, torque, tolerâncias CTS ou série presumidos.
- Implementados schema e **35 regressões sintéticas** (7 baselines e 28 recusas de documento/inspeção/aprovação fictícia), adicionados ao QA/CI.
- Preservados **24 FC / 15 ME**, contrato e conteúdo públicos 1.0.0, preview 1.3.12, checksum histórico e consumidores.

## [1.3.30] — 2026-10-21 — Consolidação de bloqueios e dependências reais

- Consolidada uma matriz de **8 frentes**, com ponteiros verificados a documentos existentes: 7 insumos D9, 10 regras PM × SAP, 24 revisões FC, 48 alegações sistêmicas, 3 CAND, 4 refinamentos ME, 7 componentes de TI e 6 aceites de staging.
- Mantidas **unidades distintas** e ressaltadas sobreposições: não há afirmação de 109 tarefas independentes.
- Identificadas disciplinas proprietárias **institucionais**, próximos passos verificáveis e requisitos de liberação, sem inventar engenheiros responsáveis, prazos de empresa, números OEM, aplicações SAP ou pareceres realizados.
- Separados cinco caminhos lógicos: documentação/OEM, mecanismos físicos, aderência SAP, causa sistêmica e staging privado; prioridades P0/P1 são **sugestões editoriais**, não SLA oficial.
- Adicionado [validador](scripts/validate-consolidated-blockers.mjs) de procedência com **40 regressões sintéticas** (8 baselines + 32 tentativas adversariais), JSON Schema e integração QA/CI.
- Nenhuma evidência de campo, responsável nomeado, autorização corporativa, nova cadeia FC/ME ou consumidor foi alterado; contrato/conteúdo público 1.0.0, preview 1.3.12 e golden checksum preservados.

## [1.3.29] — 2026-10-21 — Catálogo de remediação e recorrência

- Criados **4 perfis editoriais** para controle reprovado, evidência inconclusiva, erro de infraestrutura/verificador e reincidência transversal.
- Cada perfil tem cinco atividades e cinco classes de evidência, sem declarar que a ação foi executada ou que a causa material foi confirmada.
- Reincidência no mock: **≥2 runs distintos em 30 dias**, no mesmo tenant, cenário, probe e classificação; limiar **exclusivamente sintético**, sem aprovação de SLA corporativo.
- Preservado o resultado negativo original; impedidos recontagem de run, mistura de escopos, autorização de segurança fictícia, encerramento de incidente e liberação operacional/SAP/FMEA.
- Criados JSON Schema, biblioteca offline de correlação e propostas, **52 regressões sintéticas** (12 históricos + 40 tentativas adversariais), QA/CI, métricas e runbook.
- **Zero** ações reais, revisores efetivos, incidentes corporativos ou causas homologadas. Contrato e conteúdo público 1.0.0, preview 1.3.12, checksum histórico e consumidores preservados.

## [1.3.28] — 2026-10-21 — Triagem de resultados falhos e inconclusivos

- Diferenciadas três naturezas de resultado: **controle reprovado**, **prova insuficiente** e **erro de infraestrutura/verificador**, nenhuma interpretada como causa mecânica.
- Modelado histórico sintético de sete ações: abertura, pedido de esclarecimento, recebimento, determinação de reteste, novo run, revisão independente solicitada e decisão motivada.
- Regras de segregação entre solicitante, custodiante, revisor técnico e independente; resultado final condicionado a `pass`, `fail` ou `inconclusive`, sem aceite corporativo automático.
- Biblioteca offline com validação dos IDs, sequência cronológica, identificador de reteste novo, vínculos entre tenant/caso/run, revisão distinta e cadeia SHA-256 ancorada **somente em simulação**.
- Acrescentados schema, QA/CI, métricas e **64 casos sintéticos** (24 baselines e 40 mutações), incluindo retenção da prova original e rejeição de encerramento indevido.
- Preservados núcleo 24 FC/15 ME, contrato e conteúdo público 1.0.0, preview 1.3.12 e checksum original; nenhum consumidor, caso OEM ou ativo real modificado.

## [1.3.27] — 2026-10-21 — Contrato de custódia privada e revisão de resultados de staging

- Adicionado contrato de recibo **exclusivamente privado**, com 4 atestações encadeadas: serviço do teste, custodiante, revisor técnico e revisor independente.
- Criado validador offline de Ed25519 com chaves **efêmeras de testes**, hash/digest de afirmações, registro externo de chaves confiáveis injetado e verificação de separação dos atores e sequência dos pareceres.
- Verificações de validade de assinatura, papel vinculado à chave, revogação simulada, relógio, tenant/caso, 4 controles STG por cenário, evidências opacas, revisão de hipóteses concorrentes e referências aos hashes anteriores.
- Incluídas **48 regressões sintéticas (8 positivos + 40 ataques)**, schema restritivo, documentação, integração ao `npm run qa` e GitHub Actions.
- **0 casos reais, 0 chaves ou identidades corporativas, 0 pareceres reais, 0 aprovação OEM/Segurança, 0 causa raiz**. Assinatura criptográfica de dado sintético não atesta veracidade técnica.
- Contrato público 1.0.0, conteúdo 1.0.0, preview 1.3.12 e checksum conservados; 24 cadeias FC e 15 mecanismos ME sem alterações, nenhum consumidor editado.

## [1.3.26] — 2026-10-21 — Contrato de integração e adaptador offline para staging
- Criado contrato `executeProbe` com 8 cenários, **32 controles obrigatórios** e formato de resposta sem conteúdo restrito ou decisão humana simulada.
- Implementado adaptador `offline_mock` determinístico que recusa casos não sintéticos e **não faz requisições a IdP, cofre, API, SIEM ou backup**.
- Adicionados JSON Schema de envelope público `TEST-*`, validação de identidade/correlação, integridade dos 4 resultados por cenário e recusa de payload não previsto.
- **56 regressões sintéticas** no CI/QA: 8 envelopes completos, 32 falhas de controle e 16 alterações de identidade, modo real, campos confidenciais ou aprovação falsa rejeitadas.
- Arquitetura e runbook v1.3.24–25 preservados, incluindo **0 serviços corporativos provisionados** e seis aceites manuais pendentes; nenhuma falha mecânica homologada.
- Contrato público e conteúdo 1.0.0, preview 1.3.12 e checksum original preservados; nenhum consumidor alterado.

## [1.3.25] — 2026-10-21 — Pacote de homologação de staging restrito
- Especificados **8 domínios de aceite** e **32 verificações obrigatórias**: identidade/revogação, isolamento de casos, revisões independentes, custódia OEM, auditoria, restauração, retenção/hold e exportação pública.
- Definidos responsáveis, evidências de aprovação exigidas, seis gates de aceite corporativo e dependências externas ainda não atendidas.
- Criados schema, funções puras de avaliação e **52 regressões sintéticas** (8 cenários-modelo positivos, 32 faltas de controle rejeitadas, 12 mutações de resultados/assinaturas rejeitadas); QA, CI e indicadores integrados.
- A marcação `eligible_for_manual_staging_review` de um teste sintético **não equivale a execução/homologação de staging, nem autorização de usar laudos ou OEM reais**.
- Arquitetura v1.3.24 preservada sem serviços provisionados; núcleo de 24 FC e 15 ME, contrato público 1.0.0 e preview 1.3.12 inalterados. Nenhum consumidor modificado.

## [1.3.24] — 2026-10-21 — Blueprint corporativo restrito, RBAC, auditoria e descarte

- Definida arquitetura de **7 componentes** dependentes de TI/Segurança, com responsabilidades e status explicitamente `live=false`.
- Construída **matriz RBAC de 8 papéis** e 11 operações, com negação por padrão, MFA, atribuição ao caso, segregação de revisão e bloqueio de exportação pública.
- Incluída demonstração isolada de logs encadeados por SHA-256 com âncora externa **simulada**; não é log WORM, assinatura digital nem prova contra administrador que possa regravar âncoras.
- Modelada elegibilidade sintética para revisão de descarte: prazo aprovado pela organização (nenhum valor fixo), `legal hold`, fechamento, cópias/backup, dupla autorização e comprovante planejado; sem API de exclusão.
- Adicionados **42 testes sintéticos** (20 autorização, 10 auditoria, 12 retenção), JSON Schema, `npm run infrastructure:restricted:validate`, QA/CI e métricas de implantação.
- Preparado documento de arquitetura, riscos, responsabilidades e critérios de aceite de homologação; zero controle real provisionado, zero documentos/casos reais, nenhum consumidor alterado. Contrato e preview público preservados.

## [1.3.23] — 2026-10-21 — Protocolo de evidências restritas e custódia
- Especificados 6 estados de revisão, 5 papéis, 5 categorias de evidência, verificação de custódia/licença e parecer técnico e independente segregados.
- Novo JSON Schema para metadados restritos, gate puro sem persistência e **29 regressões inteiramente sintéticas** (5 transições permitidas, 24 rejeições de falhas de segurança/causalidade).
- Inserida política pública do que pode e não pode ser compartilhado: sem laudos, séries, PNs, arquivos OEM, fotos, dados pessoais, links internos ou hashes derivados de documentos privados.
- Último estado `ready_for_change_control` **não** autoriza publicação, alteração de FMEA, confirmação de causa raiz ou liberação operacional.
- QA/CI, auditor de qualidade, documentação, roadmap e versão do pacote atualizados.
- 0 casos reais, 0 documentos privados ingeridos, 0 alterações OEM/SAP e 0 mudanças em consumidores; contrato e preview públicos preservados.

## [1.3.22] — 2026-10-21 — Perda volumétrica interna e três submodos de flancos
- Proposta editorial `ME-CAND-HYD-INTERNAL-LEAKAGE-001`: vazamento interno acima do requisito OEM em condições controladas; não confundir vazão normal de projeto, dreno de carcaça, ME-15 nem causas como desgaste.
- Decomposto o candidato de dano de engrenagens em três submodos conceituais distintos: abrasão `ME-01`, adesão `ME-02` e fadiga de contato `ME-03`, todos sem dano observado.
- A referência ISO 10825-1 foi mantida apenas como **nomenclatura de aparência**, sem alegar que ela fornece causa ou prevenção.
- Adicionada referência pública do catálogo Parker de bomba de palhetas com ressalva explícita de **não aplicabilidade por série à CAT 395**.
- Validador, JSON Schema e **24 regressões sintéticas** incorporados ao QA e GitHub Actions, com contadores de qualidade.
- **0 IDs ME/FC aprovados**, **0 limites OEM inventados**, **0 ocorrências**, nenhum consumidor alterado. Preview/contrato públicos preservados.

## [1.3.21] — 2026-10-21 — Auditoria de coerência das três candidatas de cadeia
- Três propostas `CAND-*` avaliadas contra as 10 classes de falha funcional e os 15 mecanismos da ontologia, sem editar quaisquer IDs `FC-*`.
- Vedação externa da bomba: FF-06 / ME-15 condicional; perda volumétrica interna: FF-02 e lacuna ontológica; flancos de engrenagem: FF-02 e necessidade de separar ME-01/ME-02/ME-03.
- Auditadas **seis sobreposições conceituais** com cadeias atuais, preservando fronteiras de componente e impedindo transplantar bomba de água para bomba hidráulica.
- Registrados efeitos locais/sistêmicos **possíveis, não observados**, contraprovas e três gates de promoção por candidata.
- Validador, JSON Schema e **21 regressões sintéticas (3 baseline + 18 mutações)** integrados a QA/CI; métricas e documentação atualizadas.
- **0 cadeias aprovadas, 0 efeitos medidos, 0 causas confirmadas, 0 revisões OEM/independentes**; conteúdo e contrato públicos congelados, sem mudanças em consumidores.

## [1.3.20] — 2026-10-20 — Triagem de cinco lacunas e propostas mecânicas não homologadas
- Reclassificadas as cinco hipóteses PB–FC sem equivalência: **três candidatas a cadeia física** e **duas interpretações que não configuram modos de falha**.
- Propostos em coleção interna separada mecanismos de vedação externa e perda interna de entrega de bomba hidráulica, e degradação superficial de dentes de engrenagem de comando final; sem incorporação às 24 cadeias existentes.
- Óleo escorrido permanece hipótese de localização da origem; perfil químico de óleo sem dano permanece condição de fluido/baseline, não causa raiz.
- Adicionadas quatro referências técnicas públicas (Caterpillar bombas e lubrificação de transmissão, Parker bombas de palhetas com restrição de transferência, ISO 10825-1 somente resumo público).
- Criados JSON Schemas e validador `causal:gaps:validate` com **21 regressões sintéticas**; integrados ao CI, QA, métricas e documentação.
- **0 cadeias promovidas, 0 pareceres OEM, 0 evidências de campo, 0 vínculos SAP aprovados**, contrato e conteúdo públicos intactos, sem alterações de consumidores.

## [1.3.19] — 2026-10-20 — Cobertura documental 12/12 playbooks e crosswalk PB–FC
- Concluídos seis deepdives por ID: CAT 395 bomba hidráulica e mangueira; CAT 6030 arrefecimento; CAT 777 comando final; CAT D9 material rodante; CAT 980 radiador. Total documental **12/12 playbooks**, sem casos executados.
- Adicionadas **18 etapas discriminantes** e **24 condições de prontidão**, mantendo H1/H2/H3 e testes T1/T2 literalmente rastreáveis à origem.
- Criada matriz PB–FC de **18 hipóteses**, **18 vínculos mecanísticos candidatos** em 13 hipóteses, **5 lacunas explícitas** e **0 vínculos homologados**; proibido transformar bomba d’água em bomba hidráulica por semelhança lexical.
- Incorporadas **46 regressões sintéticas** de prontidão, mutações de segurança e vínculo falso; validador, CI, indicadores, documentação e schemas.
- Nenhuma série, PN, medida OEM, evidência de campo, causa raiz ou consumidor alterado. Contrato público 1.0.0 e conteúdo 1.0.0, com preview original preservado byte a byte.

## [1.3.18] — 2026-10-20 — Seis playbooks com diagnóstico diferencial rastreável
- Construídos **6 roteiros técnicos vinculados aos IDs reais `PB-*`**, com comparação H1/H2/H3 preservada integralmente em relação aos cenários originais, 18 estágios propostos e 24 requisitos documentais de prontidão.
- Escopos: cilindro CAT 980; avanço DR410i; compressor/pneumática DI650i; pneus CAT 16; combustível CAT 777; lubrificação do motor CAT 6030.
- Criados JSON Schema, validador estrito e **34 cenários sintéticos** (18 de prontidão e 16 mutações de segurança, causalidade e vinculação), integrados a `npm run qa` e GitHub Actions.
- Três novas referências bibliográficas públicas: Michelin (inspeção/pressão de pneus) e Sandvik DI650i S5 (arquitetura específica daquela variante, sem efetividade na frota).
- Escopo explícito: **6/12 playbooks com deepdive por ID neste lote**; 6 caminhos causais anteriores não equivalem automaticamente a 6 outros playbooks aprofundados.
- Sem execução, resultados reais, homologação OEM, identificação SAP ou causa confirmada; contrato público 1.0.0, conteúdo 1.0.0 e checksum anterior preservados.

## [1.3.17] — 2026-10-20 — Diagnóstico diferencial aprofundado, segundo lote
- Adicionados 3 roteiros técnicos condicionais às 3 investigações originais, totalizando **6 aprofundados** dentro de 12 playbooks didáticos do banco; os 3 originais v1.3.11 foram mantidos íntegros.
- Novos temas: restrição externa da colmeia × ventilação insuficiente (`FC-COOL-001`); detritos compactados × falha interna de rolete (`FC-TRACK-001`); bomba de arrefecimento × termostato/bypass (`FC-COOL-007`).
- Inseridos 9 passos, 12 exigências de evidência e **21 regressões sintéticas** (9 checklists + 12 bloqueios de mutação) sem ensaios, efetividade OEM ou diagnósticos observados.
- Novo validador, JSON Schema, comandos CI/QA e cobertura no auditor de qualidade. **Nenhum dado real, PN, torque, tolerância, limite CTS ou atribuição causal confirmado.**
- Preservados conteúdo público 1.0.0, contrato 1.0.0, preview 1.3.12 e seu SHA-256 fixo; consumidores não modificados.

## [1.3.16] — 2026-10-20 — Gate PM × SAP e preparação documental CAT D9
- Revisadas as **10 exceções sem vínculo estrito** (3 subgrupos fora de escopo, 5 componentes ausentes, 2 pares dano–causa incompatíveis) com documentação mínima, contraprovas e decisão de manter bloqueio.
- Criado plano D9 para **7 requisitos OEM** e 8 cadeias de rodante: série/arranjo, OMM, peças, torque-turn, CTS, dados SAP e revisão independente; sem comprovação de efetividade.
- Novo validador independente com **16 mutações sintéticas**, integrado ao pipeline CI e métricas de qualidade; bloqueios contra série, peças, inspeções, limites CTS e links SAP inventados.
- Consulta adicional à documentação pública Caterpillar para escopo geral de inspeção e medição, sem transcrever literatura licenciada nem declarar valores para D9.
- **0 remapeamentos SAP aceitos**, **0 causas confirmadas**, **0 homologações OEM**, sem modificação do contrato público 1.0.0, conteúdo público 1.0.0 ou consumidores.

## [1.3.15] — 2026-10-20 — Releases de conteúdo público independentes
- Criada versão **conteúdo 1.0.0**, distinta do pacote interno 1.3.15, contrato 1.0.0 e preview histórico 1.3.12; é uma baseline retrospectiva, não atualização do conteúdo entregue.
- Guardada uma cópia golden completa do preview (24 cadeias, 20 referências), vinculada ao SHA-256 histórico `b780a1c95e6f2ab5b3fb1f9acd20a63a1a5abd0e3f3ed111f61052b2e8c59c65`.
- Criados registry, política, JSON Schema, comparador conservador e validador de snapshots/versões, com proibição de promoção causal e de remoção de IDs sem migração.
- Adicionados **17 cenários sintéticos** de patch/minor/rejeição e teste de adulteração do hash, integrados ao GitHub Actions e auditor de qualidade.
- Nenhum dado mecanicista, causa, efeito, evidência, valor OEM ou consumidor modificado. Liberação operacional continua proibida.

## [1.3.14] — 2026-10-20 — Auditoria sistêmica completa de 24 cadeias
- Adicionadas seis revisões de alegações sistêmicas dos três roteiros de v1.3.11, cada uma com duas evidências independentes e uma explicação alternativa.
- **24 cadeias, 48 alegações**; 0 desvios de processo comprovados, 0 pareceres OEM/independentes, 0 causas raízes confirmadas.
- Atualizados schema, validador, contagem de QA, CI e documentação. Mecanismos físicos e hipóteses originais preservados.
- Contrato público **1.0.0**, preview **1.3.12**, 24 registros/20 referências e checksum original sem alterações. Nenhum consumidor alterado.

## [1.3.13] — 2026-10-20 — Auditoria de 42 hipóteses sistêmicas e contrato público
- Revisão editorial crítica das 21 cadeias causais ampliadas anteriormente e de suas **42 alegações sistêmicas**; cada hipótese com evidência mínima necessária e contraprova não organizacional.
- Nenhum desvio de processo, culpa de equipe/pessoa ou causa raiz foi considerado confirmado sem evidências efetivas e revisão independente.
- Preservados os três roteiros aprofundados v1.3.11, sem atribuição de aprovação fictícia.
- Formalizado contrato público `contractVersion=1.0.0`, **independente** da versão interna `1.3.13`; preview público anterior `1.3.12` preservado no mesmo hash SHA-256.
- Oito regressões sintéticas de mudança **major/minor/patch** e proibição de promoção automática de hipótese para causa validada.
- Criados dois validadores, dois JSON Schemas, documentação e novas contagens no auditor de qualidade.
- Índice bibliográfico expandido para **49 fontes** com a especificação SemVer 2.0.0.
- Mantidos 10 bloqueios preventivos SAP, 24 cadeias sem homologação OEM, 48 investigações não realizadas e zero alteração de consumidores.

## [1.3.12] — 2026-10-20 — Causalidade em quatro níveis e preview público reproduzível
- Ampliada a segregação de **fenômeno, mecanismo físico imediato, fatores contribuintes e causa raiz candidata** às 21 cadeias restantes; agora são 24/24 (três originais preservadas).
- As causas sistêmicas são condicionais e possuem justificativa de não confirmação, evitando atribuição automática de responsabilidade a projeto, manutenção ou operação.
- Criados `data/ontology/causal-levels.v1.json` e `scripts/validate-causal-levels.mjs` com integridade de referências, ausência de medições reais e gate de revisão.
- Criada política pública `data/governance/public-export-policy.v1.json` de allowlist, excluindo dados reais, conteúdo interno e mapeamentos SAP/OEM não validados.
- Criados gerador determinístico de preview das 24 hipóteses e manifesto com SHA-256, verificados por `scripts/validate-public-knowledge.mjs`.
- Novos JSON Schemas, integração ao CI e ao relatório de qualidade; preview e manifesto disponíveis como artefatos, não versionados em `main`.
- Fontes IEC 60812, ISO 14224 e JSON Schema Draft 2020-12 consultadas como base de método/estrutura, sem alegar conformidade ou acesso ao conteúdo integral de normas.
- Permanecem 48 investigações não realizadas, 10 bloqueios preventivos e 0 causas raízes confirmadas. Consumidores externos não alterados.

## [1.3.11] — 2026-10-20 — Roteiros diferenciais e níveis causais
- Detalhados três caminhos diagnósticos para mangueiras hidráulicas, comando final e fixadores sapata–elo, com **nove etapas planejadas**.
- Cada etapa distingue evidências favoráveis a duas hipóteses, resultados inconclusivos, metadados e cuidados de segurança.
- Adotada separação editorial explícita de **fenômeno observável, mecanismo físico imediato, fator contribuinte e causa raiz candidata**.
- Nove regressões sintéticas verificam prontidão documental sem confirmar falha; zero resultados de campo e zero causas homologadas.
- Adicionados `data/quality/diagnostic-pathways.v1.json`, `schemas/diagnostic-pathways.schema.json` e `scripts/validate-diagnostic-pathways.mjs`.
- Duas fontes primárias Caterpillar catalogadas sobre monitoramento por múltiplas evidências e sinais de trem de força, mantendo limites por série.
- Documentação, roadmap, auditoria geral e GitHub Actions atualizados; sem tocar consumidores.

## [1.3.10] — 2026-10-20 — Complementos discriminantes, SAP e piloto OEM
- Cruzados seis testes P0 com suas duas hipóteses concorrentes e dois complementos: **24 avaliações**; 7 não discriminantes, 12 parciais, 5 potencialmente discriminantes condicionais.
- Mantidas **12 lacunas diagnósticas explícitas** e zero exclusões automáticas de alternativas.
- Criados `data/quality/complementary-discrimination.v1.json`, contrato JSON Schema e `scripts/validate-complementary-discrimination.mjs`.
- Revisada circularidade do par `TRAK/0320/01.15/C1.17`: códigos permanecem intactos; autoafrouxamento rotacional e assentamento sem rotação são mecanismos diferentes.
- Piloto de efetividade CAT D9 formalizado, mas **bloqueado** até série/arranjo, OMM, identificação de componentes e pareceres técnicos.
- Duas referências gerais Caterpillar/Nord-Lock acrescidas ao índice, sem extrapolar tolerâncias ou procedimentos de modelos diferentes.
- Validação CI, auditoria de qualidade e roadmap atualizados. Zero testes reais, zero homologações, zero modificações no PORCARIA.

## [1.3.9] — 2026-10-20 — Diagnóstico diferencial e testes P0
- Revisada a capacidade discriminante dos seis testes P0 (mangueira hidráulica, óleo do comando final, radiador, rolete, fixação de sapata e circulação da bomba).
- Matriz com quatro classes qualitativas editoriais: condição sem causa, tendência sem origem, indício inespecífico e desempenho condicionado.
- **12 avaliações de hipóteses concorrentes**, todas ainda plausíveis após o teste isolado, e **12 verificações complementares** propostas.
- Fatores de confusão e campos `canDiscriminate/cannotDiscriminate` documentados para cada teste.
- Criados JSON Schema, validador `npm run discrimination:validate` e **12 regressões sintéticas**; a automação proíbe conclusões causais ou números de sensibilidade/especificidade inventados.
- Literatura primária e técnica Caterpillar, Nord-Lock e resumo ISO 13379-1:2025 confrontados; sem valores OEM importados.
- Atualizados arquitetura, roadmap, relatório de qualidade e CI; nenhuma revisão humana fingida e nenhuma alteração no PORCARIA.

## [1.3.8] — 2026-10-20 — Qualidade de evidência e governança independente
- Definidos **48 requisitos de investigação** correspondentes às 24 cadeias × 2 testes, com metadados de execução, contexto, contraprova e interpretação preservada.
- Criado glossário de **67 campos técnicos em português**, selecionados por método sem impor o mesmo checklist a todas as técnicas.
- Prioridade P0 estabelecida para seis verificações de mangueira, comando final, radiador, rolete, fixadores e bomba de arrefecimento.
- Registro editorial estruturado com **24 cadeias aguardando revisão**, duas avaliações independentes do autor e gates de efetividade OEM.
- Adicionados oito cenários sintéticos de regressão de qualidade de dados/revisão; nenhuma aprovação automática ou observação real.
- Novo contrato JSON Schema, validador de integridade e rotina `npm run evidence:validate` no CI.
- Catalogada fonte Caterpillar de procedimentos gerais de amostragem, com ressalva de efetividade por máquina.
- Documentação e roadmap revisados; nenhuma alteração em consumidores externos.

## [1.3.7] — 2026-10-20 — Efeitos locais/sistêmicos e motor, hidráulica e rodante
- Ampliada a semântica para **18 condições, 18 atividades, 9 danos candidatos, 9 bundles preventivos e 53 relações**.
- Foram incluídos filtro e lubrificação do motor, vazamento/pressão/óleo hidráulico, desgaste e temperatura de roletes e roda-guia.
- Criada `data/knowledge/causal-effects.v1.json`, com **24 efeitos locais e 24 possíveis efeitos no sistema**, ressalvas de propagação, gravidade/probabilidade nulas e 0 eventos de campo.
- Regressões sintéticas ampliadas de 7 para **14**; o validador semântico proíbe confirmação de dano por condição ou execução de serviço.
- Criados `schemas/causal-effects.schema.json` e `scripts/validate-causal-effects.mjs` com checagem de fontes e de todos os 24 modos.
- Literatura Caterpillar adicionada para filtros de motor, inspeções hidráulicas e CTS/rodante, sem importar valores e procedimentos de série.
- Relatório de qualidade, documentação, roadmap e CI atualizados. Nenhuma alteração de consumidores nem novos vínculos SAP homologados.

## [1.3.6] — 2026-10-20 — Condição detectada, atividade preventiva e dano físico separados
- Criada ontologia semântica independente com **7 condições**, **8 atividades**, **4 danos candidatos**, **4 bundles de regras** e **22 relações tipadas**.
- Casos-modelo: água/sedimentos no combustível e drenagem/filtragem; sujeira externa, restrição interna, temperatura e vazamento do radiador.
- Nenhuma condição é convertida automaticamente em dano; limpar/drenar não prova que havia defeito no componente.
- Publicado JSON Schema versionado, novo validador `npm run semantics:validate` e **7 casos sintéticos de regressão** que bloqueiam falsa promoção a falha observada.
- A ISO 13379-1:2025 foi indexada com base em seu resumo oficial; não alegamos acesso ou conformidade ao texto completo.
- Métricas de tipos semânticos incluídas no relatório de qualidade e validação integrada ao CI.
- Relatório técnico e roadmap atualizados; preservados os 10 bloqueios PM, os 24 mecanismos causais e todos os consumidores externos.

## [1.3.5] — 2026-10-20 — Classificação causal das lacunas preventivas
- Diagnosticadas as 25 regras PM com rastreamento de modelo, sistema, grupo, subgrupo, componente e par dano/causa.
- As 10 regras sem vínculo foram classificadas: 3 sem subgrupo elegível, 5 sem componente no tipo cadastrado e 2 sem par permitido.
- Cada lacuna tem parecer, prioridade, referências OEM/SAP e próxima etapa de verificação em `data/quality/pm-gap-review.v1.json`.
- Criado `scripts/audit-pm-gaps.mjs` para reconciliar resultado com o gerador PM; testes bloqueiam remapeamento silencioso e falsas homologações.
- Reforçada a separação entre água no combustível (condição), drenagem (atividade preventiva) e dano de dreno (evento físico independente).
- Três fontes públicas SAP/Caterpillar adicionadas; relatório e métricas do ciclo integrados ao CI.
- Nenhuma mudança em repositórios consumidores ou na configuração real do SAP.

## [1.3.4] — 2026-10-20 — Auditoria de compatibilidade causal e taxonômica SAP
- Auditadas 24 cadeias com pareceres individuais sobre componente, dano, causa e caminho funcional.
- 8 categorias de impedimento/risco: ausência de local hidráulico, par inexistente, configuração não comprovada, efeito secundário, identidade ambígua, componente ausente, circularidade e candidatos não homologados.
- Detectadas duas associações `RADI/1690/03.02/C2.09` não permitidas no catálogo e dois pares de afrouxamento com risco de circularidade `01.15/C1.17`.
- Confirmado que `HSVV` se repete em diversos sistemas; caminhos sem o grupo de hidráulica de implementos permanecem sem ligação.
- Criados `data/quality/causal-sap-assessment.v1.json` e `scripts/audit-causal-sap.mjs`; relatório derivado publicado em artefato CI, sem homologação automática.
- Consultadas e indexadas fontes primárias IEC, ISO e SAP sobre FMEA, taxonomia, códigos de dano/causa.
- Auditoria incluída no QA, relatório de qualidade, roadmap e changelog; nenhuma alteração em consumidores.
- Execução CI validada: 24 pareceres; 18 pares permitidos e 2 ausentes; 15 cadeias com caminho estrutural; 10/25 regras PM sem candidato; **0 ligações tecnicamente homologadas**.

## [1.3.3] — 2026-10-20 — Fixações de sapata e circulação do arrefecimento
- Oito novas cadeias: afrouxamento rotacional, perda de pré-carga sem rotação, fadiga de parafuso, deslocamento de sapata, termostato restritivo, termostato aberto precocemente, bomba com circulação insuficiente e vazamento na bomba.
- Total acumulado: 24 cadeias causais e 48 investigações em quatro famílias; nenhuma homologação por série ou resultado de campo.
- Fontes: sete novos documentos Caterpillar/Nord-Lock, indexados com escopo geral e limites de extrapolação.
- Ontologia adiciona SY-21 (tempo de aquecimento prolongado) e SY-22 (leitura divergente de medida independente), totalizando 22 sintomas.
- Regras preventivas do radiador ligadas a termostato/bomba marcadas contextuais; a validação impede assumir correspondência de componente.
- Validador passa a exigir 24 cadeias e a restrição das ligações contextuais de arrefecimento.
- Relatório técnico e roadmap atualizados, sem modificar nenhum repositório consumidor.

## [1.3.2] — 2026-10-20 — Arrefecimento e material rodante
- Incorporadas oito cadeias de falha generalistas com fontes OEM Caterpillar, contraprovas e dois métodos por cadeia.
- Catálogo acumulado: 16 cadeias, quatro famílias de sistemas, 32 investigações propostas.
- Arrefecimento: obstrução externa, perda externa de líquido, comando do ventilador e obstrução interna — causas alternativas separadas.
- Rodante: restrição de rolete por detritos, fuga de lubrificante, desgaste da roda-guia e tensão incorreta — sem transportar medições entre modelos.
- Vinculação de inspeção PM por contexto explicitada para a tensão de esteira; nenhum ajuste, código SAP ou efeito OEM confirmado.
- Validação ampliada por famílias e coerência funcional da regra PM. Relatório e fontes do ciclo registrados no roadmap.
- Nenhum repositório consumidor modificado e nenhum registro empírico inserido.

## [1.3.1] — 2026-10-20 — Pesquisa curta e novas cadeias causais
- Pesquisadas e catalogadas seis fontes gerais: CAT (mangueiras, bujões magnéticos, radiador), SKF (classificação de danos e fadiga de rolamentos).
- Oito cadeias causais novas: quatro mangueiras hidráulicas, quatro comandos finais, com 16 investigações propostas e hipóteses concorrentes.
- As relações têm funções, mecanismos, sintomas, métodos de detecção, efeitos, fontes, alternativas e limitações; aplicação por serial não verificada.
- Validação automatizada de fontes, integridade, alternativas, desfechos e flags que impedem evidência ou causa confirmada fictícia.
- Auditoria de qualidade ampliada com indicadores de cadeias, investigações e revisão, sem confundir com taxa de falhas.
- Documentação técnica do ciclo e atualização do roadmap; nenhum repositório consumidor alterado.

## [1.3.0] — 2026-10-20 — Ontologia independente e auditoria do banco
- Escopo editorial fixado: evolução exclusiva do FMEA; sistemas e jogos externos apenas consomem releases.
- Nova ontologia com 10 falhas funcionais, 20 categorias de sintomas, 15 mecanismos, 16 técnicas de evidência e 4 estados de resultado.
- Classificações didáticas em 12 roteiros: referência à função, sintomas e técnicas de teste, sem confirmação de posição/causa.
- Criado `scripts/validate-ontology.mjs` com checagem de IDs, fontes, relações, duplicidade e separação de dado simulado.
- Criado `scripts/audit-quality.mjs` com cobertura por modelo, regras PM sem saída, relações candidatas e roteiros órfãos, sem métricas falsas de confiabilidade.
- Formalizada [Arquitetura do Conhecimento](docs/ARQUITETURA_DO_CONHECIMENTO.md) e revisado o [Roadmap](docs/ROADMAP.md) como plano exclusivo de curadoria e expansão FMEA.
- Pacotes derivados e auditoria gerados no GitHub Actions; nenhuma alteração em repositórios consumidores.

## [1.2.1] — 2026-10-20 — Pesquisa e diagnóstico diferencial
- Publicados 12 roteiros autorais para oito modelos/famílias, com 36 hipóteses alternativas e 24 testes com desfechos possíveis; nenhum resultado real.
- Filtro de escopo por sistema-raiz nas regras preventivas: mesmo subgrupo não implica mesmo circuito.
- Criado gerador de vínculos de roteiros por modelo/regra, sem atribuição automática de local, dano, componente ou causa.
- Inseridas checagens automáticas de quantidade, chaves, hipóteses, testes e integridade dos vínculos.
- Roadmap revisto: taxonomia, pesquisa ISO/IEC/SAE/ASTM/OEM, curadoria, integração e qualidade.

## [1.2.0] — 2026-10-20 — Planos preventivos e novas relações FMEA
- Sete arquivos de manutenção, oito modelos/famílias; 6.281 ocorrências e 1.018 tarefas distintas extraídas localmente com Python.
- Perfiles públicos agregados por modelo; sem texto integral, séries, tags, PNs ou procedimentos brutos.
- 891 regras derivadas mantidas no pacote local; 159 tarefas possuem subgrupos SAP candidatos estritos, nenhuma ligação homologada.
- Criados 25 padrões preventivos genéricos de sintomas, danos, causas e inspeções; gerador só produz relações suportadas pelo catálogo atual.
- Validação automática no CI, separando método de inspeção **planejado** de resultado/evidência de campo.
- CAT 16: extração parcial do Excel legado; DR410i: fichas OLD não tratadas como vigentes.

## [1.1.0] — 2026-10-19 — Extração dos simuladores
- Importados 72 casos eletrônicos e 72 casos de fluidos com chaves para seus arquivos de origem.
- Catalogados 24 conjuntos de hipóteses concorrentes eletrônicas, 24 arquétipos de fluidos, 54 entradas de códigos (23 FMI incluídos), 39 textos e 27 fontes citadas.
- Gerados índices separados com 144 sintomas, 288 evidências simuladas e 144 gabaritos/hipóteses; valores de videogame segregados.
- Nenhum dado de laboratório real, código proprietário Sandvik não documentado, confirmação de causa ou localização SAP foi inventado.
- Inclusão de verificação estrutural específica da biblioteca no GitHub Actions.

## [1.0.1] — 2026-10-19 — Rastreabilidade e automação
- Publicado catálogo normalizado `data/catalog/failure-db.v1.json` com validação de integridade de códigos e vínculos.
- Gerador determinístico reproduz 518.832 combinações candidatas em 17 pacotes por modelo.
- GitHub Actions executa geração e checagens automaticamente e disponibiliza pacotes como artefatos temporários.
- Incorporados 29 cenários didáticos legados do jogo, identificados por SHA de origem; **sem promover orientações de verificação a evidências reais**.

## [1.0.0] — 2026-10-19 — Fundação do catálogo

### Estrutura
- Primeiro modelo relacional: 19 modelos/famílias; 1.466 locais funcionais, dos quais 670 com três níveis.
- Vocabulários: 66 tipos de dano, 81 causas e 32 origens de detecção.
- 486 códigos de componentes distintos vinculados a tipos de objeto SAP e mapa de plausibilidade inferido.
- Manifesto do lote original com 518.832 **combinações candidatas** em 17 arquivos por modelo. Não são diagnósticos confirmados.
- Referências parciais de códigos CAT 6030, pendentes de validação individual e **não publicadas como transcrição de manual**.

### Qualidade e limitações
- CAT 320 e CAT 303.5 carecem de caminhos de três níveis na fonte recebida; não inventar níveis.
- Tipos de objeto sem vínculo de partes devem permanecer sem expansão.
- Inferências são heurísticas; não atribuir probabilidades/custos/tempos como se fossem dados empíricos.
- Não publicar planilhas, manuais OEM ou documentos corporativos originais.

### Próximo incremento
- Casos de diagnóstico: observações, sintomas, contexto operacional, hipóteses concorrentes, testes discriminantes e evidências.
- Definir revisão técnica, estados de confiança e testes de integração com `porcaria-voce-quebra-eu-conserto`.
