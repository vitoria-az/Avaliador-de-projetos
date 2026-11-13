# Configurar Google Sheets e Apps Script

A integração de Google Drive/Sheets não está conectada a esta sessão. A equipe deve criar e administrar os recursos na própria conta Google. **Não é necessário pedir login ao público visitante.**

## 1. Criar a planilha privada

1. Crie uma planilha em [Google Sheets](https://sheets.google.com).
2. Mantenha o compartilhamento restrito à equipe responsável.
3. Copie o ID entre `/d/` e `/edit` na URL. Não coloque esse ID em arquivos públicos.
4. Abra **Extensões → Apps Script**.

## 2. Criar o projeto Apps Script

1. Cole o conteúdo de `backend/Code.gs` no arquivo `Code.gs`.
2. Crie um arquivo HTML chamado exatamente `Index` e cole `backend/Index.html`.
3. Em **Configurações do projeto → Propriedades do script**, adicione:
   - `SPREADSHEET_ID`: ID privado da planilha.
   - `CATALOGO_URL`: URL raw do JSON versionado. Enquanto a implementação estiver na branch de feature, use `https://raw.githubusercontent.com/vitoria-az/Avaliador-de-projetos/feat/universo-if-avalia-mvp/src/catalogo.json`. Depois de integrar o PR à `main`, altere para a mesma URL com `main` no lugar da branch.
4. Salve e execute `setupSheets()`. Autorize o acesso do Apps Script à planilha. Serão criadas as abas `Projetos`, `Codigos`, `Avaliacoes` e `Configuracao`.
5. Execute `importarProjetos()`. A função baixa e valida os 46 projetos do JSON público. Se a aba Projetos já tiver linhas, faça backup e esvazie apenas essa aba antes de reimportar; o script não sobrescreve dados existentes por segurança.

## 3. Preparar códigos de participação

- Gere códigos aleatórios com ao menos 128 bits de entropia (por exemplo, 32 caracteres base64url gerados por fonte criptograficamente segura). Não use números sequenciais nem códigos fáceis de adivinhar.
- Cadastre cada código chamando `cadastrarCodigo(token)) no editor Apps Script. Para passar o argumento, crie temporariamente uma função auxiliar privada na sua cópia do script, chame `cadastrarCodigo('TOKEN_ALEATORIO')`, execute-a uma vez e remova a auxiliar logo depois. Nunca inclua o token real em commits, prints, Issues ou logs compartilhados. A planilha recebe apenas o SHA-256.
- Distribua cada token por canal apropriado sob controle da organização. O token é um código ao portador, não prova que uma pessoa específica votou.
- A função `cadastrarCodigo` retorna confirmação sem devolver o token. Não publique a aba `Codigos`.

## 4. Testar antes de abrir

1. Mantenha `Configuracao.votacao_aberta = FALSE`.
2. Crie primeiro um token sintético, apenas para teste interno.
3. Confira que token inválido, código desabilitado, projeto inexistente, notas incompletas/decimais e votação fechada são recusados.
4. Faça uma avaliação teste. O servidor deve retornar um recibo somente após gravar e executar `SpreadsheetApp.flush()`.
5. Reenvie a mesma requisição: deve receber o mesmo recibo, sem nova linha.
6. Use o mesmo código em outro projeto: deve aceitar. Repita o primeiro projeto com outro ID de requisição: deve recusar.
7. Faça duas requisições simultâneas do mesmo par código/projeto: exatamente uma linha deve ser gravada.
8. Confira a linha na aba privada `Avaliacoes`. Nunca compartilhe essa aba.

O servidor recalcula a nota ponderada, confere o código em cada envio e usa `LockService.getScriptLock()` como seção crítica. A unicidade é por `(hash_codigo, id_projeto)`, não por IP/dispositivo. O ID de requisição é idempotente. Há controle de taxa sem registrar IP, MAC ou fingerprint.

## 5. Implantar o Web App sem login de visitante

1. No Apps Script, clique em **Implantar → Nova implantação → Aplicativo da Web**.
2. Escolha **Executar como: proprietário que implantou**.
3. A opção **Quem pode acessar: Qualquer pessoa, inclusive anônima** só deve ser escolhida se estiver disponível e permitida pela política da conta/instituição. O proprietário autoriza a planilha; visitantes não fazem login.
4. Se acesso anônimo estiver indisponível, não tente contornar a política. Registre `BLOQUEADO_ACESSO_PUBLICO` e mantenha a demonstração local/manual.
5. Copie a URL terminada em `/exec` e configure-a como variável de repositório `VITE_APPS_SCRIPT_URL`. O workflow a injeta no build do Pages. A URL é pública, mas não inclui ID da planilha nem tokens.

As telas de avaliação e ranking abrem no próprio HTML Service e conversam com o servidor por `google.script.run`. Isso evita depender do CORS do ContentService em chamadas feitas pelo GitHub Pages. Não use `mode: 'no-cors'` para simular confirmação e não habilite `XFrameOptionsMode.ALLOWALL` sem análise específica de clickjacking.

## 6. Dados e privacidade

- `Projetos`: metadados públicos dos 46 registros e fontes.
- `Codigos`: somente hash do token, habilitação e metadados técnicos mínimos.
- `Avaliacoes`: ID de requisição, recibo, hash, projeto, quatro notas, nota final, data e estado válido.
- `Configuracao`: status da avaliação, mínimo do ranking e versão do catálogo.

O ranking público lê os votos válidos e devolve apenas agregados por projeto: média final, médias por critério, quantidade e última atualização. Não expõe hashes, recibos, códigos ou linhas individuais. Cache de ranking: 30 segundos; uma avaliação confirmada invalida o cache.
