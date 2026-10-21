# ROADMAP VIVO — FMEA Database Mining

**Atualizado:** 20/10/2026 · **Ciclo:** catálogo técnico v1.3.22 · **Responsável editorial:** projeto FMEA Database Mining

> **Este repositório desenvolve somente a base de conhecimento.** O *Você Quebra, Eu Conserto* e outros sistemas são consumidores externos e **não fazem parte do escopo de execução deste roadmap**. Podemos disponibilizar contratos/exportações versionados, mas não alteramos jogos, interfaces, progresso, PWA nem repositórios consumidores por aqui.

## Missão e definição de qualidade

Transformar informações sobre equipamentos móveis de mineração em um **banco de FMEA e diagnóstico rastreável**: função → falha funcional → modo de falha → componente → mecanismo/dano/causa → efeitos → sintomas → hipóteses concorrentes → métodos e resultados de evidência → ações preventivas/detectivas. Conectar esses conceitos aos códigos reais de **sistema, grupo e subgrupo** do local funcional sem criar falsos vínculos.

O objetivo não é maximizar número de combinações. É obter **relações mecanicamente coerentes**, documentadas, reproduzíveis e úteis tanto ao técnico quanto ao planejamento.

### Regras de segurança epistemológica

- Fato cadastral, inferência, simulação, hipótese de laboratório e ocorrência real devem ter **naturezas distintas**.
- Um DTC, metal de desgaste, código de dano, tarefa preventiva ou sintoma isolado **não prova causa raiz**.
- Uma relação criada por algoritmo não é um modo de falha *validado*.
- Não inventar: localização por lado, código de componente, torque, pressão de referência, limite analítico, frequência de falha, custo real ou probabilidade.
- Verificar **modelo, sistema, grupo, subgrupo, tipo de objeto e configuração** antes de aceitar relação.
- Repositório público: não inserir planilhas originais, documentos internos, números de série, laudos corporativos ou conteúdo OEM licenciado sem permissão.
- Diferenciar revisão de plausibilidade geral, aplicabilidade por modelo/série e validação didática/empírica.

## Inventário auditável da base

| Camada | Base disponível | Estado |
| --- | --- | --- |
| Cadastro funcional | 19 famílias/modelos, 1.466 nós, 670 caminhos de três níveis | Catalogado; efetividade por série a conferir |
| Tipos/códigos | 486 códigos de componente, 66 danos e 81 causas | Vocabulário catalogado |
| Expansão combinatória | 518.832 combinações candidatas / 17 modelos | **Hipóteses heurísticas, não FMEAs validadas** |
| Casos eletrônicos | 72 missões / 24 conjuntos de três causas; 54 entradas de índice | Didático/simulado |
| Casos de fluidos | 72 missões / 24 arquétipos | Didático/simulado |
| Planos preventivos | 7 arquivos para 8 modelos; 6.281 ocorrências / 1.018 atividades distintas | Extraído; camada detalhada restrita |
| Relações preventivas públicas | 25 regras genéricas, gerador estrito por sistema/grupo/subgrupo | Candidatas, nenhuma homologada |
| Diagnóstico diferencial | 12 roteiros / 36 hipóteses / 24 testes propostos | Candidatos sem ensaio realizado |
| Ontologia v1 | 10 falhas funcionais, 22 sintomas, 15 mecanismos, 16 métodos de evidência, 4 interpretações | Taxonomia inicial, pendente de revisão |
| Condição × ação × dano (v1.3.7) | 18 condições, 18 atividades, 9 danos candidatos, 9 bundles PM e 53 relações | Conceitual; nenhuma execução/condição real |
| Efeitos funcionais (v1.3.7) | 24 efeitos locais + 24 sistêmicos possíveis | Inferidos; 0 impactos observados ou severidades calculadas |
| Enriquecimento | 12 roteiros classificados por falha funcional, sintomas e técnicas | Anotação manual, não prova de causa |

**Observação:** as 159 tarefas de PM com subgrupo candidato foram obtidas em extração local anterior e **não** representam 159 associações homologadas. Contagens de vínculos estritos serão publicadas pelo relatório automático após cada alteração do gerador.

## Ciclo concluído — 21/10/2026: desdobramento de mecanismos (v1.3.22)

- [x] Proposta de **perda volumétrica interna acima da referência por arranjo**: distinguida de perdas internas normais, falha de vedação ME-15, desgaste ME-01/02 e regulação FF-08.
- [x] Não extrapolar vazão de dreno para vazamento interno total ou usar números de bombas Parker de palhetas em bomba CAT 395 sem prova OEM efetiva.
- [x] Três submodos **editoriais** de flanco do comando final CAT 777: abrasão (ME-01), adesão (ME-02) e fadiga de contato (ME-03), com morfologia candidata e provas para diferenciar.
- [x] Restrição de interpretação da ISO 10825-1: nomenclatura de aparência **não é determinação de causa raiz**.
- [x] Novo arquivo [mechanism-refinements.v1.json](../data/quality/mechanism-refinements.v1.json) com quatro propostas, JSON Schema, validador e **24 regressões sintéticas** adicionados ao CI/QA.
- [x] [Relatório técnico e critérios de futuro aceite](CICLO_2026-10-21_REFINAMENTO_MECANISMOS.md).
- [ ] **P0 próximo ciclo:** definir protocolo restrito de submissão, revisão e custódia de evidências reais para uma proposta por vez (OEM, inspeção, contraprova, parecer), sem publicação de laudos privados.
- [ ] **P0 dependência:** obter a arquitetura da bomba CAT 395, limites efetivos e identificação do conjunto de engrenagens CAT 777; sem eles não liberar novo ME/FC.
- [ ] Piloto D9 segue com sete requisitos documentais pendentes; dez regras preventivas PM × SAP continuam sem vínculo estrito.

**Estado:** 15 ME e 24 FC mantidos; quatro refinamentos propostos, três cadeias CAND fora do núcleo, zero mecanismo ou caso OEM aprovado.

## Ciclo concluído — 21/10/2026: auditoria das candidatas FF/ME (v1.3.21)

- [x] **3/3 candidatas** revisadas frente à função, falha funcional, mecanismo, efeito possível e 24 cadeias do núcleo, com **seis sobreposições conceituais** explicitadas.
- [x] Bomba hidráulica, vedação externa: FF-06 e ME-15 conceitualmente coerentes; limite entre vedação da bomba e conexão de linha permanece essencial.
- [x] Bomba hidráulica, perdas internas: FF-02; nova definição ontológica a avaliar para fuga volumétrica por folgas sem presumir vedação defeituosa ou desgaste.
- [x] Engrenagem de comando final: FF-02; separar ME-01, ME-02 e ME-03 em propostas coerentes, evitando um único mecanismo polimórfico.
- [x] Criado [registro taxonômico](../data/quality/proposal-taxonomy-audit.v1.json), JSON Schema, `npm run taxonomy:proposals:validate` e **21 testes sintéticos** no CI/QA.
- [x] Preservado núcleo de 24 cadeias, registros de efeitos, crosswalk, 12 playbooks e preview público.
- [x] [Relatório técnico](CICLO_2026-10-21_AUDITORIA_TAXONOMICA.md).
- [x] **Preparação v1.3.22:** conceito candidato de perda interna separado de ME-15, sem inserção na ontologia nem efetividade OEM comprovada.
- [x] **Preparação v1.3.22:** três submodos de flanco separados editorialmente por ME-01/02/03, aguardando evidência morfológica e revisão técnica.
- [ ] **Dependência externa:** configuração OEM efetiva CAT 395/CAT 777 e revisão independente; sem elas não há incorporação ao núcleo.
- [ ] Piloto CAT D9 mantém sete requisitos pendentes e dez regras PM × SAP permanecem sem vínculo.

