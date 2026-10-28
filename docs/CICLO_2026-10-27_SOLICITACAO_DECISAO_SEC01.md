# Ciclo v1.3.75 — Solicitação SEC-01 pronta para adaptação e envio interno

**27/10/2026 · Catálogo 1.3.75 · Preparação concluída, solicitação corporativa não enviada**

## Resultado da entrega

O ciclo converte o pacote RACI da v1.3.74 em um **memorando executivo enxuto, copiável**, para pedir avaliação do desenho de ambiente restrito junto às funções corporativas responsáveis. O memorando é gerado automaticamente em `reports/sec01-corporate-request.generated.md`, junto do relatório de auditoria `reports/pm-sec01-decision-request.generated.json`.

Não é uma deliberação jurídica, decisão sobre DPIA ou aceitação de licenças. Não foi criado chamado, convocação, mensagem ou registro em sistema corporativo; toda evidência real e assinatura permanece ausente.

## Fronteira da solicitação

A única pergunta é: **as áreas autorizadas concordam em examinar e delimitar o desenho de um ambiente corporativo restrito para futura custódia e avaliação independente de evidências técnicas?**

Mesmo resposta favorável a essa pergunta não aprova implantação, ingestão de dados, autorização de campo, manutenção, alteração SAP, homologação do SEC-01, avanço para ID-02 ou piloto privado.

O texto gerado contém uma exclusão explícita de cada um desses usos.

## Três decisões e nove evidências

| Decisão independente | Função sugerida (não nomeada) | Checks vinculados |
| --- | --- | --- |
| SEC01-DEC-SPONSOR — patrocínio/escopo | Governança | SEC01-A01/A02/A03 |
| SEC01-DEC-OEM — licenciamento OEM | Jurídico/licenciante | SEC01-L01/L02/L03 |
| SEC01-DEC-PRIVACY — privacidade, classificação e DPIA | Privacidade/controlador | SEC01-P01/P02/P03 |

O conteúdo e os IDs são herdados do pacote SEC-01 e do registro v1.3.74. As funções não foram validadas como **aprovadoras reais**.

O texto pronto para encaminhamento solicita respostas separadas por deliberação, justificativa, autenticidade do signatário e documentação privada. Nada disso é armazenado neste repositório.

## Roteamento sintético de respostas

O classificador é um **ensaio determinístico e restrito a valores enumerados**. Ele não recebe nomes, séries, licenças, URLs, documentos ou decisões empresariais verdadeiras.

| Padrão simulado | Encaminhamento proposto |
| --- | --- |
| Ausência de avaliação | Pendente de revisão humana |
| Aprovação hipotética parcial de desenho | Continua pendente das demais revisões |
| Pedido de prova complementar | Solicitar evidências **no ambiente privado** |
| Correção de escopo | Retornar para correção |
| Recusa por escopo/direitos OEM | Interromper e rediscutir escopo |
| Três manifestações hipoteticamente favoráveis | **Aguardar atestação independente e processo formal** |

Prioridade: recusa → correção → evidência adicional → pendência → aparente aprovação restrita. A última alternativa **não altera nenhum gate**.

## Como proceder fora do repositório

O profissional habilitado deve copiar o memorando de `reports/sec01-corporate-request.generated.md`, identificar **privadamente** o canal e os responsáveis internos autorizados, conferir o texto com Segurança, Jurídico e Privacidade, e só então encaminhar a solicitação. Os pareceres e suas evidências devem permanecer em sistema corporativo com autorização, segregação, retenção e trilha de auditoria adequadas.

Não enviar documentos OEM, tags/séries de equipamentos, medições reais, capturas SAP, assinaturas ou hashes ao GitHub público.

## Implementação e validação

- `data/governance/pm-sec01-decision-request-policy.v1.json`: decisões, escopo, enumerações, seis cenários e controles fail-closed.
- `scripts/lib/pm-sec01-decision-request.mjs`: gerador do memorando e triagem sintética de respostas.
- `scripts/audit-pm-sec01-decision-request.mjs`: auditoria da derivação, regressões anteriores e mutações de assinatura, envio, gate, SAP e liberação.
- `reports/sec01-corporate-request.generated.md`: cópia em Markdown gerada como artefato do CI.
- `reports/pm-sec01-decision-request.generated.json`: resultado estruturado da auditoria.

Comando: `npm run pm:sec01:request:audit`.

**Condição final:** `PREPARED_NOT_SUBMITTED` e `NO_GO_SEC01_NOT_AUTHORIZED`, com oito gates corporativos e dez exceções PM×SAP ainda bloqueados. O benefício concreto do ciclo é reduzir o handoff ao **material de encaminhamento**; o próximo avanço depende de deliberação real, não de nova simulação pública.
