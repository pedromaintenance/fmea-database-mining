# FMEA Database Mining — Banco de Falhas de Equipamentos Móveis

Banco de conhecimento **versionado** para investigar modos de falha, sintomas, evidências e causas em equipamentos móveis de mineração. Um consumidor possível é o jogo **[P.O.R.C.A.R.I.A. — Você Quebra, Eu Conserto](https://github.com/pedromaintenance/porcaria-voce-quebra-eu-conserto)**, mas o banco é independente: **este repositório não altera os consumidores**.

> **Status:** versão do catálogo **1.3.16** (catálogo de hipóteses e taxonomias), **não** FMEAs formalmente aprovadas, banco de ocorrências reais nem fonte de procedimentos de execução.

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

## Comece por aqui

Leia [Modelo de Dados](docs/MODELO_DE_DADOS.md), [Curadoria e Qualidade](docs/CURADORIA.md), [Roadmap](docs/ROADMAP.md) e [Histórico](CHANGELOG.md).

Consumidores externos podem **ler releases estáveis**; desenvolvimento de jogos, adaptação de interface, salvamento e decisões de importação ficam fora deste repositório.
