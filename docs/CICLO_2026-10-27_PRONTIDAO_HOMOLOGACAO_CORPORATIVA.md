# Ciclo v1.3.72 — Prontidão corporativa e pendências de homologação PM

**27/10/2026 · Catálogo 1.3.72 · Ontologia 1.3.23 · Maturidade 1.3.60 preservadas**

## Critério central

O repositório já entrega auditoria pública de **25 regras PM, 115 vínculos estruturais, cinco dossiês P0 com 15 hipóteses e 18 cenários sintéticos em dois candidatos a piloto**. Os cenários testam rejeição de proveniência, efetividade OEM, contraprova, conflito, medição e indícios aparentemente positivos.

Isto **não equivale** à capacidade de homologação de ativos na empresa. A publicação de código e o resultado verde no GitHub Actions não autentica identidade de operador, licença OEM, documento por série, custódia, medição de campo, parecer de Engenharia, autorização SAP ou liberação operacional.

O ciclo consolida duas avaliações **distintas**: (a) desenho e regressões públicas disponíveis, e (b) implantação corporativa e evidência real ainda não atestadas. O parecer permanece **NO_GO**.

## Oito gates reais e suas dependências

Os gates foram derivados, **sem reescrever ou dar baixa**, de `data/governance/pm-private-deployment-runbook.v1.json` (v1.3.62). A ferramenta calcula níveis de dependência, não inventa cronograma em dias. Cada gate conserva seu responsável, pré-requisitos e evidências corporativas requeridas.

| Gate | Escopo corporativo | Condição atual |
| --- | --- | --- |
| SEC-01 | Patrocínio, licenciamento OEM, autorização privacidade e DPIA | BLOCK |
| ID-02 | SSO, MFA, RBAC, revogação e segregação por caso | BLOCK |
| STO-03 | Cofre restrito, licença documental, proveniência e integridade | BLOCK |
| AUD-04 | Assinaturas verificáveis, trilha append-only, proteção de replay | BLOCK |
| RET-05 | Retenção aprovada, legal hold, descarte auditável | BLOCK |
| REV-06 | Engenharia independente, efetividade OEM e processo SAP segregado | BLOCK |
| STG-07 | Staging real isolado e testes negativos autenticados | BLOCK |
| PIL-08 | Comitê, avaliação dos gates, rollback e decisão formal de piloto | BLOCK |

Mesmo havendo testes sintéticos públicos, **nenhum desses gates recebeu atestação corporativa**. A fila de revisão prioriza SEC-01 porque é a raiz das dependências, não porque os outros tenham menor importância.

## Resultados obtidos na auditoria CI

| Indicador | Resultado |
| --- | ---: |
| Definições de gates corporativos | 8 |
| Gates privados atestados / bloqueados | 0 / 8 |
| Níveis de dependência calculados | 7 |
| Situações sintéticas avaliadas | 18 |
| Hipóteses P0 mantidas | 15 |
| Candidatos públicos a piloto | 2 |
| Itens de checklist não verificados | 68 |
| Trilhas de decisão independentes | 8 |
| Classes de evidência privada ainda sem comprovação | 8 |
| Exceções SAP ainda bloqueadas | 10 |
| Auditorias anteriores verificadas nesta etapa | 6 |
| Mutações adversariais rejeitadas | **77/77** |
| Ativos reais, séries OEM, medições, OS ou liberações | **0** |

Os **sete níveis** são ondas de precedência da estrutura de dependências, não prazos nem autorização para executar atividades. A validação automática rejeitou falsificações de assinatura, remoção de dependências, encerramento de gates e promoção indevida de resultados simulados.

## Do desenho de teste à evidência operacional

A matriz `pm-corporate-readiness-closure.generated.json` expõe:

- Identificadores e requisitos de comprovação dos oito gates e seus níveis de dependência;
- dois pilotos **sintéticos**, com 34 verificações cada (68 pendências), reunidas em sete seções conforme o controle já existente;
- quatro trilhas de decisão por piloto (Controle Documental, Engenharia, Dados Mestres SAP, Operação), todas sem assinatura;
- as nove categorias de resultado do classificador sintético, com a indicação de que nenhum equivale à liberação;
- oito classes de evidência privada necessárias: identidade, OEM por série, metrologia, contraprova, custódia, Engenharia, SAP e Operação.

A contagem de classes não é o número de documentos que devem ser comprados, solicitados ou coletados. Há **zero ativos reais selecionados, zero séries OEM verificadas, zero medições reais e zero aprovações SAP**. Persistem as dez exceções PM×SAP bloqueadas (5 P0, 5 P1).

## Caminho corporativo para sair do NO_GO

```text
SEC-01 — autorização, escopo, patrocínio e licenciamento
    ↓
ID-02 — SSO, MFA e RBAC com verificação corporativa
    ↓
STO-03 — cofre e custódia de evidências com acesso segregado
    ↓
AUD-04 + RET-05 — assinaturas/replay e retenção/descarte
    ↓
REV-06 — segregação efetiva de Engenharia, PCM e Dados Mestres SAP
    ↓
STG-07 — staging isolado, ataques negativos e aceite humano
    ↓
PIL-08 — decisão formal de um comitê sobre piloto privado
```

A representação mostra precedências, não determina que abrir um gate autorize executar serviços. Nem mesmo a aprovação dos oito gates substitui a análise de risco/LOTO, documentação OEM efetiva, habilitação, medições qualificadas, decisão SAP ou autorização operacional de um equipamento específico.

## Artefatos entregues

- `data/governance/pm-corporate-readiness-closure-policy.v1.json`: evidência esperada, requisito de atestação e prioridade da governança em cada fase.
- `scripts/lib/pm-corporate-readiness-closure.mjs`: consolidação determinística de dependências, gaps, provas necessárias, pilotos e decisões ainda bloqueadas.
- `scripts/audit-pm-corporate-readiness-closure.mjs`: regenera fontes 1.3.65–1.3.71, verifica invariantes e tenta promover indevidamente gates, evidências e decisões.
- `reports/pm-corporate-readiness-closure.generated.json`: matriz pública reproduzível; não contém documentos, tags, séries nem assinaturas reais.

Comando: `npm run pm:corporate:readiness:audit`, integrado ao QA, CI e pacote de artefatos. Não altera catálogos, códigos SAP, 25 regras PM, 115 vínculos candidatos ou consumidores.

## Próxima decisão útil

A etapa seguinte depende de **responsáveis corporativos autorizados**, começando por SEC-01. A Engenharia pode usar o relatório público para organizar perguntas e evidências, mas não registrar dados privados neste repositório. Nenhuma fase aqui foi automaticamente encerrada; a maturidade de campo permanece NO_GO.
