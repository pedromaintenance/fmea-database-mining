# FMEA Database Mining — Ciclo v1.3.41: roda-guia, rolamento, vedação e CTS

**21/10/2026** · Regra PM bloqueada `track-idler-wear` · Sistema rodante (`UNCR`), subgrupo desejado `IDLE`. **Natureza:** investigação do catálogo e método técnico, sem inspeções ou homologações de campo.

## Pergunta mecânica

Há desgaste externo da roda-guia, falha específica de rolamento/apoio interno, perda de vedação, ou efeitos de alinhamento/tensionamento? O cadastro IDLE oferece componente de rolamento no tipo de objeto esperado? A palavra “Rolamento” registrada em outra família de componentes não deve migrar automaticamente para IDLE.

O conjunto **roda-guia** exerce guiamento da corrente/esteira e contribui para manter geometria e tensão efetivas do conjunto rodante. A **banda/aro externo** pode desgastar ou apresentar ressaltos independentemente de avaria interna. O **apoio interno** pode ser bucha/arranjo diferente conforme variante e série; o nome externo de uma roda-guia não comprova rolamento separadamente cadastrável. **Vedações** devem ser avaliadas em sua posição efetiva; vazamento do rolete não é vazamento da roda-guia.

## Resultado da varredura do catálogo

A execução `npm run pm:idler:audit` reproduz os seguintes números sobre as cinco famílias-modelo referidas pela regra:

| Critério | Resultado |
| --- | ---: |
| Caminhos de nível 3 nos modelos da regra | 221 |
| Caminhos de nível 3 no sistema UNCR | 40 |
| Caminhos no subgrupo IDLE | 8 |
| Caminhos em outros subgrupos UNCR | 32 |
| Ocorrências do termo rolamento em IDLE | **0** |
| Ocorrências de eixo em IDLE | 8 |
| Ocorrências de guia genérica em IDLE | 8 |
| Ocorrências textuais de rolamento em subgrupos UNCR adjacentes | **8** |
| Dessas ocorrências, pares 02.01/C1.04 permitidos no cadastro | 8 |
| Medições CTS, comprovações de rolamento instalado, inspeções executadas ou falhas confirmadas | **0** |

As **oito ocorrências textuais de rolamento fora de IDLE** se distribuem igualmente entre `UNCR/TRF1/ROLL` (4) e `UNCR/TRF2/ROLL` (4), presentes no recorte de modelos EQ02, EQ03, EQ05 e EQ06. Cada ramo contém um código distinto **dentro do seu tipo de objeto**, mas isso não comprova dois PNs distintos globalmente ou um rolamento reparável dentro da roda-guia. **ROLL pertence à estrutura dos roletes** no recorte analisado; não autoriza migrar esse componente para IDLE.

O classificador usa descrições de rolamento, bucha, vedação/retentor, eixo, roda-guia, rolete e guia. Uma descrição de `Eixo/Guia` não satisfaz o requisito `Rolamento`, embora possa indicar posição cadastral que merece revisão. Os números representam associações por caminho/tipo de objeto, não peças fisicamente instaladas.

## Problemas semânticos identificados

No bundle `BUNDLE-09` de `track-idler-wear`, a ontologia inclui:
- `COND-TRACK-IDLER-WEAR`: condição pertinente de desgaste/contato da roda-guia;
- `COND-TRACK-ROLLER-HEAT`: **calor do rolete**, que não equivale à medição de temperatura na roda-guia;
- `ACT-TRACK-IDLER-CTS`: medição pertinente da roda-guia, pendente de procedimento e limite aplicável;
- `ACT-TRACK-ROLLER-SEAL-CHECK`: **inspeção de vedação do rolete**, que não confirma estanqueidade da roda-guia.

O registro `DMG-TRACK-IDLER-WEAR` usa o rótulo textual **“Desgaste confirmado de roda-guia ou seu elemento interno”**, embora seu estado de dados seja `confirmed:false`, `reviewStatus:not_approved` e mapeamento SAP nulo. Esse rótulo deve ser revisado editorialmente em ciclo próprio, avaliando eventuais impactos no contrato e no conteúdo público; neste ciclo nenhum estado foi promovido ou conteúdo consumido foi alterado.

