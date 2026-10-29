# Ciclo v1.3.87 — Pautas de revisão documental por disciplina

**29 de outubro de 2026 · FMEA Database Mining · Estado operacional: NO_GO**

## Objetivo

A [pauta de revisão por disciplina](pauta-revisao-fmea.html) apresenta uma carteira documental de Engenharia e PCM, independente da [consulta FMEA v1.3.86](consulta-fmea.html). Essa separação mantém a consulta original intacta e permite abrir **ambos os arquivos offline**, sem servidor, CDN, integração SAP ou autenticação.

O produto não planeja inspeções reais nem define quem deve executá-las; organiza apenas **questões e referências para uma futura revisão humana autorizada**.

## Carteiras por disciplina (propostas das fontes)

| Disciplina proposta | Regras | Situação de cadastro |
| --- | ---: | --- |
| Engenharia de manutenção e especialista OEM | 15 | Sem mapeamento SAP aprovado e sem exceção registrada |
| Engenharia de ativos e dados mestres SAP | 5 | Exceções PM×SAP formalmente bloqueadas |
| Engenharia de sistemas e dados mestres SAP | 3 | Exceções PM×SAP formalmente bloqueadas |
| Engenharia de confiabilidade e dados mestres SAP | 2 | Exceções PM×SAP formalmente bloqueadas |

Não se trata de designação de profissionais ou aceite da disciplina. P0/P1 continuam códigos **da prioridade documental de curadoria**, nunca risco operacional nem prioridade de manutenção.

## Etapas da pauta documental

- **S1 — Configuração OEM:** configuração, série/arranjo, peça, método e literatura efetiva ainda não confirmados.
- **S2 — Função e mecanismos:** formulação de hipóteses concorrentes e análise dos 24 registros de cadeias genéricas quando relacionados à regra. **14 regras ainda não têm vínculo com essas cadeias.**
- **S3 — Contraprovas e segurança:** delimitação da evidência discriminante e do resultado inconclusivo, sem realizar a inspeção.
- **S4 — Enquadramento SAP:** revisão de subgrupo, componente e par dano–causa. Dez exceções permanecem formalmente bloqueadas; as outras 15 não têm mapeamento aprovado, mas também não têm exceção registrada.
- **S5 — Revisão independente:** preparo de parecer técnico futuro, sem inventar assinatura, aprovação ou execução.

As cinco etapas aparecem como **não iniciadas** para cada uma das 25 regras. As evidências propostas no catálogo aparecem como propostas não recebidas. A ausência de cadeia documentada não significa ausência de mecanismo de falha.

## Funcionalidades

O HTML oferece filtros de disciplina, sistema, etapa S1–S5 e busca textual por ID, componente ou referência. Exibe cartões por regra e distribuição por disciplina, ordenados por ID, **sem escore de risco**. O botão **Exportar pauta filtrada (MD)** produz um documento Markdown com origem, perguntas, hipóteses e evidências propostas, preservando os bloqueios.

## Arquitetura e auditoria

- `scripts/lib/pm-discipline-review-agenda.mjs`: derivação determinística dos 25 registros a partir dos catálogos, grafo documental, carteira de lacunas e **matriz de maturidade** (fonte correta dos IDs de referência).
- `docs/pauta-revisao-fmea.html`: página responsiva standalone com JSON incorporado e filtros locais.
- `scripts/audit-pm-discipline-review-agenda.mjs`: comparação integral do HTML contra a estrutura regenerada, teste do JavaScript, filtros, exportações e tentativas de falsificar reunião, designação, causa confirmada, evidência recebida, criticidade e liberação.
- `npm run pm:discipline:agenda:audit`: auditor incluído no `npm run qa` e CI, com registro em `reports/pm-discipline-review-agenda.generated.json`.

## Limites

São **25 registros conceituais**, dos quais dez têm bloqueios PM×SAP; os **oito gates corporativos continuam BLOCK / NO_GO**. Não existe no banco público evidência de campo, causa confirmada, validação OEM por número de série, aprovação SAP, reunião efetivamente realizada, nomeação de executante ou autorização de intervenção. Não foram modificados repositórios consumidores.

**Conclusão:** ferramenta de preparação documental para futura análise de Engenharia e PCM, não sistema de execução ou aprovação.
