# Ciclo v1.3.91 — Pré-piloto OEM público da CAT 395 por variante, sem efetividade por série

**03/11/2026 · FMEA Database Mining · Engenharia de Manutenção e PCM · uso conceitual, não operacional.**

## Resultado e objetivo

Este ciclo transforma a matriz de diagnóstico de circuitos hidráulicos da **v1.3.90** em uma etapa de **identificação de variante por publicações OEM verificáveis**. Não há documentação de série/BOM, circuito hidráulico efetivo nem qualquer equipamento específico vinculado. O nome comercial “395” não é chave técnica suficiente para reproduzir pressão, vazão, circuito ou ajuste.

A pesquisa foi limitada a **páginas públicas de produto da Caterpillar**; não entramos no SIS privado nem usamos desenhos internos. A qualidade e o limite dessas fontes são explicitados.

## Comparativo de catálogo verificável

| Variante / publicação da Caterpillar | Vazão máxima principal de implementos | Pressão máxima do equipamento | Modo de levantamento | Pressão máxima de translação | Pressão máxima de giro |
| --- | ---: | ---: | ---: | ---: | ---: |
| **395 Tier 3/MAR-1 (Brasil)** | **1.064 L/min** | **37.000 kPa** | **38.000 kPa** | 35.000 kPa | 31.000 kPa |
| **395 Tier 4 Final/Stage V (EUA)** | **1.064 L/min** | **37.000 kPa** | **não publicado na página selecionada** | 35.000 kPa | 31.000 kPa |
| **395 Front Shovel (EUA)** | **1.008 L/min** | **32.000 kPa** | **não publicado na página selecionada** | 35.000 kPa | 31.000 kPa |

Fontes primárias (consultadas em 03/11/2026):
- [Caterpillar — 395 Tier 3/MAR-1 — Brasil](https://www.cat.com/pt_BR/products/new/equipment/excavators/large-excavators/127102.html): fonte `CAT-395-BR-TIER3-PRODUCT`.
- [Caterpillar — 395 Tier 4 Final/Stage V — EUA](https://www.cat.com/en_US/products/new/equipment/excavators/large-excavators/126440.html): fonte `CAT-395-US-TIER4-PRODUCT`.
- [Caterpillar — 395 Front Shovel — EUA](https://www.cat.com/en_US/products/new/equipment/excavators/large-excavators/128240.html): fonte `CAT-395-FRONT-SHOVEL-PRODUCT`.
- [Caterpillar — SIS2GO](https://www.cat.com/sis2go): fonte `CAT-SIS2GO`; a própria Caterpillar descreve acesso a esquemas, sistemas, manuais e testes por **número de série**, sujeito a acesso/assinatura aplicáveis.

### Cautelas quantitativas

A diferença de vazão máxima publicada da Front Shovel em relação às versões de 1.064 L/min é de **56 L/min (~5,26%)**. A diferença de pressão máxima de equipamento é de **5.000 kPa (~13,51%)**. Esses percentuais medem **diferença de catálogo entre publicações**, **não** desempenho real, perda de eficiência, desvio admissível, falha ou capacidade de bomba.

A ausência da pressão de levantamento em duas fontes **não** prova que as variantes não possuam qualquer modo/circuito correlato. O valor foi registrado como `null`, com classe `not_reported_on_selected_source`, e **não** copiado da publicação brasileira.

A pressão máxima de equipamento publicada **não é** por definição ajuste de válvula de alívio, setpoint do software, pressão de serviço de uma câmara, referência de ensaio ou limite de liberação. A vazão máxima principal para implementos **não** informa a vazão de uma bomba isolada sob carga específica.

## Por que isso importa ao FMEA

As **10 fichas `HC-DIFF-01..10`** continuam com hipóteses concorrentes e não recebem números de aceitação. O novo `scenarioCrosswalk` diz quais campos comerciais podem fornecer somente **contexto de variante** (e quando são inúteis à discriminação) e bloqueia uso operacional em todas as fichas.

Exemplos:
- Em `HC-DIFF-03` (pressão percebida como baixa), nenhum máximo de catálogo pode condenar bomba ou alívio sem porta, condição, parâmetro, referência de teste e contraprova.
- Em `HC-DIFF-05` (deriva), a página comercial não permite selecionar falha de vedação de pistão versus válvula de retenção ou distribuidora.
- Em `HC-DIFF-10` (divergência de sensores), um valor máximo comercial não valida instrumentação, calibração, ponto físico nem software ECM.

## Oito gates de aplicabilidade — todos pendentes

1. **G395-01:** identificação de ativo, série, prefixo e arranjo em ambiente privado autorizado;
2. **G395-02:** discriminação da variante comercial e configuração efetiva (incluindo implemento);
3. **G395-03:** esquema e operações de sistema OEM por série, mídia e revisão;
4. **G395-04:** identificação física de bombas, malhas, válvulas, retenção e sensoriamento;
5. **G395-05:** procedimento de teste/ajuste e limites reais por porto, condição e série;
6. **G395-06:** instrumentação calibrada, condição operacional, temperaturas e faixas efetivas;
7. **G395-07:** bloqueio de energia, suporte positivo de carga e autorização para ensaio;
8. **G395-08:** contraprovas e revisão independente antes de decisão causal, SAP ou operacional.

Nenhum gate foi satisfeito por esta pesquisa. A página de produto somente fornece **informação OEM pública por variante**, não o procedimento de intervenção. O estado final da aplicação real é `BLOCK_OPERATIONAL_USE_UNTIL_SERIAL_OEM_EVIDENCE`.

## Entregáveis

- `data/quality/cat395-public-variant-preflight.v1.json` — três variantes, cinco campos comerciais tipados por variante, 8 gates, 10 vínculos conceituais e natureza explícita da evidência.
- `schemas/cat395-public-variant-preflight.schema.json` — contrato estrito, `null` para dados não publicados, bloqueios permanentes.
- `docs/preflight-cat395.html` — consulta standalone/offline, seleção da publicação, comparação e exportação de **rascunho de preparação** (não aceite).
- `scripts/audit-cat395-public-variant-preflight.mjs` — integridade de valores OEM verificados, fontes, cruzamento das 10 fichas, funcionamento offline, anti-inferência e 22 mutações adversariais.
- `npm run pm:cat395:variant:audit` integrado ao `qa` e ao GitHub Actions.

**Invariantes:** 25 regras PM, dez exceções PM×SAP bloqueadas, oito gates corporativos privados NO_GO, nenhuma máquina/serial real associada, zero resultados de teste, zero causa confirmada, nenhuma alteração em SAP ou consumidores externos. P0/P1 no legado continuam **prioridade documental**, nunca criticidade operacional.

## Próximo passo para uso real

O passo de maior valor não é mais inventar um caso. É, em ambiente **privado e autorizado**, obter a identificação completa e o esquema SIS correspondente a uma 395 efetiva; preencher a validação com a Engenharia, em revisão independente e condições de segurança. Só então selecionar um `HC-DIFF-xx`, especificar porta, estado da máquina, instrumento, valores de referência e critério de aceitação. **Não publicar série real, BOM, fotos internas, OMM ou resultados privados neste repositório.**
