# Universo IF Avalia

**Universo IF Avalia — participação popular educativa** é um protótipo acadêmico desenvolvido para Web Mobile / Programação para Dispositivos Móveis, IFMA 2026.2. Ele **não é votação, julgamento, classificação ou avaliação científica oficial** do Universo IF e não solicita cadastro nem login dos visitantes.

## Estado atual

A implementação está na branch `feat/universo-if-avalia-mvp`, no [PR #1](https://github.com/vitoria-az/Avaliador-de-projetos/pull/1). O catálogo canônico contém **46 projetos únicos** (24 Mostra Nacional e 22 Mostra de Extensão), com título, horário, local e proveniência preservados. Consulte [auditoria do catálogo](docs/AUDITORIA_CATALOGO.md).

A interface pública usa React + Vite + TypeScript e GitHub Pages. O formulário de avaliação e o ranking dinâmico usam HTML Service do Google Apps Script com `google.script.run`, para não depender de CORS em um POST direto do Pages. A persistência usa Google Sheets privado.

**Ainda não está publicado/homologado:** planilha e Apps Script precisam ser criados na conta da equipe, o teste real de recibo/readback não foi executado e o PR não foi integrado à `main`. O CI mais recente ainda precisa ser confirmado após as correções desta versão. Não há votos de produção nem tokens reais no repositório.

## Executar localmente

Requer Node.js 22 ou superior.

```bash
npm ci
npm run catalog:check
npm run typecheck
npm test
npm run build
npm run dev
```

O workflow atualmente cria um lockfile temporário no runner para executar `npm ci`. Antes de considerar a configuração reproduzível localmente, gere e versione um `package-lock.json` revisado.

## Funcionalidades

- Catálogo de 46 projetos, com busca que ignora acentos e filtros por modalidade, área temática e dia.
- Detalhes navegáveis por hash e botão “Avaliar este projeto”.
- Escala de 1 a 5 em quatro critérios: criatividade e inovação (30%), clareza (30%), relevância e impacto (25%), demonstração e resultados (15%).
- Nota ponderada: `0,30*C1 + 0,30*C2 + 0,25*C3 + 0,15*C4`.
- Sem login de visitante. O código de participação é um token ao portador, emitido pela organização, e não uma conta ou comprovação de identidade.
- Modelo B: o mesmo código pode avaliar projetos diferentes, mas apenas uma vez cada projeto.
- O ranking separa as modalidades, calcula a média das notas ponderadas, exige amostra mínima de cinco avaliações e desempata pelo título em ordem alfabética pt-BR e, persistindo, pelo ID.

## Arquitetura

- `src/`: React, estilos, tipos, regras de domínio e catálogo versionado.
- `backend/Code.gs`: operações do Google Sheets, hash SHA-256, validação, limitação de taxa, LockService, idempotência e agregação pública.
- `backend/Index.html`: telas de avaliação e ranking servidas pelo HTML Service via `google.script.run`.
- `.github/workflows/pages.yml`: CI e publicação Pages após integração em `main`.
- `docs/`: auditoria, backlog, configuração Google, testes/QA e gates.

## Configurar Google

Siga [docs/CONFIGURAR_GOOGLE.md](docs/CONFIGURAR_GOOGLE.md). A planilha deve permanecer privada; somente agregados são exibidos publicamente. Não coloque tokens, hashes de produção, IDs de planilha ou credenciais no GitHub.

## Publicação

A equipe deve revisar e aprovar o PR #1, integrá-lo à `main`, configurar GitHub Pages → Source: GitHub Actions e concluir os testes descritos em [docs/TESTES_E_QA.md](docs/TESTES_E_QA.md). Não habilite acesso anônimo do Apps Script sem confirmar que a conta e a política institucional permitem.

Consulte também [docs/STATUS_GATES.md](docs/STATUS_GATES.md).
