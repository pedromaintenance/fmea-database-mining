# FMEA Database Mining — Ciclo v1.3.37: proveniência e funções em VPAR

**21/10/2026 — Auditoria estrutural de AISY → COMR → VPAR (EQ05, EQ06).** Nenhuma aplicação OEM por série, inspeção física ou homologação SAP foi realizada.

## Problema

A auditoria 1.3.36 apresentou quatro ocorrências textuais de filtro/separador e duas ocorrências compatíveis com o par 03.02/C2.09. Uma ocorrência por localização pode repetir um mesmo código de componente compartilhado por tipo de objeto. Não se deve anunciar quatro componentes distintos nem duas peças efetivamente montadas.

## Resultado verificado no CI

| Métrica | Resultado | Leitura |
| --- | ---: | --- |
| Caminhos AISY/COMR/VPAR | 2 | EQ05 e EQ06 |
| Tipos de objeto SAP nesses caminhos | 1 | Compartilhado entre os dois |
| Ocorrências de descrição filtrante nesses caminhos | 4 | Dois códigos repetidos em dois caminhos |
| Códigos distintos no tipo de objeto | 2 | Não são quatro códigos distintos |
| Códigos distintos com 03.02/C2.09 elegível | 1 | Aparece em dois caminhos |
| Caminhos externos a VPAR com o mesmo tipo de objeto | 0 | Sem reutilização transversal detectada no catálogo examinado |
| Peças instaladas, BOM efetivas e falhas confirmadas | 0 | Dados não fornecidos |

A execução de npm run pm:vpar:audit produz reports/pm-vpar-provenance.generated.json. O código verifica separadamente duplicação de descrição por caminho, unicidade dentro do tipo de objeto, caminhos fora de VPAR e elegibilidade do dano/causa.

A leitura semântica das descrições encontrou uma pista de **separação de água** e outra com **múltiplos indícios textuais simultâneos**. Nenhum nome permite sozinho inferir o circuito físico.

## Diferenças mecânicas obrigatórias

O contexto de manutenção pública da família Sandvik DR410i admite classes distintas que não podem ser confundidas: filtro de admissão de ar, filtro de óleo do compressor, separação ar/óleo e eventual elemento associado a reservatório de ar. As famílias e duas fontes OEM por motorização CAT C18 e Cummins estão registradas em data/research/pm-vpar-function-differentials.v1.json.

**Limite das fontes:** planos públicos de manutenção são orientação geral de determinadas variantes, não BOM efetiva do ativo. A existência de filtro em um plano não comprova que esteja no vaso VPAR, nem autoriza transplantar modelos e séries. Não publicar PN, torque, periodicidade nem manual protegido.

## Segurança lógica

1. Código do componente presente no tipo de objeto ≠ componente confirmado na montagem física.
2. Código de dano e causa elegível no catálogo ≠ modo de falha comprovado.
3. Nenhuma reutilização fora de VPAR detectada na base ≠ garantia de cadastro completo ou homologado.
4. COMR é grupo; VPAR é subgrupo candidato que NÃO substitui automaticamente a regra.
5. Descrição com múltiplas pistas ≠ classificação funcional conclusiva.

Testes: seis verificações de hierarquia, sete descritores sintéticos e nove mutações adversariais de falsa homologação. Todos precisam ser rejeitados ou classificados corretamente antes de exportar.

## Próximo passo de engenharia

Conferir em My Sandvik, BOM e árvore SAP privada o arranjo efetivo de cada perfuratriz, o P&ID do vaso e do compressor, a função dos dois componentes catalogados e a aplicabilidade do par 03.02/C2.09. Fazer revisão humana independente antes de eventual correção de regra. Não arquivar informações sensíveis no GitHub público.

**Compatibilidade:** dez exceções PM/SAP continuam bloqueadas; 115 vínculos candidatos; 24 FC/15 ME; contrato e conteúdo públicos 1.0.0, preview legado 1.3.12 e consumidores preservados.
