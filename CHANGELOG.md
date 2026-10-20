# Histórico de alterações

Este documento registra mudanças **de estrutura, fonte, dados e curadoria**, independentemente das versões do jogo.

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
