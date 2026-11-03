# Ciclo v1.3.90 — Diagnóstico diferencial funcional de circuitos hidráulicos

**03/11/2026 · FMEA Database Mining · Engenharia/PCM · conhecimento conceitual, sem validação por ativo.**

## Motivação e mudança técnica

O ciclo v1.3.89 distinguiu falhas de mangueiras por local e mecanismo físico. A versão **v1.3.90** sobe um nível: o objeto não é mais uma mangueira isolada, mas a **cadeia funcional de alimentação → controle → distribuição → retenção → movimento/força → retorno → medição**, sob arquiteturas que podem variar significativamente de máquina para máquina.

A modelagem adiciona `10 padrões de comportamento de circuito` e `30 hipóteses concorrentes`, sem classificar nenhum diagnóstico como confirmado. Cada padrão contém perguntas de discriminação, evidências solicitáveis, fatores de confusão e limites de operação. O objetivo é **impedir a atribuição prematura de uma falha de sistema ao primeiro componente visível**.

### Mapa funcional genérico (não é circuito OEM)

`Reservatório/Alimentação → Bomba → Distribuição/Regulação → [Retenção, quando existir] → Atuador → Retorno/Resfriamento → Reservatório`

Comando/piloto e instrumentação atuam como ramos de controle/observação, conforme arquitetura. A grafia é **ilustrativa** e não afirma que a máquina tenha válvula de retenção, bomba única, determinado compensador, arquitetura de retorno ou conexão direta dos nós. Um grafo condicional com 8 nós e 10 arestas foi incorporado ao JSON.

## Matriz de padrões e distinções

| Ficha | Comportamento potencial | Alternativas físicas/funcionais |
| --- | --- | --- |
| `HC-DIFF-01` | Várias funções hidráulicas apresentam lentidão ou perda de desempenho em condições semelhantes | Rotação/controle de potência ou comando das bombas insuficiente / Abastecimento insuficiente, ar admitido ou restrição de sucção / Desvio de regulador, compensador ou válvula de alívio |
| `HC-DIFF-02` | Uma função de implemento apresenta ciclo lento enquanto outras aparentam responder normalmente | Comando proporcional/elemento de distribuição não fornece vazão esperada / Passagem interna no atuador ou fricção mecânica localizada / Restrição ou acoplamento inadequado em alimentação/retorno do ramo |
| `HC-DIFF-03` | Indicação de pressão inferior à referência esperada, sem comprovação da vazão efetiva | Controle de deslocamento ou capacidade volumétrica da bomba fora da condição / Válvula de alívio, compensação ou controle de pressão desviando vazão / Ponto, calibração, carga ou estado de controle incompatível com a referência |
| `HC-DIFF-04` | Pressão de alimentação aparentemente compatível, mas o implemento não desenvolve força suficiente | Perda de pressão entre ponto medido e câmara do atuador por regulação/distribuição / Fuga interna em pistão ou passagem interna no conjunto do atuador / Carga externa, geometria ou resistência mecânica fora da condição de referência |
| `HC-DIFF-05` | Implemento deriva ou desce em posição de espera, com comando nominalmente neutro | Vazamento interno pela vedação do pistão/cilindro / Válvula de retenção, contrabalanço ou sustentação de carga não retém / Passagem interna na válvula distribuidora ou retorno em outro ramo |
| `HC-DIFF-06` | Elevação de temperatura ou aquecimento anormal do óleo hidráulico | Recirculação de vazão em válvula de alívio ou perdas internas elevadas / Capacidade de resfriamento, fluxo de ar ou troca térmica insuficientes / Viscosidade/condição ou nível de fluido inadequado para regime |
| `HC-DIFF-07` | Ruído de bomba, vibração ou movimentos irregulares acompanhados de espuma/aeração aparente | Restrição de entrada ou nível insuficiente levando a cavitação possível / Entrada/arraste de ar e condição de reservatório / Desgaste de componente girante ou fixação com vibração |
| `HC-DIFF-08` | Atuador movimenta-se aos trancos, atrasa resposta ou oscila após comando | Pressão piloto, alimentação elétrica ou comando proporcional inconsistente / Carretel/elemento de válvula intermitente por contaminação ou travamento / Atrito estático, ar em câmaras ou desalinhamento do atuador |
| `HC-DIFF-09` | Movimento de extensão e retração apresentam respostas muito distintas | Áreas efetivas e carga diferentes nos dois sentidos / Válvula de retenção, regeneração ou controle de fluxo atua em apenas um sentido / Restrição/contrapressão assimétrica em retorno ou alimentação |
| `HC-DIFF-10` | Leitura de pressão no monitor diverge de indicação instrumental ou varia sem mudança de função | Transdutor, chicote, alimentação ou calibração incorretos / Pontos de medição representam ramificações, perdas ou fases distintas / Mudanças reais rápidas de pressão ou filtro/controle oscilante |

