# FMEA Database Mining — Ciclo v1.3.45: abrasão da mangueira hidráulica ≠ vazamento

**Ciclo editorial: 21/10/2026.** Modelagem conceitual de `hydraulic-hose-abrasion`, sem observações reais, sem execução de trabalho e sem alteração do cadastro SAP.

## Objetivo e função do componente

Uma mangueira hidráulica transmite fluido pressurizado com flexibilidade controlada entre pontos do circuito. Sua construção pode incluir **tubo interno**, **reforço estrutural**, **cobertura externa** e **terminais**. O revestimento protege contra ambiente e atrito, enquanto reforço e tubo contribuem para suportar pressão e estancar fluido. **Desgaste superficial não é sinônimo de vazamento**, e **ausência de vazamento não garante segurança de um reforço exposto**.

A regra PM `hydraulic-hose-leak` já está ligada ao bundle `BUNDLE-06` e trabalha com indícios de fuga, cobertura e pressão; sua hipótese `DMG-HYD-HOSE-INTEGRITY` não está confirmada. A regra `hydraulic-hose-abrasion`, até então sem bundle próprio, foi modelada no novo `BUNDLE-12`. **Ambas estão bloqueadas por `subgroup_not_in_scope`**: o subgrupo HSVV presente em outras áreas não foi homologado para HYSY/IMAT no recorte aplicável. Reutilizar objetos de arrefecimento, direção ou freios seria erro de estrutura cadastral.

## Quatro condições separadas

| Condição hipotética | Interpretação técnica | Tratativa segura proposta |
| --- | --- | --- |
| `COND-HYD-HOSE-ABRASION-SURFACE` | Marcas de atrito na cobertura externa. A intensidade, o local e eventual exposição do reforço ainda precisam ser verificados | Inspeção segura e avaliação pelo critério OEM; não inferir perda de estanqueidade só pela marca |
| `COND-HYD-HOSE-REINFORCEMENT-EXPOSED` | Possível exposição visual de armadura/reforço | **Se confirmada, retirar de serviço de modo seguro e avaliar substituição segundo OEM, mesmo sem fuga visível** |
| `COND-HYD-HOSE-ROUTING-CONTACT` | Contato com estrutura, abraçadeira, proteção ou outra linha; mecanismo potencial de abrasão | Analisar movimento, fixação, raio de curvatura e posição efetiva; corrigir causa do contato pelo procedimento aplicável |
| `COND-HYD-HOSE-DEFORMATION` | Torção, dobra excessiva ou achatamento suspeitos | Avaliar gravidade, isolar se crítico e aplicar critérios OEM para retirada/substituição |

Essas **condições são conceitos a observar, não achados reais**. A linha física, o material e a criticidade dependem da aplicação. Uma cobertura marcada pode exigir intervenção por critério do fabricante ainda que não exista prova de falha estrutural interna; não se deve usar a modelagem como justificativa automática de continuidade operacional.

## Condição, mecanismo, dano e evidência

- **Condição/sintoma:** marca superficial de atrito, mal roteamento, possível armadura exposta, deformação ou fuga.
- **Mecanismo contribuinte:** atrito/contato, torção, raio incompatível, fixação inadequada, envelhecimento, pulso de pressão ou abrasivos. **Nenhum está confirmado por esta base**.
- **Dano diferencial candidato:** `DMG-HYD-HOSE-REINFORCEMENT-CANDIDATE`, suspeita de comprometimento do reforço. Depende da avaliação física independente e permanece `confirmed:false` e `not_approved`.
- **Falha funcional separada:** perda de estanqueidade ou falha do conjunto sob pressão, que demanda localização do vazamento/inspeção da mangueira e terminais; a marca superficial não prova fuga.
- **Causa raiz:** requer identificação efetiva da linha, compatibilidade de componente, montagem, histórico de contato e revisão de Engenharia. Não atribuir automaticamente a erro de instalador nem a abrasão quando existirem alternativas.

