# Ciclo v1.3.59 — Filtragem do compressor e estrutura COMR/VPAR (BUNDLE-25)

**24/10/2026 | Catálogo 1.3.59 | Ontologia 1.3.23**

## Escopo e função física
A regra `drill-compressor-filter` (`ar_comprimido`, parte textual **Filtro**, modelos internos EQ05/EQ06, código de subgrupo declarado COMR) passa a ter `BUNDLE-25` de **hipóteses semânticas genéricas**. É a **25ª de 25 regras preventivas** com bundle na base. A conclusão de cobertura **não** significa FMEA homologado por equipamento, ocorrência de falha, efetividade OEM por série ou instalação de peças.

A matriz existente `data/quality/pm-vpar-evidence-plan.v1.json`, versão 1.3.38, possui sete gates de avaliação privada e registra que **COMR é grupo, não subgrupo COMR validado no AISY**. A exceção `subgroup_not_in_scope` continua bloqueada em `data/quality/pm-gap-review.v1.json`. A alternativa de subgrupo VPAR **não** foi aprovada. Não há correção cadastral ou alteração de códigos 03.02/C2.09.

## Quatro circuitos distintos

| Circuito concorrente | Função teórica | Verificação indispensável |
| --- | --- | --- |
| `compressor_air_intake` | Proteger admissão de compressor de partículas | Diagrama, elemento, eventual compartilhamento com admissão do motor |
| `compressor_lubricating_oil` | Filtrar óleo de lubrificação do compressor | BOM, circuito de óleo, bypass, sensores, viscosidade |
| `air_oil_separation` | Separar aerossóis de óleo da descarga | Separador efetivo, retorno de óleo, nível, pressão diferencial |
| `receiver_tank_filtration` | Filtragem/separação hipotética junto ao receptor | Primeiro provar que o elemento existe; condensado também decorre de umidade/dreno |

Esses quatro diferenciais já existiam no relatório `data/research/pm-vpar-function-differentials.v1.json` v1.3.37 e foram **preservados**, sem migrar ou duplicar o conteúdo de inspeção privada.

## Sintomas, consequências e contraprovas

- Restrição na admissão pode reduzir vazão, mas pode derivar de pré-limpador, duto, válvula de admissão ou sensor.
- Pressão/temperatura do óleo podem mudar por viscosidade, bomba, bypass ou controle, sem comprovar elemento saturado.
- Arraste de óleo na descarga também depende de nível, retorno e estado operacional; não é diagnóstico de ruptura do separador.
- Pressão diferencial através de um conjunto só pode ser interpretada com pontos de tomada e condição de fluxo OEM confirmados.
- Água no reservatório não demonstra elemento filtrante instalado ou avariado; umidade ambiental e drenagem são alternativas.
- Queda de vazão no circuito de ar não identifica automaticamente filtro, compressor, válvula, demanda ou vazamento.

Adicionados **6 indícios não observados, 5 inspeções propostas não executadas, 3 danos candidatos, 14 relações tipadas e 2 casos didáticos sintéticos**. Danos candidatos: meio do filtro de admissão, elemento filtrante de óleo do compressor e meio separador ar–óleo. O reservatório não recebe dano de filtro atribuído sem comprovação de peça.

## Segurança e qualidade da evidência
Nenhum sistema, filtro, separador ou vaso pode ser aberto sob pressão ou temperatura residual. Aplicar isolamento e purga conforme OEM, confirmar **pressão zero**, proteção contra energia pneumática e térmica, e avaliação de acesso. Não propor substituição, descarte, lavagem, limpeza ou teste improvisado, nem inserir pressão diferencial ou intervalos universais.

As referências são **contexto de família**, não prova de instalação na mina:
- [Sandvik — DR410i CAT C18 maintenance planner](https://www.mining.sandvik/globalassets/parts-services/genuine-consumables-and-kits/pdf/dr410i-maintenance-planner-cat-c18-english.pdf): exemplos de filtro de admissão e filtro principal de óleo do compressor (material já catalogado, sem efetividade por série).
- [Sandvik — DR410i Cummins maintenance planner](https://www.mining.sandvik/globalassets/parts-services/genuine-consumables-and-kits/pdf/dr410i-maintenance-planner-cummins-english.pdf): demonstra a necessidade de conferir variantes, não intercambialidade automática.
- [Atlas Copco — filtros e separadores de ar](https://www.atlascopco.com/pt-br/compressors/service/parts/air-compressor-filters): diferencia funções de filtro de ar, óleo e separador ar–óleo em compressores.
- [Kaeser — manutenção de compressor](https://us.kaeser.com/compressed-air-resources/compressed-air-tips/compressor-maintenance-checklist.aspx): diferencia pressão baixa, arraste de óleo, separador e válvula de admissão.

## Gates e auditoria
`data/quality/pm-drill-filter-boundaries.v1.json` define **10 gates ainda pendentes**, 18 salvaguardas, seis limites numéricos nulos, quatro circuitos sem instalação comprovada e proibição de mapeamento automático.
`scripts/audit-pm-drill-filter.mjs` aplica **42 mutações adversariais** para reprovar registro falso de dano, troca executada, instalação de filtro no vaso, retirada de bloqueio SAP, parâmetros OEM ou mudança de escopo; relatório `reports/pm-drill-filter.generated.json`.

**Totais esperados após a v1.3.59:** 25/25 regras PM modeladas; 107 condições, 82 ações, 51 danos candidatos, 251 relações e 46 fixtures sintéticos. Ainda há 115 vínculos PM candidatos, dez exceções bloqueadas e **zero** observações reais, danos confirmados, ordens, medições e mapeamentos SAP homologados. Consumidores externos inalterados.

## Próximo eixo de trabalho: homologação progressiva
Encerrada a primeira camada de cobertura, mudar de prioridade: validar por ativo, variante, série e BOM, discriminar sintomas por evidência de campo, definir critérios OEM de condenação e endereçar os **10 bloqueios PM×SAP** em ambiente autorizado, com revisão técnica independente. Não tratar 100% de cobertura semântica como 100% de confiabilidade dos FMEAs.
