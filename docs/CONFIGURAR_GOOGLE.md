# Configurar Google Sheets e Apps Script

A integração Google Drive/Sheets está desabilitada por política administrativa no ChatGPT. A equipe deve executar esta etapa em sua própria conta.

1. Crie uma planilha privada em https://sheets.google.com. Copie o ID da URL.
2. Em Extensões → Apps Script, cole backend/Code.gs no editor e crie o HTML Index com backend/Index.html.
3. Em Configurações do projeto → Propriedades do script, adicione SPREADSHEET_ID com o ID. Não publique esse ID.
4. Execute setupSheets() e autorize. Serão criadas Projetos, Codigos, Avaliacoes e Configuracao.
5. Preencha Projetos com os 46 registros oficiais e Codigos com hashes gerados por hashTokenParaCadastro(token). Use tokens aleatórios com pelo menos 128 bits. Guarde tokens brutos separadamente e nunca no GitHub.
6. Mantenha votacao_aberta como FALSE até aprovação. Para teste, use tokens sintéticos e projetos oficiais.
7. Implante como Aplicativo da Web. Se permitido pela política institucional, escolha Executar como proprietário e acesso Qualquer pessoa, inclusive anônima. Não contorne bloqueios; marque BLOQUEADO_ACESSO_PUBLICO quando necessário.
8. O HTML Service usa google.script.run e é o fallback se Pages → Apps Script falhar por CORS/redirecionamento. ContentService não oferece CORS convencional automaticamente. Não use no-cors para fingir confirmação.

A seção crítica usa LockService.getScriptLock(); a unicidade é por (hash_codigo,id_projeto). Retentativa idempotente retorna o mesmo recibo. A API pública de ranking retorna apenas agregados, nunca linhas individuais. A latência é a leitura da planilha no momento da chamada, sem cache nesta versão.

Antes de abrir votação real, testar: código inválido; projeto inválido; votação fechada; mesmo código em projetos diferentes; repetição do par; repetição de id_requisicao; duas chamadas simultâneas; recibo e readback na planilha privada.
