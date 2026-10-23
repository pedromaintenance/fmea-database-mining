# FMEA Database Mining — Ciclo v1.3.50: cilindros de implementos

**22/10/2026 · Ontologia 1.3.15 · Catálogo 1.3.50.** Modelagem de `implement-cylinder` em caráter de hipótese. A regra já existe no catálogo preventivo, com sistema `implementos`, subgrupo `CYL1`, componente genérico `Vedação`, par cadastral `03.01/C2.13` e modelos `EQ03/EQ02/CAT980/EQ07`. Esse cadastro **não confirma componente instalado, falha de vedação ou causa por máquina**.

## 1. Função e interpretação do sintoma

O cilindro converte energia hidráulica em movimento/força linear, enquanto válvulas, retenções, bombas e controles definem condições de alimentação e sustentação da carga. Portanto, **deriva da haste ou do implemento não equivale automaticamente a fuga interna pelo pistão**. As perdas podem ocorrer no pistão, nas vias das válvulas de comando ou retenção e em outros componentes específicos do circuito. Baixa força ou lentidão podem decorrer também de pressão ou vazão insuficiente. Fuga externa na região do cilindro pode vir de conexões, mangueiras ou fluido migrado.

## 2. Oito condições técnicas distintas

| Condição não observada | Interpretação e verificação necessária | Risco de conclusão indevida |
| --- | --- | --- |
| Fuga externa aparente | Identificar origem na vedação da haste, cabeçote, conexões ou mangueiras | Óleo próximo não confirma falha da vedação |
| Passagem interna suspeita pelo pistão | Diferenciar vazamento no pistão de fuga em válvulas por teste OEM seguro | Drift ou baixa força não comprovam bypass |
| Deriva não comandada | Registrar posição, carga e condição de retenção dentro de procedimento OEM | Não atribuir ao cilindro sem excluir válvulas, retenção e makeup |
| Baixa força ou velocidade | Confrontar carga, comando, pressão, vazão e temperatura em condição efetiva | Bomba, válvula e alimentação são alternativas |
| Dano superficial de haste | Examinar riscos, cromagem, corrosão e contato com guias/raspador | Marca externa não confirma passagem no pistão |
| Desalinhamento ou carga lateral | Verificar articulações, buchas, pinos, fixações e geometria | Possível efeito de montagem ou estrutura, sem causa identificada |
| Vazamento concorrente em válvula | Avaliar direção, retenção, alívio e outras vias, conforme esquema | Problema de válvula não é dano físico do cilindro |
| Pressão ou vazão insuficiente | Testar pontos e limites específicos com procedimento OEM autorizado | Leitura sistêmica não condena atuador automaticamente |

`BUNDLE-17` possui 8 registros `COND-IMPL-*`, todos `condition_hypothesis_not_observed`, com `observedValue:null` e `observedAt:null`. Nenhuma das condições constitui observação de campo.

## 3. Hipóteses de dano e mecanismos físicos

- `DMG-IMPL-ROD-SEAL-CANDIDATE` — possível comprometimento da vedação de haste, exigindo origem localizada da fuga e exame da haste/cabeçote.
- `DMG-IMPL-PISTON-SEAL-CANDIDATE` — possível perda de estanqueidade do pistão, a distinguir de fuga por válvula, retenção ou outras vias do circuito.
- `DMG-IMPL-ROD-BARREL-CANDIDATE` — possível dano físico à haste ou tubo, a verificar por inspeção dimensional, condição superficial e arquitetura OEM.

Todos permanecem com `confirmed:false`, `reviewStatus:not_approved` e cinco campos de mapeamento SAP nulos. **A condição da válvula é uma causa diferencial externa ao cilindro, não uma quarta confirmação de dano na vedação.**

## 4. Ações propostas, não executadas

As cinco ações semânticas propostas são: identificar cilindro e circuito por número de série; inspecionar origem de fuga externa; caracterizar deriva sob condições seguras de teste OEM; avaliar pressão/vazão e válvulas nos pontos adequados; e investigar passagem pelo pistão **após** discriminação das demais causas.

