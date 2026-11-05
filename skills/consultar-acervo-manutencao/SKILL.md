---
name: consultar-acervo-manutencao
description: Consulta o acervo público FMEA Database Mining para responder dúvidas sobre equipamentos móveis, falhas, diagnóstico diferencial, manutenção, fontes OEM, confiabilidade, indicadores e limites de aplicabilidade. Use quando precisar recuperar informação técnica rastreável antes de elaborar hipóteses ou recomendações.
---

# Consultar acervo de engenharia de manutenção

Esta skill é **somente de leitura conceitual**. Não acessa SAP, não opera máquina, não executa procedimentos e não autentica evidências OEM por série.

## Descoberta e leitura
1. Consulte `../../data/catalog/knowledge-index.v1.json` para localizar a ficha por sistema, palavras-chave, tipo de recurso e maturidade. O índice inicial é **curado, não exaustivo**.
2. Se o assunto não estiver indexado, pesquise o repositório (`data/research/sources.v1.json`, `data/quality/`, `docs/`) e declare que a cobertura ainda não está catalogada.
3. Leia o **arquivo canônico**, não deduza resultados do resumo do índice. Identifique `schema`, `version`, `nature`, `scope`, `policy`, `sourceIds` e os campos de validação aplicáveis.
4. Diferencie fonte normativa, fabricante, catálogo comercial, hipótese conceitual, exercício sintético e evidência real. Verifique o documento original, sua data, versão e direitos de uso antes de reproduzir.
5. Cruze pelo menos duas explicações físicas quando um único sintoma admite múltiplas causas; não promova nenhuma a conclusão sem teste apropriado.
6. Para qualquer teste ou liberação, pare no limite documental: peça número de série e procedimento OEM efetivo em ambiente autorizado, e encaminhe a revisão humana. Não prescreva ensaio sob pressão ou energias sem controle.

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
