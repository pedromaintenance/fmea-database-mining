# Ciclo v1.3.57 — Rolamento e mecanismos concorrentes da cabeça rotativa (BUNDLE-23)

**24/10/2026 · Catálogo 1.3.57 · Ontologia 1.3.21**

## Função, arquitetura e hipótese

A regra `drill-rotary-bearing` (`cabeca_rotativa`, subgrupo `MORO`, parte `Rolamento`, modelos internos `EQ05` e `EQ06`) passou a `BUNDLE-23` de hipóteses de manutenção, **não a FMEA homologado nem a diagnóstico de campo**. O rolamento suporta esforços sobre os elementos de rotação; transmissão por engrenagens, motor hidráulico, eixo flutuante (*floating spindle*), vedação do ar e fixações são mecanismos concorrentes que não se confundem com dano em pista de rolamento.

**Distinção OEM central:**
- **Leopard DI650i / HTRH6:** a literatura de família Sandvik identifica módulo de rolamentos independente, ao lado de módulos de acionamento e entrada de ar e do spindle flutuante.
- **Leopard DI650i / MRH6:** o catálogo descreve uma arquitetura reforçada com mecanismo próprio de pré-carga dos rolamentos, mas não valores de montagem ou reparo.
- **DR410i:** fonte OEM descreve cabeça rotativa de dois estágios, sem comprovar identidade de rolamento, método de pré-carga ou circuito de óleo com HTRH6/MRH6.
- As configurações publicadas diferem por versão; **EQ05/EQ06, variante e número de série não foram conciliados com uma BOM da frota**. Não inferir qual cabeçote está montado nem a aplicabilidade de um procedimento de outra máquina.

## Diferenciais mecânicos

| Indício candidatado | O que é necessário discriminar |
| --- | --- |
| Ruído no conjunto | Rolamento, engrenagens, motor hidráulico, spindle, fixação e ferramenta de perfuração |
| Vibração | Rotação, carga, desalinhamento, engrenamento, referência de medição e cinemática real |
| Temperatura externa elevada | Transferência térmica, lubrificação, hidráulica e região física do sensor |
| Lubrificação, resíduos ou partículas | Compartimento correto, vedação de óleo, vedação de ar, histórico e origem física das partículas |
| Folga axial/radial aparente | Spindle, flange, alojamento, folga interna e diferença entre mecanismos de pré-carga |
| Variação de velocidade, torque ou fixações | Motor hidráulico, engrenagens, controle, transmissão, prisioneiros e carga operacional |

O ciclo adiciona **6 condições hipotéticas**, **5 ações não executadas**, **3 danos físicos candidatos**, **14 relações tipadas** e **2 cenários didáticos**. Danos diferenciais: pista/elemento rolante, alojamento/assento e vedação. Nenhum é confirmado ou tem código SAP validado.

## Segurança e execução

A inspeção real requer identificação do conjunto, sustentação mecânica, bloqueio de energia hidráulica e gravitacional, avaliação de pressão pneumática residual e zonas de esmagamento/rotação. Não operar sob carga para reproduzir ruído, ajustar pré-carga, medir folga, abrir compartimento pressurizado ou escolher lubrificante sem autorização do OEM e análise de risco.

A base não fixa folga axial, temperatura, vibração, torque, pré-carga ou pressão de teste; os seis campos quantitativos ficam **nulos**. Não condenar rolamento apenas por ruído, temperatura ou partículas da análise de óleo. Não homologar causas SAP nem autorizar retorno ao serviço automaticamente.

## Fontes primárias públicas e escopo

1. [Sandvik — Leopard DI650i brochure, página 8: HTRH6/MRH6](https://www.mining.sandvik/siteassets/product-documents/surface-drill-rigs/surface-down-the-hole-drill-rigs/di650i-brochure-english.pdf). Descreve módulos HTRH6 e pré-carga MRH6, não critérios de manutenção específicos.
2. [Sandvik — Leopard DI650i: opções de cabeça rotativa](https://www.mining.sandvik/pt-br/produtos/equipamento/equipamentos-de-perfuracao-de-superficie/leopard-di650i/). Contexto de família, sem confirmar variante da mina.
3. [Sandvik — DR410i rotary blasthole drill](https://www.mining.sandvik/en/products/equipment/surface-drill-rigs/dr410i-rotary-blasthole-drill-rig/). Cabeça de dois estágios; manuais de manutenção específicos no My Sandvik.

As fichas não demonstram efetividade por equipamento e não substituem BOM, número de série, dados de falha, manual de reparo e revisão independente.

## Auditoria, integridade e próximos gates

- `data/quality/pm-drill-rotary-boundaries.v1.json`: três arquiteturas separadas, dez gates **pendentes**, 18 salvaguardas, cinco fenômenos diferenciais e seis parâmetros quantitativos nulos.
- `scripts/audit-pm-drill-rotary.mjs`: rejeição de **42 mutações adversariais**, incluindo cabeçote ficticiamente instalado, pré-carga suposta e dano/SAP promovido sem prova.
- `SEM-41` e `SEM-42`: cenários sintéticos; `reports/pm-drill-rotary.generated.json`: relatório do CI.

**Estado esperado:** **23/25 regras PM com bundle** (92% de cobertura semântica), restam `drill-compressor-pressure` e `drill-compressor-filter`. Totais: 95 condições, 72 ações propostas, 45 danos candidatos, 223 relações, 42 cenários sintéticos. Permanecem 115 vínculos PM candidatos, dez bloqueios PM×SAP e zero eventos, testes de campo, ordens ou mapeamentos aprovados. Consumidores externos inalterados.

**Próximo ciclo:** `drill-compressor-pressure`; separar vazamento externo, mangueiras, vaso de ar, conexões, válvulas e descarga de compressor, com pressão residual e método OEM por série.