**Restrições operacionais:** não executar ensaio de deriva com carga sem contenção positiva; não confiar na pressão hidráulica para sustentar implemento; não introduzir mãos/corpo em zona de esmagamento; não procurar fuga de alta pressão com a mão; **não desconectar tubulação pressurizada ou sustentando carga para procurar bypass**, mesmo que um manual de outro fabricante descreva tal método. São obrigatórios controle de energia armazenada, bloqueio, sustentação física, procedimento OEM efetivo e análise de risco. Possível lesão por injeção de fluido requer atendimento médico imediato.

## 5. Literatura técnica e limites de aplicação

- [Parker — Hydraulic Cylinder Service Manual, Troubleshooting Hints](https://www.parker.com/content/dam/Parker-com/Literature/Mobile-Cylinder/hy18-0008-service.pdf): distingue drift por válvulas, vedação do pistão, vedações estáticas e problemas de haste. É um documento de outras famílias de cilindros; **não autoriza importar teste com tubulação desconectada, limite de vazamento ou procedimento de montagem para equipamentos CAT**.
- [Caterpillar — Your Guide to Cat Hydraulics Technical Analysis Tests](https://www.cat.com/en_US/blog/cat-hydraulics-tests-hydraulic-system-inspection.html): princípios de teste hidráulico e avaliação de desempenho; pontos, condições, limiares e métodos precisam de documento OEM por modelo/série.
- [Caterpillar — Hydraulic System Troubleshooting (exemplo de D7R, hospedagem não oficial)](https://epccat.com/doc-t6/70526-hydraulic-system-troubleshooting-d7r-series-ii-track-type-tractor-hydraulic-system/): comparação ilustrativa com válvula, pistão, retenção e makeup como causas concorrentes. Não substituir o SIS/OMM oficial do equipamento efetivo.

A referência pública Parker foi registrada em `data/research/sources.v1.json` com limitação explícita; fonte CAT preexistente foi reutilizada. Nenhum manual proprietário ou dado corporativo foi reproduzido no repositório público.

## 6. Evolução e controles de auditoria

| Indicador | v1.3.49 | v1.3.50 |
| --- | ---: | ---: |
| Regras PM | 25 | 25 |
| Bundles semânticos | 16 | **17** |
| Regras PM sem bundle | 9 | **8** |
| Condições | 50 | **58** |
| Ações | 39 | **44** |
| Danos diferenciais | 23 | **26** |
| Relações tipadas | 123 | **139** |
| Casos sintéticos | 28 | **30** |
| Vínculos PM candidatos | 115 | 115 |
| Exceções PM bloqueadas | 10 | 10 |

O auditor `npm run pm:implement:cylinder:audit` examina a segregação de oito condições, cinco ações, três danos e 16 relações, e tenta **32 mutações adversariais** (20 de ontologia, 8 da matriz e 4 dos cenários sintéticos). O artefato de CI é `reports/pm-implement-cylinder.generated.json`. Os cenários SEM-29 e SEM-30 representam situações hipotéticas; seus campos `performedActionIds` são parte da simulação e **não correspondem a execução de trabalho**.

Permanecem inalterados os 115 vínculos PM candidatos, dez exceções bloqueadas, 24 cadeias FMEA e 15 mecanismos, contrato/conteúdo público 1.0.0, preview 1.3.12 e consumidores. Nenhum código de dano/causa foi automaticamente aprovado.

## 7. Evidências necessárias para execução real

Obter em ambiente corporativo o esquema hidráulico, BOM e identificação por máquina/série, a arquitetura de retenção de carga, metodologia e limites de deriva, condições de pressão/vazão, avaliação de válvulas e controle de cargas. Só então estruturar testes e notas de manutenção reais com riscos, ferramentas e responsabilidades de execução. **Esta modelagem não é procedimento de teste nem liberação operacional.**
