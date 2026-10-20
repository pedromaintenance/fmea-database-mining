# Modelo de dados e arquitetura

## Contexto

O repositório **não** é um FMEA aprovado para uso em manutenção. O nome FMEA descreve a intenção de estruturação de relações entre função, modo de falha, mecanismo, consequência e detecção; os primeiros registros são extrações de catálogos e combinações *candidatas*.

A aplicação didática usa seis escolhas: **sistema → grupo → subgrupo → componente → dano → causa**. O identificador funcional deve preservar **modelo e posição** do conjunto (ex.: motor esquerdo / direito).

## Camadas (não misturar)

| Camada | Conteúdo | Natureza |
| --- | --- | --- |
| Locais funcionais | Sistema/grupo/subgrupo, código, descrição, posição, tipo de objeto | Derivado do catálogo fonte |
| Partes elegíveis | Tipo de objeto SAP → códigos de componentes | Vínculo catalogado; não implica falha |
| Danos / causas | Códigos e critérios descritivos | Taxonomia |
| Candidatos | Local + componente + dano + causa | **Inferência heurística**, requer curadoria |
| Sintomas | Relato, condição, parâmetros, tendência | Observações didáticas ou reais explicitamente identificadas |
| Evidências | Inspeção, ensaio, resultados e força discriminante | Positiva/negativa/inconclusiva |
| Hipóteses | Alternativas causais, critérios, testes | Suspeita / corroborada / refutada / confirmada |
| Caso jogável | Cenário, pistas graduais, gabarito, validação | Simulação revisada |
| Eventos e DTCs | Identificador, módulo, descrição, contexto | Pistas; **não são causas** |

## Formato do lote 1.0.0

Um identificador de caminho incorpora a família/modelo e o triplo local:

```json
{
  "id": "EQ02|ENS1|COSY|FANN",
  "modelo": "EQ02",
  "sistema": { "codigo": "ENS1", "nome": "Sist Motor;Posição 1" },
  "grupo": { "codigo": "COSY", "nome": "Sist Resfriam" },
  "subgrupo": { "codigo": "FANN", "nome": "Ventilador" },
  "objetoTipoSAP": "FANN"
}
```

Uma combinação candidata **é somente uma tupla de chaves**:

```json
["EQ02|ENS1|COSY|FANN", "0210", "06.05", "C2.11"]
```

Campos, nesta ordem: `locationId, componentCode, damageId, causeId`. A descrição é obtida com junção do local, `partsByObjectType`, `damages` e `causes`. Não duplicar descrições em centenas de milhares de linhas.

## Esquema de caso (v1.1 proposto)

Um caso terá `id`, `modelId`, `diagnosticPath`, `operatorReport`, `observations`, `hypotheses`, `tests`, `evidence`, `verification`, `provenance`, `review` e `gameplay`. O esquema versionado está em [schemas/case.schema.json](../schemas/case.schema.json).

- **Observação:** o que foi medido/visto/ouvido, em quais condições, por quem e com qual método.
- **Sintoma:** manifestação de perda/degradação de função; pode apontar várias causas.
- **Teste:** intervenção diagnóstica com pré-condições e limites de interpretação.
- **Evidência:** resultado de um teste ou inspeção. Pode sustentar, enfraquecer ou ser inconclusiva para uma hipótese.
- **Causa confirmada:** status especial, nunca inferido automaticamente de um código eletrônico.
- **Mecanismo:** como ocorre o dano. Diferenciar causa imediata, contribuinte e raiz sistêmica.

## Compatibilidade com o jogo

Repositório consumidor: https://github.com/pedromaintenance/porcaria-voce-quebra-eu-conserto

O jogo atualmente dispõe de `game-data.json` com 9 modelos, caminhos e 29 casos didáticos. Um adaptador deverá mapear IDs e nomes do novo catálogo para `models`, `paths`, `catalog` e `scenarios` sem alterar os casos originais implicitamente. **Somente casos publicados como curados** poderão entrar no sorteio do jogo; nunca distribuir gabaritos na interface antes da confirmação das seis etapas.

## Dimensionamento

Não carregar meio milhão de combinações na primeira tela. Manter catálogo normalizado em arquivo central e gerar/consumir tabelas de combinação por modelo sob demanda. Uma vez gerado, cada lote deve ser identificado com versão, hash/checksum e metodologia de geração.
