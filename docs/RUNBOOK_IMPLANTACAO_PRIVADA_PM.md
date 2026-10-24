# Runbook — implantação corporativa privada de evidências PM

**Contrato de planejamento v1.3.62 — nenhum serviço implantado**

O objetivo é estabelecer as dependências para que uma implantação corporativa futura possa receber evidência OEM, medições, relatórios SOS, imagens, histórico de manutenção e revisões de engenharia com custódia verificável. **Este documento não é aprovação de TI/Segurança** e não autoriza importar documentos restritos para repositório público.

## Fluxo de autorização, na ordem necessária

| Gate | Responsável funcional proposto | Critério de aceitação |
| --- | --- | --- |
| SEC-01 — autorização inicial | Segurança, privacidade, governança | Aprovação formal, termo/licença OEM, finalidade e classificação |
| ID-02 — identidade e autorização | TI/Identidade | SSO/MFA, menor privilégio e RBAC servidor por tenant, caso e ativo; recertificação e revogação |
| STO-03 — cofre de evidências | Plataforma/TI | Criptografia, versionamento, ACL por caso, nenhuma URL pública ou link direto sem autorização |
| AUD-04 — prova e auditoria | Segurança/TI | Assinatura com verificador independente, chaves confiáveis e revogáveis, log append-only e relógio confiável |
| RET-05 — retenção | Privacidade/Arquivos | Prazo aprovado pela empresa, backup, legal hold e descarte auditável |
| REV-06 — segregação decisória | Engenharia/PCM/Dados Mestres | Avaliadores técnico e independente, consulta de manual/BOM por série e mudança SAP separada |
| STG-07 — testes em ambiente restrito | TI/Segurança/Engenharia | Testes positivos e negativos, isolamento cross-tenant, negação por revogação, rastreabilidade e rollback |
| PIL-08 — autorização de piloto | Comitê de Mudanças | Aceites de segurança, privacidade, engenharia, plano de suporte e decisão formal |

São **gates de decisão**, não atividades executadas. Todos estão `BLOCK`; critérios não atendidos não podem ser simulados no GitHub como `GO`.

## Controles mínimos de aceitação
1. **Custódia:** o documento OEM deve ter licença/permissão de uso; registro do recebedor, versão/revisão, proveniência e acesso autorizado. Não armazenar o arquivo em README, issue ou PR.
2. **Identidade real:** tokens sintéticos `TEST-*` não são identidade verificada. O backend deve buscar usuários e papéis diretamente no provedor corporativo e impedir aprovação por autor/revisor coincidentes.
3. **Cadeia de integridade:** encadear hashes localmente não impede reescrita maliciosa. Exigir trilha protegida externa e assinaturas vinculadas a usuários confiáveis.
4. **Evidência de campo:** condição de óleo, temperatura ou ruído só pode elevar maturidade após avaliação de procedimento, instrumentação e hipóteses concorrentes.
5. **Mudança SAP:** aceite técnico e revisão documental não concedem permissão para atualizar subgrupo, código de dano/causa ou ordem. Operação real depende de processo independente de Dados Mestres SAP.
6. **Exportação pública:** deve ser proibida por padrão; agregados só podem ser liberados após revisão jurídica, de licença e não reidentificação.

## Regra de parada e rollback
Qualquer falha de identidade, isolamento entre casos, revogação, licença, verificação da assinatura, custódia ou trilha independente é **NO-GO**. O piloto deve permanecer desativado até registro formal de resolução, reteste e reaprovação. Não é permitido reduzir as verificações para viabilizar o teste. A empresa deverá definir controle de revogação, backup e interrupção em ambiente privado.

## Primeiro piloto documental — sem operação
Se e somente se os oito gates forem aprovados, selecionar um caso restrito P0 com autorização explícita, conferir modelo/série/BOM, anexar evidências no cofre privado e aplicar revisão independente. A hipótese permanece `pending` até a decisão humana. Nenhum exemplo real ou token está incluído neste documento.

**Estado atual:** nenhum gate aprovado; nenhuma implantação, piloto ou caso real; próxima ação depende das áreas corporativas autorizadas.
