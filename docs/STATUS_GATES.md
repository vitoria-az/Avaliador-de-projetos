# Registro de execução e gates

Data: 12/11/2026. Estado da execução desta revisão.

| Gate | Status | Evidência / bloqueio |
|---|---|---|
| G0 | PASS | Conta GitHub vitoria-az conectada; permissão admin/push; repositório identificado; branch de trabalho e PR #1 existentes. |
| G1 | PASS | JSON do kit validado: 46 IDs únicos, 24 NAC e 22 EXT, todos os campos obrigatórios e proveniência. As duas programações PDF foram incluídas como fontes por página; nacionais sobrepostos mantidos uma vez. |
| G2 | BLOCKED | Interface React/Vite/TypeScript e testes de catálogo implementados. Último CI falhou no typecheck por regex de normalização de acentos; correção enviada, aguardando novo CI. Build final ainda não aprovado. |
| G3 | BLOCKED | Backend Apps Script, HTML Service, hash SHA-256, modelo B, LockService, idempotência e ranking agregado implementados no repositório. Planilha não criada e execução real do Apps Script ainda não testada. |
| G4 | BLOCKED_CONNECTED_VOTE | Nenhum teste público real com recibo e readback no Sheets. Nenhum voto de produção enviado. |
| G5 | BLOCKED_DEPLOY | PR #1 aberto e não integrado. GitHub Pages não publicado nem verificado. |
| G6 | NOT_RUN | Nenhum agente paralelo foi usado; revisão independente e teste em dispositivos reais continuam pendentes. |

## Repositório e revisão

- Repositório: https://github.com/vitoria-az/Avaliador-de-projetos
- Branch de implementação: `feat/universo-if-avalia-mvp`
- Pull request: https://github.com/vitoria-az/Avaliador-de-projetos/pull/1
- A branch `main` contém apenas o README inicial; os arquivos da aplicação estão na branch de feature e só aparecerão em `main` depois que o PR for revisado e integrado.
- Nenhum merge, deploy ou abertura pública de votação foi realizado.

## Decisões e limites

- O JSON canônico e os PDFs vieram no kit anexado nesta conversa. Os campos principais foram comparados nos 46 registros; nenhuma divergência de título, modalidade, área, data, horário, formato ou local foi encontrada.
- O catálogo guarda `fontes` em objetos com arquivo e página e identifica a conferência documental.
- Nenhum token de produção, código válido, planilha ou dado pessoal foi criado/publicado.
- A integração Google não foi feita por esta sessão; os passos estão em `docs/CONFIGURAR_GOOGLE.md`.
- O GitHub Actions anterior aprovado corresponde à versão antiga do branch; após alterações recentes, a execução mais recente falhou no typecheck. Não usar o CI antigo como evidência de aprovação desta revisão.
- Nenhum agente externo/paralelo ou QA independente foi simulado.

## Próximas ações necessárias

1. Corrigir e aprovar CI no branch.
2. Revisar e integrar o PR #1 à `main` com aprovação da equipe.
3. Configurar a planilha privada e Apps Script conforme `docs/CONFIGURAR_GOOGLE.md`.
4. Implantar Apps Script com acesso anônimo apenas se a política institucional permitir.
5. Configurar Pages → Source: GitHub Actions após integrar o PR.
6. Testar em janela anônima e telefone: ranking, envio, recibo, readback e bloqueio da repetição.
7. Fazer QA independente dos fluxos, dos PDFs e da responsividade.
