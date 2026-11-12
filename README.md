# Universo IF Avalia

Protótipo acadêmico de participação popular educativa para Web Mobile / Programação para Dispositivos Móveis, IFMA 2026.2. **Não é votação, julgamento ou ranking oficial do Universo IF.** Não solicita login dos visitantes.

## Estado desta entrega

Interface React + Vite + TypeScript, cálculo ponderado, formulário, ranking agregado, backend Apps Script/Sheets e documentação implementados na branch feat/universo-if-avalia-mvp. O catálogo oficial **não foi anexado**: src/catalogo.json é um invólucro vazio, sem títulos inventados. Build TypeScript/Vite não foi executado porque o ambiente não conseguiu acessar registry.npmjs.org para instalar dependências. Google Sheets, Pages e teste real de voto ainda não foram configurados.

## Executar localmente

Requer Node.js 22 ou superior.

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run dev
```

Substitua src/catalogo.json pelo JSON original. O código aceita array ou objeto com propriedade projetos. Preserve títulos e acentos.

## Regras

Nota = 0,30*C1 + 0,30*C2 + 0,25*C3 + 0,15*C4, quatro notas inteiras de 1 a 5. O servidor recalcula. Modelo B: mesmo token pode avaliar projetos diferentes, mas não pode repetir projeto. Unicidade por par (token, projeto), token como portador, não identidade. A planilha guarda SHA-256 do token. Apps Script usa LockService.getScriptLock() e id_requisicao idempotente.

Ranking separa modalidades, usa média ponderada, mínimo de cinco avaliações válidas e desempate alfabético pelo título. Resultado indicativo, não inferência estatística nem premiação.

## Arquitetura

- src/: React/Vite e regras TypeScript.
- src/catalogo.json: fonte oficial pendente.
- backend/Code.gs: Apps Script para Sheets, avaliações e agregados.
- backend/Index.html: fallback HTML Service com google.script.run se CORS/redirecionamento impedir integração Pages.
- docs/: auditoria, backlog, configuração Google e QA.

**CORS:** não usa no-cors e não considera envio como sucesso. Integração Pages → Apps Script deve ser testada em navegador real. Se falhar, use HTML Service.

## GitHub Pages

Vite usa base /Avaliador-de-projetos/. Após instalar dependências e gerar package-lock.json, configure workflow com npm ci, typecheck, testes e build; depois Settings → Pages → Source: GitHub Actions. Deploy público não foi habilitado.

## Segurança

Não publique tokens, hashes de produção, IDs de planilha, credenciais ou linhas individuais de avaliação. Planilha privada. Ranking público somente agregado. Sem nome, e-mail, IP, MAC ou fingerprint. LocalStorage não é usado para unicidade.

Consulte docs/AUDITORIA_CATALOGO.md, docs/BACKLOG.md, docs/CONFIGURAR_GOOGLE.md e docs/TESTES_E_QA.md.
