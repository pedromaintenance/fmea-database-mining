# Runbook de homologação de staging corporativo restrito

**Versão:** 1.3.25 · **Data:** 21/10/2026 · **Aplicabilidade:** equipe de TI/Segurança, Engenharia de Manutenção, responsáveis por documentos e Privacidade. Documento de especificação pública, **não** evidência de ambiente implantado.

## 1. Pré-condições e linha de corte

Nenhum ensaio real deve começar sem decisão formal da empresa, staging privado provisionado e autorização de TI/Segurança. O ambiente deve usar exclusivamente **contas, casos, documentação e equipamentos fictícios**. Não copiar laudos SOS, arquivos SIS/OMM, séries de máquina, credenciais, localizações SAP, material contratado ou URLs internas para o GitHub público.

A arquitetura base é [v1.3.24](ARQUITETURA_RESTRITA_IMPLANTACAO.md); a política de custódia é [v1.3.23](PROCEDIMENTO_EVIDENCIAS_RESTRITAS.md). O [plano JSON](../data/governance/staging-acceptance-plan.v1.json) declara `provisioned=false` para o ambiente e `actualExecutionStatus=not_executed` para todos os cenários. O validador `staging:acceptance:validate` é exclusivamente um **simulador de coerência**.

## 2. Matriz operacional de homologação

| ID | Domínio / responsável sugerido | Exercício de staging necessário | Evidência e critério de aceite |
|---|---|---|---|
| STG-ID-001 | Identidade — TI/Segurança | Entrar com SSO/MFA; revogar conta de teste, repetir requisições e confirmar recusa | Logs do IdP/backend correlacionados à revogação; ausência de sessão utilizável |
| STG-ISO-001 | Isolamento — TI/Plataforma | Acessar tenant e caso alheios por ID conhecido e URL inferida | Resposta negada pelo backend sem conteúdo/URL de objeto exposto |
| STG-SOD-001 | Segregação — Engenharia | Tentativas de autorrevisão e de revisor independente coincidente | Todas recusadas; pedido de mudança não concede aprovação de publicação |
| STG-CUSTODY-001 | Custódia — Engenharia/TI | Upload de documento **sintético**, inspeção de ACL, verificação de direitos e pertinência simulada | Arquivo privado, metadados rastreáveis e export público sem conteúdo restrito |
| STG-AUDIT-001 | Auditoria — Segurança | Reordenar, remover, alterar eventos e desafiar âncora sob outro administrador | Alertas e prova de divergência do log imutável/externo; tempo confiável |
| STG-RESTORE-001 | Recuperação — TI/Plataforma | Restaurar backup **sintético** isolado e repetir testes de ACL e hash | Restauração comprovada, permissões não relaxadas, integridade preservada |
| STG-RETENTION-001 | Retenção — Privacidade/Documental | Simular hold, prazo não vencido, revisão incompleta e descarte de teste | Exclusão bloqueada nos casos indevidos; política/backup/dupla aprovação registradas |
| STG-RELEASE-001 | Liberação — Privacidade/Engenharia | Tentar exportar antes de revisão de licença, reidentificação e controle de versão | Export negado; só pacote autorizado e sanitizado passa por governança separada |

São **quatro controles por cenário**. Os campos e critérios objetivos constam do JSON e são insumos para a futura suíte de integração, que **não** existe neste repositório.

## 3. Execução, coleta e revisão

A organização deve designar ao menos quatro funções institucionais: TI/Plataforma, Segurança, Engenharia de Manutenção e Privacidade/Gestão Documental. Os revisores e autorizações efetivos serão registrados apenas no ambiente restrito.

Para cada exercício real futuro, registrar: versão implantada, ambiente e janela de teste, objeto/caso de teste (opaco), requisição e decisão backend, sinal do IdP/cofre/log, resultado esperado vs observado, falhas/incidentes, reexecução e parecer independente. Documentos e eventuais identificadores privados **não** devem ser reproduzidos neste repositório.

O parecer de segurança e as políticas de retenção precisam ser aprovados pela organização, não inferidos por um script. As seis etapas de aceite permanecem pendentes até se obter evidência e assinatura válida no sistema corporativo.

## 4. Critérios de impedimento imediato

Não avançar se: SSO/MFA não está ativo; um caso de outro tenant retorna dados; autor ou revisor técnico consegue assinar a segunda revisão; documento licenciado sai do cofre; auditoria não detecta alteração/regravação; backup restaura permissões excessivas; `legal hold` não bloqueia descarte; ou export público não possui aprovação de licença e privacidade separadas.

Uma falha crítica significa **não homologado** e exige correção, investigação e repetição do ensaio, não mera atualização de checkbox.

## 5. Distinção de níveis de evidência

O teste unitário sintético verifica apenas a função de avaliação e a qualidade dos requisitos. O teste de integração verifica respostas reais de serviços *em staging*. Homologação corporativa requer análise humana independente, registro de aceitação e fechamento de pendências. Nenhum desses três níveis isoladamente comprova causa raiz de falha mecânica.

O repositório público armazena **somente casos TEST artificiais**. A divulgação posterior de qualquer conhecimento derivado de caso real exige análise de propriedade/licença OEM, confidencialidade, privacidade, anonimização não reversível e versionamento do contrato/conteúdo.

## 6. Estado v1.3.25

**0 ambientes reais criados, 0 exercícios de integração executados, 0 assinaturas de homologação, 0 casos reais, 0 autorizações para ingestão de OEM.** Foi produzido somente o pacote de critérios, dados sintéticos e validação documental.
