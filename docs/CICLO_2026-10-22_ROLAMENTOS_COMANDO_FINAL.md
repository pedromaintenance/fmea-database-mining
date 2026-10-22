# FMEA Database Mining — Ciclo v1.3.48: rolamentos do comando final

**22/10/2026 · Banco v1.3.48 · Ontologia v1.3.13.** A regra `final-drive-bearing` já existia como hipótese preventiva no subgrupo genérico `FID2`, porém não tinha bundle semântico. Esta evolução estabelece hipóteses mecânicas discriminantes, não prova que algum rolamento específico da frota esteja defeituoso ou que uma peça/vedação seja reparável separadamente.

## 1. Função e fronteiras do sistema

O comando final transmite torque e reduz rotação no trem de força. Engrenagens transmitem torque através dos dentes; rolamentos sustentam/posicionam elementos rotativos e recebem esforços, dependendo da arquitetura efetiva. A regra `final-drive-gear` (`FID1`, `BUNDLE-14`) permanece independente da `final-drive-bearing` (`FID2`, novo `BUNDLE-15`).

A SKF descreve, na classificação de danos **ISO 15243**, diferenças entre **desgaste abrasivo/adesivo**, **fadiga de contato superficial ou subsuperficial**, corrosão, deformação plástica, trincas e outros mecanismos. A morfologia ajuda a classificar danos depois de observados; não equivale à identificação automática da causa ou à verificação de rolamento instalado. Vibração, ruído, temperatura, presença de partículas e alteração do óleo são sinais de sistemas com origens concorrentes.

## 2. Conceitos específicos de rolamento

| Condição técnica hipotética | Evidência discriminante | Não significa |
| --- | --- | --- |
| Desgaste em pista/corpo rolante | Exame localizado de riscos, sulcos ou marcas em rolamento identificado, conforme acesso OEM | Limalha ou ruído isolado não confirmam desgaste da pista |
| Fadiga de contato | Exame de descascamento (*spalling*) ou alteração morfológica na superfície de contato | Vibração não prova fadiga nem seu mecanismo de iniciação |
| Possível perda de estanqueidade | Identificação da vedação, origem do fluido e possível ingresso de contaminantes | Não comprova que a vedação seja propriedade exclusiva de rolamento substituível |
| Calor localizado na região de apoio | Medida comparativa com referência operacional, posição e procedimento aplicável | Calor do comando final pode derivar de engrenagens, óleo, carga e outros elementos |

Os quatro conceitos acima são `condition_hypothesis_not_observed`; `observedValue` e `observedAt` continuam nulos.

As três hipóteses diferenciais associadas são: `DMG-DRIVE-BEARING-WEAR-CANDIDATE`, `DMG-DRIVE-BEARING-FATIGUE-CANDIDATE` e `DMG-DRIVE-BEARING-SEAL-CANDIDATE`. Todos possuem `confirmed:false`, revisão não aprovada e mapeamento SAP nulo. A hipótese de vedação **não** pressupõe que o rolamento possua vedação individual.

## 3. Sinais genéricos compartilhados com as engrenagens

O mesmo compartimento pode conter rolamentos e engrenagens, portanto há **cinco referências conscientemente compartilhadas** entre `BUNDLE-14` e `BUNDLE-15`:

- `COND-DRIVE-MAGNETIC-DEBRIS`: partículas em bujão magnético não identificam a peça de origem.
- `COND-DRIVE-OIL-CONTAMINATION`: contaminação, metais ou mudança de aditivos não confirmam rolamento ou engrenagem.
- `COND-DRIVE-LUBRICATION-INADEQUACY`: nível ou filme lubrificante suspeito exige comprovação segundo a aplicação.
- `COND-DRIVE-ABNORMAL-NOISE`: ruído/vibração não identifica isoladamente a origem.
- `ACT-DRIVE-OIL-REPRESENTATIVE-SAMPLE`: proposta de coleta de óleo representativo antes de troca; não é ação executada nem falha detectada.

Somados aos seis nós genéricos anteriormente partilhados nos sistemas de combustível e hidráulico, o crosswalk passa a **11 nós compartilhados, zero danos físicos compartilhados**. A modelagem impede que um dano de engrenagem seja atribuído a rolamento por analogia. **A amostra deve ser coletada antes da intervenção**, sempre que o procedimento de coleta indicado se aplicar, para preservar informações anteriores à troca.

Uma mudança conhecida de formulação ou lubrificante pode modificar o perfil analítico; sem identificação do fluido e tendência, o resultado não estabelece degradação de engrenagem nem falha de rolamento. Da mesma forma, a morfologia de material no bujão e categorias genéricas da Caterpillar não substituem critério de condenação por máquina e série.

