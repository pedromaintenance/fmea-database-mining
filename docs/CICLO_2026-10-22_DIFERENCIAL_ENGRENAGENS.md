# FMEA Database Mining — Ciclo v1.3.49: geometria e danos no diferencial

**22/10/2026 · Ontologia 1.3.14 · Catálogo 1.3.49.** Expansão conceitual da regra preventiva `differential-gear` (sistema `diferencial`, subgrupo `DIFF`), sem prova de componentes efetivamente instalados, medições reais ou ajustes autorizados em CAT 777 ou CAT 980.

## Função do sistema e delimitação

O diferencial recebe e transmite torque por elementos de engrenamento e apoios, conforme a arquitetura do eixo. Em conjuntos que empregam **coroa e pinhão**, a posição relativa das peças, a folga de engrenamento (*backlash*), o padrão de contato dos dentes e a condição dos rolamentos influenciam a distribuição de carga. **São grandezas e fenômenos distintos.** Mesmo uma medição fora de limite especificado não determina sozinha desgaste físico confirmado ou causa raiz.

## Sete condições, sem observações de campo

| Condição investigada | O que precisa ser confirmado | O que não é possível inferir |
| --- | --- | --- |
| Desgaste em dentes de coroa/pinhão | Dente físico, morfologia, contato e posição por inspeção autorizada | Metais no óleo não identificam a engrenagem |
| Pitting/fadiga superficial | Cavidades e superfície conforme classificação ISO 10825-1 | Aspecto do dente não define automaticamente a causa |
| Padrão de contato suspeito | Referência OEM, condição de carga e sequência de avaliação | Contato fora do padrão de exemplo não prova fratura ou montagem incorreta |
| Backlash suspeito | Indicador, referência, localização e procedimento OEM específicos | Backlash não é pré-carga de rolamento |
| Apoio/pré-carga suspeitos | Tipo de rolamento, montagem, ajuste e medição específica OEM | Pré-carga fora de critério não confirma pista ou corpo rolante danificado |
| Anormalidade de óleo/detritos | Amostragem representativa e tendência, antes da intervenção | Metais e aditivos não localizam coroa, pinhão ou rolamento |
| Ruído/vibração com carga | Condição de teste, origem no eixo e alternativas externas | Ruído não comprova desgaste, pitting ou folga anormal |

`BUNDLE-16` representa essas condições por **sete IDs `COND-DIFF-*`**, com `observedValue:null`, sem registro de máquina ou inspeção. As quatro ações propostas são: identificar configuração OEM, avaliar folga/padrão de contato, avaliar suporte/pré-carga e coletar amostra do diferencial antes de eventual troca. Todas permanecem **not_performed** e sem intervalo de manutenção atribuído.

## Três danos diferenciais não aprovados

- `DMG-DIFF-GEAR-WEAR-CANDIDATE`: desgaste físico de dentes da coroa ou pinhão.
- `DMG-DIFF-GEAR-PITTING-CANDIDATE`: pitting ou fadiga superficial em engrenagem do diferencial.
- `DMG-DIFF-SUPPORT-BEARING-CANDIDATE`: dano físico em rolamento de apoio, **separado** de simples alteração de pré-carga.

Todos permanecem `confirmed:false`, `not_approved` e com mapeamentos de modelo, posição, componente, dano e causa SAP nulos. A regra preventiva preexistente **não** vira confirmação de dano nem autoriza criação automática de notas/ordens.

## Evidência e sequência proposta à Engenharia

1. Confirmar configuração efetiva da máquina, eixo e diferencial por **desenho/BOM/OMM/SIS por série**, incluindo a arquitetura de coroa-pinhão e elementos de suporte.
2. Interpretar tendências de ruído, inspeções e óleo como sinais do sistema; coletar a amostra representativa **antes da intervenção**, no ponto de diferencial prescrito.
3. Caso haja acesso aprovado, avaliar visualmente a engrenagem: desgaste, pitting, fratura, fixações e outras superfícies.
4. Medir backlash com instrumento e sequência OEM; considerar a posição de coroa/pinhão, o padrão de contato e critérios próprios para engrenagens novas ou usadas.
5. Separadamente, verificar pré-carga e integridade dos rolamentos; não tratar folga de engrenamento como medida universal de pré-carga nem trocar calços sem planejamento.
6. Distinguir problema de ajuste/montagem, desgaste progressivo, dano físico e outras causas concorrentes. Decisão de intervenção exige parecer independente, segurança do trabalho e especificações efetivas.

Os valores de *backlash*, pré-carga, torque, espessura de calços, posicionamento e padrão de contato **não foram cadastrados** porque variam por projeto e não há comprovação de efetividade OEM dos modelos-alvo.

## Literatura e limites

- [ISO 10825-1:2022](https://www.iso.org/standard/78719.html): nomenclatura e características de desgaste/dano dos dentes; o escopo público não diagnostica causas.
- [Caterpillar — Drivetrain Repair Indicators and Best Practices](https://www.cat.com/en_US/blog/drivetrain-repairs-preventive-maintenance.html): ruído, vibração, óleo e partículas podem envolver engrenagens, rolamentos e outras causas.
- [Caterpillar — How to Take Drive Train Samples](https://www.cat.com/en_US/blog/take-drive-train-samples.html): ponto de amostragem do diferencial depende do OMM; resultados precisam de histórico e rastreabilidade do compartimento.
- [Dana Spicer S140 Series Service Manual](https://www.dana.com/globalassets/resource-library/commercial-vehicle/customer-support/s140-series-service-manual.pdf): exemplo de relação entre pré-carga de apoio, backlash e padrão de contato em **outra família de eixos**. Não transferir **qualquer limite numérico, sequência ou material** para CAT 777/CAT 980.
- [Caterpillar — Differential Pinion Shim (exemplo de catálogo)](https://parts.cat.com/en/catcorp/product/219-8759): descreve a função genérica de posicionamento do pinhão; **o número de peça mostrado não é candidato de compra nem identificado na frota**.

As fontes efetivamente usadas pelo modelo são as referências já cadastradas para ISO, Caterpillar e SKF, com limites de aplicabilidade; as demais são comparação conceitual. Nenhum manual privado, dado de campo ou desenho restrito foi copiado.

## Evolução e testes

| Indicador | v1.3.48 | v1.3.49 |
| --- | ---: | ---: |
| Regras PM | 25 | 25 |
| Regras com bundle | 15 | **16** |
| Regras ainda sem bundle | 10 | **9** |
| Condições | 43 | **50** |
| Ações | 35 | **39** |
| Danos candidatos | 20 | **23** |
| Bundles | 15 | **16** |
| Relações tipadas | 109 | **123** |
| Cenários sintéticos | 26 | **28** |
| Vínculos PM candidatos | 115 | 115 |
| Exceções bloqueadas | 10 | 10 |

O auditor `npm run pm:differential:gear:audit` protege a fronteira de sistemas, exige prova de dano físico e OMM por série, confere **14 relações tipadas** e tenta inserir **30 adulterações** (20 na ontologia, seis na política e quatro nos cenários didáticos). Os cenários SEM-27/SEM-28 **não são observações reais**.

**Integridade esperada:** 24 cadeias FC, 15 mecanismos ME, contrato/conteúdo públicos 1.0.0, preview 1.3.12 e consumidores inalterados.

## Pendências

Confirmar por série coroa/pinhão, apoios, rolamentos, posição, padrão de contato, limites e método de medição; registrar os dados de inspeção em meio corporativo; revisar independentemente antes de SAP, programação, substituição ou intervenção. Este ciclo não atesta dano, causa raiz ou disponibilidade operacional de uma máquina.
