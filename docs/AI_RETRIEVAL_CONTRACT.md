# Contrato de consulta para IA — FMEA Database Mining

**Estado: convenção documental v1 (não é API nem servidor MCP em execução).**

## Entradas
`query` (pergunta), `equipment_family?`, `system?`, `component?`, `source_priority?`, `language?`, `intent` (explicar, comparar, investigar, treinar, planejar). O usuário não deve inserir números de série, resultados de análise de óleo ou outros dados privados no repositório público.

## Entradas auxiliares para descoberta (1.4.1)
- `data/catalog/technical-glossary.v1.json`: 67 termos PT/EN, preservando IDs e critérios da ontologia v1.3.3. Não inferir que cada termo passou por revisão independente.
- `data/catalog/source-discovery.v1.json`: 87 referências bibliográficas da base existente; consultar a URL e sua licença antes de utilizar detalhes.
- `data/catalog/repository-inventory-snapshot.v1.json`: snapshot de 500 arquivos por caminho/formato, anterior a 1.4.1. Não confundir caminho com conceito técnico, presença com validade ou inventário com prova OEM.

## Pipeline de recuperação
1. **Descoberta:** `data/catalog/knowledge-index.v1.json` inclui uma seleção inicial de artefatos existentes. Ausência no índice não significa ausência no repositório.
2. **Recuperação canônica:** abrir `path`; preferir informações estruturadas em `data/quality` e documentos de `docs`. Não transformar o campo de descrição do índice em prova.
3. **Fonte externa:** identificar `sourceIds` e conferir `data/research/sources.v1.json` para URL, data e limitação; a referência bibliográfica sozinha não valida a afirmação.
4. **Filtro de aplicabilidade:** confirmar `nature`, configuração, área, modelo, série, edição, revisões e condições de ensaio. Se não verificados, a resposta é genérica/conceitual.
5. **Síntese:** distinguir fato de OEM, mecanismo físico, hipótese, exercício sintético e orientação de pesquisa. Informar contrapontos e lacunas.
6. **Resposta:** incluir citação local `repo:path#id`, referência de fonte, nível de evidência e próximos testes **documentais**. Não inferir intervenção/OS.

## Estados semânticos mínimos
- `PUBLIC_REFERENCE`: fonte legalmente acessível ou resumo autoral com bibliografia.
- `CONCEPTUAL`: hipótese/modelo técnico plausível, não comprovado por série.
- `PUBLIC_PRODUCT_VARIANT`: variante comercial; especificação pública ≠ limite OEM de Test & Adjust.
- `SYNTHETIC`: exercício fictício, sem resultados de campo.
- `PENDING_REVIEW`: informação ainda submetida a curadoria.
- `PRIVATE_EVIDENCE_REQUIRED`: informação que exigiria evidência privada por ativo e avaliação autorizada.
- `NOT_FOUND_IN_CATALOG`: nenhuma ficha correspondente no índice consultado; pesquisar o restante do repositório.

## Formato de resposta sugerido
```json
{
  "question": "Sintoma técnico apresentado sem dados identificadores",
  "retrievalStatus": "FOUND_CONCEPTUAL",
  "sources": [
    {
      "catalogId": "LIB-HYD-CIRCUITS",
      "repositoryPath": "data/quality/hydraulic-circuit-differential.v1.json",
      "evidenceClass": "CONCEPTUAL",
      "sourceIds": ["CAT-HYD-TECHNICAL-ANALYSIS"]
    }
  ],
  "supportedFindings": ["Explicação técnica sustentada pelo arquivo recuperado"],
  "competingHypotheses": ["Hipótese não confirmada"],
  "unknowns": ["OEM efetivo por série não verificado"],
  "safetyBoundary": "Não constitui procedimento, liberação ou diagnóstico de campo",
  "recommendedNextStep": "Consultar documentação OEM aplicável em sistema autorizado"
}
```

**Exemplo ilustrativo:** o texto de `supportedFindings` é um placeholder e deve ser substituído pela leitura do registro canônico. Não usar um motor de IA para afirmar `engineeringApproved=true`, nem para elevar `SYNTHETIC` a evidência factual.

## Integrações futuras
- `AGENTS.md`: instruções para agentes que editam/consultam repositório.
- `skills/consultar-acervo-manutencao/SKILL.md`: workflow de busca reutilizável em clientes que suportem Agent Skills.
- `llms.txt`: índice textual de descoberta, sem presumir suporte universal.
- **MCP futuro:** resources para fichas e bibliografia; tools somente de busca, filtragem e leitura; prompts para consultas estruturadas. Não há servidor MCP neste ciclo.
- **RAG futuro:** chunking por função/assunto com metadados de versão e source ID, avaliação de recuperação e conjunto de perguntas de referência; embeddings são auxiliares e não substituem verificação de fonte.
