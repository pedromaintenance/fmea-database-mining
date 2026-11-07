---
name: consultar-acervo-manutencao
description: Consulta o acervo público FMEA Database Mining para responder dúvidas sobre equipamentos móveis, falhas, diagnóstico diferencial, manutenção, fontes OEM, confiabilidade, indicadores e limites de aplicabilidade. Use quando precisar recuperar informação técnica rastreável antes de elaborar hipóteses ou recomendações.
---

# Consultar acervo de engenharia de manutenção

Esta skill é **somente de leitura conceitual**. Não acessa SAP, não opera máquina, não executa procedimentos e não autentica evidências OEM por série.

## Descoberta e leitura
1. Consulte `../../data/catalog/knowledge-index.v1.json` para localizar a ficha por sistema, palavras-chave, tipo de recurso e maturidade. O índice inicial é **curado, não exaustivo**.
2. Se a pergunta mencionar termos de falha ou sinônimos EN/PT, consulte `../../data/catalog/technical-glossary.v1.json` e retorne o ID da ontologia original, **sem transformar termos em causas confirmadas**. Para busca bibliográfica, use `../../data/catalog/source-discovery.v1.json` e confirme a URL na fonte original.
3. Para saber em qual arquivo está um material ainda não indexado, procure `../../data/catalog/repository-inventory-snapshot.v1.json`; é apenas um snapshot do commit base, não lista atualizada automaticamente.
4. Para datasets que ainda não entraram no índice curado, consulte `../../reports/semantic-atlas.generated.json` (após executar `npm run knowledge:atlas:build`) ou o JSON publicado em `/semantic-atlas.v1.json`. Classificação de tema pelo nome do arquivo é heurística; `sourceIds` apenas apontam para referências, não demonstram validade.
5. Se o assunto não estiver indexado, pesquise o repositório (`data/research/sources.v1.json`, `data/quality/`, `docs/`) e declare que a cobertura ainda não está catalogada.
6. Para pesquisa por função de um componente, consultar `../../data/knowledge/functional-architecture.v1.json` (ou o mapa público JSON). Identificar sistema e nó, extrair função, possíveis efeitos, mecanismos e evidências e abrir arquivos canônicos das referências. Todos os vínculos de topologia são condicionais; equipamento/série real exigem consulta OEM. Falta de `knowledgeRecordIds` deve ser relatada como lacuna de acervo, não ausência de falha.
7. Para busca local de seis verbetes, `npm run knowledge:fundamentals:query -- --query "questão"` retorna correspondências e fontes; `ABSTAIN_UNSUPPORTED_OPERATIONAL` proíbe assumir limite/diagnóstico e `MULTIPLE_CONCEPTS` exige comparar hipóteses. Este baseline lexical de corpus fechado não avalia desempenho de LLM nem abrange todo o repositório.
8. Para fundamentos de cavitação, aeração e abrasão, consulte `../../data/knowledge/fundamentals/*.v2.json` (schema v2) e `../../data/research/sources.v1.json`. Retorne `sourceNotes[].supports` com a ressalva `doesNotSupport`; nunca deduza aplicabilidade CAT/Sandvik de manual Parker ou conclusões de SKF para toda máquina.
9. Leia o **arquivo canônico**, não deduza resultados do resumo do índice. Identifique `schema`, `version`, `nature`, `scope`, `policy`, `sourceIds` e os campos de validação aplicáveis.
10. Diferencie fonte normativa, fabricante, catálogo comercial, hipótese conceitual, exercício sintético e evidência real. Verifique o documento original, sua data, versão e direitos de uso antes de reproduzir.
11. Cruze pelo menos duas explicações físicas quando um único sintoma admite múltiplas causas; não promova nenhuma a conclusão sem teste apropriado.
12. Para qualquer teste ou liberação, pare no limite documental: peça número de série e procedimento OEM efetivo em ambiente autorizado, e encaminhe a revisão humana. Não prescreva ensaio sob pressão ou energias sem controle.

## Resposta de saída recomendada
- **Função e configuração relevante:** o que o sistema faz e o que está/não está identificado.
- **Evidência recuperada:** `ID`, arquivo, versão e ligação para a fonte original.
- **Interpretação:** mecanismo e efeitos, sem confundir sintoma com causa.
- **Hipóteses concorrentes:** e que observação distinguiria cada uma.
- **Limites:** dados faltantes, aplicabilidade OEM e incerteza.
- **Próxima ação segura:** pesquisa documental, inspeção autorizada ou encaminhamento a especialista.

Usar `NOT_FOUND_IN_CATALOG` quando faltar base. Não tratar benchmark didático como benchmark de confiabilidade de frota. Respeitar `../../AGENTS.md` para governança.

## Referências para ler sob demanda
- `../../docs/AI_RETRIEVAL_CONTRACT.md`
- `../../docs/KNOWLEDGE_PLATFORM_ARCHITECTURE.md`
- `../../data/research/sources.v1.json`
- `../../docs/ROADMAP_TECNICO_2026_2027.md`
- `../../data/catalog/technical-glossary.v1.json`
- `../../data/catalog/source-discovery.v1.json`
- `../../schemas/technical-knowledge-record.schema.json`
- `../../schemas/technical-knowledge-record.v2.schema.json`
- `../../data/quality/fundamentals-retrieval-golden.v1.json`
- `../../data/knowledge/functional-architecture.v1.json`