**Estado:** três propostas mantidas fora do núcleo; uma lacuna de conceito ME, uma de desdobramento mecânico e zero revisões OEM ou dados de campo.

## Ciclo concluído — 20/10/2026: revisão de cinco lacunas causais (v1.3.20)

- [x] Reavaliadas **5/5 lacunas PB–FC**: 3 justificam propostas de investigação de modo de falha (vedação externa de bomba hidráulica, perdas internas e superfície de dentes); 2 representam hipótese de origem ou condição do fluido, não modo de falha.
- [x] Elaboradas **3 propostas editoriais de cadeias**, com função, falha funcional candidata, mecanismo, dano possível, hipóteses concorrentes, 2 testes seguros cada e três evidências requeridas por candidato.
- [x] Quatro fontes técnicas públicas indexadas com ressalvas de efetividade, especialmente Parker para bomba de palhetas e ISO 10825-1 pelo resumo público apenas.
- [x] Criado gate `npm run causal:gaps:validate`, JSON Schemas, **21 regressões sintéticas** e integração CI/QA.
- [x] Preservadas as 24 cadeias `FC-*`, as 18 correspondências candidatas do crosswalk, o contrato 1.0.0, o conteúdo público 1.0.0 e o preview legado 1.3.12.
- [x] [Relatório técnico e plano de promoção condicionada](CICLO_2026-10-20_TRIAGEM_LACUNAS_CAUSAIS.md).
- [x] **Concluído editorialmente na v1.3.21:** auditoria FF/ME, efeitos e sobreposições das três candidatas; revisão técnica independente permanece necessária.
- [ ] **P0 externo:** obter OMM/SIS e arranjo do sistema hidráulico CAT 395 e comando final CAT 777, sem publicar arquivos corporativos.
- [ ] **P0 externo D9:** sete documentos OEM ainda bloqueados; **P1:** dez regras de preventiva × SAP ainda sem vínculo estrito.

**Estado:** 24 cadeias vigentes, 3 propostas editoriais fora do núcleo, 2 não-falhas classificadas, 12 playbooks aprofundados, nenhuma evidência física observada e nenhuma homologação operacional.

## Ciclo concluído — 20/10/2026: finalizar 12 PBs e matriz PB–FC (v1.3.19)

- [x] **12/12 playbooks aprofundados por ID**, com 6 registros de v1.3.18 preservados e 6 criados na v1.3.19; estes não equivalem a procedimentos OEM ou FMEA aprovada.
- [x] Novos roteiros para bomba e mangueiras CAT 395, arrefecimento CAT 6030, comando final CAT 777, material rodante D9 e radiador CAT 980: **18 etapas e 24 requisitos documentais**.
- [x] Matriz [PB–FC](../data/quality/playbook-causal-crosswalk.v1.json): 18 hipóteses do lote, 18 vínculos candidatos, 5 lacunas de equivalência, 0 vínculos operacionais aceitos.
- [x] `npm run playbooks:remaining:validate`: **46 regressões** (18 prontidão, 16 alterações proibidas no PB, 12 alterações proibidas no crosswalk), integrado a CI/QA.
- [x] [Relatório técnico](CICLO_2026-10-20_PLAYBOOKS_COMPLETOS_PB_FC.md), documentação e schemas.
- [x] **Concluído na v1.3.20:** cinco lacunas triadas; três propostas editoriais fora do núcleo, duas classificações de não-falha sem promoção causal.
- [ ] **P0 dependência externa:** sete entradas documentais do D9 (prefixo/série, OMM, peças, torque, CTS, SAP e revisão) continuam bloqueadas.
- [ ] **P1:** padronizar workflow restrito de coleta de dados de campo e pareceres técnicos antes de produzir conhecimento operacional validado.

**Estado:** 12 PBs documentalmente aprofundados, 6 PATHs por cadeia; 24 cadeias FC, 48 alegações sistêmicas não confirmadas, 10 regras PM sem vínculo SAP mantidas, 0 homologação OEM, 0 causas raízes confirmadas.

## Ciclo concluído — 20/10/2026: seis deepdives por playbook didático (v1.3.18)

- [x] Auditados os 12 IDs de playbook e identificada lacuna de cobertura: os seis roteiros `PATH-*` prévios são **por cadeia causal**, não revisão formal de seis playbooks individuais.
- [x] Aprofundados por ID **6/12 playbooks**: CAT 980/cilindro; DR410i/avanço; DI650i/pneumática; CAT 16/pneus; CAT 777/combustível; CAT 6030/lubrificação.
- [x] Construídas **18 etapas técnicas propostas**, **24 critérios de prontidão**, campos de condição, sinal favorável a H1/H2/H3, inconclusão e segurança por etapa.
- [x] Adicionados [validador](../scripts/validate-playbook-deepdives.mjs), [Schema](../schemas/playbook-deepdives.schema.json) e **34 regressões sintéticas**, com CI e indicadores integrados.
- [x] Preservadas origens dos 12 playbooks, 24 cadeias, 6 roteiros PATH e contrato/conteúdo públicos sem promoção causal.
- [x] [Relatório técnico](CICLO_2026-10-20_PLAYBOOKS_DIFERENCIAIS.md).
- [x] **Concluído na v1.3.19:** seis PBs restantes receberam deepdive por ID e matriz de vínculos candidatos com os FCs.
- [ ] **P0 dependente de terceiros:** obter prefixo/OMM/CTS efetivos da CAT D9 e executar revisão de campo independente; sete requisitos seguem pendentes.
- [ ] **P1:** modelar fluxo de revisão de evidências reais com isolamento de repositório privado e governança de acesso, sem adicionar documentação interna ao GitHub público.

**Estado:** 6/12 playbooks aprofundados **por ID**, 6 roteiros PATH por cadeia, 0 ensaios, 0 raízes confirmadas, dez PMs bloqueadas.

## Ciclo concluído — 20/10/2026: segundo lote de roteiros diferenciais (v1.3.17)

**Objetivo:** enfrentar diagnósticos ambíguos por comparação de mecanismos e inspeções realmente discriminantes, sem confundir condição detectada com causa comprovada.

- [x] Adicionados **3 roteiros independentes**, preservando os três de v1.3.11, para **6 roteiros aprofundados** no total: radiador/ventilador, rolete/detritos versus falha interna, bomba/termostato.
- [x] Nove novas etapas (3 por roteiro), quatro requisitos de evidência por roteiro e uma hipótese de diagnóstico concorrente por cenário; todas as investigações como `not_performed`.
- [x] Criado `npm run pathways:expand:validate` com **9 regressões de prontidão e 12 de alterações indevidas**, no QA e CI.
- [x] Manutenção do contrato público 1.0.0, conteúdo 1.0.0, 24 cadeias públicas e 20 fontes exportadas; sem atualização de consumidores.
- [x] [Relatório técnico e fontes](CICLO_2026-10-20_ROTEIROS_DIFERENCIAIS_II.md).
- [x] **Novo controle v1.3.18:** seis playbooks receberam deepdive por ID, sem converter seis PATH causais em cobertura artificial de playbooks. Outros seis permanecem sem deepdive por ID.
- [ ] **P0 dependente de dados:** obter prefixo de série e OMM/CTS efetivos do piloto D9 e revisar com oficina; os sete requisitos continuam pendentes.
- [ ] **P1:** estruturar registro controlado de coleta e aprovação de evidência de campo com separação de artefatos restritos e fontes públicas.

**Estado:** 6 roteiros aprofundados de 12 playbooks (não homologados); 18 etapas propostas nos seis roteiros, zero procedimentos executados e zero causas confirmadas. Dez exceções preventivas SAP permanecem bloqueadas.

