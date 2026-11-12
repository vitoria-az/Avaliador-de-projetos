# Auditoria do catálogo v1.0

<badge>Dados</badge> Catálogo validado com base no JSON versionado do kit e nas duas programações em PDF fornecidas.

## Contagem e integridade

- Total: **46 projetos únicos**.
- **Mostra Nacional:** 24 IDs, de `NAC-001` a `NAC-024`.
- **Mostra de Extensão:** 22 IDs, de `EXT-001` a `EXT-022`.
- Duplicados dentro de uma modalidade: **0**.
- Sobreposição documental: os 24 projetos nacionais aparecem nos dois PDFs; cada um foi mantido uma única vez no catálogo consolidado, com as duas referências de página.
- Todos os registros contêm `id`, `titulo`, `modalidade`, `area_tematica`, `data`, `inicio`, `fim`, `formato`, `local` e `fontes`.

## Fontes

1. `universo_if_catalogo_46_projetos_v1.0.json`, fornecido em `UNIVERSO_IF_AVALIA_KIT_ALUNOS_v1.0.zip`.
2. `fontes/trabalhos-mostra-nacional-extensao.pdf`: 5 páginas. Páginas 1–3: 22 registros da Mostra de Extensão e a transição para a Mostra Nacional; páginas 3–5: os 24 registros nacionais.
3. `fontes/trabalhos-mostra-nacional.pdf`: 3 páginas. É uma segunda apresentação da mesma programação com a Mostra de Extensão recolhida; contém os mesmos 24 registros nacionais, não uma nova lista.

Os PDFs são imagens de programação; a extração textual automática retorna páginas sem texto. A conferência de títulos e proveniência foi baseada na transcrição visual registrada no arquivo `AUDITORIA_FONTES.md` do kit. As páginas de origem foram preservadas em cada objeto `fontes` de `src/catalogo.json`.

## Distribuição por dia

| Modalidade | 17/11/2026 | 18/11/2026 | Total |
|---|---:|---:|---:|
| Mostra de Extensão | 13 | 9 | 22 |
| Mostra Nacional | 12 | 12 | 24 |
| **Total** | **25** | **21** | **46** |

## Registros que exigem atenção

- `NAC-004` — **AGROSENTINELA**.
- `NAC-005` — **TRAÇO VIVO**.

São dois registros normais e distintos da Mostra Nacional. Não são destaques oficiais e não recebem pontuação ou prioridade especial.

## Dados ausentes

Os PDFs não disponibilizam autores, resumos, imagens, links individuais das apresentações, situação de presença nem coordenadas específicas de cada pôster. Esses campos foram omitidos, sem preenchimento presumido. O local e o formato comuns são os que aparecem na programação: Área de vivência e Exposição de pôster.

## Validação executada

- Script do kit: `node scripts/validar_catalogo.mjs src/catalogo.json` — **PASS** (46 IDs distintos; campos obrigatórios, datas, modalidade, local e proveniência válidos).
- Comparação automática dos campos principais entre a lista já existente no branch e o catálogo do kit: **46/46 sem divergência** em ID, título, modalidade, área, dia, horário, formato e local. A transformação acrescentou os objetos de proveniência com página e o metadado de conferência.
- Inspeção visual das páginas renderizadas dos dois PDFs: **5 + 3 páginas**; os nacionais sobrepostos foram tratados como os mesmos 24 registros.

## Limitação

A programação é um retrato documental datado de 12/11/2026, não garantia de alterações posteriores pelo evento. A equipe deve registrar qualquer retificação oficial em novo commit, preservando a versão e a proveniência.
