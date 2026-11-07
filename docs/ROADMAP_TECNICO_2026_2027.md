# Roadmap de pesquisa, expansão e consulta — 2026–2027

**Status:** proposta de priorização; datas e metas abaixo são **alvos internos sugeridos**, não compromissos de implementação nem benchmarks publicados.

## Norte: maior volume de conhecimento útil, não maior número de testes
**North Star:** percentagem de perguntas técnicas de referência respondidas com fonte, escopo, nível de evidência e limitação corretos, sem invenção de parâmetros ou causas.

### Horizonte F0 — Fundação de descoberta (0–4 semanas)
- [x] Criar missão e arquitetura como biblioteca.
- [x] Especificar `AGENTS.md`, skill de consulta e contrato de respostas.
- [x] Criar catálogo inicial curado e portal offline de navegação.
- [x] Registrar snapshot estrutural dos 500 arquivos existentes no commit anterior ao ciclo 1.4.1 (caminhos e formatos; ainda sem semântica).
- [x] Publicar projeção bilíngue de 67 termos da ontologia já existente e índice pesquisável das 87 referências (sem validação adicional).
- [x] Criar atlas **estrutural-semântico heurístico** de datasets JSON com schema, versão, origem, contagem, vínculos explícitos de fontes e duplicação binária (1.4.2); não afirmar revisão semântica humana.
- [x] Publicar primeiro modelo estrito de ficha fundamental e um verbete hidráulico com revisão pendente (1.4.2).
- [ ] Fazer inventário **completo** do acervo legado (fontes, normas, sistemas, JSONs, documentos, portais, lacunas); contabilizar duplicações e versionamentos conflitantes.
- [ ] Mapear direitos/licenças, datas de revisão e vínculos de citação das 95 fontes (das quais três receberam revisão direcionada neste ciclo).
- [ ] Consolidar o schema v2 já implementado e obter revisão técnica humana dos campos função → mecanismo → sintoma → evidência → prevenção.
- [ ] Executar uma **avaliação independente** de 50 perguntas inéditas com fontes externas e revisores humanos; a versão 1.4.4 possui apenas 50 perguntas curadas em conjunto com o buscador, como teste de regressão.

**Aceite proposto:** 100% dos itens do índice com path válido e classe de evidência; 0 publicações privadas por engano; respostas documentadas para lacunas.

**Atualização do ciclo 1.4.3:** iniciadas três fichas fundamentais distintas sobre cavitação, aeração e abrasão com fontes públicas verificadas quanto ao conteúdo selecionado; bibliografia alcançou 90 referências (sem revalidação global de links/licenças), índice curado 18 fichas. Revisão humana técnica ainda pendente.

**Atualização 1.4.4:** três novos fundamentos sobre filme lubrificante, contaminação sólida e fadiga de contato; bibliografia passa a 94 registros, índice curado a 21 e o portal temático a 6 fichas. Primeira regressão fechada de 50 consultas construída; **não** é avaliação cega de agente.

**Ciclo 1.4.5:** publicado um grafo de função→componente→mecanismo→evidência com 2 sistemas, 13 componentes e 15 conexões condicionais, além de 24 paráfrases novas frente à busca lexical congelada. Esta não é avaliação humana externa e não fornece certificação OEM; 95 referências no catálogo e 23 itens curados. A prioridade seguinte é revisar e ampliar a recuperação sem calibrar no próprio teste.

### Horizonte F1 — Fundamentos mecânicos e hidráulicos (1–3 meses)
**Foco 1:** tribologia, desgaste e lubrificação; viscosidade, contaminação, partículas, falha de rolamento, vedação, filtragem e interpretação SOS.  
**Foco 2:** hidráulica: bombas de deslocamento, regulação, válvulas, acumuladores, sucção, cavitação, cilindros, mangueiras, drenagem, contrapressão e resfriamento.  
**Foco 3:** transmissão: conversor, powershift, diferencial, comandos finais, juntas, engrenagens e análise de material particulado.  
**Foco 4:** energia e motores: diesel, admissão, turbo, combustão, arrefecimento, combustível e exaustão.

Por tópico, produzir ficha de função, teoria, mecanismos, sintomas, hipóteses, contraprovas, limites, referências, termos de busca EN/PT e relação com sistemas e componentes. Deixar valores OEM por série em aberto até comprovação autorizada.

