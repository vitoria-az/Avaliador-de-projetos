# Registro de execução e gates

Data: 12/11/2026.

| Gate | Status | Evidência / bloqueio |
|---|---|---|
| G0 | PASS | Conta GitHub vitoria-az conectada; repo vitoria-az/Avaliador-de-projetos; permissão admin/push; main inicialmente vazio; branch feat/universo-if-avalia-mvp criada. |
| G1 | BLOCKED | JSON 46 projetos e PDFs não estavam anexados nem localizados na Library. Nenhum título criado. |
| G2 | BLOCKED | React/Vite/TypeScript e telas implementados; cinco testes Node passaram; typecheck/build não executados por ausência de dependências. DNS para registry.npmjs.org falhou. |
| G3 | BLOCKED | Code.gs implementa validação, hash SHA-256, modelo B, lock, idempotência e ranking agregado; Sheets não configurada e teste offline não executou Apps Script. |
| G4 | BLOCKED_CONNECTED_VOTE | Sem implantação Apps Script, token sintético, recibo real ou readback em Sheets. Nenhum voto foi enviado. |
| G5 | BLOCKED_DEPLOY | Workflow Pages está preparado no pacote local, mas não foi publicado/configurado. Sem build validado e sem aprovação de publicação. |
| G6 | NOT_RUN | Não houve agente ou QA independente. Dispositivos reais não foram testados. |

## Decisões

- Repositório inicial estava vazio. Criado commit README na main para habilitar a criação da branch solicitada; trabalho subsequente isolado na branch de feature.
- Não houve merge nem publicação.
- Integração Google Drive/Sheets está desabilitada por política administrativa; nenhum recurso Google foi criado.
- Nenhum token, código válido ou dado pessoal foi criado ou publicado.
- Referência didática consultada somente para leitura: estrutura das aulas 06 (navegação/formulários) e 07 (estado/filtros/Sheets) em thalesvalente/teaching-mobile. Nenhum arquivo do professor foi alterado.
- Nenhum agente paralelo foi usado; QA independente permanece pendente.

## Próximos passos que desbloqueiam

1. Anexar universo_if_catalogo_46_projetos_v1.0.json e os PDFs, ou ao menos o JSON original.
2. Gerar package-lock.json em ambiente com acesso ao npm e rodar npm ci, typecheck, testes e build.
3. Revisar o diff e aprovar PR; não fazer merge/publicação automática.
4. Configurar Sheets/Apps Script em conta da equipe, com acesso anônimo somente se a política institucional autorizar.
5. Aprovar e executar voto sintético de teste; conferir recibo e linha privada.
6. Configurar Pages após build aprovado; QA independente em smartphone.
