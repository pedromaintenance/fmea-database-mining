# Remediação de desvios de staging e detecção de reincidência

**Versão 1.3.29 · 21/10/2026.** Documento de preparação técnica para futuro ambiente privado de TI. Todos os cenários presentes na base são **sintéticos**; não existe medição de falha em equipamento pesado ou incidente corporativo relacionado.

## 1. Do resultado de teste à hipótese de correção

O ciclo [v1.3.28](TRATAMENTO_EXCECOES_STAGING.md) estruturou esclarecimento, novo teste e revisão independente. A presente evolução estabelece **um catálogo de propostas de ação** para resultados ainda pendentes.

| Perfil | O que foi observado *no teste* | Correção a propor | Evidências que deverão ser obtidas |
|---|---|---|---|
| REM-CONTROL-001 | Controle retornou `fail` | Investigar requisito, formular hipótese, aprovar mudança e testar novamente sob método autorizado | Evidência original, alternativas explicativas, alteração autorizada, run de reteste e verificação independente de eficácia |
| REM-EVIDENCE-001 | `inconclusive` por ausência de discriminação | Revisar coleta, instrumento, método e pertinência da amostra, solicitando contraprova | Resultado inconclusivo, lacuna da medição, instrumentos/método, reteste e parecer de qualidade |
| REM-INFRA-001 | Teste `blocked` devido a verificador ou ambiente | Isolar falha do ensaio, revisar identidade/tempo/transporte e recuperar o ambiente antes de repetir | Log original de bloqueio, diagnóstico do verificador, evidência de recuperação, novo run e revisão independente |
| REM-RECURRENCE-001 | Mais de uma execução distinta com desvio no mesmo escopo | Investigar origem comum **como hipótese**, escalar para responsável e avaliar prevenção | Runs distintos, comparativo temporal, hipóteses alternativas, parecer do responsável e revisão preventiva independente |

A quarta linha é **complementar** às três primeiras, não substitui sua correção técnica nem afirma causa comum.

## 2. Como contar reincidência sem inflar estatísticas

A identidade de um desvio é a combinação `tenantToken + scenarioId + probeId + classification`. Só um `runToken` distinto deve incrementar o contador; evidência duplicada, outra classe, outro controle ou outro tenant **não forma uma recorrência do mesmo desvio**.

Nos testes desta versão usamos **dois runs distintos em uma janela de 30 dias**. Esses números servem exclusivamente para verificar a lógica e **não constituem meta, SLA, criticidade nem gatilho aprovado pela empresa**. O JSON registra `realThresholdDays=null`, `realThresholdCount=null` e `realCorporateThresholdApproved=false`.

A eventual aprovação de critérios reais exigirá histórico consistente, gravidade, impacto de segurança, periodicidade de inspeção, criticidade, recursos e alçada formal. A recorrência agrupada aponta necessidade de análise, **não prova que os eventos compartilham causa raiz**.

## 3. Gates para transformar proposta em ação controlada

Uma proposta de remediação não deve saltar de identificação da falha para "resolvido". O fluxo conceitual exige: escopo e classificação, alternativa causal, definição de tarefa corretiva, autorização de alteração, execução por responsável habilitado, coleta de evidência, reteste distinto, avaliação independente de eficácia e, **fora deste repositório**, aceitação formal da Segurança.

No mock, os campos `actionExecuted`, `closureApproved`, `riskAccepted` e `actualReviewPerformed` permanecem obrigatoriamente falsos, enquanto `independentAssessment=pending_real_review`. Um plano validado recebe somente `eligible_for_manual_review`.

**Prevenção de reincidência** precisa se apoiar em causa verificada e eficácia monitorada ao longo de tempo relevante. Uma conclusão "o teste passou" **não** representa eliminação permanente de mecanismo, conformidade de todos os controles ou fechamento do incidente original.

## 4. Registro de evidência, rastreabilidade e proteção

O [validador](../scripts/validate-recurrent-remediation.mjs) usa apenas tokens fictícios `TEST-*`, nenhum upload de evidência, nenhum nome pessoal e nenhum documento OEM. A saída pública jamais deve conter laudos de óleo, componentes com número de série, URLs internas, credenciais, arquivos SIS/OMM ou hashes de documentação corporativa.

No sistema privado futuro, os dados e resultados deverão ser assinados, vinculados à origem, preservados em log append-only e verificados com identity management, segregação de função e retenção. As funções do repositório público **não** fornecem isso.

## 5. Validação e priorização futura

`npm run remediation:recurrence:validate` executa **52 regressões**, comparando 12 casos de teste (três perfis × uma ocorrência, recorrência do mesmo controle, segundo controle diferente e registro fora da janela) e quarenta mutações adversariais. Testes críticos rejeitam recontagem de mesmo run, mistura de tenant/probe/causa, perda de evidência original, supressão de recorrência real, ação e prova faltante, revisão falsa e fechamento sem aceite.

Uma organização poderá futuramente priorizar desvios pela criticidade funcional, potencial de exposição de informação, frequência comprovada, impacto na operação e dependências de infraestrutura. **Nenhum peso, prioridade ou limite operacional foi inventado nesta versão.**

## 6. O que continua pendente

As sete camadas da arquitetura [v1.3.24](ARQUITETURA_RESTRITA_IMPLANTACAO.md) continuam sem implementação corporativa comprovada; seis gates humanos da [v1.3.25](RUNBOOK_HOMOLOGACAO_STAGING.md) permanecem não aprovados. Não há ordem de manutenção, aprovação de Segurança, medição real, reparo executado, registro de desvio no SAP ou alteração de cadeia FMEA.

O próximo passo deve priorizar **evidências concretas do que falta para um piloto legítimo**, e não tratar mais validações de mock como se fossem progressos na homologação do sistema corporativo.
