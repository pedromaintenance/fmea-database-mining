# Ciclo v1.3.78 — Qualidade metrológica, método e rastreabilidade de evidências PM

**28/10/2026 · Catálogo v1.3.78 · Desenho público de requisitos, sem avaliação de evidência real**

## Objetivo

Depois da v1.3.76 (30 alternativas para 15 regras sem prioridade documental) e da v1.3.77 (detectabilidade e possíveis falsos positivos/negativos **qualitativos**), este ciclo estabelece requisitos que **teriam** de ser satisfeitos para uma medição ou inspeção ser interpretada de modo tecnicamente defensável.

Não há instrumentos, certificados, ensaios, fotos, documentos OEM restritos, tags, séries de máquinas, laudos corporativos ou responsáveis reais neste repositório. O preenchimento sintético **não comprova** que os critérios foram atendidos. As regras e descrições abaixo são **propostas de engenharia**, não transcrição nem homologação de procedimento OEM.

## Matriz metrológica

Cada uma das **15 inspeções** possui estes **10 requisitos de revisão**, totalizando 150 posições documentais não avaliadas:

| ID | Critério | Pergunta essencial |
| --- | --- | --- |
| `safety` | Segurança e autorização | O método é seguro para a condição energética e foi autorizado pela organização? |
| `asset_identity` | Identidade/configuração | Ativo, componente, modelo e série correspondem à documentação revisada? |
| `oem_method` | Aplicabilidade OEM | A fonte licenciada e o procedimento/limite realmente se aplicam à configuração? |
| `instrument` | Instrumento/grandeza | O método mede uma grandeza ou é observação qualitativa? Há instrumento adequado quando necessário? |
| `calibration` | Calibração/adequação | Quando aplicável, a calibração, faixa, validade e rastreabilidade são demonstradas? |
| `conditions` | Contexto de coleta | Temperatura, carga, pressão, posição, histórico e demais influências foram consideradas? |
| `repeatability` | Repetibilidade/amostragem | O método requer repetições ou uma amostra representativa, e isso está justificado? |
| `uncertainty` | Incerteza/resolução | Se quantitativo, a incerteza e a resolução são compatíveis com o critério decisório? |
| `custody` | Proveniência | Origem, versão, método, momento e custódia estão documentados em sistema autorizado? |
| `counterevidence` | Hipóteses concorrentes | Houve contraprova independente para evitar atribuir um mesmo sinal à causa errada? |

**Distinção importante:** inspeção visual não precisa necessariamente de um certificado de calibração. A **aplicabilidade** de instrumento, calibração, repetibilidade e incerteza depende do método efetivo. Um campo `hypothetically_not_applicable` desencadeia **revisão humana da justificativa**, não dispensa automática do requisito.

O relatório mantém para cada regra o **sintoma e método literais** das fontes, o mecanismo alternativo aberto e o alerta de segurança da etapa anterior. Os dez critérios estão com `UNASSESSED_NO_REAL_EVIDENCE`; não são medições reais.

## Exemplo de interpretação: óleo e partículas em comando final

Hipótese inicial: deterioração de engrenagem. Alternativa: rolamentos e outras superfícies ferrosas no mesmo compartimento.

Mesmo se um bujão magnético contiver partículas, o achado não identifica por si só o componente de origem. A análise exigiria contexto de troca/limpeza do óleo, identificação correta do compartimento e sua arquitetura, procedência da amostra, eventual calibração/adequação instrumental quando aplicável e exame de contraprovas autorizado. **Não inventamos limites de quantidade/tamanho de partículas ou critério de condenação do OEM.**

## Roteamento de qualidade — 13 cenários por regra

O avaliador aceita exclusivamente **15 IDs genéricos de regras** e **dez estados enumerados**. Para cada regra ele simula:

- Dez ausências documentais isoladas, com encaminhamento para complementar a exigência específica.
- Uma condição `unsafe` que interrompe a proposta e demanda análise de segurança.
- Uma alegação sintética de `not_applicable` que exige fundamentação por responsável competente.
- Um cenário em que todos os requisitos são marcados como **hipoteticamente documentados**. Mesmo aqui, a saída é `HOLD_INDEPENDENT_PRIVATE_QUALIFIED_REVIEW`, jamais autorização.

São **195 roteamentos sintéticos**, todos com `NO_GO`. Entradas desconhecidas, nomes/tags em campos adicionais, números de medição e assinaturas não previstos são rejeitados. Este avaliador não deve ser usado como instrumento de aceite de evidência real.

## Evidência mínima em ambiente corporativo privado

Para qualquer aplicação real futura, a equipe de Engenharia, Segurança e Metrologia deve primeiro determinar quais critérios são aplicáveis, confirmar os documentos OEM licenciados e o controle dos riscos, identificar o método/instrumento efetivos e registrar o contexto de coleta.

O armazenamento e a análise só podem acontecer em ambiente autorizado, com confidencialidade, custódia, segregação de funções e decisão humana independente. **Nenhum documento privado deve ser copiado ou resumido com dados identificáveis no repositório público.**

## Implementação

- `data/quality/pm-metrology-provenance-policy.v1.json`: os dez requisitos, 15 IDs em lista permitida e 13 perfis de cenário.
- `scripts/lib/pm-metrology-provenance.mjs`: geração determinística de 15 pacotes, 150 posições documentais e 195 cenários; roteamento com estados estritos.
- `scripts/audit-pm-metrology-provenance.mjs`: revalidação da v1.3.76/v1.3.77, classificação positiva/negativa e mutações adversariais.
- `reports/pm-metrology-provenance.generated.json`: relatório de auditoria produzido durante CI, sem dado real.
- Comando: `npm run pm:metrology:provenance:audit`.

## Limites e decisão

**25** sementes conceituais, **15** sem prioridade documental (não equivale a baixo risco), **10** exceções PM×SAP bloqueadas (5 P0/5 P1), **8** gates corporativos bloqueados. Nenhuma causa raiz confirmada, incerteza calculada, certificado validado, inspeção executada, nota ou ordem aberta, nem mudança SAP ou liberação operacional.

Status: `NO_GO_PUBLIC_EVIDENCE_QUALITY_DESIGN`.

O próximo avanço que não depende de dados privados pode ser consolidar a maturidade técnica por evidência e a consistência entre os três relatórios (observabilidade, detectabilidade e metrologia), sem transformar completude documental sintética em risco calculado ou aprovação.
