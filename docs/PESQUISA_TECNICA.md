# Pesquisa técnica — fontes, limites e aplicação ao banco

**Atualizado em 20/10/2026.** Este índice contém resumos autorais e links públicos; **não** reproduz o texto integral de normas, manuais OEM ou dados corporativos.

## Critério de fonte

Prioridade: **A** = norma ou fabricante (fonte primária); **B** = literatura técnica, artigo revisado ou instituto especializado; **C** = comunidade/terceiros (somente pistas a confirmar). Toda associação técnica deve distinguir (1) a fonte que sustenta o princípio, (2) a hipótese desenvolvida e (3) a efetividade por modelo/série/software. Metadados de fontes não equivalem a permissão para reproduzir suas obras.

## Normas e referências revisadas

| Fonte | Uso projetado | Ressalva |
| --- | --- | --- |
| [IEC 60812:2018](https://webstore.iec.ch/en/publication/26359) | FMEA/FMECA: função, modo, efeito, possível causa, tratamento e manutenção da análise | Estrutura conceitual; não fornece lista específica de falhas dos nossos modelos |
| [ISO 14224:2016](https://www.iso.org/standard/64076.html) | Separar cadastro de ativo, eventos de falha e eventos/ações de manutenção, com qualidade e rastreabilidade | Escopo original: petróleo, petroquímica e gás. Aplicação em mineração é adaptação metodológica, **não conformidade declarada** |
| [ISO 17359:2018](https://www.iso.org/standard/71194.html) | Selecionar técnica de monitoramento, condição operacional, parâmetro, hipótese e diagnóstico | Exige contexto, limites aplicáveis e dados comparáveis; sem alarmes universais |
| [ISO 13374-1:2003](https://www.iso.org/standard/21832.html) | Estrutura de dados para aquisição, processamento e apresentação de condição | Diretrizes de software, não valida um algoritmo diagnóstico |
| [SAE JA1011:2024](https://saemobilus.sae.org/standards/ja1011_202411-evaluation-criteria-reliability-centered-maintenance-rcm-processes) | Disciplina RCM: função e falha funcional antes de escolher a tarefa preventiva | A referência estabelece critérios de processo, não periodicidades CAT/Sandvik |
| [ISO 4406:2021](https://www.iso.org/standard/79716.html) | Registrar código de contaminação de partículas em fluido hidráulico, com método e amostragem | Não deduz automaticamente bomba ou válvula avariada |
| [ASTM D5185-26](https://store.astm.org/d5185-26.html) | Entender análise ICP multielementar de lubrificantes e limites de interpretação | O método não quantifica bem certas partículas insolúveis grandes; metal baixo **não descarta por si só** desgaste severo |
| [Caterpillar — Fluid Analysis 101](https://www.cat.com/en_US/support/maintenance/sos-services/analysis-101.html/) | Metais, água, glicol, diesel, sujeira, viscosidade, partículas e condição de óleo/arrefecimento | Interpretar por compartimento, fluido, horas e tendência; sem condenar peça pelo elemento isolado |
| [Caterpillar — SIS2GO](https://www.cat.com/pt_BR/support/maintenance/sis2go-app.html) | Conferir esquema, procedimento, efetividade de peça, teste e ajuste por número de série | Informação efetiva depende do produto e assinatura, **não** replicar material protegido |
| [Sandvik — RockPulse](https://www.mining.sandvik/en/products/technology/rockpulse/) | Exemplo de integração entre parâmetros de avanço, ferramenta e condição da rocha | Disponibilidade anunciada para Ranger DX800i/DX900i/DX910i; **não atribuir a DR410i/DI650i** sem documento da família |

## Evidências e armadilhas que viram regras de teste

1. **Código de falha eletrônico ≠ componente quebrado:** separar sensor, chicote, alimentação, resposta funcional e defeito mecânico. Campos obrigatórios: família de código, ECM, software, estado ativo/histórico, condições.
2. **ICP não substitui inspeção de partículas maiores:** solicitar método, tamanho de partículas, tendência, ferro e exame de bujão/filtro quando aplicável. Não classificar 'sem desgaste' por ICP isolado.
3. **Mudança de formulação ≠ desgaste automático:** exigir baseline de lubrificante e efetividade OEM, horas do óleo, histórico, produto anterior e atual.
4. **PM realizada ≠ avaria encontrada:** um plano descreve busca/prevenção; `plannedTest` não pode virar `observedEvidence` sem execução registrada.
5. **Mesmo subgrupo não significa mesmo sistema:** `HSVV` aparece em circuitos diferentes. Filtrar sistema-raiz e grupo; nunca ligar uma falha hidráulica a uma mangueira do motor somente pelo código `HSVV`.
6. **Não assumir sensor/sistema Sandvik que não está documentado:** distinguir princípios gerais de documentação do produto por variante e número de série.
7. **Probabilidade não nasce do catálogo:** somente estimar frequência, incidência ou RPN empírico com denominador, período, população, exposição, viés de coleta e dados autorizados.

## Pesquisa direcionada por frota

| Frota | Prioridade de literatura | Artefato a produzir |
| --- | --- | --- |
| 777 / 980 / 16 | SIS/OMM específico: freios, rodas, diferencial, direção, ventilação e pneus | Matriz de localização, material, dano, efeito e teste |
| 6030 / 395 | Sistemas hidráulicos, bombas, redutores de giro, rodante, arrefecimento | FMEA funcional e diferença entre motores/circuitos/posições |
| D9 | CAT CTS/undercarriage, tensão, roletes, rodas-guia e desgaste | Famílias de falhas e medições; sem inventar limites |
| DR410i / DI650i | Documentação Sandvik por configuração: avanço, compressor, mastro, lubrificação, cabeça rotativa | Testes e sistemas **efetivos**; nenhum DTC proprietário por aproximação |

## Protocolo de extração literária

Para cada fonte guardar `sourceId`, editora/OEM, título, edição/data, URL, tipo de afirmação suportada, família/modelo aplicável, limitações, data de consulta e revisão. Transformar **o conceito**, com palavras próprias, em sintomas e testes; não copiar diagramas, tabelas proprietárias ou procedimentos integrais.

Um revisor técnico deverá classificar cada relação como `inferida`, `plausibilidade_revisada`, `efetividade_OEM_confirmada` ou `validada_em_caso_didatico`. Uma fonte genérica **nunca** promove automaticamente o último estado.

## Dúvidas abertas

- Confirmar periodicidades vigentes, especialmente fichas OLD das perfuratrizes.
- Revisar código SAP de posições e arranjos reais, especialmente CAT 6030 (dois motores) e DR410i/DI650i.
- Completar extração do XLS antigo da CAT 16 sem perder texto/células.
- Autorizar ou restringir divulgação de derivações de planos internos.
