# Histórico de alterações

Este documento registra mudanças **de estrutura, fonte, dados e curadoria**, independentemente das versões do jogo.

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
