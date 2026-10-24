# Pacote de revisão documental P0 — Arrefecimento e filtragem de combustível

**Versão 1.3.62 · Fila P0 preexistente · Somente solicitações de evidência**

Este é um dossiê **para preparar reuniões de engenharia e curadoria SAP**, não uma nota/ordem de manutenção, autorização de teste ou FMEA homologado. As prioridades P0 vêm de `data/quality/pm-gap-review.v1.json`; não correspondem a uma RPN calculada.

## P0-1 · Obstrução do radiador
**Regra:** `cooling-radiator-blockage` · Bundle `BUNDLE-03` · Sistema `arrefecimento` · Subgrupo `RADI` · Componente textual `Trocador`  
**Bloqueio:** `damage_cause_not_permitted` · Par candidato `03.02/C2.09` não autorizado.

**Pergunta causal:** a limitação de transferência térmica é provocada por sujidade externa da colmeia, bloqueio interno do circuito, ventilação insuficiente ou outra causa? A resposta exige evidência diferenciadora e não pode ser deduzida exclusivamente da temperatura elevada.

**Evidências mínimas a solicitar em ambiente restrito:** documentação da colmeia e do circuito por ativo/série; inspeção fotográfica das faces de entrada e saída de ar com condição do conjunto; procedimento OEM de avaliação do fluxo térmico/circulação; registro de estado operacional e das variáveis relevantes. Os requisitos detalhados vêm da matriz de gates existente.

**Diferenciais a enfrentar:** depósito externo de poeira ≠ entupimento interno; bomba, termostato, ventilador, nível ou instrumentos podem reproduzir aquecimento; trinca/vazamento ou perda de fluido exigem investigação distinta.

**Segurança de execução:** não abrir sistema quente/pressurizado, não usar alta pressão de água sobre aletas nem testar circulação com métodos improvisados. Isolamento, limpeza e testes somente conforme manual da série e ART/avaliação de riscos aplicável.

**Decisão SAP:** manter bloqueado `03.02/C2.09`; propor classificação de condição/ação ou combinação diferente **somente** depois de parecer da engenharia e curadoria de códigos.

## P0-2 · Contaminação do filtro de combustível
**Regra:** `fuel-filter-contamination` · Bundle `BUNDLE-02` · Sistema `combustivel` · Subgrupo candidato `HSVV` · Texto `Filtro`  
**Bloqueio:** `component_not_registered` · HSVV documenta mangueiras/válvulas, não o filtro associado automaticamente.

**Pergunta funcional:** qual filtro ou separador de água está efetivamente instalado, onde pertence à árvore funcional da máquina e qual evidência diferencia contaminação do fluido de falha física do filtro?

**Evidências mínimas a solicitar:** diagrama OEM de alimentação e separação com modelo/série; BOM, cabeçote e elementos efetivos; pontos de coleta; estrutura de locais funcionais SAP e cadastro de componente a serem confrontados. Se houver inspeção/amostragem, registrar amostra **antes da intervenção**, com procedimento de coleta e cadeia de custódia, sem transferir valores privados para GitHub.

**Diferenciais a enfrentar:** água/partícula no combustível ≠ filtro rompido; restrição pode originar-se em linha, bomba ou controle; contaminação pode vir de abastecimento, tanque, armazenamento ou amostragem; drenagem é ação, não dano confirmado.

**Segurança de execução:** procedimentos OEM, isolamento de pressão/ignição, prevenção de derramamento, descarte seguro; nenhuma remoção/abertura improvisada.

**Decisão SAP:** manter `component_not_registered` sem associar filtro ao HSVV. Identificar subgrupo adequado apenas mediante revisão de Dados Mestres SAP e revisão independente.

## Próximos três P0 — fila sem dossiê aprofundado
- `fuel-tank-water`: contaminação do fluido ≠ dreno danificado; `damage_cause_not_permitted`.
- `hydraulic-hose-leak`: HSVV não comprovado no circuito hidráulico de implementos; `subgroup_not_in_scope`.
- `hydraulic-hose-abrasion`: marcas de desgaste não identificam fuga, nem homologam HSVV no circuito; `subgroup_not_in_scope`.

A matriz estruturada preserva automaticamente os dois itens de evidência mínima de cada um desses três, sem inventar conclusões ou prioridade adicional.

## Fontes públicas de apoio — não são efetividade por série
- [Caterpillar — inspeção/substituição de radiadores](https://www.cat.com/pt_BR/support/maintenance/self-service-options/radiator.html)
- [Caterpillar — manutenção de filtros e fluidos](https://www.cat.com/en_US/blog/check-filters-fluids-equipment.html)
- [Caterpillar — filtro e separador de combustível](https://parts.cat.com/en/catcorp/product/483-1002)
- [Caterpillar — manutenção de filtro primário combustível](https://www.cat.com/en_US/blog/how-to-replace-a-fuel-filter.html)

**Saída esperada da revisão:** lista de documentação faltante por máquina/série; parecer sobre mecanismo de falha e contraprovas; indicação de curadoria SAP. Não há PN, laudo, medições, fotos de campo, OS ou aprovação real neste pacote.
