# Ciclo v1.3.88 — Pré-solicitações documentais de evidência por disciplina e etapa

**29/10/2026 · FMEA Database Mining · Engenharia de Manutenção/PCM · Uso público conceitual, sem homologação.**

## Objetivo

Preparar **rascunhos de solicitação de evidências**, antes de qualquer discussão formal de engenharia, inspeção ou mudança SAP. O material deriva diretamente do HTML offline da v1.3.87 ([pauta de revisão por disciplina](pauta-revisao-fmea.html)) e não registra interação com pessoas, SAP, OEM ou equipamentos.

## Entrega

Novo arquivo independente: [`docs/pre-solicitacoes-evidencia-fmea.html`](pre-solicitacoes-evidencia-fmea.html). Abra localmente no navegador para consultar, filtrar e exportar solicitações em Markdown, sem rede ou armazenamento externo.

O arquivo reúne **125 pré-solicitações**: 25 regras × 5 etapas S1–S5. Permite combinar filtros por disciplina proposta, sistema, etapa, trilha de revisão e pesquisa textual. Cada ficha apresenta pergunta da pauta, componente candidato, fonte catalogada, situação documental e — quando fornecidos na fonte — cadeia, contraprova proposta ou evidência mínima da exceção PM×SAP.

| Etapa da fonte | Conteúdo da pré-solicitação | Ressalva |
| --- | --- | --- |
| **S1 — Configuração OEM** | Pergunta de configuração, série/arranjo e método; IDs de fontes já catalogadas | IDs de referência não constituem efetividade por série nem autorização de uso do manual |
| **S2 — Função e mecanismos** | Cadeias `FC-...` explicitamente vinculadas ou ausência de vínculo | Ausência de cadeia não significa mecanismo fisicamente inexistente |
| **S3 — Contraprovas e segurança** | Alternativas e discriminação propostas, se existirem na trilha | Dez exceções não recebem artificialmente as duas alternativas das 15 regras não priorizadas |
| **S4 — Enquadramento SAP** | Status de enquadramento, impedimento documentado e evidências mínimas se fornecidas | As dez exceções seguem bloqueadas; quinze regras não têm mapeamento aprovado, sem exceção formal registrada |
| **S5 — Revisão independente** | Pergunta original sobre parecer e aprovação corporativa pendente | Nenhuma assinatura ou decisão de engenharia é atribuída |

O sistema **não gera critérios de aceitação, valores-limite, instruções de ensaio ou novos documentos OEM**. Quando não há evidência individualizada de uma etapa na origem, a ficha informa explicitamente essa lacuna. O status de todas as solicitações é **`DRAFT_NOT_SENT`**, sem responsável, envio, evidência recebida, ensaio realizado, aprovação ou liberação.

## Interface e formatos

- Exportação do recorte filtrado em Markdown, para preparação da discussão ou posterior trabalho em ambiente corporativo autorizado.
- Exportação individual de qualquer pré-solicitação S1–S5, com identificador estável `<regra>::<etapa>`.
- Interface responsiva em computador/celular; arquivos HTML e Markdown não dependem de CDN, serviços web ou APIs.
- O campo P0/P1 é **posição da fila documental de curadoria**, nunca risco operacional nem critério de urgência.
- Quatro disciplinas são **propostas de encaminhamento**, não designações formais de colaboradores.

## Reprodutibilidade

A fonte versionada é o JSON `agenda-data` incorporado em `docs/pauta-revisao-fmea.html`. A biblioteca `scripts/lib/pm-evidence-request-packets.mjs` deriva os 125 registros e verifica integridade, incluindo os status `NO_GO`. O auditor `scripts/audit-pm-evidence-request-packets.mjs` compara o JSON embutido no novo HTML com a derivação determinística, valida o JavaScript, os filtros e os arquivos Markdown; também aplica alterações adversariais que tentam apresentar solicitações como enviadas, evidência recebida, teste executado, urgência, mapeamento SAP ou aprovação.

Execute **`npm run pm:evidence:requests:audit`**. O relatório de CI é gravado em `reports/pm-evidence-requests.generated.json`.

## Fronteira de segurança

Esta entrega **não faz pedidos reais**, não coleta nem recebe evidências, não consulta sistemas corporativos, não altera fornecedores, não agenda intervenção e não atribui status de causa confirmada. Os dez bloqueios PM×SAP e oito gates privados continuam `BLOCK / NO_GO`.

A pré-solicitação pode apoiar o trabalho documental de Engenharia e PCM; a autorização, custódia e verificação dos dados técnicos têm de ocorrer fora deste banco público, com as autoridades e procedimentos aplicáveis.
