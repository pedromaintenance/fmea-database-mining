# FMEA Database Mining — Ciclo v1.3.21: auditoria taxonômica e duplicidade

**Data:** 21/10/2026. **Objeto:** três propostas de mecanismo físico originadas na triagem PB–FC v1.3.20. **Natureza:** auditoria editorial de coerência baseada na ontologia e nas fontes técnicas gerais já indexadas; **não** é aprovação OEM, FMEA executada, ensaio de campo nem classificação de causa raiz.

## 1. Método

Cada proposta foi confrontada com (1) função exigida, (2) falha funcional da ontologia `FF-*`, (3) mecanismo de dano `ME-*`, (4) hipótese física versus condição/efeito/sintoma, (5) efeitos locais e sistêmicos possíveis, (6) duplicidades funcionais com as 24 cadeias `FC-*`, (7) origem PB/H1–H3 e (8) requisitos documentais antes de criar qualquer `FC-*`.

Fonte de dados: [propostas v1.3.20](../data/quality/proposed-causal-chains.v1.json) e [ontologia existente](../data/ontology/concepts.v1.json). Resultado serializado em [auditoria taxonômica v1.3.21](../data/quality/proposal-taxonomy-audit.v1.json). Os textos mecanísticos de origem foram preservados, mas nenhum foi reclassificado como evidência observada.

## 2. Decisões por componente

| Proposta | Falha funcional candidata | Enquadramento mecanístico | Decisão |
|---|---|---|---|
| `CAND-HYD-PUMP-SEAL-001` | **FF-06** — Falha de contenção | **ME-15**, vedação, sem inferir elastômero | Reter até confirmar fronteira de vedação/bomba e efetividade OEM |
| `CAND-HYD-PUMP-INTERNAL-001` | **FF-02** — Desempenho abaixo do requerido | ME-15 **não é automaticamente fuga por folgas**; ME-01/ME-02 só se houver desgaste comprovado | Reter até definição ontológica de perda volumétrica interna e isolamento hidráulico |
| `CAND-FD-GEAR-TOOTH-001` | **FF-02** — Desempenho abaixo do requerido | **ME-01** abrasão, **ME-02** adesão, **ME-03** fadiga de contato — mecanismos distintos | Reter até separação por mecanismo/morfologia e configuração OEM |

### Vedação externa de bomba hidráulica — CAT 395

A fronteira funcional é o próprio conjunto da bomba. `FC-HOSE-003` cobre a união mangueira–terminal, não o retentor/junta da bomba; `FC-COOL-008` cobre a vedação de bomba d'água, com fluido e arranjo distintos. Ambos compartilham uma função de contenção, mas **não são a mesma falha de componente**.

Sem desenho por série, localização da primeira fuga e exclusão da linha adjacente, óleo superficial não autoriza classificar uma vedação como danificada. *Efeito local possível*: perda externa de óleo; *efeito sistêmico possível*: diminuição do fluido disponível e comprometimento hidráulico em progressão. Nenhum efeito foi observado.

### Perdas internas da bomba hidráulica — CAT 395

A falha funcional candidata é **FF-02**, quando a bomba deixa de entregar vazão sob requisitos efetivos. Uma falha de regulação **FF-08** pertence ao ramo concorrente compensador/comando. A ontologia atual distingue ME-15 (falha de vedação) de ME-01/02 (desgaste), mas não modela de modo inequívoco perdas volumétricas por caminhos de folga. **Não atribuir ME-15 só porque há fluxo interno.**

A sobreposição com `FC-COOL-007` é só de função de bombeamento — o objeto é bomba de arrefecimento, não bomba hidráulica de implemento. A decisão é propor refinamento conceitual e exigir ensaios OEM de vazão, pressão, temperatura e comando, com contraprovas de válvulas e sucção, antes de considerar incorporação.

### Flancos de dentes — comando final CAT 777

A proposta original agrupa abrasão, adesão e fadiga de contato. Essas famílias não devem ser tratadas como uma única etiologia: possuem mecanismos, evidências morfológicas e ações preventivas potencialmente diferentes. A próxima revisão deve decompor o catálogo editorial **sem inventar** falhas físicas observadas.

Três sobreposições foram identificadas: `FC-FD-001` (abrasão por partículas, peça não localizada), `FC-FD-003` (filme lubrificante insuficiente com dano potencial), `FC-FD-004` (fadiga de contato, mas em **rolamento**, não em engrenagem). Isso orienta a futura separação, não uma aprovação.

O laudo SOS com aumento de metais ou alteração de aditivos, inclusive transição de Shell para FDAO, não comprova dano de engrenamento sem observação física do flanco. Um ruído também pode vir de rolamento. Efeitos de torque, vibração e partículas permanecem **possíveis, não medidos**.

## 3. Tabela de bloqueio para promoção

| Condição | Status neste ciclo |
|---|---|
| Função FF e fronteira de componente justificadas | Documentadas editorialmente |
| ME de perdas internas inequívoco | Pendente |
| Separação de danos de engrenagem por mecanismo | Pendente |
| Aplicabilidade por arranjo OEM CAT 395/CAT 777 | Pendente |
| Métodos de medição e limites OEM por série | Pendente |
| Evidência independente de componente físico | Pendente |
| Revisão técnica de engenharia/oficina independente | Pendente |
| Aprovação de novo identificador `FC-*` | **Não aprovada** |
| Vínculo SAP, peça ou consequência real | **Não aprovado** |

Os campos de risco são nulos (`severity=null`, `probability=null`). Os efeitos e danos não são observados, e nenhuma revisão foi atribuída a uma pessoa inexistente.

## 4. Regressões e compatibilidade

O validador `npm run taxonomy:proposals:validate` cruza referências por IDs existentes, copia literalmente o critério FF da ontologia e confronta cada sobreposição com o núcleo. Foram programados **3 controles-base e 18 mutações sintéticas**, incluindo tentativa de inventar série, objeto SAP, parecer, gravidade, resultado de campo, suprimir contraprova, reclassificar FF/ME, apagar a lacuna de ontologia e juntar os três mecanismos de engrenagem.

O comando integra o `npm run qa` e o GitHub Actions. **Não** altera os registros `FC-*`, os efeitos associados, o crosswalk PB–FC ou as 48 alegações sistêmicas previamente auditadas. A exportação pública continua na versão legada 1.3.12, com contrato 1.0.0 e conteúdo 1.0.0, sem alterações byte a byte nem em consumidores.

## 5. Próximo ciclo

Modelar, **apenas como proposta editorial**, a diferença entre fuga volumétrica interna, falha de vedação e desgaste; decompor danos de flanco de engrenagens em abrasão, adesão e fadiga de contato. Depois, submeter os candidatos à revisão independente e confirmar por SIS/OMM a efetividade de componentes, sem publicar documentos OEM licenciados ou dados corporativos reais.

A inclusão efetiva no núcleo exige uma política explícita de mudança de catálogo e de conteúdo público; nenhuma nova cadeia está homologada por esta auditoria.
