# Cenários legados do jogo

A versão inicial inclui `data/cases/legacy-game-scenarios.v0.json`, que preserva **29 cenários didáticos** do projeto `pedromaintenance/porcaria-voce-quebra-eu-conserto`.

**Não são registros de ocorrências reais e não devem ser promovidos automaticamente a casos FMEA validados.**

## Como usar

- `operator`: sintoma/relato simulado do operador.
- `path`: sistema, grupo e subgrupo conforme códigos usados pela versão de origem do jogo.
- `component`, `damage`, `cause`: gabarito da simulação preexistente.
- `verification`: **orientação do que investigar**, não um resultado laboratorial, ensaio ou teste executado.
- `lesson`: objetivo pedagógico, não recomendação operacional de OEM.
- `hours`, `estimatedCost`, `priority`: hipóteses de balanceamento do jogo, não estatística empírica.

## Migração futura

1. Mapear `path` e `modelId` para IDs do catálogo SAP normalizado.
2. Decompor `operator` em sintoma, contexto, intensidade, evolução temporal e função afetada.
3. Adicionar **pelo menos duas hipóteses concorrentes** e critérios de falsificação.
4. Transformar `verification` em testes que gerem resultados (positivos, negativos, inconclusivos).
5. Revisar mecanismo de falha e cadeia causal.
6. Aprovar caso curado e exportar para o adaptador do jogo.

**Aviso:** o campo `verification` não pode ser importado como `evidence.result`; essa conversão inventaria evidência.
