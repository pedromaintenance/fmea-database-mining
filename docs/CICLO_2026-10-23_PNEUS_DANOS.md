# Ciclo v1.3.54 — Pneu OTR: lesão estrutural e danos candidatos

**23/10/2026 | Catálogo 1.3.54 | Ontologia 1.3.18**

A regra `wheel-tire-damage` (TIR1 / Pneu; modelos catalogados CAT777, CAT980 e EQ09) ganhou `BUNDLE-20`. A regra `wheel-tire-wear` (TIR3) permanece **não modelada**, para impedir confusão entre perda de material por desgaste e falha estrutural de carcaça.

## Discriminação técnica
1. Corte/trinca no flanco: registrar região; não declarar ruptura interna nem causa.
2. Corte/arrancamento de banda: diferenciar perda superficial de estrutura comprometida.
3. Cordonel/lona aparente: suspeita de risco estrutural, não prova do mecanismo de ruptura.
4. Abaulamento/deformação: risco potencial de separação, não resultado de inspeção interna.
5. Talão/aro: distinguir dano do pneu de problemas no aro ou anel de trava.
6. Pressão/carga/temperatura: fatores concorrentes, não diagnóstico de dano físico.

São **6 condições hipotéticas**, **5 ações não executadas**, **4 danos diferenciais não confirmados**, **15 relações** e **2 casos didáticos sintéticos**. Danos candidatos: corte da carcaça, ruptura de cordonel, separação de camadas e lesão do talão. Nenhum recebeu componente SAP, posição física aprovada ou par dano/causa homologado.

## Segurança operacional
Pneus OTR e a montagem aro/pneu armazenam energia perigosa. Não autorizar reenchimento, esvaziamento, desmontagem, soldagem ou trabalho na zona de ruptura por recomendação automática deste banco. Suspeitas estruturais exigem imobilização e especialista habilitado; avaliação de reparabilidade não é decisão algorítmica. Não extrapolar valores numéricos de pressão, TKPH, temperatura, profundidade ou descarte entre pneus e configurações.

## Referências primárias e limitações
- [Michelin: inspeção de pneus de equipamentos pesados](https://b2b.middle-east.michelin.com/help-advice/earthmover-vehicles/tyre-maintenance-earthmover-tyre-inspection): regiões de dano e triagem especializada.
- [Michelin: reparo de pneus de equipamentos pesados](https://b2b.middle-east.michelin.com/help-advice/earthmover-vehicles/tyre-wear-earthmover-tyre-repair): avaliação de integridade interna, condição de reparabilidade e pessoal competente.
- [Bridgestone: práticas OTR](https://commercial.bridgestone.com/en-ca/resource-center/articles/tire-program-best-practices): pressão, matching, inspeção e contexto de operação.

A leitura dessas páginas não comprova a construção de pneus na frota, nem a efetividade de procedimento/critério por marca, dimensão, número de série, carga ou posição.

## Gates e validação
`data/quality/pm-tire-damage-boundaries.v1.json` mantém nove requisitos pendentes, 16 salvaguardas, cinco diferenciais e parâmetros quantitativos nulos. `npm run pm:tire:damage:audit` verifica proibição de promoção de sintomas para falhas, segurança, vínculos tipados e mutações adversariais; relatórios em `reports/pm-tire-damage.generated.json` pelo CI.

Cobertura prevista **20/25** regras PM, **cinco ainda não modeladas**; 115 vínculos candidatos e dez bloqueios PM×SAP preservados; zero inspeções reais, danos confirmados, aprovações de reparo e mapeamentos SAP. Não houve alteração de consumidores externos.

**Próximo ciclo:** `wheel-tire-wear`, diferenciando desgaste uniforme, desgaste irregular por pressão/carga/alinhamento, medição RTD e critérios de retirada sem valores genéricos.
