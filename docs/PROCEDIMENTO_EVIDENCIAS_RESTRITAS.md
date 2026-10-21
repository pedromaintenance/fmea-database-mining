# Procedimento de custódia restrita de evidências FMEA — versão 1.3.23

**Natureza:** especificação de processo. **Não** cria um repositório privado, controles de autenticação, autorizações corporativas, assinatura digital ou verificação OEM. Toda aplicação real depende de sistema restrito provido e homologado pela organização.

## 1. Limite entre dados públicos e restritos

Este repositório GitHub é público. Nele ficam somente política, esquema de metadados abstratos, instruções, simuladores `TEST-*` e estatísticas agregadas sem informações de ativo. **Não inserir**: números de série, placa, hierarquia SAP efetiva, valores de pressão/vazão/CTS, laudos, ordens reais, imagens do campo, dados pessoais, revisores identificáveis, mídia SIS/OMM protegida, links internos de SharePoint, URLs autenticadas, hashes de documentos internos, nomes de arquivos corporativos ou trechos licenciados.

Casos reais e documentos somente em ambiente restrito corporativo, com proprietário dos dados, classificação, criptografia, perfis de acesso, registro de alterações, auditoria, política de backup/retenção e licença de uso. O registro de governança público não permite acesso nem garante que os controles estejam implementados.

**Identificador opaco:** em sistema restrito, utilizar token aleatório sem componente de série, SAP, PN, documento ou nome pessoal. Nunca publicar a relação entre token e identidade de ativo. O `restrictedRef` ilustrativo é um token de cofre, **não** URL, caminho de arquivo ou prova criptográfica de autenticidade.

## 2. Papéis e segregação

| Papel | Responsabilidade mínima | Limitação |
|---|---|---|
| Solicitante (`originator`) | Delimitar hipótese física, ativo e pergunta em sistema restrito | Não autoaprovar diagnóstico |
| Custodiante (`custodian`) | Conferir origem, licença, integridade, controle de acesso e rastreabilidade de cada artefato | Não declara falha de componente |
| Revisor técnico (`technical_reviewer`) | Verificar literatura efetiva, medição, alternativas e conclusão condicionada | Deve ser diferente do solicitante |
| Revisor independente (`independent_reviewer`) | Conferir conclusões e contraprovas com parecer documentado | Deve ser pessoa diferente de solicitante e revisor técnico |
| Responsável por mudança (`change_control_owner`) | Encaminhar eventual pedido a governança formal da base | Prontidão não é autorização de mudança/publicação |

## 3. Estados e gates

1. `draft`: hipótese proposta, sem fatos confirmados.
2. `restricted_intake`: registrar solicitação e apontadores exclusivamente no cofre restrito.
3. `custody_verified`: os cinco grupos de evidência estão registrados e tiveram proveniência, licença, integridade, custódia e qualidade verificadas na plataforma corporativa.
4. `technical_reviewed`: parecer do revisor técnico, revisão das hipóteses concorrentes e aplicabilidade da literatura OEM efetiva.
5. `independent_reviewed`: segundo parecer independente, com fundamento próprio.
6. `ready_for_change_control`: apenas aptidão para abertura de solicitação manual de mudança **ainda pendente**; nenhuma alteração da FMEA principal ou permissão de operação.

Uma falha em etapa exige saneamento ou rejeição no sistema corporativo. A especificação v1.3.23 descreve **somente transições admissíveis** e bloqueios: não implementa protocolo de aprovação/rejeição, notificações, armazenamento, persistência de eventos, reabertura de casos ou gestão de permissões. Essas funcionalidades devem ser acrescentadas no ambiente restrito e testadas por TI/Segurança/Engenharia.

## 4. Pacote mínimo de evidências

| Classe | O que comprova | O que não comprova sozinha |
|---|---|---|
| `oem_effectivity` | Identificação de série/arranjo e documento específico, com revisão e compatibilidade | Existência de falha no equipamento |
| `oem_procedure` | Método autorizado e limites válidos para a configuração | Resultado efetivo do procedimento |
| `field_observation` | Sintoma/condição observado em data e local controlados, em arquivo restrito | Mecanismo ou causa raiz |
| `counterevidence` | Inspeção/teste de explicação alternativa que possa enfraquecer a hipótese | Ausência absoluta de falhas concomitantes |
| `measurement_quality` | Rastreabilidade de instrumento, procedimento, carga, temperatura e coleta | Aplicabilidade OEM ou interpretação causal |

Na plataforma corporativa, documentar data/hora, origem, versão, custodiante, integridade, eventos de transferência e alterações. **O validador público só confere campos e declarações sintéticas; não acessa artefatos nem autentica seus metadados.**

## 5. Exemplo do piloto CAT 395 ou comando final CAT 777

Selecione uma proposta `CAND-*`. Em sistema restrito, solicite OMM/SIS e catálogo por arranjo, pontos de ensaio ou morfologia, histórico, contraprova e parecer independente. **CAT 395:** pressão baixa não basta para atribuir fuga volumétrica interna; investigar comando, compensador, sucção, temperatura e arquitetura de retorno/dreno. **CAT 777:** Fe, ruído ou mudança de lubrificante não comprovam dano do dente; localizar flanco, diferenciar rolete/rolamento, abrasão, adesão e fadiga por inspeção adequada.

Caso a origem seja incerta, manter **inconclusivo**. Nunca realizar ensaio fora do procedimento OEM ou sob energia não isolada para concluir uma lacuna editorial. Nenhuma aprovação automática resulta do recebimento de documento.

## 6. Fluxo para eventual publicação

Após `ready_for_change_control`, a organização precisa, **fora deste componente**, de decisão de mudança: exame de integridade e originalidade, aprovação técnica/documental, revisão de direitos autorais e confidencialidade, classificação de causa/evento, edição segura da taxonomia e versionamento compatível do contrato/conteúdo. Somente metadados efetivamente públicos e autorizados podem ser exportados.

**Ausência de casos reais nesta versão:** nenhum revisor, dado de equipamento, evidência autorizada ou causa foi registrado. Os únicos exemplos `TEST-*` demonstram comportamento do validador, não um episódio real. O fluxo não substitui SAP PM, OMM, SIS, inspeção ou procedimento de engenharia.
