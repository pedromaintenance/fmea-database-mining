# Ciclo v1.3.92 — Contrato de evidências de CAT 395 por número de série

**03/11/2026 · FMEA Database Mining · sem dados reais, sem acesso SIS de máquina e sem decisão operacional.**

## Questão material de engenharia

Os máximos comerciais publicados nas páginas da CAT 395, registrados na versão 1.3.91, mostram que **variante comercial não substitui identificação de série e de arranjo**. Para afirmar que um teste hidráulico é aplicável, é necessário ir além: confirmar a configuração real, o esquema de sistemas, o procedimento OEM de Test & Adjust, a instrumentação, o contexto de execução, as contraprovas e a revisão independente.

A própria [Caterpillar, ao descrever o SIS2GO](https://www.cat.com/pt_BR/support/maintenance/sis2go-app.html), associa acesso a manuais, esquemas, sistemas e Teste/Ajuste à máquina **por número de série**, sujeito à assinatura e disponibilidade. A [Caterpillar também diferencia manuais de peças, operação/manutenção e serviço](https://www.cat.com/en_US/articles/for-owners/know-your-machine-better-with-manuals.html). A [ISO 14224:2016](https://www.iso.org/standard/64076.html) inspira a separação entre identificação de equipamento, eventos de falha e atividades de manutenção, **sem alegar conformidade normativa em mineração**.

Nenhum desses materiais públicos fornece as referências de pressão/vazão, os locais de testes ou o esquema de uma CAT 395 individual da mina. **A versão 1.3.92 é um contrato de coleta e conferência, não uma homologação OEM.**

## Arquitetura de informação

1. **Camada pública:** `data/governance/cat395-serial-evidence-contract.v1.json` contém critérios, oito gates, responsabilidades sugeridas e quais provas são exigidas. Não contém máquinas, documentos privados, medições ou pessoas reais.
2. **Camada privada (somente modelo):** `schemas/cat395-private-evidence-draft.schema.json` descreve como um registro deverá ser mantido **fora deste repositório**, em sistema corporativo autorizado. É capaz de representar identificação de ativo, fontes OEM, revisões, aplicabilidade, contextos e valores medidos, sem trazer nenhum desses dados para o GitHub.
3. **Verificação automatizada de completude:** `scripts/lib/cat395-serial-evidence.mjs` avalia somente se declarações e metadados necessários estão presentes e coerentes. Uma ficha aparentemente completa recebe `READY_FOR_HUMAN_REVIEW`, nunca `APPROVED`.
4. **Ferramenta offline:** `docs/cat395-private-evidence-workbench.html` cria modelo vazio, lê um JSON local e mostra contagens e códigos de lacuna; exporta somente um **resumo público redigido**. Não transmite dados, não armazena sessão e não produz certificado técnico. Uso local com arquivo real depende de liberação da Segurança/TI corporativa; arquivo e resumo exigem revisão de confidencialidade.
5. **Auditoria:** `scripts/audit-cat395-serial-evidence-contract.mjs`, integrada ao QA e GitHub Actions, verifica oito gates, S1–S5, S4 SAP independente, confidencialidade, status, relatórios sem vazamentos e **42 alterações adversariais sintéticas** (30 em registros, 12 no contrato).

## Oito gates documentais

| ID | Etapa | O que precisa ser demonstrado privadamente | Situação no repositório |
| --- | --- | --- | --- |
| G395-01 | S1 | Identificação de máquina, série e arranjo efetivos | PENDING |
| G395-02 | S1 | Correspondência entre variante comercial e configuração física | PENDING |
| G395-03 | S1 | Diagrama e documentação OEM com efetividade/revisão conferidas | PENDING |
| G395-04 | S2 | Bombas, controle, retenção, pilotagem, sensores e ramos **realmente existentes** | PENDING |
| G395-05 | S3 | Método e referência de Test & Adjust efetivos para ponto, condição e série | PENDING |
| G395-06 | S3 | Instrumentação, calibração, estado de máquina e proveniência metrológica | PENDING |
| G395-07 | S3 | Isolamento, energia armazenada, sustentação de carga e autorização | PENDING |
| G395-08 | S5 | Contraprovas, parecer independente e custódia de decisões | PENDING |

**S4 — revisão SAP separada:** existem dez exceções PM×SAP previamente bloqueadas na base. Revisão de árvore funcional, subgrupo, dano e causa por Dados Mestres não decorre da avaliação mecânica; é uma etapa separada, `NOT_STARTED`.

## Quatro resultados possíveis por gate no avaliador

- `MISSING`: evidência ausente ou gate ainda não solicitado;
- `UNVERIFIED`: foi declarada uma referência, mas falta proveniência mínima e/ou revisão;
- `CONFLICT`: foi registrada uma incompatibilidade de efetividade, variante ou status;
- `DOCUMENTED_FOR_REVIEW`: informações declaradas suficientes **para submissão à conferência humana**, sem autenticação automática dos documentos.

**Importante:** mesmo que os oito gates sejam declarados completos, a ferramenta não sabe se o documento SIS realmente existe, foi extraído corretamente ou se uma aprovação humana é autêntica. Portanto a única conclusão positiva possível é `READY_FOR_HUMAN_REVIEW`. Todos os relatórios retornam `operationalUseAllowed:false`, `approvedSapMapping:false` e `actualFailureConfirmed:false`.

## Esquema de registro privado (não publicar instâncias)

O schema permite organizar metadados de:
- Identidade do ativo e declaração de variante, mantidas em ambiente autorizado.
- Uma referência documental por gate, revisão e afirmação humana de aplicabilidade por série.
- Medições opcionais por ficha `HC-DIFF-xx`, com instrumento, calibração, condição, ponto, unidade e comprovação **declarada** de execução autorizada. A existência desses campos nunca autoriza produzir medições.
- Revisão técnica, segurança, efetividade OEM e revisão SAP em trilhas separadas.

Não há planilha de valores preenchida neste repositório. Exemplo sintético usado em auditoria é gerado **somente em memória**, e seu identificador explícito `SYNTHETIC-NOT-A-MACHINE` não corresponde a patrimônio de campo.

## Segurança, confidencialidade e integridade

- **Não inserir** série real, patrimônios, PDFs OEM licenciados, links internos, revisão de documentos internos, laudos e medições em commits, issues, pull requests, comentários, logs ou anexos públicos.
- **Não utilizar** o workbench hospedado na web para arquivos privados. Fazer download, verificar origem e executar apenas em estação corporativa autorizada. O arquivo HTML não oferece criptografia, DLP, autenticação, trilha de auditoria ou custódia; ser offline não o torna um sistema seguro.
- **Não realizar** teste de estol/pressão, intervenção em válvulas, coleta em portas de teste ou abertura de linha sem OMM/Test & Adjust efetivo, bloqueio de energia e equipe habilitada.
- **Não confundir** aceite documental, hipótese causal, parecer da Engenharia, ajuste de parâmetros, liberação de máquina e alteração SAP.
- O resumo de exportação foi construído com **allowlist de campos**: `schema`, `version`, `nature`, `documentaryStatus`, `gateCounts`, `errorCodes`, `operationalUseAllowed`, `approvedSapMapping` e `actualFailureConfirmed`. Não há propagação de texto privado.

## Próxima ação com ganho de confiabilidade

Em ambiente corporativo autorizado, selecionar um ativo e uma função hidráulica **já com sintoma verdadeiro**, identificar a referência OEM por série, descrever **duas ou mais hipóteses concorrentes** e planejar a contraprova com controles de segurança. Essa atividade humana e privada é o requisito que falta; a base pública pode orientar sua coleta, mas **não pode substituir sua execução**.

**Invariantes preservados:** 25 regras PM conceituais, 10 exceções PM×SAP bloqueadas, 8 gates corporativos NO_GO; zero eventos, testes, séries, laudos, aprovações reais ou dados SAP homologados. Nenhum consumidor externo foi alterado.
