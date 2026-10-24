# Ciclo v1.3.58 — Estanqueidade do ar comprimido da perfuratriz (BUNDLE-24)

**24/10/2026 · Catálogo 1.3.58 · Ontologia 1.3.22**

## Função, sintoma e limite de cadastro
A regra `drill-compressor-pressure` apresenta sistema `ar_comprimido`, texto `Mangueira`, subgrupo **VPAR** e EQ05/EQ06. A função genérica da linha é transportar ar comprimido conforme o circuito efetivo. Entretanto, os dados mestres SAP demonstram que **VPAR existe, mas não contém Mangueira como componente registrado**. A exceção `component_not_registered` mantém-se **bloqueada**; nenhum componente, local de instalação ou código dano/causa foi aprovado.

Baixa pressão no reservatório, ruído de ar e perda de vazão são **sintomas**, não prova de falha de mangueira. Diferenciar pressão do receptor, circuito de descarga, linhas, engates, vaso e controle de admissão.

## Hipóteses concorrentes

| Indício | Diagnóstico diferencial exigido |
| --- | --- |
| Pressão baixa do reservatório | Fuga, admissão, capacidade do compressor, demanda, válvula, sensor |
| Ruído aparente de escape de ar | Purga prevista, descarga de controle, dreno, junta, linha ou vaso |
| Abrasão/corte visual de mangueira | Deterioração de cobertura não comprova perfuração da parede |
| Suspeita de fuga em conexão | Mangueira, terminal, vedação, flange, válvula e tubulação adjacente |
| Corrosão ou dano aparente do receptor | Condensado não prova trinca, espessura insuficiente ou vazamento passante |
| Vazão insuficiente | Restrição, carga, controle, sensor ou perda de estanqueidade não localizada |

**Incremento:** seis condições não observadas, cinco atividades propostas não executadas, três danos físicos candidatos, quatorze relações tipadas e dois cenários sintéticos. Danos candidatos: parede/terminal de mangueira, vedação da conexão e parede do vaso. **O vaso não é um tipo de mangueira** e seus critérios de integridade exigem disciplina e processo próprios.

## Evidência e limites OEM
- [Sandvik — Guia de trânsito DR410i Rev. C](https://www.mining.sandvik/siteassets/product-documents/surface-drill-rigs/rotary-blasthole-drill-rigs/transit-guides/dr410i-transit-guide-pt-pt.pdf): em condição específica de partida, orienta analisar mangueiras e válvula de admissão perante baixa pressão no receptor. É contexto de trânsito/partida, não método universal de ensaio.
- [Sandvik — Ficha DR410i](https://www.mining.sandvik/siteassets/product-documents/surface-drill-rigs/rotary-blasthole-drill-rigs/dr410i-specification-sheet-english.pdf): opções de compressor/rotativo e DTH diferem; dados publicados não aprovam pressão de teste, descarte ou configuração instalada.
- [Sandvik — Ficha Leopard DI650i S5](https://www.mining.sandvik/globalassets/products/surface-drill-rigs/pdf/di650i-s5-specification-sheet-english2.pdf): compressor GHH publicado para variante S5, sem demonstrar mesma linha, receptor ou válvula da DR410i.
- [Kaeser — Compressed Air System Installation Guide](https://us.kaeser.com/download.ashx?id=tcm%3A46-37774): princípio genérico de aliviar completamente a pressão em todos os pontos antes de manutenção. Não substitui a sequência de isolamento Sandvik por série.

**Não foram transplantados os valores ou alarmes do guia de trânsito para condições de teste, ajuste, troca de mangueira ou especificação de outras máquinas.**

## Segurança operacional
O circuito pneumático armazena energia mecânica suficiente para lesões graves. É obrigatório confirmar o bloqueio das fontes, a purga controlada e a condição de pressão zero no ponto de intervenção pelo procedimento OEM antes de abrir, tocar, aproximar instrumentos ou remover conexões. Não fazer ensaios improvisados de vazamento, rearmar válvulas, soldar reservatórios, ou decidir retorno ao serviço por conclusão textual. Vaso de pressão requer integridade e responsáveis legalmente habilitados conforme exigências aplicáveis.

## Controle de inferência, SAP e auditorias
- Política: `data/quality/pm-drill-pressure-boundaries.v1.json` com 10 gates **pendentes**, 18 salvaguardas e 6 parâmetros técnicos **nulos**.
- Auditor: `scripts/audit-pm-drill-pressure.mjs`; **42 ataques adversariais** para bloquear evento real fictício, limite numérico, pressão ainda presente, homologação SAP e alteração indevida do VPAR.
- Relatório: `reports/pm-drill-pressure.generated.json` produzido pelo CI.
- Exceção SAP: `drill-compressor-pressure` permanece `component_not_registered`, com `autoRemapAllowed=false`. **Não** modificar `data/quality/pm-gap-review.v1.json` automaticamente.

**Estado:** ontologia 1.3.22, **24/25** regras PM modeladas, falta `drill-compressor-filter`. Totais: 101 condições, 77 ações, 48 danos candidatos, 237 relações e 44 cenários sintéticos. Preservam-se os 115 vínculos preventivos candidatos e dez bloqueios PM×SAP. Zero inspeções, ensaios, danos, OS ou mapeamentos SAP aprovados; nenhum consumidor externo foi alterado.

**Próximo ciclo:** `drill-compressor-filter`, separando filtro de admissão, óleo do compressor, elemento separador ar–óleo e possível filtragem do receptor, preservando o bloqueio `subgroup_not_in_scope` para COMR.
