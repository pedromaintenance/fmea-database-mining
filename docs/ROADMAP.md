# ROADMAP — FMEA Database Mining → P.O.R.C.A.R.I.A.

**Edição:** 20/10/2026. **Estado:** v1.2.1 em desenvolvimento. Prioridades e durações abaixo são **estimativas de planejamento**, não prazos contratados. O repositório é público; arquivos e dados operacionais corporativos permanecem fora dele até autorização.

## Objetivo final

Construir um **grafo de conhecimento diagnóstico**, consultável por modelo, **sistema → grupo → subgrupo** de localização, componente, dano e causa, que conecta **sintomas**, condições operacionais, **hipóteses concorrentes**, **testes discriminantes** e seus **resultados de evidência**. Integrar ao *Você Quebra, Eu Conserto* para treinar decisão investigativa com segurança e sem revelar gabarito.

### Princípios sem exceção

1. **Modo de falha ≠ dano ≠ causa raiz:** guardar a função e falha funcional, mecanismo, dano local, efeito e causa imediata/contribuinte/raiz em campos distintos.
2. **Evidência planejada ≠ evidência observada:** a preventiva não prova defeito; DTC ou laudo isolado não identificam automaticamente a peça.
3. **Taxonomia primeiro, configuração depois:** códigos SAP só ganham vínculo quando sistema **e** subgrupo **e** peça **e** dano/causa são compatíveis. Posição e prefixo/série nunca são inferidos sem dados.
4. **Hipóteses alternativas genuínas:** cada caso contém no mínimo 3 hipóteses coerentes e 2 testes que possam discriminar; incluir resultado favorável, desfavorável e inconclusivo.
5. **Nenhum dado bruto corporativo publicado:** somente conteúdo genérico autoral e referências bibliográficas públicas; compartilhar conteúdo derivado exige revisão de direitos.
6. **Não é FMEA homologada ou manual OEM:** a validação da base didática não autoriza manutenção real.

## Baseline confirmado

| Camada | Conteúdo inicial | Qualidade |
| --- | --- | --- |
| Catálogo SAP | 19 modelos/famílias; 1.466 locais; 670 caminhos de três níveis | Códigos catalogados; aplicabilidade por série não auditada |
| Taxonomias | 486 componentes, 66 danos, 81 causas | Combinações heurísticas, sem validação individual |
| Expansão algorítmica | 518.832 pares/triplas candidatas de falha em 17 modelos | **Não são 518.832 FMEAs** |
| Códigos de Falha | 72 cenários, 24 conjuntos de três causas, 54 índices de código | Simulados; efetividade ECM/OEM pendente |
| Análise de Óleo | 72 cenários, 24 arquétipos de três variações | Simulados; sem laudos quantitativos reais |
| PM | 7 planilhas / 8 modelos: 6.281 ocorrências, 1.018 tarefas; 891 regras estruturadas em pacote local | 159 tarefas com local candidato por filtro estrito; zero homologadas |
| Diagnóstico (v1.2.1) | 12 roteiros, 36 hipóteses, 24 testes planejados | Rascunhos técnicos; gabarito e vínculo ainda não confirmados |

## Fase P0 — Corrigir semântica e lacunas de cadastro (prioridade crítica)

**Meta indicativa:** primeiras 1–2 semanas de trabalho focado.

- [x] Tornar reprodutíveis base/catalogação e extração de PM.
- [x] Criar filtro inicial de **sistema-raiz** para eliminar falsos vínculos entre circuitos com mesmo código de subgrupo.
- [ ] Verificar 25 regras de PM: componentes realmente integrantes do grupo, danos/causas tecnicamente coerentes, cobertura por modelo.
- [ ] Fazer auditoria do gerador: contagem de vínculos antes/depois do filtro, falsos positivos e regras sem saída.
- [ ] Corrigir incompatibilidades detectadas: p.ex. FECH presente na DI650i mas não no caminho da DR410i; não transferir nomenclatura de uma família a outra.
- [ ] Confirmar com SIS/OMM o arranjo e posição dos locais; pesquisar componente estrutural alternativo quando não há subgrupo.
- [ ] Recuperar o XLS legado da CAT 16 com rastreabilidade célula/aba.
- [ ] Distinguir PMs atuais e fichas OLD DR410i/DI650i.

