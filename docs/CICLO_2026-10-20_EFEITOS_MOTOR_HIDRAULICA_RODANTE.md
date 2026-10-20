# Ciclo FMEA v1.3.7 — Motor diesel, hidráulica, material rodante e efeitos funcionais

**Data editorial:** 20/10/2026  
**Escopo:** exclusivamente FMEA Database Mining  
**Natureza:** conhecimento autoral com referências OEM públicas, **não** ocorrências reais, FMEA homologada ou procedimento de manutenção por prefixo/série

## Objetivo

Expandir a distinção `condition` ≠ `preventiveAction` ≠ `componentDamage`, iniciada na v1.3.6, para **lubrificação do motor, sistemas hidráulicos e rodante**. Em paralelo, separar **efeito local na peça/conjunto** de **efeito sistêmico na função do equipamento** para as 24 cadeias causais preexistentes.

Não foram acrescentadas combinações sintéticas de componentes SAP. Aumentou o conhecimento estruturado, não o número de FMEAs tecnicamente aprovadas.

## Comparativo da camada semântica

| Entidade | v1.3.6 | v1.3.7 | Significado |
| --- | ---: | ---: | --- |
| Condições-alvo | 7 | **18** | O que se poderia detectar em fluido, superfície, pressão, temperatura ou geometria |
| Atividades planejadas | 8 | **18** | Coleta, inspeção, teste ou serviço que poderia ser executado conforme OEM |
| Danos candidatos | 4 | **9** | Possível alteração física que exigiria prova independente |
| Agrupamentos por regra PM | 4 | **9** | Intenção de prevenção ou monitoramento, não vínculo OEM confirmado |
| Relações tipadas | 22 | **53** | Conexões que preservam a natureza das entidades |
| Cenários sintéticos de regressão | 7 | **14** | Contraexemplos para bloquear promoção automática a dano |
| Cadeias com efeito local/sistêmico documentado | 0 | **24/24** | Possíveis efeitos, nunca impacto observado |
| Gravidades/probabilidades preenchidas | 0 | **0** | Não há observações para cálculo |

## Frentes técnicas incorporadas

### 1. Lubrificação do motor diesel

**Condições possíveis:** restrição diferencial suspeita no filtro, partículas e resíduos no lubrificante, pressão indicada baixa. **Atividades:** coleta de amostra de óleo, troca/inspeção de filtro removido e medição de pressão com ponto e critério OEM. **Dano candidato:** restrição efetiva do elemento de filtro.

O fabricante recomenda inspecionar o filtro removido para procurar resíduos e consultar o OMM específico. O elemento examinado não significa que havia restrição antes da remoção. **Filtro substituído ≠ filtro obstruído**; **pressão baixa ≠ filtro obstruído**. Teste, condição e método precisam distinguir bomba, sensor, viscosidade, nível e outros mecanismos.

A atividade publicada é **proposta didática**, não uma instrução autossuficiente de execução. Se for necessário abrir o elemento para inspeção, ele não deve ser reinstalado após a abertura. Coletar óleo **antes** de substituição de óleo/filtro para preservar rastreabilidade do estado anterior, quando aplicável ao procedimento.

### 2. Hidráulica

**Condições possíveis:** contaminação do óleo, vazamento externo suspeito, pressão funcional baixa e cobertura de mangueira desgastada. **Atividades:** amostragem, exame de roteamento, localização de origem na região da bomba e teste funcional controlado. **Danos candidatos:** perda de integridade da mangueira e perda efetiva de vedação da bomba.

Uma mancha sobre bomba/mangueira pode vir de uma conexão superior. Partículas no óleo **não** identificam por si só qual bomba ou válvula apresenta dano. Baixa pressão **não** identifica a bomba sem controlar comando, temperatura, carga, instrumento e válvulas.

**Limitação SAP persistente:** `hydraulic-hose-leak` continua sem subgrupo HSVV coerente no circuito de implementos. Nenhum alias ou componente foi inventado neste ciclo.

### 3. Material rodante

**Condições possíveis:** desgaste geométrico aparente do rolete, aquecimento localizado, resíduo oleoso próximo à vedação e guiamento/desgaste da roda-guia. **Atividades:** medir por CTS, inspecionar vedação/detritos e conferir geometria da roda-guia. **Danos candidatos:** deterioração interna do rolete e desgaste da roda-guia/elementos associados.

O CTS apoia o acompanhamento de desgaste. Não determina automaticamente a causa. Rolete quente pode ter detritos restringindo giro ou falha interna; aparente desgaste de roda-guia não equivale a rolamento condenado. Sem OMM, procedimento de medição, limite aplicável e identificação por posição, o parecer permanece **não homologado**.

**Limitação SAP persistente:** `track-idler-wear` não identifica rolamento específico dentro do objeto cadastrado; não adicionar peça apenas para gerar vínculo.

## Efeitos locais e sistêmicos: nova camada

Arquivo [causal-effects.v1.json](../data/knowledge/causal-effects.v1.json).

