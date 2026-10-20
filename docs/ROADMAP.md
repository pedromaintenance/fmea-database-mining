# Roadmap técnico

## Fase 1 — Fundação do banco (v1.0)
- [x] Repositório independente e finalidade didática
- [x] Modelo relacional da taxonomia de instalação e falha
- [x] Registro de origem, premissas e limitações da primeira geração
- [ ] Validação por amostragem e aprovação de divulgação dos dados derivados em repositório público

## Fase 2 — Sintomas e mecanismos (v1.1)
- [ ] Vocabulário estruturado de sintomas: vazamento, aquecimento, perda de pressão, ruído, vibração, falha de acionamento, códigos etc.
- [ ] Relacionar sintoma a sistema e condição operacional: rotação, carga, temperatura, terreno, ciclo de operação
- [ ] Descrever consequências funcionais e progressão de falha
- [ ] Mecanismos causalmente coerentes por tipo de componente/material
- [ ] Construir hipóteses concorrentes e testes discriminantes

## Fase 3 — Evidências e casos revisados (v1.2)
- [ ] Casos curados por frota: escavadeiras, caminhões, tratores, motoniveladoras, carregadeiras e perfuratrizes
- [ ] Testes com resultados positivos, negativos e inconclusivos
- [ ] Evidências de análise de óleo, inspeção sensitiva, telemetria, DTC/Event, vibração e pressão
- [ ] Separação entre caso simulado e ocorrência real, com proveniência
- [ ] Revisão técnica e testes de consistência das alternativas

## Fase 4 — API estática e integração (v1.3)
- [ ] Resolver local com `modelId`, códigos e posições
- [ ] Carregar catálogo e cenários por modelo sem inflar o bundle
- [ ] Adaptador da estrutura do repositório ao `game-data.json`
- [ ] Nenhum spoiler de causa/gabarito antes da investigação
- [ ] Testes automatizados de seis etapas, salvamento e desempenho em mobile

## Fase 5 — Aprendizagem adaptativa e expansões (v2)
- [ ] Progressão de diagnóstico por evidências, sem fornecer respostas prontas
- [ ] Simular custos/tempos com indicadores explícitos de balanceamento ficcional
- [ ] Exportar resultados de aprendizagem (não dados de colaboradores reais)
- [ ] Ampliar catálogos mantendo governança de dados e versões reproduzíveis

## Próximo incremento preferencial

Começar com **casos curados pequenos e rigorosos**, por exemplo: arrefecimento, mangueiras hidráulicas, rolamentos de comando final, alternador/sensor elétrico e compressor/cabeça rotativa das perfuratrizes. Aumentar cobertura depois de testar consistência diagnóstica.
