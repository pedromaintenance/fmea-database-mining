# Ciclo FMEA v1.3.15 — Versionamento independente do conteúdo público

**Data editorial:** 20/10/2026  
**Escopo:** unicamente FMEA Database Mining. O software consumidor não foi modificado.  
**Natureza:** controle de publicação e regressões sintéticas, não validação por fabricante, auditoria física nem aprovação de causa raiz.

## Problema técnico

O catálogo interno cresceu de 1.3.12 para 1.3.14, mas o preview público preservou o conteúdo 1.3.12. Já existia um contrato público SemVer 1.0.0, porém faltava controle próprio do **conteúdo**. Tratar a versão do pacote como versão da API ou do conteúdo induziria consumidores a supor mudança onde não houve e permitiria alterações editoriais silenciosas.

## Três versões sem sobreposição

| Camada | Versão após o ciclo | O que significa |
|---|---|---|
| Pacote de desenvolvimento | **1.3.15** | Evolução de validadores, documentos e dados editoriais internos |
| Contrato/API público | **1.0.0** | Formato e significado dos campos públicos; SemVer contratual |
| Conteúdo público | **1.0.0** | Primeira baseline versionada retrospectivamente por snapshot íntegro |
| Campo legado `preview.version` | **1.3.12** | Preservado no JSON original, sem mutação de bytes ou interpretação |

A baseline 1.0.0 de conteúdo é **um registro retrospectivo**, não uma segunda publicação de alterações; o preview continua com 24 hipóteses, 20 referências, 0 ocorrências e nenhum uso operacional aprovado.

## Implementação

O [registry](../data/governance/public-content-releases.v1.json) aponta para o [golden snapshot](../data/governance/snapshots/public-knowledge.content-1.0.0.json) e para o hash histórico **SHA-256**:

`b780a1c95e6f2ab5b3fb1f9acd20a63a1a5abd0e3f3ed111f61052b2e8c59c65`

O validador reconstrói o export público, lê cada snapshot em bytes, verifica o hash, checa contagens, compara o snapshot atual ao JSON gerado e cruza a raiz histórica com o contrato existente. O arquivo `scripts/lib/public-content-release.mjs` implementa uma comparação **conservadora**: alterações de título e descrição de efeito propostas são candidatas a patch; IDs hipotéticos ou referências adicionais são candidatos a minor; exclusão de ID, alterações de modo causal/estado, schema e promoção operacional são rejeitados automaticamente.

**A classificação de patch/minor não é aprovação técnica.** Futuros releases novos exigem registro de revisão editorial humana e histórico; mudanças incompatíveis dependem de versão major do contrato, migração e procedimentos separados que este ciclo não autoriza automaticamente.

## Critérios de aceitação reproduzíveis

| Gate | Arquivo/comando | Falha detectada |
|---|---|---|
| Export por allowlist | `npm run public:export` | Fonte não autorizada, inferência promovida, estrutura inesperada |
| Contrato SemVer | `npm run public:compatibility` | Drift de formato ou digest original |
| Conteúdo e golden | `npm run public:content:validate` | Arquivo diferente, SHA inválido, versão incorreta, snapshot faltando, aprovação indevida |
| Regressão de mudanças | `npm run public:content:test` | 17 mutações: bump incorreto, exclusão de ID, troca de mecanismo, alteração de status, schema ou hash |
| Pipeline geral | `npm run qa` e CI | Regressões cruzadas de ontologia, evidências, causalidade e exportação |

Em uma mudança futura de conteúdo, registrar nova versão e snapshot sem reescrever o histórico. Esta evolução deverá preservar o conjunto de chaves e o significado causal; não adicionar campos extras sob o contrato 1.0.0. O conteúdo só será disponibilizado após testes e revisão, e nenhum jogo receberá atualização automática.

## Limites técnicos e pendências

- O conjunto de regras é um **gate de automação**; ele não substitui code review, controle de acesso, aprovação de origem bibliográfica e licenciamento.
- O contrato v1.0.0 mantém explicitamente o snapshot inicial congelado. O fluxo para mudança contratual major/migração deve ser implementado e revisado antes de executar uma transição incompatível.
- Nenhum dado de campo, caso OEM confirmado, torque, causa raiz, falha de manutenção ou evidência real foi criado.
- **Próximo ciclo:** efetividade OEM do piloto CAT D9 por configuração real autorizada, ou, se não houver documentação, auditoria técnica dos dez bloqueios PM restantes sem relaxar compatibilidade SAP.

**Referência de versionamento:** [Semantic Versioning 2.0.0](https://semver.org/lang/pt-BR/spec/v2.0.0.html), cuja aplicação ao conteúdo JSON é regra própria do projeto; SemVer não valida hipóteses mecânicas.