## Ciclo concluído — 20/10/2026: dez exceções PM e gate documental D9 (v1.3.16)

**Objetivo:** tornar cada ausência de vínculo PM × SAP e cada lacuna OEM verificável e reprovável por teste, sem buscar cobertura artificial.

- [x] Avaliadas **10/10 regras PM bloqueadas** com mecanismo físico, duas evidências documentais independentes, contraprova e recomendação editorial; **0 vínculos aceitos automaticamente**.
- [x] Classificados os bloqueios em **3 subgrupos fora de escopo**, **5 componentes não registrados** e **2 pares dano–causa não autorizados**.
- [x] Plano de entrada documental para o D9 com **7 requisitos OEM ainda não atendidos** e 8 cadeias rastreadas, sem identificação fictícia por série.
- [x] Criado `npm run pm:exceptions:validate` com **16 regressões sintéticas**, integrado ao CI, QA e auditor de qualidade.
- [x] [Relatório técnico e matriz de decisão](CICLO_2026-10-20_PM_EXCECOES_D9.md).
- [ ] **P0 próximo ciclo:** obter de fonte autorizada identificação de configuração do CAT D9, OMM e tabela CTS efetivas para uma máquina, com parecer de engenharia/oficina.
- [ ] **P1:** após efetividade OEM, preparar revisão formal de hierarquia SAP ou PN para as regras pertinentes (sem remapeamento automático).
- [x] **Avanço v1.3.17:** três dos nove playbooks pendentes ganharam roteiros diferenciais. Restam seis playbooks a aprofundar; ensaios reais e confirmação causal continuam pendentes.

**Estado:** PM 10 bloqueadas, D9 7 evidências faltantes, nenhuma validação por série, **24 cadeias inferidas, 48 alegações sistêmicas não confirmadas**, contrato público inalterado.

## Ciclo concluído — 20/10/2026: política de releases de conteúdo e golden snapshots (v1.3.15)

**Objetivo:** permitir evoluções do conhecimento sem confundir a versão interna do pacote, o contrato público e o conteúdo publicado.

- [x] Criadas **três linhas de versão independentes**: pacote `1.3.15`, contrato público `1.0.0` e conteúdo público `1.0.0` (baseline retrospectiva).
- [x] Congelado [snapshot integral 1.0.0](../data/governance/snapshots/public-knowledge.content-1.0.0.json), com SHA-256 original, **24 registros e 20 fontes**; preview legado `1.3.12` preservado byte a byte.
- [x] [Registro de releases](../data/governance/public-content-releases.v1.json) e [política de publicação](../data/governance/public-content-release-policy.v1.json), com classificação editorial patch/aditiva minor, veto a major sem migração e veto à promoção causal.
- [x] Gates `public:content:validate` e `public:content:test` (17 casos sintéticos), incorporados a `npm run qa`, GitHub Actions, Schema e relatórios de qualidade.
- [x] [Relatório técnico e procedimento de release](CICLO_2026-10-20_VERSIONAMENTO_CONTEUDO.md).
- [x] **Preparação documental na v1.3.16:** gate para sete requisitos do D9 sem homologação por falta de série/OMM. Revisão técnica efetiva continua pendente.
- [ ] **P1:** tratar as 10 regras preventivas SAP sem associação estrita e lacunas diagnósticas sem evidência.

**Estado:** nenhuma nova hipótese publicada, nenhum consumidor alterado, **0 causas confirmadas**, validação OEM e revisão independente ainda pendentes.

## Ciclo concluído — 20/10/2026: completar os três roteiros da auditoria sistêmica (v1.3.14)

- [x] Auditar duas hipóteses por roteiro de mangueira, comando final e fixação de sapata, com prova e contraprova física.
- [x] Alcançar **24 cadeias/48 alegações**, sem eventos reais, **0 desvios organizacionais comprovados** e **0 causas raízes homologadas**.
- [x] Validar origens 1.3.11 e 1.3.12 e preservar contrato público 1.0.0 e preview 1.3.12 com SHA-256 original.
- [x] [Relatório técnico do ciclo](CICLO_2026-10-20_AUDITORIA_TRES_ROTEIROS.md).
- [x] **Resolvido na v1.3.15:** política de releases de conteúdo, golden snapshot integral e bloqueios de compatibilidade.
- [ ] **P1:** validar efetividade OEM por prefixo/arranjo, executar revisão independente e resolver lacunas SAP.

**Condição de saída:** cobertura metodológica completa, sem aprovação operacional ou modificação em consumidores.

## Ciclo concluído — 20/10/2026: auditoria sistêmica e contrato público (v1.3.13)

**Objetivo:** impedir a promoção de modo de falha físico plausível a causa raiz organizacional sem prova e bloquear mudanças incompatíveis na exportação pública.

- [x] **21 cadeias revisadas editorialmente** com [42 possíveis causas sistêmicas](../data/governance/systemic-root-audit.v1.json), preservando seus textos originais.
- [x] Exigidos **dois elementos documentais independentes** e uma explicação concorrente **não organizacional** por hipótese.
- [x] Registrado `causalConclusion=nao_demonstrada`, `processRecordsExamined=false`, `attributedFaultToPeopleOrTeam=false`; nenhum desvio de processo ou causa raiz comprovado.
- [x] Os três roteiros v1.3.11 permanecem sem parecer especializado inventado.
- [x] Criado [contrato público SemVer 1.0.0](../data/governance/public-contract.v1.json), distinto da versão interna do banco.
- [x] Preservado preview público `1.3.12` e seu checksum, com 24 registros, 20 referências efetivamente exportadas e `approvedForOperationalUse=false`.
- [x] Criadas [oito regressões de compatibilidade](../data/quality/contract-compatibility-regressions.v1.json), validadores `scripts/validate-systemic-root-audit.mjs` e `scripts/validate-public-compatibility.mjs` e contratos JSON Schema próprios.
- [x] Integração ao GitHub Actions e às métricas de qualidade; [relatório completo](CICLO_2026-10-20_AUDITORIA_SISTEMICA_CONTRATO.md).
- [x] **Concluído na v1.3.14:** auditar as seis alegações sistêmicas dos três roteiros antigos (`FC-HOSE-001`, `FC-FD-001`, `FC-TRACK-005`) com evidência/contraprova equivalente.
- [ ] **P0:** especificar fluxo de lançamento de nova versão pública por mudança de conteúdo, distinta de mudança de contrato.
- [ ] **P1:** avançar documentação OEM por prefixo/série e CTS do piloto CAT D9, sem presumir números de peça, torque ou limites.
- [ ] **P1:** revisar as 10 regras preventivas SAP sem vínculo estrito, sem relaxamento cadastral impróprio.

**Estado:** 24 cadeias causais inferidas; 21 auditadas editorialmente nesta versão, três preservadas; **42 causas sistêmicas candidatas não confirmadas** e **0 causas raízes homologadas**. O pacote público e os consumidores permanecem estáveis.

## Ciclo concluído — 20/10/2026: cobertura causal total e preview público (v1.3.12)

**Objetivo:** expandir segregação de níveis causais às 21 cadeias ainda sem estrutura própria e entregar um formato público versionado com limites de validade explícitos.

