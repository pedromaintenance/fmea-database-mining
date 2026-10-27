# Ciclo v1.3.69 — Hipóteses discriminantes e contraprovas nos cinco P0

**27/10/2026 · Catálogo 1.3.69 · Ontologia 1.3.23 e maturidade 1.3.60 preservadas**

## Problema tratado

A v1.3.68 deixou uma fila documental de dez exceções PM×SAP, com cinco registros P0. Na v1.3.65 esses P0 receberam 15 hipóteses conceituais, mas ainda era necessário traduzi-las em **perguntas verificáveis, contraprovas independentes, condição de inconclusão e documentação habilitadora**. A atual versão não executa ensaio, não homologa manual por série, não valida equipamento real e não recebe anexos corporativos.

## Diferenciação mecânica por regra

| Exceção P0 | Hipóteses distintas para avaliar | Risco de inferência indevida |
| --- | --- | --- |
| Radiador / troca térmica | Sujidade externa/fluxo de ar; circulação interna; leitura/instrumentação | Temperatura elevada isolada não prova núcleo obstruído |
| Filtragem de combustível | Restrição física do elemento; água/partículas no fluido; posição funcional HSVV | Contaminação não prova falha do filtro nem autoriza vínculo HSVV |
| Água no tanque | Origem/entrada de água; integridade física do dreno; qualidade da amostragem | Água no tanque não prova dreno danificado |
| Fuga em mangueira hidráulica | Parede/terminal; conexão/vedação; hierarquia do circuito | Óleo externo pode migrar de outro componente |
| Abrasão em mangueira | Atrito na capa; dano de reforço; interferência/roteamento | Marca superficial não comprova dano estrutural ou causa raiz |

Os 15 roteiros reproduzem integralmente os campos de hipótese e alternativa da política original v1.3.65 e **acrescentam** uma observação qualitativa discriminante, uma checagem de explicação concorrente e um limite explícito de refutação ou inconclusão. As hipóteses **podem coexistir**. As distinções são propostas de investigação; nenhum valor de pressão, temperatura, tolerância ou método de campo é improvisado.

## Resultado da validação automatizada (GitHub Actions)

| Indicador | Resultado |
| --- | ---: |
| Regras documentais P0 | 5 |
| Hipóteses diferenciais | 15 |
| Chaves genéricas de modelo (não ativos reais) | 7 |
| Combinações teóricas regra × chave | 35 |
| Associações de hipótese × classe documental | 64 |
| Classes documentais distintas no catálogo | 7 |
| Ataques adversariais detectados e rejeitados | **75/75** |
| Evidências reais, testes executados, causas confirmadas e aprovações SAP | **0** |

As **64 associações** são requisitos potenciais deduzidos da política dos roteiros, não 64 documentos ausentes, solicitações enviadas, ordens de manutenção ou testes efetivos. Todas as decisões continuam **NO-GO** até verificação corporativa privada autorizada.

## Evidências, efetividade e segurança

Cada hipótese aponta para os IDs existentes da v1.3.65: `ASSET-ID`, `OEM-MANUAL`, `OEM-SCHEMATIC`, `OEM-BOM`, `OEM-TEST`, `FIELD-EVIDENCE`, `SAP-BOM`. Esses IDs representam **classes potenciais de documentos**, não documentos enviados, recebidos ou verificados. A porta inicial continua sendo identidade real/variante em ambiente privado, seguida de OEM por série e critérios técnicos efetivos.

Para hidráulica, inspeções reais demandam bloqueio de energias e despressurização; nunca buscar vazamento com a mão ou efetuar reaperto em pressão. Para arrefecimento, não abrir sistema quente/pressurizado. Para combustível, considerar isolamento, fontes de ignição, resíduos e preservação de amostra quando o procedimento exigir. Nada neste arquivo autoriza tarefas executivas ou substitui procedimentos aplicáveis.

## Independência de decisões

```text
15 hipóteses conceituais P0
   ↓ projeto público de evidência e contraprova (NO-GO)
   ↓ identidade e efetividade OEM — ambiente privado
   ↓ coleta, metrologia, segurança e contraditório — autorizados
   ↓ parecer técnico da Engenharia (dano ≠ causa ≠ condição)
   ↓ decisão formal de dados mestres SAP separada
   ↓ autorização operacional independente, se cabível
```

Não se deve confundir P0 documental com severidade FMEA/RPN, avaliar causa raiz sem mecanismo comprovado, nem fechar exceções de sistema/grupo/subgrupo por igualdade textual de códigos como `HSVV`.

## Arquivos e execução

- `data/quality/pm-p0-discriminative-evidence-policy.v1.json`: 15 roteiros específicos e barreiras de decisão.
- `scripts/lib/pm-p0-discriminative-evidence.mjs`: gerador determinístico com proveniência dos registros P0, contagem de classes documentais e status NO-GO.
- `scripts/audit-pm-p0-discriminative-evidence.mjs`: auditor que reconstrói as versões anteriores e tenta falsificar ativos, medições, diagnósticos, conclusão de causa, liberação SAP/operacional e contraprovas.
- `reports/pm-p0-discriminative-evidence.generated.json`: relatório gerado no CI e entregue no pacote de auditoria do workflow.

Comando: `npm run pm:p0:discrimination:audit`. Não altera `data/catalog`, as 25 regras, os 115 vínculos candidatos, a ontologia, as dez exceções nem repositórios consumidores.

## Próximo passo de campo, fora deste repositório

Selecionar um P0 junto à Engenharia e identificar **privadamente** uma configuração e série real. Localizar OEM efetivo e medir/inspecionar apenas por procedimento e equipe habilitados. Registrar no sistema privado as evidências que confirmam, enfraquecem ou deixam inconclusiva cada hipótese, inclusive contraprovas. Somente então considerar revisão de mapeamento SAP e eventuais ordens no processo corporativo próprio.
