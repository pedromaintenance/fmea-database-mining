# Ciclo FMEA 1.3.2 — Arrefecimento e material rodante
**Data:** 2026-10-20 · **Natureza:** pesquisa e modelagem autoral de mecanismos gerais · **Situação:** hipóteses documentadas, não ocorrências reais.

## Objetivo e delimitação

Ampliar o grafo causal de **8 para 16 cadeias** sem multiplicar combinações de código SAP. Foram adicionadas quatro cadeias de arrefecimento e quatro do material rodante, cada uma com **dois testes propostos** e hipóteses concorrentes. A arquitetura específica de cada CAT 395/6030/777/D9, a posição de componente, o número de peça, a tolerância e a efetividade por número de série **não foram verificados**.

### Hierarquia de evidência utilizada

| Status | O que sustenta | O que não sustenta |
| --- | --- | --- |
| OEM genérico CAT | Existência de mecanismos de obstrução, vazamento, falta de fluxo, desgaste e tensão incorreta | Uma falha real na frota e limites de inspeção de 6030, 395 ou D9 |
| Registro de preventiva já normalizado | A intenção de detectar determinada condição em sistema/local candidato | Dano detectado, gravidade, cumprimento da tarefa ou resultado medido |
| Nova cadeia autoral | Hipóteses fisicamente plausíveis e sugestões de teste/contraprova | Aplicabilidade OEM validada, frequência de falha ou causa raiz |
| Laudos e literatura por serial (pendente) | Futuramente poderão validar existência/efetividade de componente e procedimento | Não estão presentes nesse ciclo |

## Fontes Caterpillar consultadas

