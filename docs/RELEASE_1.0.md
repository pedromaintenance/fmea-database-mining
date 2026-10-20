# Release 1.0 — catálogo de hipóteses

O **catálogo relacional original completo** foi importado em `data/catalog/failure-db.v1.json`.

- **Modelos:** 19.
- **Nós funcionais:** 1.466.
- **Caminhos de três níveis:** 670.
- **Códigos distintos de componentes:** 486.
- **Danos:** 66.
- **Causas:** 81.
- **Combinações candidatas reproduzíveis:** 518.832 para 17 modelos.

## Reproduzir os pacotes

```bash
node scripts/validate.mjs
node scripts/generate-models.mjs --all
node scripts/validate.mjs
```

A opção `--all` cria arquivos JSON compactos em `data/models/` e atualiza `data/manifest.json`, preservando o formato de tupla `[locationId, componentCode, damageId, causeId]`. Para um único modelo:

```bash
node scripts/generate-models.mjs --model EQ02
```

Os pacotes derivados **não precisam ser armazenados na branch**: são reproduzíveis a partir do catálogo versionado. Recomenda-se publicá-los como artefatos de release após testes, não carregá-los inteiros na interface inicial do jogo.

## Limitações

- Os vínculos objeto/componente e as definições de dano/causa provêm do catálogo usado na geração, mas **a relação componente-dano-causa é inferida**.
- Não há taxas de ocorrência empíricas, probabilidades, modos certificados, sintomas confirmatórios ou gabaritos automáticos.
- A v1.0 incorpora os dados de referência de `game-data.json` como **contexto de integração**, e não substitui os 29 casos existentes.
- Fontes brutas e documentos CAT 6030 **não foram incorporados** neste repositório público; sua publicação e revisão de direitos seguem pendentes.
