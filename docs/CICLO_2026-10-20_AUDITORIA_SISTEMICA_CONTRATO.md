# Ciclo FMEA v1.3.13 — Auditoria crítica de causas sistêmicas e compatibilidade pública

**Data editorial:** 20/10/2026  
**Escopo:** somente FMEA Database Mining. PORCARIA e demais consumidores não foram alterados.  
**Estado:** auditoria de coerência **editorial**, não perícia de campo, não parecer de profissional independente, não homologação de OEM/SAP.

## Objetivo

A v1.3.12 criou quatro níveis causais em **24 cadeias**, sendo 21 ampliadas naquela versão e três provenientes de roteiros detalhados anteriores. O risco identificado é confundir **mecanismo físico plausível** com **deficiência organizacional comprovada**. Neste ciclo, cada possível causa sistêmica das **21 cadeias ampliadas** foi reavaliada quanto à evidência de processo necessária, à possibilidade de explicação física independente e ao risco de atribuição indevida de responsabilidade. Em paralelo, foi formalizado um contrato público estável para consumo dos arquivos de conhecimento.

## Pesquisa e enquadramento metodológico

- [IEC 60812:2018](https://webstore.iec.ch/en/publication/26359): trata de falhas de função, modos, efeitos locais e globais e possíveis causas. Sua página oficial não autoriza deduzir que falha de componente implica falha organizacional.
- [ISO 14224:2016](https://www.iso.org/standard/64076.html): distingue dados de equipamento, falhas e manutenção como conjuntos de informação separados. A norma é direcionada a petróleo/gás/petroquímica; o uso aqui é **adaptação metodológica** a equipamentos móveis de mineração. Texto integral não consultado neste ciclo.
- [Semantic Versioning 2.0.0](https://semver.org/lang/pt-BR/spec/v2.0.0.html): mudanças incompatíveis exigem nova versão major do **contrato definido como API pública**. A aplicação aos JSONs de conhecimento é escolha do projeto, e **não substitui revisão mecânica**.

## Auditoria das 42 hipóteses sistêmicas

O novo [registro de auditoria](../data/governance/systemic-root-audit.v1.json) contém **21 cadeias × 2 hipóteses sistêmicas = 42 alegações causais candidatas**.

Cada alegação explicita:
1. Texto original preservado da v1.3.12, classe de investigação (projeto, montagem, lubrificação, controle de contaminação, operação, materiais ou manutenção);
2. Dois tipos de **documentação independente** necessários para investigar se houve realmente desvio de processo;
3. Uma explicação física/operacional concorrente que pode produzir o mesmo sintoma **sem** haver falha de processo;
4. `presentProofOfProcessDeviation=false`, `processRecordsExamined=false`, `causalConclusion=nao_demonstrada`;
5. Bloqueio de atribuição de culpa a pessoa/equipe, revisão independente e confirmação de série/arranjo pendentes.

A auditoria considera **plausibilidade e suficiência de evidência**, não comprovação de responsabilidade.

### Exemplos críticos

| Cadeia | Hipótese sistêmica que NÃO está comprovada | Evidência necessária e contraprova |
| --- | --- | --- |
| `FC-HOSE-004` — degradação térmica | Proteção térmica/roteamento insuficiente | Temperatura efetiva, composição e classificação térmica da linha; ataque químico também pode explicar a aparência |
| `FC-FD-002` — água no comando final | Inspeção de vedação ou coleta inadequadas | Identificar ingresso no compartimento versus recipiente/amostragem; condensação é alternativa |
| `FC-COOL-001` — colmeia suja | Estratégia de limpeza insuficiente | Documentar ambiente, carga de poeira e inspeções; depósito rápido pode ocorrer com plano adequado |
| `FC-TRACK-001` — rolete com arrasto | Falha no controle/limpeza do rodante | Evidência de material compactado e frequência/exposição; rolete pode sofrer falha interna independente |
| `FC-TRACK-006` — perda de pré-carga | Montagem inadequada | Procedimento, histórico de aperto e junta; giro relativo pode causar perda mesmo após montagem conforme |
| `FC-COOL-007` — circulação insuficiente | Manutenção ou controle do fluido inadequados | Teste OEM que isole bomba, termostato e restrição; falha de circulação pode ter outra origem |

As três cadeias aprofundadas na v1.3.11 (`FC-HOSE-001`, `FC-FD-001` e `FC-TRACK-005`) **não receberam aprovação artificial** nem foram reclassificadas. A auditoria desta versão se concentrou nas 21 adicionadas posteriormente.

**Resultado:** 42/42 alegações catalogadas com evidência e contraprova; **0 desvios reais de processo examinados ou comprovados; 0 causas raízes sistêmicas confirmadas**.

## Contrato público estável e compatibilidade

A v1.3.12 já exportava **24 cadeias, 20 referências efetivamente usadas** e um manifesto SHA-256. A camada editorial de auditoria da v1.3.13 **não foi adicionada ao pacote público** porque sua mudança não é necessária à estrutura dos dados consumidos e precisa de governança própria.

- [Contrato público](../data/governance/public-contract.v1.json): **`contractVersion=1.0.0`**, independente do pacote npm `1.3.13`.
- **Versão do preview público continua `1.3.12`** nesta atualização. Isto é intencional: nenhum campo/semântica pública mudou.
- A exportação está temporariamente congelada no SHA-256 da release v1.3.12:
  `b780a1c95e6f2ab5b3fb1f9acd20a63a1a5abd0e3f3ed111f61052b2e8c59c65`.
- O snapshot possui **24 IDs estáveis** e **20 fontes publicadas**, sem seriações/locais SAP homologados ou resultados reais.
- [Oito regressões sintéticas](../data/quality/contract-compatibility-regressions.v1.json) testam mudanças `patch`, `minor`, `major` e rejeição de promoção causal indevida.

### Convenção adotada no projeto

| Mudança | Tratamento |
| --- | --- |
| Correção que preserva campos, tipos, IDs e significado | PATCH (mediante documentação e nova geração deliberada) |
| Campo opcional adicional, preservando significado e compatibilidade | MINOR, depois de atualizar contrato e validar consumidores |
| Campo removido/renomeado, alteração de tipo ou significado ou ID retirado | MAJOR com plano de migração e prévia da incompatibilidade |
| `hipotese` → `causa_raiz_confirmada` por heurística | **PROIBIDO**, independentemente do número da versão |

O bloqueio por checksum nesta release foi definido de propósito para detectar *drift* acidental. **Não deve congelar o conhecimento para sempre**: uma nova release de preview, com mudança de conteúdo legitimada e rastreio explícito, precisará atualizar snapshot, hash e justificativa de compatibilidade de forma consciente.

## Implementação e controle

- [Validador da auditoria](../scripts/validate-systemic-root-audit.mjs) confronta cada uma das 42 alegações com a versão de origem e exige duas categorias documentais e contraprova material plausível.
- [Validador de compatibilidade](../scripts/validate-public-compatibility.mjs) verifica campos/estado do preview, checksum original, continuidade dos registros, separação da versão do contrato e oito cenários sintéticos.
- `npm run systemic:audit:validate` e `npm run public:compatibility` integrados ao GitHub Actions, além dos gates anteriores.
- Relatório agregado de qualidade inclui 21 cadeias auditadas, 42 causas candidatas, oito regressões contratuais e **zero** aprovações.
- A página SemVer foi adicionada ao índice bibliográfico, que agora conta **49 fontes**; apenas 20 são exportadas pelo preview anterior.

## Limitações e próximos passos — v1.3.14

1. Avaliar criticamente as três candidatas de causas sistêmicas dos roteiros v1.3.11 (**6 hipóteses**), com o mesmo padrão de prova processual e contraprova.
2. Criar estratégia explícita para **nova release do preview público** quando houver mudanças legítimas de conteúdo, sem confundir schema, contrato e versão do catálogo.
3. Avançar piloto CAT D9 somente com prefixo de série, documentos OEM/CTS de uso autorizado, arranjo e revisão humana — sem inventar torques, tolerâncias ou PNs.
4. Revisar criticamente as **10 lacunas preventivas SAP** e a coerência das regras de geração, sem homologar por aproximação.
5. Preparar registro segregado de evidências reais autorizadas fora do repositório público quando houver fonte e governança corporativa definidas.

**Resumo do ciclo:** melhorou a governança das inferências e a estabilidade da exportação. As **24 cadeias e 48 investigações** permanecem hipóteses técnicas, com nenhuma ocorrência real e nenhuma causa raiz confirmada.
