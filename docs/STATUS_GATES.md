# Registro de execução e gates

Data: 12/11/2026.

| Gate | Status | Evidência / bloqueio |
|---|---|---|
| G0 | PASS | Conta GitHub vitoria-az conectada; repo vitoria-az/Avaliador-de-projetos; permissão admin/push; main inicialmente vazio; branch de feature criada. |
| G1 | BLOCKED | JSON com 46 projetos e PDFs não estavam anexados nem localizados na Library. Nenhum título criado. |
| G2 | PASS | Interface React/Vite/TypeScript, regras e cinco testes; GitHub Actions #2 aprovou npm ci, typecheck, testes e build. Catálogo real continua condicionado ao G1. |
| G3 | BLOCKED | Code.gs implementa hash, modelo B, lock, idempotência e agregados; teste offline de regra B passou. Sheets e execução real Apps Script não configuradas. |
| G4 | BLOCKED_CONNECTED_VOTE | Sem implantação Apps Script, token sintético, recibo real ou readback em Sheets. Nenhum voto foi enviado. |
| G5 | BLOCKED_DEPLOY | CI aprovado e artefato Pages criado; deploy ignorado em PR. Não houve merge nem publicação; Pages não configurado. |
| G6 | NOT_RUN | Nenhum agente paralelo ou QA independente. Dispositivos reais não foram testados. |

## Decisões

- Repositório inicialmente vazio. Commit inicial README na main para habilitar a branch; trabalho subsequente isolado na branch de feature.
- PR #1 aberto como Draft; nenhum merge ou publicação.
- Integração Google Drive/Sheets desabilitada por política administrativa; nenhum recurso Google criado.
- Nenhum token, código válido ou dado pessoal criado ou publicado.
- Referência didática consultada somente para leitura: aulas 06 (navegação/formulários) e 07 (estado/filtros/Sheets) em thalesvalente/teaching-mobile. Nenhum arquivo do professor alterado.
- Nenhum agente paralelo foi usado; QA independente permanece pendente.
- GitHub Actions #2 (commit 1681104b0f24d39ced2ede3d7f727c1d86db8f46) terminou SUCCESS: npm ci, typecheck, tests, build e artifact upload. Deploy job SKIPPED no evento pull_request.

## Próximos passos

1. Anexar universo_if_catalogo_46_projetos_v1.0.json e PDFs, ou ao menos o JSON original.
2. Gerar e commitar package-lock.json revisado.
3. Revisar e aprovar PR; não fazer merge/publicação sem autorização.
4. Configurar Sheets/Apps Script em conta da equipe, com acesso anônimo somente se a política institucional autorizar.
5. Aprovar e executar voto sintético de teste; conferir recibo e linha privada.
6. Configurar Pages após merge aprovado; QA independente em smartphone.
