# Ciclo v1.3.66 — Triagem sequencial de chaves e aplicabilidade funcional P0

**27/10/2026 · Catálogo 1.3.66 · Ontologia 1.3.23 · Maturidade 1.3.60 (preservadas)**

## Problema material
A prontidão documental v1.3.65 contém **5 regras P0 × 7 chaves genéricas = 35 posições candidatas** e **7 classes documentais × 35 posições = 245 slots teóricos**. Essas quantidades não são 35 máquinas, 245 documentos corporativos faltantes ou 245 solicitações enviadas. Fazer todas as solicitações antes de estabelecer aplicabilidade por família/variante/série e sistema funcional induziria trabalho improdutivo e risco de falsa confirmação.

## Entrega do ciclo
- **7 templates de reconciliação de chave** (`CAT777`, `CAT980`, `EQ02`, `EQ03`, `EQ05`, `EQ06`, `EQ07`). Cada template reúne os cinco padrões P0 e os sistemas envolvidos; nenhum é identidade individual de máquina.
- **35 posições condicionais de primeira verificação** (`ASSET-ID`). A consulta inicial exige verificar correspondência real da chave com modelo, variante, série, instalação e contexto da função em ambiente privado autorizado.
- **210 posições documentais deferidas** (manual OEM, esquema, BOM, procedimento/limite de teste, evidência de campo e estrutura funcional SAP): seis classes para cada uma das 35 posições. São classes potenciais, não documentos solicitados nem ausências confirmadas em acervo privado.
- **Filtro funcional apenas preliminar**, obtido de `ROOT_SCOPES`. Raiz, grupo, subgrupo, tipo de objeto, componente e permissão dano/causa têm de ser comprovados separadamente no contexto da máquina; `HSVV` em um sistema não identifica outro circuito automaticamente.
- **55 ataques adversariais** na auditoria para detectar falsos ativos, séries, confirmações OEM, resultados de inspeção, promoção de causa, aprovação de códigos SAP ou liberação de máquina.

## Sequência proposta, com decisão humana
```text
[7 chaves genéricas]                     templates públicos sem ativos
           ↓
[35 posições regra × chave]              primeiro gate ASSET-ID, ainda NÃO VERIFICADO
           ↓ confirmação PRIVADA da instalação e função
[até 210 classes documentais]            SOMENTE para aplicações pertinentes
           ↓ literatura OEM e diagnóstico discriminante seguro
[Engenharia / Dados Mestres SAP / Operação]  aprovações independentes
```

A eventual classificação privada `applicable`, `not_applicable` ou `requires_more_evidence` deve ficar fora do repositório público. Não existe mecanismo de promoção automática, serviço SAP, integração com SIS restrito, recepção real de documentação ou autorização operacional nesta versão.

## Checagens e fontes
`npm run pm:p0:staged-triage:audit` gera `reports/pm-p0-staged-triage.generated.json`. As entradas são a matriz P0 v1.3.65, as 25 regras do catálogo, as dez exceções PM×SAP, a maturidade 1.3.60, o runbook privado com oito gates bloqueados e o filtro funcional existente. O relatório integra a pipeline de CI; não altera o catálogo de 25 bundles nem consumidores externos.

**Resultado de referência:** `NO_GO`. Nenhuma aplicação OEM por série, evidência física, código SAP, OS ou aprovação real foi criada.

## Próxima ação
No ambiente corporativo privado: selecionar uma chave candidata, resolver sua correspondência com modelo/variante/série, conferir função e arranjo físico; somente então descartar casos não aplicáveis e solicitar OEM efetivo aos restantes. Sem estes dados, ampliar listas públicas de requisições não aumenta a maturidade do FMEA.
