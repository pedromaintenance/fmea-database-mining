# Ciclo v1.3.65 — Matriz de prontidão de investigação por sistema e chave de modelo

**26/10/2026 · Catálogo 1.3.65 · Ontologia 1.3.23 (preservada) · Maturidade 1.3.60 (preservada)**

## Resultado e limites de interpretação

Esta versão transforma os **cinco bloqueios PM×SAP P0 preexistentes** em solicitações de evidência e hipóteses diferenciáveis por sistema. São cinco pacotes, cada um associado a **sete identificadores de modelo candidatos** que constam das regras PM originais: `CAT777`, `CAT980`, `EQ02`, `EQ03`, `EQ05`, `EQ06` e `EQ07`.

O produto cartesiano gera **35 posições de investigação**, não 35 máquinas existentes, 35 séries conhecidas, 35 aplicações OEM válidas ou 35 ordens. Uma chave genérica não comprova família física instalada. Nenhum número de série, localização, PN real ou identificador corporativo foi importado.

Cada posição aponta para sete classes de solicitação documental: identificação de modelo/série; manual OEM aplicável; diagrama técnico; BOM/arranjo de peças; critério de teste OEM; evidência de campo com método seguro; e estrutura funcional SAP validada. Portanto, os **245 pedidos** representam sete lacunas *não comprovadas no repositório público* por posição — **não** a constatação de que 245 documentos faltam no acervo privado.

Os dez bloqueios PM×SAP continuam pendentes e `autoRemapAllowed=false`; o runbook privado tem oito gates bloqueados. **Resultado público: NO-GO.**

## Matriz de foco causal e disciplina

| Regra P0 | Sistema | Bloqueio SAP | Hipóteses que precisam ser discriminadas |
| --- | --- | --- | --- |
| `cooling-radiator-blockage` | Arrefecimento / RADI | `damage_cause_not_permitted` | Sujidade externa, restrição interna de circulação, condição de sensor/ventilação |
| `fuel-filter-contamination` | Combustível / HSVV | `component_not_registered` | Elemento filtrante, contaminante no fluido, pertencimento funcional SAP |
| `fuel-tank-water` | Combustível / TVRE | `damage_cause_not_permitted` | Origem da água, integridade do dreno, qualidade da amostragem |
| `hydraulic-hose-abrasion` | Hidráulico / HSVV candidato | `subgroup_not_in_scope` | Desgaste da cobertura, comprometimento do reforço, interferência/roteamento |
| `hydraulic-hose-leak` | Hidráulico / HSVV candidato | `subgroup_not_in_scope` | Parede/terminal, vedação da conexão, aplicabilidade do subgrupo no circuito |

Há **três hipóteses por regra, totalizando quinze**, todas `verified=false`; cada uma tem a evidência potencial que a corroboraria e uma explicação física ou cadastral concorrente.

## Primeiro roteiro de investigação: arrefecimento

**Etapa documental:** localizar OMM e manual de serviço efetivos do conjunto por série, especificação da colmeia, diagrama de arrefecimento, ventilador, bomba, termostato e pontos de medição; depois confrontar peças e árvore SAP RADI. A fonte pública [Caterpillar — cuidados com radiador](https://www.cat.com/pt_BR/support/maintenance/self-service-options/radiator.html) é apenas orientação geral e não autoriza limites de temperatura ou limpeza de equipamento específico.

**Separação causal:** depósitos externos e restrição de ar não provam entupimento interno do radiador; sobretemperatura pode ocorrer por vazão de ventilador, termostato, bomba, carga e sensor. A confirmação dependeria de observação específica sob método OEM, com análise independente de mecanismo, condição física e eventual dano.

**Segurança:** não abrir circuito quente/pressurizado, nem aplicar lavagem de alta pressão ou teste improvisado em aletas.

## Segundo roteiro: combustível, filtro e tanque

Para o filtro, identificar no desenho OEM o circuito de alimentação, cabeçote, elemento, separador de água e bombas; validar peças e o objeto técnico SAP **sem atribuir automaticamente o filtro ao HSVV**. Para o tanque, comprovar circuito do dreno, localização e efetividade da vedação; amostrar tanque e fornecimento com cadeia de custódia, ponto de coleta e método analítico.

**Separação causal:** água e partículas são **condições do fluido**; presença de água não prova falha do filtro ou dreno. Restrição de vazão pode surgir em tubulação, bomba ou controle; coleta e abastecimento também podem contaminar a amostra. Amostrar antes de trocar/drenar, quando apropriado e seguro, segundo procedimento autorizado.

## Terceiro roteiro: mangueiras hidráulicas

Confirmar a efetividade por série do circuito de implementos, desenho de roteamento, suportes, proteção e BOM, e confrontar a árvore de locais funcionais. O código **HSVV em outro sistema não prova sua pertinência em hidráulica**.

**Separação causal:** capa abrasada não demonstra armadura estrutural atingida; óleo na capa não identifica se a fuga veio da parede, terminal ou conexão adjacente. Inspeção e localização de vazamentos somente com procedimento OEM, controle de energia armazenada e equipe habilitada. Nunca procurar fuga pressurizada com as mãos ou reapertar linhas energizadas.

## Fontes e prova de efetividade

As referências catalogadas para esses cinco P0 são literatura geral Cat e estrutura de local funcional SAP. Uma ficha Cat Parts sobre a **função de um separador** não comprova PN aplicável à frota. Uma página de ajuda SAP explica organização de locais funcionais, não prova a montagem física. Cada fonte é mantida com seu `role` e `limitation` originais; todas as flags `serialEffectivityVerified` continuam `false`.

A investigação real deve prosseguir em **ambiente corporativo privado autorizado**, onde engenheiro responsável poderá conferir série, variante, revisão OEM, BOM, evidência física e decisão de segurança. Os sete pedidos no arquivo JSON são apenas uma lista de verificação para esse encaminhamento, nunca autorização para executar inspeções ou alterar SAP.

## Artefatos produzidos

- `data/quality/pm-p0-investigation-readiness-policy.v1.json`: pedidos de documentos, quinze hipóteses e contraprovas, segurança e regras NO-GO.
- `data/quality/pm-p0-investigation-readiness.v1.json`: cinco pacotes P0 e 35 posições de chave de modelo, com 245 pedidos ainda sem prova pública.
- `scripts/lib/pm-p0-investigation.mjs`: reconstrução determinística das lacunas a partir das fontes já catalogadas.
- `scripts/audit-pm-p0-investigation.mjs`: **53 mutações adversariais** para detectar falso ativo real, documento OEM aplicável, medição, aprovação SAP ou liberação operacional.
- `reports/pm-p0-investigation.generated.json`: relatório gerado no GitHub Actions.

Nenhum sistema consumidor foi modificado e não houve adição de dado operacional, OS, PN, série ou leitura de campo.

## Próximo passo que realmente aumenta maturidade

Validar primeiro, em sistema corporativo autorizado, **qual chave de modelo corresponde a um ativo e qual manual OEM é efetivo para a série**. A partir desse confronto, reduzir as 35 posições candidatas para aplicações reais, marcar casos não aplicáveis e solicitar a documentação específica dos P0 selecionados. Não declarar criticidade ou ordem de execução com base na quantidade de lacunas do repositório.