Cada uma das **24 cadeias** recebeu:
- `localEffect`: degradação possível no próprio componente, interface ou subsistema;
- `systemEffect`: consequência **possível** na função operacional, condicionada à propagação do mecanismo;
- `propagationCondition`: declara necessidade de condições reais, carga, duração e arquitetura;
- `diagnosticCaveat`: declaração do que o sintoma isolado **não** prova;
- `sourceIds`: referências já presentes na cadeia;
- `severityRank=null`, `probability=null`, `actualEventCount=0`, `applicableLocationId=null`.

Exemplos:

| Mecanismo | Efeito local potencial | Efeito sistêmico potencial | Não concluir |
| --- | --- | --- | --- |
| Abrasão de mangueira | Perda progressiva de cobertura/retenção | Fuga e perda de função hidráulica se progredir | Abrasão já significa ruptura |
| Fadiga de rolamento do comando final | Descascamento de pista e aumento de folga | Prejuízo à transmissão de torque, se evoluir | Ruído isolado comprova fadiga |
| Restrição externa do radiador | Menor passagem de ar/rejeição térmica | Falha no requisito de temperatura sob demanda | Radiador internamente entupido |
| Perda de pré-carga de parafuso | Compressão insuficiente na junta | Micromovimento/desgaste de sapata–elo | Parafuso girou para afrouxar |
| Rolete aquecido | Atrito ou arrasto possíveis | Desgaste secundário de rodante | Rolamento necessariamente avariado |

**A classificação qualitativa do efeito não é ocorrência de falha nem severidade FMEA atribuída.**

## Fontes técnicas

Fontes adicionadas ao índice [sources.v1.json](../data/research/sources.v1.json):

1. [Caterpillar — Troca de filtro de óleo do motor](https://www.cat.com/en_US/blog/change-cat-engine-oil-filter.html): inspeção do elemento removido, resíduos, serviço conforme OMM;
2. [Caterpillar — Análise técnica da hidráulica](https://www.cat.com/en_US/blog/cat-hydraulics-tests-hydraulic-system-inspection.html): diferenciação por ensaios como deriva de cilindro, ciclo e outros testes específicos;
3. [Caterpillar — Filtros hidráulicos e controle de contaminação](https://www.cat.com/en_US/blog/replace-cat-hydraulic-filters.html): relação entre limpeza e proteção de bombas/válvulas, sem concluir avaria pela presença isolada de contaminante;
4. [Caterpillar — Manutenção de rodantes de tratores de mineração](https://www.cat.com/en_US/blog/mining/articles/dozer-undercarriage-maintenance-and-management.html): roletes, vedação, roda-guia e CTS.

Também foram reutilizadas fontes Caterpillar de inspeção de mangueiras, S·O·S e CTS, mais a [ISO 13379-1:2025](https://www.iso.org/standard/88027.html), cujo **resumo oficial**, não o texto integral, orientou o vocabulário de monitoramento e interpretação. Não se declara conformidade normativa ou efetividade de procedimento para série específica.

## Entregas técnicas e validações

- [Ontologia ampliada](../data/ontology/condition-action-damage.v1.json)
- [48 descrições de efeitos em 24 cadeias](../data/knowledge/causal-effects.v1.json)
- [JSON Schema de efeitos](../schemas/causal-effects.schema.json)
- [14 cenários de regressão](../data/quality/semantic-regression-fixtures.v1.json)
- `scripts/validate-condition-action-damage.mjs` atualizado com novo patamar de cobertura
- `scripts/validate-causal-effects.mjs` para IDs, referências, efeito local/sistêmico, condição de propagação e impedimento de dados empíricos não autorizados
- `npm run effects:validate` e `npm run semantics:validate` integrados no GitHub Actions
- `scripts/audit-quality.mjs` atualizado para contabilizar entidades e efeitos hipotéticos.

**Validação:** o CI verifica consistência estrutural e ausência de promoções indevidas; não substitui avaliação OEM nem perícia mecânica.

## Lacunas que continuam abertas

1. **Dez regras PM sem correspondência estrita** no cadastro de componentes/sistemas (ver ciclo v1.3.5).
2. **24 cadeias e seus efeitos sem homologação individual por modelo/série**.
3. **Nenhum evento de campo importado**; as regressões são inteiramente sintéticas.
4. Sem severidade, ocorrência, detectabilidade ou RPN empíricos, pois faltam critérios e dados observados representativos.

## Próximo ciclo sugerido — v1.3.8

Priorizar **governança e qualidade das evidências** antes de nova expansão volumétrica:

- registrar `evidenceRequirement` com qualidade amostral, condição operacional, método e método de contraprova;
- definir fluxo formal de revisão `inferido → revisado_por_engenharia → aplicabilidade_OEM_confirmada`, com aprovador e fontes;
- avaliar causas circulares do catálogo SAP (`Afrouxado` × `Folga ou afrouxamento`) sem criar dados ou códigos artificiais;
- dar prioridade a revisão de componentes reais do sistema hidráulico e do rodante em documentos OEM efetivos.

Nenhuma alteração no PORCARIA nem em outros consumidores foi realizada neste ciclo.
