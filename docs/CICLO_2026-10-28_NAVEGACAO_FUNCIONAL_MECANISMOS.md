# Ciclo v1.3.83 — Navegação por função, mecanismos e vínculos rastreáveis

**28/10/2026 · Catálogo v1.3.83 · Biblioteca de hipóteses para Engenharia/PCM**

## Objetivo

A consulta técnica [`docs/consulta-fmea.html`](consulta-fmea.html) passa a explicar **por que duas regras são referenciadas juntas** em material conceitual público, sem apresentar uma hipótese geral como causa de falha real. O avanço não cria uma rede de causalidade aprovada; cria um **índice de proveniência e fronteiras de interpretação**.

## Três classes diferentes de relação

**1. Mesma cadeia genérica catalogada (fonte explícita).** O arquivo `data/knowledge/causal-chains.v1.json` contém **24 cadeias genéricas**, cada uma com função, modo de falha, famílias de mecanismo e referências públicas catalogadas. Se dois IDs de regras constam do campo `preventionRuleIds` da **mesma cadeia**, a interface mostra esse vínculo, o ID de cadeia e seu título. A cadeia continua com `inferido_com_literatura_geral`, sem evidência de ocorrência, efetividade por série ou assinatura.

**2. Mesmo nó semântico genérico.** O arquivo `data/quality/pm-semantic-crosswalk-policy.v1.json` já descreve **11 condições ou ações compartilhadas**. Dois registros podem discutir água no combustível, indício de óleo externo ou detritos de comando final sem que isso prove defeito no mesmo componente. A interface mostra o ID do nó, o significado do compartilhamento e a discriminação pendente. Esses vínculos não são cadeias de causa comprovadas.

**3. Semelhança estrutural proposta para revisão.** As sugestões existentes por sistema/subgrupo continuam em uma seção **separada e explicitamente intitulada “Sugestões estruturais — revisão necessária”**. Elas não são promovidas a vínculos sustentados por cadeia ou condição documentada. A ausência de vínculo nos arquivos não significa inexistência física de um mecanismo.

## Cobertura rastreada

O grafo não inclui links por simples coincidência de palavras ou compartilhamento isolado de um código `ME-xx`. Usando os registros públicos existentes, obtêm-se:

| Indicador | Quantidade |
| --- | ---: |
| Regras preventivas no explorador | 25 |
| Cadeias funcionais conceituais de origem | 24 |
| Nós semânticos genéricos de origem | 11 |
| Pares de regras com relação explícita nas fontes | 6 |
| Pares com referência compartilhada a cadeia | 4 |
| Pares com nó genérico compartilhado | 3 |
| Pares sujeitos a restrição de domínio | 4 |
| Causas ou mecanismos verificados em campo | 0 |

Os subconjuntos de pares por cadeia e por nó semântico **podem se sobrepor**; não somar 4+3 como sete pares distintos.

## Exemplo de análise mecânica

- **Comando final, engrenagem × rolamento:** há referências a três cadeias genéricas conjuntas e cinco condições/ações compartilhadas. Isso não permite inferir que detritos magnéticos ou ruído tenham origem identificada: a fonte impõe restrição contra compartilhar automaticamente danos físicos entre engrenagem e rolamento.
- **Material rodante, rolete × roda-guia:** existe referência conjunta a uma cadeia genérica; a regra de domínio existente impede tratar dois componentes distintos como o mesmo objeto ou transferir códigos indiscriminadamente.
- **Tanque de combustível × filtro:** só há nós semânticos genéricos compartilhados. Sedimento/água no circuito e uma proposta de amostragem não demonstram defeito de dreno ou elemento filtrante.
- **Mangueira hidráulica × vedação da bomba:** compartilhamento genérico de condição/ação, sem confirmação do ponto de origem do óleo.
- **Correia × rolamento do ventilador:** uma cadeia genérica vincula os dois registros em estudo; não significa que a falha do rolamento foi identificada apenas pelo ruído ou tensionamento.

## Implementação e auditoria

- `scripts/lib/pm-functional-navigation.mjs`: índice determinístico de cadeias, mecanismos ontológicos, nós genéricos e vínculos por par de regra, com restrições de domínio.
- `docs/consulta-fmea.html`: catálogo e índice incorporados no próprio HTML, sem rede; navegação por referências explícitas, além da navegação por semelhança estrutural; as fichas Markdown levam a proveniência sem aprovar hipóteses.
- `scripts/audit-pm-functional-navigation.mjs`: comparação integral dos dados incorporados com as fontes versionadas, verificação de todos os pares, sintaxe JavaScript, segurança de implantação e testes de adulteração de mecanismo, evidência, enquadramento e aprovação.
- `reports/pm-functional-navigation.generated.json`: resultado do CI, regenerável por `npm run pm:functional:navigation:audit`.

## Fronteiras operacionais

**Todos os vínculos são documentais e genéricos.** Não foi realizado ensaio, calibração, inspeção física, validação OEM por série, análise SAP real nem confirmação de causa. As **dez exceções PM×SAP** (cinco P0/cinco P1 documentais) e os **oito gates privados** continuam bloqueados; nenhuma regra muda de prioridade, FMEA é aprovada ou OS é gerada.

**Decisão:** `NO_GO`. Uso como apoio à **formulação de hipóteses e preparação de revisão técnica**, não execução automática em equipamentos.
