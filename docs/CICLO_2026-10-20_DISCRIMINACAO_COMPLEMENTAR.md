# Ciclo FMEA v1.3.10 — Cruzamento de testes, circularidade SAP e piloto OEM

**Data editorial:** 20/10/2026  
**Escopo:** exclusivamente o banco público FMEA Database Mining. Não alterar qualquer jogo ou consumidor.  
**Maturidade:** inferências metodológicas documentadas; nenhuma ocorrência real, ensaio efetivo ou causalidade homologada.

## 1. Objetivo e método

A versão anterior havia estruturado seis testes P0 e identificado duas hipóteses concorrentes para cada um, com duas investigações complementares. Nesta versão, verificamos **a relação entre cada método complementar e cada hipótese específica**, sem supor que todo teste novo aumenta a certeza diagnóstica.

Fluxo modelado:

```text
Cadeia de falha
  → Teste P0 (método e sinal procurado)
    → Hipótese concorrente A
      → Complemento 1: o que sustenta / enfraquece / não resolve
      → Complemento 2: o que sustenta / enfraquece / não resolve
      → Lacuna residual explícita
    → Hipótese concorrente B
      → Complemento 1: o que sustenta / enfraquece / não resolve
      → Complemento 2: o que sustenta / enfraquece / não resolve
      → Lacuna residual explícita
```

A [matriz publicada](../data/quality/complementary-discrimination.v1.json) contém **12 hipóteses alternativas × 2 testes complementares = 24 avaliações técnicas**. Classificações qualitativas desta versão:

| Classe editorial | Quantidade | Critério interpretativo |
| --- | ---: | --- |
| `nao_discrimina` | **7** | Não separa a hipótese concorrente da principal nas condições descritas |
| `indicio_parcial` | **12** | Pode apoiar a investigação, mas outros mecanismos permanecem possíveis |
| `potencialmente_discriminante_condicional` | **5** | Pode ajudar a diferenciar alternativas **somente** com método/arranjo OEM e controle de variáveis |
| **Lacunas não resolvidas** | **12** | Uma por hipótese concorrente, até teste/evidência apropriados |

**Os números são contagens de pareceres técnicos autorais, não eficácia medida de testes, sensibilidade, especificidade ou taxas de falha.** Nenhuma hipótese alternativa foi rejeitada e nenhum teste ocorreu no campo.

## 2. Resultados por sistema

### Mangueiras hidráulicas — FC-HOSE-001

Roteamento, suporte, folga e histórico ajudam a caracterizar abrasão, mas não localizam necessariamente a origem de óleo na cobertura da mangueira. A hipótese de **óleo escorrido de conexão superior** permanece sem teste verdadeiramente discriminante entre os dois complementos originais. A lacuna foi documentada com necessidade de **inspeção segura da origem da trilha**.