- [x] **24/24 cadeias** documentadas com [quatro níveis causais](../data/ontology/causal-levels.v1.json); 21 classificações novas e três preservadas dos roteiros v1.3.11.
- [x] Cada registro explica por que as hipóteses **não** podem ser consideradas causas raízes confirmadas sem evidência de arranjo, histórico, medições e revisão humana.
- [x] [Validador de níveis causais](../scripts/validate-causal-levels.mjs) exige fontes, evidências, quatro dimensões completas, sem ocorrências reais ou atribuição automática de causa organizacional.
- [x] [Allowlist de exportação pública](../data/governance/public-export-policy.v1.json) com 18 campos de hipótese por cadeia, evitando dados corporativos, medições e mapeamento de peças por série.
- [x] [Gerador de preview público](../scripts/export-public-knowledge.mjs) com dados ordenados, referência a fontes públicas e [validação de SHA-256](../scripts/validate-public-knowledge.mjs) no CI.
- [x] Criados [contrato de níveis](../schemas/causal-levels.schema.json), [contrato de preview](../schemas/public-knowledge-preview.schema.json) e artefatos `reports/public-knowledge.v1.json` / `reports/public-manifest.v1.json`.
- [x] [Relatório completo](CICLO_2026-10-20_CAUSALIDADE_EXPORTACAO.md) e indicadores no relatório geral de qualidade.
- [x] **v1.3.13:** auditar editorialmente 42 candidatas sistêmicas das 21 cadeias, com contraprova e documentação necessária; parecer de especialista independente ainda pendente.
- [x] **v1.3.13:** estabelecer contrato público SemVer 1.0.0 e regressões de compatibilidade, sem alterar consumidores.
- [ ] **P1:** conferir prefixo e arranjo CAT D9 com documentação OEM e tabelas CTS de origem autorizada antes de promover qualquer vínculo.
- [ ] **P1:** perseguir as 10 lacunas preventivas SAP e os 12 complementos diagnósticos pendentes, sem construir combinações apenas para inflar cobertura.

**Estado:** 24 cadeias com quatro níveis, 48 investigações ainda propostas, **0** causas confirmadas e **0** liberações para uso operacional do pacote; 10 regras PM permanecem sem vínculo estrito.

## Ciclo concluído — 20/10/2026: três roteiros de diagnóstico e níveis causais (v1.3.11)

**Objetivo:** aprofundar três das doze lacunas P0, organizando testes que confrontam duas hipóteses concorrentes e separando níveis causais sem fabricar resultados.

- [x] [Roteiros completos](../data/quality/diagnostic-pathways.v1.json) para origem da mancha na mangueira (`FC-HOSE-001`), partículas no comando final (`FC-FD-001`) e fixação de sapata (`FC-TRACK-005`).
- [x] **9 investigações encadeadas**, com método, evidência que poderia favorecer hipóteses A/B, resultado inconclusivo, metadados mínimos e segurança.
- [x] Quatro níveis editoriais em cada caso: **fenômeno, mecanismo imediato, condição contribuinte e possível causa sistêmica**, todos mantidos como hipóteses.
- [x] Dois novos documentos Caterpillar indexados sobre interpretação de detritos do trem de força e triangulação de inspeção, fluido, dados e histórico.
- [x] [Nove regressões sintéticas](../data/quality/pathway-regressions.v1.json), [JSON Schema](../schemas/diagnostic-pathways.schema.json) e `npm run pathways:validate` integrados ao CI.
- [x] [Relatório técnico](CICLO_2026-10-20_ROTEIROS_CAUSALIDADE.md), documentação e métricas atualizados.
- [x] **v1.3.12:** estender segregação causal às 21 cadeias restantes, sem promover hipóteses a causas raízes.
- [ ] **P0:** obter documentação OEM por configuração para piloto CAT D9 e encaminhar revisão independente de especialistas.
- [x] **v1.3.12:** implementar contrato público por whitelist e manifesto SHA-256; consumidores não alterados.
- [ ] **P1:** ampliar avaliação diferencial de ventilação, termostato e circulação no arrefecimento.
- [ ] Manter as nove outras lacunas diagnósticas abertas e as três selecionadas **sem fechamento por falta de ensaio**; cobertura técnica aumentou, não houve confirmação causal.

**Controles:** três roteiros, nove passos, nove cenários de gate, zero ensaios/pareceres homologados, **24 cadeias preexistentes e 10 PMs bloqueadas**.

## Ciclo concluído — 20/10/2026: matriz cruzada de diagnóstico diferencial (v1.3.10)

**Entrega:** camada de ligação teste complementar ↔ hipótese alternativa, com avaliações qualitativas e lacunas declaradas, além de saneamento causal SAP e preparação documental de piloto D9.

- [x] [12 hipóteses × 2 complementos = 24 avaliações cruzadas](../data/quality/complementary-discrimination.v1.json) sobre os seis testes P0; **7 não discriminantes**, **12 parciais** e **5 potencialmente discriminantes se houver contexto/OMM aplicável**.
- [x] Doze lacunas diagnósticas continuam explícitas: nenhum teste isolado exclui alternativas nem comprova causa raiz sem evidência independente.
- [x] [Revisão causal SAP](../data/quality/circular-sap-causality.v1.json) para o par `TRAK / 0320 / 01.15 / C1.17`: dano Afrouxado e causa Folga ou afrouxamento são circularidade descritiva; distinguir auto-rotação de assentamento/relaxação por mecanismos/evidências diferentes, **sem editar códigos**.
- [x] [Piloto OEM Caterpillar D9](../data/quality/oem-pilot-readiness.v1.json) aberto como **bloqueado**, com sete requisitos de série, OMM, peças, torque-turn, CTS, SAP e revisão humana.
- [x] Duas fontes gerais Caterpillar/Nord-Lock indexadas com ressalvas de aplicabilidade.
- [x] [Validador cruzado](../scripts/validate-complementary-discrimination.mjs) e [JSON Schema](../schemas/complementary-discrimination.schema.json) integrados ao CI e à auditoria.
- [x] [Relatório de pesquisa e decisões](CICLO_2026-10-20_DISCRIMINACAO_COMPLEMENTAR.md).
- [x] **v1.3.11:** aprofundar três lacunas (mangueira, comando final, fixação) com roteiros de comparação, mantendo homologação OEM pendente.
- [ ] **P0:** obter efetividade OEM de uma configuração D9 para validar posição, método CTS e especificações de fixação. Não publicar literatura proprietária na íntegra.
- [ ] **P1:** melhorar separação entre **fenômeno detectado**, **mecanismo físico**, **causa contribuinte** e **causa raiz sistêmica** no cadastro SAP.
- [ ] **P1:** preparar contrato de exportação com natureza, limites e aplicabilidade para consumidores independentes sem os editar.

**Condição de saída:** 24 cruzamentos documentados, 12 hipóteses não descartadas, **zero** ocorrências de campo, **zero** causas confirmadas e **zero** pilotos OEM aprovados. Persistem os 10 bloqueios preventivos.

## Ciclo concluído — 20/10/2026: discriminabilidade dos seis testes P0 (v1.3.9)

**Objetivo:** distinguir métodos que identificam **uma condição** daqueles que podem discriminar uma **hipótese causal**, sem pressupor que o teste foi executado ou que uma peça foi condenada.

