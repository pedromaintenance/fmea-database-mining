# Ciclo v1.3.52 — Coletor de escape: pré-auditoria de evidências

**22/10/2026 · Banco 1.3.52 · Ontologia preservada em 1.3.16.**

Este ciclo é uma **pré-auditoria documental**, e não a criação de `BUNDLE-19`. A regra candidata `engine-exhaust`, motor diesel / `EXSY` / `Coletor`, contempla sete modelos de cadastro. O código de dano/causa da regra preventiva não confirma trinca, componente físico instalado, localização nem causa. A cobertura **permanece 18/25** regras PM.

## Função, sintoma e diferencial

O coletor conduz os gases de exaustão às conexões a jusante, frequentemente próximas do turbo. A falha funcional possível envolve perda de estanqueidade, restrição, sobrecarga térmica de estruturas vizinhas ou desempenho alterado; esses efeitos **não são equivalentes** à trinca física do coletor.

| Indício ou situação candidata | Explicações concorrentes | Evidência que falta |
| --- | --- | --- |
| Fuligem localizada | Corpo trincado; flange/junta; conexão adjacente | Trajetória e origem localizada com segurança |
| Fissura visual aparente | Fissura real; marca de fundição; alteração superficial | Caracterização independente do corpo/material |
| Fuga em flange | Junta; prisioneiro; vedação; interface de turbo | BOM, montagem e diagnóstico OEM efetivos |
| Resíduo preto úmido | Wet stacking/combustível não queimado; óleo; fuga em junta | Contexto operacional e análise discriminante |
| Dano aparente em fole | Fole existente e fatigado; suporte; vibração; desalinhamento | Confirmar existência/configuração e requisitos OEM |
| Temperatura, fumaça ou potência atípicas | Combustão; admissão; turbo; contrapressão; fuga no escape | Instrumentação e baseline específicos |

**Fronteira central:** vestígios de fuligem não comprovam trinca. Resíduo preto úmido não comprova óleo de motor ou falha de vedação. A existência de foles em literatura pública de grupos geradores não prova sua instalação em CAT 777, CAT 980 ou outros modelos da mina.

## Literatura OEM pública e limites

1. [Caterpillar — Exhaust Manifold Install Kit](https://www.cat.com/en_US/articles/truck-engine-resource-center/four-affordable-ways-to-fix-your-rig.html): contextualiza vazamento de junta, prisioneiro e luvas, mas é conteúdo rodoviário e não BOM de mina.
2. [Caterpillar — Wet Stacking? What Is That?](https://www.cat.com/en_US/articles/electric-power/podcasts/wet-stacking-what-is-that.html): explica depósito úmido de fuligem/combustível em geradores; não transportar limites de carga ou procedimentos ao equipamento móvel.
3. [Caterpillar — How Small Changes Impact Reliability](https://www.cat.com/en_GB/blog/technical-pitfalls-after-genset-commissioning-how-small-changes-impact-reliability.html): descreve risco de fole mal suportado em instalação estacionária; não inferir existência de fole ou geometria efetiva no catálogo EXSY.

As três referências são **contexto genérico**, não homologação por serial.

## Oito portões antes de modelagem aplicável ao equipamento

OEM-SERIAL; BOM-PARTS; SITE-ISOLATION; PHYSICAL-DISCRIMINATION; CONDITION-CONTEXT; APPROVED-METHOD; SAP-STRUCTURE; INDEPENDENT-REVIEW.

Todos estão **pendentes**. Não há temperatura de condenação, tolerância de trinca, torque ou contrapressão universal inseridos. A inspeção exige isolamento térmico e de energias, proteção contra partes quentes, acesso aprovado e avaliação competente. A matriz não autoriza operação de máquina com risco nem teste sob carga improvisado.

## Artefatos e validação

- `data/quality/pm-exhaust-preflight.v1.json`: seis hipóteses diferenciais, oito gates, dez invariantes de segurança e estado de campo nulo.
- `scripts/audit-pm-exhaust-preflight.mjs`: auditor de integridade e **36 mutações adversariais** para impedir promoções de inferência a prova, liberação de gates e aprovações SAP fictícias.
- `npm run pm:exhaust:preflight` gera o relatório `reports/pm-exhaust-preflight.generated.json`.

**Resultado esperado:** 25 regras, 18 bundles, sete não modeladas, dez bloqueios PM×SAP, zero observações/testes/danos confirmados. O ciclo seguinte pode propor `BUNDLE-19` após revisão semântica. Nenhum consumidor externo foi alterado.
