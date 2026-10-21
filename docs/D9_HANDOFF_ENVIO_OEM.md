# Handoff operacional — pedido OEM do piloto D9

**Ciclo interno:** 1.3.33 · **Situação:** **a encaminhar**, não enviado · **Acompanhamento público:** [issue #31](https://github.com/pedromaintenance/fmea-database-mining/issues/31).

## 1. Ação imediata da Engenharia de Manutenção

Há uma [solicitação técnica integral](SOLICITACAO_TECNICA_OEM_D9.md) pronta para utilização interna, e uma [pesquisa pública Cat](PESQUISA_PUBLICA_OEM_D9.md) que ajuda a formular perguntas, mas **não comprova efetividade por série**. A issue registra pendência de encaminhamento e não deve ser tratada como requisição aberta perante a Caterpillar, a Sotreq ou a empresa.

**A decisão que falta:** quem, na organização, recebe o pedido e por qual meio autorizado (sistema documental, e-mail institucional, requisição técnica ou outro canal formal). Não foi escolhido destinatário individual nem feito envio, porque nenhum deles está confirmado aqui.

Ao encaminhar, utilizar o [texto de solicitação](SOLICITACAO_TECNICA_OEM_D9.md), acompanhado **em meio restrito** de identificação da máquina ou configuração a ser verificada, se a política interna assim permitir. Não copiar no GitHub público o prefixo/série, cadastro SAP, imagens, protocolos internos, OMM/SIS/CTS, PN ou limites técnicos de literatura licenciada.

## 2. Quatro marcos que não podem ser confundidos

| Marco | Evidência necessária em meio restrito | Status verificável hoje |
|---|---|---|
| Identificar destinatário e canal | Autorização institucional e identificação interna da área/contato | **Pendente** |
| Enviar a solicitação | Comprovante real de envio; identificador de protocolo mantido privado | **Não enviado** |
| Receber documentação | Referência/revisão/efetividade OEM e registros SAP segregados | **Não recebido** |
| Avaliar aplicabilidade e campo | Confirmação de arranjo instalado, método seguro CTS/fixação e parecer independente | **Não executado** |

O acompanhamento público pode futuramente mencionar apenas **estado agregado e não reidentificável**, mediante autorização de governança da informação. Mesmo se a issue de encaminhamento for fechada, os **sete gates OEM** continuam separados e requerem suas próprias evidências.

## 3. Direcionamento por disciplina — sete evidências

| ID | Entrega necessária | Área responsável sugerida | Limite |
|---|---|---|---|
| REQ-D9-01 | Configuração real: série/prefixo e arranjo | Engenharia de Ativos | Registrar somente em ambiente privado |
| REQ-D9-02 | OMM: mídia, revisão e faixa de efetividade | Engenharia Mecânica / custodiante SIS | Não publicar o manual |
| REQ-D9-03 | BOM, partes e modificações instaladas | Materiais/Cadastro + Engenharia | Não presumir PN ou intercambiabilidade |
| REQ-D9-04 | Procedimento junta sapata–elo | Engenharia Mecânica | Não inventar torque, ângulo ou reúso |
| REQ-D9-05 | Método de medição CTS aplicável | Inspeção Preditiva | Exigir instrumento, pontos e limites efetivos |
| REQ-D9-06 | Dados mestres do equipamento e lista técnica | SAP PM / Dados Mestres | Não alterar códigos ou locais por inferência |
| REQ-D9-07 | Inspeção controlada e revisão independente | Oficina / Engenharia | Exigir procedimento seguro, registro e contraprova |

No [registro de origem](../data/quality/oem-d9-evidence-intake.v1.json), há dois itens `not_supplied`, quatro `not_verified` e um `not_performed`. Não alterá-los com base em pedido público, pesquisa geral Cat ou expectativa de resposta futura.

## 4. Texto curto para solicitar confirmação do encaminhamento interno

**Assunto:** Definição de canal/responsável — solicitação OEM D9 material rodante

Solicito indicação da área responsável e do canal corporativo autorizado para encaminhar a solicitação de documentação OEM efetiva para o piloto de material rodante D9. O pacote técnico contempla identificação do arranjo, OMM, BOM, fixação sapata–elo, CTS, conciliação SAP e futura revisão de campo.

Peço orientação para registro do comprovante de envio e guarda de literatura e dados de equipamento em ambiente documental com acesso controlado. A versão pública do projeto registra apenas o acompanhamento da pendência, sem anexar informações restritas.

## 5. Critérios de atualização no repositório

A [issue #31](https://github.com/pedromaintenance/fmea-database-mining/issues/31) deve permanecer aberta enquanto o encaminhamento **não for comprovadamente realizado em sistema interno**. Quando ocorrer o envio, a área deve primeiro preservar o comprovante no sistema privado e depois aprovar, se cabível, uma atualização pública mínima e não identificável do estado. Nenhum script cria, envia ou consulta mensagens corporativas, nem verifica destinatários humanos.

As etapas seguintes — recebimento de documentação, verificação de efetividade e revisão técnica/medição CTS — **não são certificadas pelo encerramento da issue**. Um valor ou desenho encontrado em outra variante de D9 não é aplicável sem confirmação do arranjo específico.

## 6. Verificação de integridade do handoff

`npm run d9:handoff:validate` confronta os sete requisitos originais, os estados pendentes, a referência à issue e os campos sem comprovação de envio. Há 27 cenários sintéticos: 7 baselines e 20 tentativas bloqueadas de inserir envio, credenciais, PN, série, resultado OEM, liberação ou conclusão mecânica sem evidência.

**Conclusão:** pacote tecnicamente encaminhável e rastreado, mas **sem comunicação corporativa efetuada e sem documentação OEM efetiva recebida**.
