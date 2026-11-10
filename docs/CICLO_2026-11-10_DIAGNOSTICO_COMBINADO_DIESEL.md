# Ciclo v1.4.16 — Diagnóstico diferencial combinado de motores diesel

**10/11/2026 · Síntese editorial de Engenharia · 0 ensaios, 0 ativos, 0 causas confirmadas, 0 avaliações humanas autenticadas.**

## Problema de engenharia

Os dossiês independentes de [contaminação óleo–arrefecimento](CICLO_2026-11-08_CONTAMINACAO_OLEO_ARREFECIMENTO.md) e [anomalias térmicas](CICLO_2026-11-08_DIAGNOSTICO_ARREFECIMENTO_MOTOR.md) são úteis isoladamente, mas o sintoma composto pode induzir uma falsa causalidade: observar aquecimento e película oleosa não comprova que o mesmo trocador tenha perdido estanqueidade **e** desempenho. Também não existe justificativa para deduzir que glicol no óleo determina automaticamente a junta, que temperatura divergente prove comunicação de fluidos ou que retirar termostato seja paliativo seguro.

## Método acrescentado

A ficha `data/knowledge/engine-thermal-crossfluid-bridge.v1.json` apresenta **seis situações fictícias e 18 interpretações concorrentes** vinculadas por IDs às sete hipóteses de contaminação (EC) e às dez de desempenho térmico (CL). Cada interpretação separa observações, possibilidade de vínculo, documentação ainda necessária, contraprova e conclusão inválida.

Quatro relações são deliberadamente diferentes:

- **INDEPENDENT**: fenômenos podem coexistir sem nexo único.
- **SHARED_CONTEXT**: a mesma intervenção ou condição pode preceder duas anomalias; precedência não é causalidade.
- **POSSIBLE_COUPLING**: interação fisicamente possível **somente se** a arquitetura OEM efetiva a admitir; não há prova de vínculo em ativo.
- **MEASUREMENT_ARTIFACT**: qualidade da amostra, localização do sensor ou metrologia condicionam interpretação, mas não autorizam ignorar alarmes.

Os casos cobrem: temperatura + película; perda de coolant + sinal analítico; mudança após serviço; aspecto/espuma + suspeita térmica; temperaturas divergentes sob carga; termostato ausente + suspeita paralela de óleo no coolant. Cada caso tem **três explicações**, sem ranking de probabilidade e sem exclusão automática das demais.

## Referências e limites

As relações entre os estudos são **inferência editorial**. Elas não são afirmações extraídas diretamente de literatura OEM como diagnósticos de um ativo. Os mecanismos já catalogados apontam para o mesmo registro de **114 referências**, sem alegação de revisão integral nem novas fontes neste ciclo.

Pontos técnicos verificados em fontes primárias:

- [Caterpillar — S·O·S e interpretação de amostras](https://www.cat.com/en_US/support/maintenance/sos-services/take-sample.html): glicol, sódio e propriedades do fluido são indícios interpretados por método, formulação e tendência; indicador isolado não localiza a peça.
- [Perkins — amostragem de óleo](https://www.perkins.com/en_GB/aftermarket/maintenance/perkins-fluid-sampling/oil-sampling.html): tendência, qualidade da amostra e horímetro são indispensáveis ao contexto da análise; resultados químicos não identificam sozinhos causa raiz.
- [Caterpillar — termostato e bypass](https://www.cat.com/pt_BR/support/maintenance/self-service-options/thermostat.html): em arquiteturas indicadas, remoção do termostato pode manter bypass aberto e **agravar aquecimento**.
- [Caterpillar — reparos por calor](https://www.cat.com/en_US/articles/IRF-Resource-Center/truck-engine-repair-tips-stop-heat-damage-irf.html): ventilação, reguladores, bomba, mangueiras e trocadores devem ser diferenciados, não presumidos por um alarme.

Há limites de transferência: páginas genéricas de fabricante e motores de outras aplicações **não** fornecem valores de aceitação para caminhões ou escavadeiras de uma série identificada na mina.

## Aplicação em PCM e investigação

A função desta camada é organizar **perguntas para Engenharia**, não emitir uma OS ou escolher reposição. Para um caso autorizado, solicitar em ambiente corporativo: identificação e configuração OEM; topologia do arrefecimento e trocadores; linha do tempo de intervenção e operação; confiabilidade de leituras térmicas; laudos de óleo/coolant com qualidade da coleta, formulação e tendência; análise do procedimento OEM e avaliação independente. Essas classes usam os identificadores documentais de v1.4.14 e v1.4.15, **sem incorporar os próprios documentos privados**.

**Risco de postergação:** um evento real de perda de coolant, sobretemperatura ou contaminação do óleo pode trazer danos adicionais; esta ficha não quantifica severidade, probabilidade ou tempo tolerável. Nenhuma hipótese desta biblioteca libera a continuidade operacional.

## Entregas verificáveis

- `data/knowledge/engine-thermal-crossfluid-bridge.v1.json`: ficha canônica de comparação com 6 situações, 18 alternativas, evidência e contraprovas;
- `scripts/lib/engine-thermal-crossfluid-contract.mjs`: validação única compartilhada pelo construtor e pelo auditor;
- `docs/diagnostico-combinado-motor.html`: interface HTML offline autossuficiente **após build**, sem API, telemetria ou persistência;
- `scripts/build-engine-thermal-crossfluid-bridge.mjs`: gera bundle JSON e HTML para publicação;
- `scripts/audit-engine-thermal-crossfluid-bridge.mjs`: valida IDs de hipóteses/documentos, fontes, impossibilidade de diagnóstico/autoridade, integridade do piloto congelado e **20 alterações adversariais**;
- catálogo + biblioteca: dois recursos selecionados adicionais; scripts e Actions integrados.

**Atenção:** a página fonte em `docs/` contém apenas placeholder editorial; GitHub Pages publica a compilação de `reports/` após auditoria. O arquivo de saída não é procedimento OEM.

## Critérios de fechamento e lacuna material

A fase bibliográfica passa quando o construtor e auditor são executados sem erros, o catálogo é coerente, os arquivos do piloto congelado conservam hashes e a publicação não expõe fatos privados. **Isso não equivale a revisão por especialista.**

**Próximo passo com maior ganho material:** trazer uma pergunta espontânea e anônima de mantenedor ao piloto congelado, com autorização, dupla revisão independente e custódia privada. Em paralelo, revisar esta nova camada com especialistas diesel e arrefecimento antes de utilizá-la como apoio técnico em um ativo concreto.
