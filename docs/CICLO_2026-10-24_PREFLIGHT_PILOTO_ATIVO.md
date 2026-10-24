# Ciclo v1.3.63 — Pré-piloto FMEA por ativo e qualidade de evidências

**24/10/2026 · Catálogo 1.3.63 · Ontologia 1.3.23 · Maturidade 1.3.60 · Intake 1.3.61 · Runbook 1.3.62**

## Objetivo e estado
A cobertura conceitual de **25/25 regras PM** não demonstra que as hipóteses se aplicam à configuração real de qualquer equipamento. Este ciclo prepara **dois modelos sintéticos de caso por ativo** para avaliação OEM e revisão independente, sem selecionar equipamento real, liberar intervenção, executar ensaio ou homologar SAP.

- `TEST-PILOT-RADIATOR-001`: `cooling-radiator-blockage`, bundle `BUNDLE-03`, bloqueio `damage_cause_not_permitted`.
- `TEST-PILOT-FUELFILTER-001`: `fuel-filter-contamination`, bundle `BUNDLE-02`, bloqueio `component_not_registered`.

Tags, números de série, PN, laudos, medições, fotos e URL de documentos privados **não podem ser registrados neste repositório público**. Os casos de exemplo são apenas rótulos `TEST-*`, não máquinas selecionadas. A inclusão de valores de teste em um caso público nunca pode produzir `GO`: **somente a infraestrutura privada autorizada e a decisão humana competente poderiam fazê-lo, mediante mudança de contrato separada**.

## Checklist de sete disciplinas e 34 verificações

| Disciplina | Verificações | Foco |
| --- | ---: | --- |
| Identificação de ativo | 4 | Modelo/variante, série, BOM/PN e alterações de configuração |
| Efetividade OEM | 5 | Licença, revisão, procedimento, critérios, diagrama e substituições |
| Segurança de execução | 5 | Análise de risco, isolamento, pressão/temperatura, ferramentas e proibição de teste improvisado |
| Qualidade metrológica | 8 | Método, calibração, contexto de carga/ambiente, amostra antes da intervenção, repetibilidade, custódia, limite OEM e contraprova |
| Diagnóstico diferencial | 4 | Sintoma, mecanismo, dano físico e causa raiz em evidências separadas |
| Revisão independente | 4 | Parecer técnico, revisor diferente, qualidade da evidência, assinatura/autorização real |
| Mudança SAP | 4 | Efetividade do local funcional, curadoria de dano/causa e bloqueio mantido até aprovação independente |

Essas verificações são **perguntas e requisitos de futuro aceite**, não checkboxes aprovadas. Cada verificação permanece `pending` e não possui recibo, assinatura ou token de revisor real.

## Qualidade da medição: pontos críticos de oficina

**RADI — arrefecimento.** Primeiro identificar o conjunto pelo modelo/série/BOM, faces da colmeia, sentido do fluxo e circuito. O registro futuro de temperatura precisa documentar condição de carga, ambiente, posição, método, calibração e critério OEM. Sujidade externa nas aletas, limitação interna de circulação, atuação de ventilador, bomba/termostato e erro de sensor continuam alternativas, mesmo se houver aquecimento observado. Não lavar ou medir circuito pressurizado por método improvisado.

**HSVV — combustível.** Primeiro comprovar se existe filtro/separador correspondente à variante; HSVV cadastra mangueiras/válvulas e **não confirma o filtro na localização**. Uma coleta futura de combustível, quando aplicável, deve preceder troca ou drenagem, ocorrer com procedimento aprovado e registrar representatividade, ponto de coleta e cadeia de custódia. Água/partícula no combustível é condição de fluido, não prova de elemento filtrante danificado. Vazão/restrição também podem decorrer de linha, bomba e controle.

**Nunca transportar um valor de pressão, temperatura, diferencial, torquímetro, tolerância, periodicidade ou limite de descarte entre máquinas sem efetividade do manual da série.** A base não contém valores OEM de aprovação.

## Gates de decisão

O contrato define oito gates: `G-DEPLOY`, `G-ASSET`, `G-OEM`, `G-SAFE`, `G-MEASURE`, `G-DIAG`, `G-REVIEW` e `G-SAP`. Implantação e SAP são `BLOCKED`; demais verificações permanecem `PENDING`.

O preflight gera sempre `NO_GO_PUBLIC_PREFLIGHT`. Ele valida consistência de catálogo e snapshot; **não autentica identidade, não valida autenticidade de laudos e não realiza aprovação**. O runbook anterior continua com oito gates privados em `BLOCK` e `NO_GO`; nenhum serviço de armazenamento ou RBAC corporativo está instalado.

O registro futuro de decisão deverá conter justificativa, documento OEM aplicável, identidade corporativa confiável, avaliação de contraprovas, aprovação independente e trilha protegida em ambiente privado. Revisão técnica não equivale a liberação operacional, aprovação de SAP ou confirmação de causa raiz.

## Arquivos de implementação
- `data/governance/pm-pilot-readiness-policy.v1.json`: sete disciplinas, 34 requisitos e oito gates não aprovados.
- `data/quality/pm-pilot-preflight.v1.json`: dois modelos de caso sintéticos vinculados às regras e bloqueios existentes, com zero evidências de campo.
- `scripts/lib/pm-pilot-preflight.mjs`: geração determinística e avaliação **sempre NO-GO ou REJECTED** no contexto público.
- `scripts/audit-pm-pilot-preflight.mjs`: reconstrói os casos e executa **46 mutações adversariais** contra valores inventados, aprovação fictícia e violação de bloqueios.
- `reports/pm-pilot-preflight.generated.json`: relatório CI.

## Próximas decisões e dependências
1. Segurança/TI/Privacidade: obter aprovação corporativa e implantar cofre, identidade, logging externo e retenção antes de receber qualquer evidência real.
2. Engenharia de manutenção: escolher o primeiro ativo apenas **fora do repositório público**, conferir série/BOM/manuais e elaborar plano de inspeção segura.
3. Confiabilidade/PCM: avaliar risco e qualidade de medição, registrar hipóteses concorrentes e submeter relatório a revisão independente.
4. Dados Mestres SAP: tratar bloqueios `RADI` e `HSVV` separadamente do preflight, sem mudança automática nem código inventado.

**Estado verificável:** 25 regras conceituais, dez exceções SAP bloqueadas, dois modelos TEST-*, zero ativos reais selecionados, zero inspeções, zero laudos, zero aprovação SAP e nenhum piloto liberado.
