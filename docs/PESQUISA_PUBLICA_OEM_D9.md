# D9 — Referências públicas Caterpillar e fronteiras de aplicabilidade

**Data da pesquisa:** 21/10/2026 · **Versão:** 1.3.32 · **Escopo:** literatura pública de material rodante de tratores; *não* é SIS, OMM específico, instrução de oficina nem laudo CTS efetivo.

## 1. Conclusão técnica

A pesquisa identificou cinco páginas públicas Caterpillar que **sustentam fundamentos gerais de inspeção e gestão do material rodante**, incluindo a existência de múltiplas famílias de conjuntos disponíveis para D9–D11, aspectos da inspeção visual, método de aperto torque-turn como recomendação geral e CTS Pro como instrumento de acompanhamento de desgaste.

**Nenhuma fonte consultada comprova qual conjunto está instalado no D9 da mina**. Também não foram encontrados na documentação pública aqui usada torque/ângulo para o fixador específico, PN, reaproveitamento permitido, medida de descarte CTS, local SAP ou evidência de inspeção. Disponibilidade comercial de uma família não significa compatibilidade comprovada ou presença no ativo.

## 2. Fontes OEM públicas e limites

| Referência pública Caterpillar | Evidência geral realmente sustentada | Não inferir |
|---|---|---|
| [Dozer Undercarriage Maintenance](https://www.cat.com/en_US/articles/for-owners/dozer-undercarriage-maintenance.html) | Conferência visual de fixações, elos, buchas, rodas-guia e roletes, presença de resíduos e tensionamento; referência ao OMM | Limite dimensional, ordem de serviço, diagnóstico confirmado ou procedimento específico |
| [Undercarriage for Dozers](https://www.cat.com/en_US/support/maintenance/undercarriage/dozers/) | Inspeção, tensionamento, sujeira e recomendação do método *torque-turn* em componentes de esteira | Valor de torque, ângulo, especificação de fixador e sequência para D9 por série |
| [Undercarriage — Choices for Mining](https://www.cat.com/en_US/support/maintenance/undercarriage.html) | Apresentação de opções General Duty, Heavy Duty e HDXL para faixas D9–D11 | Instalação comprovada ou intercambiabilidade validada no arranjo real |
| [Get Expert Cat Undercarriage Maintenance and Repair](https://www.cat.com/en_US/blog/mining/articles/get-expert-undercarriage-maintenance-and-repair.html) | CTS Pro, coleta de medições e monitoramento por concessionário para planejamento de desgaste | Procedimento CTS efetivo, ponto, baseline ou % de desgaste autorizados |
| [How to Check Dozer Track Tension](https://www.cat.com/en_US/articles/for-owners/how-to-check-dozer-track-tension.html/) | Práticas gerais para verificar condição do material rodante e seu tensionamento | Valor de ajuste ou método liberado para a variante não identificada |

**Cuidado especial com conteúdo genérico de escavadeiras e tratores menores:** exemplos dimensionais, procedimentos de ajuste e números de peças dessas famílias **não devem ser transferidos para o D9** sem documentação de efetividade.

## 3. Matriz de sete requisitos: o que a pesquisa resolve — e o que não resolve

| Gate do pedido | A fonte pública ajuda em quê? | Comprovação ainda exigida |
|---|---|---|
| REQ-D9-01 · identificação | Mostra que o mercado oferece múltiplos arranjos possíveis para D9–D11 | Prefixo, série ou arranjo efetivo do trator, com placa e registro OEM conferidos |
| REQ-D9-02 · OMM | Reforça a necessidade de consultar o manual da máquina | Mídia/revisão, faixa de séries e versão efetivamente aplicáveis no SIS |
| REQ-D9-03 · peças | Mostra famílias de componentes e alternativas de material rodante | BOM/PN por configuração e comparação com o conjunto instalado e alterações |
| REQ-D9-04 · fixação | Reconhece o método geral Cat `torque-turn` | Especificação e estado dos fixadores, ferramenta, reaproveitamento, torque/ângulo e ordem por arranjo |
| REQ-D9-05 · CTS | Confirma o uso do CTS Pro como apoio ao acompanhamento de desgaste | Padrão CTS de cada componente, medição, instrumento, limite e metodologia |
| REQ-D9-06 · SAP | Não há documentação pública relevante ao cadastro SAP da empresa | Dados mestres e locais funcionais internos, confrontados com BOM OEM efetiva |
| REQ-D9-07 · campo | Orienta pontos típicos para inspeção visual, sem provar condição do equipamento | Intervenção/inspeção autorizada, observação registrada, contraprova e revisão independente |

## 4. Fronteira de segurança para execução no D9

Não conduzir procedimento de fixação ou ajuste de tensionamento com base exclusivamente nas fontes públicas. Antes de uma operação, o responsável deve verificar condição segura, método OEM, controle de energias perigosas e aplicabilidade por série, além das ferramentas/instrumentos exigidos. Em medição CTS, registrar localização, instrumento, condições, valor e baseline efetivo; sem baseline, não declarar porcentagem de desgaste nem descarte.

Sintomas de rolete com arrasto, buchas aquecidas, resíduos acumulados, ruído e fuga de óleo exigem **discriminação causal**. A presença de um deles não demonstra automaticamente contaminação, falha de vedação, lubrificação inadequada ou fim de vida útil do conjunto.

## 5. Limites de governança

Esta pesquisa é **literatura técnica geral verificada**, e não revisão OEM por série. O documento [solicitação D9](SOLICITACAO_TECNICA_OEM_D9.md) continua **pronto e não enviado**, e as sete entradas de [evidência do piloto](../data/quality/oem-d9-evidence-intake.v1.json) mantêm os estados originais: duas `not_supplied`, quatro `not_verified` e uma `not_performed`.

O [registro estruturado](../data/research/d9-public-oem-literature.v1.json) mantém 5 fontes, 7 mapeamentos e as limitações técnicas. O comando `npm run d9:public:oem:validate` testa 31 casos, bloqueando falsos valores/pareceres/documentos.

**Próximo passo efetivo:** designar pessoa com acesso ao SIS e responsável pela máquina em Engenharia de Ativos, transmitir a solicitação pelo canal autorizado, receber referências/documentos sob licença, verificar efetividade e finalmente programar inspeção segura. É uma dependência **organizacional e documental real**, que não pode ser encerrada por CI.
