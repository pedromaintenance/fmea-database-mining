# Ciclo v1.3.84 — Mapa navegável de sistemas, regras, cadeias e mecanismos

**28/10/2026 · Engenharia de manutenção · Catálogo FMEA 1.3.84 · NO_GO**

## Entrega

A [consulta técnica offline](consulta-fmea.html) agora apresenta **um mapa visual navegável por sistema**, derivado dos dois catálogos públicos já incorporados ao HTML, sem acesso a dados de equipamentos, sistemas corporativos ou serviços externos.

O seletor **Sistema no mapa** permite navegar entre **13 sistemas**, incluindo comando final, arrefecimento, material rodante e hidráulica. A visualização apresenta quatro colunas, em ordem:

**Sistema → Regra preventiva → Cadeia funcional genérica → Família de mecanismo ontológico.**

Cada ligação representa **apenas a relação efetivamente documentada no catálogo**:

| Linha | Proveniência | Significado e limite |
| --- | --- | --- |
| Sistema → Regra | `system` na semente preventiva | Classificação estrutural, não localização física verificada |
| Regra → Cadeia | `preventionRuleIds` da cadeia `FC-...` | A regra é citada na cadeia genérica; não existe ocorrência confirmada |
| Cadeia → Mecanismo | `mechanismIds` da cadeia e ontologia `ME-...` | A cadeia foi anotada com uma família teórica; não há medição, dano ou causa raiz confirmada |

Nenhuma aresta é criada por simples coincidência de texto, de código de mecanismo ou de sistema. **As linhas não indicam direção real de falha nem influência causal mensurada.** O fluxo esquerda–direita organiza a consulta documental e **não** significa que sistema → regra → mecanismo seja uma sequência comprovada em campo.

## Navegação e legibilidade

- Um sistema por vez para evitar um grafo excessivamente denso e cruzamentos ilegíveis.
- SVG **gerado localmente** em uma disposição estável de quatro colunas, sem biblioteca externa, algoritmos de força, animações ou gesto de zoom involuntário.
- Em telas estreitas, o mapa pode ser percorrido horizontalmente; a página mantém o fluxo de rolagem normal.
- Nós selecionáveis por clique, **Tab + Enter/Espaço**, com título e descrição textual acessíveis.
- Selecionar regra abre o sintoma literal e o componente candidato; selecionar cadeia exibe função, modo e IDs das referências; selecionar mecanismo mostra definição ontológica.
- Ações de **Abrir ficha** integram o mapa à consulta detalhada já existente.
- Pares de regras com vinculação documental apresentam origem em cadeia ou nó semântico, com as restrições contra equivalência de dano e componente, quando presentes.
- Quando um sistema não possui cadeia genérica citada, a visualização mostra explicitamente **“Nenhuma cadeia genérica vinculada nas fontes”** — não supõe que o equipamento está íntegro.

## Escopo demonstrado nas fontes

O mapa continua limitado a **25 regras e 13 sistemas**. A biblioteca de proveniência possui **24 cadeias genéricas** e **11 nós semânticos compartilhados**, além de seis pares de regras com referência explícita. Nem todas as regras são cobertas por uma cadeia: isso é uma lacuna de catalogação, não evidência de risco menor, mecanismo ausente ou teste negativo.

As dez exceções PM×SAP (cinco P0 e cinco P1) mantêm sua prioridade **documental** distinta de gravidade ou risco operacional. As dez exceções e os oito gates privados seguem bloqueados. Não há FMEA homologada, ligação SAP aprovada, evidência de campo validada ou intervenção autorizada.

## Implementação e integridade

- `docs/consulta-fmea.html`: seletor de sistema, legenda, SVG interativo, informações de proveniência e navegação para a ficha técnica.
- `scripts/lib/pm-system-mechanism-map.mjs`: modelo determinístico de subgrafos, com apenas três tipos de aresta cuja fonte existe no catálogo.
- `scripts/audit-pm-system-mechanism-map.mjs`: auditoria dos treze sistemas, todas as arestas, ligações documentais, formatos de nós e geometria; valida o JavaScript embutido, acesso via teclado, HTML offline e tentativas de promover indevidamente falha, causa, risco, SAP ou autorização.
- `reports/pm-system-mechanism-map.generated.json`: relatório reproduzível em GitHub Actions, gerado com `npm run pm:system:map:audit`.

Os dados-fonte do mapa são **exclusivamente** os JSONs já embutidos no HTML e conferidos com os catálogos do repositório. Nenhuma relação é obtida de um endpoint externo.

## Exemplo mecânico: comando final

No sistema de comando final, as regras conceituais de engrenagem e rolamento estão associadas a cadeias genéricas de desgaste e lubrificação. Um vínculo entre ambas permite comparar a literatura, mas **não permite atribuir a limalha do bujão magnético à engrenagem ou ao rolamento** sem investigação que discrimine a origem, verifique o contexto da amostra e confirme a aplicabilidade do método OEM ao equipamento.

**Estado final:** `NO_GO_READ_ONLY_PUBLIC_DOCUMENTARY_MAP`, sem aprovação operacional.