## 4. Ações propostas, não executadas

As três ações novas são identificar rolamento, apoio e arquitetura de vedação por desenho/BOM OEM; examinar pistas, corpos rolantes e danos concorrentes de engrenagem por procedimento autorizado; e rastrear a origem de fuga/ingresso de contaminantes por vedação. Além disso, a amostragem representativa de óleo já proposta no ciclo anterior foi incluída como ação genérica compartilhada.

**Nenhuma intervenção é autorizada apenas pelo modelo semântico.** Abrir comandos finais envolve massas e cargas relevantes, óleo potencialmente quente e pressão residual conforme arquitetura. Planejamento, bloqueio, movimentação segura, limpeza e recuperação/preservação de evidências devem seguir OMM/SIS e procedimentos locais efetivos. Se houver fragmentos relevantes, anormalidade térmica grave ou risco de travamento, cabe avaliação operacional imediata, sem submeter o equipamento a testes improvisados de carga para obter confirmação.

## 5. Literatura utilizada e limites

- [SKF — How to understand ISO 15243](https://evolution.skf.com/us/bearing-damage-analysis-iso-15243-is-here-to-help-you/): taxonomia de desgaste, fadiga de contato e causas concorrentes. Não identifica rolamento da frota.
- [SKF — Wear and surface fatigue in rolling bearings](https://evolution.skf.com/en/wear-and-surface-fatigue-in-rolling-bearings/): diferenciação de mecanismos genéricos, sem efetividade por equipamento.
- [Caterpillar — Drivetrain Repair Indicators and Best Practices](https://www.cat.com/en_US/blog/drivetrain-repairs-preventive-maintenance.html): explica que ruído, vibração, detritos e vazamentos podem ter fontes concorrentes no trem de força.
- [Caterpillar — How to Inspect Cat Drive Train Magnetic Plugs](https://www.cat.com/en_US/blog/inspect-drive-train-magnetic-plugs.html): abordagem geral de bujões e tendências. O exemplo de equipamento e a escala da página **não** são critérios automáticos de condenação do comando final de CAT 777 ou outros modelos.
- [Caterpillar — How to Maintain Cat Drive Train Oil](https://www.cat.com/en_US/blog/maintain-drive-train-oil.html): cuidado com fluido de trem de força; especificações de óleo, intervalos e procedimentos devem ser verificados por compartimento e série.

São referências públicas que já constam de `data/research/sources.v1.json`. Não foram publicados manuais, números de série, códigos OEM privados, partes de desenhos protegidos ou resultados corporativos de laudos.

## 6. Validação da expansão

| Indicador | v1.3.47 | v1.3.48 |
| --- | ---: | ---: |
| Regras PM existentes | 25 | 25 |
| Regras com bundle semântico | 14 | **15** |
| Regras sem bundle | 11 | **10** |
| Condições | 39 | **43** |
| Ações | 32 | **35** |
| Danos candidatos | 17 | **20** |
| Bundles | 14 | **15** |
| Relações tipadas | 94 | **109** |
| Casos sintéticos | 24 | **26** |
| Nós genéricos compartilhados | 6 | **11** |
| Vínculos PM candidatos | 115 | **115** |
| Exceções PM bloqueadas | 10 | **10** |

`npm run pm:drive:bearing:audit` verifica separação engrenagem/rolamento, caráter não observado, ausência de efetividade automática OEM, ações não executadas, crosswalk dos cinco compartilhamentos e **32 alterações adversariais** (20 sobre ontologia, 8 sobre a matriz e 4 sobre exemplos sintéticos). O relatório gerado é `reports/pm-final-drive-bearing.generated.json`.

A ontologia evoluiu para **1.3.13**, mas o contrato/conteúdo públicos de cadeias **1.0.0**, preview histórico **1.3.12** e aplicativos consumidores não receberam esses conceitos automaticamente. Mantêm-se **24 FC e 15 mecanismos ME**, sem aprovação ou exclusão de restrições PM/SAP.

## 7. Lacunas para uso operacional

Requer-se, em meio corporativo restrito, confirmar a montagem OEM do comando final por modelo/série e localização, identificar o tipo e posição de rolamentos e vedações, obter procedimento de inspeção e desmontagem, tendência de óleo/bujão, documentação de manutenção anterior e parecer independente sobre os mecanismos. **Nenhuma observação, coleta, medição, serviço, causa raiz ou dano real foi criada nesta versão.**
