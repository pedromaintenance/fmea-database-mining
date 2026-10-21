# FMEA Database Mining — Ciclo 1.3.38: matriz de evidências OEM/SAP para VPAR

**Data:** 21/10/2026 · **Escopo:** candidato AISY → COMR → VPAR em EQ05/EQ06, como investigação de duas descrições catalogadas de filtro/separador.

## Avanço material do ciclo

O ciclo 1.3.37 deduplicou quatro ocorrências de texto em dois códigos distintos do mesmo tipo de objeto SAP, observado em dois caminhos (EQ05 e EQ06). Este ciclo liga **cada um desses dois códigos, de modo anonimizado, a quatro hipóteses funcionais concorrentes** e estabelece a documentação objetiva necessária para decidir seu pertencimento. Nenhum cenário corresponde a um diagnóstico de campo, PN confirmado, BOM verificada ou autorização de remapeamento.

O [auditor](../scripts/audit-pm-vpar-evidence.mjs) gera a [matriz estruturada](../scripts/lib/pm-vpar-evidence-matrix.mjs) e o relatório de build `reports/pm-vpar-evidence-matrix.generated.json`. A fonte de requisitos é `data/quality/pm-vpar-evidence-plan.v1.json`, confrontada com o catálogo e os [quatro circuitos diferenciais](../data/research/pm-vpar-function-differentials.v1.json).

## Resultado reproduzido pelo CI

| Indicador | Resultado |
| --- | ---: |
| Tipos de objeto envolvidos | 1 |
| Caminhos de nível 3 | 2 |
| Códigos distintos com descrição de filtro/separador | 2 |
| Códigos que permitem 03.02/C2.09 no catálogo | 1 |
| Circuitos alternativos sob avaliação | 4 |
| Cenários componentes × circuitos | 8 |
| Gates documentais ainda sem evidência | 56 |
| Evidências reais recebidas, inspeções, mapeamentos aprovados e falhas confirmadas | 0 |
| Mutações adversariais de relatório e plano rejeitadas | 19 |

Os **56 gates** são perguntas de revisão repetidas por cenário, **não** representam 56 OS, 56 riscos observados nem 56 documentos independentes que necessariamente precisam ser produzidos. Em vários cenários, uma mesma documentação efetiva pode sustentar a exclusão ou confirmação de hipóteses, após curadoria independente.

| Código editorial efêmero | Pista de descrição | Elegibilidade catalogada do par 03.02/C2.09 | Status |
| --- | --- | --- | --- |
| `VPAR-T01-C01` | Múltiplas pistas textuais, sem função única | Sim | Bloqueado, função e montagem não verificadas |
| `VPAR-T01-C02` | Texto associado a separação de água | Não | Bloqueado; não atribuir par dano/causa da regra |

Os códigos C01 e C02 são **ordinais gerados pela ordenação do catálogo desta versão**. Não são códigos SAP, números de material ou identificadores persistentes entre revisões de catálogo. Se a ordenação/fonte mudar, refazer a conciliação no ambiente privado, não supor equivalência.

## Quatro circuitos que precisam ser diferenciados

| Hipótese de circuito | Evidência discriminante necessária | Contraprova / explicação alternativa |
| --- | --- | --- |
| Admissão de ar do compressor | Desenho OEM do sistema de admissão e a vinculação ao elemento efetivo | Restrição no duto, pré-limpador ou contaminação externa sem avaria do componente |
| Filtragem de óleo do compressor | Fluxograma real de lubrificação, fluxo de óleo e posição do elemento | Pressão anormal por bomba, válvula, viscosidade ou leitura de sensor |
| Separação ar–óleo | Esquema do separador, retorno de óleo e recipiente integrado | Arraste de óleo devido a nível, retorno ou condição operacional |
| Filtragem/separação ligada ao reservatório | BOM do vaso, diagrama pneumático, componente presente e pontos de drenagem | Água por condensação/umidade sem defeito de filtro nem do dreno |

São **hipóteses físicas concorrentes**, não quatro funções atribuídas a cada peça. A [documentação pública Sandvik por variante](../data/research/pm-vpar-function-differentials.v1.json) sustenta a necessidade de distinguir famílias/arranjos, mas não confirma a efetividade de qualquer item para os ativos da mina.

## Sete critérios para encerramento técnico (ainda não atendidos)

1. **Configuração efetiva:** identificar em sistema corporativo privado o arranjo físico e a revisão OEM realmente aplicáveis ao equipamento.
2. **BOM OEM:** demonstrar em lista técnica efetiva se o componente está instalado e a qual conjunto pertence.
3. **Circuito físico:** confirmar em P&ID/diagrama o fluido, a finalidade e a posição no fluxo, distinguindo ar, óleo, mistura ar–óleo ou condensado.
4. **Estrutura SAP:** conciliar grupo COMR, subgrupo VPAR, tipo de objeto e componente no cadastro sem inferir um alias automático.
5. **Discriminação de falha:** somente após confirmação do componente, confrontar 03.02/C2.09 com mecanismo físico, sintoma, causas concorrentes e resultados obtidos sob método OEM aplicável.
6. **Execução segura:** procedimentos autorizados, avaliação de riscos e controle de energias; não abrir vasos nem linhas pressurizadas para obter evidências informalmente.
7. **Revisão independente:** validação documentada pela Engenharia competente antes de alterar a regra PM ou reconhecer uma causa.

O requisito de segurança é **pré-condição de qualquer inspeção física**, não uma permissão dada pelo banco. Registro de evidências com PN, série, imagens, dados operacionais, revisão, responsáveis e autorização deve permanecer em infraestrutura corporativa restrita, não no GitHub.

## Decisão técnica e próximo passo

- **C01:** dar prioridade à identificação de **circuito e BOM** antes de interpretar o par catalogado 03.02/C2.09; a descrição multiclasse torna frágil uma decisão baseada em semântica.
- **C02:** conferir se o item é realmente um dispositivo de separação de água e em qual posição está montado. O par 03.02/C2.09 da regra **não é elegível** para esse código na base atual, portanto não reinterpretar esse par como falha do componente.
- **Regra `drill-compressor-filter`:** permanece bloqueada e ainda declara COMR como subgrupo; não converter automaticamente para VPAR.
- **Issue #7:** manter em aberto até documentação OEM/SAP efetiva e parecer técnico. O handoff D9 da issue #31 não é alterado.

## Compatibilidade

Foram adicionados plano de evidências, gerador determinístico, auditor e controles no QA/CI. **Não foram alterados** regras preventivas, componentes da base, objetos/locais SAP, resultados reais, consumidores ou exportações públicas de conteúdo. Permanecem 25 regras, 115 vínculos candidatos sem homologação, 10 exceções bloqueadas, 24 FC e 15 mecanismos; contrato e conteúdo públicos 1.0.0, preview 1.3.12 e checksum histórico preservados.