- [x] Criada [matriz técnica de seis testes P0](../data/quality/discriminative-tests.v1.json) com condição detectável, capacidade, limitações e fatores de confusão.
- [x] Avaliadas **12 hipóteses concorrentes**, todas mantidas abertas até evidência independente, e propostas **12 verificações complementares** com métodos cadastrados.
- [x] Classificadas quatro capacidades metodológicas **editoriais**: condição, tendência, indício compartilhado e desempenho funcional condicionado; nenhuma é métrica probabilística.
- [x] Preservados campos `sensitivity`, `specificity`, `likelihoodRatio` e `confidence` como `null`, sem taxas de acerto inventadas.
- [x] Criado [contrato JSON Schema](../schemas/discriminative-tests.schema.json), [validador](../scripts/validate-discriminative-tests.mjs) e [12 regressões sintéticas](../data/quality/discrimination-regressions.v1.json).
- [x] Adicionada etapa `npm run discrimination:validate` ao CI e novos indicadores ao relatório de qualidade.
- [x] Pesquisadas fontes Caterpillar, Nord-Lock e o resumo oficial da ISO 13379-1:2025, sem extrapolar parâmetros por modelo/série. [Relatório completo](CICLO_2026-10-20_DISCRIMINACAO_TESTES.md).
- [x] **Ciclo v1.3.10:** mapear 24 avaliações complementares por hipótese, preservando 12 lacunas sem confirmação.
- [x] **Ciclo v1.3.10:** identificar mecanismos distintos do par SAP circular e abrir piloto D9 com bloqueios OEM explícitos.
- [ ] Concluir apenas após documentação específica e revisão humana real.
- [ ] Solicitar revisão independente dos seis P0 a especialistas com documentação do arranjo efetivo. Sem parecer humano real, **0 estados promovidos**.

**Estado:** 24 cadeias, 48 investigações, 6 métodos P0 auditados quanto à discriminabilidade, **0** testes realizados, **0** causas homologadas, **10** lacunas PM pendentes. O objetivo foi a qualidade da inferência, não a expansão combinatória.

## Ciclo concluído — 20/10/2026: requisitos de evidência e revisão técnica (v1.3.8)

**Foco:** fortalecer a capacidade de **sustentar, enfraquecer ou declarar inconclusiva** cada hipótese, sem transformar teste planejado em medição nem correspondência cadastral em causa raiz.

- [x] Definidos [48 requisitos de investigação](../data/quality/evidence-requirements.v1.json) com origem na cadeia e seus testes, preservando três interpretações existentes.
- [x] Criado glossário de **67 campos de metadados**, selecionados por método; exigência de ponto, condição operacional, instrumento, amostra, método, baseline e referência aplicável quando relevantes.
- [x] Priorizados **6 testes P0** para revisão de qualidade; sem gravidade/ocorrência quantitativa.
- [x] Criado [registro de curadoria de 24 cadeias](../data/governance/technical-review-register.v1.json), todas pendentes: inferido → revisado por especialista → aplicabilidade OEM confirmada → evidência validada.
- [x] Exigidos **dois revisores diferentes e independentes do autor**, decisão explícita, fonte, efetividade por configuração e autorização de publicação antes da promoção apropriada.
- [x] Criados [8 testes de regressão sintética](../data/quality/evidence-gate-regressions.v1.json) com evidência incompleta, baseline ausente, revisores repetidos e elegibilidade formal simulada.
- [x] Adicionado [JSON Schema](../schemas/evidence-requirements.schema.json), validador `scripts/validate-evidence-governance.mjs` e etapa `npm run evidence:validate` no CI.
- [x] Catalogada fonte Caterpillar sobre qualidade e rotulagem de amostras; [relatório metodológico](CICLO_2026-10-20_EVIDENCIAS_GOVERNANCA.md) documenta limites de ISO e OEM.
- [ ] **P0 — v1.3.9:** executar revisão crítica documental dos seis casos prioritários, preenchendo apenas decisões respaldadas por fontes; revisor humano e OEM efetivo continuam necessários para homologação.
- [x] **P0 — v1.3.9:** classificar qualitativamente a capacidade discriminante dos seis testes e seus fatores de confusão; sensibilidade/especificidade seguem indisponíveis.
- [ ] **P1 — v1.3.9:** resolver circularidade `Afrouxado / Folga ou afrouxamento` e verificar efetividade OEM de uma configuração piloto.
- [ ] **P1:** evoluir o modelo para armazenamento restrito de observações reais autorizadas fora do repositório público.

**Indicadores:** 48/48 testes com contrato de evidência, 24/24 cadeias em fila editorial, **0** testes observados, **0** homologações OEM, **0** causas raízes reais confirmadas. Mantêm-se os 10 bloqueios PM.

## Ciclo concluído — 20/10/2026: motor, hidráulica, rodante e efeitos (v1.3.7)

**Objetivo:** avançar da lista de sintomas e danos candidatos para consequências funcionais estruturadas, sem equiparar condição detectável a diagnóstico ou impacto observado.

- [x] Estender [semântica](../data/ontology/condition-action-damage.v1.json) a filtro/óleo do motor, linhas e bombas hidráulicas e conjuntos roletes/roda-guia.
- [x] Cobertura acumulada: **18 condições-alvo, 18 ações planejadas, 9 danos candidatos, 9 regras agrupadas e 53 relações tipadas**.
- [x] Documentar **efeitos locais e efeitos no sistema para 24/24 cadeias causais** em [causal-effects.v1.json](../data/knowledge/causal-effects.v1.json).
- [x] Em cada efeito, registrar ressalva diagnóstica, condição de propagação e bibliografia já vinculada à cadeia.
- [x] Preservar `severityRank=null`, `probability=null`, `actualEventCount=0` e nenhuma atribuição OEM/SAP.
- [x] Ampliar de 7 para **14 cenários sintéticos** que bloqueiam confirmação de dano por troca de filtro, pressão baixa, abrasão de mangueira, óleo contaminado, rolete quente ou CTS planejado.
- [x] Integrar `npm run effects:validate` e `npm run semantics:validate` ao pipeline e ao relatório de qualidade.
- [x] Registrar quatro fontes públicas Caterpillar adicionais com ressalvas e publicar [relatório completo de pesquisa](CICLO_2026-10-20_EFEITOS_MOTOR_HIDRAULICA_RODANTE.md).
- [x] Modelar `evidenceRequirement` e metadados de teste para 48 investigações na v1.3.8.
- [x] Instituir registro e gates de revisão independente para 24 cadeias (v1.3.8); avaliações humanas e confirmação OEM ainda pendentes.
- [ ] **P1:** revisar as 10 lacunas SAP de componentes e grupos; não relaxar junção para inflar vínculos.
- [ ] **P1:** refinar causas circulares no catálogo sem criar código de causa ou probabilidade fictício.

**Resultado:** 24/24 cadeias receberam **possíveis efeitos locais e sistêmicos**, mas **0** deles foram observados, classificados em severidade ou homologados por modelo/série. Os 10 bloqueios preventivos anteriores permanecem.

## Ciclo concluído — 20/10/2026: separar condição, atividade e dano (v1.3.6)

**Problema atacado:** no modelo anterior, água no combustível e restrição do radiador apareciam como tentativas de preencher pares de dano/causa de componentes, mesmo quando a preventiva apenas detectava condição de fluido ou sujidade externa.

- [x] Criar [ontologia semântica v1.3.6](../data/ontology/condition-action-damage.v1.json) com **7 condições-alvo, 8 atividades, 4 danos candidatos e 22 relações**, distribuídos em quatro regras PM.
- [x] Diferenciar `condition` (o que se pretende observar), `action` (o que se propõe executar) e `damageHypothesis` (alteração física que requer prova independente).
- [x] Documentar divergência entre **água no combustível / drenagem / dano do dreno ou filtro** e entre **sujidade externa / limpeza / obstrução interna do radiador**.
- [x] Registrar a ISO 13379-1:2025 como referência metodológica **com acesso apenas ao resumo oficial**; reutilizar Caterpillar/SAP já catalogados.
- [x] Introduzir [JSON Schema](../schemas/condition-action-damage.schema.json), [validador semântico](../scripts/validate-condition-action-damage.mjs) e [7 cenários sintéticos de regressão](../data/quality/semantic-regression-fixtures.v1.json).
- [x] Integrar validação e contadores da nova camada ao CI e ao relatório geral de qualidade.
- [x] Publicar [relatório de pesquisa e decisões do ciclo](CICLO_2026-10-20_SEMANTICA_CONDICAO_ACAO_DANO.md).
- [x] Ampliar modelagem para filtro de óleo, desgaste do rodante, pressão hidráulica e condição do fluido (v1.3.7).
- [ ] Criar representação segregada de resultados observados autorizados, atos de manutenção executados e danos confirmados — **sem inserir dados reais confidenciais no repositório público**.
- [x] Registrar efeitos locais e sistêmicos candidatos em 24/24 cadeias (v1.3.7).
- [ ] Revisar tecnicamente a propagação desses efeitos e seus métodos de evidência por modelo OEM.
- [ ] Confrontar fontes OEM por modelo/série antes de homologar qualquer elo a um local funcional SAP.

