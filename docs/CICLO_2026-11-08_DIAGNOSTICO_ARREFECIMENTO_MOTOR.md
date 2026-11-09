# Ciclo 1.4.15 — Sobreaquecimento de motor diesel: fluxo de ar, coolant e controle térmico

**08/11/2026 · Síntese bibliográfica de engenharia mecânica · Nenhum ensaio em máquina · Anexo posterior ao piloto congelado 1.4.11**

## 1. Função material do sistema

Um motor diesel converte parte da energia do combustível em calor que precisa ser removido para manter sua condição térmica na faixa **específica do projeto OEM**. Para motores de arrefecimento líquido, é necessário distinguir pelo menos quatro funções materiais:

1. **Geração de calor** no regime de operação do motor: carga, ambiente e tempo influenciam a demanda térmica;
2. **Transporte de calor** por refrigerante, bomba, passagens, níveis de fluido e possíveis válvulas;
3. **Rejeição de calor** por radiador/trocadores, ventilação, aletas, shroud e condições ambientais;
4. **Regulação e observação** por termostato, bypass, sensores e comandos de ventilação.

Em termos qualitativos, o calor gerado é balanceado pelo calor removido e pela variação de energia térmica armazenada. Essa relação **não permite calcular vazão ou limite térmico sem geometria, propriedades e medições por configuração**.

Uma temperatura elevada é um **efeito observado**, não o nome de uma causa. Trocar bomba, termostato ou radiador sem distinguir transporte, rejeição e controle pode deixar intacto o mecanismo predominante.

## 2. Evidência de fabricantes e limites

Foram adicionadas **sete referências primárias** à bibliografia, passando de 107 a **114 fontes catalogadas**. Somente os sete links abaixo foram examinados especificamente para este ciclo; não há alegação de revisão integral das 114 referências.

