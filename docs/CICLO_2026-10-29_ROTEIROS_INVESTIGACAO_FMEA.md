# Ciclo v1.3.86 — Roteiros documentais de investigação de Engenharia e PCM

**29/10/2026 · Publicação pública conceitual · NO_GO operacional**

## Objetivo

O painel de lacunas v1.3.85 passa a oferecer, para cada uma das **25 regras**, um roteiro estruturado de **preparação de revisão documental**. Ele não instrui realização de ensaio, desmontagem, ajuste, intervenção ou liberação de máquina; seu objetivo é identificar o que precisa ser conferido e por quem antes de uma eventual tratativa privada autorizada.

## Cinco etapas explicitamente não executadas

| Etapa | Assunto | Evidência/decisão pendente |
| --- | --- | --- |
| S1 | Identificação OEM e configuração | Série, arranjo, BOM e procedimento OEM aplicável; nenhum comprovado pela base |
| S2 | Função e mecanismos candidatos | Revisar cadeias genéricas existentes ou pesquisar uma cadeia ausente; 14 regras ainda não têm cadeia catalogada |
| S3 | Discriminação e segurança | Alternativas e contraprovas propostas para 15 regras; evidências mínimas originais para as dez exceções SAP |
| S4 | Semântica e curadoria SAP | Manter dez exceções **bloqueadas**; 15 regras sem mapeamento aprovado nem exceção formal registrada |
| S5 | Parecer independente | Revisão por equipe competente em fluxo corporativo autorizado, sem assinatura ou aprovação neste arquivo |

Toda etapa está marcada **não realizada** e **sem comprovação recebida**. A ausência de registro não é evidência negativa de falha.

## Duas trilhas, dados diferentes

- **15 regras não priorizadas documentalmente:** mantêm as duas hipóteses concorrentes da fonte, evidências discriminantes propostas, confusores, limites inconclusivos e fronteiras de segurança. Ausência de prioridade documental **não** significa risco baixo.
- **10 exceções PM×SAP:** apresentam o bloqueio original (subgrupo, componente ou par dano–causa), o achado de curadoria, a próxima revisão proposta e as evidências mínimas ainda não coletadas. **P0/P1** são prioridades de fila **documental**, nunca urgência de manutenção ou criticidade de falha.

**Proveniência:** semente preventiva, catálogo técnico, grafo de 24 cadeias genéricas e 11 nós semânticos, matriz de maturidade e carteira pública de lacunas. Dados conceituais não se tornam evidência real por constarem em um roteiro.

## Experiência de uso

Na [consulta offline](consulta-fmea.html), o painel de lacunas traz os controles **Visualizar etapas de investigação documental** e **Preparar roteiro MD** em cada regra. O roteiro exportado pode apoiar a preparação de uma reunião de revisão, mas não constitui nota/OS SAP nem checklist executável.

A biblioteca `scripts/lib/pm-investigation-worksheets.mjs` reproduz os 25 roteiros de maneira determinística a partir das fontes versionadas. A auditoria `scripts/audit-pm-investigation-worksheets.mjs` verifica correspondência dos campos, cinco etapas pendentes, preservação das hipóteses e evidências originais, JS offline e ataques de adulteração para falsificar execução, aprovação SAP, causa raiz, prioridade ou liberação.

**Comando:** `npm run pm:investigation:worksheets:audit`. Resultado em `reports/pm-investigation-worksheets.generated.json`.

## Limites

**Zero:** inspeções de campo, instrumentos efetivos por série, causas confirmadas, revisões independentes registradas, aprovações SAP e liberação operacional. Os **dez bloqueios PM×SAP e oito gates corporativos** permanecem **BLOCK / NO_GO**. Nenhum repositório consumidor foi modificado.
