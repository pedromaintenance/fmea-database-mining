# Ciclo 1.4.1 — Descoberta do acervo técnico: glossário, fontes e inventário

**05/11/2026 · Prioridade: consulta técnica por humanos e agentes**

## Problema
A biblioteca pública 1.4.0 apresentava 14 entradas selecionadas, enquanto o repositório já possuía um grande acervo técnico, uma ontologia bilíngue e um registro bibliográfico que não eram pesquisáveis no portal central. Aumentar novas FMEAs sem recuperar esses recursos manteria disperso o conhecimento existente.

## Entregas
1. **Glossário controlado PT/EN:** `data/catalog/technical-glossary.v1.json` contém 67 termos replicados **sem reescrita** da ontologia `data/ontology/concepts.v1.json` versão 1.3.3: 10 falhas funcionais, 22 sintomas, 15 famílias de mecanismos, 16 métodos de evidência e 4 tipos de resultado. São expressões da ontologia autoral com revisão por família pendente; traduções e critérios não equivalem a diagnósticos validados por OEM.
2. **Descoberta bibliográfica:** `data/catalog/source-discovery.v1.json` indexa as 87 referências já presentes em `data/research/sources.v1.json` versão 1.3.28, preservando título, organização, URL, área, função, limitação e última data de revisão quando presente. **Nenhuma URL, licença ou atualização científica foi reverificada neste ciclo.**
3. **Inventário estrutural:** `data/catalog/repository-inventory-snapshot.v1.json` documenta os 500 arquivos do commit `73dfc97` anterior ao ciclo, com caminho, família, formato e tamanho quando fornecido pelo GitHub. Não é inventário semântico completo, não identifica duplicidade de conteúdo e não é atualizado automaticamente.
4. **Portais offline e Pages:** `docs/glossario-tecnico.html`, `docs/fontes-tecnicas.html`, `docs/inventario-acervo.html` oferecem consulta por texto e filtro. A página inicial `docs/biblioteca-tecnica.html` conecta as três visões; o Pages publica também as projeções JSON sem servidor externo.
5. **Camada de agentes:** `AGENTS.md`, `skills/consultar-acervo-manutencao/SKILL.md`, `llms.txt`, contrato de recuperação e roadmap atualizados para busca nos novos recursos, sempre retornando ao arquivo canônico.
6. **Integridade automatizada:** `scripts/audit-knowledge-discovery.mjs` testa paridade exata da ontologia e bibliografia, links e scripts embutidos, arquivo fonte, existência dos caminhos históricos e proteção contra falsas conclusões sobre OEM/SAP.

## Distribuição do snapshot anterior
| Grupo | Arquivos |
| --- | ---: |
| Dados (`data/`) | 149 |
| Documentação (`docs/`) | 134 |
| Software (`scripts/`) | 166 |
| Schemas | 38 |
| Automações | 4 |
| Agent Skills | 1 |
| Arquivos raiz | 8 |
| **Total** | **500** |

Estes são arquivos físicos, não itens técnicos independentes. `README.md`, relatórios, scripts e artefatos gerados não devem ser contados como evidências industriais.

## Limites preservados
- Nenhum novo valor OEM, limite de teste, medição, OS, causa confirmada, evento de campo, aprovação de projeto, liberação operacional ou remapeamento SAP.
- Não publicar integrais de manuais protegidos ou dados empresariais restritos.
- As fontes bibliográficas são indicações para conferência; a classe de evidência ainda precisa ser avaliada na ficha técnica.
- O glossário preserva o conteúdo da ontologia e não a declara homologada.
- Índices espelham conteúdo existente para busca; o registro canônico sempre tem precedência.

## Próximo ciclo proposto: inventário semântico e primeira ficha fundamental
Mapear `data/knowledge`, `data/ontology`, `data/quality`, `docs` e `data/research` para identificar conteúdos repetidos, arquivos órfãos, vínculos de fonte ausentes e áreas sem material técnico suficiente. Em seguida, criar `technical-knowledge-record.v1` (função, arquitetura, mecanismo, sintoma, evidência discriminante, prevenção, fonte, limites e maturidade) e uma ficha exemplar de **mecanismo físico hidráulico** com revisão documental, sem restrição por série presumida.

O propósito é medir a **capacidade de responder perguntas técnicas com evidência**, e não simplesmente acumular arquivos, páginas ou execuções de teste.
