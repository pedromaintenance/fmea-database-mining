# Ciclo v1.3.74 — Handoff corporativo SEC-01: RACI, decisões e aceite formal

**27/10/2026 · Catálogo 1.3.74 · Pacote proposto, não enviado · Decisão: NO_GO**

## Objetivo e limite

Organizar o encaminhamento do **SEC-01 (Patrocínio, licença e DPIA)** sem atribuir autoridades corporativas reais, inventar atas ou mudar o gate. Os documentos anteriores já identificaram três frentes e nove verificações. Este ciclo transforma essas exigências em um **plano de responsabilidades proposto**, registro de deliberações **em branco** e pauta pronta para revisão pelos responsáveis internos.

**Os nomes das funções são sugestões de governança.** Nenhuma pessoa ou departamento foi formalmente nomeado, nenhuma solicitação enviada e nenhuma assinatura validada. Só o processo corporativo autorizado poderá definir responsabilidades, avaliar contratos ou decidir sobre DPIA. O aceite de uma proposta de desenho restrito não autoriza uso de dados reais, alteração SAP, execução em campo ou liberação operacional.

## RACI proposto

R = responsável pela preparação; A = função proposta para responder pela decisão/revisão; C = consultada; I = informada. **Nenhuma letra implica acesso concedido ou autoridade de assinatura verificada.** A matriz por atividade está no relatório auditável gerado.

| Frente | Atividades | Função A sugerida | Evidência esperada |
| --- | --- | --- | --- |
| Patrocínio e escopo | SEC01-A01 a A03 | Governança / patrocinador, conforme atividade | Patrocinador autorizado, escopo e restrições assinados em sistema corporativo |
| Direitos de uso OEM | SEC01-L01 a L03 | Jurídico corporativo | Contrato/licença, direitos de armazenamento e limites de extração avaliados |
| Privacidade e classificação | SEC01-P01 a P03 | Controlador/Privacidade | Classificação, base autorizada, determinação competente sobre a necessidade de DPIA |

O crosswalk preserva os **nove IDs de checklist da versão 1.3.73** e exige **um único A por atividade**. Nenhuma função pode ser cadastrada simultaneamente nas células A/R/C/I de uma mesma atividade na proposta, para evitar ambiguidade de papéis.

## Registro de decisões aguardando deliberação

| Registro | Pergunta decisória | Estado |
| --- | --- | --- |
| SEC01-DEC-SPONSOR | Existe patrocínio legítimo e escopo restrito, sem autorização indevida para piloto? | Pendente |
| SEC01-DEC-OEM | Os direitos e limites de licença OEM permitem a modalidade de uso pretendida? | Pendente |
| SEC01-DEC-PRIVACY | A área competente avaliou classificação, base de tratamento e necessidade de DPIA? | Pendente |

Cada linha reserva os campos de decisão, signatário, referência de ata/evidência e data, **todos nulos**. Resultados possíveis *para futura deliberação humana*: aprovação restrita para avaliação de desenho, devolução para correção, recusa ou pedido de complementação. **Nenhum desses resultados foi selecionado.**

### Condições formais de aceite do SEC-01

1. Patrocínio, propósito e restrições documentados por autoridade corporativa.
2. Licença e direitos de uso OEM revisados pela função jurídica/licenciante competente.
3. Classificação e base autorizada de tratamento avaliadas; decisão sobre DPIA tomada pelo controlador competente.
4. Registros de origem, autenticidade, custódia e decisão arquivados em **ambiente privado autorizado**, nunca no GitHub público.
5. Aprovação do gate somente no sistema corporativo, com autoridade e assinatura verificáveis. A aprovação SEC-01 **não** executa os gates ID-02 a PIL-08.

Os três itens de aceite do relatório rastreiam os nove itens de checklist; não somam aprovações.

## Pauta de reunião proposta

1. **Patrocínio:** confirmar responsáveis reais e limitações do escopo.
2. **Direitos OEM:** obter parecer competente sobre consulta, cópia, extração, retenção e licenças aplicáveis.
3. **Privacidade:** decidir classificação, base autorizada e eventual DPIA.
4. **Registro de decisão:** documentar divergências, pendências, responsáveis e eventual encaminhamento sem presumir encerramento de gate.

A pauta **não é convite, reunião agendada, ata produzida ou autorização concedida**.

## Segurança e auditoria

O relatório `reports/pm-sec01-governance-handoff.generated.json` possui exclusivamente funções e requisitos genéricos. Não aceita nomes de aprovadores, dados OEM privados, hashes de arquivos corporativos, tags de máquinas, dados reais ou links restritos. Mutação de responsabilidade, prova, assinatura, data, status de aprovação ou liberação operacional deve levar à rejeição pelo auditor.

Os **oito gates privados permanecem BLOCK**. Os **dez gaps PM×SAP permanecem bloqueados**. Sem mudança de ontologia, maturidade, regras de manutenção ou sistema consumidor.

## Artefatos e comando

- `data/governance/pm-sec01-governance-handoff-policy.v1.json`: oito funções propostas, nove linhas RACI, três decisões, três critérios de aceite e quatro itens de pauta.
- `scripts/lib/pm-sec01-governance-handoff.mjs`: composição determinística sobre os contratos SEC-01 v1.3.73 e prontidão v1.3.72.
- `scripts/audit-pm-sec01-governance-handoff.mjs`: verificações de segregação, crosswalk e testes adversariais.
- `reports/pm-sec01-governance-handoff.generated.json`: artefato regenerado em CI (não versionado).

Execute `npm run pm:sec01:handoff:audit`. Status final permitido: **NO_GO_REQUEST_NOT_SENT**.

O próximo passo **fora do repositório público** é confirmar os papéis reais e convocar a avaliação SEC-01 na governança corporativa. Não registrar dados privados aqui.
