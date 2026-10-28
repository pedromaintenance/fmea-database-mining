# FMEA Database Mining — Banco de Falhas de Equipamentos Móveis

Banco de conhecimento **versionado** para investigar modos de falha, sintomas, evidências e causas em equipamentos móveis de mineração. Um consumidor possível é o jogo **[P.O.R.C.A.R.I.A. — Você Quebra, Eu Conserto](https://github.com/pedromaintenance/porcaria-voce-quebra-eu-conserto)**, mas o banco é independente: **este repositório não altera os consumidores**.

> **Status:** versão do catálogo **1.3.82** (catálogo de hipóteses e taxonomias), **não** FMEAs formalmente aprovadas, banco de ocorrências reais nem fonte de procedimentos de execução.

**Consulta técnica disponível:** [abrir interface HTML standalone](docs/consulta-fmea.html). No GitHub, use **Raw/Download raw file** para salvar e abrir no navegador, mesmo sem internet. Permite busca, filtro por sistema, consulta de sintomas, hipóteses, limites, pendências e exportação TXT conceitual. **Não consulta nem altera SAP**.

**Ciclo v1.3.82:** [comparação técnica e fichas de revisão](docs/CICLO_2026-10-28_COMPARACAO_E_FICHAS_FMEA.md) aprimora [a consulta HTML offline](docs/consulta-fmea.html) com navegação entre regras do mesmo sistema ou subgrupo, comparação lado a lado de duas regras, e fichas individuais/comparativas em Markdown. As correspondências são **estruturais, não prova causal**; P0/P1 permanecem apenas prioridades documentais e não criticidade operacional. A auditoria cobre os 600 pares ordenados possíveis, segurança das exportações e a proibição de aprovações automáticas.

**Ciclo v1.3.81:** [consulta técnica completa das 25 regras preventivas](docs/CICLO_2026-10-28_CONSULTA_COMPLETA_25_REGRAS.md) amplia [a ferramenta HTML offline](docs/consulta-fmea.html) de 15 para **25 regras em 13 sistemas**. Acrescenta dez exceções PM×SAP (cinco P0/cinco P1) com trilha distinta e filtros por prioridade **documental de revisão — não criticidade operacional**; preserva os achados, enquadramento, ações propostas e evidências mínimas literais. As 15 regras anteriores continuam com 30 hipóteses abertas, limites de detecção e critérios não avaliados. Todas as dez exceções e oito gates corporativos permanecem bloqueados.

**Ciclo v1.3.80:** [interface de consulta pública das 15 regras PM sem prioridade documental](docs/CICLO_2026-10-28_CONSULTA_TECNICA_FMEA.md) incorpora dados rastreáveis diretamente num HTML offline, com busca acentuada/insensível a caixa, filtro por sistema, hipóteses alternativas, seis bloqueios, dez requisitos de qualidade e resumo TXT. Auditor verifica que o conteúdo não divergiu das políticas e não promove causa, risco ou aprovação.

**Ciclo v1.3.79:** [matriz consolidada de maturidade da evidência](docs/CICLO_2026-10-28_MATRIZ_MATURIDADE_EVIDENCIA_PM.md) cruza as 15 regras sem prioridade, 30 alternativas, limitações de detecção e 150 verificações documentais pendentes, com seis camadas de bloqueio causal por regra. Simula 90 cenários que permanecem inconclusivos, sem confundir modelagem pública com validação de método, evidência física, criticidade, SAP ou liberação operacional.

**Ciclo v1.3.78:** [qualidade metrológica e proveniência de evidências PM](docs/CICLO_2026-10-28_QUALIDADE_METROLOGICA_PROVENIENCIA_PM.md) define dez critérios de avaliação por inspeção (150 posições não verificadas) e 13 situações sintéticas por cada uma das 15 regras (195 roteamentos). Distingue instrumento aplicável de técnica visual, exige justificativa privada de não aplicabilidade e nunca trata completude sintética como homologação. Mantém dez exceções SAP e oito gates corporativos em NO_GO.

**Ciclo v1.3.77:** [detectabilidade dos métodos de inspeção PM](docs/CICLO_2026-10-28_DETECTABILIDADE_INSPECOES_PM.md) modela 15 sinais com possíveis armadilhas de atribuição, fatores de confusão, hipóteses de não detecção e condições inconclusivas. Simula 45 interpretações sem sensibilidade/especificidade estatística, medições reais, confirmação de dano, prioridade atribuída ou aprovação de execução. Mantém as 10 exceções SAP e oito gates privados bloqueados.

**Ciclo v1.3.76:** [observabilidade das 15 regras PM sem prioridade documental](docs/CICLO_2026-10-27_OBSERVABILIDADE_REGRAS_SEM_PRIORIDADE.md) reconcilia seus sintomas e inspeções literais com 30 hipóteses alternativas conceituais e pedidos de evidência discriminante. **Sem prioridade não equivale a baixo risco**; nenhuma inspeção, causa raiz, classificação de gravidade, ligação SAP ou liberação é inferida. Dez exceções e oito gates privados continuam bloqueados.

**Ciclo v1.3.75:** [solicitação de decisão SEC-01 pronta para adaptação](docs/CICLO_2026-10-27_SOLICITACAO_DECISAO_SEC01.md) gera um memorando Markdown objetivo com três decisões corporativas e nove evidências; testa seis cenários de devolução, recusa, pendências e aprovação restrita hipotética. O documento não foi enviado; nenhuma assinatura, gate, alteração SAP ou liberação é criada.

**Ciclo v1.3.74:** [handoff corporativo SEC-01](docs/CICLO_2026-10-27_HANDOFF_CORPORATIVO_SEC01.md) estrutura 8 funções **propostas**, 9 atividades RACI sem pessoas designadas, 3 decisões ainda pendentes, 3 condições de aceite e uma pauta de 4 tópicos. Gera registro rastreável e testa assinaturas e liberações falsas; nenhuma solicitação real, decisão corporativa ou desbloqueio dos 8 gates.

**Ciclo v1.3.73:** [solicitação corporativa SEC-01](docs/CICLO_2026-10-27_SEC01_SOLICITACAO_APROVACAO_CORPORATIVA.md) prepara três trilhas de revisão — patrocínio, licenciamento OEM e privacidade — com nove requisitos verificáveis e sete cenários de decisão sintéticos. Não envia solicitação, não obtém assinatura, não avalia licença real ou DPIA, nem destrava os oito gates privados, SAP ou Operação.

**Ciclo v1.3.72:** [prontidão de homologação corporativa](docs/CICLO_2026-10-27_PRONTIDAO_HOMOLOGACAO_CORPORATIVA.md) reconcilia 18 cenários públicos, 15 hipóteses P0, dois pilotos com 68 verificações pendentes e oito gates corporativos que permanecem não atestados. Distingue testes sintéticos concluídos de efetividade OEM, infraestrutura, custódia e decisões humanas ainda ausentes; nenhuma autorização SAP ou operacional.

**Ciclo v1.3.71:** [cenários sintéticos de evidência P0](docs/CICLO_2026-10-27_CENARIOS_SINTETICOS_EVIDENCIAS_P0.md) executa nove situações por cada um dos dois pilotos públicos: documentos insuficientes, origem inválida, OEM incompatível, contraprova ausente, conflito, metrologia não confiável, indício favorável e inconclusão. A classificação é somente encaminhamento humano futuro, sem aprovação automática, dados reais nem alteração SAP.

**Ciclo v1.3.70:** [blueprint de recebimento de evidências para piloto P0](docs/CICLO_2026-10-27_BLUEPRINT_PILOTO_EVIDENCIAS_P0.md) integra 15 diferenciais e cinco classes de custódia aos dois pilotos sintéticos existentes, com 34 verificações e quatro trilhas decisórias por piloto. Metadados e contraprovas planejados, auditoria adversarial e CI; nenhuma evidência privada recebida, ativo selecionado, mudança SAP ou operação autorizada.

**Ciclo v1.3.69:** [diagnóstico diferencial e contraprova de cinco P0](docs/CICLO_2026-10-27_DIAGNOSTICO_DIFERENCIAL_P0.md) explicita 15 hipóteses com evidências potenciais, alternativas concorrentes e resultados inconclusivos. Reconstrói proveniência 1.3.65–1.3.68 e preserva integralmente os bloqueios OEM/SAP, sem realizar testes, aprovar códigos ou alterar consumidores.

**Ciclo v1.3.68:** [pacotes de revisão documental por família funcional](docs/CICLO_2026-10-27_PACOTES_REVISAO_FUNCIONAL_PM.md) organiza as 25 regras em 13 famílias, distingue as dez exceções PM×SAP (5 P0 e 5 P1) das 15 regras com vínculos estruturais, e preserva 84 rejeições por caminho como indicador de filtro — não gravidade operacional. Receitas de evidência por bloqueio, auditoria adversarial e CI, sem homologação OEM/SAP ou dados de campo.

**Ciclo v1.3.67:** [reconciliação funcional das 25 regras PM](docs/CICLO_2026-10-27_RECONCILIACAO_FUNCIONAL_PM.md) verifica funil modelo/sistema/grupo/subgrupo/componente/dano–causa, conta caminhos descartados por fronteira funcional e destaca subgrupos reutilizados sem interpretar códigos iguais como o mesmo circuito. Auditor com 16 cenários sintéticos e 46 mutações adversariais; 115 vínculos candidatos e dez exceções PM×SAP permanecem inalterados. Nenhum dado de campo, homologação OEM/SAP ou consumidor modificado.

**Ciclo v1.3.66:** [triagem sequencial de chaves e aplicabilidade P0](docs/CICLO_2026-10-27_TRIAGEM_CHAVES_P0.md) separa 7 templates de chaves de modelo, 35 posições candidatas de primeira verificação e 210 classes documentais deferidas até resolução privada de configuração e função. Auditor determinístico de 55 testes adversariais, sem dados reais ou autorização operacional. Mantém ontologia 1.3.23, maturidade 1.3.60, dez bloqueios SAP e oito gates privados NO-GO.

**Ciclo v1.3.65:** [prontidão documental de investigação P0](docs/CICLO_2026-10-26_INVESTIGACAO_P0.md) organiza cinco regras P0 em três sistemas, 15 hipóteses diferenciais e 35 posições candidatas de chave de modelo, com sete pedidos de evidência por posição. Nenhuma posição é tratada como equipamento real; todas continuam NO-GO sem efetividade OEM por série ou aprovação SAP.

**Ciclo v1.3.64:** [separação das decisões técnicas, cadastrais e operacionais](docs/CICLO_2026-10-24_TRILHAS_DECISAO_FMEA.md) organiza dois pacotes P0 com 68 checks ainda não verificados e quatro trilhas distintas: documentação, engenharia, SAP e liberação operacional. Novo auditor com 53 mutações adversariais; nenhum evento ou aprovação real. Ontologia 1.3.23 preservada.

**Ciclo v1.3.63:** [pré-piloto por ativo e qualidade metrológica](docs/CICLO_2026-10-24_PREFLIGHT_PILOTO_ATIVO.md) acrescenta 34 verificações, dois casos sintéticos RADI/HSVV e oito gates de decisão em NO-GO/PENDING. Sem ativo real, inspeção, autorização corporativa ou aprovação SAP. Ontologia 1.3.23 e maturidade 1.3.60 preservadas.

**Ciclo v1.3.62:** [runbook privado e pacote documental P0](docs/CICLO_2026-10-24_RUNBOOK_PRIVADO_P0.md) registra oito gates corporativos em estado NO-GO e fila de cinco bloqueios P0, com dois dossiês aprofundados de radiador e filtro de combustível, sem dados reais, alteração SAP ou homologação OEM. Ontologia 1.3.23 e maturidade 1.3.60 preservadas.

**Ciclo v1.3.61:** [contrato de intake restrito para evidências PM](docs/CICLO_2026-10-24_INTAKE_EVIDENCIAS_PM.md) conecta as 25 regras a cinco etapas de custódia/revisão, usando exclusivamente metadados TEST-* em validação pública. Não existe serviço corporativo real, aprovação OEM ou mudança SAP. A ontologia continua 1.3.23 e a matriz de maturidade continua 1.3.60.

**Ciclo v1.3.60:** [matriz de maturidade técnica](docs/CICLO_2026-10-24_MATURIDADE_FMEA.md) audita as 25 regras, preserva 10 exceções PM×SAP (5 P0 e 5 P1), registra 15 regras sem prioridade documental e separa sete gates de evidência. Não homologa efetividade OEM, dano real ou código SAP. Ontologia continua 1.3.23.

**Ciclo v1.3.59:** [filtragem do compressor e COMR/VPAR](docs/CICLO_2026-10-24_FILTRAGEM_COMPRESSOR.md) completa BUNDLE-25, distinguindo admissão, óleo, separação ar–óleo e eventual elemento do receptor; bloqueio SAP `subgroup_not_in_scope` permanece. **25/25 regras PM com bundle (100% de cobertura conceitual)**, sem homologação por máquina nem resultados de campo. Ontologia 1.3.23.

**Ciclo v1.3.58:** [estanqueidade pneumática e bloqueio VPAR](docs/CICLO_2026-10-24_ESTANQUEIDADE_PNEUMATICA.md) adiciona BUNDLE-24: seis indícios, cinco ações propostas e três danos candidatos de mangueira, junta e vaso, sem inferir que pressão baixa é fuga. Política com isolamento/pressão zero e bloqueio SAP `component_not_registered` preservado; ontologia 1.3.22, 24/25 regras PM modeladas.

**Ciclo v1.3.57:** [rolamento da cabeça rotativa e mecanismos concorrentes](docs/CICLO_2026-10-24_ROLAMENTO_CABECA_ROTATIVA.md) implementa BUNDLE-23 com seis condições, cinco ações propostas e três danos físicos candidatos. Diferença HTRH6, MRH6 e DR410i preservada por desenho OEM; ontologia 1.3.21, cobertura 23/25, sem pré-carga inventada ou dano confirmado.

**Ciclo v1.3.56:** [corrente de avanço de perfuratrizes](docs/CICLO_2026-10-24_CORRENTE_AVANCO.md) adiciona BUNDLE-22 com seis condições hipotéticas, cinco atividades propostas e três danos candidatos. Diferencia ajuste manual padrão e automático opcional da DR410i, sem transpor mecanismos para DI650i ou EQ05/EQ06 sem série/BOM; ontologia 1.3.20, cobertura PM 22/25.

**Ciclo v1.3.55:** [desgaste OTR/RTD](docs/CICLO_2026-10-23_PNEUS_DESGASTE.md) modela BUNDLE-21 com seis condições, quatro inspeções propostas, três danos candidatos e dois cenários sintéticos. Separa desgaste de cortes/carcase; cobertura PM 21/25 e nenhuma causa ou limite OEM homologado.

**Ciclo v1.3.54:** [pneus OTR: integridade e dano físico](docs/CICLO_2026-10-23_PNEUS_DANOS.md) implementa BUNDLE-20 com 6 condições hipotéticas, 5 ações propostas e 4 danos não confirmados; 9 gates pendentes, sem pressões ou critérios OEM inventados. Ontologia 1.3.18 com 20/25 regras PM modeladas, cinco pendentes.

**Ciclo v1.3.53:** [ontologia de coletor de escape](docs/CICLO_2026-10-22_ONTOLOGIA_ESCAPE.md) implementa BUNDLE-19 com seis condições não observadas, cinco ações propostas, três danos candidatos, 14 relações e dois cenários sintéticos. O corpus mantém separados fuligem, corpo trincado, fuga de junta, resíduo úmido, fole apenas quando instalado e desempenho; 19/25 regras modeladas, seis pendentes, sem homologação SAP ou execução.

**Ciclo v1.3.52:** [pré-auditoria de coletor de escape](docs/CICLO_2026-10-22_ESCAPE_PREAUDITORIA.md) segrega fuligem, trinca física, junta, resíduo úmido, fole condicionado à instalação e desempenho inespecífico. São seis diferenciais, oito gates pendentes e 36 alterações adversariais de segurança, sem novos bundles ou evento de campo: a ontologia permanece 1.3.16 e a cobertura PM 18/25.

**Ciclo v1.3.35:** [auditoria funcional de HSVV e COMR](docs/CICLO_2026-10-21_HSVV_COMR.md), com proteção do gerador contra colisões de grupo/subgrupo e 23 cenários sintéticos. As quatro regras focadas permanecem bloqueadas até evidência OEM/SAP e revisão independente.

**Ciclo v1.3.36:** a [triagem de filtragem FUSY/COMR](docs/CICLO_2026-10-21_FILTRAGEM_CANDIDATOS.md) encontra 0 candidatos textuais de filtro no grupo de combustível e uma família candidata **VPAR** no compressor, sem remapeamento nem prova de instalação. Foram confrontadas as descrições de componente, sua árvore funcional e a elegibilidade do par dano/causa; fontes Cat/Sandvik permanecem classificadas como contexto OEM genérico.

**Ciclo v1.3.37:** a [auditoria de proveniência VPAR](docs/CICLO_2026-10-21_PROVENIENCIA_VPAR.md) demonstrou que quatro correspondências textuais resultam de dois códigos distintos repetidos em dois caminhos EQ05/EQ06; um código admite 03.02/C2.09 como combinação de catálogo, sem comprovação de instalação, circuito físico, defeito ou causa. A liberação permanece condicionada a BOM/OEM por série e revisão independente.

**Ciclo v1.3.38:** [matriz de evidências por circuito VPAR](docs/CICLO_2026-10-21_MATRIZ_EVIDENCIAS_VPAR.md), com 2 códigos candidatos × 4 funções concorrentes e sete gates de documentação/segurança/revisão por cenário. Os 56 gates estão sem evidência; não foram homologados locais SAP nem modos de falha.

**Ciclo v1.3.39:** [triagem semântica preventiva](docs/CICLO_2026-10-21_TRIAGEM_SEMANTICA_PM.md) para radiador e água no combustível, com cinco caminhos de investigação derivados da ontologia e 26 regressões adversariais. Condições, ações propostas e danos diferenciais permanecem separados; nenhuma nota SAP, teste ou aprovação foi criada.

**Ciclo v1.3.40:** [auditoria do filtro de óleo do motor](docs/CICLO_2026-10-21_FILTRO_OLEO_MOTOR.md) confirma zero componentes filtrantes textuais em oito caminhos ENGN/LUSY e encontra oito ocorrências textuais explicitamente de óleo em subgrupos ENGN vizinhos. Nenhuma correspondência foi promovida a PN, instalação, dano ou mapeamento SAP homologado.

**Ciclo v1.3.41:** [auditoria de roda-guia e CTS](docs/CICLO_2026-10-21_RODA_GUIA_CTS.md) comprovou oito caminhos IDLE sem Rolamento catalogado e distinguiu os rolamentos de ROLL em grupos vizinhos. Também identificou referências de rolete reutilizadas na ontologia da roda-guia, sem promover medições, danos ou homologações SAP.

**Ciclo v1.3.42:** a [revisão da ontologia de roda-guia e rolete](docs/CICLO_2026-10-21_ONTOLOGIA_IDLER_ROLLER.md) separa calor e vedação da roda-guia de condições/ações dos roletes, corrige a palavra “confirmado” em dano hipotético e valida 24 regressões adversariais. Nenhum dano, inspeção de campo ou mapeamento SAP foi promovido.

**Ciclo v1.3.43:** a [auditoria transversal da ontologia PM](docs/CICLO_2026-10-21_CROSSWALK_SEMANTICO_PM.md) inspeciona 25 regras (9 modeladas com bundle; 16 ainda não modeladas), registra seis compartilhamentos genéricos de condições/ações em combustível e hidráulico e rejeita 29 alterações artificiais de semântica. Não foram identificados danos compartilhados nem promovidos eventos de campo.

**Ciclo v1.3.44:** [ampliação semântica da família de ventilação](docs/CICLO_2026-10-21_VENTILADOR_ARREFECIMENTO.md) e correção do rótulo de obstrução interna do radiador. A ontologia cobre 11/25 regras (restam 14 sem bundle), com hipóteses de apoio/rolamento e correia sem presumir instalação por série, 26 mutações adversariais rejeitadas e nenhum evento de campo promovido.

**Ciclo v1.3.45:** [modelagem de abrasão versus vazamento hidráulico](docs/CICLO_2026-10-21_MANGUEIRAS_ABRASAO.md), com quatro condições de mangueira, criticidade da armadura exposta e bloqueio HSVV preservado. Ontologia 1.3.10: 12/25 regras modeladas, 13 pendentes e 24 testes adversariais rejeitados.

**Ciclo v1.3.46:** [modelagem dos fixadores de sapatas e pré-carga](docs/CICLO_2026-10-21_FIXADORES_SAPATAS.md), com diferenciação de rotação, assentamento, fixadores frouxos e fratura, sem torques OEM inventados. Ontologia 1.3.11: 13/25 regras com bundle, 12 pendentes e 32 alterações adversariais rejeitadas.

**Ciclo v1.3.47:** a [revisão de engrenagens do comando final](docs/CICLO_2026-10-21_ENGRENAGENS_COMANDO_FINAL.md) diferencia desgaste, pitting e fratura de dentes dos sinais de óleo, bujão magnético e ruído. Ontologia 1.3.12 com **14/25 regras modeladas**, 11 pendentes e auditoria adversarial, sem diagnóstico de campo nem valores OEM generalizados.

**Ciclo v1.3.48:** a [análise semântica de rolamentos do comando final](docs/CICLO_2026-10-22_ROLAMENTOS_COMANDO_FINAL.md) diferencia desgaste de pistas, fadiga de contato e vedação dos sintomas genéricos de óleo, ruído e limalhas, compartilhados sob controle com engrenagens. Ontologia 1.3.13, 15/25 regras com bundle, dez ainda pendentes e testes adversariais, sem atribuir falhas confirmadas ou aprovações SAP.

**Ciclo v1.3.49:** [ontologia de engrenagens do diferencial](docs/CICLO_2026-10-22_DIFERENCIAL_ENGRENAGENS.md), com distinção entre coroa-pinhão, padrão de contato, backlash, condição dos apoios, óleo e ruído. Cobertura de 16/25 regras PM, nove ainda sem bundle, auditoria com 30 mutações adversariais e nenhum torque/tolerância OEM importado sem efetividade.

**Ciclo v1.3.50:** [diagnóstico semântico de cilindros de implementos](docs/CICLO_2026-10-22_CILINDROS_IMPLEMENTOS.md) distingue deriva, vazamento externo, passagem interna, baixa força, haste e falhas concorrentes de válvulas ou suprimento. Ontologia 1.3.15: **17/25 regras PM com bundle**, 8 pendentes, 32 mutações adversariais rejeitadas, sem medições ou códigos SAP aprovados automaticamente.

**Ciclo v1.3.51:** [modelagem de freios de disco e segurança](docs/CICLO_2026-10-22_FREIOS_DISCO.md) diferencia arquiteturas CAT 777 (05/07) e 980, fricção, aquecimento, pressão de atuação e desempenho, sem condenação automática de disco. Ontologia 1.3.16 com **18/25 regras PM modeladas**, sete ainda sem bundle e 32 testes adversariais.

## O que queremos construir

A jornada de diagnóstico reproduz as seis etapas usadas no jogo:

1. **Sistema** — onde a função falhou?
2. **Grupo** — qual conjunto funcional?
3. **Subgrupo** — em que subconjunto?
4. **Componente** — qual item?
5. **Dano** — qual alteração observada?
6. **Causa** — qual mecanismo/condição explica o dano, **com evidências**?

A base evoluirá por camadas: hierarquia funcional → componentes elegíveis → combinações candidatas → sintomas e observações → testes/evidências discriminantes → hipóteses causais → casos didáticos revisados → integração de jogo.

## Escopo da primeira versão

- Hierarquias por modelo e códigos de instalação funcional.
- Tipos de objeto, partes e taxonomia de danos/causas.
- Compatibilidades inferidas para **gerar candidatos**, nunca diagnósticos confirmados.
- Referências técnicas e índices de códigos de diagnóstico tratados como **indícios**, e não como causas.
- Esquemas, checagens e trilha de alterações.

**Contagens originais da geração v1:** 19 famílias/modelos, 1.466 nós de local funcional, 670 caminhos de três níveis, 66 códigos de dano, 81 causas, 32 origens de detecção, 518.832 combinações candidatas em 17 pacotes. Os números são relativos ao lote e devem ser validados em cada release.

## Organização

- `data/catalog/`: catálogos de domínio e locais funcionais.
- `data/models/`: combinações por modelo, em JSON compacto (carregamento sob demanda).
- `data/references/`: referências técnicas **parciais**, separadas dos casos.
- `data/cases/`: casos com sintomas, evidências, hipóteses e revisão técnica (etapa seguinte).
- `schemas/`: contratos de dados.
- `scripts/`: validação de integridade e geração futura.
- `docs/`: modelo conceitual, processo editorial e integração.
- `CHANGELOG.md`: histórico de versões.

## Regras obrigatórias

**Observação não é causa.** Um DTC, ruído, vazamento ou resultado de análise de óleo aponta uma hipótese, mas não confirma causa raiz. A confirmação depende de testes e evidências independentes, com registros de proveniência.

**Combinação não é caso.** Não gerar milhares de casos fictícios confundindo produto cartesiano com plausibilidade física. Distinguir `catalogado`, `inferido`, `curado` e `validado`. Probabilidades, HH, custos e criticidades não serão inventados a partir do catálogo.

**Segurança e direitos autorais.** Não publicar planilhas corporativas brutas, números de série/patrimônios, históricos confidenciais, dados pessoais ou textos/páginas integrais de manuais OEM. Publicação de derivados de fontes internas exige confirmação de autorização. Não há licença de reutilização dos dados presumida.

## Nova biblioteca de diagnóstico (v1.1.0)

Importados dos simuladores **Códigos de Falha** e **Análise de Óleo**: [144 casos de treinamento, 288 registros de evidências simuladas, 54 entradas de códigos, 23 definições FMI, 39 textos técnicos e 27 referências](data/knowledge/manifest.json).

Veja os [cenários eletrônicos](data/knowledge/electronic/diagnostic-records.json), os [cenários de óleo](data/knowledge/oil/diagnostic-records.json), o [índice de sintomas](data/knowledge/symptoms-index.json) e a [documentação da importação](docs/IMPORTACAO_SIMULADORES.md). Os dados são **didáticos**, não históricos nem validados para aplicação direta em máquinas.

## Planos de manutenção preventiva (v1.2.0)

A [extração em Python de sete planilhas](docs/EXTRACAO_PM_2026.md) mapeou 6.281 ocorrências de atividade e 1.018 tarefas distintas para oito equipamentos/famílias. A [camada pública de prevenção](data/knowledge/pm-prevention/) guarda **perfis agregados por máquina**, 25 padrões técnicos genéricos e o gerador de vínculos **sistema → subgrupo → componente → dano → causa**. O gerador verifica a compatibilidade dos códigos com o catálogo SAP.

**Não foi publicado o texto bruto das planilhas**: havia informações corporativas, procedimentos e registros de execução. A versão integral derivada, com 891 regras estruturadas e 159 candidatos estritos de subgrupo, fica no pacote de extração desta conversa até autorização de divulgação. Nenhum desses vínculos equivale a uma evidência real ou uma causa raiz confirmada.

## Roteiros diagnósticos e pesquisa (v1.2.1)

A [biblioteca de roteiros](data/knowledge/diagnostic/playbooks.v1.json) contém **12 situações fictícias**, 36 hipóteses concorrentes e 24 testes discriminantes, com interpretações favoráveis/desfavoráveis/inconclusivas. Nenhum teste foi realmente executado.

O gerador `scripts/generate-diagnostic-links.mjs` cruza os roteiros com vínculos candidatos de PM/FMEA e **não escolhe automaticamente peça, posição, dano ou causa**. Também há filtro de sistema-raiz para impedir que um mesmo subgrupo reúna circuitos funcionalmente diferentes.

Veja [Roadmap técnico](docs/ROADMAP.md) e [Pesquisa técnica e literatura OEM](docs/PESQUISA_TECNICA.md). A integração ao jogo depende de curadoria e do controle de gabaritos.

## Ontologia e auditoria de qualidade (v1.3.0)

- [Ontologia do domínio](data/ontology/concepts.v1.json): 10 falhas funcionais, 20 sintomas, 15 mecanismos, 16 métodos de evidência e quatro interpretações.
- [12 roteiros anotados](data/ontology/playbook-annotations.v1.json): relações declaradas entre sintomas, perda de função e tipo de teste; classificação **didática e ainda não aprovada por OEM**.
- [Arquitetura do conhecimento](docs/ARQUITETURA_DO_CONHECIMENTO.md): separação entre FMEA funcional, diagnóstico, evidência e proveniência.
- [Roadmap vivo](docs/ROADMAP.md): tarefas exclusivamente de evolução do FMEA, pesquisa técnica e revisão de qualidade.
- `npm run ontology:validate` verifica vocabulário e referências dos roteiros. `npm run quality:audit` produz relatório de cobertura, relações sem saída e lacunas em `reports/quality-audit.generated.json`, disponibilizado como artefato de CI.

O banco não coleta evidências reais nem gera frequência observada de falhas a partir de candidatos.

## Primeiro ciclo de pesquisa causal (v1.3.1)

Pesquisados dois conjuntos com fontes Caterpillar e SKF: **mangueiras hidráulicas** e **comandos finais**. O banco recebeu [8 cadeias causais candidatas](data/knowledge/causal-chains.v1.json), com 16 investigações propostas, sintomas, mecanismos, falhas funcionais, hipóteses concorrentes e contraprovas. São **conceitos gerais referenciados**, não confirmações de defeitos de equipamentos.

- [Fontes e decisões do ciclo](docs/CICLO_2026-10-20_MANGUEIRAS_COMANDOS.md)
- `npm run causal:validate` valida IDs, fontes, causas candidatas e separação entre teste planejado e evidência observada.
- O audit report inclui quantidade e cobertura dessa família; **zero** causas raízes ou efetividades OEM confirmadas.

## Segundo ciclo de pesquisa causal (v1.3.2)

Ampliação com [oito novas cadeias](data/knowledge/causal-chains.v1.json) para **arrefecimento** (fluxo de ar, estanqueidade, ventilador, restrição interna) e **material rodante** (roletes, rodas-guia, tensão), com referências Caterpillar, contra-hipóteses e métodos de inspeção.

Total acumulado: **16 cadeias causais, 4 famílias e 32 investigações propostas**. [Relatório de pesquisa e limites](docs/CICLO_2026-10-20_ARREFECIMENTO_RODANTE.md).

Nada foi promovido a diagnóstico de máquina real. A configuração, os limites OEM por série e os resultados de testes seguem pendentes.

## Terceiro ciclo causal (v1.3.3)

Pesquisados mecanismos de **fixação de sapatas** (autoafrouxamento, assentamento/relaxação, fadiga do parafuso e movimentação de interface) e **circulação do arrefecimento** (termostato com regulação incorreta, insuficiência da bomba e vedação da bomba).

- [24 cadeias causais com 48 investigações](data/knowledge/causal-chains.v1.json): quatro famílias, nenhuma causa raiz/efetividade por série homologada.
- [Ontologia ampliada para 22 sintomas](data/ontology/concepts.v1.json), incluindo aquecimento lento e desacordo de medição.
- [Fontes, limitações e revisão do ciclo](docs/CICLO_2026-10-20_FIXACOES_TERMOSTATO_BOMBA.md): sete referências Caterpillar/Nord-Lock.
- Regras PM de radiador associadas a termostato/bomba são **contextuais**, não uma inspeção específica homologada do componente.
- Os dados são hipóteses técnico-didáticas com contraprovas, **não ocorrências em campo**.

## Auditoria causal e compatibilidade SAP (v1.3.4)

A [matriz de revisão das 24 cadeias](data/quality/causal-sap-assessment.v1.json) distingue **componente cadastrado**, **par dano/causa permitido**, **caminho SAP estruturalmente elegível** e **coerência do mecanismo físico**. São dimensões independentes; nenhum vínculo foi homologado.

O comando `npm run causal:sap:audit` gera `reports/causal-sap-audit.generated.json` como artefato do CI. Foram registradas lacunas como ausência de subgrupo hidráulico de implementos para `HSVV`, falta de componente específico de termostato/bomba, par de obstrução do trocador não autorizado e circularidade em dano/causa de fixador.

[Leia o relatório de auditoria e os próximos passos](docs/CICLO_2026-10-20_AUDITORIA_CAUSAL_SAP.md).

## Saneamento das dez lacunas de PM (v1.3.5)

A [revisão das dez regras sem correspondência](data/quality/pm-gap-review.v1.json) separa **três bloqueios de subgrupo**, **cinco de componente** e **dois de par dano/causa**. Todos exigem curadoria, sem remapeamento automático.

O [auditor](scripts/audit-pm-gaps.mjs) reproduz as etapas modelo → sistema → grupo → subgrupo → componente → dano/causa. O comando `npm run pm:gaps:audit` gera `reports/pm-gap-audit.generated.json` como artefato do CI e falha quando uma classificação deixa de refletir o cadastro.

[Relatório técnico e plano de saneamento](docs/CICLO_2026-10-20_LACUNAS_PM.md). Contagem de candidatos **não é** validação de componente real, falha ou causa.

## Condições × atividades × danos (v1.3.6)

Nova [ontologia de condições, atividades e danos](data/ontology/condition-action-damage.v1.json) separa **7 condições-alvo**, **8 atividades**, **4 danos meramente hipotéticos** e **22 relações tipadas** em quatro regras de combustível e arrefecimento. Nenhum registro apresenta diagnóstico real, atividade executada ou código SAP homologado.

- [Contrato JSON Schema](schemas/condition-action-damage.schema.json)
- [Validação semântica](scripts/validate-condition-action-damage.mjs) com **7 regressões sintéticas** em [fixtures](data/quality/semantic-regression-fixtures.v1.json)
- [Pesquisa e relatório técnico](docs/CICLO_2026-10-20_SEMANTICA_CONDICAO_ACAO_DANO.md)

O comando `npm run semantics:validate` impede transformar uma condição medida ou ação planejada em falha física confirmada. **Água no combustível ≠ defeito do dreno**; **sujeira externa do radiador ≠ obstrução interna**.

## Ciclo de efeitos funcionais e ampliação semântica (v1.3.7)

O [modelo de condições/ações/danos](data/ontology/condition-action-damage.v1.json) passa a cobrir **motor diesel, hidráulica e rodante**, além de combustível e arrefecimento: **18 condições**, **18 atividades**, **9 danos candidatos**, **9 agrupamentos PM** e **53 relações**. Mantém distinção entre observação possível, inspeção planejada e dano ainda não confirmado.

A nova [base de efeitos](data/knowledge/causal-effects.v1.json) diferencia **24 efeitos locais e 24 efeitos sistêmicos potenciais**, com condições de propagação e ressalvas. Nenhum efeito foi observado no equipamento. Não há severidade, probabilidade ou efetividade OEM preenchidas.

- [Relatório de pesquisa e decisões técnicas](docs/CICLO_2026-10-20_EFEITOS_MOTOR_HIDRAULICA_RODANTE.md)
- [Contrato JSON Schema dos efeitos](schemas/causal-effects.schema.json)
- [14 testes sintéticos contra inferências indevidas](data/quality/semantic-regression-fixtures.v1.json)
- `npm run semantics:validate` e `npm run effects:validate` rodam no CI.

**Situação de curadoria:** as 10 lacunas de PM e as 24 cadeias sem homologação continuam abertas. Nenhum código SAP foi preenchido por aproximação.

## Qualidade das evidências e governança técnica (v1.3.8)

O banco agora dispõe de [48 requisitos de evidência](data/quality/evidence-requirements.v1.json) para os dois testes de cada uma das 24 cadeias causais, com **67 campos possíveis de metadados**, interpretações favoráveis/desfavoráveis/inconclusivas, critérios de qualidade e baseline OEM pendente. **Nenhum teste foi executado.**

A [fila de curadoria](data/governance/technical-review-register.v1.json) tem **24 cadeias aguardando revisão**, seis delas priorizadas para análise P0. O fluxo diferencia revisão mecânica, confirmação de efetividade OEM e evidência diagnóstica. **Não existe homologação automática**; a revisão requer avaliadores independentes do autor.

- [Relatório técnico do ciclo](docs/CICLO_2026-10-20_EVIDENCIAS_GOVERNANCA.md)
- [Contrato de dados dos requisitos](schemas/evidence-requirements.schema.json)
- [Oito testes sintéticos de qualidade e independência](data/quality/evidence-gate-regressions.v1.json)
- `npm run evidence:validate`: integridade de 48/48 testes, 24/24 revisões e ausência de resultados/limites OEM fictícios.

Os **10 bloqueios preventivos SAP anteriores permanecem**. Não foram aprovadas causas, peças, limites, gravidades ou eventos de campo.

## Capacidade discriminante dos testes prioritários (v1.3.9)

A [matriz de seis testes P0](data/quality/discriminative-tests.v1.json) distingue **o que cada método detecta**, **o que não consegue determinar**, fatores de confusão e hipóteses alternativas que continuam em aberto. Possui **12 análises de alternativas** e **12 verificações complementares** sugeridas — nenhuma executada.

As quatro classes qualitativas são **taxonomia editorial própria**, não sensibilidade/especificidade ISO nem probabilidade validada. Nenhum teste confirma causa automaticamente.

- [Pesquisa e relatório do ciclo](docs/CICLO_2026-10-20_DISCRIMINACAO_TESTES.md)
- [Contrato JSON Schema](schemas/discriminative-tests.schema.json)
- [12 casos sintéticos de regressão](data/quality/discrimination-regressions.v1.json)
- `npm run discrimination:validate` verifica cobertura dos seis P0, hipóteses concorrentes, fontes e ausência de medições inventadas.

Mantêm-se **24 cadeias, 48 investigações propostas, 10 regras PM bloqueadas e zero casos reais ou OEM homologados**.

## Diagnóstico diferencial por hipótese e piloto OEM D9 (v1.3.10)

A [matriz cruzada de verificações complementares](data/quality/complementary-discrimination.v1.json) avalia **12 hipóteses concorrentes × 2 métodos = 24 relações**. Destas, **7 não discriminam**, **12 oferecem apenas indício parcial** e **5 podem discriminar sob condições específicas**; permanecem **12 lacunas sem fechamento**. Nenhuma probabilidade ou evidência de campo foi calculada.

- [Revisão SAP de causa circular](data/quality/circular-sap-causality.v1.json): o par `TRAK/0320/01.15/C1.17` não explica sozinho por que houve perda de pré-carga.
- [Piloto CAT D9 bloqueado por falta de efetividade OEM](data/quality/oem-pilot-readiness.v1.json): requer arranjo/série, documentação aplicável e revisão de engenharia.
- [Relatório técnico de pesquisa](docs/CICLO_2026-10-20_DISCRIMINACAO_COMPLEMENTAR.md) e [contrato JSON Schema](schemas/complementary-discrimination.schema.json).
- `npm run differential:validate` verifica IDs, hipóteses, métodos, pertinência e ausência de falsa homologação.

**Não alteramos o catálogo SAP de origem ou os consumidores.** Permanecem 24 cadeias, 48 investigações e 10 bloqueios de regras preventivas.

## Diagnóstico diferencial aprofundado e hierarquia causal (v1.3.11)

Três [roteiros diagnósticos](data/quality/diagnostic-pathways.v1.json) ampliam as lacunas prioritárias: **origem da mancha em mangueira**, **origem das partículas do comando final** e **perda de pré-carga de fixadores**. São **9 etapas planejadas**, cada uma com sinais favoráveis às duas hipóteses, condições inconclusivas, metadados e exigências de segurança.

Os roteiros distinguem **fenômeno observado, mecanismo imediato candidato, fator contribuinte e causa raiz sistêmica apenas candidata**. Nenhuma causa raiz é declarada sem evidência. 

- [Relatório técnico v1.3.11](docs/CICLO_2026-10-20_ROTEIROS_CAUSALIDADE.md)
- [Contrato JSON Schema](schemas/diagnostic-pathways.schema.json)
- [9 cenários sintéticos](data/quality/pathway-regressions.v1.json) e `npm run pathways:validate` para impedir promoção causal indevida.

As 24 cadeias causais e 10 bloqueios preventivos SAP permanecem, sem dados OEM/ocorrência inventados e sem alterações em consumidores.

## Quatro níveis causais e exportação pública (v1.3.12)

As **24 cadeias causais** agora têm [camada de causalidade em quatro níveis](data/ontology/causal-levels.v1.json): fenômeno potencialmente observável, mecanismo físico imediato, fatores contribuintes e hipóteses condicionais de causa raiz. Foram ampliadas **21 cadeias** e preservadas as 3 documentadas na v1.3.11, sem declarar ocorrência real.

A [política de publicação](data/governance/public-export-policy.v1.json) permite produzir um **preview público** com somente campos aprovados, fonte bibliográfica, status de revisão e aplicabilidade nula quando não confirmada. O gerador cria `reports/public-knowledge.v1.json` e `reports/public-manifest.v1.json` (artefatos do CI, não conteúdo commitado). O manifesto contém **hash SHA-256** do JSON exportado.

- [Relatório técnico do ciclo](docs/CICLO_2026-10-20_CAUSALIDADE_EXPORTACAO.md)
- [Validação das 24 cadeias](scripts/validate-causal-levels.mjs)
- [Exportador público determinístico](scripts/export-public-knowledge.mjs) e [validador](scripts/validate-public-knowledge.mjs)
- [Esquemas JSON](schemas/causal-levels.schema.json) e [preview](schemas/public-knowledge-preview.schema.json)

Comandos: `npm run causal:levels:validate`, `npm run public:export` e `npm run public:validate`. **O preview não é liberado para uso operacional ou diagnóstico causal automático.** Nenhum consumidor foi modificado.

## Auditoria de causas sistêmicas e compatibilidade (v1.3.13)

Foram avaliadas editorialmente **42 hipóteses de causas sistêmicas** das 21 cadeias ampliadas na v1.3.12. O [registro de auditoria](data/governance/systemic-root-audit.v1.json) exige **duas fontes de evidência de processo e uma explicação alternativa não organizacional** para cada alegação, mantendo `causalConclusion=nao_demonstrada`. **Nenhum desvio de processo, causa raiz ou responsabilidade pessoal foi comprovado.**

A interface pública mantém [contrato SemVer 1.0.0](data/governance/public-contract.v1.json), desacoplado da versão interna do banco. O **preview público permanece na versão 1.3.12** e conserva o mesmo checksum; as novas informações de auditoria não foram acrescentadas silenciosamente ao pacote já publicado.

- [Relatório técnico e decisões](docs/CICLO_2026-10-20_AUDITORIA_SISTEMICA_CONTRATO.md)
- [Validador causal](scripts/validate-systemic-root-audit.mjs) e [contrato JSON](schemas/systemic-root-audit.schema.json)
- [Validador da compatibilidade pública](scripts/validate-public-compatibility.mjs) e [oito regressões sintéticas](data/quality/contract-compatibility-regressions.v1.json)
- `npm run systemic:audit:validate` e `npm run public:compatibility` no CI

As 24 cadeias e 48 investigações continuam sem execução/validação OEM por série. **Nenhum consumidor foi alterado.**

## Governança de releases de conteúdo público (v1.3.15)

Agora coexistem **três versões independentes**: **pacote interno 1.3.15**, **contrato/API 1.0.0** e **conteúdo público 1.0.0** (baseline retrospectiva). O campo histórico `version=1.3.12` dentro do preview **não foi mudado**, para preservar exatamente os mesmos bytes e o hash do pacote legado. **Esta versão interna não publica nova FMEA nem aprova caso real.**

O [registro de releases de conteúdo](data/governance/public-content-releases.v1.json) aponta para um [golden snapshot integral](data/governance/snapshots/public-knowledge.content-1.0.0.json), guardado no repositório, e para seu SHA-256 fixo. A [política](data/governance/public-content-release-policy.v1.json) diferencia correção editorial patch, adição segura minor e alteração incompatível, que exige contrato major e plano de migração. A promoção de hipótese para causa confirmada é **bloqueada**.

- `npm run public:export` reproduz o preview por allowlist, sem dados corporativos.
- `npm run public:content:validate` compara versão, histórico, snapshots e artefato exportado **byte a byte**.
- `npm run public:content:test` executa **17 regressões sintéticas**, incluindo remoção de ID, troca de mecanismo, promoção causal e alterações sem bump.
- `npm run qa` e GitHub Actions executam esses gates juntamente com a validação original de contrato e hash.

[Relatório técnico v1.3.15](docs/CICLO_2026-10-20_VERSIONAMENTO_CONTEUDO.md) · [Schema do registro](schemas/public-content-releases.schema.json). Não houve mudança de conteúdo publicado nem edição de consumidores externos.

## Gate de exceções preventivas e piloto OEM D9 (v1.3.16)

Foram documentadas **10 regras de PM sem candidatos estritos** em [registro de evidências](data/quality/pm-exception-evidence-gates.v1.json). O objetivo é identificar por que o cruzamento entre subgrupo, peça, dano e causa SAP não é válido, **sem inventar compatibilidades**. Cada exceção possui modo físico a discriminar, dois conjuntos de documentação requerida, explicação concorrente e decisão formal `manter_bloqueado_sem_evidencia`.

As dez exceções distribuem-se em três falhas de escopo/hierarquia de subgrupo, cinco componentes não cadastrados no tipo de objeto efetivo e duas combinações dano–causa não autorizadas. Essas contagens **não são dez falhas de máquina**.

O [plano de evidências D9](data/quality/oem-d9-evidence-intake.v1.json) cobre sete requisitos pendentes do piloto CAT D9, preservando oito cadeias de rodante como hipóteses. Nenhum prefixo, série, número de peça, torque ou limite CTS foi preenchido sem evidência OEM efetiva.

O comando `npm run pm:exceptions:validate` cruza essas bases com os dados da auditoria PM, confere os sete requisitos e executa **16 regressões sintéticas** de vazamento de evidência ou aprovação indevida. Está incorporado ao CI e a `npm run qa`.

[Relatório v1.3.16](docs/CICLO_2026-10-20_PM_EXCECOES_D9.md). O conteúdo público, contrato, golden snapshot e repositórios consumidores permanecem inalterados.

## Ampliação do diagnóstico diferencial (v1.3.17)

O [novo lote de roteiros](data/quality/diagnostic-pathway-expansion.v1.json) acrescenta **três diagnósticos comparativos** aos três já desenvolvidos na v1.3.11, totalizando **seis roteiros aprofundados**. Os originais permanecem inalterados para manter rastreabilidade e compatibilidade dos validadores históricos. Os três novos tratam: **colmeia obstruída versus ventilador insuficiente**, **rolete preso por detritos versus falha interna**, e **bomba de arrefecimento insuficiente versus termostato/bypass com restrição**.

Cada roteiro contém **3 etapas propostas**, desfechos que sustentariam A/B ou seriam inconclusivos, limites de segurança, campos mínimos de medição, alternativas adicionais e **4 requisitos documentais** antes de revisão técnica. Nenhum ensaio foi executado, nenhum limite OEM foi inventado e os resultados não confirmam causas.

O comando `npm run pathways:expand:validate` aplica validações de IDs, literatura, mecanismos, condições de campo pendentes e **21 regressões sintéticas** (9 de checklist e 12 de mutação indevida). O pipeline CI e `npm run qa` executam também esse controle.

[Relatório do ciclo v1.3.17](docs/CICLO_2026-10-20_ROTEIROS_DIFERENCIAIS_II.md) · [Schema do lote](schemas/diagnostic-pathway-expansion.schema.json). As **24 cadeias causais** continuam hipóteses, com 0 causas homologadas, e nenhuma alteração do contrato, snapshot público ou consumidores.

## Seis playbooks didáticos aprofundados por ID (v1.3.18)

O [lote de seis análises](data/quality/playbook-deepdives.v1.json) confronta explicitamente as três hipóteses H1/H2/H3 já existentes nos playbooks `PB-*`: CAT 980 cilindro, Sandvik DR410i avanço, Sandvik DI650i pneumática, CAT 16 pneus, CAT 777 alimentação de combustível e CAT 6030 lubrificação do motor. Foram incluídas **18 etapas**, **24 pré-requisitos documentais** e **34 regressões sintéticas**, sem inspeções reais.

**Nota de cobertura:** a biblioteca contém 12 playbooks didáticos, mas os seis roteiros aprofundados anteriormente (`PATH-*`) cobriam **cadeias causais**, não seis IDs de playbook. Portanto, a inclusão deste lote **não significa 12/12 playbooks homologados ou aprofundados por ID**. Os outros seis IDs permanecem identificados no campo `otherPlaybookIds`, inclusive a bomba hidráulica da 395. Não há mapeamento automático de playbooks a local SAP ou causa raiz.

- [Validador de rastreabilidade](scripts/validate-playbook-deepdives.mjs): `npm run playbooks:deepdives:validate` verifica cada H1/H2/H3 em comparação literal com a origem e bloqueia 16 mutações proibidas.
- [Schema JSON](schemas/playbook-deepdives.schema.json), [fixtures sintéticas](data/quality/playbook-deepdives-regressions.v1.json) e [relatório técnico](docs/CICLO_2026-10-20_PLAYBOOKS_DIFERENCIAIS.md).
- Três referências gerais adicionadas ao índice: segurança de pressão/desgaste de pneus Michelin e especificação de arquitetura DI650i S5 da Sandvik, **sem presumir aplicação por série**.

O contrato 1.0.0, release público 1.0.0, preview original 1.3.12 e checksum permanecem congelados, sem alterações no jogo.

## V1.3.19 — 12/12 playbooks aprofundados por ID, sem homologação

A [segunda metade dos deepdives](data/quality/playbook-deepdives-remaining.v1.json) desenvolve os seis cenários `PB-*` ainda sem revisão individual: **bomba hidráulica CAT 395**, mangueiras CAT 395, arrefecimento CAT 6030, comando final CAT 777, rodante D9 e radiador CAT 980. Os seis [deepdives anteriores](data/quality/playbook-deepdives.v1.json) permanecem intactos. O total é agora **12/12 playbooks documentados**, sem observações de campo.

A [matriz PB × FC](data/quality/playbook-causal-crosswalk.v1.json) documenta **18 hipóteses examinadas**, **18 propostas de vínculo em 13 hipóteses**, cinco hipóteses sem correspondência suficiente e **zero vínculos confirmados**. Nenhuma cadeia de bomba d’água foi convertida em bomba hidráulica de implemento. Referência de modelo/série, local SAP, PN, medição e aprovação OEM permanecem pendentes.

São 18 novas etapas técnicas, 24 requisitos de evidência e **46 testes sintéticos** (18 de prontidão, 16 mutações de deepdive, 12 mutações de crosswalk). Execute `npm run playbooks:remaining:validate` para conferir a segunda metade ou `npm run qa` para todos os gates. [Relatório técnico](docs/CICLO_2026-10-20_PLAYBOOKS_COMPLETOS_PB_FC.md).

O contrato público 1.0.0, conteúdo 1.0.0, preview legado 1.3.12 e hash anterior não foram alterados, nem os repositórios consumidores.

## v1.3.20 — triagem das cinco lacunas PB–FC

As **cinco hipóteses sem mecanismo equivalente** da matriz PB–FC foram reavaliadas. Três exigem possível ampliação do catálogo de mecanismos: **vedação externa de bomba hidráulica**, **perdas hidráulicas internas de bomba** e **deterioração superficial de dentes de engrenagens**. Outras duas **não são modos de falha**: óleo escorrido de uma fonte superior e mudança/contaminação de lubrificante sem dano demonstrado.

Os [três candidatos](data/quality/proposed-causal-chains.v1.json) permanecem em **coleção editorial independente**, sem IDs `FC-*`, e a [matriz de decisões](data/quality/causal-gap-triage.v1.json) registra as cinco justificativas e contraprovas. **Continuam 24 cadeias no núcleo; não houve criação de novas FMEAs aprovadas.**

O comando `npm run causal:gaps:validate` verifica escopo, fontes, hipótese alternativa, aplicação OEM, ausência de resultado de campo e **21 regressões sintéticas** (cinco decisões e 16 alterações perigosas). O `npm run qa` e o GitHub Actions aplicam o mesmo gate.

[Relatório técnico do ciclo](docs/CICLO_2026-10-20_TRIAGEM_LACUNAS_CAUSAIS.md) · [Schema das propostas](schemas/proposed-causal-chains.schema.json) · [Schema da triagem](schemas/causal-gap-triage.schema.json).

O contrato público **1.0.0**, release de conteúdo **1.0.0**, preview **1.3.12** e hash histórico continuam congelados; repositórios consumidores não foram alterados.

## Auditoria taxonômica das três candidatas (v1.3.21)

A [auditoria de coerência](data/quality/proposal-taxonomy-audit.v1.json) verificou as três propostas `CAND-*` frente à ontologia de funções `FF-*`, mecanismos `ME-*`, efeitos possíveis e **seis sobreposições conceituais** com cadeias `FC-*`. **Nenhuma cadeia ou novo mecanismo foi homologado**.

- Vedação externa de bomba hidráulica: **FF-06 / ME-15**, compatibilidade *conceitual* existente; não atribuir ao terminal de mangueira ou à bomba de água.
- Perdas internas de bomba: **FF-02**; ME-15 não descreve automaticamente fuga por folgas; o conceito ontológico de perda volumétrica exige refinamento separado de desgaste e comando.
- Dano nos dentes do comando final: **FF-02**, mas as famílias ME-01 (abrasão), ME-02 (adesão) e ME-03 (fadiga de contato) requerem **desdobramento de mecanismos** antes de um novo `FC-*`.

O comando `npm run taxonomy:proposals:validate` e o pipeline completo executam **3 verificações de baseline e 18 mutações sintéticas**, bloqueando aprovação, local SAP, série, dano medido ou efeito observado artificialmente. [Relatório técnico](docs/CICLO_2026-10-21_AUDITORIA_TAXONOMICA.md).

**Estado:** 24 cadeias no núcleo, três candidatas fora dele, nenhuma homologação OEM, contrato público 1.0.0 e conteúdo 1.0.0 inalterados. O preview legado 1.3.12 não foi modificado.

## Refinamento de mecanismos — v1.3.22

A [coleção de refinamentos](data/quality/mechanism-refinements.v1.json) define **quatro propostas editoriais** vinculadas à auditoria das três candidatas: **uma perda volumétrica interna excessiva** em bomba hidráulica e **três submodos de dano superficial em engrenagens** (abrasão, adesão e fadiga de contato).

**Perda interna normal não é falha:** não se deve reprovar uma bomba pela simples existência de vazão de dreno; arquitetura, perdas esperadas, comando, fluido, pressão, temperatura e rotação precisam ser conhecidos. O fluxo de dreno de carcaça não equivale automaticamente à totalidade das perdas volumétricas. Os valores de bombas de palhetas Parker não foram transferidos para CAT 395.

**A ISO 10825-1:2022** fornece nomenclatura de condição e aparência de dentes, mas o resumo público declara que a norma *não determina causas ou medidas preventivas*. Para CAT 777, a distinção entre marcas abrasivas, adesivas e fadiga permanece hipótese que depende de inspeção localizada.

O novo `npm run mechanisms:refinements:validate` executa **24 cenários sintéticos (4 baseline + 20 mutações)**. As 24 cadeias FC e os 15 mecanismos ME do núcleo foram preservados; o contrato público continua 1.0.0 e o conteúdo público 1.0.0. [Relatório técnico](docs/CICLO_2026-10-21_REFINAMENTO_MECANISMOS.md) · [Schema](schemas/mechanism-refinements.schema.json).

## Evidências restritas e revisão independente (v1.3.23)

A [política de evidências](data/governance/restricted-evidence-workflow.v1.json) define **seis estados de revisão**, cinco classes de evidência (OEM, procedimento, observação, contraprova e qualidade da medição) e segregação entre solicitante, custodiante e dois revisores. O [gate automatizado](scripts/validate-restricted-evidence.mjs) passa por **29 cenários de teste sintéticos** e é parte do GitHub Actions e `npm run qa`.

**Atenção:** esta é uma especificação de processo com testes de validação, **não um cofre, sistema de autenticação ou fluxo corporativo já implantado**. Nenhum dado real deve ser adicionado ao repositório público. A etapa final representa prontidão para solicitação manual de mudança, não aprovação de uma causa ou liberação de máquina.

[Procedimento de custódia](docs/PROCEDIMENTO_EVIDENCIAS_RESTRITAS.md) · [Relatório v1.3.23](docs/CICLO_2026-10-21_CUSTODIA_EVIDENCIAS.md) · [JSON Schema de caso](schemas/restricted-evidence-case.schema.json).

## Arquitetura corporativa restrita — v1.3.24

O [blueprint de implantação](data/governance/restricted-infrastructure-design.v1.json) descreve **sete componentes de arquitetura**, **oito perfis de acesso** e separação de funções, trilha de auditoria com âncora externa e retenção com *legal hold*. O validador `npm run infrastructure:restricted:validate` executa **42 cenários inteiramente sintéticos**: 20 decisões de autorização, dez verificações de cadeia de eventos e 12 cenários de elegibilidade para revisão de descarte.

**Atenção:** *não há infraestrutura corporativa implantada*. O modelo de RBAC não autentica usuários reais; os hashes demonstram detecção de alteração apenas diante de **âncora confiável externa**, e as regras de retenção não apagam dados. Prazos, permissões e implantação exigem deliberação da empresa. Nenhum caso real, credencial, URL, documento OEM, laudo ou registro de série deve entrar no repositório público.

[Especificação de implantação e ameaças](docs/ARQUITETURA_RESTRITA_IMPLANTACAO.md) · [Relatório v1.3.24](docs/CICLO_2026-10-21_ARQUITETURA_CORPORATIVA_RESTRITA.md) · [Schema JSON](schemas/restricted-infrastructure-design.schema.json).

## Plano de aceite para staging restrito — v1.3.25

O [plano de homologação](data/governance/staging-acceptance-plan.v1.json) especifica **8 domínios**, **32 controles obrigatórios** e seis aprovações manuais futuras de TI, Segurança, Engenharia e Privacidade. O [validador](scripts/validate-staging-acceptance.mjs) executa **52 testes sintéticos** (8 baselines, 32 controles faltantes e 12 tentativas de forjar resultados/assinaturas), integrados ao `npm run qa` e ao GitHub Actions.

**Não há staging corporativo provisionado nem homologado**: os testes só validam a coerência da especificação e não substituem teste de integração contra IdP, vault, backend, log externo e backup reais. O pacote proíbe documentos OEM, casos, números de série, valores reais ou credenciais em repositório público e mantém a necessidade de autorização corporativa prévia.

[Runbook de homologação para TI](docs/RUNBOOK_HOMOLOGACAO_STAGING.md) · [Relatório do ciclo](docs/CICLO_2026-10-21_HOMOLOGACAO_STAGING.md) · [Schema JSON](schemas/staging-acceptance-plan.schema.json).

## Contrato de adaptador de staging (v1.3.26)

O [contrato de integração](data/governance/staging-integration-contract.v1.json) define uma interface `executeProbe` e um **adaptador exclusivamente offline** para os 32 controles dos oito cenários de homologação corporativa. O [schema de resultados](schemas/staging-probe-result.schema.json) só aceita envelopes públicos `TEST-*`, sem documentos, credenciais, URLs privadas ou resultados reais.

O comando `npm run staging:adapter:validate` executa **56 regressões sintéticas**: oito cenários-modelo completos, 32 controles reprovados e 16 envelopes impróprios bloqueados. Um resultado `synthetic_complete` **não** representa integração, homologação de staging ou aprovação de segurança. A implementação de adaptador de rede e a custódia de resultados reais ficam exclusivamente com TI, em ambiente corporativo autorizado.

[Contrato de interface e limites](docs/CONTRATO_ADAPTADOR_STAGING.md) · [Relatório do ciclo](docs/CICLO_2026-10-21_CONTRATO_ADAPTADOR_STAGING.md).

## Custódia e atestação de resultados de staging (v1.3.27)

O [contrato de custódia](data/governance/private-result-custody-contract.v1.json) especifica como um backend corporativo restrito deverá comprovar **integridade, autenticidade da origem, proveniência, verificação de custódia e dois pareceres independentes** sobre resultados de testes de integração.

A biblioteca [`private-result-attestation.mjs`](scripts/lib/private-result-attestation.mjs) demonstra atestações encadeadas usando **Ed25519 e chaves descartáveis geradas em memória**. O comando `npm run custody:results:validate` executa **48 regressões totalmente sintéticas**: oito atestações válidas de teste e quarenta tentativas bloqueadas de alterar resultados, usar chaves revogadas, burlar vínculos/identidades, omitir evidência ou declarar aprovação/publicação.

**Não há assinatura ou autenticação corporativa real.** O script não confirma que um fato foi observado nem substitui governança humana. Nenhum resultado privado, laudo OEM, número de série, chave privada, credencial ou URL corporativa é armazenado aqui; recibos reais, verificação de certificados e registro de replay precisam existir **exclusivamente em infraestrutura restrita aprovada pela empresa**.

[Runbook de resultados e cadeia de confiança](docs/CUSTODIA_RESULTADOS_STAGING.md) · [Relatório v1.3.27](docs/CICLO_2026-10-21_ATESTACAO_RESULTADOS_STAGING.md) · [JSON Schema de recibo privado](schemas/private-staging-result-attestation.schema.json).

## Triagem de resultados reprovados e inconclusivos — v1.3.28

A [política de tratamento de exceções](data/governance/staging-result-exception-workflow.v1.json) diferencia **falha de controle**, **evidência inconclusiva** e **erro do verificador/infraestrutura**. Exige esclarecimento, novo run de teste, histórico preservado e segunda revisão antes de encerrar a **triagem**, sem confundir isso com resolução do desvio original.

O comando `npm run staging:exceptions:validate` executa **64 regressões sintéticas** (24 históricos válidos e 40 alterações rejeitadas), com validação de sequência, papéis, independência dos revisores, evidências `TEST-*`, encadeamento SHA-256 e âncora externa **simulada**. Nenhum dado real é coletado ou validado.

O resultado máximo, mesmo após reteste fictício `pass`, é `retest_passed_needs_manual_security_review`: **não** é autorização de segurança, homologação de staging, causa raiz de equipamento, liberação operacional ou promoção de FMEA. Os estados de bloqueio ou inconclusão devem manter a não conformidade controlada fora deste mock público.

[Runbook de tratamento](docs/TRATAMENTO_EXCECOES_STAGING.md) · [Relatório v1.3.28](docs/CICLO_2026-10-21_TRATAMENTO_EXCECOES.md) · [Schema dos históricos](schemas/staging-exception-case.schema.json).

## Catálogo de remediação e reincidência — v1.3.29

O [catálogo de remediação](data/governance/recurrent-remediation-catalog.v1.json) separa **quatro frentes**: falha de controle de segurança, qualidade de evidência inconclusiva, erro do verificador/ambiente e escalonamento transversal da **reincidência**. Cada frente define cinco ações e cinco evidências que deverão ser avaliadas antes de qualquer conclusão corporativa.

O [validador](scripts/validate-recurrent-remediation.mjs) executa **52 testes inteiramente sintéticos**: 12 históricos e 40 alterações indevidas. A correlação de reincidência só agrupa o mesmo tenant, cenário, controle e classe de problema, com *runs distintos*; **dois runs em 30 dias são apenas parâmetros de demonstração**, não um SLA ou limiar aprovado pela empresa.

O resultado `eligible_for_manual_review` significa somente que a **proposta documental** passou nas verificações do mock. Não certifica que o reparo foi feito, que um controle ficou conforme, que o incidente foi encerrado ou que surgiu nova causa de falha mecânica.

[Runbook de remediação](docs/REMEDIACAO_DESVIOS_RECORRENTES.md) · [Relatório do ciclo](docs/CICLO_2026-10-21_REMEDIACAO_RECORRENCIA.md) · [Schema de proposta](schemas/recurrent-remediation-plan.schema.json).

## Matriz consolidada de bloqueios — v1.3.30

A [matriz de bloqueios](data/governance/consolidated-blockers.v1.json) reúne **8 frentes** com fonte exata, contagem do escopo original, disciplina responsável (sem inventar responsável individual), próxima ação controlada e requisitos para eventual liberação:

- Engenharia/OEM: **7 insumos do D9**, **3 cadeias causais candidatas** e **4 refinamentos ME** ainda sem aprovação.
- Integridade da base: **10 regras PM × SAP** bloqueadas, **24 cadeias aguardando revisão técnica**, **48 alegações sistêmicas não comprovadas**.
- Infraestrutura corporativa: **7 componentes não provisionados** e **6 aceites formais de staging pendentes**.

**Essas contagens representam conjuntos de fontes diferentes, com sobreposições. Não somar como tarefas independentes.** Todas as frentes permanecem bloqueadas; este repositório não recebeu dados corporativos, documentos OEM restritos, certificados humanos ou limites de equipamento.

O comando `npm run blockers:validate` reconcilia os oito arquivos originais e executa **40 testes sintéticos** (8 baselines e 32 tentativas de criar desbloqueios fictícios). A [matriz executiva](docs/MATRIZ_CONSOLIDADA_BLOQUEIOS.md) explica caminhos críticos, responsabilidades institucionais, prioridade editorial e o próximo passo para obter evidência real com segurança.

## Solicitação OEM D9 preparada — v1.3.31

O [pedido técnico D9](data/governance/d9-oem-evidence-request.v1.json) relaciona **sete requisitos** ao piloto de material rodante: configuração efetiva, OMM, lista OEM de peças/arranjos, junta sapata–elo, método CTS, dados mestres SAP e revisão independente de campo. Os arquivos originais permanecem na condição de **2 não fornecidos, 4 não verificados e 1 não executado**.

O [texto para encaminhamento interno](docs/SOLICITACAO_TECNICA_OEM_D9.md) separa o que a equipe de documentação deve obter daquilo que Engenharia/Inspeção só poderá verificar presencialmente mediante procedimento seguro. O pedido está **pronto para envio**, não foi enviado; nenhum manual, número de série, PN, torque, limite CTS, código SAP, credencial ou laudo real consta no repositório.

O comando `npm run d9:oem:request:validate` realiza **35 testes sintéticos**: sete verificações de origem e 28 adulterações rejeitadas, preservando bloqueios e direitos de publicação.

[Relatório do ciclo](docs/CICLO_2026-10-21_SOLICITACAO_OEM_D9.md) · [Schema de solicitação](schemas/d9-oem-evidence-request.schema.json).

## Referências OEM públicas para o D9 — v1.3.32

A [matriz de literatura Caterpillar](data/research/d9-public-oem-literature.v1.json) reúne **5 páginas oficiais públicas** e relaciona sua capacidade de evidência aos **7 requisitos ainda bloqueados** do piloto D9. Duas referências já estavam no catálogo de fontes; três foram pesquisadas adicionalmente.

A pesquisa sustenta práticas **gerais** (configurações alternativas D9–D11, inspeção de fixações, roletes e tensionamento, conceito do método torque-turn e serviço CTS Pro), mas **não identifica arranjo instalado, procedimento por série, PN, torque, limites CTS, dados SAP nem diagnóstico de falha**.

O [guia técnico de fronteiras de evidência](docs/PESQUISA_PUBLICA_OEM_D9.md) discrimina o que pode ser apresentado na solicitação [v1.3.31](docs/SOLICITACAO_TECNICA_OEM_D9.md) e o que obrigatoriamente requer SIS/OMM licenciado, verificação de campo e revisão independente.

`npm run d9:public:oem:validate` executa **31 regressões sintéticas** (7 vínculos e 24 alterações indevidas), impedindo promover conhecimento geral a especificação de máquina. **O pedido corporativo continua não enviado**; o CI público não homologa equipamentos.

## Encaminhamento externo D9 — v1.3.33

O próximo avanço é **institucional**, não mais uma pesquisa pública: foi aberta a [issue #31](https://github.com/pedromaintenance/fmea-database-mining/issues/31) como fila de acompanhamento do pedido OEM do D9. Ela não equivale a envio por e-mail, à consulta efetiva do SIS ou à aprovação de engenharia.

O [controle de encaminhamento](data/governance/d9-external-handoff.v1.json) vincula a issue aos **sete requisitos originais** e separa: definir canal/destinatário privado, encaminhar solicitação, obter referências sob licença e verificar efetividade com revisão humana. O [guia operacional de handoff](docs/D9_HANDOFF_ENVIO_OEM.md) informa exatamente o que enviar, o que deve permanecer no sistema corporativo e quais estados podem ser atualizados com evidência.

O comando `npm run d9:handoff:validate` executa **27 verificações sintéticas** (7 vínculos + 20 adulterações bloqueadas) no QA/CI. **Estado verdadeiro: issue pública criada; nenhum destinatário corporativo confirmado, nenhuma solicitação enviada, nenhum documento recebido e nenhuma inspeção executada.**

## Auditoria de vínculos preventivos × SAP — v1.3.34

A [auditoria PM de escopo funcional](docs/AUDITORIA_PM_ESCOPO_FUNCIONAL.md) executa uma reconciliação **sobre o catálogo real** das **25 regras preventivas**. Para cada vínculo candidato gerado, a verificação agora exige concordância integral entre o modelo da regra, sistema e grupo funcional, subgrupo SAP, localização e tipo de objeto, descrição do componente, dano, causa, sintoma, inspeção e sinalizadores de **não observação/não homologação**.

O comando `npm run pm:scope:audit` calcula, por regra, as etapas de cobertura e as causas de ausência de vínculos. Executa também **24 mutações adversariais** nos candidatos reais ou no conjunto gerado, rejeitando cruzamentos indevidos de sistemas, componentes, códigos e afirmações de evidência. O relatório numérico é gerado em `reports/pm-system-scope-audit.generated.json` durante o QA.

Esta é uma validação de **integridade estrutural**, não uma aprovação OEM/SAP: as **10 exceções PM × SAP** continuam bloqueadas, e nenhuma inspeção de campo ou causa raiz foi confirmada. O [pedido OEM D9](https://github.com/pedromaintenance/fmea-database-mining/issues/31) permanece aguardando envio por canal corporativo autorizado.

## Comece por aqui

Leia [Modelo de Dados](docs/MODELO_DE_DADOS.md), [Curadoria e Qualidade](docs/CURADORIA.md), [Roadmap](docs/ROADMAP.md) e [Histórico](CHANGELOG.md).

Consumidores externos podem **ler releases estáveis**; desenvolvimento de jogos, adaptação de interface, salvamento e decisões de importação ficam fora deste repositório.
