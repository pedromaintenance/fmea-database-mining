# Arquitetura de implantação restrita — FMEA Database Mining

**Revisão:** v1.3.24, 21/10/2026. **Classificação deste documento:** pública, apenas referência de engenharia de sistemas. **Estado:** arquitetura proposta; nenhuma infraestrutura provisionada, conexão a serviços ou dado corporativo recebido.

## 1. Objetivo e fronteira de confiança

Objetivo: manter **documentos OEM licenciados, registros de inspeção, laudos SOS, série/arranjo e pareceres humanos** dentro de uma plataforma corporativa privada, enquanto o GitHub público guarda apenas ontologia, hipóteses gerais e artefatos editorialmente liberados. Não usar um repositório público, uma PWA em conta pessoal ou planilha aberta como custódia definitiva de material restrito.

```text
Usuário corporativo → Provedor IdP SSO+MFA
  → Backend corporativo (ACL server-side, RBAC + caso + tenant)
    ├→ Metadados restritos / controle de estados e permissões
    ├→ Cofre de objetos privados (KMS, versionamento, backup, licença)
    └→ Trilhas de acesso e decisões → log append-only/WORM + SIEM + âncora externa
           ↓
     Revisão técnica → revisão independente → pedido formal de mudança
           ↓
     Gate separado de confidencialidade, licença, publicação e compatibilidade
           ↓
     Exportação pública *somente* de conteúdo autorizado
```

**Nenhuma seta representa uma integração já criada.** A interface é apenas uma topologia de referência para implantação futura com TI e gestão corporativa.

## 2. Componentes, proprietários e requisitos

| Camada | Responsável proposto | Controle indispensável |
|---|---|---|
| Identidade corporativa | TI/Segurança | SSO, MFA, desligamento/revogação de acessos, recertificação |
| Autorização de aplicação | TI/Desenvolvimento | Negação por padrão, verificações backend por caso e tenant, auditoria de acesso |
| Cofre de documentos | TI/Infraestrutura | Criptografia, gestão de chaves, links nunca públicos, cópias e segregação |
| Metadados de casos | Engenharia de manutenção | Hipótese, referência de arranjo, proveniência, método e revisão, sem publicar dado privado |
| Auditoria | Segurança | Log append-only protegido, relógio confiável, assinatura ou âncora independente, detecção e alertas |
| Retenção/descarte | Jurídico/Privacidade/Documental | Prazo aprovado por classe, hold, alcance das cópias e prova de sanitização |
| Governança de mudança | Engenharia/Qualidade | Dupla revisão, parecer, incompatibilidades, aprovação separada de publicação |

O [JSON de referência](../data/governance/restricted-infrastructure-design.v1.json) registra cada uma das sete camadas como **não implantada**.

## 3. Matriz de acesso e segregação de funções

São oito papéis: solicitante, custodiante, revisor técnico, revisor independente, responsável pela mudança, proprietário documental, encarregado de privacidade e administrador de segurança. O modelo testa **11 operações**.

- **Solicitante** cria caso e consulta metadados autorizados, sem assinar revisão técnica nem anexar OEM diretamente por fora da custódia.
- **Custodiante** registra documentos e proveniência sob autorização, mas não homologa a causa.
- **Revisores** acessam conteúdo apenas em plataforma restrita, quando designados ao caso. O técnico não pode ser o solicitante; o independente não pode coincidir com nenhum dos dois.
- **Gestor da mudança** só encaminha pedido a governança formal, não publica dados.
- **Proprietário documental e privacidade** podem participar da aprovação de descarte; administrador de segurança não lê automaticamente documentos OEM.

**Exportação pública permanece proibida para todos os papéis nesse módulo.** Requer processo separado de direitos, privacidade, consentimento/autorização de fonte, aprovação de engenharia e versionamento de conteúdo.

A função `evaluateAccess` demonstra uma decisão lógica; não obtém tokens de SSO, não autentica credenciais e não cria ACLs no servidor. Um sistema real deve consultar decisões de IAM/RBAC confiáveis **a cada acesso e requisição**, rejeitar afirmações de papel originadas do navegador e auditar decisões e negadas.

## 4. Trilhas de auditoria, hash e limites de segurança

O protótipo cria eventos `TEST-*` mínimos: sequência, identificadores opacos, ação, horário UTC, referência opaca do evento anterior e `SHA-256`. Valida sequência, integridade encadeada, tipos permitidos e igualdade com uma **âncora sintética fixa**.

