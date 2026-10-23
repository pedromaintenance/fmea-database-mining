# Ciclo v1.3.53 — Coletor de escape e evidência diferencial (BUNDLE-19)

**22/10/2026 — Catálogo 1.3.53 · Ontologia 1.3.17.**

## Escopo
A regra preventiva `engine-exhaust` (motor diesel, `EXSY`, componente textual `Coletor`, sete famílias de cadastro) foi promovida **apenas a bundle semântico de hipóteses**. A pré-auditoria [v1.3.52](CICLO_2026-10-22_ESCAPE_PREAUDITORIA.md) permanece preservada, com 6 diferenciais e 8 gates documentais pendentes. Não existe correspondência por serial, peça ou história operacional homologada.

## Fenômenos e fronteiras causais

| Hipótese de condição | Distinção necessária |
| --- | --- |
| `COND-ENGINE-EXH-SOOT-TRACE` | Fuligem depositada não localiza por si a fuga nem prova trinca; pode vir de junta ou outro ponto |
| `COND-ENGINE-EXH-BODY-DISCONTINUITY` | Fissura aparente não é fratura confirmada; discriminar material, marca e corpo físico |
| `COND-ENGINE-EXH-FLANGE-LEAK` | Fuga de junta/flange não equivale a ruptura do corpo |
| `COND-ENGINE-EXH-WET-RESIDUE` | Resíduo negro úmido pode envolver fuligem e combustível/óleo, mas composição e origem não estão estabelecidas |
| `COND-ENGINE-EXH-FLEX-JOINT` | Fole, conexão flexível ou suporte somente entram no diagnóstico **se sua instalação estiver comprovada**; não são danos físicos do coletor |
| `COND-ENGINE-EXH-PERFORMANCE` | Perda de potência ou temperatura fora do padrão pode decorrer de admissão, combustão e turbo, não apenas escape |

São **6 condições não observadas**, **5 ações não executadas** (configuração/BOM, rastreamento seguro, inspeção diferencial de juntas/fixadores, diferenciação de depósitos e flexíveis, correlação de desempenho) e **3 danos físicos candidatos, ainda não aprovados**: corpo do coletor trincado, junta degradada e fixador danificado. O fole permanece concorrente fora dos danos do coletor, sem mapeamento SAP.

## Segurança
- Desligamento, isolamento, resfriamento e acesso antes de qualquer inspeção em regiões quentes; evitar testes ativos improvisados.
- Não fixar torques, pressões, temperatura-limite, intervalos, critérios de condenação ou PN genéricos.
- Confirmar motor, sistema de escape, junta, flange e eventual fole por serial/BOM/OMM. Dados de grupos geradores ou caminhões rodoviários são **contexto**, não efetividade de frota.
- Não converter fuligem, resíduo, inspeção ou performance em causa, ordem SAP ou componente condenado.
- Nenhuma instrução deste bundle libera máquina, determina substituição ou executa ensaio.

## Fontes OEM públicas verificadas
- [Caterpillar — Four Affordable Ways to Fix Your Rig](https://www.cat.com/en_US/articles/truck-engine-resource-center/four-affordable-ways-to-fix-your-rig.html): juntas, prisioneiros, porcas, arruelas e luvas na reparação de vazamento do coletor (motores rodoviários).
- [Caterpillar — Wet Stacking? What Is That?](https://www.cat.com/en_US/articles/electric-power/podcasts/wet-stacking-what-is-that.html): contextualiza depósitos de fuligem e combustível em geração de energia.
- [Caterpillar — How Small Changes Impact Reliability](https://www.cat.com/en_GB/blog/technical-pitfalls-after-genset-commissioning-how-small-changes-impact-reliability.html): efeitos de alinhamento e suportação sobre foles em grupos geradores; **não** prova instalação na frota.

## Testes automáticos e estado
`npm run pm:exhaust:ontology:audit` verifica IDs, fontes, segurança, imutabilidade da pré-auditoria, separação de sistemas, relações tipadas, contraindicações de inferência, 2 cenários sintéticos e mutações adversariais. O relatório é `reports/pm-exhaust-ontology.generated.json`, integrado ao CI e ao `npm run qa`.

Cobertura prevista: **19/25** PM com bundle, 6 pendentes, 11 nós compartilhados genericamente e nenhum dano compartilhado; **115 vínculos candidatos** e **10 bloqueios PM×SAP** mantidos. Inspeções reais, danos, causas raiz, operações e aprovações SAP: **zero**. Consumidores externos inalterados.

**Próximos gates:** BOM/desenho OEM por série, avaliação de segurança por intervenção, evidências discriminantes e revisão independente. O próximo ciclo editorial deve priorizar `wheel-tire-damage` ou `wheel-tire-wear`, sem generalizar critérios OEM de pressão, profundidade ou corte.
