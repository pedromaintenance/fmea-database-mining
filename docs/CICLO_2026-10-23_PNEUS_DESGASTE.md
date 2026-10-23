# Ciclo v1.3.55 — Desgaste OTR e RTD (BUNDLE-21)

**23/10/2026 | Catálogo 1.3.55 | Ontologia 1.3.19**

## Objetivo e escopo
A regra preventiva `wheel-tire-wear` do subgrupo TIR3 ("Pneu", CAT777, CAT980, EQ09 no catálogo) ganhou o BUNDLE-21. O escopo é desgaste físico da banda de rodagem, diferente dos cortes, cordonéis expostos e danos estruturais do BUNDLE-20 (TIR1). Não confirmar características do pneu por modelo/série a partir do catálogo de máquina.

## Diagnóstico diferencial
- RTD (*remaining tread depth*) em vários pontos: verificar desenho da banda, local da medição, referência OEM e histórico comparável.
- Perda predominante no centro: pressão acima do adequado é hipótese possível, não causa demonstrada.
- Perda em ombros: pressão insuficiente é hipótese possível, não causa demonstrada.
- Assimetria entre os lados: avaliar carga, alinhamento e serviço, sem diagnóstico automático.
- Perda localizada ou áreas planas: investigar uso, curvas, freios, patinagem e deformações em separado.
- Diferença entre pneus duplos: avaliar matching **somente se a máquina efetivamente tiver rodagem dupla**.

**Entidades acrescentadas:** seis condições não observadas, quatro inspeções propostas não executadas, três hipóteses de desgaste físico não confirmadas, 13 relações semânticas e dois cenários sintéticos. Os candidatos de dano registram perda diferencial no centro, nos ombros ou localizada, sem condenação automática. A regra TIR3 não compartilha danos físicos com TIR1.

## Segurança e proveniência
Identificar marca, dimensão, construção, padrão da banda, posição e carga antes de propor medição. Não inferir pressão, limite de RTD, intervalo de rodízio ou tolerância em pneus duplos. Não esvaziar pneu quente, manipular pneus danificados ou realizar montagem sem pessoal habilitado, procedimento e avaliação de risco.

Fontes fabricantes, de contexto e não efetividade por série:
- [Michelin — inspeção Earthmover](https://b2b.middle-east.michelin.com/help-advice/earthmover-vehicles/tyre-maintenance-earthmover-tyre-inspection): RTD, inspeção multiponto e necessidade de revisão profissional.
- [Michelin — pressão Earthmover](https://b2b.middle-east.michelin.com/help-advice/earthmover-vehicles/tyre-pressure-for-earthmover-vehicles): efeitos possíveis de subpressão e sobrepressão, proibição de esvaziar pneus quentes.
- [Bridgestone — programa OTR](https://commercial.bridgestone.com/en-ca/resource-center/articles/tire-program-best-practices): rodízio, pressão, matching de duplos, posição e RTD.

## Auditoria e limites
`data/quality/pm-tire-wear-boundaries.v1.json`: nove gates pendentes, dezesseis salvaguardas, seis limites sem valor. `npm run pm:tire:wear:audit`: consistência de conceitos, casos sintéticos, rastreabilidade e testes adversariais. Relatório `reports/pm-tire-wear.generated.json` integrado ao CI.

**Estado:** 21/25 regras modeladas, quatro pendentes; 83 condições, 62 ações, 39 danos, 195 relações, 38 fixtures sintéticos. Preservar 115 vínculos candidatos e dez bloqueios PM×SAP. Zero dados de campo, falhas confirmadas, critérios OEM homologados ou mudanças em consumidores.

**Próximo ciclo:** `drill-feed-chain` em perfuratrizes, somente após verificar arquitetura de avanço OEM por modelo e série.
