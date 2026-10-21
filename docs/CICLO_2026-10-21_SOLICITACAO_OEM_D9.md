# FMEA Database Mining — v1.3.31: pedido de documentação OEM D9

**Data editorial:** 21/10/2026 · **Natureza:** pacote de solicitação, pronto para envio por profissional autorizado; nenhum envio ou recebimento foi efetuado.

## Contexto técnico

A [v1.3.30](MATRIZ_CONSOLIDADA_BLOQUEIOS.md) consolidou oito frentes, entre as quais a ausência de efetividade OEM e inspeção validada do piloto material rodante D9. A [origem da pendência](../data/quality/oem-d9-evidence-intake.v1.json) relaciona sete itens aos oito `FC-TRACK-*`.

O status existente foi confirmado item por item: **2 não fornecidos** (identificação, OMM), **4 não verificados** (peças, procedimento de fixação, CTS, SAP) e **1 não executado** (revisão de campo). Não é correto dizer que os sete documentos OEM estão faltando: SAP é dado mestre e a revisão de campo é atividade técnica, não manual de fabricante.

## Entrega operacional

- [Requisição estruturada](../data/governance/d9-oem-evidence-request.v1.json) com sete `REQ-D9-*`, classes documentais/atividade distintas, responsável institucional, escopo, fonte original, verificação independente e critérios de aceite.
- [Texto de solicitação pronto para encaminhamento](SOLICITACAO_TECNICA_OEM_D9.md), por canal corporativo autorizado; não foi enviado a ninguém.
- Cinco momentos de inspeção física posterior, todos `not_performed` e condicionados a controles de energia e procedimento efetivo.
- [Schema restritivo](../schemas/d9-oem-evidence-request.schema.json), [validador](../scripts/validate-d9-oem-request.mjs) e [35 casos sintéticos](../data/quality/d9-request-regressions.v1.json) contra recibos, limites, séries, documentos e aprovações fictícias.

## Efeito sobre engenharia

A prioridade não é copiar referências de torque, CTS ou conjuntos usados em outros tratores. A sequência correta exige identificar o equipamento, conferir OMM e arranjo, selecionar procedimento e materiais efetivos, planejar coleta de campo e revisar resultados/explicações alternativas independentemente.

O pacote mantém os limites entre **solicitação documental**, **recebimento**, **verificação de efetividade**, **execução de inspeção** e **aprovação técnica**. Nenhum desses últimos quatro está concluído.

## Invariantes

Núcleo: **24 cadeias FC e 15 mecanismos ME**, sem novas causas confirmadas. Contrato/conteúdo públicos **1.0.0**, preview legado **1.3.12** e checksum original preservados. Nenhum consumidor ou dado SAP real foi modificado.

**Dependência externa obrigatória:** identificação do responsável e canal de envio, documentos OEM efetivos consultados por pessoas licenciadas, campo/medição autorizados e revisão independente efetiva.
