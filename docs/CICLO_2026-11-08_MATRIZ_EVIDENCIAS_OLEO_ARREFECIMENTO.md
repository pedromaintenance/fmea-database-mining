# Ciclo 1.4.14 — Matriz de evidências para contaminação óleo × arrefecimento em motor diesel

**08/11/2026 · Aplicação: Engenharia de Manutenção, PCM e monitoramento de condição · Natureza: roteiro documental genérico, sem caso real**

## 1. Problema técnico

O dossiê 1.4.13 distinguiu sete hipóteses plausíveis para óleo no refrigerante, indícios de refrigerante no óleo e anomalias sem contaminação comprovada. O próximo problema é impedir que uma equipe transforme essa lista em teste ou troca de componente sem **efetividade OEM, amostragem, histórico, contraprova e método autorizado**.

A matriz 1.4.14 estrutura **14 classes de evidência documental** e associa os requisitos às sete hipóteses originais. Não é diagnóstico guiado por checklist: é **um inventário de documentos necessários**, com lacunas visíveis e uma solicitação sem dados reais, exportável para o PCM.

A distinção entre presença, qualidade e validade é determinante:
- **Presença declarada**: um operador marcou que a documentação estaria disponível fora do repositório. A interface não leu nem verificou o conteúdo.
- **Qualidade da evidência**: representatividade da amostra, confiabilidade da medição, proveniência, baseline, temporalidade, fonte e contraprova exigem análise de profissionais autorizados.
- **Efetividade e autoridade OEM**: desenhos, boletins, procedimento e critérios específicos precisam corresponder à configuração real do motor.
- **Causa raiz confirmada**: requer evidência técnica executada e revisada, não emerge automaticamente da documentação ou do checklist.

## 2. Base técnica rastreável

