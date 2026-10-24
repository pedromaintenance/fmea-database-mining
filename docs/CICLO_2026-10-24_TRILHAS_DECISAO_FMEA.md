# Ciclo v1.3.64 — Separação das decisões de evidência, engenharia, SAP e operação

**24/10/2026 · Catálogo 1.3.64 · Ontologia 1.3.23 · Maturidade 1.3.60 · Preflight 1.3.63**

## Objetivo
Transformar os dois preflights públicos P0 em **pacotes estruturados de solicitação e revisão de evidências** sem confundir completude documental, parecer técnico, atualização cadastral e autorização de retorno à operação. Este projeto é uma base de conhecimento, não o sistema autorizado de aprovação ou execução da mina.

Os casos permanecem integralmente **sintéticos**, sem ativo, número de série, posição SAP real, laudo, imagem, leitura de campo ou assinatura de aprovação. Os 25 bundles conceituais e as dez exceções SAP continuam intocados.

## Quatro trilhas de decisão independentes

| Trilha | Pergunta de engenharia | Situação pública |
| --- | --- | --- |
| `documentary_readiness` | Existe evidência OEM por série/BOM, procedimento, licença, origem e contraprova suficiente para iniciar uma revisão? | `missing_or_unverified_evidence` |
| `engineering_validation` | As medições e inspeções discriminam de forma independente sintoma, mecanismo, dano e eventual causa raiz? | `not_reviewed` |
| `sap_masterdata_change` | O cadastro funcional e os códigos de componente, dano e causa foram aprovados pelo fluxo competente? | `blocked_pending_curatorship` |
| `operational_release` | Execução, riscos residuais e condições de retorno ao serviço foram aprovados pela gestão competente? | `not_authorized` |

**Invariante:** documento recebido não confirma dano; uma hipótese tecnicamente apoiada não aprova código SAP; aprovar código SAP não libera equipamento; revisão de engenharia não dispensa a autorização operacional. O mesmo raciocínio vale para qualquer diagnóstico futuro.

Os resultados possíveis em eventual sistema corporativo privado são **categorias para futura decisão humana**, não ações executáveis pelo verificador público. Não há backend corporativo, SSO real, cofre implantado ou assinatura conferida.

## Requisitos de evidência e contraprova
A avaliação carrega os **34 requisitos por caso** da política de preflight v1.3.63 (68 pendências nos dois casos), associados a cinco classes de recibo: `oem_effectivity`, `oem_procedure`, `field_observation`, `counterevidence` e `measurement_quality`. Todos os recibos estão `not_received` e todos os checks estão `unverified`.

Cada caso registra sete dimensões de controle:
1. Identidade da máquina, variante, BOM e efetividade de revisão OEM.
2. Licença, integridade, proveniência e custódia da documentação.
3. Medição executada com segurança, instrumento calibrado, incerteza e contexto operacional documentado.
4. Hipóteses mecânicas concorrentes e resultados físicos que as discriminem.
5. Dano físico evidenciado separadamente da inferência de mecanismo e causa raiz.
6. Revisão de engenheiro independente, com identidade corporativa verificável.
7. Distinção entre aprovação de mudança SAP e liberação do equipamento.

### Aplicação 1 — Radiador
`cooling-radiator-blockage`, `BUNDLE-03`, RADI: distinguir sujidade externa de colmeia, circulação interna e sensores/ventilação/carga térmica. Apenas fotografia, temperatura elevada ou código de condição não provam entupimento interno nem `03.02/C2.09`. Em eventual revisão real, controlar carga, temperatura ambiente, local do sensor, instrumentação e procedimento OEM; preservar o bloqueio `damage_cause_not_permitted`.

### Aplicação 2 — Filtragem de combustível
`fuel-filter-contamination`, `BUNDLE-02`, HSVV: diferenciar restrição de elemento filtrante, água/partículas no combustível e erro de localização cadastral. A árvore HSVV não registra automaticamente o filtro. Documentação de cabeçote/filtro por série, amostra representativa anterior à intervenção quando aplicável e segura, controles de abastecimento/tanque e cadeia de custódia são necessários antes de formar parecer. Preservar `component_not_registered`.

## Sem assinatura verdadeira ou histórico imutável
O campo `decisionTrail` criado neste ciclo registra um **modelo sintético vazio** e declara `synthetic_not_immutable`. Um encadeamento textual de eventos não constitui trilha protegida. Autenticação, autorização por ativo/caso, verificação de assinaturas, auditoria append-only, retenção de documentação OEM e efetividade por série continuam pendentes da infraestrutura privada prevista no runbook v1.3.62 (oito gates em NO-GO).

A resposta computacional possível neste repositório é **`NO_GO_PUBLIC_REVIEW`** ou **`REJECTED`**. Não existe caminho de código público para confirmar dano, causa, mapping SAP ou liberar equipamento.

## Arquivos
- `data/governance/pm-review-decision-policy.v1.json`: quatro trilhas independentes, sete critérios, classes de evidência, proibições e limites de autoridade.
- `data/quality/pm-review-decision-packet.v1.json`: dois pacotes TEST-* gerados por cruzamento determinístico de preflight, dossiês P0, maturidade e governança.
- `scripts/lib/pm-review-decision.mjs`: geração e avaliação pura, sem I/O para backend privado ou SAP.
- `scripts/audit-pm-review-decision.mjs`: verifica proveniência e rejeita **53 ataques adversariais** de falsificação de campo, parecer, revisão, cadastro ou liberação.
- `reports/pm-review-decision.generated.json`: resultado no CI.

## Critério para avançar
A próxima mudança útil depende de autorização das áreas corporativas, documentação OEM vinculada ao ativo e validação de um ambiente privado por segurança e engenharia. Enquanto os requisitos não existirem, o repositório deve continuar reportando **sem evidência validada**, e não uma porcentagem fictícia de homologação.