**Linhas de corte:**
- Pressão e vazão são grandezas diferentes. A leitura principal de pressão não certifica vazão útil ou pressão na câmara do atuador; baixa pressão não é automaticamente bomba defeituosa.
- Lentidão comum a várias funções sugere investigar suprimento compartilhado e controle, sem presumir uma única bomba ou rota.
- Lentidão em um ramo exige comparar comando, restrições de alimentação/retorno, condições mecânicas e fuga interna.
- Deriva requer avaliar vedação do pistão, válvula de sustentação (quando instalada), válvula distribuidora e condição de carga.
- Temperatura elevada, ruído, aeramento e alarme eletrônico **não identificam componente** sem medidas independentes.
- Diferença de velocidade nos sentidos de extensão/retração pode decorrer de áreas efetivas, montagem e condições normais de aplicação.

## Oito gates de documentação/aplicabilidade

- **TG-01:** Modelo, número de série e configuração do implemento documentados em ambiente autorizado? — `PENDING`
- **TG-02:** Esquema OEM distingue bombas, controladores, alimentação piloto, circuitos prioritários e possíveis fluxos paralelos? — `PENDING`
- **TG-03:** Válvulas de controle, retenção, anticavitação e sustentação de carga foram identificadas no circuito efetivo? — `PENDING`
- **TG-04:** Condições operacionais e de carregamento, temperatura e rotação exigidas pelo ensaio OEM foram confirmadas? — `PENDING`
- **TG-05:** Pontos de pressão/vazão e instrumentos calibrados são efetivos e autorizados para essa máquina? — `PENDING`
- **TG-06:** Estado dos intertravamentos, sinal de comando e diagnóstico eletrônico foi interpretado por software/ECM aplicável? — `PENDING`
- **TG-07:** Energia armazenada, movimento inesperado, zona de carga e resgate foram controlados por responsáveis habilitados? — `PENDING`
- **TG-08:** Contraprovas, rastreabilidade e revisão independente foram registradas no ambiente corporativo autorizado? — `PENDING`

**Regra de segurança:** testes com pressão, deriva, estol de implemento e medição em pontos de serviço devem ser definidos pelo OMM/SIS efetivo, por profissionais autorizados e com controle formal de cargas, energia armazenada e riscos. Nunca desconectar linhas pressurizadas, bloquear drenos ou provocar pressão máxima com base no JSON. A descrição de testes na bibliografia serve **para entender o diagnóstico, não para executar procedimentos fora da documentação do equipamento**.

## Fontes técnicas e efetividade

- [Caterpillar — Your Guide to Cat Hydraulics Technical Analysis Tests](https://www.cat.com/en_US/blog/cat-hydraulics-tests-hydraulic-system-inspection.html), fonte `CAT-HYD-TECHNICAL-ANALYSIS`. Aborda deriva, tempos de ciclo, pressão e condição de teste **em exemplo de escavadeira**, sem homologar parâmetros para outros modelos.
- [Parker Hannifin — Standard Telescopic Service Manual, Troubleshooting Hints](https://www.parker.com/content/dam/Parker-com/Literature/Mobile-Cylinder/hy18-0008-service.pdf), fonte `PARKER-CYL-DRIFT-SERVICE`. Em sua p. 30 distingue deriva por passagem no pistão, válvula de controle e retenção. Manual de cilindros telescópicos, não procedimento CAT.
- [Caterpillar — How to Inspect Your Cat Hydraulic System](https://www.cat.com/en_US/blog/hydraulic-system-inspection-steps.html), nova fonte `CAT-HYD-CIRCUIT-INSPECTION`. Inspeções gerais de fluido, bomba, mangueiras, válvulas, cilindros e retorno, sempre remetendo ao OMM.
- [Caterpillar — Cat Hydraulic Pumps and Motors](https://www.cat.com/en_US/support/maintenance/hydraulics/pumps-and-motors.html), fonte `CAT-HYD-PUMPS-MOTORS`. Contexto genérico de bombas/motores.
- [Caterpillar — How Do You Replace Cat Coreless Hydraulic Filters?](https://www.cat.com/en_US/blog/replace-cat-hydraulic-filters.html), fonte `CAT-HYD-OIL-CLEANLINESS`. Contexto genérico de controle de contaminação; nenhuma especificação de fluido ou troca de filtro validada por frota.

As fontes são públicas e usadas apenas como referências conceituais; não há transcrição integral nem reprodução de diagramas licenciados.

## Entregáveis versionados

- `data/quality/hydraulic-circuit-differential.v1.json`: 10 padrões, 30 hipóteses, 8 gates pendentes, 8 nós e 10 arestas condicionais.
- `schemas/hydraulic-circuit-differential.schema.json`: contrato de dados.
- `scripts/audit-hydraulic-circuit-differential.mjs`: validação de IDs, fontes, cruzamento com o vocabulário de cilindros, limites epistemológicos, bloqueios SAP e 18 ataques adversariais.
- `npm run pm:hydraulic:circuit:audit`: auditoria integrada a QA e ao GitHub Actions.
- README, changelog e roadmap atualizados.

**Sem alterações no FMEA de componentes, SAP, ontologia central, HTML offline existente ou repositórios consumidores.** Persistem 25 regras PM conceituais, 10 exceções PM×SAP em BLOCK e 8 gates privados NO_GO.

## Próxima ação aplicável fora do repositório

Em ambiente corporativo autorizado, escolher um **circuito e ativo reais**, obter o diagrama hidráulico OEM por série/BOM, estabelecer condições/referências de teste e registrar medições sob supervisão, com contraprova e revisão independente. A partir daí, poderá surgir evidência empírica; esta v1.3.90 **não produziu nenhuma**.
