# Ciclo v1.3.73 — Pacote de solicitação de análise corporativa SEC-01

**27/10/2026 · Catálogo 1.3.73 · Estado: NO-GO / Solicitação preparada, não enviada**

## Objetivo da deliberação

Solicitar à Governança corporativa, aos responsáveis por direitos/licenças OEM e à área de Privacidade **uma decisão documentada sobre a possibilidade de estruturar um ambiente restrito** para futuras evidências de FMEA e manutenção preditiva. Não se solicita autorização imediata para coleta de dados reais, consulta pública de documentos licenciados, alteração SAP, criação de OS ou execução de manutenção.

**Fronteira de escopo:** aprovar a proposta de desenho sob condições não significa habilitar o gate `ID-02` e muito menos o piloto operacional `PIL-08`. O runbook exige oito gates privados concluídos em processo real. Todos permanecem **BLOCK**.

## Registro mínimo da pauta corporativa

Três trilhas devem ser avaliadas independentemente por funções corporativas competentes. Os papéis abaixo são **sugestões de função**, não pessoas, aprovações ou convites atribuídos.

| Trilha | Responsável funcional sugerido | Registro privado que precisará existir |
| --- | --- | --- |
| Patrocínio e escopo | Patrocinador e Governança | Patrocínio formal; finalidade e escopo de acesso; proibição explícita de execução ou integração não autorizada |
| Licenciamento OEM | Detentor da licença / Jurídico corporativo | Direitos de consulta, reprodução, retenção, extração e restrições por fabricante e configuração |
| Privacidade e classificação | Privacidade / Controlador de dados | Classificação, permissões de tratamento, análise da necessidade de DPIA e responsabilidade de retenção |

A política `data/governance/pm-sec01-approval-brief-policy.v1.json` desdobra essas três linhas em **nove perguntas com evidência exigida**, sem inventar prazo de retenção, base legal, interpretação contratual ou revisão OEM de uma série real.

## Perguntas para conduzir a reunião

### 1. Patrocínio e escopo

- Qual patrocinador corporativo se responsabilizará pelo projeto e pela autorização formal de seu escopo?
- Quais categorias de ativos/casos, equipes e perfis de acesso poderão ser contemplados em um projeto **restrito**, sujeito a todos os gates posteriores?
- O registro de decisão explicitará que **aprovação de desenho** não autoriza acesso a dados reais, atividades de campo, alterações SAP ou publicação externa?

### 2. Documentação e licença OEM

- Quem é o detentor/responsável pelas licenças dos manuais, esquemas e catálogos pretendidos e pode verificar as condições de uso?
- A licença permite cópia no cofre privado, armazenamento, recuperação, extração estruturada ou obras derivadas? Quais restrições se aplicam por origem e produto?
- Quem validará a **efetividade de cada documento por modelo, arranjo, variante e série**, sem tomar literatura genérica por procedimento aplicável?

### 3. Privacidade e dados

- Quais registros de máquina, medição, operador, fornecedor e credencial são considerados restritos; qual classificação e base autorizada de tratamento se aplicam?
- A área competente determina a necessidade de DPIA ou avaliação equivalente; quem poderá registrar o parecer, sem delegar essa avaliação ao classificador público?
- Qual escopo de menor privilégio, controles de publicação externa e responsabilidade por retenção deverão integrar a arquitetura proposta?

## Condições de aceite e rejeição

**Encaminhável para análise corporativa privada:** identidade do patrocinador; escopo restrito; verificação documental da licença e de seus direitos; avaliação da área competente sobre tratamento de dados e DPIA, com registro de quem decidiu e sob qual autoridade.

**Manter SEC-01 bloqueado:** patrocínio ausente; escopo ambíguo; licença não avaliada ou incompatível; privacidade não avaliada; proposta de colocar evidência OEM ou dado real no GitHub público; divergência não resolvida entre responsáveis.

**Mesmo se os dados sintéticos forem favoráveis:** o sistema devolve `HOLD_PRIVATE_CORPORATE_ATTESTATION`. Não existe assinatura verificada nem atestação empresarial neste repositório. O SEC-01 continua `BLOCK`.

## Como usar o pacote

1. Ler esta pauta como preparação, sem anexar documentos confidenciais ao repositório público.
2. Designar responsáveis internos pela decisão no **ambiente corporativo autorizado**.
3. Conferir a legislação e os contratos efetivamente aplicáveis com responsáveis competentes; não assumir que as referências técnicas públicas equivalem a autorização.
4. Produzir e conservar **privadamente** atas, decisões, direitos de uso e avaliações de privacidade, seguindo a política de TI e as regras de custódia.
5. Somente depois de comprovação e aprovação formal, registrar em processo controlado a eventual autorização para planejar a etapa `ID-02`. A atualização de estado não é realizada por esta ferramenta.

## Proteções automatizadas

Sete cenários sintéticos diferenciam falta de patrocinador, escopo indefinido, licença não revisada, licença incompatível, pendência de privacidade, tentativa de upload público de evidência e situação aparentemente favorável. Nenhum cenário contém dados corporativos, parecer jurídico, licença ou assinatura autêntica.

A auditoria rejeita tentativas de criar aprovação fictícia, incluir parecer privado, ignorar licenciamento, pular gates e liberar SAP ou máquinas. As exceções originais PM×SAP (5 P0 e 5 P1) e a maturidade conceitual 1.3.60 permanecem inalteradas.

## Artefatos

- `data/governance/pm-sec01-approval-brief-policy.v1.json` — escopo, três trilhas, nove checagens, sete simulações e critérios de bloqueio.
- `scripts/lib/pm-sec01-approval-brief.mjs` — compilação determinística a partir do runbook e do relatório de prontidão v1.3.72.
- `scripts/audit-pm-sec01-approval-brief.mjs` — integridade de origem, classificações e ataques adversariais.
- `reports/pm-sec01-approval-brief.generated.json` — relatório de CI, exclusivamente sintético.

Execução: `npm run pm:sec01:approval:audit`.

**Resultado permitido nesta etapa:** pacote pronto para apresentação, **não** apresentação realizada, aprovação corporativa, concessão de licença, homologação de ambiente, efetividade OEM, OS ou liberação de equipamento.
