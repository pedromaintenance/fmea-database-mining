# FMEA v1.3.14 — Auditoria dos três roteiros remanescentes

**Data editorial:** 20/10/2026. **Escopo:** apenas FMEA Database Mining. **Natureza:** parecer editorial, não análise de campo nem homologação OEM.

## Situação inicial

A v1.3.13 auditou 42 hipóteses sistêmicas das 21 cadeias ampliadas. Restavam as duas causas sistêmicas candidatas de cada um dos roteiros aprofundados v1.3.11. Foram preservados os textos e lacunas de `data/ontology/causal-levels.v1.json` e `data/quality/diagnostic-pathways.v1.json`, acrescentando critérios de evidência e contraprovas.

## Matriz de risco de inferência

| Cadeia | Alegação sistêmica não comprovada | Prova necessária | Contraprova física relevante |
|---|---|---|---|
| FC-HOSE-001 | Controle insuficiente do roteamento na montagem | Desenho, inspeção de aceitação, histórico de alteração | Interferência posterior ou óleo vindo de cima |
| FC-HOSE-001 | Verificação incorreta da origem de vazamento | Fotos/OS anteriores, resultado de teste autorizado | Falha nova e independente da última intervenção |
| FC-FD-001 | Deficiência de vedação/controle de contaminantes | Coleta representativa e verificação física da entrada | Desgaste interno sem ingresso; coleta contaminada |
| FC-FD-001 | Estratégia de lubrificação/monitoramento inadequada | Plano, óleo, horas, baseline, laudos e decisões | Defeito interno com plano correto; troca de formulação |
| FC-TRACK-005 | Controle inadequado de torque/aperfeiçoamento de montagem | Montagem por série, registros antes/depois, juntas | Perda de pré-carga por relaxação sem giro |
| FC-TRACK-005 | Seleção ou reutilização imprópria de fixadores | PN/lote, critérios OEM e histórico de reinstalação | Acomodação de superfícies, mesmo com peça nova |

Cada uma das seis hipóteses possui **dois documentos independentes** a obter, uma **explicação não organizacional** plausível, e bloqueio explícito a atribuição automática de falha humana. Os nove testes dos três roteiros continuam **não realizados**. Ausência de OS e inspeções reais impede confirmar desvio de processo.

## Verificações esperadas

- 24/24 cadeias auditadas editorialmente, 48/48 hipóteses; 0 causas confirmadas e 0 processos examinados.
- Contrato público 1.0.0 inalterado, com versão do preview 1.3.12, **24 registros**, **20 referências**, SHA-256 `b780a1c95e6f2ab5b3fb1f9acd20a63a1a5abd0e3f3ed111f61052b2e8c59c65`.
- JSON Schema revisado e `npm run systemic:audit:validate`, `npm run public:compatibility` no CI. Sem alterar exportação ou consumidores.

## Próxima ação

Definir uma política para releases de **conteúdo do preview**, diferenciando alteração editorial de contrato de estrutura. Manter revisão OEM por série, confirmação de dados de campo e piloto CAT D9 como pendências.

Referências metodológicas previamente indexadas: [IEC 60812:2018](https://webstore.iec.ch/en/publication/26359) e [ISO 14224:2016](https://www.iso.org/standard/64076.html), esta última por adaptação metodológica; não houve consulta ao conteúdo integral das normas nesta revisão.
