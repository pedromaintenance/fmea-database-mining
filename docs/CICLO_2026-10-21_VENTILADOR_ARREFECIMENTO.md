# FMEA Database Mining — Ciclo v1.3.44: ventilador de arrefecimento e linguagem causal

**21/10/2026 · Ontologia 1.3.9 · Banco 1.3.44.** Objetivo: ampliar a modelagem de condições/ações/danos da família de ventilação e corrigir um título de dano que transmitia certeza incompatível com sua situação de curadoria. **Nenhum componente foi identificado em máquina real, nenhuma inspeção foi executada e nenhum código SAP foi homologado.**

## 1. Correção de terminologia técnica

O conceito `DMG-COOL-INTERNAL-BLOCKAGE` tinha o rótulo “Obstrução interna efetiva do trocador de calor”, apesar de `confirmed:false`, `reviewStatus:not_approved` e cinco campos de mapeamento SAP nulos.

**Novo rótulo:** “Possível obstrução interna do trocador de calor sob investigação”.

A mudança é editorial; ID, referências, hipóteses diferenciais, regras e status permanecem. A restrição de passagem externa às aletas **não** comprova obstrução interna do núcleo; esta última depende de prova discriminante por teste aplicável OEM. A exceção P0 `cooling-radiator-blockage` permanece bloqueada por par dano/causa não permitido.

## 2. Expansão da ontologia por família funcional

Foram criados **dois bundles** a partir das regras PM já existentes, sem novos vínculos ao catálogo SAP:

| Regra PM | Condições hipotéticas | Ações propostas, não executadas | Dano diferencial não aprovado |
| --- | --- | --- | --- |
| `cooling-fan-bearing` | Ruído anormal no acionamento; folga/vibração suspeita de apoio | Identificar tipo de acionamento OEM; inspecionar apoio/ruído por procedimento aplicável | Possível comprometimento do apoio do ventilador |
| `cooling-fan-belt` | Alteração superficial de correia; suspeita de patinamento/tensão | Inspecionar correia e polias **quando existentes**; avaliar tensão e tensionador conforme especificação efetiva | Possível deterioração funcional da correia |

O ventilador pode ter **acionamento hidráulico** ou outra arquitetura **sem correia de acionamento**. Em algumas configurações, o apoio pode não conter rolamento separadamente reparável. Mesmo havendo ruído, vibração, patinamento ou temperatura elevada, esses sinais não comprovam o componente avariado.

**Proibido extrapolar** do exemplo de outro equipamento para a frota: presença de correia/rolamento, PN, posição, tensão, tolerância, periodicidade, arquitetura, modos de reparo e tipo de vedação precisam ser verificados em BOM/OMM/SIS efetivos por configuração e série.

## 3. Roteiro de discriminação proposto para Engenharia/PCM

1. Confirmar motor e arquitetura de acionamento do ventilador: correia, hidráulico, elétrico ou outra configuração efetiva.
2. Separar condições: ruído, vibração/folga, superfície da correia, transmissão/tensão e insuficiência de fluxo de ar. Cada fenômeno pode ter causas independentes.
3. Identificar componente específico no desenho/BOM e verificar se é reparável isoladamente; não inventar rolamento nem condenar correia por ruído genérico.
4. Obter procedimento OEM específico de inspeção e teste, respeitando proteção de pás, polias, superfícies quentes, acionamento automático e circuitos pressurizados.
5. Registrar observação e resultado somente se houver inspeção real, com identificação do equipamento, condição de ensaio, instrumento, limite e revisor independente em ambiente corporativo autorizado.
6. Manter hipóteses de dano em estado **não aprovado** e sem vínculo SAP até curadoria com evidência suficiente.

A geração de bundles **não cria notas, ordens, materiais, horas ou tarefas executadas**.

## 4. Fontes externas e limites de aplicação

- [Caterpillar — Cat Fan Drive V Belt Set](https://parts.cat.com/en/catcorp/product/7W-8137): descreve função de correia em acionamento de ventilador **para outras configurações**; não afirma que exista na frota TZ e **o PN do exemplo não é adotado**.
- [Caterpillar — 250-Hour Planned Maintenance](https://www.cat.com/en_US/blog/250-hour-planned-maintenance-cat-299d3.html): descreve inspeção geral de correia de motor, inclusive aplicação de OMM; o prazo de 250 h, o tensionamento e o processo de exemplo não devem ser transferidos aos equipamentos de mina.
- [Caterpillar — Reversing Fan](https://www.cat.com/en_US/articles/for-owners/cut-downtime-with-your-excavators-reversing-fan.html): confirma variantes com ventilador reversível, mas não especifica rolamento ou a arquitetura real por máquina.
- [SKF — Bearing damage analysis / ISO 15243](https://evolution.skf.com/us/bearing-damage-analysis-iso-15243-is-here-to-help-you/): fornece princípios de danos de rolamentos, não identifica peça nem falha no ventilador de uma máquina específica.

As referências foram cadastradas ou reaproveitadas com limitações explícitas. Nenhum documento OEM privado foi copiado ao repositório público.

## 5. Validação, cobertura e impacto

| Controle | Antes (1.3.43) | Depois (1.3.44) |
| --- | ---: | ---: |
| Regras PM totais | 25 | 25 |
| Regras com bundle | 9 | **11** |
| Regras ainda sem bundle | 16 | **14** |
| Condições semânticas | 20 | **24** |
| Ações semânticas | 19 | **23** |
| Hipóteses de dano | 9 | **11** |
| Bundles | 9 | **11** |
| Relações tipadas | 54 | **64** |
| Cenários sintéticos | 16 | **18** |
| Vínculos PM candidatos | 115 | **115** |
| Exceções PM bloqueadas | 10 | **10** |

O auditor `npm run pm:cooling:fan:audit` reconcilia a ontologia, os dois bundles, o rótulo do radiador, evidências aplicáveis, ausência de confirmações e 26 tentativas sintéticas de fabricar instalação/causa, limite, execução, código SAP ou inferência causal. O crosswalk transversal mantém seis condições/ações genéricas compartilhadas (combustível/hidráulico) e **zero danos compartilhados**; a fronteira IDLER/ROLLER da v1.3.42 permanece ativa.

**Contratos públicos e consumidores:** 24 cadeias FC/15 mecanismos ME, contrato/conteúdo públicos 1.0.0 e preview 1.3.12 não recebem o novo modelo automaticamente e devem ser verificados pelos testes de compatibilidade. A mera inclusão semântica não prova o sistema físico.

## 6. Próximas dependências

A família de ventiladores encontra-se **modelada conceitualmente, não efetivada**. O próximo passo em campo depende de arranjo, BOM e procedimento OEM por série, além de revisão independente de Engenharia e Dados Mestres antes de qualquer reparametrização de regra, aprovação de parte ou criação de nota real.
