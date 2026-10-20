# Planos preventivos → sintomas e modos de falha (extração Python)

## Inventário

Sete arquivos fornecidos cobrem oito modelos. A extração local normalizou **6.281 ocorrências** em **1.018 descrições distintas** (as repetições entre PMs e inspeções são mantidas na proveniência). A versão derivada para disponibilização controlada reúne **891 tarefas provenientes das planilhas estruturadas**, excluindo 127 textos parciais do arquivo CAT 16 em XLS legado. Após revisão lexical mais rigorosa, **159 tarefas** têm subgrupos SAP candidatos; **zero** vínculos estão tecnicamente aprovados.

Veja `source-profiles.json` para contagens, modelos, planos por horímetro e limitações.

## O que a análise extraiu

- **Sistemas:** motor, arrefecimento, combustível, transmissão, freios, comandos finais, pneus, material rodante, direção, hidráulica, implementos, lubrificação, elétrica/controle, ar-condicionado, estrutura, cabine, proteção contra incêndio, avanço de perfuratriz, mastro, cabeça rotativa, compressor/pneumático, coletor de pó.
- **Condições a detectar:** vazamento, folga/afrouxamento, trincas, desgaste, atrito/abrasão, falta de elemento, corrosão, contaminação, restrição, nível anormal de fluido, aquecimento, perda de função.
- **Atividades:** inspeção, troca, limpeza, coleta, lubrificação, drenagem, medição/teste, ajuste e abastecimento.
- **Ferramental didático:** uma inspeção preventiva indica *como procurar um sintoma*, mas não demonstra que o sintoma aconteceu.

## Relação causal

`atividade preventiva → condição-alvo (sintoma candidato) → subgrupo SAP elegível → componente catalogado → dano → causa candidata`.

Os padrões estruturados em `seed-rules.json` representam **hipóteses de ensino** inspiradas nas classes de inspeções, não cópia de procedimento. O script `scripts/generate-pm-links.mjs` só produz vínculo quando o catálogo SAP suporta simultaneamente o subgrupo, o componente e o par dano/causa. Caso contrário, descarta. O gerador não presume a posição física do componente.

### Exemplos didáticos (não ocorrências)

- Inspeção de roletes: desgaste/folga → `ROLL` → rolamento → dano de desgaste; verificar condição/lubrificação.
- Inspeção da colmeia do radiador: sujidade/restrição → `RADI` → possível redução de troca térmica.
- Inspeção de mangueiras de hidráulica: fricção/vazamento → `HSVV` → mangueira → abrasão e risco de perda de estanqueidade.
- Perfuratrizes: corrente de avanço, redutores e vasos pneumáticos exigem inspeção de fixação, lubrificação, desgaste e integridade.

**Estado de todos os vínculos:** `inferido_nao_validado`. **Estado de evidências:** `metodo_planejado_sem_resultado`.

## Executar

```bash
npm run pm:generate
npm run pm:validate
```

O resultado gerado é `data/knowledge/pm-prevention/generated-links.json` e poderá ser consumido pelo treinamento após revisão, sem precisar carregar o catálogo inteiro na interface.

## Limitações

1. CAT 16 `.xls`: extração parcial de strings, caracteres e células não garantidos.
2. Os procedimentos DR410i/DI650i possuem abas com `OLD`; não assumir periodicidades vigentes.
3. Nomes de componentes não bastam para confirmar série/configuração, posição ou causa raiz.
4. O catálogo de falha não contém o resultado de campo das inspeções; `evidenceStatus` é **planejado**, nunca confirmado.
5. A publicação de conteúdo detalhado extraído de planilhas de trabalho requer autorização; por isso **somente perfis agregados e padrões técnicos genéricos** foram versionados aqui. O material completo permanece no pacote local do projeto.

Próximo passo: revisão dirigida das tarefas que não têm subgrupo compatível e depois construção de cenários com testes positivos/negativos/inconclusivos, integrando os dois simuladores PORCARIA.