**Aceite:** nenhuma ligação aceita apenas por coincidência textual; relatório de taxa de cobertura por equipamento e fila explícita de lacunas; nenhum vínculo homologado sem fonte de configuração.

## Fase P1 — Ontologia de sintomas, testes e observações (v1.2.1, prioridade crítica)

**Meta indicativa:** semanas 1–3 (pode correr em paralelo a P0).

- [x] 12 roteiros autorais para 8 modelos, com 3 hipóteses e 2 testes por roteiro.
- [x] Campo de `supports`, `weakens` e `inconclusive` por teste; resultados **possíveis**, jamais medidos.
- [ ] Padronizar fenômenos: vazamento, temperatura, pressão, ruído, vibração, perda de torque, lentidão, deriva, falha intermitente, restrição, desgaste visível.
- [ ] Criar vocabulário de `measurementType`, unidade, técnica, condição operacional, baseline, limite OEM, qualidade amostral e incerteza.
- [ ] Integrar formalmente detecções já presentes em Códigos de Falha / Análise de Óleo aos roteiros **sem forçar convergência falsa**.
- [ ] Criar tripla de resultado `evidence {positive | negative | inconclusive}` como dado de missão com proveniência `simulated`, nunca `measured`.
- [ ] Montar índices bidirecionais: sintoma→hipóteses, hipótese→testes, teste→resultados, falha→medidas preventivas.
- [ ] Validar que o mesmo sintoma pode ter vários locais e causas candidatos.

**Aceite:** todas as referências resolvidas; cada teste distingue pelo menos 2 hipóteses; nenhuma evidência fictícia cadastrada como achado real.

## Fase P2 — Pesquisa e FMEA funcional por sistema (v1.3)

**Meta indicativa:** semanas 2–6; revisão técnica obrigatória.

- [ ] Usar [plano de pesquisa técnica](PESQUISA_TECNICA.md): IEC 60812, ISO 14224 (adaptação metodológica), ISO 17359, SAE JA1011, ISO 4406, ASTM D5185, Caterpillar S·O·S/SIS2GO e Sandvik.
- [ ] Para cada sistema, registrar função, falha funcional, modo/mecanismo, componente, efeito local e global, sintomas, condições de manifestação, meios de detecção e limitações.
- [ ] Priorizar por utilidade didática e risco: **(1)** arrefecimento/lubrificação, **(2)** mangueiras/bombas/cilindros hidráulicos, **(3)** material rodante/freios/comandos finais, **(4)** sensores/chicotes/CAN, **(5)** perfuratrizes: avanço/mastro/rotativa/compressor.
- [ ] Criar, após revisão, lotes pequenos: 10 casos por sistema prioritário, com hipóteses alternativas e referência explícita de fonte.
- [ ] Distinguir `literatura_geral`, `manual_por_modelo`, `aplicacao_por_serie` e `caso_simulado_revisado`.
- [ ] Revisar amostragem (horas do óleo, baseline) e limites da ICP (ASTM D5185); evitar limiares universais inventados.
- [ ] Fazer revisão cruzada técnica por dois perfis (engenharia e campo) antes de classificar caso como `validado_didatico`.

**Aceite:** 60 casos didáticos revisados ao final do primeiro ciclo de P2 (meta, não cobertura atual); proveniência, escopo e interpretação dos testes publicados.

## Fase P3 — Motor de caso e integração com o jogo (v1.4)

**Meta indicativa:** semanas 4–8, depois de P1/P2 mínima.

