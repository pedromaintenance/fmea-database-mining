# Ciclo v1.3.68 — Pacotes de revisão documental das famílias funcionais PM

**27/10/2026 · Catálogo 1.3.68 · Ontologia 1.3.23 · Maturidade 1.3.60 (preservadas)**

## Por que este ciclo

O auditor v1.3.67 identificou **84 ocorrências de caminho por regra** que passaram pelo filtro de código de subgrupo, mas foram rejeitadas quando o sistema/grupo foi considerado. São divergências **entre critérios do catálogo**, não 84 máquinas com defeito ou cadastros errados. A mesma auditoria preservou **115 vínculos estruturais candidatos** e **dez exceções PM×SAP já bloqueadas** (5 P0 e 5 P1).

Antes de ampliar hipoteticamente o número de documentos requeridos, agora organizamos uma **fila executável de revisão documental humana** com campos de origem, contraprovas e critérios de decisão. Não foi enviado nenhum pedido ou criado processo em SAP.

## Saída em três planos separados

1. **Treze pacotes por sistema funcional** — agrupam as 25 regras, os candidatos e as rejeições estruturais. Campos de contagem são diagnósticos da cobertura da ontologia, **não indicadores de risco, impacto ou criticidade operacional**.
2. **Dez registros de exceção** — cada um conserva exatamente a classificação P0/P1, o bloqueio técnico/cadastral, códigos de modelo candidatos, fontes catalogadas, a próxima investigação proposta e uma receita verificável de evidência específica do tipo de bloqueio. Nenhum é aprovado.
3. **Quinze regras com vínculos estruturais** — fila de revisão distinta, sem prioridade documental inventada e sem sugerir que o filtro por texto prova componente instalado.

Os pacotes são ordenados por **prioridade documental preexistente P0, depois P1, depois sem prioridade**, nunca pelo volume das 84 rejeições. Isso impede que um sistema com mais combinações catalogadas ganhe artificialmente uma severidade de falha maior.

## Resultado reproduzido pela auditoria

| Métrica | Valor |
| --- | ---: |
| Famílias em revisão P0 (documental) | 3 |
| Famílias com apenas P1 | 4 |
| Famílias sem exceção classificada | 6 |
| Exceções P0 / P1 | 5 / 5 |
| Rejeições estruturais: hidráulico | 64 |
| Rejeições estruturais: combustível | 19 |
| Rejeições estruturais: arrefecimento | 1 |
| Demais famílias: rejeições no filtro atual | 0 |
| Auditoria adversarial | **66/66 rejeições**, 0 erros |

A distribuição das rejeições reflete quantas instâncias de caminho foram consideradas pelas regras de cada família. **Não demonstra que hidráulica tenha risco operacional maior**, não estabelece criticidade, severidade FMEA, índices RPN ou custo de manutenção. A fila P0/P1 mantém a prioridade documental **original** do catálogo.

## Receitas de investigação por tipo de bloqueio

| Bloqueio | Pergunta de engenharia | Evidência antes de propor mudança |
| --- | --- | --- |
| `damage_cause_not_permitted` | O achado é dano físico, condição do fluido ou observação? | Dano físico independente, contrahipóteses e catálogo SAP |
| `component_not_registered` | Onde o elemento efetivamente instalado pertence na estrutura funcional e no tipo de objeto? | BOM por série, montagem/função e tipologia SAP |
| `subgroup_not_in_scope` | A função instalada pertence mesmo ao caminho sistema/grupo/subgrupo proposto? | Esquema OEM por série, hierarquia SAP completa, roteamento e instalação |

Para `HSVV`, não basta a igualdade textual entre caminhos de combustível e hidráulico. Para `COMR`, a classificação de grupo não promove um subgrupo fictício. Nenhuma receita define torque, pressão, temperatura ou teste aplicável sem efetividade OEM.

## Gatilhos para revisão **em ambiente privado autorizado**

```text
Exceção PM×SAP existente (10)             ← sem recálculo de P0/P1
  ↓ identificação física do ativo e de série (PRIVADO)
  ↓ BOM/esquema/manual OEM efetivos e função instalada
  ↓ evidência/contraprova de componente, dano e causa
  ↓ parecer independente da Engenharia
  ↓ mudança de Dados Mestres SAP por fluxo próprio (se cabível)
  ↓ autorização operacional própria (se houver intervenção)
```

A existência de um pacote ou de fonte bibliográfica **não autoriza os passos privados** e não constitui aceite de engenharia, ordem de serviço nem liberação de equipamento.

## Artefatos e execução

- `data/quality/pm-functional-review-workpacks-policy.v1.json` — regra de priorização documental e critérios específicos de evidência por bloqueio.
- `scripts/lib/pm-functional-review-workpacks.mjs` — agrupamento determinístico por sistema funcional e fila de exceções, derivado da reconciliação v1.3.67 e da triagem P0 v1.3.66.
- `scripts/audit-pm-functional-review-workpacks.mjs` — reconstrução e auditoria adversarial fail-closed, incluindo tentativas de declarar ativo, laudo, aprovação OEM/SAP, intervenção ou liberação.
- `reports/pm-functional-review-workpacks.generated.json` — relatório gerado no CI e disponibilizado como artefato do workflow.

O script é invocado por `npm run pm:functional:review-queue:audit`. Seus dados vêm das regras e dos bloqueios já versionados; não altera ontologia, códigos, hierarquia, candidatos ou consumidores do banco.

## Próximo passo concreto

No sistema corporativo privado autorizado, escolher **um dos P0**, verificar o modelo/variante e a efetividade da documentação OEM, confrontar o caminho funcional e registrar resultado em sistema de custódia aprovado. A classificação das demais regras não muda automaticamente. Somente evidências e decisões independentes poderão melhorar a maturidade além da condição atual **NO-GO**.