**Status de qualidade:** nenhum `conditionDetected` se torna `componentDamage` por simples importação; `actionPerformed` não substitui confirmação de avaria. A classificação dos **10 bloqueios de PM** permanece intacta: nenhum novo subgrupo ou peça foi inventado.

**Próximo ciclo:** ampliar os três tipos a outros sistemas e introduzir `effectLocal/effectSystem`, sem misturar causa, dano, modo e consequência. Como alternativa de prioridade alta, criar estrutura de evidências revisáveis por revisor humano.

## Ciclo concluído — 20/10/2026: saneamento das 10 regras preventivas sem vínculo (v1.3.5)

**Avanço de qualidade, sem ampliação artificial de modos de falha.** A [auditoria de bloqueios](CICLO_2026-10-20_LACUNAS_PM.md) classificou as **25 regras** de prevenção em seis etapas de elegibilidade estrutural. As **10 regras sem candidato** agora têm parecer técnico, fonte, prioridade e ação de saneamento, registradas em [JSON de curadoria](../data/quality/pm-gap-review.v1.json).

- [x] **3 falhas de subgrupo:** `hydraulic-hose-leak`, `hydraulic-hose-abrasion`, `drill-compressor-filter`.
- [x] **5 falhas de componente:** `engine-oil-filter`, `fuel-filter-contamination`, `track-idler-wear`, `drill-rotary-bearing`, `drill-compressor-pressure`.
- [x] **2 falhas de compatibilidade dano/causa:** `cooling-radiator-blockage`, `fuel-tank-water`.
- [x] Novo `scripts/audit-pm-gaps.mjs` detecta o primeiro bloqueio, confronta quantidade com os vínculos produzidos e rejeita mudança de estado sem curadoria.
- [x] Referências Caterpillar e SAP consolidadas: **local funcional não equivale à peça**, **água no combustível não é defeito do dreno**, **sujeira externa de radiador não é necessariamente entupimento interno**.
- [x] Integração do relatório `reports/pm-gap-audit.generated.json` ao CI e ao indicador geral de qualidade.
- [x] **P0:** estabelecer ontologia própria `condition`, `preventiveAction` e `damageHypothesis` para água no combustível e radiador (v1.3.6).
- [ ] **P0:** expandir semântica ao restante dos planos sem atribuir dano por inspeção planejada.
- [ ] **P0:** investigar local e composição de linhas hidráulicas de implementos sem usar HSVV de circuitos estranhos.
- [ ] **P1:** conferir efetividade OEM de filtro de óleo, filtro/separador diesel, componentes de roda-guia e conjuntos DR410i/DI650i.
- [ ] Revisar uma a uma as 10 regras quando houver novo cadastro, sem aceitar equivalência textual como prova.

**Resultado operacional:** 10/10 bloqueios explicados, 15/25 regras permanecem com vínculos candidatos, **zero** vínculos homologados e **zero** resultados de inspeção real atribuídos.

**Próximo ciclo:** separar **condições detectadas por preventiva** de **modos de falha de componentes** e introduzir classes de evidência de contaminação/restrição, prevenindo circularidade no catálogo.

## Ciclo concluído — 20/10/2026: integridade causal e compatibilidade SAP (v1.3.4)

**Natureza do incremento: auditoria, não expansão combinatória.** As 24 cadeias foram confrontadas com o catálogo de componente/tipo de objeto, dano, causa e escopo de localização funcional; [relatório e decisões](CICLO_2026-10-20_AUDITORIA_CAUSAL_SAP.md).

- [x] **24/24 cadeias avaliadas** em `data/quality/causal-sap-assessment.v1.json`, com justificativa e risco de generalização.
- [x] Documentados **7 pares apenas candidatos, 4 sem local hidráulico, 2 com par dano/causa não permitido, 1 dependente de arquitetura, 1 com efeito secundário confundível, 1 com componente ambíguo, 6 sem componente-alvo e 2 com circularidade dano/causa**.
- [x] Identificado `RADI/1690/03.02/C2.09` incompatível com o mapa de permissões do código de trocador, sem substituir por um dano inventado.
- [x] Identificado `TRAK/0320/01.15/C1.17` como risco causal circular: afrouxamento não deve ser explicado somente por afrouxamento.
- [x] Implementado `scripts/audit-causal-sap.mjs` para verificar tuplas e contar caminhos compatíveis com **modelo, sistema, grupo, subgrupo, objeto, dano e causa**.
- [x] A checagem bloqueia alterações silenciosas que eliminem lacuna sem atualização do parecer e mantém **zero** homologações causais.
- [x] Novas fontes [SAP Help](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/e72f747389b340229f7fa343975bfa57/7d20ec545f356474e10000000a44538d.html) e IEC/ISO incorporadas como critérios metodológicos.
- [ ] Revisar possíveis falsos positivos dos 7 pares com engenharia/OEM por posição e série, sem promover a `validado` automaticamente.
- [ ] Verificar extensão dos locais de mangueiras hidráulicas em sistemas de implementos; vincular termostato, bomba e tensionador **somente se o cadastro/documentação suportar**.
- [ ] Corrigir causa circular em fixação com hipótese mecanística específica e evidência independente.

**Novo indicador de avanço:** percentual de cadeias com parecer explícito de compatibilidade cadastral (24/24) versus percentual de cadeias homologadas (0/24). **CI v1.3.4:** 18 pares taxonômicos permitidos; 2 pares ausentes; 15 cadeias com caminhos estruturais; 108 combinações estruturais (com repetição, não falhas); 10/25 regras PM sem candidato estrito. Esses números são sobre curadoria, **não frequência de falha**.

## Ciclo concluído — 20/10/2026: fixações de esteira e circulação do arrefecimento (v1.3.3)

**Entrega:** oito novas cadeias autorais, distinguindo autoafrouxamento rotacional, perda de pré-carga por assentamento, fratura por fadiga e desgaste das interfaces sapata–elo; no arrefecimento, termostato restringindo a passagem, termostato abrindo prematuramente, bomba com circulação insuficiente e fuga externa na bomba.

- [x] Pesquisar e indexar **sete** referências Caterpillar/Nord-Lock com ressalvas sobre modelo, PN, limiares e procedimento.
- [x] Expandir de **16 para 24 cadeias** e de 32 para **48 investigações**, mantendo 4 famílias e nenhuma causa confirmada.
- [x] Acrescentar `SY-21` (tempo de aquecimento prolongado) e `SY-22` (divergência entre medição e indicação): ontologia com **22 sintomas**.
- [x] Exigir no validador de cadeias a preservação de pelo menos 24 mecanismos e a natureza contextual das PMs ligadas a termostato/bomba.
- [x] Documentar distinção entre fixador solto por rotação, perda de pré-carga sem rotação e ruptura por fadiga.
- [x] Publicar [relatório do ciclo](CICLO_2026-10-20_FIXACOES_TERMOSTATO_BOMBA.md), literatura e contraprovas.
- [ ] Auditoria de cada cadeia contra danos/causas do catálogo SAP **por tipo de objeto** e posição funcional.
- [ ] Conferir efetividade OEM e critérios de inspeção, primeiro para CAT D9 e uma configuração de motor CAT.
- [ ] Revisar 24 cadeias por especialista mecânico/eletricista conforme disciplina; nenhuma cadeia homologada ainda.

