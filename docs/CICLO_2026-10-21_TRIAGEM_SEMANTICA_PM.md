# Ciclo v1.3.39 — Triagem de condições sem fabricar falhas de componente

**Data:** 21/10/2026. **Objetivo:** usar a ontologia já existente para preparar a revisão humana de duas exceções PM × SAP: `cooling-radiator-blockage` e `fuel-tank-water`.

## Diagnóstico da lacuna

Essas regras têm bloqueio `damage_cause_not_permitted`: o par dano/causa definido na regra não é elegível para o componente do respectivo tipo de objeto. Isso **não significa que o fenômeno físico não possa ocorrer**. Significa que o banco não tem evidência suficiente para associar automaticamente aquele estado a um dano do componente catalogado.

O modelo `data/ontology/condition-action-damage.v1.json` (v1.3.7) já separa condição, tarefa e dano. **Não criamos novos conceitos, causas, peças ou atalhos SAP.** O ciclo criou uma exportação de triagem para revisão humana, usando as relações existentes.

## Quadro técnico — radiador

| Hipótese concorrente | Sinal/condição | Ação de investigação proposta, não executada | Restrição causal |
| --- | --- | --- | --- |
| Passagens de ar com sujidade externa | Depósitos nas aletas | Inspeção externa da colmeia e eventual limpeza conforme OEM | Depósito externo não é obstrução interna nem dano de núcleo comprovado |
| Restrição no circuito líquido | Suspeita de fluxo interno insuficiente | Teste de circulação/restrição conforme documentação efetiva | Exige separar bomba, termostato, sensor, fluido e restrição de passagem |
| Temperatura elevada sem causa localizada | Medição apenas hipotética acima do limite OEM | Confirmar referência térmica e inspecionar possíveis restrições | Superaquecimento não identifica sozinho componente ou mecanismo |

A [Caterpillar](https://www.cat.com/pt_BR/support/maintenance/self-service-options/radiator.html) recomenda inspeção de aletas e evita lavagem de alta pressão; orientação geral não define limite, frequência ou metodologia de teste para os ativos reais. Nenhum procedimento de campo está autorizado por este arquivo.

## Quadro técnico — água e sedimentos no combustível

| Hipótese concorrente | Sinal/condição | Ação de investigação proposta, não executada | Restrição causal |
| --- | --- | --- | --- |
| Água no combustível | Água na amostra ou separador, ainda não observada nesta base | Amostra representativa e eventual drenagem autorizada conforme OMM | Água encontrada não significa que o dreno deixou de funcionar |
| Sedimentos no combustível | Partículas/sedimentos suspeitos, não observados neste relatório | Coleta representativa, inspeção e tratativa apropriada | Origem pode ser abastecimento, sistema de armazenamento ou coleta; não atribuir ao dreno |

A [Caterpillar](https://www.cat.com/en_US/blog/check-filters-fluids-equipment.html) recomenda verificar o separador e drená-lo quando aplicável, mas o manual específico e o arranjo real prevalecem. Não definir intervalo universal, código de componente, instrumento, medição ou método invasivo a partir desta orientação.

## Como executar a revisão na Engenharia/PCM

1. Revisar os cinco caminhos propostos em `reports/pm-semantic-triage.generated.json`, reproduzido por `npm run pm:semantic:triage`.
2. Confirmar na documentação OEM efetiva (modelo/série/arranjo) que a inspeção ou teste é aplicável, seguro e programável.
3. Quando um sinal real existir, registrar separadamente **condição observada**, **atividade executada** e **resultado de teste**, com proveniência e datas no sistema restrito.
4. Só considerar dano e causa depois de evidência independente, discriminação de hipóteses concorrentes e revisão por Engenharia.
5. A mudança de código SAP, parâmetro de manutenção ou inclusão de componente exige decisão de curadoria — **a exportação não abre notas nem ordens de serviço**.

## Resultado esperado do validador

- 2 regras PM em revisão, **5 caminhos diferenciais** derivados das condições, ações e danos existentes;
- 16 ataques sobre o plano e 10 sobre o relatório devem ser rejeitados;
- **0** condições observadas, ações executadas, danos confirmados ou notas SAP criadas;
- 25 regras PM, 115 vínculos candidatos e 10 bloqueios inalterados;
- 24 cadeias FC e 15 mecanismos ME, contratos/preview públicos e consumidores inalterados.

A distinção entre condição e dano é a contribuição deste ciclo. Ele não apresenta evidência física ou homologação OEM e não encerra as duas exceções.
