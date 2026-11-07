# Contrato de consulta para IA — FMEA Database Mining

**Estado: convenção documental v1 (não é API nem servidor MCP em execução).**

## Entradas
`query` (pergunta), `equipment_family?`, `system?`, `component?`, `source_priority?`, `language?`, `intent` (explicar, comparar, investigar, treinar, planejar). O usuário não deve inserir números de série, resultados de análise de óleo ou outros dados privados no repositório público.

## Entradas auxiliares para descoberta (1.4.1)
- `data/catalog/technical-glossary.v1.json`: 67 termos PT/EN, preservando IDs e critérios da ontologia v1.3.3. Não inferir que cada termo passou por revisão independente.
- `data/catalog/source-discovery.v1.json`: 87 referências bibliográficas da base existente; consultar a URL e sua licença antes de utilizar detalhes.
- `data/catalog/repository-inventory-snapshot.v1.json`: snapshot de 500 arquivos por caminho/formato, anterior a 1.4.1. Não confundir caminho com conceito técnico, presença com validade ou inventário com prova OEM.

## Atlas de datasets e fichas técnicas (v1.4.2)
- `npm run knowledge:atlas:build` gera `reports/semantic-atlas.generated.json` e `reports/mapa-semantico.generated.html`. O Pages publica o JSON em `/semantic-atlas.v1.json` e o painel em `/mapa-semantico.html`. O gerador é local, não depende de APIs externas.
- Campos `profile` e `topicHint` são agrupamentos de descoberta, não conhecimento técnico certificado; `topicMethod` sempre sinaliza inferência por nome do arquivo. Os campos de IDs bibliográficos representam **vínculos documentais declarados**, não leitura da fonte original.
- `schemas/technical-knowledge-record.schema.json` define a ficha fundamental. O primeiro registro `data/knowledge/fundamentals/hydraulic-inlet-restriction.v1.json` é conceitual, derivado de `HC-DIFF-01`, com hipóteses não confirmadas, revisão pendente e nenhum teste real.
- Respostas de agentes devem citar `path` + ID de registro/hipótese + ID da fonte, **abrindo o arquivo canônico** e declarando expressamente aplicabilidade e lacunas. Não usar hashes, contagens ou perfis como prova física.

## Fundamentos técnicos v2 (1.4.3)
- Fichas em `data/knowledge/fundamentals/*.v2.json`: cavitação, aeração e desgaste abrasivo. Cada síntese tem fonte, papel limitado, hipóteses concorrentes e perguntas para confirmação futura.
- Contrato estrito `schemas/technical-knowledge-record.v2.schema.json` coexistindo com v1. Agentes devem distinguir `sourceNotes[].supports` de `doesNotSupport` e citar `originAnchors` sem presumir diagnóstico.
- `npm run knowledge:fundamentals:build` gera `reports/fundamentals.generated.json` e HTML. O Pages publica `/fundamentos-tecnicos.v1.json` e `/fundamentos-hidraulica-tribologia.html` de forma read-only.
- Perguntas negativas devem produzir recusa de causalidade não sustentada: ruído não comprova cavitação; espuma não comprova bomba danificada; ISO 4406 não identifica causa raiz ou componente.

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
