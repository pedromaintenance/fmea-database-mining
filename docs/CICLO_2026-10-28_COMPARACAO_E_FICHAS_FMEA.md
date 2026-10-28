# Ciclo v1.3.82 — Comparação e fichas de revisão na consulta FMEA

**28/10/2026 · Repositório público de hipóteses de manutenção · Sem inspeções reais ou homologação OEM/SAP**

## O que foi implementado

A consulta técnica [`docs/consulta-fmea.html`](consulta-fmea.html) passa a oferecer uma estação de **revisão de Engenharia e PCM** além dos filtros das 25 regras existentes:

1. **Regras relacionadas por estrutura:** ao final de cada ficha, até cinco sugestões vinculadas por **mesmo sistema ou código de subgrupo**. A correspondência estrutural não demonstra mesmo componente físico, causa, gravidade, risco ou condição operacional. O botão abre a ficha correspondente; caso não esteja no filtro atual, a navegação limpa os filtros para permitir sua visualização.
2. **Seleção A/B:** duas regras **distintas** podem ser selecionadas independentemente pelo usuário e exibidas **lado a lado**, com sintoma, método de inspeção, sistema, componente candidato e informações particulares de cada trilha.
3. **Exportação de ficha técnica individual em Markdown:** utiliza literalmente os sintomas, métodos, alternativas, lacunas e próximos passos das fontes públicas versionadas.
4. **Exportação de comparação de duas regras em Markdown:** inclui ambos os registros e advertência de que similaridade estrutural não equivale a mecanismo causal comum.
5. **Preservação do HTML offline:** sem API, servidor, CDN, cookies ou acesso corporativo. O formato se adapta a telas estreitas; ações são exclusivamente locais ao navegador.

O novo ciclo **não altera a base conceitual de 25 regras**. Ele melhora a consulta, a comparação e a documentação para revisão humana.

## Duas trilhas distintas

| Trilha | Quantidade | Visão comparativa |
| --- | ---: | --- |
| Inspeção/detectabilidade sem prioridade documental | 15 | Sintoma, método, duas hipóteses abertas, armadilhas de atribuição e possível não detecção; requisitos metrológicos e camadas de maturidade não verificados |
| Exceção documental PM×SAP | 10 | P0/P1 **da fila documental** (5/5), impedimento original, achado de curadoria, próxima análise e evidências mínimas propostas; nenhum vínculo SAP aprovado |

A comparação pode incluir duas regras da mesma trilha ou de trilhas diferentes. **Campos que não existem na fonte não são completados artificialmente**. Não foram criadas hipóteses diagnósticas, valores de medição ou taxas de detecção para as dez exceções documentais.

## Exemplo prático

Uma comparação entre `final-drive-gear` e `final-drive-bearing` destaca sintomas do catálogo, propostas de inspeção, mecanismos alternativos ainda abertos e suas limitações. Nenhum achado pode ser classificado como *confirmado* só porque as duas regras pertencem ao mesmo sistema. A ficha exportada é um roteiro de **revisão documental**, não uma instrução para inspecionar ou liberar o equipamento.

Quando a seleção inclui `hydraulic-hose-leak` e `hydraulic-hose-abrasion`, o relatório mostra o impedimento comum `subgroup_not_in_scope` na arquitetura SAP pública sem fabricar um subgrupo hidráulico ou reaproveitar HSVV de outros sistemas.

## Integridade e validação

- `scripts/lib/pm-technical-review-workspace.mjs` implementa consulta de proximidade **puramente estrutural**, comparação determinística e geração de fichas Markdown, sem estado de aprovação ou risco.
- `scripts/audit-pm-technical-review-workspace.mjs` verifica **600 comparações ordenadas**, 25 fichas individuais, casos inválidos, sintaxe do JavaScript embutido, controles do HTML offline e mutações que tentem promover causa, risco, SAP ou liberação.
- `reports/pm-technical-review-workspace.generated.json` contém o resultado regenerável no CI.
- `npm run pm:technical:workspace:audit` executa a auditoria e passa a integrar `npm run qa` e GitHub Actions.

## Limites de implantação

Os **dez bloqueios PM×SAP** e **oito gates privados** continuam fechados. P0/P1 se referem **exclusivamente à posição documental da fila de curadoria**; falta de prioridade não significa baixo risco. Dados OEM por série, evidência física, autorização, inspeção e parecer humano devem ser verificados em ambiente corporativo autorizado, não neste repositório.

**Estado operacional:** `NO_GO`. **Estado da ferramenta:** consulta pública offline, somente leitura, sem acesso SAP.
