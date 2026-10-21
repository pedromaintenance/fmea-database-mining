# FMEA Database Mining — Ciclo 1.3.34: validação PM estrutural estrita

**Data editorial:** 21/10/2026 · **Escopo:** engenharia de dados e prevenção de associações SAP funcionalmente indevidas.

## Trabalho executado

Este ciclo evolui o **código usado efetivamente pela geração dos vínculos PM** em vez de acrescentar camadas meramente documentais. O antigo validador cobria raiz do sistema e presença do par dano/causa no catálogo, mas deixava campos da regra de origem sem confronto obrigatório.

O novo [núcleo de integridade](../scripts/lib/pm-link-integrity.mjs) confronta 14 campos de cada vínculo, recomputa o identificador e compara função/grupo/subgrupo/modelo, tipo de objeto, descrição da peça, dano/causa, sintoma, método e ausência de observação/aceite. Também recomputa o universo de vínculos que o gerador deveria produzir; **saída omitida e duplicidade passam a causar falha de QA**.

O [auditor](../scripts/audit-pm-system-scope.mjs) produz cobertura por uma das **25 regras**, estágios completos de filtragem e motivo de falta de ligação. As contagens da base **não foram inventadas aqui**: são calculadas sobre `failure-db.v1.json` e `generated-links.json` durante a execução e gravadas em `reports/pm-system-scope-audit.generated.json`.

[49 checagens](../data/quality/pm-strict-link-regressions.v1.json) cobrem 25 regras de origem e 24 mutações, incluindo alterações dos candidatos gerados, troca de componente e falsas observações.

## O que os testes não demonstram

Não foram fornecidos documentos OEM efetivos, dados SAP corporativos, medições físicas ou revisão de campo. Os vínculos continuam `inferido_nao_validado` e as 10 exceções PM×SAP seguem bloqueadas até conferência por configuração e revisor.

O pedido D9, acompanhado pela [issue #31](https://github.com/pedromaintenance/fmea-database-mining/issues/31), **não foi enviado**: seu envio depende de destinatário e canal corporativo ainda não definidos. Nenhuma alteração no banco de dados deve alegar o contrário.

## Compatibilidade

O núcleo mantém **24 FC e 15 ME**, sem nova homologação. Contrato público/conteúdo público em **1.0.0**, preview legado em **1.3.12**, checksum preservado; nenhum consumidor editado.
