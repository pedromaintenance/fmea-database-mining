# FMEA Database Mining — Banco de Falhas de Equipamentos Móveis

Banco de conhecimento **versionado** para investigar modos de falha, sintomas, evidências e causas em equipamentos móveis de mineração. O principal consumidor planejado é o jogo **[P.O.R.C.A.R.I.A. — Você Quebra, Eu Conserto](https://github.com/pedromaintenance/porcaria-voce-quebra-eu-conserto)**.

> **Status:** versão do catálogo **1.2.0** (catálogo de hipóteses e taxonomias), **não** FMEAs formalmente aprovadas, banco de ocorrências reais nem fonte de procedimentos de execução.

## O que queremos construir

A jornada de diagnóstico reproduz as seis etapas usadas no jogo:

1. **Sistema** — onde a função falhou?
2. **Grupo** — qual conjunto funcional?
3. **Subgrupo** — em que subconjunto?
4. **Componente** — qual item?
5. **Dano** — qual alteração observada?
6. **Causa** — qual mecanismo/condição explica o dano, **com evidências**?

A base evoluirá por camadas: hierarquia funcional → componentes elegíveis → combinações candidatas → sintomas e observações → testes/evidências discriminantes → hipóteses causais → casos didáticos revisados → integração de jogo.

## Escopo da primeira versão

- Hierarquias por modelo e códigos de instalação funcional.
- Tipos de objeto, partes e taxonomia de danos/causas.
- Compatibilidades inferidas para **gerar candidatos**, nunca diagnósticos confirmados.
- Referências técnicas e índices de códigos de diagnóstico tratados como **indícios**, e não como causas.
- Esquemas, checagens e trilha de alterações.

**Contagens originais da geração v1:** 19 famílias/modelos, 1.466 nós de local funcional, 670 caminhos de três níveis, 66 códigos de dano, 81 causas, 32 origens de detecção, 518.832 combinações candidatas em 17 pacotes. Os números são relativos ao lote e devem ser validados em cada release.

## Organização

- `data/catalog/`: catálogos de domínio e locais funcionais.
- `data/models/`: combinações por modelo, em JSON compacto (carregamento sob demanda).
- `data/references/`: referências técnicas **parciais**, separadas dos casos.
- `data/cases/`: casos com sintomas, evidências, hipóteses e revisão técnica (etapa seguinte).
- `schemas/`: contratos de dados.
- `scripts/`: validação de integridade e geração futura.
- `docs/`: modelo conceitual, processo editorial e integração.
- `CHANGELOG.md`: histórico de versões.

## Regras obrigatórias

**Observação não é causa.** Um DTC, ruído, vazamento ou resultado de análise de óleo aponta uma hipótese, mas não confirma causa raiz. A confirmação depende de testes e evidências independentes, com registros de proveniência.

**Combinação não é caso.** Não gerar milhares de casos fictícios confundindo produto cartesiano com plausibilidade física. Distinguir `catalogado`, `inferido`, `curado` e `validado`. Probabilidades, HH, custos e criticidades não serão inventados a partir do catálogo.

**Segurança e direitos autorais.** Não publicar planilhas corporativas brutas, números de série/patrimônios, históricos confidenciais, dados pessoais ou textos/páginas integrais de manuais OEM. Publicação de derivados de fontes internas exige confirmação de autorização. Não há licença de reutilização dos dados presumida.

## Nova biblioteca de diagnóstico (v1.1.0)

Importados dos simuladores **Códigos de Falha** e **Análise de Óleo**: [144 casos de treinamento, 288 registros de evidências simuladas, 54 entradas de códigos, 23 definições FMI, 39 textos técnicos e 27 referências](data/knowledge/manifest.json).

Veja os [cenários eletrônicos](data/knowledge/electronic/diagnostic-records.json), os [cenários de óleo](data/knowledge/oil/diagnostic-records.json), o [índice de sintomas](data/knowledge/symptoms-index.json) e a [documentação da importação](docs/IMPORTACAO_SIMULADORES.md). Os dados são **didáticos**, não históricos nem validados para aplicação direta em máquinas.

## Planos de manutenção preventiva (v1.2.0)

A [extração em Python de sete planilhas](docs/EXTRACAO_PM_2026.md) mapeou 6.281 ocorrências de atividade e 1.018 tarefas distintas para oito equipamentos/famílias. A [camada pública de prevenção](data/knowledge/pm-prevention/) guarda **perfis agregados por máquina**, 25 padrões técnicos genéricos e o gerador de vínculos **sistema → subgrupo → componente → dano → causa**. O gerador verifica a compatibilidade dos códigos com o catálogo SAP.

**Não foi publicado o texto bruto das planilhas**: havia informações corporativas, procedimentos e registros de execução. A versão integral derivada, com 891 regras estruturadas e 159 candidatos estritos de subgrupo, fica no pacote de extração desta conversa até autorização de divulgação. Nenhum desses vínculos equivale a uma evidência real ou uma causa raiz confirmada.

## Roteiros diagnósticos e pesquisa (v1.2.1)

A [biblioteca de roteiros](data/knowledge/diagnostic/playbooks.v1.json) contém **12 situações fictícias**, 36 hipóteses concorrentes e 24 testes discriminantes, com interpretações favoráveis/desfavoráveis/inconclusivas. Nenhum teste foi realmente executado.

O gerador `scripts/generate-diagnostic-links.mjs` cruza os roteiros com vínculos candidatos de PM/FMEA e **não escolhe automaticamente peça, posição, dano ou causa**. Também há filtro de sistema-raiz para impedir que um mesmo subgrupo reúna circuitos funcionalmente diferentes.

Veja [Roadmap técnico](docs/ROADMAP.md) e [Pesquisa técnica e literatura OEM](docs/PESQUISA_TECNICA.md). A integração ao jogo depende de curadoria e do controle de gabaritos.

## Comece por aqui

Leia [Modelo de Dados](docs/MODELO_DE_DADOS.md), [Curadoria e Qualidade](docs/CURADORIA.md), [Roadmap](docs/ROADMAP.md) e [Histórico](CHANGELOG.md).

Integração planejada com o jogo: **importar dados de um release estável**, com adaptador e testes, sem dar spoilers ao jogador antes de confirmar cada etapa do diagnóstico.
