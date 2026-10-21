# FMEA Database Mining v1.3.16 — Exceções de manutenção preventiva e gate OEM CAT D9

**Data editorial:** 20/10/2026  
**Escopo:** engenharia de conhecimento FMEA, prevenção, cadastro SAP e preparação documental OEM. Sem alterações no jogo ou outros consumidores.  
**Natureza:** auditoria metodológica/editorial, **não** comprovação de falhas reais, de efetividade OEM nem revisão de campo.

## 1. Achado e decisão técnica

O gerador de vínculos preventivos só admite a interseção entre modelo, sistema, grupo, subgrupo, tipo de objeto SAP, componente identificado, código de dano e causa admitida. Dez das 25 regras não atingem uma interseção válida. A recomendação é preservar o bloqueio enquanto se investigam hierarquia e mecanismo reais, evitando criar vínculos baseados apenas em similaridade lexical.

[Registro detalhado das 10 exceções](../data/quality/pm-exception-evidence-gates.v1.json) · [Revisão anterior](../data/quality/pm-gap-review.v1.json) · [Gerador original](../scripts/generate-pm-links.mjs).

| Bloqueio estrito | Regras | Tratamento admissível |
|---|---:|---|
| Subgrupo fora do sistema ou nível SAP exigido | **3** | Conferir local funcional/nível efetivo; não reutilizar o mesmo código de outro sistema |
| Componente procurado ausente do tipo de objeto | **5** | Conferir BOM, configuração OEM e material instalado; não inventar PN nem transplantar de outro objeto |
| Dano e causa incompatíveis com componente elegível | **2** | Separar condição do fluido, ação preventiva e dano físico antes de propor revisão de taxonomia |
| **Total** | **10** | **Nenhuma associação aprovada** |

### Exceções prioritárias P0

- **Radiador sujo:** depósito externo na passagem de ar não comprova obstrução interna do trocador; comparar fluxo de ar, ventilação e circulação antes de classificar dano.
- **Filtro de combustível:** `HSVV` é cadastro de mangueiras/válvulas, não posição comprovada de filtro; solicitar árvore OEM e revisão de dados mestres.
- **Água no tanque:** água no fluido é condição; defeito de dreno exige evidência própria, confrontando amostra com histórico de abastecimento e inspeção física.
- **Mangueiras hidráulicas (vazamento e abrasão):** `HSVV` encontrado em outra raiz não autoriza deslocar o componente para a hidráulica de implementos.

As cinco exceções restantes — filtro de óleo, roda-guia, rolamento da cabeça rotativa, mangueira do sistema de ar comprimido e filtro do compressor — mantêm a mesma exigência de BOM específica, posição SAP e critério de falha validado.

Cada registro inclui dois elementos de evidência independentes, mecanismo a discriminar, explicação alternativa física e tratamento condicionado. **A natureza das causas permanece hipotética.**

## 2. Piloto OEM CAT D9 — documentação efetiva ainda não entregue

O [piloto anterior](../data/quality/oem-pilot-readiness.v1.json) já possuía sete requisitos não atendidos. A [matriz de entrada documental](../data/quality/oem-d9-evidence-intake.v1.json) formaliza que documento solicitar, qual comparação independente executar e que disciplina deve revisar.

| Requisito | Prova pendente | Consequência da ausência |
|---|---|---|
| Prefixo/série ou arranjo homologado | Identificador conferido em máquina e base autorizada | Sem referência a qual publicação OEM é válida |
| OMM efetivo | Número de mídia, revisão e abrangência de série | Sem procedimento/limite de serviço aplicável |
| BOM e desenho de rodante | Configuração real de sapata, elo, roda-guia e roletes | Sem atribuição de PN ou composição física |
| Fixadores e aperto | Método OEM, reutilização e critério de montagem | Sem torque, sequência ou aprovação de junta |
| CTS | Tabela, medição e ferramenta para a variante | Sem percentuais ou limites de desgaste atribuídos ao D9 |
| Cadastro SAP | Local funcional e tipo de objeto confrontados à BOM | Sem confirmação de vínculo FMEA × SAP |
| Revisão de campo | Inspeção e parecer técnico independente | Sem liberação operacional ou causa raiz confirmada |

**Fontes públicas Caterpillar consultadas:** [inspeção de rodante de trator](https://www.cat.com/en_US/articles/for-owners/dozer-undercarriage-maintenance.html), [verificação de tensão de esteiras](https://www.cat.com/en_US/articles/for-owners/how-to-check-dozer-track-tension.html/) e [visão geral CTS](https://www.cat.com/en_US/support/maintenance/undercarriage.html). Essas fontes apoiam a necessidade de inspecionar e medir, mas **não fornecem critério de aperto, limite CTS, PN e homologação por série do D9 do piloto**. Não foram transcritos documentos licenciados.

## 3. Gates verificáveis

Novo validador `scripts/validate-pm-exception-gates.mjs` confronta o registro contra as 25 regras originais, 10 bloqueios rastreados, relatórios gerados de PM, fontes bibliográficas e piloto OEM original. Verifica as 10 decisões `manter_bloqueado_sem_evidencia`, ausência de remapeamentos e continuidade das oito cadeias do D9.

O conjunto [16 regressões sintéticas](../data/quality/pm-exception-regressions.v1.json) tenta burlar os gates ao criar PN e local SAP, inventar série/limite CTS, eliminar evidência ou hipótese concorrente, alterar categoria de bloqueio ou aprovar o piloto sem documentos. Espera-se que **14 mutações sejam rejeitadas e 2 controles sem alteração sejam aceitos**. Esses testes não representam falhas reais de máquina.

Comando: `npm run pm:exceptions:validate` (após `npm run pm:generate && npm run pm:gaps:audit`). Executa também em `npm run qa` e no GitHub Actions.

## 4. Critérios do próximo ciclo

Solicitar, pelos canais autorizados, **(1)** identificação do D9 por série/arranjo, **(2)** referências SIS/OMM de rodante/CTS com mídia e revisão, **(3)** estrutura SAP/BOM para inspeção comparativa, mantendo dados corporativos fora do repositório público. Uma vez recebidos, revisar duas hipóteses mecânicas concorrentes por condição e obter dois pareceres técnicos antes de promover qualquer ligação.

Sem esses documentos, não substituir a revisão por números publicados para outro trator, porcentagens globais de desgaste, nomes coincidentes em SAP ou histórias narrativas de manutenção.

**Saída esperada:** avanços de curadoria e método, não aumento artificial do número de falhas homologadas. O contrato público 1.0.0, o conteúdo 1.0.0 e o preview legado 1.3.12 permanecem congelados.
