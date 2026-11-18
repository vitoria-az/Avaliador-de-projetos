# Homologação isolada — Universo IF Avalia

## Objetivo e isolamento

A homologação usa uma cópia da planilha criada pela equipe e um projeto de Apps Script separado. A planilha de produção nunca deve ser usada nos testes.

- Repositório: `vitoria-az/Avaliador-de-projetos`
- Branch de trabalho: `test/homologacao-planilha-isolada`
- Planilha de homologação: a cópia identificada pela equipe no Google Sheets (não registrar seu ID neste repositório).
- Planilha de produção: permanece privada, intocada e fora desta configuração.
- Catálogo: JSON versionado em `src/catalogo.json`; não cadastrar projetos fictícios.

**Regra de segurança:** o valor de `SPREADSHEET_ID` do Apps Script de homologação deve ser exclusivamente o ID da cópia de teste. Nunca registrar IDs, tokens, hashes, URLs privadas de implantação ou credenciais em commits, Issues, prints ou logs.

## Estado conhecido da cópia

Na conferência inicial, a cópia tinha as abas `Projetos`, `Codigos`, `Avaliacoes` e `Configuracao`. As três primeiras continham somente cabeçalhos. A configuração estava com `votacao_aberta = FALSE`, `minimo_ranking = 5` e `versao_catalogo = 1.0`.

## Preparação do Apps Script de homologação

1. Abra **a cópia** da planilha no Google Planilhas.
2. Abra **Extensões → Apps Script**. Isso cria/abre o projeto de script vinculado à cópia; não reutilize o projeto de script de produção.
3. No editor, copie o conteúdo de `backend/Code.gs` desta branch para `Code.gs`.
4. Crie/atualize o arquivo HTML chamado exatamente `Index` com o conteúdo de `backend/Index.html`.
5. Em **Configurações do projeto → Propriedades do script**, configure:
   - `SPREADSHEET_ID`: somente o ID da planilha de homologação.
   - `CATALOGO_URL`: `https://raw.githubusercontent.com/vitoria-az/Avaliador-de-projetos/main/src/catalogo.json`
6. Salve e execute `setupSheets()`. Autorize o acesso. A função verifica/cria as quatro abas e adiciona configurações ausentes; não apaga linhas existentes.
7. Confirme que `Configuracao.votacao_aberta` continua `FALSE`.
8. Como a aba `Projetos` da cópia está vazia, execute `importarProjetos()`. O código valida exatamente 46 projetos (24 Mostra Nacional e 22 Mostra de Extensão) e recusa importar se já houver linhas de dados.
9. Confira que a aba `Projetos` ficou com 46 registros, IDs únicos, e que as outras abas continuam sem dados reais.

Se `Projetos` já tiver linhas de dados, **não execute novamente** `importarProjetos()`; faça backup e investigue antes. Não apague dados automaticamente.

## Testes seguros

1. Gere um token sintético e exclusivo para homologação, com pelo menos 32 caracteres aleatórios compatíveis com base64url. Nunca use ou copie um token de produção.
2. Cadastre o token apenas no Apps Script de homologação com `cadastrarCodigo(token)`. Não coloque o token em arquivos do GitHub, Issues, mensagens ou capturas de tela.
3. Mantenha `votacao_aberta = FALSE` enquanto prepara a implantação. Para executar o teste ponta a ponta, altere para `TRUE` somente na cópia de homologação, durante a janela de teste, e volte para `FALSE` ao terminar.
4. Faça os testes de rejeição: código inválido/desabilitado, projeto inexistente, notas incompletas ou decimais e votação fechada.
5. Com a votação de teste aberta, envie uma avaliação sintética válida. Confirme que o recibo só aparece depois da gravação.
6. Reenvie a mesma requisição: deve retornar o mesmo recibo sem duplicar linha. Tente o mesmo código no mesmo projeto com outro ID de requisição: deve recusar. Use o mesmo código em outro projeto: deve aceitar.
7. Faça duas requisições simultâneas do mesmo par código/projeto: deve existir exatamente uma linha.
8. Confira a gravação somente na aba privada `Avaliacoes`; não publique essa aba.
9. Feche a votação de homologação (`FALSE`) e invalide/desabilite os tokens sintéticos ao concluir.

## Implantação e separação do frontend

- Implante o Web App do Apps Script de homologação separadamente, usando a cópia de teste como planilha vinculada.
- Guarde a URL `/exec` da implantação de teste somente em configuração local/segredo apropriado; nunca faça commit dela.
- Para testar a interface, use ambiente local ou uma prévia isolada configurada com a URL do Web App de homologação. Não altere a variável de produção `VITE_APPS_SCRIPT_URL` nem publique a branch de teste em produção.
- A branch `main` e o GitHub Pages de produção não devem ser alterados para executar esta homologação.

## Critérios de aprovação

- [ ] O Apps Script de homologação aponta exclusivamente para a cópia de teste.
- [ ] O catálogo contém 46 projetos (24 NAC + 22 EXT), sem IDs duplicados.
- [ ] A votação fica fechada fora da janela controlada de teste.
- [ ] Os testes de validação, recibo, idempotência e concorrência passam.
- [ ] A gravação aparece somente na cópia de homologação.
- [ ] Não há tokens, IDs privados ou URLs privadas commitados.
- [ ] A planilha original e a implantação de produção não foram modificadas.

**Importante:** criar a branch e documentar o procedimento não concede acesso à conta Google. A equipe precisa autorizar o Apps Script na própria conta e manter as propriedades privadas.
