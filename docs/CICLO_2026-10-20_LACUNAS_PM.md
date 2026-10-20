# Ciclo FMEA v1.3.5 — saneamento de regras preventivas sem correspondência

**Data editorial:** 20/10/2026 · **Escopo:** exclusivamente `fmea-database-mining` · **Natureza:** diagnóstico de qualidade de dados, não aprovação de modos de falha.

## Problema

A versão anterior possuía **25 regras genéricas de prevenção** e produzia vínculos candidatos para **15** delas. Outras **10 regras** não geravam correspondência por razões diferentes. A simples ausência de link não permite inferir que a máquina não possui o sistema; é necessário localizar a etapa em que a associação deixa de ser suportada.

O novo [auditor sequencial](../scripts/audit-pm-gaps.mjs) avalia o conjunto de regras pelo mesmo procedimento do [gerador PM](../scripts/generate-pm-links.mjs):

```text
modelo → sistema-raiz → grupo elegível → subgrupo exato
       → peça registrada no tipo de objeto → par dano/causa permitido
       → candidato (NÃO homologado)
```

As contagens resultantes são **estruturais**, não indicam frequência de falha, quantidade de peças fisicamente instaladas ou número de equipamentos.

## Resultados dos dez bloqueios

| Regra | Primeira etapa bloqueadora | Interpretação técnica | Ação de curadoria |
| --- | --- | --- | --- |
| `cooling-radiator-blockage` | Par dano/causa | RADI contém trocador, mas `03.02/C2.09` não está permitido no cadastro de `1690`; sujidade externa ≠ obstrução interna | Diferenciar restrição de ar, contaminação e dano físico |
| `engine-oil-filter` | Componente | Subgrupo LUSY existe, porém não possui componente chamado filtro no objeto associado | Identificar filtro correto e arranjo pelo manual efetivo |
| `fuel-filter-contamination` | Componente | HSVV do circuito de combustível não contém filtro; não é legítimo converter mangueira em filtro | Revisar separador/filtro e respectivo subgrupo |
| `fuel-tank-water` | Par dano/causa | Dreno existe sob TVRE, mas **água no combustível** não é dano do dreno; a combinação `02.10/C2.09` não está permitida | Modelar contaminação do fluido como condição e drenagem como ação |
| `track-idler-wear` | Componente | IDLE existe mas falta `Rolamento` com esse nome no objeto | Verificar rolamento, roda-guia e tipo de componente OEM |
| `hydraulic-hose-leak` | Subgrupo | HSVV não foi encontrado sob sistema/grupo hidráulico correspondente | Revisar BOM/local de linhas de implementos |
| `hydraulic-hose-abrasion` | Subgrupo | Mesmo bloqueio; HSVV existente sob motor/freio/direção não deve ser reaproveitado | Revisar hidráulica de implementos sem criar alias |
| `drill-rotary-bearing` | Componente | MORO existe, mas não possui Rolamento no tipo cadastrado | Conferir arranjo efetivo Sandvik de cabeça rotativa |
| `drill-compressor-pressure` | Componente | VPAR existe, mas não contém Mangueira como item do objeto associado | Distinguir vaso, linhas e conexões pneumáticas |
| `drill-compressor-filter` | Subgrupo | COMR aparece como **grupo**, não como subgrupo COMR no escopo AISY | Revisar hierarquia compressor → elemento filtrante |

**Distribuição:** 3 bloqueios de subgrupo; 5 de componente; 2 de dano/causa. A classificação é o **primeiro obstáculo detectável**, não uma prova de que todos os estágios anteriores estejam corretos fisicamente.

## Fontes técnicas e limites

**SAP Functional Locations:** a [documentação SAP](https://help.sap.com/docs/SAP_ERP_SPV/f0e0dd7850e64947aa66a647f8d3af09/0ab7b853dcfcb44ce10000000a174cb4.html?locale=en-US&state=PRODUCTION&version=6.18.24) distingue local funcional (onde uma função/atividade ocorre) do equipamento/peça instalada. As hierarquias são parametrizadas pela organização. Portanto, um código de subgrupo não equivale a uma lista física completa da máquina.

**Caterpillar — inspeção de filtros e fluidos:** a [orientação OEM](https://www.cat.com/en_US/blog/check-filters-fluids-equipment.html) recomenda inspeções de filtros, níveis, mangueiras e drenagem de separador de água do combustível, mas ressalva consulta ao manual de operação e manutenção aplicável.

**Caterpillar — função do separador:** o [catálogo OEM de peças](https://parts.cat.com/en/catcorp/product/483-1002) demonstra a finalidade de separar água e partículas. Essa referência **não** valida o número de peça na nossa frota nem transforma água encontrada no combustível em defeito confirmado do dreno.

**Fonte de origem:** as regras PM são derivadas de padrões genéricos obtidos de planos preventivos, e as combinações SAP foram geradas pelo cadastro normalizado pré-existente. Nenhuma planilha original corporativa nem conteúdo integral OEM foi republicado neste ciclo.

## Refino introduzido

- Nova [revisão editorial estruturada](../data/quality/pm-gap-review.v1.json) obriga, para cada regra bloqueada, **identificação do bloqueio, justificativa, prioridade, fonte e próxima verificação**.
- Novo `scripts/audit-pm-gaps.mjs` mede seis etapas da junção, refaz a contagem do gerador e **interrompe o CI** se o status de um bloqueio mudar sem alteração do parecer.
- Os vínculos permanecem `inferido_nao_validado`, sem códigos OEM ou localizações inventadas.
- `npm run pm:gaps:audit` produz `reports/pm-gap-audit.generated.json`, gerado em CI e disponibilizado como artefato, **não** como registro histórico empírico.

## Critérios de qualidade alcançados e não alcançados

**Concluído:** 10/10 regras sem link categorizadas e justificadas; 25/25 regras incluídas no teste de cobertura sequencial; nenhuma correção automática por semelhança de nome. **Não concluído:** homologação de peça, localização física, par causal ou método de teste OEM por prefixo/série; nenhuma condição de falha confirmada em campo.

## Prioridades do próximo ciclo

1. **P0 — Combustível:** revisar a semântica de contaminação, filtros/separadores e drenagem, criando tipos separados para condição do fluido, ação de inspeção e modo de falha mecânico.
2. **P0 — Hidráulica:** confirmar como as mangueiras/linhas dos implementos devem se relacionar a `HYSY/IMAT` no catálogo SAP e no OEM.
3. **P1 — Rodante e arrefecimento:** conferir componentes reais de roda-guia/rolamento e as duas maneiras distintas de restrição no radiador.
4. **P1 — Sandvik:** confrontar MORO, VPAR e a hierarquia de COMR com literatura por modelo, preservando variações entre DI650i e DR410i.
5. Introduzir modelo de `conditionDetected`, `componentFailure` e `preventiveAction`, cada um com proveniência e natureza distinta; **não** associar automaticamente água em combustível a dano do dreno.

**Escopo permanente:** construção do banco FMEA, sem alterações no PORCARIA ou qualquer outro consumidor.
