# Ciclo v1.3.77 — Detectabilidade, atribuição indevida e inconclusão em inspeções PM

**28/10/2026 · Catálogo v1.3.77 · Análise conceitual sem validação de método no campo**

## Escopo e fonte

A v1.3.76 estruturou **15 regras sem prioridade documental** em 30 hipóteses alternativas abertas. Este ciclo revisa, para cada método de inspeção descrito nas regras de origem, a diferença entre observar um **sinal** e inferir uma **causa mecânica**.

A fonte é exclusivamente o cadastro público de **25 sementes preventivas** e as **15 fichas derivadas** da versão anterior. O relatório preserva literalmente os sintomas e métodos de inspeção dessas fontes. As ressalvas, confusores e limitações abaixo são **propostas de raciocínio de engenharia**, não transcrições de manual ou resultados de ensaio.

## Cinco perguntas que cada inspeção deve responder

1. **O que é realmente observável?** Sinal descrito sem qualificá-lo como dano confirmado.
2. **Que atribuição indevida é plausível?** O mesmo sinal pode decorrer de outro componente ou mecanismo.
3. **Qual variável de contexto influencia a interpretação?** Carga, temperatura, histórico, condição de amostragem, acesso, limpeza, geometria ou operação, conforme o caso.
4. **O que a inspeção pode deixar de detectar?** Ausência do sinal observável não é prova de saúde do componente.
5. **Quando a decisão obrigatoriamente permanece inconclusiva?** Quando a origem do sinal, a identificação do conjunto, a documentação OEM efetiva, a qualidade da medição ou a contraprova não forem suficientes.

Neste ciclo, `falsePositive` representa um **exemplo qualitativo de atribuição causal possivelmente equivocada**, não um falso positivo medido estatisticamente. `falseNegative` representa **possibilidade de não detecção**, não taxa de falso negativo validada. Nenhuma sensibilidade, especificidade, intervalo de confiança, incerteza metrológica ou taxa de detecção foi calculada.

## Exemplos de aplicação à manutenção

| Inspeção | Possível atribuição incorreta | Limite diagnóstico |
| --- | --- | --- |
| Bujão magnético/óleo do comando final | Interpretar partícula ferrosa como falha de engrenamento | Rolamentos e outros elementos podem gerar material; origem requer outras evidências |
| Ruído na região do ventilador | Atribuir todo ruído ao rolamento | Polia, tensionador, correia e propagação acústica podem interferir |
| Vazamento na bomba hidráulica | Atribuir fluido na carcaça à vedação da bomba | Fluido pode escoar de conexão superior; inspeção exige controle de energia |
| Desgaste de pneu OTR | Concluir causa somente pelo padrão da banda | Carga, pressão, temperatura, alinhamento e condições de operação podem se combinar |
| Disco de freio | Inferir desgaste uniforme por uma região observada | Geometria efetiva e condição em outras regiões podem divergir |

## Triagem de observações simuladas

Para cada uma das 15 regras, o auditor avalia três estados **inteiramente sintéticos**:

- `observed`: o sinal exige análise de hipóteses concorrentes e coleta qualificada, **não** confirmação de causa.
- `notObserved`: ausência do sinal **não exclui falha** ou dano latente.
- `ambiguous`: classificação **inconclusiva**, exigindo avaliação humana.

Assim, são **45 interpretações simuladas**, nenhuma ligada a uma máquina real. Entradas com tag de equipamento, identidade de signatário, estado não previsto ou campos extras são recusadas pela interface demonstrativa. O classificador não gera nota, ordem, código SAP, autorização ou orientação para testar equipamentos energizados.

## Fronteiras de execução

O catálogo público não autoriza ensaio ou inspeção invasiva. Qualquer verificação prática exige identificação de equipamento, série/arranjo, método aplicável e licenciado, controle de energias perigosas, pessoal qualificado, instrumento adequado, contexto de medição e autorização conforme procedimento corporativo.

Os alertas já definidos na v1.3.76 para pneus OTR, freios, acionamentos rotativos, hidráulica pressurizada, cilindros e conjuntos rodantes permanecem aplicáveis. Uma ficha conceitual **não pode atestar aptidão de operação**.

## Validação, resultados e continuidade

- `data/quality/pm-inspection-detectability-policy.v1.json`: 15 sinalizadores qualitativos, 15 armadilhas de atribuição, 15 contextos, 15 possibilidades de não detecção e 15 condições de inconclusão.
- `scripts/lib/pm-inspection-detectability.mjs`: compilação determinística com rastreio dos métodos e sintomas literais da v1.3.76; saída SEM estimativa de sensibilidade/especificidade.
- `scripts/audit-pm-inspection-detectability.mjs`: 45 estados simulados, verificações de entrada e testes adversariais, inclusive sobre falseamento de medidas, aprovação OEM, causa raiz, prioridade, SAP e liberação.
- `reports/pm-inspection-detectability.generated.json`: matriz pública regenerável durante CI.

Execute `npm run pm:inspection:detectability:audit`.

**Condições inalteradas:** 25 regras conceituais; 15 sem prioridade documental (não significa baixo risco); 10 exceções PM×SAP (5 P0 e 5 P1) bloqueadas; 8 gates de infraestrutura bloqueados; nenhuma medição ou causa raiz confirmada. Resultado final permitido: `NO_GO_METHODOLOGY_NOT_FIELD_VALIDATED`.

**Próxima oportunidade real:** construir uma ficha sintética de qualidade e rastreabilidade da medição para ajudar profissionais autorizados a avaliar, no ambiente privado, completude, efetividade OEM, contexto operacional e contraprova — sem introduzir medições reais neste repositório.
