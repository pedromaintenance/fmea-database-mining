# Ciclo v1.4.19 — Adjudicação editorial assistida de relações diesel

**10/11/2026 — Sem pareceres humanos ou decisões de manutenção recebidas neste ciclo.**

## Problema
A v1.4.17 coleta respostas anônimas; a v1.4.18 compara duas entradas e aponta divergências. Faltava registrar **propostas de encaminhamento**, priorizando riscos e preservando a distinção entre opinião, interpretação de evidência e homologação técnica.

## Solução
A ferramenta [Adjudicação editorial diesel](adjudicacao-diesel-editorial.html) lê **dois JSONs anônimos válidos**, recalcula a conciliação, organiza a fila pela prioridade de segurança, e permite um editor indicar para cada uma das 18 alternativas: manter pendente, solicitar novas revisões, solicitar evidência OEM, reescrever a interpretação, retirar um vínculo ou manter como hipótese não validada.

O usuário escolhe um motivo técnico de lista fechada e, quando necessário, um ID documental previamente associado à alternativa. **Sem campo de texto livre:** não há nome, dado privado, número de série, leitura de campo, indicação de equipamento ou documento OEM restrito.

### Integridade de proveniência

A ordem dos pareceres é parte do identificador da sessão: inverter A e B resulta em outro hash, mesmo que a comparação causal seja simétrica. Isso protege contra reaplicação acidental de uma proposta a um par distinto, mas **não autentica pessoas, assinaturas, competência profissional ou independência**.
- SHA-256 do dossiê de origem 1.4.16, calculado no build;
- SHA-256 do **par ordenado dos dois pareceres** para vincular uma proposta à dupla exata;
- Importação de proposta bloqueada se qualquer digest, ID, ordem, estado de triagem ou campo de autoridade divergir.

Os arquivos são usados somente no navegador com WebCrypto em contexto seguro (GitHub Pages) e não são enviados à rede. Nenhuma proposta é salva automaticamente.

### Barreiras específicas
- Sem conteúdo nos pareceres: apenas **PENDING**.
- Arquivos de respostas idênticas: apenas pendente ou **solicitar novos revisores**. Dois arquivos não comprovam dois profissionais.
- Qualquer sinalização crítica: não permitir **KEEP_UNVALIDATED**.
- Parecer incompleto: não permitir manter a interpretação por concordância aparente.
- As demais escolhas são **propostas editoriais**, nunca edição do banco, confirmação de causa, FMEA aprovada, OS SAP ou liberação de máquina.

A revisão inicial oculta a classificação original no formulário v1.4.17; na adjudicação ela é revelada **depois da importação dos pareceres**, para confronto crítico. Como o repositório é público, isso não constitui cegamento verificável.

## Entregas
- `data/quality/diesel-bridge-adjudication-policy.v1.json`: regras de decisão, limites e status vazio;
- `scripts/lib/diesel-bridge-adjudication-core.mjs`: funções compartilhadas de geração, validação e síntese do rascunho;
- `docs/adjudicacao-diesel-editorial.html`: página standalone offline, com import/export JSON parcial;
- `scripts/build-diesel-bridge-adjudication.mjs`: gerador do pacote público vazio;
- `scripts/audit-diesel-bridge-adjudication.mjs`: verificação adversarial de segurança, estrutura, hash e integridade do piloto congelado;
- integração ao catálogo, biblioteca, README, QA e Pages.

## Evidência material
- Referências bibliográficas herdadas: **114**; novas: **0**.
- Pareceres reais recebidos: **0**.
- Revisores ou adjudicadores autenticados: **0**.
- Causas confirmadas e aprovações OEM, SAP ou operacionais: **0**.
- Corpus congelado v1.4.11: preservado.

**Próxima ação:** solicitar voluntariamente avaliações reais a profissionais aptos, com autorização da organização e custódia privada. Só então haverá divergências materiais para estudar, produzir recomendações justificadas e eventualmente alterar o texto canônico em nova versão. Até lá não se deve confundir CI com validação técnica de engenharia.
