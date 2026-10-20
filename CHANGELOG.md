# Histórico de alterações

Este documento registra mudanças **de estrutura, fonte, dados e curadoria**, independentemente das versões do jogo.

## [1.3.4] — 2026-10-20 — Auditoria de compatibilidade causal e taxonômica SAP
- Auditadas 24 cadeias com pareceres individuais sobre componente, dano, causa e caminho funcional.
- 8 categorias de impedimento/risco: ausência de local hidráulico, par inexistente, configuração não comprovada, efeito secundário, identidade ambígua, componente ausente, circularidade e candidatos não homologados.
- Detectadas duas associações `RADI/1690/03.02/C2.09` não permitidas no catálogo e dois pares de afrouxamento com risco de circularidade `01.15/C1.17`.
- Confirmado que `HSVV` se repete em diversos sistemas; caminhos sem o grupo de hidráulica de implementos permanecem sem ligação.
- Criados `data/quality/causal-sap-assessment.v1.json` e `scripts/audit-causal-sap.mjs`; relatório derivado publicado em artefato CI, sem homologação automática.
- Consultadas e indexadas fontes primárias IEC, ISO e SAP sobre FMEA, taxonomia, códigos de dano/causa.
- Auditoria incluída no QA, relatório de qualidade, roadmap e changelog; nenhuma alteração em consumidores.

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
