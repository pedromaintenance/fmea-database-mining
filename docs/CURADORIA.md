# Política de curadoria, qualidade e segurança

## Classificação obrigatória da confiança

- `catalogado`: código e vínculo extraídos de uma fonte identificável; **não significa falha real**.
- `inferido`: regra heurística ou hipótese tecnicamente plausível, ainda sem revisão individual.
- `curado`: engenheiro/técnico revisou plausibilidade, contexto, dano e relação causal.
- `validado`: caso didático revisado com testes/evidências discriminantes consistentes; **não** é uma ocorrência real comprovada.
- `empirico`: dados observacionais de equipamento real, devidamente autorizados, com evidência rastreável e tratamento de privacidade.

## Critérios mínimos para aprovar um caso

1. Modelo e local de instalação existentes e coerentes com o arranjo do equipamento.
2. Componente pertencente ao subgrupo/tipo de objeto e mecanicamente plausível naquele ponto.
3. Dano descritivo e observável, não expressão genérica de causa.
4. Causa apresentada como hipótese até ser discriminada por evidência.
5. Relato do operador plausível, sem revelar o gabarito.
6. Ao menos **duas hipóteses concorrentes** coerentes com os primeiros sintomas.
7. Ao menos **um teste ou inspeção discriminante** que diferencie os concorrentes, com resultado.
8. Limites, condições de segurança e indicação de uso de documentação OEM para execução real.
9. Consequência operacional e gravidade sem inventar dados reais.
10. Autoria/revisão e origem da informação documentadas.

## Conservação de evidências

Registrar `resultado: sustenta | refuta | inconclusiva`, `hipoteseId`, contexto, data/período **somente para dados reais autorizados**, e nível de confiança. Um indicador isolado nunca conclui automaticamente a causa raiz.

## Política para repositório público

Não incluir planilhas de empresa, dados de SAP de patrimônio real, números de série, dados pessoais, fotografias internas, laudos identificáveis, manuais OEM completos ou trechos extensos protegidos sem autorização. Não copiar integralmente as páginas CAT 6030. Derivados de fontes corporativas precisam de revisão de divulgação e licença aplicável. Não tratar a licença de código como permissão automática para republicação de conteúdo técnico de terceiros.

## Procedimento de alteração

Toda modificação nos dados deve atualizar `CHANGELOG.md`, preservar IDs estáveis, declarar origem da alteração, documentar quantidade e realizar validação automatizada. Mudanças incompatíveis exigem bump de versão principal e adaptador para o jogo.
