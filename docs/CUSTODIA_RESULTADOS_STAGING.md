# Custódia e revisão dos resultados de staging — contrato v1.3.27

**Data:** 21/10/2026 · **Natureza:** especificação pública e prova criptográfica **sintética**. Nenhuma infraestrutura corporativa foi acessada, provisionada ou homologada.

## 1. Problema e separação de fronteiras

A v1.3.26 estabeleceu como emitir 32 resultados artificiais `executeProbe`, mas não como vincular **quem gerou a evidência, quem a custodiou, quem a analisou e quem revisou independentemente**, nem como impedir alteração posterior dos resultados. O novo contrato resolve essa questão no nível **de estrutura verificável por código**, não no nível de validação institucional de campo.

O pacote do resultado futuro é **restrito**: mesmo que seu identificador pareça opaco, a referência real deve ficar exclusivamente no backend corporativo. O GitHub público contém a [política](../data/governance/private-result-custody-contract.v1.json), [schema](../schemas/private-staging-result-attestation.schema.json) e código. Não contém recibos reais, assinaturas corporativas, laudos, dados de ativos, URLs internas, limites OEM, imagens nem hashes de arquivos privados.

## 2. Etapas de uma revisão de resultado

| Etapa | Atestador | Conteúdo coberto | Limitação |
|---|---|---|---|
| Recebimento | Serviço de integração | Tenant/caso/run, quatro provas STG, instante e validade do pacote | Assinatura não garante que o teste realmente mediu o controle |
| Custódia | Custodiante | Digest do resultado, licença/condição de uso, integridade e rastreabilidade declaradas | Precisa comprovação e identidade corporativa externa |
| Parecer técnico | Revisor técnico | Digest do resultado e da custódia; revisão de hipóteses concorrentes e pertinência da evidência | Não é confirmação automática de modo de falha |
| Revisão independente | Outro revisor | Digest de resultado/custódia/parecer técnico e decisão vinculada | Deve ser pessoa diferente de autor, técnico e custodiante |
| Encaminhamento | Governança de mudança | Elegibilidade formal para **revisão manual**, nunca autopublicação | Requer outro fluxo para aprovar conteúdo, operação ou SAP |

Os quatro registros são vinculados por digests dos conteúdos anteriores e assinados com Ed25519. O verificador exige uma **lista confiável de chaves e papéis vinda de fora do recibo**, verifica validade/revogação, papel, tempo, correspondência de ator e ordem das revisões. Também exige **quatro resultados de controle conhecidos e únicos**, todos `pass`. Resultados não passantes devem permanecer rejeitados para promoção, sem serem tratados como falha da máquina.

## 3. Segurança e limites da prova criptográfica

No teste, as chaves Ed25519 são **geradas em memória a cada execução** e descartadas; não são chaves da G Mining, Caterpillar ou de qualquer pessoa. A canonização JSON usada é um algoritmo de demonstração com ordenação recursiva de chaves, **não uma implementação certificada de RFC 8785**. O identificador opaco sintético é `TEST-*`.

**Assinatura válida significa apenas que determinado conteúdo corresponde à chave pública usada na verificação.** Para comprovar autoria e autenticidade organizacional, TI precisará de IdP, governança de certificados/chaves, proteção do signer, vinculação do indivíduo/serviço a cada chave, revogação, tempo confiável, registro transacional de *replay* e trilha de auditoria independente.

O mock inclui checagens para chave desconhecida/revogada, assinatura alterada, mudança de tenant/caso, resultado duplicado ou adulterado, prova ausente, período vencido, mesma pessoa assinando papel conflitante, parecer técnico sem análise das alternativas, vínculo de revisão divergente e tentativa de publicação ou liberação. As alegações de licença/efetividade OEM continuam dependendo de revisão humana e de documento restrito real, não de `true` no JSON.

## 4. Compartimentação dos dados

No repositório público, só política, schemas, documentação, código que não conecta serviços e [48 casos TEST](../data/quality/private-result-custody-regressions.v1.json). O mock não grava chaves privadas, não persiste recibos nem acessa redes. Uma implementação corporativa **não deve exportar** os recibos, evidências físicas, metadados reidentificáveis, certificados restritos ou digests de conteúdo OEM para GitHub público.

Um pacote assinado em staging não muda `FC-*`, `ME-*`, não cria nota SAP e não aprova ação corretiva. A decisão de publicação, segurança, direitos/licença e governança da base exige processo específico posterior.

## 5. Testes e critérios para TI

Executar `npm run custody:results:validate` no ambiente de desenvolvimento sem rede. São **8 cenários positivos sintéticos e 40 negativos**, incluindo assinaturas adulteradas, falsas identidades, revogação e ausência de independência do parecer. CI testa apenas lógica e integridade do mock.

Para aceitar o serviço corporativo real futuramente, Segurança deverá demonstrar chave/ator autenticados, assinatura armazenada e verificada por serviço isolado, custódia/auditoria não alterável pelo mesmo administrador, revogação e replay sob concorrência, permissões por tenant/caso, acesso e descarte controlados e revisão humana com autoria comprovada.

Esse aceite permanece **pendente**; nenhuma assinatura sintética pode ser transplantada ao sistema de produção. Somente depois de aprovação e staging real será possível avaliar um caso fictício em infraestrutura real. Dados reais exigem autorização adicional explícita.

## 6. Próximo ciclo

Modelar revisão humana simulada e fila de tratamento de resultados falhos ou inconclusivos, incluindo distinção entre erro de verificador/infraestrutura e falha de controle de segurança. **Não** introduzir evidência operacional sem base, caso real ou conclusão mecânica.