**Fonte:** [Caterpillar — manutenção de conjuntos de mangueiras](https://www.cat.com/en_US/blog/inspect-cat-hydraulic-hose-assemblies.html). A inspeção é visual; não usar mãos/corpo para pesquisar fuga pressurizada. A documentação genérica não valida mangueira/terminal aplicável a CAT 395 ou 6030.

### Comandos finais — FC-FD-001

Morfologia de depósito em bujão e filtro pode apoiar tendência de desgaste, mas não identifica automaticamente rolamento/engrenagem nem discrimina com certeza contaminação externa de partículas produzidas por dano interno. Um teste de água aborda um possível ingresso, **mas não determina a origem de todas as partículas metálicas**. Registramos lacunas de histórico comparável e inspeção do conjunto, quando tecnicamente justificada.

**Fonte:** [Caterpillar — inspeção de bujões magnéticos](https://www.cat.com/en_US/blog/inspect-drive-train-magnetic-plugs.html). As classes genéricas do artigo **não são critérios de retirada de serviço homologados para toda configuração de 777**; conferir OMM e componente.

### Radiador — FC-COOL-001

Temperatura em tendência não comprova nível ou circulação; teste funcional de circuito, quando efetivo para a arquitetura, pode ajudar a separar restrição de circulação. O comportamento de ventilador demanda variável/canal específicos. Colmeia externamente obstruída pode coexistir com ventilação insuficiente ou problema de fluido.

**Fonte:** [Caterpillar — radiadores](https://www.cat.com/pt_BR/support/maintenance/self-service-options/radiator.html).

### Rolete de esteira — FC-TRACK-001

Vazamento/obstrução visível e CTS acrescentam informações diferentes. Nenhum deles identifica por si só dano interno em rolamento. Medição de tensão ou flecha do rodante **pode** revelar desajuste atual, mas não prova retrospectivamente a causa de um desgaste já ocorrido.

**Fonte:** [Caterpillar — rodante de trator](https://www.cat.com/en_US/articles/for-owners/dozer-undercarriage-maintenance.html).

### Fixação de sapata — FC-TRACK-005

Marcas, registro de montagem e eventual fragmento ajudam a separar soltura de fratura. Porém, **ausência de marca de rotação não demonstra que nunca ocorreu giro**. Histórico/torque residual não representam necessariamente a força de aperto originalmente aplicada. A ruptura por sobrecarga exige análise de fratura, não apenas ausência de fixador.

**Fonte:** [Nord-Lock — movimentos rotacionais](https://www.nord-lock.com/learnings/bolting-tips/2022/bolt-rotation/) e [Nord-Lock — assentamento e relaxação](https://www.nord-lock.com/learnings/customer-cases/2013/maintaining-a-tight-grip/).

### Bomba de arrefecimento — FC-COOL-007

Os complementos originais (tendência térmica e inspeção visual) **não são suficientes para discriminar termostato restritivo de bomba com deficiência funcional**. Esse é um achado de qualidade. A matriz exige um teste de regulação do termostato/bypass **distinto do teste de circulação da bomba**, conforme procedimento OEM. A hipótese de fluxo de ar restrito também deve ser analisada de maneira independente.

**Fonte:** [Caterpillar — bomba d'água](https://www.cat.com/pt_BR/support/maintenance/self-service-options/water-pump.html).

## 3. Circularidade entre dano e causa SAP

A [auditoria específica](../data/quality/circular-sap-causality.v1.json) preserva o par original:

```text
Tipo de objeto: TRAK
Componente: 0320
Dano: 01.15 = Afrouxado
Causa: C1.17 = Folga ou afrouxamento
```

**Esse par é permitido no catálogo, mas sua descrição é circular quando usada como explicação da causa raiz.** Não há alteração dos dados mestres nem proposta de código novo.

Duas cadeias físicas distintas continuam candidatas:
- `FC-TRACK-005`: autoafrouxamento **rotacional** do parafuso;
- `FC-TRACK-006`: perda de pré-carga por **assentamento, fluência ou relaxação**, sem rotação necessariamente demonstrada.

Os mecanismos exigem evidências diferentes. Registrar `01.15/C1.17` em uma nota não comprova qual deles ocorreu. Também não se conclui que ausência de rotação documentada equivale a assentamento.

## 4. Piloto de efetividade OEM para Caterpillar D9

O [registro do piloto](../data/quality/oem-pilot-readiness.v1.json) identifica oito cadeias relativas a material rodante, mas o estágio permanece:

**`bloqueado_sem_efetividade_documental`**

Para avançar, faltam:
1. Prefixo/série ou arranjo realmente aplicado;
2. OMM Caterpillar e sua revisão efetiva;
3. Componentes identificados por arranjo (parafuso, elo, sapata, rolete, roda-guia);
4. Critérios de fixação e eventual reutilização do elemento aplicáveis à junta real;
5. Tabelas/procedimentos CTS e limites por posição;
6. Confirmação da estrutura de local funcional SAP correspondente;
7. Parecer técnico independente de campo/oficina.

**Nenhum valor de torque, pré-carga, limite CTS ou código de peça foi inventado ou transferido de outro modelo.** Fontes públicas demonstram a função e riscos gerais, não homologam a configuração particular.

## 5. Novos controles automatizados

- [Validador cruzado](../scripts/validate-complementary-discrimination.mjs): exige 12 hipóteses, 24 avaliações, três classes interpretativas, todas as lacunas abertas, referências de métodos/hipóteses e ausência de resultados fabricados.
- [JSON Schema](../schemas/complementary-discrimination.schema.json): contrato versionado para as avaliações condicionais.
- Auditoria das duas relações SAP circulares: exige `confirmedSAPCause=null` e revisão ainda pendente.
- Piloto OEM: exige todas as entradas ausentes marcadas, sem fingir efetividade.
- `npm run differential:validate` integrado ao CI e ao relatório geral de qualidade.

Os controles verificam integridade de conhecimento e rigor metodológico, **não validam mecanicamente os seis diagnósticos ou seus impactos reais**.

## 6. Próxima prioridade — v1.3.11

- Revisar as **12 lacunas diagnósticas** e priorizar 3 procedimentos verdadeiramente discriminantes, que tenham literatura OEM efetiva;
- Reavaliar a classificação da causalidade do rodante SAP separando dano observado, mecanismo proposto, causa contribuinte e causa raiz;
- Avançar o piloto D9 apenas após fornecimento de serial/OMM, com revisão humana;
- Definir artefato público de exportação com campos `reviewStatus`, `sourceIds` e `applicability` para qualquer consumidor independente;
- Manter explícitas as **10 regras preventivas bloqueadas** e as **24 cadeias ainda sem homologação**.

Nenhum consumidor externo foi editado.
