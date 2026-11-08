# Ciclo 1.4.12 — Filtragem hidráulica: diagnóstico diferencial conceitual

**08/11/2026 · Ampliação substantiva de conhecimento técnico · Motor e dez fichas do piloto congelado NÃO alterados**

## 1. Problema e função

Na manutenção de equipamentos hidráulicos, uma mesma manifestação — alerta de restrição em elemento filtrante, código de limpeza alterado, aviso elétrico ou sinal de bypass — pode corresponder a **mecanismos físicos ou de instrumentação diferentes**.

O elemento filtrante deve capturar contaminantes mantendo condições de fluxo e resistência adequadas ao sistema. O indicador pode observar queda de pressão, pressão estática ou um contato elétrico. A válvula bypass, quando existe, tem função, localização e condição de abertura específicas do projeto do conjunto.

A equação conceitual é **ΔP = p_montante − p_jusante**, mas **não há limiar universal** para trocar elemento, confirmar bypass, atribuir origem de contaminante ou liberar operação. Sem filtro, circuito e condição de viscosidade/vazão específicos, um valor publicado em catálogo é inadequado para a frota.

## 2. Evidências bibliográficas — o que cada fabricante sustenta

1. **Donaldson — [How to Replace Hydraulic Filters Correctly](https://www.donaldson.com/en/resources/technical-articles/replacing-hydraulic-filters/)**. O fabricante descreve filtros em posições distintas do circuito, compromisso entre eficiência de filtração e resistência ao fluxo e a possibilidade de bypass durante partida fria, transientes ou carregamento elevado. Também ressalta compatibilidade de projeto entre cabeçote e elemento. **Não demonstra** que determinado filtro da mina possua bypass, que esteja efetivamente aberto ou qual PN deve ser instalado.
2. **HYDAC — [Differential Pressure Clogging Indicator](https://catalog.hydac.com/item/clogging-indicators-differential/vd--high-pressure-type-bm--visual-manual-reset/303165)**. A página distingue indicação de ΔP, pressão estática e estado mecânico/elétrico do indicador. Descreve que aviso prévio e abertura de bypass são eventos relacionados à construção, **não logicamente equivalentes**. Valores e características da peça anunciada são particulares e **não devem ser transferidos** a equipamentos de outra marca/série.
3. **HYDAC — [Filter FAQs](https://betterfit-us.hydac.com/contact-us/faqs/filter-faqs/)**. Explica a importância da viscosidade em partida fria, fluxo, resistência de cabeçote, eficiência/estrutura do elemento e possíveis locais do bypass conforme família. **Não estabelece** a configuração nem o ajuste OEM de qualquer máquina CAT, Sandvik ou de outros OEMs.

Essas três fontes foram adicionadas ao registro público, que passa de **97 para 100 referências**. O catálogo de bibliografia preserva as fontes antigas e foi sincronizado com o arquivo canônico. A revisão deste ciclo se limitou especificamente às três novas fontes; **não houve nova verificação integral** de cem links.

## 3. Hipóteses concorrentes com mecanismo, indícios e contraprova

| ID | Hipótese | Mecanismo a diferenciar | Principal erro de interpretação |
| --- | --- | --- | --- |
| HF-MEDIA-LOADED | Saturação/carregamento do elemento | Partículas acumuladas aumentam resistência | Aviso de ΔP isolado = filtro definitivamente saturado |
| HF-VISCOSITY | Viscosidade elevada no frio | Maior resistência transitória ao fluxo | Aviso desapareceu quente = problema resolvido/operar liberado |
| HF-FLOW-SURGE | Vazão transiente ou filtro incompatível | Condição hidráulica ou montagem impacta ΔP | Elemento novo elimina toda possibilidade de restrição |
| HF-INDICATOR | Sensor/indicador/circuito de sinal | Medição estática versus diferencial, reset e cadeia elétrica | Luz acessa = medição real verificada ou bypass aberto |
| HF-BYPASS-STATE | Estado da válvula não confirmado | Abertura depende da pressão e da arquitetura do conjunto efetivo | Aviso = válvula aberta, mesmo sem identificação do bypass |
| HF-SAMPLING-CONFOUND | Código ISO 4406 sem relação comprovada | Ingresso externo, desgaste interno ou coleta inadequada | Partículas no frasco = bypass ou falha de bomba confirmada |

**NENHUMA hipótese foi testada em campo ou confirmada.** Todas estão marcadas \`UNCONFIRMED\`, com perguntas discriminantes e pelo menos duas referências públicas por hipótese.

## 4. Situações de uso conceitual

O [explorador de filtragem diferencial](https://pedromaintenance.github.io/fmea-database-mining/filtragem-diferencial.html) contempla seis contextos:
- indicador que atua somente durante partida fria;
- restrição persistente em condição comparável;
- aviso após substituição do filtro;
- contagem ISO 4406 elevada sem evidência equivalente de bypass;
- divergência entre aviso visual e elétrico;
- conjunto ainda não identificado como sucção, pressão ou retorno.

Cada contexto exibe **alternativas simultâneas**, o contexto documental ainda necessário e uma conclusão que não pode ser feita. Não há classificação automática, probabilidade, ranking, limite, seleção de PN, teste de pressão, decisão de liberação ou ação SAP.

### Exemplo de delimitação de nota de investigação (não é ordem de execução)

**Sintoma:** "Indicação de possível restrição de filtragem hidráulica registrada; condição e origem não confirmadas."

**Escopo de engenharia/PCM:** "Identificar o filtro e sua função no circuito, recuperar esquema e literatura OEM por configuração, confrontar histórico de elementos, temperatura, condição de fluxo e registros do indicador. Definir inspeções e medições somente conforme procedimento OEM validado e gestão de risco. Distinguir carregamento, transiente de viscosidade/vazão e leitura de instrumentação; avaliar evidência de bypass independentemente do alarme."

**Risco de postergação:** "A depender da arquitetura e do estado real, pode haver passagem não filtrada ou restrição de circulação com degradação de componentes. Não atribuir probabilidade nem severidade efetiva sem dados da máquina." 

**Disciplina:** Hidráulica/mecânica; possível apoio de elétrica/automação para medição e sinais.

Esse texto é ilustrativo e não autoriza abrir nota de serviço em ativo específico sem observação real, nem permite continuar operação com condição de segurança desconhecida.

## 5. Arquitetura e separação do piloto congelado

**Novos recursos, fora das dez fichas e do motor v2:**
- \`data/knowledge/hydraulic-filter-differential.v1.json\`: dossiê canônico legível por agentes, com seis hipóteses, seis cenários, fontes, indicações favoráveis e contrárias, dúvidas e limites.
- \`docs/filtragem-diferencial.html\`: visualização pública standalone com cenários alternáveis e fonte clicável, sem chamadas externas nem preenchimento de dado de ativo.
- \`scripts/build-filter-differential.mjs\`: projeção determinística do JSON e HTML.
- \`scripts/audit-filter-differential.mjs\`: auditoria de linhagem, hipóteses, indicadores de segurança, cenários, HTML e fontes, incluindo a verificação do lock dos arquivos da versão 1.4.11.
- \`data/research/sources.v1.json\`, \`data/catalog/source-discovery.v1.json\` e \`docs/fontes-tecnicas.html\`: bibliografia ampliada e reproduzida com paridade.

O motor \`scripts/lib/technical-discovery-v2.mjs\`, o grafo \`functional-architecture.v1.json\` e seus dez registros **não foram alterados**. A avaliação humana futura continuará acontecendo com os pacotes fixados na versão 1.4.11, sem que o novo dossiê contamine silenciosamente o conjunto do teste. A expansão de 1.4.12 deve ser identificada explicitamente como informação posterior, não como material de referência disponível aos revisores cegos do piloto.

## 6. Status e próximo passo de engenharia

- Fontes bibliográficas: **100**.
- Dossiê novo: **1**.
- Hipóteses: **6**, todas não confirmadas.
- Contextos de investigação: **6**.
- Valores/limites OEM por série: **0**.
- Testes executados ou ativos confirmados: **0**.
- Ordens SAP ou aprovações de manutenção: **0**.
- Perguntas/revisões humanas do piloto: **0**.

**Próximo passo concreto:** submeter o dossiê a revisão técnica de um especialista em hidráulica/filtração e obter documentação OEM da configuração efetiva antes de utilizar as perguntas em um caso de campo. Em paralelo, aplicar a coleta independente com os quatro pacotes de 1.4.11 sem introduzir este novo conteúdo como resposta antecipada.

**Síntese mecânica:** distinguir sintoma, princípio de indicação, mecanismo físico, evidência discriminante e causa raiz evita transformar um único sinal em uma intervenção incorreta.
