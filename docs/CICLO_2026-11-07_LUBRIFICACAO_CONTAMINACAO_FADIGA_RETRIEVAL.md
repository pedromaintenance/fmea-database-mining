# Ciclo 1.4.4 — Filme lubrificante, partículas, fadiga de contato e busca verificável

**07/11/2026 | Acervo técnico público | Status: conceitual, revisão independente pendente**

## Objetivo
Expandir conhecimento mecânico e sua recuperação por humanos e agents. O trabalho não produz FMEA aprovada, parâmetros OEM específicos, resultados reais de ensaio ou métricas industriais de campo.

## Novos fundamentos (schema v2)

| Registro | Função e fenômeno | Contraprovas necessárias |
| --- | --- | --- |
| `TK-TRIB-FILM-001` | Formação de película lubrificante em contatos rolantes, EHL, separação de asperezas e regimes misto/limite | Lubrificante/temperatura/carga versus contaminação, desalinhamento e condição geométrica |
| `TK-FLUID-SOLIDS-001` | Partículas sólidas no fluido, amostragem, limpeza ISO 4406 e filtragem | Ingresso externo versus detritos internos versus contaminação da coleta |
| `TK-BRG-RCF-001` | Fadiga de contato iniciada na superfície ou subsuperfície; trincas e descascamento em rolamentos | Filme insuficiente, partículas/indentação, carga/alinhamento e outros danos |

A fonte canônica são os arquivos versionados em `data/knowledge/fundamentals/`. As fichas mantêm `CONCEPTUAL`, `PENDING_REVIEW`, `fieldObservations:0`, `performedTests:0`, `verifiedSerials:[]` e nenhuma aprovação operacional/SAP. A versão v2 do contrato agora aceita registros `recordVersion:1.4.3` e `1.4.4`, preservando os três verbetes anteriores.

## Pesquisa e referências primárias
O registro foi ampliado de 90 para **94 referências** com três publicações da SKF e os metadados públicos da ISO 15243:

- [SKF — Grease lubrication mechanisms in rolling bearing systems](https://evolution.skf.com/us/grease-lubrication-mechanisms-in-rolling-bearing-systems/): dinâmica de óleo base, espessante, filme EHL e reposição em rolamentos lubrificados por graxa. **Não define parâmetro universal para equipamento CAT/Sandvik.**
- [SKF — Contamination and bearing life](https://evolution.skf.com/contamination-and-bearing-life/): efeitos de partículas duras, indentações e tensões superficiais em rolamentos, com contexto experimental específico. **Resultados laboratoriais não são benchmark de toda uma frota.**
- [SKF — How to understand ISO 15243](https://evolution.skf.com/bearing-damage-analysis-iso-15243-is-here-to-help-you/): diferencia classificação de fadiga superficial e subsuperficial. **Explicação de fabricante, não substitui norma completa.**
- [ISO 15243:2017 — registro e resumo oficiais](https://www.iso.org/standard/59619.html): norma de classificação de danos e falhas em rolamentos, confirmada em 2022 e em processo de revisão. **O texto normativo licenciado não foi copiado.**

Reaproveitados os registros anteriores **ISO 4406:2021**, **SKF — Wear and surface fatigue in rolling bearings** e **Parker — Handbook of Hydraulic Filtration**. A ISO 4406 descreve contagem de partículas; não identifica a origem ou causa raiz de uma falha. A revisão bibliográfica documentada é direcionada às quatro fontes novas, não comprovação global dos links, licenças ou atualidade das 94 referências.

## Avaliação inicial de recuperação: 50 perguntas
- **36** consultas conceituais, com ID esperado de uma das seis fichas.
- **8** solicitações de autorização/limite OEM/causa confirmada, nas quais o correto é **abster-se**.
- **4** perguntas que combinam dois mecanismos, nas quais a recuperação deve preservar múltiplas interpretações.
- **2** questões fora do corpus de seis fichas, que devem retornar `NOT_FOUND_IN_CATALOG` (ausência **nesse corpus**, não no restante do repositório).

Arquivos:
- `data/quality/fundamentals-retrieval-golden.v1.json` — perguntas e saídas esperadas.
- `scripts/lib/fundamentals-retrieval.mjs` — baseline **determinística de palavras-chave**, com sinalização de ambiguidade e abstenção.
- `scripts/query-fundamentals.mjs` — ferramenta local read-only: `npm run knowledge:fundamentals:query -- --query "O que é spalling?"`.
- `scripts/audit-fundamentals-retrieval.mjs` — compara status e IDs nas perguntas, valida fontes e gera `reports/fundamentals-retrieval-baseline.generated.json`.
- No Pages: `fundamentals-retrieval-baseline.v1.json` para inspeção pública do teste.

**Limitação metodológica crítica:** tanto as perguntas quanto as palavras-chave foram curadas no mesmo ciclo. Acertar esse conjunto **não mede a precisão de um LLM, generalização a perguntas inéditas, qualidade de diagnósticos ou segurança operacional real**. O relatório serve como regressão de roteamento/recusa e como ponto de partida para uma avaliação humana independente. Nenhum ranking industrial ou taxa real de falha foi criado.

## Portais e interoperabilidade
O catálogo curado cresce de 18 para **21 entradas**. O portal `fundamentos-hidraulica-tribologia.html` passa de três para seis fichas, gerado a partir dos arquivos canônicos; o JSON de todas as fichas permanece em `fundamentos-tecnicos.v1.json`. AGENTS, skill de consulta, contrato para IA, roadmap e `llms.txt` foram alinhados. O Pages executa as auditorias antes da publicação.

## Backlog técnico do ciclo seguinte (1.4.5)
1. Reunir **perguntas inéditas** de trabalhadores, inspetores e engenheiros, anonimizadas e sem dados da frota, separadas do vocabulário das regras, para uma avaliação não calibrada no próprio conjunto.
2. Ampliar literatura OEM/normas sobre **lubrificação de comandos finais e rolamentos, vedação e interpretação SOS**, identificando diferenças entre sistemas/compartimentos.
3. Iniciar fichas de **funções e arquitetura de sistemas** (bomba-regulador-válvula-atuador e rolamento-eixo-vedação-lubrificante), vinculando mecanismo ao sistema e ao componente.
4. Registrar conflitos e revisões técnicas humanas com fonte, objeção, decisão editorial e data. Não promover maturidade apenas por passar CI.
5. Desenvolver pesquisa de benchmark quantitativo com unidade, população, denominador e período antes de publicar números.

## Limites operacionais
Nenhum resultado de campo, limite de pressão, torque, contagem aceitável, vida útil, recomendação de troca, revisão OEM por série, alteração SAP ou liberação foi incluído. A biblioteca serve para **formular hipóteses e orientar pesquisa**, não executar ordens ou substituições automaticamente.