Isso **não é um sistema à prova de adulteração**: qualquer operador capaz de alterar eventos e o valor da âncora pode recalcular toda a sequência. O sistema corporativo precisará de log append-only/WORM ou proteção equivalente, identidade autenticada, tempo confiável, chave de assinatura controlada externamente e cópia/âncora depositada em domínio de administração independente, com monitoramento e provas periódicas de restauração.

A [NIST SP 800-92](https://csrc.nist.gov/pubs/sp/800/92/final) é uma referência geral de infraestrutura e processos de logs; não certifica esta solução. Registro de auditoria precisa evitar número de série, informações pessoais, imagens, conteúdo do laudo e URL interna. Uso de tokens opacos sem reidentificação no repositório público.

## 5. Retenção, preservação e descarte

**Nenhum prazo foi definido neste projeto.** O período de retenção dependerá da natureza do dado, legislação aplicável, contratos OEM, política corporativa e ordem de preservação/legal hold. A ausência de cronograma aprovado **bloqueia descarte**.

O simulador `assessDisposal` só considera elegibilidade para **revisão manual**, nunca apaga dados. Exige: caso encerrado, prazo vencido, ausência de `legal hold`, alcance de backups conhecido, revisão de direitos e privacidade, programa de sanitização aprovado, plano de recibo de disposição e duas autorizações de pessoas distintas (responsável documental e privacidade). Para operação real, ainda haverá inspeção independente da mídia/backup, execução por TI e comprovante posterior.

A [NIST SP 800-88 Rev. 2](https://csrc.nist.gov/pubs/sp/800/88/r2/final) orienta programa organizacional de sanitização; não substitui a definição empresarial de prazo nem garante por si só exclusão segura de cópias em nuvem.

## 6. Threat model e requisitos de aceitação

| Ameaça/erro | Risco | Critério de aceitação antes de qualquer piloto real |
|---|---|---|
| Credencial comprometida | Exposição de OMM, laudos e dados pessoais | SSO+MFA, revogação imediata, mínimo privilégio, monitoramento |
| Compartilhamento entre tenants/casos | Exposição transversal | Testes backend de isolamento e negação mesmo com URL conhecida |
| Autorrevisão/conflito de interesse | Causa ficticiamente homologada | Revisores distintos autenticados, histórico imutável e motivo |
| Administrador apaga ou regrava logs | Perda de cadeia de custódia | WORM/append-only, âncora externa e verificação independente |
| Exclusão prematura | Quebra de prova e obrigações legais | Retenção aprovada, `legal hold`, backups e dupla autorização |
| Cópia pública de OEM/licenças | Violação de contrato e confidencialidade | Gate de direitos/privacidade e monitor de vazamento de dados |
| Confusão entre documento e causa real | Falha de diagnóstico e execução | Revisão de contraprova, medição e efetividade por arranjo |
| Backup/restauração sem controle | Reintrodução de material descartado | Plano de restauração, sanitização e trilha de cópias |

**Mínimos de homologação TI:** inventário e proprietário do dado, identidade e MFA reais, testes de autorização por caso, cópias criptografadas restauráveis, mecanismo de auditoria com confiança externa, revisão de segurança independente, política de retenção aprovada e procedimento operacional de incidente. Sem esses itens não se deve iniciar ingestão de laudos ou OMM reais.

## 7. Roadmap de implementação fora do GitHub público

**Fase 0 — Projeto:** TI/Segurança/Engenharia definem arquitetura alvo, provedor IdP, escolha de cofre/KMS, logs, backup e responsabilidade pelo dado.

**Fase 1 — Staging restrito:** provisionar ambiente privado com contas de teste e documentos integralmente sintéticos, exercitando revogação, autorrevisão, isolamento por tenant, alteração de log, retenção e restauração.

**Fase 2 — Homologação:** teste de penetração/abuso de papel por equipe independente, verificação de direitos OEM, avaliação de privacidade, planejamento de retenção e aceite formal do controle de dados.

**Fase 3 — Piloto autorizado:** depois de aprovação explícita, executar caso físico real escolhido por Engenharia e Segurança, com acesso restrito; só publicar algo após revisão de licença, privacidade, efeito e governança de versão.

A v1.3.24 executa somente **fase 0 documental e simulação local**, não staging, homologação ou piloto real. Não há métricas de SLA, prazo de retenção ou atribuição de pessoa real inventados.
