---
name: consultar-acervo-manutencao
description: Consulta o acervo público FMEA Database Mining para responder dúvidas sobre equipamentos móveis, falhas, diagnóstico diferencial, manutenção, fontes OEM, confiabilidade, indicadores e limites de aplicabilidade. Use quando precisar recuperar informação técnica rastreável antes de elaborar hipóteses ou recomendações.
---

# Consultar acervo de engenharia de manutenção

Esta skill é **somente de leitura conceitual**. Não acessa SAP, não opera máquina, não executa procedimentos e não autentica evidências OEM por série.

## Motores diesel — óleo e arrefecimento (1.4.13)
Consulte `../../data/knowledge/engine-oil-coolant-differential.v1.json` e `../../docs/contaminacao-oleo-arrefecimento.html` para sete hipóteses não confirmadas e seis contextos. Separar óleo no refrigerante, coolant no óleo e baixa de refrigerante/espuma sem mistura provada. Concorrentes: trocador, junta, fundido, fluido de fonte, analítica, resíduo e vazamento externo. Solicitar desenho por configuração, amostras representativas, histórico e análise específica; **nunca** classificar trocador ou junta como falha confirmada por aparência ou por um marcador isolado. Não prescrever pressão de ensaio ou operar máquina para reproduzir evento sem procedimento OEM e avaliação de risco. Dossiê posterior ao congelamento 1.4.11, excluído do piloto cego.

## Filtragem hidráulica: pressão diferencial, bypass e indicação (1.4.12)
Consulte `../../data/knowledge/hydraulic-filter-differential.v1.json` e `../../docs/filtragem-diferencial.html`. Seis hipóteses não confirmadas: elemento carregado, óleo frio/viscoso, vazão/transiente/incompatibilidade, sinalização, bypass sem confirmação e partículas ISO/amostragem. **Aviso não prova bypass aberto; ISO 4406 não prova falha de bomba.** Diferenciar sensores, temperatura, vazão, arquitetura, histórico e literatura OEM efetiva antes de definir qualquer escopo de teste. Não transferir pressão de catálogo ou escolher filtro equivalente sem confirmação. Esta pesquisa é POSTERIOR ao conjunto congelado; não usá-la para contaminar o piloto cego 1.4.11.

## Congelamento do piloto e avaliações offline (1.4.11)
Para distribuir o piloto, utilizar `../../docs/pacotes-piloto.html` e `../../data/quality/pilot-frozen-baseline.v1.json`. A linha de base de busca lexical v2 e as dez fichas está congelada pelos blobs do Git; nunca alterá-la para elevar acerto em perguntas coletadas. Entregar somente o pacote `collector` na coleta, `reviewer` aos julgadores, `adjudicator` no desempate e `evaluator` depois de congelar o gabarito. Verificar manifestos SHA-256, confinar arquivos humanos a `private/` e consultar `../../docs/CICLO_2026-11-08_PACOTES_PILOTO_CONGELADO.md`. Estado externo: nenhum julgamento real.

## Controle de execução do piloto — 1.4.10
Use `../../docs/controle-piloto.html` e `../../data/quality/field-pilot-readiness.v1.json` para conferir as 11 etapas humanas. `npm run knowledge:pilot:gates -- --input private/controle.json --out private/resultado.json` avalia somente flags autodeclaradas e hashes de versão, sem afirmar autorização empresarial. `INCONSISTENT_SEQUENCE` bloqueia progresso; `SELF_ATTESTED` indica declarações, não verificação independente. Não inventar aprovação, trabalhador participante, perguntas externas ou métricas. Consulte o procedimento `../../docs/CICLO_2026-11-08_CONTROLE_EXECUCAO_PILOTO.md` antes de usar dados reais.

## Aplicação do primeiro piloto (versão 1.4.9)
Para rodar avaliação com trabalhadores, consultar `../../docs/PILOTO_QUESTIONARIO_OFICINA.md`. Não simular perguntas ou respostas humanas. Usar formulário público vazio; dados reais somente em `private/`. Não executar busca antes da adjudicação de R1/R2. O reconciliador exige **pasta privada de saída inédita** e bloqueia protocolos não cegos. A avaliação CLI só aceita entrada/saída privadas quando há dados humanos. As 11 condições de prontidão incluem autorização e anonimização manuais, não verificáveis apenas por código.

## Protocolo de perguntas externas — dupla revisão cega
Se solicitar qualidade externa de recuperação, consultar `../../docs/AVALIACAO_DUPLA_REVISAO.md`: coleta sem rótulo, parecer R1, parecer R2, desempate cego, reconciliação local em `private/`, gabarito congelado, depois avaliação. Não criar perguntas ou pareceres fictícios, não afirmar que R1/R2 são pessoas distintas sem evidência; o status público tem **0 avaliações humanas** até coleta efetiva. A classe de risco operacional exige revisão prioritária por engenheiro e OEM.

## Avaliação de recuperação sem confundir fonte e aprovação
Se a pergunta for sobre confiabilidade do buscador, consulte `../../docs/AVALIACAO_INDEPENDENTE_PROTOCOLO.md` e `../../reports/external-review-evaluation.generated.json`. Sem importação de julgamentos humanos externos, a avaliação retorna `NO_EXTERNAL_SAMPLE` e taxas `null`. A comparação interna 18/24 não prova recuperação em consultas inéditas. Não propor liberação de máquina com base em saída de busca e não publicar perguntas com dados de frota ou informações corporativas.

## Busca técnica v2 — apenas descoberta
Use `npm run knowledge:search:v2 -- --query "pergunta"` para localizar fichas candidatas em dez registros, com `FOUND_CONCEPTUAL`, `MULTIPLE_CONCEPTS`, `NOT_FOUND_IN_CATALOG` e `ABSTAIN_UNSUPPORTED_OPERATIONAL`. Abra o JSON canônico e confirme cada fonte e limitação antes de responder. A busca é lexical, NÃO LLM, embeddings, diagnóstico nem permissão de intervenção. A avaliação de 24 questões conhecidas é apenas de desenvolvimento; exigir procedimento OEM, controle de energia e aprovação humana para qualquer decisão de campo.

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
