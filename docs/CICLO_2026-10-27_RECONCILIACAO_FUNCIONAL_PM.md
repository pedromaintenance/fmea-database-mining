# Ciclo v1.3.67 — Reconciliação de vínculos funcionais das 25 regras PM

**27/10/2026 · Catálogo 1.3.67 · Ontologia 1.3.23 e maturidade 1.3.60 preservadas**

## Objetivo e ponto de partida

A issue [#7](https://github.com/pedromaintenance/fmea-database-mining/issues/7) solicita auditar o caminho **modelo → sistema → grupo → subgrupo → tipo de objeto → componente → dano/causa** dos padrões preventivos, destacando códigos compartilhados e falsos vínculos. A geração de PM já utiliza `classifyPmPath` e `checkPmCandidate`, mas sua elegibilidade é estrutural: não confirma a instalação real por série, OEM, autorização SAP ou diagnóstico.

O ciclo anterior separou sete chaves de modelo candidatas e 35 posições P0; este ciclo reconcilia **todas as 25 regras PM**, não apenas P0.

## Reconciliador determinístico

`scripts/lib/pm-functional-reconciliation.mjs` reconstrói, por regra, seis medidas derivadas da hierarquia existente:

1. Folhas de nível 3 nos modelos genericamente declarados.
2. Caminhos com o código de subgrupo procurado em qualquer pai funcional.
3. Desses, quantos são rejeitados pelo filtro de sistema ou grupo.
4. Caminhos preservados pelo sistema, grupo e subgrupo no filtro atual.
5. Instâncias de descrição de componente encontradas no tipo de objeto da folha.
6. Instâncias com o par dano–causa permitido pelo catálogo e vínculos efetivamente gerados.

A igualdade entre instâncias com par permitido e vínculos gerados é verificada contra o auditor anterior `auditPmCandidateSet`. Cada contagem é **ocorrência de caminho por regra**, não equipamento, código OEM efetivo, erro de campo ou número de peças distintas.

As regras têm três classes mutuamente exclusivas: **bloqueio PM×SAP preexistente**, **candidato estrutural não homologado**, e **sem candidato gerado (o que não prova ausência de componente físico)**. Nenhuma dessas classes libera intervenção.

## Colisões, riscos e contraprovas

O subgrupo `HSVV` aparece em sementes de combustível e hidráulica. Igualdade do código isolado não autoriza transferência entre os circuitos. O auditor conta caminhos com subgrupo coincidente rejeitados por pai funcional e mantém revisão por grupo, modelo, componente e par dano/causa.

Casos sintéticos negativos e positivos exercitam `ENSY/FUSY/HSVV`, `ENSY/COSY/HSVV`, `HYSY/BRSY/HSVV`, `HYSY/STSY/HSVV`, `AISY/COMR/COMR`, profundidade e modelo. Os caminhos aceitos são classificados **apenas como candidatos pelo filtro**, não como montagens fisicamente verificadas.

No caso de `hydraulic-hose-leak` ou `hydraulic-hose-abrasion`, mesmo um HSVV com pai habilitado permanece sujeito à efetividade OEM e curadoria SAP. Para `fuel-filter-contamination`, localizar o subgrupo não cria automaticamente um elemento de filtro. Para `drill-compressor-filter`, grupo COMR e subgrupo COMR não são equivalentes.

## Resultados efetivamente reproduzidos no CI (27/10/2026)

| Medida | Resultado |
| --- | ---: |
| Regras PM / sistemas declarados | 25 / 13 |
| Vínculos estruturais candidatos gerados | 115 |
| Regras com pelo menos um candidato | 15 |
| Regras sem candidato e ainda bloqueadas para curadoria | 10 |
| Exceções P0 / P1 | 5 / 5 |
| Subgrupos compartilhados entre sistemas nas regras | 1 (`HSVV`) |
| Caminhos descartados por divergência de pai funcional | 84 |
| Fixtures estruturais sintéticas aprovadas | 16/16 |
| Mutações adversariais rejeitadas | 46/46 |
| Inspeções reais / aprovações OEM / SAP | 0 / 0 / 0 |

As **84** ocorrências são contadas por regra e caminho: a mesma folha pode participar de mais de uma avaliação. São rejeições **estruturais do filtro atual**, não 84 ativos com defeito, nem prova de cadastro SAP incorreto ou conflito físico OEM.

## Artefatos

- `data/quality/pm-functional-reconciliation-policy.v1.json` — contrato de classificação e dez travas sem promoção automática;
- `scripts/lib/pm-functional-reconciliation.mjs` — reconciliação determinística;
- `scripts/audit-pm-functional-reconciliation.mjs` — auditor com **16 casos funcionais sintéticos e 46 mutações adversariais**;
- `reports/pm-functional-reconciliation.generated.json` — relatório regenerado no CI/QA, não registro de ativos nem laudos.

As 25 regras, 115 vínculos conceituais, dez exceções PM×SAP (cinco P0 e cinco P1), e ontologia 1.3.23 permanecem intocados. O repositório público mantém status **NO-GO** para evidências reais, revisões, códigos SAP e liberação operacional.

## O que falta para uma homologação real

A saída pública pode apontar onde o catálogo não oferece candidato estrutural ou onde um pai funcional seria incompatível. Isso **não** demonstra nem uma montagem errada nem uma peça ausente na máquina. A confirmação exige modelo, variante, número de série, BOM/diagrama OEM efetivos, inspeção controlada e decisão independente de Engenharia/Dados Mestres, em ambiente corporativo autorizado.

Próxima investigação recomendada: ler o relatório de distribuição por regras e priorizar, na fila interna de curadoria, os grupos com mais divergências de pai funcional e as dez exceções já documentadas — sem converter contagens em severidade de risco ou abrir OS automaticamente.

**Escopo da entrega:** auditoria pública estrutural; nenhuma alteração de consumidores (jogos), ordens, sistemas corporativos ou dados de campo.
