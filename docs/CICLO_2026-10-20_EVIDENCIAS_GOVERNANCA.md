# Ciclo de pesquisa e governança v1.3.8 — Evidências e revisão independente

**Data:** 20/10/2026  
**Escopo:** apenas FMEA Database Mining  
**Natureza:** critérios editoriais autorais inspirados por normas e fontes OEM públicas; **não** um procedimento OEM completo nem requisito normativo transcrito.

## 1. Problema resolvido

A versão v1.3.7 já continha **24 cadeias causais**, **48 investigações planejadas**, sintomas, hipóteses concorrentes, possíveis efeitos locais/sistêmicos e 10 lacunas SAP documentadas. Faltava uma camada que respondesse:

- Quais dados uma inspeção/medição deve registrar para ser interpretável?
- Como diferenciar teste favorável, desfavorável e inconclusivo sem alegar que foi executado?
- Quando uma hipótese inferida pode avançar para revisão por especialista, aplicabilidade OEM e evidência validada?
- Como impedir que preenchimento sintático, teste didático ou um código de dano SAP promovam automaticamente a conclusão causal?

A v1.3.8 estrutura essas regras **sem registrar nenhuma medição real, valor de tolerância, severidade, probabilidade ou homologação por série**.

## 2. Pesquisa e interpretação técnica

