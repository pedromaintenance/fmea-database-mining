# ROADMAP VIVO — FMEA Database Mining

**Atualizado:** 20/10/2026 · **Ciclo:** catálogo técnico v1.3.8 · **Responsável editorial:** projeto FMEA Database Mining

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
- [ ] **P0 — v1.3.9:** criar matriz de força discriminante de cada teste e falsos positivos/negativos por condição.
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
