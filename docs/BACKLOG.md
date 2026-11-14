# Backlog

| ID | História | Critérios de aceitação | Esforço | Responsável | Status |
|---|---|---|---|---|---|
| S1 | Catálogo e UX | 46 registros oficiais, busca sem acento, filtros, detalhes, navegação por hash e mobile-first | M | Equipe | Código e catálogo na main; executar/confirmar CI e QA responsivo |
| S2 | Regras e persistência | cálculo validado no servidor, quatro notas, token hash, modelo B, lock, idempotência e Sheets | G | Equipe | Código Apps Script/HTML Service versionado; planilha real, propriedades e teste ponta a ponta pendentes |
| S3 | Ranking e liberação | agregados públicos, mínimo 5, desempate, CI, Pages e QA mobile | G | Equipe | Código do ranking/workflow na main; CI atual, configuração Pages, publicação e QA pendentes |
| S4 | Compatibilidade móvel Google | avaliação e ranking abrem corretamente no Chrome Android com múltiplas contas Google e no desktop | M | Equipe | PR #2 aberto; revisão e teste em dispositivos necessários antes do merge |

## Próximas entregas

1. Executar e conferir catalog:check, typecheck, testes e build no GitHub Actions.
2. Revisar e testar o PR #2; integrar somente após validação.
3. Criar/configurar a planilha privada e implantar Apps Script conforme `docs/CONFIGURAR_GOOGLE.md`.
4. Configurar `VITE_APPS_SCRIPT_URL`, GitHub Pages e confirmar a URL publicada.
5. Testar recibo, leitura de volta, idempotência, concorrência e ranking com dados de teste, mantendo votação fechada.
6. Fazer QA mobile, acessibilidade e revisão independente.

**Esforço:** P = pequeno, M = médio, G = grande. Responsável operacional é a equipe; não há prazos presumidos.