- **Caterpillar — [Termostato, circulação e bypass](https://www.cat.com/pt_BR/support/maintenance/self-service-options/thermostat.html).** Explica o encaminhamento do coolant pelo regulador e adverte que, em seus projetos descritos, remover o termostato pode deixar o desvio da bomba aberto e **agravar o sobreaquecimento**. Não extrapolar para outra geometria.
- **Caterpillar — [Radiador](https://www.cat.com/pt_BR/support/maintenance/self-service-options/radiator.html).** Relaciona aletas, vazamentos, contaminação e corrosão à função do conjunto e remete ao manual OEM. Não afirma que sujeira ou líquido contaminado seja a causa de um caso real.
- **Caterpillar — [Bomba d'água](https://www.cat.com/en_US/support/maintenance/self-service-options/water-pump.html).** Identifica circulação do coolant e indícios genéricos como temperatura e vazamento. Não comprova falha da bomba por alarme térmico.
- **Caterpillar — [Truck Engine Repair Tips](https://www.cat.com/en_US/articles/IRF-Resource-Center/truck-engine-repair-tips-stop-heat-damage-irf.html).** Apresenta ventilador/acoplamento, reguladores, bomba, mangueiras e trocadores como mecanismos concorrentes. É texto técnico de aplicação genérica a caminhões, não procedimento de mineração por série.
- **Caterpillar — [Heat Prevention](https://www.cat.com/en_US/articles/cat-truck-engine-articles/prevent-cat-truck-engine-failures-this-summer.html).** Diferencia bloqueio das aletas, correias, mangueiras, regulador e direcionamento do ar por shroud. Remover o shroud não é um paliativo técnico.
- **Perkins — [Cooling Systems](https://www.perkins.com/en_GB/aftermarket/maintenance/product-offering/cooling-systems.html).** Descreve a combinação de radiador, ventilador, termostato e bomba, observando que o sistema pode ser especificado pelo fabricante do equipamento, não apenas pelo fabricante do motor.
- **Perkins — [Thermostats Help Keep You Cool](https://www.perkins.com/en_GB/aftermarket/maintenance/product-offering/cooling-systems/thermostats.html).** Explica regulagem de temperatura e efeito do bypass, além do risco de termostato não efetivo. Não transferir o arranjo hidráulico a outro motor.

**Alerta de segurança:** ensaios de pressurização de sistema, fluxo de refrigerante e comando de ventilador mencionados em literatura geral são **exemplos de métodos que podem existir** — não instruções autorizadas por este dossiê. O procedimento OEM efetivo, isolamento de energias e gerenciamento de risco são obrigatórios. Não abrir tampa, mangueira ou qualquer parte com sistema quente/pressurizado.

## 3. Hipóteses concorrentes e fronteiras de inferência

| ID | Mecanismo hipotético | Evidência documental a buscar | Não concluir |
| --- | --- | --- | --- |
| CL-AIR-FINS | Obstrução de aletas, passagem de ar ou shroud | Condição de radiador e dutos; correlação com regime e ventilação | Indicação quente = radiador sujo |
| CL-HEAT-CORE | Depósito, corrosão ou restrição interna no radiador/trocador | Histórico de coolant, arquitetura e evidência da troca de calor | Coolant turvo = núcleo obstruído |
| CL-FAN-DRIVE | Ventilador, acionamento ou controle com fluxo insuficiente | Tipo de acionamento, comandos e indícios comparáveis | Ventilador girando = vazão adequada |
| CL-THERMOSTAT | Regulador ou bypass não efetivo | Esquema e PN OEM; histórico de montagem e sintomas | Remover termostato é teste/paliativo válido |
| CL-WATER-PUMP | Perda de circulação por bomba ou acionamento | Esquema OEM, condições e sinais adicionais | Sobreaqueceu = bomba falhou |
| CL-LOW-LEVEL-LEAK | Perda de volume/estanqueidade | Histórico de nível, complementos, vazamentos e tampa | Baixa de coolant indica a peça que vazou |
| CL-AIRLOCK | Ar aprisionado após intervenção | Histórico de serviço e procedimento OEM de enchimento/ventilação | Necessidade de sangria comprovada por alarme |
| CL-SENSOR-SIGNAL | Indicação/sinal elétrico divergente | Desenho elétrico, sensor e DTC, corroboração independente | Suspeita do sensor autoriza ignorar alarme |
| CL-LOAD-AMBIENT | Demanda térmica e ambiente adversos | Carga, temperatura ambiente, ventilação, ciclo e dimensionamento | Carga elevada explica e libera qualquer anomalia |
| CL-COOLANT-CHEMISTRY | Mistura, contaminantes, degradação química | Fluido de base, coletas, compatibilidade e histórico | Formulação diferente comprova falha do radiador |

Todas são **UNCONFIRMED**, sem probabilidades, valores de pressão, pontos de teste, PN ou mecanismo confirmado por observação de campo.

## 4. Oito situações de investigação, não de diagnóstico

O [explorador térmico standalone](https://pedromaintenance.github.io/fmea-database-mining/diagnostico-arrefecimento-motor.html) contempla:

1. Temperatura sobe sob carga;
2. Anomalia após intervenção no coolant;
3. Aquecimento em baixa velocidade/baixa ventilação;
4. Operação sem termostato ou com regulador não identificado;
5. Perda de fluido;
6. Indicação térmica divergente;
7. Baixa temperatura ou oscilação;
8. Refrigerante suspeito ou perda de troca térmica.

Cada cenário inclui **pelo menos três explicações concorrentes**, evidência que falta, erro de inferência e referências que amparam a discussão. A seleção altera somente a apresentação, não executa motor de diagnóstico.

## 5. Tradução para Engenharia de Manutenção e PCM

**Descrição técnica de sintoma — exemplo genérico:**

> Indicação de temperatura de motor fora do comportamento esperado, sem confirmação da confiabilidade da leitura ou do mecanismo térmico. Obter evidências comparáveis de operação, condição do coolant e arquitetura do sistema antes de atribuir a anomalia a um componente.

**Escopo inicial de investigação:**

- Identificar motor, série e arranjo térmico no sistema corporativo autorizado, incluindo radiadores, trocadores, ventilador, bomba, termostato, bypass e sensores, quando aplicáveis;
- Preservar histórico de temperatura, condições de carga, ambiente, nível, qualidade do coolant, manutenções e códigos relacionados, considerando integridade da medição;
- Diferenciar hipóteses de **baixo fluxo do ar**, **baixo transporte de fluido**, **controle/bypass**, **condição química**, **instrumentação** e **demanda térmica**;
- Solicitar literatura OEM efetiva e planejamento de métodos de investigação **apenas por equipe habilitada**, após análise de risco e autorização interna.

**Disciplina:** Engenharia mecânica/motores, arrefecimento, elétrica/automação para controle/sensores, lubrificação para qualidade do fluido e PCM para delimitação e cronograma.

**Efeito e risco de postergação:** uma falha real de rejeição de calor pode provocar degradação térmica e danos no motor, enquanto baixo nível de líquido pode, conforme instalação, prejudicar até a confiabilidade da indicação. O dossiê não estima severidade ou probabilidade por máquina e **não autoriza continuar operando para investigar**.

**Ações proibidas neste recurso:** abrir circuito quente, remover termostato, retirar guarda/shroud, forçar comando de ventilador, escolher coolant/PN por similaridade, executar ensaio de pressão/vazão, abrir OS SAP automática ou liberar motor.

## 6. Relação com o dossiê anterior

Sobreaquecimento e baixo nível de coolant podem coexistir com indícios de contaminação por óleo, mas **não demonstram mistura entre circuitos**. A pesquisa anterior de [óleo × arrefecimento](contaminacao-oleo-arrefecimento.html) e sua [matriz documental](matriz-evidencias-oleo-arrefecimento.html) continuam distintas.

Os arquivos técnicos travados em \`data/quality/pilot-frozen-baseline.v1.json\` (motor lexical, dez fichas e grafo) foram preservados. Este anexo da versão 1.4.15 **não faz parte do corpus de recuperação do piloto cego 1.4.11**.

## 7. Artefatos, segurança e encaminhamento

- \`data/knowledge/engine-cooling-thermal-differential.v1.json\`: mapa conceitual, dez mecanismos, oito contextos, exigências documentais, referências e limites;
- \`scripts/lib/engine-cooling-thermal-contract.mjs\`: validação reutilizável de autoridade, fontes, cardinalidade e relações;
- \`docs/diagnostico-arrefecimento-motor.html\`: visualização estática/standalone, sem armazenamento persistente ou transmissão de dados;
- \`scripts/build-engine-cooling-thermal.mjs\`: gera HTML e JSON público somente após validar contrato;
- \`scripts/audit-engine-cooling-thermal.mjs\`: fonte, segurança, grafo congelado, HTML e **22 alterações deliberadamente inválidas** testadas contra o mesmo contrato;
- \`data/research/sources.v1.json\`, \`data/catalog/source-discovery.v1.json\`, \`docs/fontes-tecnicas.html\`: bibliografia atualizada;
- Índice curado e pipelines de publicação atualizados.

**Estado:** zero motores e séries identificados; zero procedimentos OEM efetivos homologados; zero ensaios, medições e falhas confirmadas; zero ordens SAP e liberação.

**Próximo passo material:** revisão técnica humana por especialista em arrefecimento e, quando houver um motor real sob autorização, recuperar topologia e procedimentos OEM por série, confrontando observações térmicas e alternativas antes de delimitar uma intervenção. Até lá, o resultado é conhecimento pesquisável, não diagnóstico.