- [ ] Criar adaptador **versionado e testado** para `porcaria-voce-quebra-eu-conserto/game-data.json`.
- [ ] Empacotar casos por modelo em JSON leve, com `manifest` e checksum; carregar sob demanda no browser.
- [ ] Separar `playerView` de `answerKey`; somente a primeira contém relato/sintomas e pistas liberadas.
- [ ] Reproduzir seis etapas existentes no PORCARIA: sistema, grupo, subgrupo, componente, dano, causa.
- [ ] Em cada etapa, exigir seleção de inspeção ou teste coerente; resultados podem apoiar ou refutar hipóteses.
- [ ] Garantir que testemunho do operador, DTC e SOS possam apontar caminhos diferentes e inconclusivos.
- [ ] Criar testes de regressão: IDs, referencial SAP, progressão, salvamento antigo, ausência de spoiler, mobile/offline/PWA.
- [ ] Medir tempo de carregamento e memória em dispositivo Android real; nenhum lote de 500 mil combinações na memória do menu.

**Aceite:** 30 casos curados de várias frotas jogáveis em branch de testes, nenhum vazamento de gabarito antes da conclusão, zero regressão dos 29 casos legados.

## Fase P4 — Curadoria contínua e evidências empíricas (v1.5–v2)

**Meta indicativa:** contínua, após estabilização.

- [ ] Pipeline voluntário de submissão: referência pública, problema didático, relação proposta, revisão, aprovação, publicação.
- [ ] Dados reais somente com autorização, desidentificação adequada, segregação de acesso e proveniência de medição.
- [ ] Medir cobertura: % de caminhos SAP com modos curados; % de casos com 3 hipóteses; % com 2+ testes; % de vínculos órfãos; taxa de conflitos entre fontes.
- [ ] Reabrir relações quando manual OEM, configuração ou código de falha mudar.
- [ ] Criar trilhas por competência e feedback sobre erros de diagnóstico; não confundir estatísticas do jogo com falhas reais.
- [ ] Associar bibliografia a cada família e gerar fichas de lições aprendidas com versão e revisor.

## Fila objetiva de pesquisa

| Fila | Questão | Fontes a consultar | Entrega verificável |
| --- | --- | --- | --- |
| R01 | Como diferenciar modo, mecanismo, dano, causa e falha funcional? | IEC 60812, SAE JA1011, ISO 14224 | Ontologia + exemplos contrastantes |
| R02 | Que teste realmente diferencia sensor, chicote e condição física? | SIS2GO/CAT ET, SAE J1939, manuais OEM | Casos de elétrica com 3 causas |
| R03 | Quais indicadores de óleo são realmente discriminantes? | Caterpillar S·O·S, ASTM D5185, ISO 4406 | Matriz análise de óleo e falsos positivos |
| R04 | Como posicionar o componente nos CAT 6030, 777, 395, D9, 980 e 16? | Cat SIS/OMM por prefixo, planos existentes | Correspondência de grupos e posições |
| R05 | Como varia a arquitetura de avanço, compressor e rotativa DR410i/DI650i? | OMM e catálogos Sandvik efetivos | Nomes e testes válidos para cada modelo |
| R06 | Como estruturar dados para detecção e prognóstico futuros? | ISO 17359/ISO 13374-1 | Schema de medições e evidências |

## Governança semanal sugerida

Um lote pequeno por semana: **pesquisar → extrair conceitos → vincular candidatos → auditar por amostragem → testar → publicar release**. Priorizar **precisão causal e cobertura confiável**, não número bruto de combinações. Registrar decisões no `CHANGELOG.md` e achados em issues. A FMEA é base para a práxis de diagnóstico; a mera quantidade de registros não demonstra qualidade.

## Ponto atual de bloqueio

Nenhum dos 159 vínculos candidatos de PM foi homologado; os novos roteiros não contêm resultados de inspeção real. O próximo passo operacional é **finalizar o filtro de sistema-raiz, auditar a cobertura por modelo e revisar manualmente os primeiros casos** antes de levá-los ao jogo.
