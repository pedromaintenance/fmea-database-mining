# Ciclo v1.3.61 — Contrato de recebimento controlado de evidências PM

**24/10/2026 · Catálogo 1.3.61 · Ontologia 1.3.23 · Maturidade 1.3.60**

## Por que esta camada existe
A matriz v1.3.60 documentou 25 FMEAs conceituais e dez exceções PM×SAP bloqueadas. O próximo passo necessário é um contrato que permita futuramente a uma implantação **corporativa privada e autorizada** receber evidências de série, BOM, manutenção, inspeção, diagnósticos e contraprovas, sem expor os dados sensíveis no GitHub.

**Entrega desta versão: somente política, JSON Schema, lógica pura e testes sintéticos offline.** Não há aplicativo implantado, API conectada, login corporativo, armazenamento, credencial, chave persistente, assinatura de aprovações ou caso operacional recebido. O código não entra em SAP, não executa manutenção e não altera nenhum consumidor.

## Reutilização da governança anterior
A implementação referencia, sem modificar:
- `data/governance/restricted-evidence-workflow.v1.json`: mesmo vocabulário de seis estágios, cinco tipos de evidência e segregação de papéis.
- `data/governance/private-result-custody-contract.v1.json`: atestação com chave confiável e assinatura somente pode existir com verificador privado, identidade corporativa e repositório de chaves; assinaturas não comprovam veracidade do laudo.
- `data/quality/pm-maturity-matrix.v1.json`: 25 regras, 25 bundles, dez bloqueios documentados, sete gates de maturidade e **nenhuma homologação** por série/SAP/inspeção.

## Pacote de caso: metadados mínimos, não conteúdo
Um caso de ensaio `synthetic_test_only` usa **somente tokens `TEST-...`** para tenant, caso, ativo, solicitante, evidências, referências e eventos. Referências não são URLs, caminhos, números de série, identificadores SAP ou hashes. Somente `ruleId` e `bundleId` apontam para vocabulário público já catalogado.

O contrato exige:
- Vinculação exata de `ruleId` ao `bundleId`, com 25 regras previstas no schema.
- Cinco classes independentes de recibo: `oem_effectivity`, `oem_procedure`, `field_observation`, `counterevidence` e `measurement_quality`.
- Em cada recibo, declarações de licença, integridade, cadeia de custódia e qualidade. Em ambiente real, tais declarações precisam ser **verificadas por sistemas externos**, não aceitas apenas por serem `true`.
- Uma sequência de eventos com token único, token anterior, papel e ato exigido. É verificação estrutural da ordem, **não trilha criptograficamente imutável**.

## Estágios e travas
| Estágio | Papel declarado | Condição de passagem |
| --- | --- | --- |
| `draft` → `restricted_intake` | Solicitante | Identidade do caso e vínculo semântico válido |
| `restricted_intake` → `custody_verified` | Custodiante | Cinco classes de evidência e checagens de licença/integridade/custódia/qualidade |
| `custody_verified` → `technical_reviewed` | Revisor técnico | Declaração de aceitação, contraprovas, efetividade e justificativa |
| `technical_reviewed` → `independent_reviewed` | Revisor independente | Ator distinto de solicitante, custodiante e revisor técnico; justificativa |
| `independent_reviewed` → `ready_for_change_control` | Responsável pela mudança | Token de solicitação manual e justificativa; **nenhuma aprovação automática** |

A função `assessPmIntakeCase` recompõe o estágio a partir dos eventos e rejeita saltos, eventos duplicados, encadeamento rompido, auto-revisão, dados em campos não declarados, papéis incompatíveis e sinalizações falsas de liberação ou homologação.

**Ponto central:** `ready_for_change_control` quer dizer somente *apto a solicitar avaliação humana*. A condição não aprova causa raiz, componente, código SAP, liberação operacional, substituição, descarte, publicação nem mudança no catálogo. Os dez bloqueios PM×SAP continuam intactos.

## Limites de segurança operacional e informação
O GitHub contém unicamente schema, contrato, código, documentação e fixtures **gerados em memória**. Não publicar captura do VisionLink, laudo SOS, fotografia, série, localização SAP, PN, dados medidos, link de SharePoint, texto de documento OEM licenciado, recibo de aprovação ou hash de documento real.

Um backend corporativo futuro deverá fornecer:
1. Autorização formal da área responsável e controle de licença documental.
2. SSO/IdP e autorização por tenant, caso, ativo e papel com separação de funções.
3. Cofre privado criptografado, logs de acesso, retenção e descarte.
4. Assinaturas de revisão com verificação de chaves confiáveis, revogação e proteção contra replay persistida.
5. Fluxo de decisão de engenharia e curadoria SAP **independente** deste contrato.
6. Revisão de licenças, direitos de uso e não reidentificação antes de qualquer eventual divulgação agregada.

## Arquivos adicionados e controle de qualidade
- `data/governance/pm-evidence-intake-policy.v1.json`: fluxo PM, fontes internas, papéis, gates e o que continua fora do escopo público.
- `schemas/pm-evidence-intake-case.schema.json`: esquema **apenas para casos sintéticos** e campos com allowlist.
- `scripts/lib/pm-evidence-intake.mjs`: verificador puro e sem I/O, limitado à estrutura de metadados.
- `scripts/audit-pm-evidence-intake.mjs`: valida 25 casos de rascunho, dois casos completos, 12 prefixos de etapas e **40 mutações adversariais**.
- `reports/pm-evidence-intake.generated.json`: resultado da auditoria no GitHub Actions.

**Não foram acrescentadas linhas reais à matriz v1.3.60 e não foram modificadas as 25 regras, os 115 vínculos preventivos candidatos ou as dez exceções.**

## Próximo ciclo recomendado
Preparar plano de implantação privada e a primeira revisão **documental controlada** de bloqueios P0, começando pela separação entre obstrução externa/interna do radiador e pelo cadastro do filtro/separador de combustível. Sem autoridade corporativa e documentação específica, a base deve continuar registrando `pending` e `blocked`.
