# Registro de execução e gates

Data: 14/11/2026. Estado verificado no repositório.

| Gate | Status | Evidência / bloqueio |
|---|---|---|
| G0 | PASS | Repositório GitHub conectado e branch principal identificada. |
| G1 | PASS | Catálogo versionado com 46 projetos únicos: 24 Mostra Nacional e 22 Mostra de Extensão, com proveniência por arquivo/página. |
| G2 | PENDENTE_CI | Aplicação React/Vite/TypeScript, catálogo e testes estão na main. A correção de regex/datas foi commitada em 13/11. Não há resultado de Actions/status checks disponível nesta verificação; executar e confirmar catalog:check, typecheck, testes e build. |
| G3 | BLOQUEADO_GOOGLE | Backend Apps Script e HTML Service estão versionados. Planilha real, propriedades do script e implantação do Web App ainda dependem da conta da equipe. |
| G4 | BLOQUEADO_TESTE_REAL | Não há evidência de teste real com recibo, readback no Sheets e idempotência. Nenhum voto de produção deve ser enviado. |
| G5 | PENDENTE_PUBLICACAO | PR #1 foi integrado à main em 13/11. GitHub Pages ainda precisa ser verificado/configurado e o site publicado confirmado. PR #2 permanece separado, aguardando teste mobile. |
| G6 | NOT_RUN | QA independente e testes em dispositivos físicos ainda não foram comprovados. |

## Estado do GitHub

- Repositório: https://github.com/vitoria-az/Avaliador-de-projetos
- PR #1: integrado à main em 13/11/2026.
- Correção da validação de datas e normalização da busca: commit dd2ad99 na main.
- PR #2: https://github.com/vitoria-az/Avaliador-de-projetos/pull/2 — branch fix/mobile-apps-script-account-routing, um commit à frente da main; não considerar integrado até confirmar o merge.
- A consulta atual não retornou workflow runs/status checks para o commit corrigido. Isso não significa aprovação nem falha: o CI precisa ser executado e verificado no GitHub Actions.

## Ações restantes

1. Executar/confirmar CI na main: npm run catalog:check, npm run typecheck, npm test e npm run build.
2. Revisar PR #2 e testar o fluxo no Chrome Android com várias contas Google conectadas e no desktop; integrar somente após validação.
3. Na conta da equipe, criar a planilha privada, configurar Apps Script e propriedades conforme docs/CONFIGURAR_GOOGLE.md.
4. Executar setupSheets() e importarProjetos(); conferir os 46 registros.
5. Implantar o Apps Script somente com permissões permitidas pela instituição e configurar VITE_APPS_SCRIPT_URL nas variáveis do repositório.
6. Configurar/verificar GitHub Pages com Source: GitHub Actions e confirmar a URL publicada.
7. Com votação fechada, executar teste sintético de envio, recibo, readback, reenvio idempotente e concorrência.
8. Fazer QA responsivo/acessível nos viewports 320, 375, 768 e 1280 px e em dispositivos reais.

## Segurança e liberação

- Manter votacao_aberta = FALSE até concluir todos os testes.
- Manter a planilha privada; nunca publicar as abas Codigos e Avaliacoes.
- Não incluir tokens, hashes de produção, IDs privados ou credenciais no GitHub.
- Se acesso anônimo ao Apps Script não estiver disponível ou não for permitido, não contornar a política institucional.
- Não declarar o sistema homologado, publicado ou pronto para votação sem evidência dos gates G2–G6.
