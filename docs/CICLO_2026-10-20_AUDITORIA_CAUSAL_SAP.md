# Ciclo FMEA 1.3.4 — Auditoria causal e compatibilidade SAP

**Data:** 20/10/2026 · **Escopo:** somente `fmea-database-mining` · **Resultado:** auditoria de 24 cadeias, nenhuma homologação automática.

## Objetivo

Revisar **qualidade**, não expandir artificialmente quantidade de modos. Cada uma das 24 cadeias passou a ter uma avaliação explícita de (a) presença de componente no tipo de objeto SAP, (b) existência de par dano/causa no catálogo e (c) correspondência do conjunto **modelo + sistema + grupo + subgrupo + tipo de objeto**. É necessário verificar **todas** as dimensões antes de propor uma ligação de engenharia.

A matriz manual está em [data/quality/causal-sap-assessment.v1.json](../data/quality/causal-sap-assessment.v1.json). O algoritmo [scripts/audit-causal-sap.mjs](../scripts/audit-causal-sap.mjs) produz [reports/causal-sap-audit.generated.json](../reports/causal-sap-audit.generated.json), disponível como **artefato do CI**, não arquivo versionado. Não há números de patrimônio ou resultados reais.

## Fundamentos usados

- [IEC 60812:2018](https://webstore.iec.ch/en/publication/26359): FMEA deve diferenciar modos, efeitos locais/globais e causas possíveis; um cadastro não substitui a análise da falha funcional.
- [ISO 14224:2016](https://www.iso.org/standard/64076.html): princípios de taxonomia, dados de equipamentos, falhas e manutenção e controle da qualidade de dados; aplicação em mineração é **adaptação metodológica**, sem alegação de conformidade.
- [SAP Help — Working with Notification Codes](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/e72f747389b340229f7fa343975bfa57/7d20ec545f356474e10000000a44538d.html): os códigos de danos, causas, atividades e tarefas fazem parte de catálogos de notificações; **a existência do código não constitui diagnóstico**.
- [SAP Help — Cause](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/7f05ca069f8744759f48892c6d307fab/986eb6535fe6b74ce10000000a174cb4.html): causas são registradas separadamente dos itens de defeito; a análise de causa real necessita evidências.

## Resultado da avaliação semântica, cadeia por cadeia

| Categoria | Cadeias | Quantidade | Decisão editorial |
| --- | --- | ---: | --- |
| Candidato taxonômico, não homologado | FC-FD-001/002/003/004, FC-COOL-002, FC-TRACK-002/007 | 7 | Manter como opções somente para verificação de configuração e revisão causal |
| Sem local hidráulico coerente | FC-HOSE-001/002/003/004 | 4 | **Não associar** ao HSVV de motor/arrefecimento/freios/direção |
| Par de dano/causa não permitido | FC-COOL-001/004 | 2 | `RADI` + trocador `1690` existe, mas `03.02/C2.09` não é permitido por `compatibleFailureModesByPart` |
| Arquitetura ainda não verificada | FC-COOL-003 | 1 | Correia `0230` é candidata apenas quando acionamento por correia estiver presente |
| Dano secundário ≠ mecanismo | FC-TRACK-001 | 1 | Desgaste de rolete não codifica por si só travamento devido a detritos |
| Identidade do componente ambígua | FC-TRACK-003 | 1 | Código `1620 = Guia` no objeto IDLE não define a roda-guia completa |
| Falta componente-alvo inequívoco | FC-TRACK-004/008 e FC-COOL-005/006/007/008 | 6 | Esteira `4230` não é tensionador nem junta sapata–elo; termostato/bomba não são reconhecidos diretamente sob RADI |
| Circularidade dano/causa | FC-TRACK-005/006 | 2 | `01.15=Afrouxado` + `C1.17=Folga ou afrouxamento` não distingue **auto-rotação** de **assentamento sem rotação** |

**Total: 24**. Esta tabela contém **pareceres de revisão taxonômica**, não o status de validade física das máquinas. Os códigos, as permissões e as descrições foram lidos no catálogo já publicado no repositório.

## Achados técnicos especialmente importantes

### 1. Um subgrupo pode aparecer em vários sistemas

`HSVV` não representa automaticamente mangueira hidráulica de implementos: no cadastro, o mesmo código aparece sob `ENSY/COSY`, `ENSY/ENGN`, `ENSY/FUSY`, `HYSY/BRSY`, `HYSY/STSY` e outros. Por isso o gerador de PM passou a filtrar sistema e grupo; não relaxar esse filtro para aumentar a contagem de vínculos.

### 2. Código válido não implica sequência causal válida

A associação `TRAK/0320/01.15/C1.17` pode passar na validação sintática do catálogo, porém é **circular**: afrouxamento foi proposto como causa de afrouxamento. A base necessita uma camada de **mecanismo físico e condições antecedentes** para distinguir assentamento, vibração/micromovimento, aperto insuficiente e ruptura.

### 3. O catálogo não nomeia necessariamente o componente do mecanismo

A presença de `RADI` (trocador de calor) não homologa falha de termostato ou bomba. `HYPU` pode aparecer no grupo de arrefecimento, mas o catálogo não identifica automaticamente **bomba d'água**; não tratar bomba hidráulica genérica como peça efetiva de circulação.

### 4. Uma lacuna é um resultado útil

Ausência de componente, par ou caminho não significa que a máquina não possua o sistema. Significa que **o cadastro disponível não sustenta aquela associação**. O sistema de qualidade registra o impedimento e solicita fonte OEM/engenharia de dados mestres.

## Contrato de validação

`scripts/audit-causal-sap.mjs` percorre as 24 cadeias e:
1. Exige avaliação única para cada ID e fonte bibliográfica válida;
2. Compara componente com `partsByObjectType`;
3. Compara códigos com `compatibleFailureModesByPart`, preservando os pares ausentes;
4. Conta **somente** caminhos de três níveis que atendam simultaneamente ao modelo permitido pela PM, sistema, grupo, subgrupo e tipo de objeto;
5. Interrompe a validação se um bloqueio previamente identificado desaparecer sem curadoria da matriz;
6. Gera contagens de lacunas, caminhos candidatos e pareceres **sem publicar identificadores de máquina individuais**;
7. Impõe `engineeringAcceptance=false`, `confirmedCause=false` e `confirmedLocationId=null`.

**Interpretação dos contadores:** número de caminhos cadastrais é cobertura de cadastro, não número de falhas prováveis, falhas reais, FMEAs homologadas ou frequência operacional.

## Correção de processo a partir deste ciclo

**Não promover registros por junção simples.** O processo formal passa a ser:
`fonte técnica → cadeia causal inferida → tupla candidata de catálogo → verificação de componente no sistema/grupo → revisão OEM por série → análise da evidência → homologação editorial`.

A atual matriz de 24 registros continua no estágio de **análise taxonômica não homologada**.

## Fila para o próximo ciclo

1. Resolver representação de mangueiras de implementos nos locais funcionais; não reaproveitar `HSVV` de freios ou motor.
2. Verificar nomenclatura de termostato, bomba d'água e tensionador da esteira nos dados mestres e literatura OEM efetiva.
3. Refinar `01.15/C1.17` (afrouxamento): cadastrar o fenômeno de dano sem perpetuar causa tautológica.
4. Criar matriz **efeito local versus efeito sistêmico**, com severidade apenas qualitativa, sem RPN fictício.
5. Submeter ao especialista e responsáveis de cadastro somente os sete candidatos taxonômicos, sem forçar aprovação.