### Horizonte F2 — Famílias de equipamentos e confiabilidade (3–6 meses)
- Fichas funcionais por família/modelo público: CAT 777/6030/395/730, motoniveladoras, carregadeiras, tratores, DR410i, DI650i, equipamentos de apoio.
- Distinguir variante, configuração, ano/região e série. Não generalizar entre variantes.
- Mapear modos de falha e interfaces: rolante/rodante, implementos, hidráulica, transmissão, freios/direção, estruturas, controles e telemetria.
- Repertório de análise RCA, RCM, FMEA/FMECA, manutenção centrada em condição, inspeção e estratégias de reposição.
- Fichas de indicadores: DF, utilização, MTBF, MTTR, backlog, cumprimento PM, retrabalho, custos normalizados — **sem publicar benchmark numérico sem metodologia**.

### Horizonte F3 — Benchmark industrial e interoperabilidade (6–9 meses)
- Levantar dados quantitativos **publicamente licenciados** de fabricantes, associações e estudos acadêmicos; registrar setor, população, definição, período, unidade, denominador e limitações.
- Comparar frota e tipo de regime apenas quando populações forem comparáveis; caso contrário, publicar **comparação conceitual**, não ranking numérico.
- Preparar JSONL de busca, índice de conceitos PT/EN, relações de vocabulário/ontologia e corpus de perguntas com respostas verificáveis.
- Avaliar embeddings/RAG e servidor MCP de **somente leitura**, com testes de proveniência e rejeição a prompt injection.
- Publicar portal estático com navegação por hierarquia equipamento → sistema → componente → função → mecanismo, e filtros por fonte, data, maturidade.

### Horizonte F4 — Curadoria e aplicações (9–12 meses)
- Revisão técnica independente por disciplina com registro das divergências.
- Medir acurácia de recuperação em perguntas reais **sem incluir dados privados**.
- Criar guias didáticos para Engenharia, PCM, inspeção e oficina.
- Exportadores compatíveis de fontes e consultas para consumidores, sem acoplamento.
- Avaliar um laboratório de contribuição da comunidade com triagem de fontes, licenças e segurança.

## Organização de pesquisa por prioridade
| Área | Prioridade editorial inicial | Razão |
| --- | --- | --- |
| Hidráulica e tribologia | Alta | Reúso transversal em diferentes frotas; base existente é forte |
| Diesel, lubrificação, arrefecimento | Alta | Sistemas críticos com fontes OEM públicas e muitos fenômenos comuns |
| Trem de força e freios | Alta | Alto impacto técnico e de segurança; exige aplicabilidade estrita |
| Rodante, pneus e estruturas | Alta | Grande variabilidade de modos de dano e técnicas de inspeção |
| Elétrica, eletrônica, CAN, sensores | Média | Depende fortemente de variantes, software e documentação OEM |
| Perfuratrizes e equipamentos de apoio | Média | Úteis para ampliar cobertura além de caminhões e escavadeiras |
| Métricas e benchmark quantitativo | Alta na governança; dados conforme disponibilidade | Comparações erradas podem produzir decisões equivocadas |

Prioridades de **pesquisa**, não gravidade/criticidade real do ativo.

## Metas e indicadores internos de qualidade (propostas)
- **Cobertura inventariada:** itens do acervo conhecidos e identificados / itens encontrados na auditoria.
- **Proveniência:** fichas publicadas com pelo menos uma referência verificável / fichas publicadas.
- **Rastreabilidade causal:** fichas diagnósticas com hipótese concorrente e limite / fichas diagnósticas.
- **Reprodutibilidade:** perguntas com retorno ao mesmo ID/arquivo/citação na mesma versão / perguntas avaliadas.
- **Recusa correta:** perguntas sem base respondidas com `NOT_FOUND_IN_CATALOG` / perguntas deliberadamente sem base.
- **Integridade benchmark:** registros quantitativos com população, período, métrica, denominador e fonte / registros quantitativos publicados.
- **Segurança:** 0 testes autorizados automaticamente e 0 dados restritos publicados.

Indicadores são metodologias propostas, não números atuais apurados.

## Backlog para os próximos ciclos
1. **Inventário automático e semântico de conhecimento** a partir do snapshot de 500 caminhos: detectar arquivos órfãos e mapeie fontes→fichas→sistemas.
2. **Dicionário técnico PT/EN** para termos concorrentes de manutenção, incluindo tradução de sintomas sem atribuir causa.
3. **Curadoria humana das fichas fundamentais já padronizadas**: enriquecer mecanismos, função e contraprovas com novos estudos públicos e revisão por disciplina.
4. **Portais temáticos**: Hidráulica, Diesel e Lubrificação, Transmissão, Rodante, Elétrica, Benchmark.
5. **Avaliação de retrieval**: 50 perguntas golden, incluindo negativas, ambíguas, variantes e segurança.
6. **MCP read-only** somente depois de índice estável e testes de privacidade/segurança.

A expansão vale mais quando aumenta conhecimento **consultável e confrontável**, não quando apenas gera mais artefatos.
