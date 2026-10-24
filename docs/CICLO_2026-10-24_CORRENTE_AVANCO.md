# Ciclo v1.3.56 — Corrente do sistema de avanço de perfuratrizes (BUNDLE-22)

**24/10/2026 | Catálogo 1.3.56 | Ontologia 1.3.20**

## Função, escopo e limite das fontes

A regra preventiva `drill-feed-chain` (`avanco_perfuratriz`, `FECH`, `Corrente`, modelos internos `EQ05` e `EQ06`) passa a integrar a ontologia **como hipótese semântica revisável**. O vínculo entre EQ05/EQ06 e fabricante, variante, número de série ou peça instalada **não foi verificado**. Os códigos candidatos do seed não são dano/causa homologados.

A **DR410i** possui avanço por **dois cilindros hidráulicos e correntes de roletes**, segundo a especificação pública Sandvik. O ajuste por pinos é **padrão** e o tensionamento **hidráulico automático é opcional**. A **Leopard DI650i T4F/S5** lista `Chain feed` entre os componentes padrão, mas essa fonte **não comprova** que ela utiliza a mesma arquitetura de cilindros, roda dentada sincronizadora ou opção de tensionamento DR410i. Nenhuma ficha substitui os manuais `My Sandvik`, BOM e instruções de bloqueio do equipamento específico.

## Distinções diagnósticas

| Fenômeno candidato | Hipóteses e contraprovas |
| --- | --- |
| Desgaste de pinos, roletes, placas ou buchas | Precisa de método/limite OEM por corrente; aparência não quantifica alongamento |
| Folga ou tensão irregular | Confirmar se ajustador é manual por pinos ou automático hidráulico; verificar posicionamento e referências |
| Dentes e engrenamento da roda dentada | Diferenciar dano real, desgaste conjugado e desalinhamento, conferindo geometria/quantidade pela BOM |
| Oscilação, ruído ou deslocamento do carro | Guias, hidráulica, sensores, perfuração e corrente são hipóteses distintas |
| Assimetria lateral ou sincronismo suspeito | Dual-chain em DR410i não demonstra sincronização equivalente na DI650i |
| Marcas nas guias e suportes | Danos de guia não são automaticamente danos de corrente e vice-versa |

**Incremento:** 6 condições não observadas, 5 ações não executadas, 3 danos físicos candidatos não confirmados, 14 relações tipadas e 2 casos sintéticos.

Os três danos candidatos referem-se a **articulações da corrente**, **dentes de roda dentada** e **guias/suportes do avanço**. Não se atribuiu mecanismo de causa raiz nem tolerância dimensional, valor de tensão, torque ou prazo de manutenção.

## Segurança e controle da execução

Correntes e carros de avanço podem acumular energia mecânica, hidráulica e gravitacional. Antes de qualquer intervenção real: avaliar riscos, sustentar mastro/carro conforme OEM, bloquear energias, impedir acesso à zona de esmagamento e validar a condição do ajustador de corrente. Não tocar, ajustar, medir, desmontar, tensionar nem provocar movimento de teste com sistema energizado ou sem procedimento autorizado.

A base **não executa** inspeções, não aprova planos de reparo, não libera equipamento ou ajusta automaticamente mecanismos; a leitura da ficha pública **não autoriza** aplicar força ou sequência de tensionamento à frota.

## Evidência e proveniência

1. [Sandvik — DR410i Specification Sheet (Feed System)](https://www.rocktechnology.sandvik/globalassets/products/surface-drill-rigs/pdf/dr410i-specification-sheet-english.pdf): confirma `Twin cylinders and chain drive`, correntes de roletes e ajuste manual padrão, automático opcional.
2. [Sandvik — Leopard DI650i T4F/S5 Specification](https://www.mining.sandvik/globalassets/products/surface-drill-rigs/pdf/di650i-s5-specification-sheet-english.pdf): confirma o `Chain feed` na variante publicada, **sem equivalência garantida** à DR410i.

Artefatos:
- `data/quality/pm-drill-feed-boundaries.v1.json`: **10 gates pendentes**, 16 salvaguardas, 5 diferenciais técnicos e 6 limites nulos.
- `scripts/audit-pm-drill-feed.mjs`: validações causais e **40 mutações adversariais** para barrar dados reais inventados, cópia de opção não verificada e aprovação SAP automática.
- `reports/pm-drill-feed.generated.json`: resultado auditável do CI.
- `SEM-39` / `SEM-40`: simulações didáticas, não evidência operacional.

## Cobertura e próxima etapa

Após este ciclo são **22/25 regras PM com bundle**, restando `drill-rotary-bearing`, `drill-compressor-pressure` e `drill-compressor-filter`. Permanecem 115 vínculos preventivos candidatos, 10 bloqueios PM×SAP, 11 nós genéricos compartilhados, **zero** evidências reais de dano, inspeções, testes, ordens ou mapeamentos SAP aprovados. Consumidores externos inalterados.

**Próximo ciclo sugerido:** `drill-rotary-bearing`, separando ruído do conjunto de rotação, condição de lubrificação, fixação, esforços axiais/radiais e integridade do rolamento, após comprovar arquitetura por variante e série.
