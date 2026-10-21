# FMEA Database Mining — Ciclo v1.3.22 | Refinamento de mecanismos

**Data editorial:** 21/10/2026. **Escopo:** base independente FMEA, sem intervenções em consumidores, manutenção real ou SAP. **Natureza:** propostas técnicas documentais e teste de consistência. Não há revisão independente real, homologação OEM ou causa raiz confirmada.

## 1. Problema de engenharia resolvido editorialmente

A auditoria [v1.3.21](CICLO_2026-10-21_AUDITORIA_TAXONOMICA.md) identificou duas insuficiências: (a) perda de entrega em bomba hidráulica podia ser equivocadamente tratada como desgaste ME-01/02 ou falha de vedação ME-15 sem prova; (b) uma única proposta de dentes de engrenagem misturava abrasão, adesão e fadiga.

A v1.3.22 criou [quatro definições candidatas](../data/quality/mechanism-refinements.v1.json), sem atribuir novos códigos oficiais `ME-*` ou `FC-*`. O identificador `ME-CAND-*` designa somente **proposta de conceito**, não entrada na ontologia original.

## 2. Perda volumétrica interna de bomba hidráulica

**Função:** entregar vazão útil conforme arquitetura, deslocamento, comando, rotação, temperatura, pressão e condição de óleo especificados pelo OEM.

**Falha funcional candidata:** FF-02, quando a vazão útil fica abaixo da requerida nas condições de ensaio pertinentes.

**Mecanismo candidato:** vazão que retorna internamente por folgas ou interfaces acima do previsto pela arquitetura. **O fluxo interno existe também em bomba saudável** e pode ser necessário para lubrificação. Portanto, não é correto classificar qualquer fluxo de dreno como falha, nem assumir que o dreno represente toda a perda volumétrica.

| Fenômeno | Distinção necessária |
|---|---|
| Fluxo interno normal | Resultado previsto em função de bomba, pressão, temperatura, viscosidade e regime; não equivale a dano |
| Perda interna excessiva candidata | Desvio acima da referência OEM específica, por instrumentação válida e contraprova hidráulica |
| ME-15 — Falha de vedação | Requer interface formalmente vedada comprometida; não é sinônimo automático de fluxo por folga |
| ME-01/ME-02 — Desgaste | São hipóteses de origem de aumento de folgas; exigem evidência de superfície e mecanismos diferentes |
| FF-08 — Falha de regulação | Comando/compensador/valvula podem reduzir vazão sem deficiência física volumétrica da bomba |

**Gate documental antes de diagnosticar:** referência OEM por arranjo, instrumentos calibrados, vazão/pressão/temperatura/comando/rotação medidos no regime correto, conhecimento das rotas de retorno e exclusão de sucção, válvulas, sensores e condição de óleo. Sem isso o estado deve ser **inconclusivo**.

A [Caterpillar](https://www.cat.com/en_US/blog/cat-hydraulics-tests-hydraulic-system-inspection.html) recomenda consultar o SIS para critérios de teste; suas instruções públicas descrevem ensaios gerais, **não** curvas da bomba efetiva CAT 395. O [catálogo Parker HY29-0002/UK](https://www.parker.com/Literature/Brazil/Catalogs/LMHD03.pdf) apresenta curvas *típicas* de vazamentos internos em algumas bombas de palhetas, sem caracterizar uma bomba CAT 395. Nenhum limite numérico foi transplantado. A existência de uma porta de dreno e seu uso também exigem confirmação por desenho do fabricante.

**Segurança:** não obstruir dreno de carcaça, forçar alívio, abrir portas energizadas ou improvisar teste de máximo esforço. Equipe habilitada, isolamento e procedimento autorizado são pré-condições de qualquer execução.

## 3. Três submodos editoriais de dano em dentes CAT 777

| Proposta | ME preexistente | Sinais morfológicos *possíveis* | Contraprova indispensável |
|---|---|---|---|
| `SUB-GEAR-ABRASION-001` | ME-01 | Riscos ou sulcos possivelmente relacionados a partículas | Distinguir transferência adesiva, dano em rolamentos e origem das partículas |
| `SUB-GEAR-ADHESION-001` | ME-02 | Marcas sugestivas de arraste/transferência de material | Diferenciar riscos por terceiro corpo e cavidades de fadiga |
| `SUB-GEAR-FATIGUE-001` | ME-03 | Cavidades/descascamento superficial potencialmente compatíveis com fadiga | Localizar flanco de dente e excluir rolamento, corrosão, abrasão ou dano diferente |

São **hipóteses visuais**, não fotografias de dano real, critérios de condenação, nem atribuições confirmadas de causa. Um flanco pode inclusive apresentar mecanismos simultâneos; separá-los editoralmente **não** demonstra exclusividade empírica.

**Interpretação normativa obrigatória:** a [ISO 10825-1:2022](https://www.iso.org/standard/78719.html), conforme seu resumo oficial público, trata de **nomenclatura, classificação e aparência de danos** em engrenagens, não define 'falha de engrenagem' nem estabelece causas e medidas preventivas. Sua aplicação plena exige acesso autorizado ao texto e especialista competente. Não utilizamos o conteúdo protegido da norma para determinar causas.

Amostras SOS, bujão magnético, histórico de lubrificante e ruído são evidências complementares. A troca conhecida de formulação do óleo, por exemplo Shell para Cat FDAO, pode alterar assinatura química sem dano de engrenamento. Sem inspeção localizada, dados isolados não confirmam abrasão, adesão ou fadiga de flanco.

## 4. Estrutura de evidência, integridade e testes

O JSON [`mechanism-refinements.v1.json`](../data/quality/mechanism-refinements.v1.json) preserva ponteiros às propostas CAND anteriores, FF/ME e referências bibliográficas. Em cada candidato: descrição física, natureza apenas editorial, explicações concorrentes, requisitos de evidência, fronteira de segurança, limite de uso da fonte e campos nulos para série OEM, limite e resultado físico observado.

O comando `npm run mechanisms:refinements:validate` cruza IDs contra os registros originais, confere distinção entre desgaste/vedação/regulação e executa [24 casos sintéticos](../data/quality/mechanism-refinements-regressions.v1.json): **quatro baselines e 20 mutações indevidas**, incluindo fluxos internos normais classificados como falha, dados CAT 395 inventados, limites não autorizados, equivalência da bomba d'água, leitura causal indevida da ISO, mecanismos de engrenagem agrupados e série inexistente.

Há [JSON Schema](../schemas/mechanism-refinements.schema.json) e novo gate no `npm run qa` e no GitHub Actions. Nenhuma alteração foi aplicada às 24 cadeias `FC-*`, 15 mecanismos `ME-*`, 48 alegações sistêmicas anteriores, contrato público **1.0.0**, conteúdo público **1.0.0** ou preview legado **1.3.12** (SHA-256 congelado).

## 5. Limites e backlog

A próxima etapa exige um **fluxo de submissão e revisão de evidência real** restrito, antes de considerar novo `ME-*`/ `FC-*` público. Para CAT 395, documentação de bomba e limites por série; para CAT 777, arranjo de engrenagens e inspeção física autorizada; ambas com contraprova independente e aprovação de engenharia/inspeção. Enquanto essas dependências não forem atendidas, não abrir notas corretivas pela simples presença de hipótese bibliográfica.

**Estado final pretendido:** quatro refinamentos editoriais, zero ocorrências de campo, zero parâmetros OEM inferidos, zero causa raiz e zero cadastro SAP aprovado.
