# Ciclo v1.3.70 — Blueprint de recebimento de evidências para piloto P0

**27/10/2026 · Catálogo 1.3.70 · Ontologia 1.3.23 e maturidade 1.3.60 preservadas**

## Decisão de arquitetura

O repositório já possui, antes deste ciclo, contratos de intake, custódia sintética, preflight e parecer separado:
- `data/governance/pm-evidence-intake-policy.v1.json` (v1.3.61): cinco classes de recibo, cinco papéis independentes e seis estados de processo;
- `data/quality/pm-pilot-preflight.v1.json` (v1.3.63): dois candidatos **estritamente sintéticos**, radiador e filtragem de combustível;
- `data/quality/pm-review-decision-packet.v1.json` e `data/governance/pm-review-decision-policy.v1.json` (v1.3.64): 34 verificações por piloto, cinco classes de recibo e quatro trilhas de decisão;
- `data/quality/pm-p0-discriminative-evidence-policy.v1.json` (v1.3.69): 15 hipóteses qualitativas com contraprova e critério de inconclusão.

**A v1.3.70 não substitui esses controles.** Ela cria um crosswalk determinístico entre os quinze diferenciais técnicos, as sete classes de pedido documental e as exigências de custódia/qualidade já existentes, preservando o `NO_GO`.

## Pacotes de entrada por hipótese

Para cada uma das 15 hipóteses, o relatório reproduz:
- o fenômeno, mecanismo ou condição ainda hipotética;
- a observação discriminante planejada, o mecanismo concorrente e o resultado que mantém a investigação inconclusiva;
- os IDs das classes documentais que seriam necessárias por modelo/série;
- a classe de recibo de custódia pertinente quando houver (OEM, campo ou qualidade metrológica);
- a contraprova obrigatória e a qualidade de medição como requisitos de uma avaliação técnica futura;
- oito campos de metadados de custódia privada, **sem dados preenchidos**;
- seis possibilidades de resultado documental para avaliação humana, todas apenas *opções* e jamais conclusões automáticas.

Uma solicitação `ASSET-ID` é um **gate privado de identidade**, não um recibo de evidência OEM. Uma solicitação `SAP-BOM` pertence à trilha de **Dados Mestres SAP**, não é homologada por diagrama OEM. O recibo de procedimento OEM, por si só, **não comprova dano físico nem causa raiz**.

## Dois candidatos a piloto já existentes

O relatório reconstrói os candidatos públicos `TEST-PILOT-RADIATOR-001` e `TEST-PILOT-FUELFILTER-001`. Cada um contém:
- 34 verificações oriundas do pacote de decisão v1.3.64;
- cinco categorias de recibo, todas `NOT_RECEIVED`;
- quatro trilhas independentes (documentos, Engenharia, SAP e Operações), sem assinatura;
- os três diferenciais da família respectiva, sem confirmação;
- identidade de ativo e série reais **nulas**; nenhuma OS, inspeção, aprovação ou liberação.

As trilhas de Engenharia, cadastro SAP e autorização operacional não podem se validar mutuamente. A verificação do documento é distinta da qualidade da observação e da confirmação do dano; confirmar dano não é, por si só, confirmar sua causa.

## Sequência que precisaria existir no ambiente corporativo privado

```text
Identidade real de ativo e configuração
     ↓ validade OEM por modelo/variante/série e revisão
     ↓ autorização de segurança, método e instrumentação
     ↓ registro de observação, contraprova e incerteza
     ↓ custódia autêntica: acesso, licença, integridade, proveniência e assinatura
     ↓ parecer independente de engenharia (mecanismo, dano e causa separados)
     ↓ processo próprio de Dados Mestres SAP, quando pertinente
     ↓ processo próprio de liberação operacional, quando pertinente
```

A **plataforma privada de identidade, armazenamento, transporte, assinaturas e auditoria imutável ainda não está implantada nem verificada**. Esta publicação não recebe nenhum arquivo corporativo, medição, série real, PN, tag de equipamento ou token de aprovação. Nenhum teste de campo é autorizado pelo relatório.

## Artefatos

`data/governance/pm-p0-evidence-pilot-blueprints-policy.v1.json` — contrato do crosswalk, metadados, regras de segregação e `NO_GO`.

`scripts/lib/pm-p0-evidence-pilot-blueprints.mjs` — gerador determinístico de pacotes por hipótese e por piloto, com as entradas das versões anteriores, sem dados privados.

`scripts/audit-pm-p0-evidence-pilot-blueprints.mjs` — reconstrução das versões 1.3.66 a 1.3.69 e regressões adversariais: falso ativo, custódia autenticada, checklist aprovado, dano ou causa confirmada, autorização SAP e retorno operacional.

`reports/pm-p0-evidence-pilot-blueprints.generated.json` — relatório de CI regenerado com status, filas, ausências e testes.

Execução: `npm run pm:p0:evidence:pilot:audit`, integrada ao QA, ao GitHub Actions e aos artefatos. **Nenhuma mudança** no catálogo relacional, nos 25 bundles preventivos, nos 115 candidatos, nos dez bloqueios SAP ou nos consumidores.

## Critério real de evolução de maturidade

A próxima transição não é a criação de mais hipóteses públicas. É designar, no ambiente corporativo autorizado, responsáveis pela custódia e pela revisão, verificar um conjunto OEM com efetividade e licença para um **ativo selecionado privadamente**, e utilizar os critérios independentes para registrar evidências auditáveis. Até isso ocorrer, o banco preserva maturidade conceitual e decisão **NO_GO**.
