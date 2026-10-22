# FMEA Database Mining — Ciclo v1.3.47: engrenagens do comando final

**21/10/2026 — modelo conceitual, não diagnóstico de campo.** Regras: `final-drive-gear` (nova representação) e `final-drive-bearing` (diferencial independente ainda sem bundle). Ontologia 1.3.12; catálogo 1.3.47.

## Sistema e função

O comando final recebe e transmite torque por um conjunto redutor mecânico. Engrenagens e rolamentos possuem superfícies, solicitações e mecanismos de falha distintos. A presença de ruído, vibração ou metais no óleo pode indicar investigação do sistema, **mas não localiza automaticamente o componente avariado**.

A regra `final-drive-gear` já existe como hipótese preventiva no catálogo: sistema `comando_final`, subgrupo `FID1`, componente genérico `Engrenagem`, par cadastral `02.01/C2.11`. Esses códigos não identificam a peça efetivamente instalada nem comprovam dano. `final-drive-bearing` permanece separada, com subgrupo `FID2`, sem bundle neste ciclo.

## Sete condições para investigação

| Condição não observada | Evidência necessária | Limite da interpretação |
| --- | --- | --- |
| Desgaste dos dentes | Perfil, distribuição e morfologia em engrenagem identificada | Sem inspeção direta não atribuir desgaste ao dente |
| Pitting/fadiga superficial | Cavidades e aparência da superfície, por inspeção OEM autorizada | Ruído ou partículas não confirmam pitting |
| Trinca/fratura de dente | Dente identificado e confirmação física do fragmento ou fissura | Limalha ou fragmento em bujão não define a origem |
| Partículas magnéticas | Bujão previsto pelo OEM, aspecto, contexto e tendência | Podem vir de engrenagens, rolamentos e outras peças |
| Anormalidade/contaminação do óleo | Laudo representativo, formulação e histórico de trocas | Aditivos de óleo novo podem modificar a referência analítica |
| Suspeita de lubrificação inadequada | Nível, óleo especificado, temperatura e condição de operação | Nível aparente ou viscosidade não demonstram colapso de filme |
| Ruído/vibração no comando final | Localização, condição de carga e análise diferencial | Não comprova dano específico de engrenagem |

**Nota de método:** a ISO 10825-1:2022 classifica a aparência de desgaste e dano em dentes; não define causas nem medidas preventivas. A norma não substitui investigação de Engenharia sobre carga, geometria, tratamento, montagem, lubrificação e evolução do dano.

## Hipóteses de dano, separadas dos sinais

O novo `BUNDLE-14` contém:
- `DMG-DRIVE-GEAR-TOOTH-WEAR-CANDIDATE` — desgaste de superfície de dente a confirmar;
- `DMG-DRIVE-GEAR-PITTING-CANDIDATE` — possível fadiga superficial/pitting;
- `DMG-DRIVE-GEAR-FRACTURE-CANDIDATE` — possível fratura/lascamento de dente.

Cada conceito possui `confirmed:false`, `reviewStatus:not_approved` e cinco campos SAP de mapeamento nulos. Nenhuma hipótese de dano é promovida pelo laudo de óleo, bujão magnético, ruído ou alteração de formulação.

## Ações propostas, não realizadas

- Verificar bujão magnético, **somente quando existir e tiver procedimento OEM aplicável**, com registro da aparência e tendência.
- Coletar amostra representativa **antes da troca do óleo** para manter evidência do estado anterior à intervenção; registrar compartimento, formulação e análise.
- Inspecionar nível e especificação de óleo por máquina/compartimento, sem importar classificação, viscosidade, volume ou periodicidade de outro redutor.
- Planejar avaliação de engrenagens, rolamentos e outras fontes de partículas, caso exista autorização de acesso e procedimento de desmontagem OEM.

A referência pública Caterpillar de classificação de bujões usa como exemplo uma carregadeira 962M. **Não se transferem classificações numéricas, valores de condenação ou decisão de continuidade para CAT 777, 980 ou escavadeiras sem verificar o OMM e a aplicabilidade efetiva.** Uma mudança previamente documentada de formulação do lubrificante, como transição Shell → Cat FDAO, pode alterar perfis analíticos de aditivos; confirmar a formulação antes de abrir nota de falha apenas por incompatibilidade química.

## Referências técnicas públicas e escopo

- [ISO 10825-1:2022 — Gears, wear and damage to gear teeth](https://www.iso.org/standard/78719.html): nomenclatura/identificação de aparência, não diagnóstico da causa.
- [Caterpillar — How to Inspect Cat Drive Train Magnetic Plugs](https://www.cat.com/en_US/blog/inspect-drive-train-magnetic-plugs.html): princípios de inspeção e registro de tendência, com exemplo de outra configuração.
- [Caterpillar — Drivetrain Repair Indicators and Best Practices](https://www.cat.com/en_US/blog/drivetrain-repairs-preventive-maintenance.html): ruído, contaminação, laudos S•O•S e possibilidades de falha concorrentes.
- [Caterpillar — How to Maintain Cat Drive Train Oil](https://www.cat.com/en_US/blog/maintain-drive-train-oil.html): óleo de trem de força, manutenção e necessidade de especificação por aplicação.

Os registros de fonte já constavam de `data/research/sources.v1.json`. Não foi copiado texto integral de norma ou manual proprietário para o repositório.

## Validação e fronteiras

| Indicador | v1.3.46 | v1.3.47 |
| --- | ---: | ---: |
| Regras PM | 25 | 25 |
| Bundles semânticos | 13 | **14** |
| Regras sem bundle | 12 | **11** |
| Condições | 32 | **39** |
| Ações | 28 | **32** |
| Danos candidatos | 14 | **17** |
| Relações tipadas | 80 | **94** |
| Cenários sintéticos | 22 | **24** |
| Vínculos PM candidatos | 115 | 115 |
| Exceções bloqueadas | 10 | 10 |

`npm run pm:drive:gear:audit` confere o escopo do comando final, a separação entre sinal genérico e dano físico, as condições não observadas, a identificação OEM, os dois cenários sintéticos e **36 mutações adversariais**. O relatório reproduzível é `reports/pm-final-drive-gear.generated.json`.

O núcleo público de **24 FC / 15 ME**, o contrato/conteúdo 1.0.0, o preview 1.3.12 e os consumidores não foram alterados. **Não houve medições, inspeções realizadas, aprovação de dano/causa SAP ou emissão de ordens de manutenção.**

## Próxima evidência exigida

Reunir, em ambiente corporativo restrito, desenho e BOM efetivos por máquina/série, compartimento e posições, configuração do redutor, histórico de amostragem, lubrificante e intervenção, tendência de partículas, morfologia dos elementos recuperados, procedimentos de acesso seguro e parecer independente sobre mecanismos concorrentes. Sem isso, o conteúdo permanece orientação de triagem técnica, não diagnóstico definitivo.