- **[ISO 13379-1:2025](https://www.iso.org/standard/88027.html):** resumo oficial sobre conceitos, características e seleção de abordagens para diagnóstico por parâmetros operacionais medidos/observados. **Não foi consultado o texto integral**; o modelo de campos abaixo é uma proposta editorial nossa, não uma reprodução ou alegação de conformidade.
- **[ISO 17359:2018](https://www.iso.org/standard/71194.html):** página oficial sobre procedimentos gerais para estabelecer um programa de monitoramento de condição, aplicável a máquinas. Norma completa não consultada.
- **[Caterpillar — Como retirar amostra e interpretar resultados](https://www.cat.com/pt_BR/support/maintenance/sos-services/take-sample.html):** métodos de coleta, rotulagem, limpeza e compreensão de resultados de fluidos; a implementação requer ponto e procedimento apropriado.
- **[Caterpillar — Technical Analysis Tests](https://www.cat.com/en_US/blog/cat-hydraulics-tests-hydraulic-system-inspection.html):** demonstra testes de deriva/ciclos, parâmetros de temperatura, carga e pressão; o exemplo disponível é de escavadeira 323. **Não transportar seus valores/condições para 395, 6030 ou outras máquinas.**

A lista de fontes do projeto foi ampliada de 43 para **44**, com a página Cat de coleta de amostras.

## 3. Requisitos de evidência para 48 investigações

[Arquivo de requisitos](../data/quality/evidence-requirements.v1.json) — 24 cadeias × 2 testes existentes, com IDs `ER-FC-...-I1/I2`.

Cada requisito vincula:
- identificação da cadeia e do teste original;
- método de medição/inspeção conforme vocabulário `EV-01` a `EV-16`;
- metadados mínimos a registrar caso o teste venha a ser executado;
- interpretação **`supports`**, **`weakens`** e **`inconclusive`** preservada da hipótese de origem;
- referência/baseline, incerteza, verificação de instrumento, qualidade amostral e segurança;
- literatura com `sourceId` rastreável;
- `threshold` e `applicability` integralmente **nulos**, até obtenção de OMM específico.

**67 campos possíveis de metadados**, com descrições técnicas em português. Não significa 67 campos obrigatórios por inspeção: cada técnica exige um subconjunto apropriado. Por exemplo:

| Técnica | Registros importantes | Quando não concluir |
| --- | --- | --- |
| Análise de óleo | Compartimento, ponto, produto, horas do óleo, coleta, laboratório, tendência | Coleta imprecisa, produto trocado ou baseline ausente |
| Pressão hidráulica | Ponto, carga, temperatura, instrumento, calibração, critério OEM | Condição ou pressão de referência desconhecida |
| Temperatura de rolete | Ponto, carga, ambiente, emissividade/comparação | Superfícies/tempos não comparáveis |
| Inspeção de mangueira | Origem de fluido, posicionamento, isolamento, fotos, área examinada | Óleo escorreu de outro ponto ou trecho inacessível |
| Fixadores | Tipo e posição, geometria/folga, método de inspeção, montagem anterior | Torque residual apresentado como medida de pré-carga inicial |

Os **seis testes P0** são exemplos prioritários de curadoria: abrasão de mangueira, óleo no comando final, sujeira no radiador, termometria do rolete, fixação da sapata e circulação pela bomba d'água. São prioritários para *revisão*, não casos homologados.

## 4. Fluxo de curadoria técnica

[Registro de revisão por cadeia](../data/governance/technical-review-register.v1.json) contém **24 entradas pendentes**.

| Etapa | Resultado que pode registrar | Condição necessária antes de avançar |
| --- | --- | --- |
| `inferido_com_literatura_geral` | Hipótese plausível | Fontes, mecanismo e contraprovas claros |
| `revisado_por_especialista` | Coerência mecânica revisada | Parecer explícito, responsável técnico e revisor independente |
| `aplicabilidade_oem_confirmada` | Arquitetura e método aplicáveis à configuração | Manual/edição, série/arranjo, componente e local identificados |
| `validado_com_evidencias` | Hipóteses confrontadas com evidência rastreável | Método, instrumento, contexto, alternativas e origem da evidência registrados |

**Regra central:** nenhum script promove estado técnico automaticamente. Dois revisores distintos do **autor** são exigidos na verificação de elegibilidade para revisão independente. Elegibilidade de checklist não equivale a aprovação: a decisão continua humana. Caso didático revisado e ocorrência empírica real são naturezas diferentes.

Os campos de revisão, modelo, série, documento efetivo, evidência verificada, autorização de publicação e evento real permanecem vazios/não avaliados.

## 5. Validação e regressões

- [Validador](../scripts/validate-evidence-governance.mjs) exige **48/48** relações com testes preexistentes, IDs e fontes íntegras, campos definidos, três interpretações, nenhum limite numérico presumido e **24/24** pareceres pendentes.
- [Oito cenários sintéticos](../data/quality/evidence-gate-regressions.v1.json) impedem aprovação por dados de amostra incompletos, pressão sem carga/temperatura, ausência de baseline, revisor repetido ou decisão pendente.
- Há ainda um exemplo sintético de **elegibilidade formal** para a etapa de revisão, deliberadamente sem alterar qualquer status real. Também há exemplo de registro de evidência tecnicamente avaliável, que **não** confirma falha sozinho.
- [JSON Schema](../schemas/evidence-requirements.schema.json) padroniza campos e estados da camada pública.
- `npm run evidence:validate` executa a nova validação no GitHub Actions.

O relatório de qualidade foi ampliado com contagens de metadados e revisões, sempre separando cobertura documental de validação por campo.

## 6. Resultados e limitações

**Ganhos realizados:** 48 requisitos de evidência documentados, 67 descritores de contexto disponíveis, 24 filas de revisão técnica, oito regressões de governança e fonte Cat de amostragem catalogada.

**Ainda não realizados:** teste OEM efetivo, tolerância, julgamento por especialista, aceitação de revisão, vínculo SAP homologado, caso de falha real, criticidade/RPN e evidência operacional. Os dez bloqueios do catálogo PM continuam com seus pareceres.

Nenhuma referência externa autorizou inferir causa raiz, código de peça, gravidade ou periodicidade numérica.

## 7. Próximo ciclo sugerido — v1.3.9

1. Submeter **seis P0** a revisão mecânica crítica, mantendo o status pendente até existir parecer real de um profissional.
2. Criar matriz de **força discriminante** dos testes: o que cada método pode e não pode distinguir.
3. Separar descrição de fenômeno físico de código SAP tautológico (`Afrouxado` versus `Folga ou afrouxamento`).
4. Fazer auditoria por série/arranjo de **uma família piloto**, com documentação OEM obtida legitimamente.
5. Validar de forma cruzada efeitos locais e sistêmicos com critérios de segurança e mantenabilidade, sem transformar hipóteses em resultados observados.

**Limite permanente:** o banco publica conhecimento e contratos de dados; não edita consumidores e não republica documentos proprietários íntegros.