## Quatro hipóteses concorrentes

| Fenômeno | Prova discriminante | Alternativa a excluir |
| --- | --- | --- |
| Desgaste externo do aro/roda-guia | Medição CTS do perfil e posição, com limites efetivos por conjunto/modelo | Desalinhamento, tensão, abrasão, detritos e condição operacional |
| Dano do apoio interno | BOM/desenho OEM e teste aplicável de rotação/apoio | Detritos, tensão, interferência externa ou característica de projeto sem rolamento separado |
| Vedação da roda-guia | Origem real da perda localizada no próprio conjunto | Fluido migrado e vedação de rolete adjacente |
| Guiamento/tensionamento anormais | Configuração, geometria, histórico de desgaste, alinhamento e procedimento OMM | Padrão de contato externo sem defeito do apoio |

Não registrar ruído, aquecimento, aumento de desgaste ou vazamento como evidência de falha de rolamento sem ensaio/inspeção independente do componente certo.

## Literatura Caterpillar e limites

- [Caterpillar — Dozer Undercarriage Maintenance](https://www.cat.com/en_US/articles/for-owners/dozer-undercarriage-maintenance.html): inspeção de roda-guia quanto a ressalto/desgaste anormal, sujeira e tensionamento. Diretriz genérica, não fornece medidas por série.
- [Caterpillar — Custom Track Service / controle de desgaste](https://www.cat.com/en_US/campaigns/awareness/abrasion-undercarriage/support-for-your-bottom-line.html): CTS registra e acompanha desgaste para planejamento e previsibilidade de custos; **não é atestado de falha de rolamento**.
- [Caterpillar — How to Check Dozer Track Tension](https://www.cat.com/en_US/articles/for-owners/how-to-check-dozer-track-tension.html/): tensão, limpeza, inspeção e proteção de vedações; aplicar apenas valores e procedimentos OMM corretos.
- [Caterpillar — Undercarriage Track Idler](https://parts.cat.com/en/catcorp/product/643-4216): exemplo ilustrativo de função da roda-guia e necessidade de validação de compatibilidade. **O PN dessa página não foi associado à frota**, nem foi importado ao banco.

A inspeção CTS não é definida como porcentagem universal, e nenhum limite, perfil nominal, posição, número de peça ou critério de substituição foi inferido da literatura pública.

## Plano de evidências para revisão técnica

A fonte `data/quality/pm-idler-technical-review.v1.json` requer seis conjuntos de evidências em **ambiente corporativo privado**:

1. **Medições CTS específicas** com posição, lado, perfil, instrumento, horas e referência efetiva.
2. **Desenho/BOM OEM** por configuração, diferenciando roda-guia, eixo, bucha, rolamento interno quando existente e vedação.
3. **Estrutura SAP e material** por tipo de objeto IDLE e posições corretas, sem alias automático a ROLL.
4. **Discriminação de falhas** por mecanismo físico, distinguindo desgaste de aro de defeito do apoio e perda de vedação.
5. **Procedimento seguro e controle de energias**, sobretudo movimentação da esteira e conjuntos tensionadores com energia armazenada.
6. **Parecer independente** de Engenharia/Dados Mestres antes de alterar componente, código de dano/causa ou vinculação PM.

Não manipular tensionadores nem abrir sistemas pressurizados para “confirmar” hipótese sem procedimento OEM e bloqueio autorizado.

## Validação e decisão

O scanner `scripts/lib/pm-idler-scope.mjs` e o auditor `scripts/audit-pm-idler.mjs` produzem `reports/pm-idler-scope.generated.json`. Foram aprovadas dez regressões lexicais e quatorze tentativas sintéticas de falsificar medição, instalação, vedação, dano ou mapeamento.

**Decisão:** manter `track-idler-wear` bloqueada por `component_not_registered`. Não associar o rolamento de ROLL à roda-guia IDLE. Os 25 padrões PM, 115 vínculos candidatos, 10 bloqueios, 24 FC e 15 mecanismos existentes permanecem sem alterações; contratos, preview público e consumidores também.