**Total atual:** 24 cadeias causais, 4 famílias, 48 testes propostos, **zero** ocorrências empíricas confirmadas, **zero** validações por número de série e **zero** causas raiz homologadas.

**Próximo ciclo técnico:** deixar de apenas acrescentar registros e passar a auditar **consistência causal e especificidade**: distinguir a cadeia de danos/efeitos de suas causas e comparar cada modo candidato com os códigos do catálogo SAP. Prioridade à lista de incompatibilidades e falta de vínculo OEM, nunca a atribuição automática.

## Ciclo concluído — 20/10/2026: arrefecimento e material rodante (v1.3.2)

**Pesquisado e publicado:** 8 cadeias causais autorais adicionais, quatro de arrefecimento (obstrução externa, perda de fluido, ventilação insuficiente e restrição interna) e quatro de material rodante (travamento por detritos, perda de vedação do rolete, desgaste de roda-guia e tensão anormal da esteira).

- [x] Catalogar oito novas fontes Caterpillar, com limites de efetividade documentados.
- [x] Expandir o catálogo de 8 para **16 cadeias causais em quatro famílias**, com 32 investigações e interpretação `sustenta/enfraquece/inconclusivo`.
- [x] Ampliar o validador para exigir vínculo das regras PM ao **mesmo sistema funcional** da cadeia, além de IDs válidos e dados não observados.
- [x] Separar relação preventiva direta da tarefa **contextual de monitoramento**, especialmente tensionamento e desgaste do rodante.
- [x] Publicar [relatório técnico, fontes, limites e contraprovas](CICLO_2026-10-20_ARREFECIMENTO_RODANTE.md).
- [ ] Revisar com especialista de campo os resultados simulados, modos e condições de medida; nenhum vínculo OEM/série é confirmado.
- [ ] Inspecionar relatório automatizado de cobertura por família e restrições cadastrais.

**Total atual:** 16 cadeias, 4 famílias, 32 investigações, **zero ocorrências empíricas** e **zero diagnósticos homologados**.

**Próximas investigações técnicas:** fixações de esteiras e seus mecanismos (afrouxamento, perda de pré-carga, quebra), regulador de temperatura e circulação de líquido de arrefecimento com OMM aplicável; continuar a depurar relações de localização SAP.

## Ciclo fechado — 20/10/2026: mangueiras hidráulicas e comandos finais (v1.3.1)

**Entrega implementada:** [oito cadeias causais candidatas](../data/knowledge/causal-chains.v1.json), divididas em quatro relacionadas a mangueiras hidráulicas e quatro a desgaste, contaminação e fadiga de comandos finais. Cada uma tem função, falha funcional, mecanismos, dano possível, condições candidatas, sintomas, **duas hipóteses concorrentes**, **duas investigações com interpretações favorável/desfavorável/inconclusiva**, tarefa preventiva e fonte bibliográfica. Resultado: **8 cadeias, 16 investigações, 0 configurações OEM validadas, 0 causas raízes confirmadas**.

- [x] Pesquisar fabricante OEM e literatura de rolamentos: Caterpillar (mangueiras, bujões magnéticos, análise de fluidos); SKF (ISO 15243, desgaste e fadiga).
- [x] Atualizar `data/research/sources.v1.json` com fontes primárias/industriais e limites explícitos de generalização.
- [x] Criar `data/knowledge/causal-chains.v1.json` separado dos casos simulados e das tuplas heurísticas.
- [x] Implementar `scripts/validate-causal-chains.mjs`, barrando referências inválidas, testes sem contraprova e alegações de inspeção realizada.
- [x] Acrescentar ao relatório de qualidade contagens de cadeias e investigações sem apresentá-las como falhas empíricas.
- [ ] Revisar uma amostra de cada família com engenheiro mecânico e especialista de oficina.
- [ ] Verificar local, peça e efétividade por modelo/serial em OEM antes de promover códigos SAP e causas.

**Documentação rastreável:** [pesquisa e decisões do ciclo](CICLO_2026-10-20_MANGUEIRAS_COMANDOS.md).

**Fila objetiva para o próximo ciclo:** (1) arrefecimento: restrição de ar no radiador versus vazamento de fluido versus ventilação insuficiente; (2) rodante: rolete versus roda-guia versus tensão/fixação de esteira. Prioridade à pesquisa OEM e à validação de escopo por grupo.

## Etapa A — Integridade e semântica (v1.3, agora)