1. [Substituição de radiador — dicas de manutenção](https://www.cat.com/pt_BR/support/maintenance/self-service-options/radiator.html): inspeção de aletas, limpeza, mangueiras, tampa, contaminação e sinais de superaquecimento.
2. [Lista de verificação de escavadeiras](https://www.cat.com/en_US/articles/ci-articles/your-six-step-excavator-maintenance-checklist.html): fluxo de ar, nível, limpeza e vazamento; ventilador reversível **somente quando configurado**.
3. [Prevenção de dano térmico em motores](https://www.cat.com/en_US/articles/IRF-Resource-Center/truck-engine-repair-tips-stop-heat-damage-irf.html): ventilador, bomba, termorregulador e mangueiras; **aplicação originalmente rodoviária**, não é uma especificação de equipamento de mina.
4. [Ventilador reversível de escavadeiras](https://www.cat.com/en_US/articles/for-owners/cut-downtime-with-your-excavators-reversing-fan.html): o sentido reverso pode remover detritos em máquinas equipadas; não comprova que toda escavadeira possui o recurso.
5. [Dozer Undercarriage Maintenance](https://www.cat.com/en_US/articles/for-owners/dozer-undercarriage-maintenance.html): inspeção de roletes, rodas-guia, fixadores, detritos e tensão da esteira.
6. [How to Maintain Cat Steel Tracks](https://www.cat.com/en_US/blog/maintain-cat-steel-tracks.html): desgaste acelerado com esteiras tensionadas em excesso e risco de perda de guiamento com tensão insuficiente; medição segundo OMM.
7. [Custom Track Service e relatórios de desgaste](https://www.cat.com/en_US/blog/undercarriage-care-cat-dealer-programs.html): medição e tendência, não identificação automática de causa raiz.
8. [How to Check Dozer Track Tension](https://www.cat.com/en_US/articles/for-owners/how-to-check-dozer-track-tension.html/): orientações gerais e obrigação de conferir OMM para arranjo e valores. **Não transportar direção/sentido de ajuste ou critérios de outros modelos** para D9/395/6030.

Fontes indexadas em [data/research/sources.v1.json](../data/research/sources.v1.json), com ressalvas por referência.

## Cadeias adicionadas

| Código | Falha funcional / modo candidato | Alternativas que devem ser discriminadas | Métodos planejados |
| --- | --- | --- | --- |
| FC-COOL-001 | Troca térmica insuficiente por obstrução externa da colmeia | Perda de fluido / ventilação inadequada | Inspeção visual; histórico de temperatura e carga |
| FC-COOL-002 | Perda de estanqueidade no circuito de arrefecimento | Vazamento em radiador/bomba / variação de nível sem fuga comprovada | Inspeção segura a frio; histórico |
| FC-COOL-003 | Ventilação abaixo do requerido por falha de acionamento | Restrição da colmeia / circulação inadequada | Exame do acionamento efetivo; tendência de demanda/resposta |
| FC-COOL-004 | Restrição interna do núcleo do radiador | Restrição de ar / bomba ou termorregulador | Condição do fluido; avaliação funcional OEM |
| FC-TRACK-001 | Rolete com rotação restringida por detritos | Falha interna / tensão inadequada | Inspeção de acúmulos; termometria comparativa sem contato |
| FC-TRACK-002 | Rolete com possível vazamento de vedação | Óleo de origem externa / impedimento por detritos | Identificação visual da origem; temperatura comparativa |
| FC-TRACK-003 | Guiamento/desgaste anormal da roda-guia | Tensionamento incorreto / rolete adjacente anormal | Inspeção; medição geométrica/CTS |
| FC-TRACK-004 | Tensão de esteira fora do requisito | Falha de rolete / desalinhamento de roda-guia | Medição específica de flecha/tensão; padrões de contato |

**Atenção à relação com preventiva:** em `FC-TRACK-004` as regras de rolete/roda-guia são **inspeções de contexto**, não um procedimento homologado de tensionamento. O campo `preventionAssociation=monitoramento_contextual_nao_alvo_exclusivo_de_ajuste` documenta essa diferença. A eventual criação de tarefa de ajuste exige OMM e cadastro funcional.

## Refinamentos mecânicos importantes

**Superaquecimento é efeito, não diagnóstico de radiador.** Para separar as hipóteses, deve-se conhecer fluxo de ar, condição de colmeia, líquido arrefecedor, ventilação e regulação térmica. Falha de leitura eletrônica pode competir com defeito real do sistema; nenhuma temperatura de alarme foi inventada.

**Fuga externa não identifica o ponto de origem.** A trilha de líquido pode ser transportada pela gravidade; inspecionar com motor frio, isolamento e procedimento efetivo. Tampas quentes e sistemas pressurizados não devem ser abertos.

**Rolete quente não prova desgaste interno.** Um rolete pode estar retido por detritos ou apresentar falha de vedação/rolamento. Temperatura depende de carga, tempo decorrido, ambiente, ponto de medição e emissividade; evitar tocar componentes quentes como método de diagnóstico.

**CTS quantifica desgaste sob um procedimento específico.** A medida não fornece automaticamente a causa do desgaste; variáveis como terreno, alinhamento, posição, horas e tensão interferem.

**Não transportar especificações.** Documentos gerais de D4, escavadeiras pequenas ou motores rodoviários ilustram mecanismos, mas não substituem dados de D9/6030/395. O banco mantém `sapMapping` integralmente nulo até confirmação independente.

## Arquivos, validação e revisão

- [data/knowledge/causal-chains.v1.json](../data/knowledge/causal-chains.v1.json): **16** cadeias, **4** famílias, **32** investigações, **0** causas raiz confirmadas.
- `scripts/validate-causal-chains.mjs`: verifica existência de conceitos, regras PM por sistema, origem das afirmações, hipóteses alternativas e três interpretações por teste.
- `scripts/audit-quality.mjs`: reporta cobertura por família, sem confundir combinações possíveis com ocorrências de falha.
- `docs/ROADMAP.md`: inclui conclusão deste ciclo e fila seguinte.
- `CHANGELOG.md`: registra alterações e preservação da semântica v1.

### Próximo ponto de pesquisa

Prosseguir com **afrouxamento/ruptura de fixadores de esteira**, geometria e vedação de rodas-guia, bem como falhas de **circulação do líquido arrefecedor** em configurações específicas, **apenas** após localizar documentos OEM efetivos e revisar o modelo de localização SAP.

Nenhuma alteração no jogo ou em consumidores foi realizada.
