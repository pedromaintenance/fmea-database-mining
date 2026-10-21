# Solicitação técnica de documentação e efetividade OEM — material rodante D9

**Status:** PRONTA PARA ENCAMINHAMENTO — NÃO ENVIADA

**Piloto:** `OEM-PILOT-D9-UNDERCARRIAGE` · **Escopo:** sapatas, elos, fixadores, roletes, roda-guia e tensionamento de esteira Caterpillar D9. **Tratamento:** comunicação interna, documentação OEM sob licença, evidências e dados mestres exclusivamente em meios corporativos autorizados.

## Texto pronto para encaminhamento interno

**Assunto:** Solicitação de documentação OEM efetiva — piloto de inspeção e CTS do material rodante D9

Prezados,

Para estruturar o piloto de inspeção do material rodante da família Caterpillar D9, solicito apoio das áreas de Engenharia de Ativos, Engenharia Mecânica, Inspeção, Materiais/Cadastro e Dados Mestres SAP na disponibilização **controlada** e validação dos documentos e informações abaixo.

O objetivo é determinar a efetividade dos métodos e componentes **da configuração realmente instalada**, evitando adotar tolerâncias, códigos de peças ou procedimentos de outras variantes. A identificação exata da máquina e do arranjo deve ser feita por canal autorizado **antes** de selecionar manuais e limites específicos.

**1. Engenharia de Ativos — identificação (REQ-D9-01).** Confirmar prefixo e número de série completos ou arranjo tecnicamente homologado. Conferir placa física e cadastro OEM/SAP. A identificação específica deve permanecer em repositório privado.

**2. Engenharia Mecânica/OEM — OMM (REQ-D9-02).** Disponibilizar, por acesso autorizado ao SIS ou repositório licenciado, referência da mídia, revisão/edição, faixa de séries e aplicabilidade do *Operation and Maintenance Manual* efetivo. Não encaminhar cópia integral ao GitHub público.

**3. Materiais/Cadastro — composição e arranjos (REQ-D9-03).** Conferir BOM/desenhos OEM e relação de componentes instalados: sapatas, elos, parafusos, porcas, roletes, roda-guia e sistema de tensionamento. Identificar modificações documentadas e não presumir intercambiabilidade nem PN.

**4. Engenharia Mecânica — junta sapata–elo (REQ-D9-04).** Localizar procedimento oficial aplicável à junta e aos fixadores, incluindo especificação do conjunto, condição de reaproveitamento/substituição, preparação e sequência de fixação. **Nenhum torque, ângulo ou procedimento será aprovado antes de verificação por série/arranjo e revisão independente.**

**5. Inspeção Preditiva — CTS (REQ-D9-05).** Localizar procedimento Caterpillar *Custom Track Service* aplicável à variante instalada, com instrumento, pontos/posição de medição, condições do teste, referência de desgaste e critérios para interpretação. Calibração, tolerâncias e limites devem estar associados ao documento/revisão efetivos.

**6. Dados Mestres SAP — rastreabilidade (REQ-D9-06).** Confrontar equipamento, objeto SAP, local funcional, lista técnica e modificações com a configuração OEM confirmada. Este pedido não autoriza criar ou alterar automaticamente PN, locais funcionais, códigos de falha ou ordens.

**7. Engenharia/Oficina — análise de campo e parecer (REQ-D9-07).** Após confirmação documental e autorização do método seguro, programar inspeção física, registrar condições/medidas conforme procedimento, avaliar hipóteses alternativas e obter revisão técnica independente. Nenhuma vistoria ou medição é considerada realizada até sua execução e registro.

**Retorno solicitado:** por favor, indiquem os responsáveis institucionais pelo atendimento de cada item, o canal corporativo autorizado para os documentos, as referências de mídia/revisão e o status de aplicabilidade. Não é necessário reproduzir documentos licenciados por e-mail ou em repositório público; referências rastreáveis e acesso controlado são preferíveis. Caso algum documento não seja aplicável ou não esteja disponível, peço registrar essa limitação e a alternativa de consulta com a fonte OEM.

Esse pacote será utilizado **somente para planejar a validação técnica** das hipóteses existentes de material rodante; não constitui aprovação de critério CTS, torque, número de peça, diagnóstico de falha ou liberação operacional.

Atenciosamente,

Engenharia de Manutenção

---

## Checagem do solicitante antes do envio

A pessoa responsável pelo envio deverá confirmar destinatário autorizado, canal corporativo, classificação documental e objetivo. Se precisar identificar a máquina, insira prefixo/série **somente na comunicação interna protegida**, nunca neste arquivo público. Não anexar manual SIS, fotos da máquina, relatórios de inspeção, notas SAP ou credenciais no repositório.

## Fluxo de comprovação posterior

O [manifesto JSON](../data/governance/d9-oem-evidence-request.v1.json) relaciona `REQ-D9-01` até `REQ-D9-07` diretamente às sete pendências [originais](../data/quality/oem-d9-evidence-intake.v1.json). A origem registra:

| Situação da fonte | Itens | Quantidade |
|---|---|---:|
| `not_supplied` | Identificação; OMM | 2 |
| `not_verified` | Peças; fixação; CTS; SAP | 4 |
| `not_performed` | Parecer de campo | 1 |

Esses estados não foram modificados. Para atualizar posteriormente, exigir: proveniência e revisão, efetividade por série, comparação independente com configuração instalada, aceite de custódia/licença, qualidade da medição, contraprova e decisão assinada quando aplicável.

**Risco de postergação:** sem configuração e documentação efetivas, comparações CTS podem empregar referências incorretas, fixações podem receber procedimento inadequado e a base FMEA/SAP pode adquirir associações falsas. **Risco de agir prematuramente:** um dado genérico de D9 não pode ser convertido em torque, PN, limite de descarte ou condição operacional válida para a máquina concreta.

**Limite do ciclo:** nenhuma solicitação foi enviada, nenhuma documentação foi obtida e nenhuma intervenção física foi executada.
