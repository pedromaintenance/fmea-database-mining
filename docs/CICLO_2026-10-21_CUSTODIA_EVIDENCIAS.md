# FMEA Database Mining — Ciclo v1.3.23: governança de evidências restritas

**Data:** 21/10/2026. **Tipo:** especificação verificável e testes sintéticos de processo, não implantação operacional de sistema documental.

## Objetivo e entregas

A v1.3.22 estruturou quatro refinamentos editoriais sem evidências de campo. A v1.3.23 estabelece o caminho técnico mínimo para aceitar evidências futuras, mantendo a separação entre **saber onde obter prova**, **receber documento**, **verificar a pertinência OEM**, **avaliar hipóteses concorrentes**, **revisar independentemente** e **aprovar mudanças**.

- [Política](../data/governance/restricted-evidence-workflow.v1.json) com fronteira entre dados públicos e restritos, cinco responsabilidades, seis estados e cinco classes de evidência.
- [Esquema de caso restrito](../schemas/restricted-evidence-case.schema.json) para metadados/IDs opacos no ambiente corporativo; não é autorização para guardar dados reais no GitHub público.
- [Validador puro](../scripts/lib/restricted-evidence-workflow.mjs), [script de testes](../scripts/validate-restricted-evidence.mjs) e [29 regressões sintéticas](../data/quality/restricted-evidence-regressions.v1.json).
- [Procedimento para implementação corporativa](PROCEDIMENTO_EVIDENCIAS_RESTRITAS.md) com papéis, direitos/licenças e plano de custódia.

## Comportamento testado

O gate autoriza, em cenário **inteiramente sintético**, cinco transições sequenciais sob papéis segregados. Recusa outros 24 casos, incluindo ausência de OMM/contraprova, evidência sem licença ou integridade conferida, duplicidade de token, link/arquivo bruto, revisor idêntico ao autor, parecer técnico ou independente rejeitado, ausência de pedido de mudança, declaração prematura de causa raiz, liberação operacional e publicação presumida.

`ready_for_change_control` **não** é `approved`: só significa que uma mudança ainda precisa de aprovação manual, revisão jurídica de compartilhamento/licença e eventual novo ciclo de publicação. A ausência de documento OEM ou de confirmação independente mantém a proposta pendente. O modelo **não** valida que o documento exista, seja autêntico ou seja aplicável; os campos booleanos precisam ser comprovados pelo sistema e pelos revisores responsáveis.

## Limitações deliberadas

A governança é executável como **validador de estrutura e sequência**, mas não cria identidade corporativa, controle RBAC efetivo, cofre, criptografia, assinatura, cadeia de custódia real, logs corporativos, retenção, aprovações formais nem caso real. Essas são dependências externas e não podem ser inferidas de um teste sintético aprovado. Dados efetivos devem continuar em ambiente corporativo homologado, fora deste GitHub.

O repositório não recebeu documentos SIS/OMM licenciados, números de série, fotos, laudos, links internos ou dados pessoais. Os valores `TEST-*` são inventados exclusivamente para testar recusa/permissão de transições e não devem se confundir com evidências.

## Compatibilidade

- Núcleo FMEA: **24 cadeias**, ontologia: **15 mecanismos**.
- Propostas CAND: **3**, refinamentos editoriais: **4** — todos sem revisão OEM por série e sem causa raiz confirmada.
- Piloto D9: **7 requisitos documentais pendentes**, dez regras preventivas PM × SAP ainda bloqueadas.
- Contrato público **1.0.0** e conteúdo público **1.0.0**, preview **1.3.12**, hash anterior e consumidores: preservados.

## Próximo passo

No ciclo seguinte, preparar para TI/Engenharia uma **especificação de implantação restrita** com trilha imutável de alterações e autorização real por papéis, conduzindo um teste com dados **não sensíveis** em ambiente controlado. Apenas após disponibilizar um cofre corporativo e obter autorização explícita do controlador da informação poderá existir um caso real. Não criar nem anexar casos privados neste repositório público.
