# FMEA Database Mining — Ciclo v1.3.36: busca de filtragem em grupos SAP e confronto OEM público

**Data:** 21/10/2026. **Escopo:** duas regras PM bloqueadas — `fuel-filter-contamination` e `drill-compressor-filter`. **Natureza:** investigação de estrutura e plausibilidade, não confirmação física de componentes nem aplicação OEM por série.

## Pergunta de engenharia

O bloqueio das regras se deve a um subgrupo original inadequado, à ausência de componente filtrante catalogado no grupo funcional ou à incompatibilidade dano/causa? Não corrigir a regra por analogia verbal; explorar o catálogo mantendo as limitações de modelo, sistema/grupo e tipo de objeto.

## Método reproduzível

`scripts/pm-filtration-scan.mjs` pesquisa **todos os subgrupos do grupo correto** para os modelos da regra, percorre os componentes admissíveis por **tipo de objeto** e sinaliza descrições contendo conceitos de filtro/separador. O relatório também verifica separadamente a admissibilidade do **par dano/causa original**.

O resultado é uma **lista de candidatos editoriais**, sem alteração do gerador de vínculos PM, de `seed-rules.json`, de objetos SAP, de PN ou de ocorrências. Descrição de componente no catálogo não comprova instalação nem efetividade OEM.

## Achados da varredura do catálogo

| Regra | Caminhos modelo (nível 3) | Caminhos no grupo funcional | Caminhos com descrição filtro/separador | Conclusão |
| --- | ---: | ---: | ---: | --- |
| Filtro de combustível HSVV | 307 | 16 | 0 | Nenhuma descrição filtrante localizada em FUSY nos modelos da regra. Cadastro/grupo de filtragem e BOM ainda requerem revisão. |
| Filtro do compressor COMR | 94 | 12 | 2 | Uma família candidata surge em **AISY / COMR / VPAR**, em EQ05 e EQ06, com descrições relacionadas a filtro/separador. **Não é aprovada.** |

**Observação sobre o compressor:** o código VPAR é associado ao vaso/recipiente pressurizado em outra regra. O aparecimento de textos filtrantes em seu tipo de objeto não prova que o item pertença ao circuito específico, esteja instalado ou deva receber dano `03.02`/causa `C2.09`. A auditoria encontrou **quatro ocorrências de descrições relacionadas a filtragem/separação**, das quais **duas ocorrências** admitem o par catalogado `03.02/C2.09`. Essas contagens são por ocorrência de caminho/objeto, **não representam dois componentes físicos distintos**, instalação efetiva ou autorização de remapeamento. O detalhe reproduzível consta de `reports/pm-filtration-discovery.generated.json`.

## Fontes técnicas públicas e limites

- [Caterpillar — filtros primários de combustível](https://www.cat.com/en_US/blog/how-to-replace-a-fuel-filter.html): função de separação de água e filtragem; não há comprovação de falha do filtro por presença de água.
- [Sandvik DR410i](https://www.mining.sandvik/pt-br/produtos/equipamento/equipamentos-de-perfuracao-de-superficie/dr410i/): confirma a família de compressor, mas manuais efetivos de peças/operação exigem consulta **My Sandvik**.
- [Sandvik — kits de manutenção](https://www.mining.sandvik/pt-br/produtos/kits-e-consum%C3%ADveis/kits-de-manuten%C3%A7%C3%A3o/): os kits dependem da configuração efetiva; não generalizar conteúdo nem intervalos.
- [Sandvik — atualização do módulo de bombas](https://www.mining.sandvik/en/products/parts-and-components/upgrades/rotary-drills/pump-unit-module/): ilustra variação de configuração com remoção de filtragem adicional em **módulo de bombas**; **não é fonte sobre remoção de filtros do compressor de ar**.

Fontes e limites estão formalizados em `data/research/pm-filtration-public-evidence.v1.json`. Não reproduzimos manual licenciado ou listas de PN de configuração.

## Decisões (não homologadas)

1. **Combustível:** manter `fuel-filter-contamination` bloqueada por componente não encontrado. Solicitar à Engenharia/Dados Mestres a árvore de FUSY e o conjunto filtrante efetivo; se a filtragem residir em outro grupo, revisar modelo conceitual antes de mover a regra.
2. **Compressor:** manter `drill-compressor-filter` bloqueada por grupo/subgrupo incompatível. Solicitar documentação Sandvik aplicável à configuração, lista de componentes do compressor, análise dos elementos do vaso VPAR e decisão independente sobre nível e função.
3. Manter **contaminação detectada ≠ falha confirmada do filtro**, e **elemento listado no objeto ≠ elemento instalado na máquina**.
4. Não propor número de peça, frequência, código SAP, dano/causa ou procedimento de execução sem documento efetivo, evidência e revisor autorizado.

## Validação e integração

`npm run pm:filtration:audit` executa o scanner, preserva os gates HSVV/COMR, valida quatro fontes de fabricante e exercita cenários sintéticos; GitHub Actions executa o passo antes da exportação pública. A execução validada deve conservar 25 regras, 115 vínculos PM candidatos e dez bloqueios, sem mudar o contrato público 1.0.0, o preview legado 1.3.12, 24 FC e 15 ME.

**Próxima evidência de maior valor:** extrato estruturado da árvore funcional do sistema de combustível e do compressor; BOM efetivo Sandvik por arranjo no ambiente corporativo privado; confirmação de tipo de filtro e circuito (ar, óleo do compressor, coalescente, recipiente) por técnico especialista, com revisão independente.