O [Cat S•O•S — How to Take a Sample & Read Results](https://www.cat.com/en_US/support/maintenance/sos-services/take-sample.html) menciona sódio como **indicador potencial** de entrada de água/refrigerante e identifica contaminação e condição do óleo. O [Perkins Oil sampling](https://www.perkins.com/en_GB/aftermarket/maintenance/perkins-fluid-sampling/oil-sampling.html) destaca tendências de amostras de um mesmo compartimento e registro correto de horas de equipamento e óleo. Nenhuma dessas páginas permite afirmar que o trocador, a junta ou o bloco falhou em um motor sem investigação.

Essas duas referências OEM públicas foram adicionadas à bibliografia, que passa a **107 itens catalogados**. Este total não significa que 107 fontes tenham sido revisadas integralmente neste ciclo. Permanecem disponíveis as fontes do ciclo anterior Caterpillar, Donaldson, Perkins e Noria, incluindo discussões de trocadores, vedação de cabeçote e interferência nos marcadores de glicol.

**Limite:** nenhuma referência nova contém valores de pressão, roteiro de ensaio ou efetividade por série aplicáveis indiscriminadamente a caminhões de mina.

## 3. Matriz comum e discriminação por mecanismo

Os cinco requisitos comuns a qualquer investigação são:

| ID | Pedido de informação | Finalidade |
| --- | --- | --- |
| DOC-ASSET | Identificação/efetividade OEM | Garantir que o material técnico corresponde ao motor efetivamente instalado |
| DOC-SYSTEM | Arquitetura dos dois circuitos | Localizar interfaces possíveis sem supor que o motor as possui |
| DOC-SAFE | Procedimento OEM e segurança | Verificar competência, limites e método autorizado antes de eventual intervenção |
| OBS-TIMELINE | Cronologia e histórico de sintomas | Separar correlação temporal de causa e analisar ocorrência antes/depois de serviço |
| REV-ALTERNATIVES | Revisão independente de hipóteses | Garantir que a análise não encerre prematuramente em “trocador” ou “junta” |

Os nove requisitos específicos incluem identificação de fluidos, laudos representativos de óleo e coolant, interpretação laboratorial, configuração real do trocador, mapas de galerias e juntas, observações externas, cadeia de abastecimento e histórico pós-reparo. Todos possuem propósito, solicitação e advertência de interpretação.

| Hipótese 1.4.13 | Documentos discriminantes adicionais | Limite |
| --- | --- | --- |
| **EC-COOLER-CORE** — trocador | Configuração do trocador, óleo, coolant, interpretação do laboratório, fluidos de base | Interface presente não confirma vazamento |
| **EC-HEAD-GASKET** — junta | Galerias/juntas, óleo, coolant, análise interpretativa | Indício de mistura não identifica junta danificada |
| **EC-CASTING** — bloco/cabeçote | Galerias/fundidos, óleo, coolant, interpretação | Trinca não pode ser presumida |
| **EC-BULK-CONTAMINATION** — suprimento | Lotes/complementos, formulações, laudos de óleo e coolant | Não atribuir falha interna sem investigar origem |
| **EC-ANALYTICAL-INTERFERENCE** — medição | Formulação, laudo de óleo, interpretação e método | Um marcador não basta para diagnóstico |
| **EC-RESIDUAL** — resíduo pós-serviço | Histórico de limpeza e reparo, formulações, laudos comparáveis | Resíduo não é prova de novo ingresso |
| **EC-NONCROSS-LOSS** — sem mistura confirmada | Evidência de perdas externas, coolant, formulação | Nível baixo não prova comunicação com óleo |

O roteiro não contém limites OEM, fórmulas de condenação, pressões de teste, número de peça, ranking probabilístico nem regras de liberação.

## 4. Uso prático em Engenharia e PCM

A [Matriz de Evidências](https://pedromaintenance.github.io/fmea-database-mining/matriz-evidencias-oleo-arrefecimento.html) executa somente avaliações documentais locais:

1. Selecionar uma hipótese dentre as sete alternativas canônicas.
2. Examinar cinco requisitos comuns e os discriminantes daquele mecanismo.
3. Marcar apenas **autodeclarações de disponibilidade de documento**. Os documentos reais permanecem nos sistemas corporativos, sob controle de acesso.
4. Examinar lacunas e exportar a **solicitação documental .txt** para encaminhamento interno ou inclusão manual na investigação.
5. Exportar um JSON com identificadores públicos, flags booleanas e hashes da matriz/dossiê para continuar outra sessão, sem série, pessoa, laudo ou ordem SAP.
6. Submeter os documentos autênticos a revisão de engenharia competente, com efetividade OEM e contraprovas. Nenhum botão da página executa teste, abre ordem ou atribui causa raiz.

O estado final, mesmo com todos os requisitos declarados, é sempre **DOCUMENT_SET_SELF_ATTESTED_FOR_HUMAN_REVIEW_ONLY**, não “evidência validada” nem “pronto para operar”.

### Exemplo de texto para requisição documental

**Assunto:** investigar indício de comunicação entre circuito de óleo e líquido de arrefecimento — mecanismo não confirmado.

**Finalidade:** coletar documentos técnicos de efetividade, representação dos circuitos, especificações reais de fluidos, histórico e laudos para diferenciar mecanismos concorrentes, sem recomendar desmontagem ou substituição.

**Resultado esperado:** pacote técnico suficiente para revisão de engenharia, com lacunas e contraprovas explícitas, sem presumir liberação operacional.

**Restrições:** não anexar dados de ativos, laudos confidenciais ou documentação OEM licenciada ao repositório público. A eventual ordem ou nota SAP deve surgir de fato observado, avaliação técnica e governança interna — não da marcação deste checklist.

## 5. Integração ao projeto e preservação de escopo

Arquivos entregues:
- \`data/quality/engine-crossfluid-evidence-matrix.v1.json\`: as 14 evidências, fonte/risco de interpretação e sete gates documentais.
- \`scripts/lib/engine-crossfluid-evidence.mjs\`: funções puras para checklist vazio, validação por schema fechado, avaliação conservadora e solicitação documental.
- \`docs/matriz-evidencias-oleo-arrefecimento.html\`: interface standalone, sem rede, armazenamento persistente nem campos de dado identificável.
- \`scripts/build-engine-crossfluid-evidence.mjs\`: incorpora matriz, dossiê original, fontes e fingerprints SHA-256 à consulta pública.
- \`scripts/audit-engine-crossfluid-evidence.mjs\`: auditoria de invariantes técnicos, segurança, privacidade, bibliografia, funcionamento dos sete gates, importação inválida e arquivos congelados.
- Bibliografia e índice curado atualizados.

O repositório já possui \`data/governance/pm-evidence-intake-policy.v1.json\` para a governança das regras de planos de manutenção. **Não foi modificado.** Não devemos cruzar a autorização sintética desse fluxo com a matriz conceitual de motores: uma revisão de diagnóstico não autoriza promover dados SAP ou regras de PM.

O buscador lexical e as dez fichas do piloto humano da versão 1.4.11 permanecem bloqueados e inalterados. Este material é posterior ao congelamento e **não pode ser usado para antecipar respostas aos revisores cegos do piloto**.

## 6. Evidência material ainda necessária

Nenhuma configuração OEM real foi identificada ou homologada neste ciclo, e nenhum laudo do usuário foi lido nem incorporado. O dossiê continua conceitual e pendente de revisão humana.

**Próxima atividade concreta:** escolher, em ambiente corporativo autorizado, um equipamento e motor cuja identificação e documentação OEM estejam disponíveis; levantar os cinco requisitos comuns, selecionar a hipótese orientadora e registrar faltas documentais. A etapa seguinte é uma revisão técnica da engenharia — com fontes e contraprovas — antes de decidir qualquer teste, intervenção ou liberação.

**Conclusão operacional:** o objetivo da matriz não é provar depressa que “o trocador vazou”, mas impedir que a engenharia feche prematuramente uma causa enquanto faltam informações que poderiam contradizê-la.
