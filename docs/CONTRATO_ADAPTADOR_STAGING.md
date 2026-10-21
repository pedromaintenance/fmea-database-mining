# Contrato de adaptador para ensaios de integração em staging

**Versão editorial:** 1.3.26 · **Data:** 21/10/2026 · **Status:** interface proposta e mock local. **Não** há integração de serviços corporativos, autenticação, acesso a cofre, assinatura ou caso real.

## 1. Fronteira de implantação

O [plano de homologação v1.3.25](RUNBOOK_HOMOLOGACAO_STAGING.md) exige oito cenários e 32 verificações de SSO/MFA, autorização por caso e tenant, segregação, custódia, log externo, backup, retenção e liberação. O contrato v1.3.26 permite **representar as operações de teste** em uma interface única, mas oferece apenas um mock offline para verificar coerência. Nunca conectar a redes corporativas a partir do CI público.

```text
Plano de testes STG-* (8 × 4 controles)
              ↓
       executeProbe(query)       ← Contrato de interface
              ↓
       OFFLINE_MOCK (nesta versão)
              ↓
      4 respostas TEST por cenário
              ↓
  Validação de envelope sem dados brutos
              ↓
synthetic_complete / synthetic_incomplete / reject
```

Um adaptador **real** futuro deve ser implementado fora do repositório público, sob identidade corporativa, permissão por caso, auditoria e redes privadas. Este contrato não seleciona SaaS, protocolo HTTP, endpoints, credenciais, fornecedor ou acesso a produção.

## 2. Interface exigida

A operação `executeProbe` recebe: ID do cenário `STG-*`, ID do controle esperado, referência opaca de caso **sintético**, correlação de execução e confirmação `syntheticOnly=true`.

O envelope público contém: schema, versão, modo `synthetic_offline_only`, ID da execução `TEST-*`, cenário, caso TEST, início/fim, identificador `offline_mock`, quatro resultados `{probeId, status, evidenceToken}`, estado `simulation_only` e flags explícitos `realSecurityApproval=false` e `publicationAuthorized=false`. Todos os tokens de evidência são fictícios; não apontam para documentos corporativos.

Não são aceitos campos extras que contenham laudos, fotos, URLs restritas, números de série, dados pessoais, valores medidos, credenciais ou assinatura presumida. **Um token sintético não comprova integridade de uma evidência real**.

## 3. Semântica de resultado

| Condição | Saída | Interpretação válida |
|---|---|---|
| Quatro controles conhecidos, únicos e `pass` | `synthetic_complete` | Mock implementou o contrato para o cenário; nenhuma prova de segurança real |
| Ao menos um `fail`, `blocked` ou `inconclusive` | `synthetic_incomplete` | A simulação não satisfez todas as verificações |
| Cenário/controle não conhecido, duplicidade, metadado inesperado, modo real ou aprovação falsa | `reject` | Recusar envelope e não incorporar ao pacote público |

O schema é deliberadamente mais restritivo que o futuro formato **privado**. Resultados reais nunca devem ser gravados ou exportados aqui; na empresa, precisam da assinatura de serviço, proveniência, integridade, operador/revisor, custódia, relógio confiável e análise de acesso.

## 4. Testes de regressão

A [suíte sintética](../data/quality/staging-integration-regressions.v1.json) define **56 casos**: oito baselines com quatro controles aprovados, 32 falhas pontuais de um controle e 16 mutações de formato/identidade/semântica. Inclui tentativa de trocar para modo real, atribuir aprovação de TI, inserir URL ou token, forjar evidência, omitir controle e inverter timestamps.

Executar `npm run staging:adapter:validate`; o comando entra no `npm run qa` e no GitHub Actions. Os dados usados são exclusivamente `TEST-*`; o script não faz requisições remotas.

## 5. Para TI e Segurança: requisitos para eventual adaptador corporativo

Antes de implementar e executar com serviços reais, estabelecer: ambiente isolado autorizado, SSO/MFA e papéis autenticados no backend, testes por tenant/caso, contas artificiais, cofre com dados de teste, logs append-only e âncora independente, recuperação de backup, retenção corporativa e revisão de licença/privacidade. O adaptador deverá falhar fechado, respeitar revogação, registrar evidência apenas em cofre e impedir qualquer transmissão de documento para artefatos do GitHub.

**Aprovação do CI público não autoriza instalação no ambiente da empresa.** Testes de integração, pentest e aceites institucionais permanecem pendentes; seis requisitos de aceite corporativo do plano v1.3.25 não foram assinados.

## 6. Próxima etapa e limites

Quando TI autorizar um ambiente de staging **privado**, criar nele um adaptador integrado distinto do mock e um repositório restrito de evidências/testes. O contrato de saída pública permanece fechado para casos reais. Somente sumários anonimizados com aprovação separada de licença e privacidade podem ser considerados posteriormente, nunca por automatismo.

**Estado:** 0 endpoints corporativos, 0 credenciais, 0 testes de integração reais, 0 dados de ativos, 0 causa mecânica confirmada.