**Objetivo:** evitar conhecimento contaminado por ligações falsas. **Issues correlatas:** [#7](https://github.com/pedromaintenance/fmea-database-mining/issues/7), [#8](https://github.com/pedromaintenance/fmea-database-mining/issues/8).

- [x] Introduzir escopo de sistema e grupo no gerador de PM.
- [x] Separar função, falha funcional, sintoma, mecanismo e método de evidência com IDs controlados.
- [x] Classificar 12 roteiros por vocabulário, sem afirmar diagnóstico.
- [x] Criar validador de ontologia e relatório reproduzível de cobertura/lacunas.
- [x] Criar auditoria causal de 24 cadeias e classificar suas lacunas sem homologação automática.
- [ ] Inspecionar os relatórios completos gerados em CI e decidir, com dados efetivos, as regras sem correspondência.
- [ ] Auditar **25/25** padrões PM por subgrupo, composição, código de componente, dano, causa e contexto.
- [ ] Revisar casos em que objeto SAP admite peças improváveis no conjunto (ex.: componentes estruturais genéricos ou peças inespecíficas).
- [ ] Recuperar CAT 16 (.xls) com referência de célula confiável; descartar trechos ilegíveis.
- [ ] Separar fichas atuais e antigas (OLD) das perfuratrizes com declaração de vigência.
- [ ] Documentar posições independentes (motor 1/2, lado, roda, redutor) sem escolher posição automaticamente.

**Critério de encerramento:** validação automatizada verde; nenhuma correspondência atravessa sistema incompatível; 25 regras com decisão explícita `aceitar|revisar|rejeitar`; pendências localizadas e justificadas.

## Etapa B — Banco de mecanismos e funções (v1.4)

**Objetivo:** ir além dos seis códigos e explicar a física da perda de função.

- [x] Iniciar entidade independente de cadeia causal com função, modo, mecanismo, dano possível, sintomas, testes e fontes (8 registros gerais).
- [ ] Construir entidades definitivas de causa imediata, contribuinte, raiz sistêmica, efeito local e operacional; revisão efetiva por modelo.
- [ ] Ligar mecanismos a classes de componentes **somente por plausibilidade revisada** (desgaste abrasivo em engrenagem, perda de vedação em cilindro etc.).
- [ ] Criar matriz função → falha funcional → efeitos por sistema: motor, arrefecimento, combustível, hidráulico, transmissão, freios, rodante, direção, elétrico/controle, compressor, mastro e cabeça rotativa.
- [ ] Registrar condições necessárias de manifestação: temperatura, carga, rotação, esforço, tipo de fluido, ambiente e configuração.
- [ ] Distinguir **prevenção do mecanismo** de **detecção do dano já existente**, com tarefa PM/CBM correspondente.
- [ ] Revisar pelo menos **20 cadeias causais autorais** como primeiro lote controlado (24 hipóteses inseridas, **0 aprovadas**); ampliar somente após auditoria.

**Aceite:** cada cadeia aponta para função, falha, componente, mecanismo/dano, efeito e pelo menos um sintoma observável, com origem e limites. Sem probabilidades não fundamentadas.

## Etapa C — Evidência e diagnóstico diferencial (v1.5)

**Objetivo:** organizar testes que discriminam hipóteses, sem pressupor um resultado.

- [ ] Para cada método, definir preparação segura, parâmetro, unidade, condição de medição, localização, instrumento, qualidade amostral e baseline.
- [ ] Três estados: `sustenta`, `enfraquece`, `inconclusivo`; o quarto estado `não realizado` distingue planejamento de execução.
- [ ] Transformar **12 roteiros** em fichas editoriais: três hipóteses, pelo menos dois testes realmente discriminantes, limites OEM pendentes e fonte de cada afirmação.
- [ ] Incorporar critérios didáticos de Análise de Óleo: ferro/cobre/silício, água, diluição, viscosidade, alteração de baseline, contagem de partículas e inspeção de filtros, sem números inventados.
- [ ] Incorporar códigos eletrônicos com família de protocolo, ECM, MID/CID/FMI ou SPN/FMI, estado ativo/registrado, cronologia e interpretação.
- [ ] Permitir relações muitos-para-muitos: um sintoma pode sustentar múltiplas hipóteses e uma hipótese pode explicar vários sintomas.
- [ ] Introduzir `contradictingEvidence` e registrar por que uma inspeção não confirma determinada hipótese.

**Aceite:** pelo menos 12 fichas revisadas com resultados possíveis e ambiguidades; nenhuma evidência fictícia migrada como inspeção de campo real.

## Etapa D — Pesquisa técnica e literatura primária (contínua, v1.4+)

**Questão central:** o que sabemos por fonte primária e o que é só hipótese?

| Linha | Foco | Fontes prioritárias | Entregável |
| --- | --- | --- | --- |
| R01 | Método FMEA/FMECA, efeitos locais e globais | IEC 60812 | Esquema de FMEA funcional |
| R02 | Taxonomia de ativos, falhas e manutenção | ISO 14224 (adaptação metodológica, não conformidade presumida) | Modelo de evento e proveniência |
| R03 | Diagnóstico por condição, incerteza e tendência | ISO 17359, ISO 13374 | Esquema de medição, baseline e evidência |
| R04 | Óleo, água, partículas, falsas correlações | Caterpillar S·O·S, ASTM D5185, ISO 4406 | Matriz de sinais/contraprovas por compartimento |
| R05 | Motor, arrefecimento, transmissão, direção, hidráulica | Caterpillar SIS/OMM efetivo por série | Estudos por sistema 6030/395/777/980/D9/16 |
| R06 | Compressor, avanço, mastro e cabeça rotativa | Sandvik My Sandvik/OMM efetivo DR410i/DI650i | Matriz de configuração e inspeção |
| R07 | Códigos de falha e redes | OEM, SAE J1939 e documentação específica do ECM | Índice de códigos com aplicabilidade verificada |
| R08 | Prática de planejamento e detecção | PMs vigentes e planos de inspeção autorizados | Matriz tarefa → mecanismo → evidência alvo |

**Processo de pesquisa:** registrar `fonte, instituição, edição, data, URL, escopo, modelo, efetividade, proposição sustentada, limite, revisão`. Reescrever conceitos com autoria própria; não reproduzir tabela/manual integral. A pesquisa deve primeiro buscar fonte OEM específica e depois recorrer a norma ou artigo técnico para mecanismos gerais.

[Índice de fontes](../data/research/sources.v1.json) · [Política de pesquisa](PESQUISA_TECNICA.md)

## Etapa E — Revisão por família de equipamento (v1.6)

Organizar lotes pequenos com revisão e taxa de cobertura publicada:

1. **Escavadeiras CAT 395/6030:** hidráulica, motores/posição, redutores de giro, material rodante.
2. **Caminhão CAT 777:** comando final, diferencial, transmissão, freios e rodas.
3. **Trator CAT D9:** rodante, implementos, transmissão e arrefecimento.
4. **Carregadeiras CAT 980/966:** direção, articulação, hidráulica, transmissão, arrefecimento.
5. **Motoniveladoras CAT 16/150:** direção, articulação, círculo/lâmina, rodado.
6. **Perfuratrizes DR410i/DI650i:** cabeçote rotativo, corrente/avanço, compressor e controles específicos.

**Aceite de lote:** escopo OEM indicado, pelo menos duas hipóteses por sintoma, evidência discriminante, revisão de engenharia e campo, e pendências publicadas. Não inferir efetividade em todas as variantes de uma família.

## Etapa F — Governança, publicação e consumidores (v1.7+)

- [ ] Aplicar estados de revisão `importado → inferido → revisado → efetividade OEM confirmada → validado didaticamente`.
- [ ] Exigir revisão editorial e técnica em mudanças que promovam status.
- [ ] Criar `sourceId` em cada aresta causal e diferenciar citação de norma genérica de manual aplicável.
- [ ] Versionar JSON Schema, hash/manifest e changelog; releases imutáveis.
- [ ] Definir pacote público sanitizado para **qualquer consumidor externo** (sem gabaritos ou informações restritas, quando aplicável).
- [ ] Não alterar repositórios de jogos nem construir UI neste projeto. Consumidores decidem **quando** e **como** atualizar.

**Aceite:** API estática de dados documentada; sem mudanças obrigatórias em consumidores e sem dados restritos indevidamente publicados.

## Indicadores de qualidade (não confundir com confiabilidade real)

O script `scripts/audit-quality.mjs` calcula as primeiras métricas:

- Cobertura cadastral de caminhos completos por modelo.
- Regras PM com e sem associação estrita; fila de regras sem saída.
- Quantidade de locais distintos com candidatos PM.
- Roteiros com e sem caminhos candidatos.
- Cobertura de classificação dos roteiros pela ontologia.
- Alertas de publicação/autorização/efetividade.

**Metas qualitativas prioritárias:** zero links fora de sistema, zero referências órfãs, 100% de IDs estáveis, 100% dos registros marcados por natureza da evidência, zero causa promovida sem revisão. **Não calcular MTBF, frequência ou RPN como fato** com combinações geradas ou cenários simulados.

## Forma de trabalho deste chat

1. Escolher sistema/hipótese prioritária do roadmap.
2. Ler bases e pesquisar documentação técnica primária.
3. Extrair conceitos verificáveis e registrar lacunas, conflitos, condições de aplicação.
4. Criar/editar JSON normalizado no repositório **FMEA apenas**.
5. Validar automaticamente e conferir relatório de cobertura.
6. Registrar mudança, fontes, contagem e limitações no `CHANGELOG.md`; atualizar este roadmap.
7. Encerrar com entregas concretas e pendências de curadoria.

**Próxima ação técnica:** auditar os 25 padrões preventivos contra o modelo real de funções e componentes; começar por arrefecimento, mangueiras hidráulicas, rodante e comando final. Na sequência, criar primeiras cadeias funcionais pesquisadas, distinguindo dano de mecanismo e causa.

### Backlog operacional existente
[#4 — publicação e licenças](https://github.com/pedromaintenance/fmea-database-mining/issues/4) · [#7 — padrões PM](https://github.com/pedromaintenance/fmea-database-mining/issues/7) · [#8 — evidências](https://github.com/pedromaintenance/fmea-database-mining/issues/8) · [#9 — pesquisa técnica](https://github.com/pedromaintenance/fmea-database-mining/issues/9)

O código e a documentação do jogo são **fora deste roadmap**. As referências históricas permanecem rastreáveis no `CHANGELOG.md`.
