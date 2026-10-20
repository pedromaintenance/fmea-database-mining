# Arquitetura do conhecimento FMEA Mining — contrato de domínio

## 1. Fronteira permanente do projeto

Este repositório é **produtor de conhecimento técnico de manutenção e confiabilidade**. Pode servir jogos, consultas, sistemas de treinamento e futuras análises; **não desenvolve, instala ou altera qualquer consumidor**. Compatibilidade externa é responsabilidade de um contrato de dados versionado, independente de interfaces gráficas.

Os dados não são FMEA aprovada, histórico empírico ou procedimento de serviço. Toda transição de `inferido` para `validado` exige registro de revisão e evidência adequada. O nome FMEA do projeto não autoriza afirmar conformidade com IEC 60812.

## 2. Entidades e significado mecânico

| Entidade | Pergunta | Exemplo genérico | Não confundir com |
| --- | --- | --- | --- |
| `EquipmentModel` | Em que arquitetura? | Escavadeira hidráulica | Máquina individual ou prefixo de série confirmado |
| `FunctionalLocation` | Onde? | Motor / arrefecimento / ventilador | Componente, dano, causa |
| `Function` | O que deve fazer? | Dissipar calor suficiente em carga definida | Tarefa de preventiva |
| `FunctionalFailure` | Qual requisito deixa de atender? | Não manter temperatura requerida | Mecanismo que gerou a falha |
| `FailureMode` | Como a função local deixa de ser entregue? | Vazão insuficiente, perda de estanqueidade | Código de dano ou causa raíz necessariamente |
| `Component` | Qual item concreto? | Mangueira, sensor, rolamento | Local funcional |
| `Damage` | Que alteração ocorreu? | Trincado, desgastado, corroído | Falha funcional |
| `Mechanism` | Qual processo material leva ao dano? | Fadiga, abrasão, corrosão | Evidência de que ocorreu |
| `Cause` | Que condição desencadeou/contribuiu? | Lubrificação insuficiente, montagem inadequada | Efeito percebido pelo operador |
| `Local/SystemEffect` | Que impacto provoca? | Perda de pressão, restrição de movimento | Frequência empírica |
| `Symptom` | Que manifestação é relatada? | Ruído crescente sob carga | Causa comprovada |
| `TestMethod` | O que discrimina alternativas? | Medição de pressão, inspeção de filtro | Resultado do teste |
| `Evidence` | O que foi obtido? | Resultado e condição da medição | Exame planejado não executado |
| `PreventiveTask` | Qual mecanismo a PM procura prevenir/detectar? | Inspecionar condição de vedação | Registro de falha real |
| `TechnicalSource` | Quem sustenta a afirmação e para que configuração? | Norma geral, manual por série | Licença para copiar o documento |

Relação geral: **Localiza função → identifica falha funcional → descreve modo/mecanismo → examina dano/causa → associa sintomas → testa hipóteses**. A direção inversa (sintoma → causa) **não é determinística**.

## 3. Tipos de relações no grafo

- `located_in`: componente, sistema ou método aplicável ao local;
- `may_manifest_as`: falha pode produzir sintoma, sem garantir que ocorrerá;
- `may_be_detected_by`: técnica pode detectar manifestações;
- `consistent_with` / `inconsistent_with`: evidência interpretada sob condições documentadas;
- `may_cause` / `may_contribute_to`: mecanismo e condições causais possíveis;
- `prevention_targets`: tarefa busca evitar/detectar determinada condição.

As arestas devem ter **`sourceId`, `evidenceNature`, `reviewStatus`, `applicability`, `limitations`**. Não usar uma aresta de material genérico como prova de aplicabilidade a uma máquina e série.

## 4. Duas naturezas de dado distintas

**Fatos documentais/cadastrais:** nomenclatura e códigos de um cadastro; conteúdo conceitual de fonte primária; intervalos de PM apenas quando origem e vigência forem conhecidas.

**Inferências e simulações:** associação de dano/causa, hipótese concorrente, ensaio proposto, resultado de laboratório fictício, probabilidade de decisão, custo de jogo.

Os dois tipos nunca devem ser promovidos por uma simples junção entre tabelas. `test_planned` não é `test_observed`. `causal_explanation_plausible` não é `root_cause_confirmed`.

## 5. Fluxo de promoção

```text
importado / extraído
   └─ verifica proveniência e direitos
inferido
   └─ revisão mecânica de coerência e configuração
revisado_por_especialista
   └─ bibliografia OEM efetiva e condições de teste coerentes
aplicabilidade_oem_confirmada
   └─ revisão independente do caso didático e resultados discriminantes
validado_com_evidencias (didáticas ou empíricas, natureza discriminada)
```

**Nunca usar dados sintéticos para certificar uma ocorrência real.** Observações reais requerem autorização da fonte e processo de desidentificação/autorização antes da publicação.

## 6. Contrato para consumidores externos

A base poderá expor futuramente apenas **pacotes versionados e derivados**. O consumidor determina como mostrar, mas o produtor disponibiliza:

- `manifest`: versão semântica, hash, idioma, cobertura, revisão e classes;
- `catalog`: IDs estáveis e descrições em PT/EN;
- `graph`: relações `sourceId`, confiança e limites;
- `diagnostic`: relatos, hipóteses concorrentes, testes e resultados condicionais;
- `provenance`: origem conceitual, revisão técnica e restrições.

Pacotes públicos não incluem arquivos brutos ou identificadores corporativos. A existência de um exportador de prévia não impõe mudança em qualquer produto consumidor.

## 7. Política de pesquisa

Norma e literatura OEM são usadas como **fontes de conceitos e verificação**, não como materiais a copiar. Priorizar IEC 60812 (análise FMEA), ISO 14224 (modelo de informação de confiabilidade, adaptado à mineração), ISO 17359 (monitoramento), Caterpillar SIS/S·O·S e Sandvik por configuração. Registrar texto autoral próprio e apontadores para literatura. Valores de aceitação, códigos de falha, torques, peças e permissivos dependem do manual e efetividade aplicáveis.

## 8. Qualidade mensurável

Distinguir:
- **Cobertura cadastral:** locais com candidatos / locais com caminho completo.
- **Cobertura de curadoria:** relações tecnicamente revisadas / relações elegíveis.
- **Qualidade de evidência:** casos com métodos, contexto e três possibilidades de resultado / casos.
- **Rastreabilidade:** arestas com fonte, edição, nível de revisão e limite de aplicabilidade.
- **Conflitos/lacunas:** regras sem saída, local com subgrupo ambíguo, código de dano não aplicável.
- **Confiabilidade observada:** somente pode ser calculada com população/exposição, período e falhas reais autorizadas.

O relatório `reports/quality-audit.generated.json` é gerado em CI e **não contém taxas empíricas**.

## 9. Fontes de trabalho e controle de direitos

Os sete planos preventivos e os catálogos SAP de origem contêm materiais de trabalho e informações possivelmente confidenciais. Os registros íntegros permanecem fora do GitHub público; os padrões genéricos autorais e contagens agregadas já disponíveis são tratados separadamente. A liberação de novos derivados exige autorização de divulgação.
