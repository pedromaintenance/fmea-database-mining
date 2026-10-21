# Auditoria estrutural de hipóteses preventivas × SAP — versão 1.3.34

**Data:** 21/10/2026 · **Natureza:** verificação reproduzível de estrutura e lógica sobre os dados reais existentes no repositório, sem acesso ao SAP corporativo ou a manuais OEM licenciados.

## 1. Problema identificado

O catálogo tem **25 regras preventivas didáticas** em `data/knowledge/pm-prevention/seed-rules.json`, construídas a partir de classes de atividades dos planos preventivos. O gerador `scripts/generate-pm-links.mjs` cruza cada uma com os objetos SAP e restrições de dano/causa. O resultado não representa dano físico observado: é uma associação candidata para conduzir inspeção/treinamento.

O validador anterior verificava `matchesRoot` e a compatibilidade do par dano/causa, mas não exigia **todas** as seguintes concordâncias: `models` da regra, `subgroupCode`, `partText`, `damageId` e `causeId` da regra, `symptom` e `inspectionMethod`, `originRule` e integridade do ID gerado. Uma alteração posterior do arquivo gerado poderia, portanto, preservar códigos tecnicamente plausíveis e ainda assim mudar a hipótese originalmente escolhida.

**A mudança principal foi corrigir essa lacuna no código que valida todos os vínculos reais gerados**, não criar mais uma lista de aceites sintéticos.

## 2. Cadeia de validação exigida para cada vínculo

`Regra preventiva → modelo elegível → sistema/grupo compatíveis → subgrupo exato → localização SAP de profundidade 3 → tipo de objeto → componente catalogado e texto correspondente → dano/causa permitidos → sintoma/método da regra`.

O auditor agora verifica também os marcadores obrigatórios:

- `occurrence = nao_observada`;
- `evidenceStatus = metodo_planejado_sem_resultado`;
- `associationStatus = inferido_nao_validado`;
- `systemScope = filtro_de_sistema_candidato`.

A advertência de que um candidato **não é achado nem causa raiz confirmada** não pode ser suprimida. Cada ID é recomputado a partir da regra, da localização e do componente para detectar deriva, e a contagem real gerada é conciliada com o número de associações que satisfazem o filtro estrito.

## 3. Diagnóstico automático por regra e limitações

Execute `npm run pm:generate && npm run pm:validate && npm run pm:scope:audit`. O último comando gera `reports/pm-system-scope-audit.generated.json`.

A saída mostra, **para cada uma das 25 regras**, quantas localizações modelo/profundidade são elegíveis, quantos subgrupos coincidem, quantos permanecem na raiz e grupo corretos, quantas peças correspondem à descrição e quantos pares dano/causa são permitidos. Para regras sem nenhum candidato, a explicação estrutural é uma destas:

| Classificação do auditor | Significado | Próxima verificação |
|---|---|---|
| `missing_model_subgroup` | Nenhuma localização dos modelos elegíveis possui o subgrupo indicado | Revisar cadastro/hierarquia por modelo |
| `subgroup_outside_functional_system` | Subgrupo existe, mas em raiz/grupo incompatíveis com o sistema da regra | Diferenciar códigos homônimos sem extrapolar função |
| `component_absent_in_object_type` | Raiz/subgrupo compatíveis, mas o tipo de objeto não lista a peça descrita | Conferir composição física e BOM OEM por configuração |
| `damage_cause_incompatible` | Peça existe, mas o par dano/causa da hipótese não é permitido | Rever o mecanismo proposto e a codificação oficial |

**Esses diagnósticos são estruturais.** Uma regra não gerar vínculo pode representar lacuna de catálogo, hipótese inadequada ou variação válida de arquitetura física. Não autoriza criar código SAP ou associação por semelhança verbal.

O auditor também sinaliza códigos de subgrupo reutilizados entre diferentes sistemas. Exemplo de risco: `HSVV` ocorre em padrões de combustível e hidráulica; consultar apenas o subgrupo pode sugerir mangueira hidráulica em um conjunto de combustível. Para evitar isso, sistema, grupo e objeto devem permanecer conjuntamente coerentes.

## 4. Testes de regressão

O arquivo [de 49 checagens](../data/quality/pm-strict-link-regressions.v1.json) cobre:

- Reconciliação dos **25 IDs de regra** originais com os resultados reais.
- **24 alterações adversariais**, que tentam mudar sistema, grupo/subgrupo, modelo, localização, tipo de objeto, componente, dano, causa, texto de peça, método e sintoma; criar evidência/aceite falso; ou suprimir, duplicar ou ampliar campos de vínculos.
- Testes de fronteira entre arrefecimento e motor, combustível, freio/direção versus hidráulica genérica, material rodante e compressor. São verificações de **classificação**, não ensaios em equipamento.

Qualquer falha de integridade causa erro do CI, impedindo que uma base publicamente consumível seja produzida com associações corrompidas.

## 5. Impacto sobre as pendências reais

As **10 exceções PM × SAP** em `data/quality/pm-exception-evidence-gates.v1.json` continuam sem evidência homologada. A nova auditoria melhora a confiança de que **não há vínculos estruturais indevidos no lote gerado**; não valida os 25 padrões como fisicamente aplicáveis a cada modelo.

A confirmação operacional depende de dados por arranjo, BOM e procedimento OEM aplicáveis, inspeção autorizada e revisão independente. Nenhum local funcional, código de falha, peça, modelo específico ou condição de máquina foi aprovado neste ciclo.

O piloto D9 permanece com pedido pronto e [issue #31](https://github.com/pedromaintenance/fmea-database-mining/issues/31) aberta, **sem envio corporativo executado**.

## 6. Próximo ganho técnico

Usar o relatório por regra para priorizar **uma** exceção em que existam origem SAP e documento OEM acessíveis pela área responsável. Revisar alternativas (ex.: restrição externa de ar no radiador versus bloqueio interno; filtro ausente da tipologia cadastral versus ausência física do elemento). Somente um revisor autorizado poderá mudar a conclusão de `inferido_nao_validado`.

**Conclusão:** integridade de associações reforçada; nenhuma causa raiz, taxa de falha, desgaste CTS ou conformidade OEM foi inferida.
