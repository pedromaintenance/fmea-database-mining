# Ciclo v1.3.80 — Consulta técnica navegável do catálogo FMEA

**28/10/2026 · v1.3.80 · Banco de falhas de equipamentos móveis · Uso conceitual público**

## Entrega funcional

Implementado um **HTML standalone de consulta técnica**, pronto para abrir **offline em qualquer navegador moderno**:

**[Abrir código da interface (docs/consulta-fmea.html)](consulta-fmea.html)**

Para utilizá-lo localmente, entre no arquivo acima no GitHub, selecione **Raw/Download raw file**, salve como `consulta-fmea.html` e abra no navegador. Ele **não depende de servidor, banco de dados, CDN, chave de API nem conta corporativa**. O arquivo inclui todos os dados públicos necessários.

A interface oferece, sem modificar dados:
- Busca textual por regra, sistema, componente, sintoma, método, hipótese ou evidência solicitada, ignorando maiúsculas/minúsculas e acentos.
- Filtro de sistema e seleção de uma das 15 regras preventivas sem prioridade documental.
- Sintoma e método exatamente como na semente pública original; subgrupo e componente como **candidatos**.
- Duas hipóteses alternativas e suas evidências discriminantes **propostas**, nunca uma causa raiz confirmada.
- Possíveis atribuições causais incorretas, variáveis de contexto, não detecção e fronteiras de inconclusão.
- Seis camadas de bloqueio da matriz de maturidade, dez requisitos documentais de método/metrologia/proveniência e observações genéricas de segurança.
- **Copiar resumo** ou **Exportar TXT** apenas para revisão técnica conceitual, com avisos de não homologação.

O HTML é responsivo para celular e desktop, usa apenas texto e cores locais, não busca imagens ou conteúdo de terceiros e constrói a visualização dos campos via `textContent`, não interpretando texto de dados como HTML.

## Fontes de dados e integridade

A versão do catálogo embutida foi derivada exclusivamente destes arquivos:

| Origem | Dados utilizados |
| --- | --- |
| `data/knowledge/pm-prevention/seed-rules.json` | Regra, sistema, subgrupo, componente, sintoma e método de inspeção |
| `data/quality/pm-unranked-observability-policy.v1.json` | Duas alternativas por regra e segurança |
| `data/quality/pm-inspection-detectability-policy.v1.json` | Sinal, atribuição possivelmente indevida, confusores, não detecção, inconclusão |
| `data/quality/pm-metrology-provenance-policy.v1.json` | Dez requisitos ainda não verificados |
| `data/quality/pm-evidence-maturity-policy.v1.json` | Seis bloqueios de maturidade ainda abertos |
| `data/quality/pm-maturity-matrix.v1.json` | Seleção rigorosa das 15 regras sem prioridade documental |
| `data/quality/pm-gap-review.v1.json` e `data/governance/pm-private-deployment-runbook.v1.json` | Contagem dos dez bloqueios SAP e oito gates privados |

**Importante:** o banco original registra 25 sementes conceituais. Esta interface focaliza **15 sem prioridade documental atribuída** porque foram essas que receberam as fichas de observabilidade e detectabilidade nas versões v1.3.76–v1.3.79. **As dez exceções PM×SAP não foram omitidas por terem risco menor**: elas são tratadas em fluxos específicos com prioridades documentais já existentes (5 P0 e 5 P1), permanecendo todas bloqueadas. A interface não pretende representar todo o catálogo nem todas as FMEAs aprovadas.

## Verificação automática

- `scripts/lib/pm-technical-explorer.mjs` recompõe o conjunto de regras consultáveis de maneira determinística com versões fixadas.
- `scripts/audit-pm-technical-explorer.mjs` valida que **o JSON incorporado no HTML coincide integralmente com as fontes versionadas**. Mudanças nas políticas que tornem a interface obsoleta interrompem o CI até revisão explícita.
- A auditoria testa filtros, buscas, funcionalidades estáticas, ausência de chamadas externas, ausência de campos de aprovação e mutações que tentam inventar evidência, causa, prioridade, OEM, SAP ou liberação.
- `reports/pm-technical-explorer.generated.json` contém os registros públicos e a auditoria regeneráveis em Actions.

Comando: `npm run pm:technical:explorer:audit`.

## Limites de uso

**Nenhuma consulta substitui inspeção, laudo de óleo, manual OEM efetivo, avaliação metrológica, análise de risco ou revisão independente.** Os mecanismos concorrentes são hipóteses; um sintoma não comprova falha física, e a ausência do sintoma não comprova integridade.

**Não há dados reais de equipamentos, tags, séries, valores de medição ou aprovações corporativas no HTML.** Exportação TXT é resumo público para leitura, nunca ordem de serviço ou código SAP. O sistema não escreve em SAP nem envia conteúdo a sistemas externos.

Estado declarado: `NO_GO`. Permanecem **10/10 exceções PM×SAP** e **8/8 gates privados** bloqueados.

## Próximo avanço natural

Avaliar a experiência de uso e a cobertura do catálogo, com eventual expansão responsável da interface para as dez exceções PM×SAP, claramente separadas por status documental e sem equiparar P0/P1 a classificação operacional de criticidade.
