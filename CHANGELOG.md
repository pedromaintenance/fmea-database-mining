# Histórico de alterações

Este documento registra mudanças **de estrutura, fonte, dados e curadoria**, independentemente das versões do jogo.

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