A distinção é essencial: **uma condição visual crítica pode justificar retirada de serviço antes da confirmação do mecanismo causal específico**. Essa decisão não corresponde à aprovação automática de código de dano/causa SAP.

## Ações propostas, não executadas

- `ACT-HYD-HOSE-ABRASION-CLASSIFY`: inspecionar cobertura, reforço e roteamento sob condições seguras, sem manipular mangueira pressurizada.
- `ACT-HYD-HOSE-ASSEMBLY-REPLACE-EVALUATE`: avaliar retirada de serviço e substituição do conjunto quando a condição for crítica, em procedimento e peça aprovados pelo OEM. A ação tem estado **not_performed** e não abre nota/ordem.

**Segurança essencial:** mangueiras podem reter pressão após parada. Proibir procura de microvazamentos com mãos/corpo, desmontagem sem alívio certificado de energia, pressurização experimental não autorizada e remendo improvisado em linha crítica. Bloquear, baixar implementos, controlar energia armazenada e seguir OMM aplicável. Suspeita de lesão por injeção hidráulica demanda atendimento médico imediato.

## Referências de fabricantes

- [Caterpillar — How to Maintain Cat Hydraulic Hose Assemblies](https://www.cat.com/en_US/blog/inspect-cat-hydraulic-hose-assemblies.html): inspeção de abrasão, fissuras, bolhas, torção, vazamentos; atenção a roteamento, raio de curvatura, proteção e instruções OMM.
- [Caterpillar — Get Ahead of Hydraulic Hose and Couplings Failure](https://www.cat.com/en_US/blog/hydraulic-hoses-maintenance.html): recomendações de inspeção, substituição de conjuntos danificados, controle de contaminação e riscos de fluido sob alta pressão.

Essas referências tratam **princípios gerais**. Não provam instalação de uma mangueira, código de material, ponto de teste, pressão nominal, critério de desgaste ou intervalo de substituição na frota da mina.

## Modificações e validação

| Indicador | v1.3.44 | v1.3.45 |
| --- | ---: | ---: |
| Regras PM totais | 25 | 25 |
| Regras com bundle semântico | 11 | **12** |
| Regras ainda sem bundle | 14 | **13** |
| Condições | 24 | **28** |
| Ações | 23 | **25** |
| Hipóteses de dano | 11 | **12** |
| Bundles | 11 | **12** |
| Relações tipadas | 64 | **71** |
| Cenários semânticos sintéticos | 18 | **20** |
| Vínculos PM candidatos | 115 | **115** |
| Exceções PM bloqueadas | 10 | **10** |

- Ontologia **1.3.10**: quatro novas condições, duas ações propostas, um dano diferencial, um bundle e sete arestas.
- `data/quality/pm-hose-abrasion-discrimination.v1.json` classifica severidade, indica o encaminhamento seguro e deixa explícito que nenhuma das quatro condições, por si, demonstra vazamento.
- `npm run pm:hose:abrasion:audit` confere os bloqueios HSVV, 12 bundles, referências OEM, segurança, separação da regra de vazamento e **24 mutações artificiais rejeitadas**.
- O conceito legível `COND-HYD-HOSE-COVER-DAMAGE` foi corrigido de “Abrasion” para “Abrasão”, preservando ID e situação de hipótese não observada.
- Contrato/conteúdo públicos 1.0.0, preview 1.3.12, 24 FC, 15 mecanismos ME e consumidores externos permanecem preservados.

## Dependências para uso operacional

É necessário obter **BOM e rotas de mangueiras por equipamento/série**, verificar subgrupo correto em HYSY/IMAT, classificar sinais por acessibilidade e risco, definir procedimento OEM específico e obter revisão independente da Engenharia/Dados Mestres. Não fechar bloqueio HSVV por semelhança textual. Nenhuma evidência de campo, aprovação SAP, código de peça ou ordem foi criada neste ciclo.
