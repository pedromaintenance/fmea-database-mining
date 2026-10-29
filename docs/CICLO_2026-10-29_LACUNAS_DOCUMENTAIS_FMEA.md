# Ciclo v1.3.85 — Painel de lacunas documentais FMEA

**29/10/2026 · Banco público de engenharia de manutenção · Estado operacional NO_GO**

## Finalidade

A [consulta FMEA offline](consulta-fmea.html) passa a combinar o mapa por sistema e mecanismos (v1.3.84) com uma **carteira de pendências documentais**, por sistema e regra. A ausência de documentação não é usada como estimativa de probabilidade de falha, severidade, risco ou prioridade de OS.

O painel incorpora um índice derivado da **matriz de maturidade v1.3.60**, reconciliado com as **25 regras preventivas** e o grafo conceitual. Fonte de referência de OEM não demonstra efetividade OEM por série; cadeia teórica não constitui observação de campo.

## Categorias de trabalho — sem classificação de risco

| Categoria | Registros | Significado |
| --- | ---: | --- |
| Aplicabilidade OEM por série | 25 | Sem confirmação documentada de arranjo/série, BOM e método efetivo |
| Contraprova e evidência de campo | 25 | Sem resultado discriminante documentado na fonte pública |
| Cadeia genérica ainda não catalogada | 14 | A regra não está citada entre as 24 cadeias existentes |
| Revisão de enquadramento SAP | 25 | Dez exceções **formalmente bloqueadas** e outras quinze **sem mapeamento aprovado, mas sem exceção registrada** |
| Revisão técnica independente | 25 | Nenhuma homologação independente registrada |

A contagem de **14 regras sem cadeia genérica** não quer dizer 14 falhas sem análise física; quer dizer que o catálogo de cadeias ainda não vincula explicitamente essas regras. As outras 11 possuem pelo menos uma cadeia **genérica**, não um diagnóstico confirmado. Nenhuma categoria autoriza inspeção física.

## Interface implementada

A ferramenta apresenta filtros combináveis de sistema, categoria documental, trilha de revisão e busca textual, ordenando registros por **ID**, nunca por um escore fictício. Cada registro apresenta:

- Sistema, componente candidato, cobertura ou lacuna de cadeia genérica, quantidade de referências catalogadas.
- Enquadramento SAP: **exceção bloqueada** (com tipo de impeditivo) ou **sem mapeamento aprovado e sem exceção registrada**.
- Ações documentais propostas, identificadas como pesquisa/verificação condicionada à revisão humana.
- Botão para abrir a ficha técnica original, onde permanecem as hipóteses e limitações de diagnóstico.
- Exportação das pendências filtradas em **Markdown** (relatório para preparação de revisão de Engenharia e PCM).

P0/P1 permanecem **posições documentais da fila de curadoria**, não indicadores de gravidade operacional. O painel não modifica a base de 25 regras, seus vínculos, as exceções, os dados SAP ou o estado de revisão.

## Implementação e validação

- `scripts/lib/pm-knowledge-gap-inventory.mjs`: construção determinística de 25 registros a partir da matriz de maturidade, catálogo e grafo; categorias e resumo por 13 sistemas; verificação de estados não homologados.
- `docs/consulta-fmea.html`: terceiro índice estático incorporado, filtros, apresentação responsiva, exportação Markdown e navegação para as fichas detalhadas. Nenhuma rede ou instalação necessária.
- `scripts/audit-pm-knowledge-gaps.mjs`: comparação integral do índice incorporado com as fontes, sintaxe JavaScript, filtros, interações previstas e ataques sintéticos contra falsa aprovação de cadastro, remoção de bloqueios, prioridade operacional e validação OEM indevida.
- `npm run pm:knowledge:gaps:audit`: auditor integrado ao `npm run qa` e GitHub Actions; relatório em `reports/pm-knowledge-gaps.generated.json`.

## Governança e próximos passos

O ciclo cria uma visão para **organização da pesquisa e da curadoria**, não um despacho automático de prioridades. Uma etapa posterior poderá incluir **pautas de revisão por disciplina e protocolo de evidência**, desde que mantenha a separação entre documentos públicos e validação privada autorizada.

**Dez exceções PM×SAP bloqueadas, oito gates corporativos bloqueados, zero evidências de campo, zero causas confirmadas, zero aprovações SAP. Decisão: NO_GO.**
