# FMEA Database Mining — Ciclo v1.3.24: blueprint de infraestrutura restrita

**Data editorial:** 21/10/2026. **Resultado:** arquitetura técnica de referência versionada, regras demonstrativas e cobertura de cenários sintéticos.

O [protocolo v1.3.23](PROCEDIMENTO_EVIDENCIAS_RESTRITAS.md) dizia quais evidências coletar e quem deveria revisar, mas **não implementava controles corporativos**. A v1.3.24 projeta sete componentes e materializa, **apenas para teste**, funções puras que demonstram controle de acesso, cadeia de hash e retenção.

## Entregas técnicas

- [Blueprint JSON](../data/governance/restricted-infrastructure-design.v1.json): sete componentes, oito papéis, onze operações, negação por padrão e proibição de exportação pública automática.
- [Biblioteca de gates](../scripts/lib/restricted-infrastructure-gates.mjs): `evaluateAccess`, `makeDemoEvent`, `verifyDemoChain` e `assessDisposal`. Não se conecta a autenticação, armazenamento, SIEM, arquivo OEM ou exclusão real.
- [Validador](../scripts/validate-restricted-infrastructure.mjs), [fixtures](../data/quality/restricted-infrastructure-regressions.v1.json) e [schema](../schemas/restricted-infrastructure-design.schema.json).
- [Plano de implantação, ameaças e aceite](ARQUITETURA_RESTRITA_IMPLANTACAO.md).

**Suíte sintética:** 20 decisões RBAC (sete permitidas, treze negadas), dez cenários de cadeia de auditoria (um permitido, nove rejeitados) e doze avaliações de retenção (uma potencialmente elegível, onze inelegíveis). **Total: 42 testes, nove decisões de referência permitidas e 33 rejeições esperadas.** Resultados positivos simulados não representam permissões corporativas reais.

## Cuidados de engenharia

Um hash de eventos não significa imutabilidade: se logs e âncora forem controlados pelo mesmo agente, eles podem ser recalculados. A especificação exige WORM/append-only, controles independentes de chaves/âncora, relógio confiável e auditoria de acesso antes de operação real.

Não se estabeleceu período de retenção. `legal hold`, titulares, cópias e programa de sanitização exigem política aprovada da empresa. `assessDisposal` retorna somente **elegibilidade para avaliação manual** e sempre indica `deleted=false`.

A plataforma ainda não existe: **zero componentes provisionados, zero documentos reais, zero evidências recebidas, zero revisões independentes reais, zero causa raiz homologada**. A publicação pública contém apenas políticas e dados TEST.

## Compatibilidade e próximo ciclo

Mantidos **24 FC**, **15 ME**, três propostas CAND e quatro refinamentos editoriais. Contrato e conteúdo público **1.0.0**, preview legado **1.3.12** e checksum anterior inalterados. Sem alteração de consumidores.

Próximo ciclo: preparar critérios de staging restrito e pacote de homologação de TI para executar os mesmos cenários **contra serviços reais de teste**, sem dados corporativos, precedidos por autorização da TI. Não converter simulação local em afirmação de segurança de produção.
