# Ciclo v1.3.93 — Red team e comportamento fail-closed do avaliador de evidências CAT 395

**03/11/2026 · Engenharia de Manutenção / FMEA Database Mining.** Revisão de qualidade de software e governança; **não é novo diagnóstico mecânico, nem inspeção executada**.

## Problema encontrado na implementação anterior

A v1.3.92 introduziu um contrato para registrar em ambiente privado a aplicabilidade OEM por série e expor apenas a completude documental. A revisão do código identificou vulnerabilidades de **validação lógica**:

1. Campos extras fora do contrato (por exemplo, sinalizadores artificiais de autorização ou códigos aprovados) podiam coexistir com metadados suficientes e receber `READY_FOR_HUMAN_REVIEW`, porque a avaliação não verificava a estrutura exata do objeto.
2. Declarações com tipos inválidos (por exemplo, a string `"false"` no lugar do booleano) podiam passar quando o valor não era usado em determinadas condições.
3. A versão anterior avaliava se uma medição possuía unidade e grandeza, mas **não exigia consistência dimensional entre elas**. Um valor rotulado como pressão em `L/min` poderia aparecer em registro documental completo.
4. Elementos malformados de `gateEvidence` podiam causar exceção em tempo de execução, em vez de bloqueio previsível.
5. O auditor conferia a sintaxe do script offline, mas não exigia que a lógica embutida permanecesse **idêntica** à biblioteca de Node.js.

O efeito dessas falhas seria **falsa prontidão documental**, não uma liberação operacional (essa sempre foi proibida). São defeitos reais da implementação, não indícios de incidente ou fraude de usuário.

## Correções implementadas

- **Estrutura exata:** o avaliador verifica presença e ausência de campos em nível raiz, ativo, cada gate, revisão humana, SAP, privacidade e cada medição. Objetos malformados bloqueiam em vez de serem parcialmente interpretados.
- **Tipos e enumerações:** rejeita statuses não previstos, booleanos apresentados como texto e inconsistência de fonte, variante e aprovação. Um registro não pode conter os campos `approvedRootCause`, `approvedDamageCode` ou `operationalApproval` fora do schema e parecer completo.
- **Grandezas e unidades:** somente coerência dimensional, `pressure → kPa/bar`, `flow → L/min`, `time → s`, `temperature → °C` e `displacement → mm`. **Não foram criados limites OEM de teste, critérios de aceitação, medições reais ou pressões de serviço.**
- **Contenção de falhas:** o caminho de avaliação deve retornar `BLOCKED_PENDING_DOCUMENTATION` e códigos predefinidos diante de entrada inválida, sem lançar exceção por elemento nulo, quantidade desconhecida ou campo omitido.
- **Paridade offline:** o arquivo [HTML de verificação](cat395-private-evidence-workbench.html) agora incorpora exatamente o mesmo código de avaliação do módulo `scripts/lib/cat395-serial-evidence.mjs`; sua equivalência é testada tanto em texto quanto em execução JavaScript isolada.
- **Privacidade:** saída permanece com allowlist rígida e foi testada com um marcador sintético inserido nos campos internos. Nenhum ID, documento, revisão, medição, texto livre ou nome é emitido no resumo.
- **Schema atualizado sem mudar o contrato de entrada:** `schemas/cat395-private-evidence-draft.schema.json` acrescenta condições de unidade. A **versão de catálogo** evolui para 1.3.93, enquanto o **formato contratual existente** permanece em 1.3.92 (mudança de verificação, não um novo registro ou migração de dados).

## Provas de regressão

`scripts/audit-cat395-evidence-hardening.mjs` introduz **46 registros adversariais**, **9 entradas malformadas**, **8 contratos adulterados** e um teste adicional de não vazamento com identificador sintético. Também verifica:
- Uma ficha sintética completamente preenchida resulta somente em `READY_FOR_HUMAN_REVIEW`, jamais em homologação.
- Uma linha de medição coerente e sintética pode ser considerada completa para **conferência humana** quando todos os requisitos são declarados; isso não prova que a medição tenha sido realizada.
- O HTML e o módulo Node.js fornecem saídas idênticas para entradas de teste, sem backend, rede ou armazenamento persistente.
- O novo schema tem o mesmo conjunto exato de campos do avaliador e limita a quantidade de linhas de medição.
- O comando `npm run pm:cat395:evidence:hardening:audit` passa a fazer parte do `npm run qa` e do workflow GitHub Actions.

## Limites e próximos passos

Não há na base pública **série real de CAT 395**, diagrama efetivo, resultado de ensaio, dado de SAP ou autorização OEM; os testes são inteiramente sintéticos. Tampouco há validação criptográfica, DLP, autenticação humana ou prova de que as referências declaradas existam. A ferramenta **não deve receber dados corporativos fora da infraestrutura privada e aprovada**.

Se a empresa autorizar um piloto, o próximo passo deve ser conferir a aplicação real em SIS/OMM por série, executar somente a inspeção/teste definido pelos profissionais habilitados, manter todos os resultados sob custódia privada e submeter os achados a revisão independente. Sem isso, continuar adicionando metadados públicos não aumenta a verdade do FMEA.

**Invariantes:** 25 regras PM conceituais, 10 exceções PM×SAP bloqueadas, oito gates corporativos NO_GO, zero inspeções executadas, zero testes de campo, nenhuma aprovação e nenhum consumidor alterado.
