# Testes e QA

## Testes automatizados versionados

O conjunto `tests/domain.test.mjs` cobre:

1. Cálculo ponderado de [4, 5, 4, 3] = 4,15.
2. Rejeição de notas ausentes, decimais e fora da faixa de 1–5.
3. 46 IDs únicos e contagens 24 NAC + 22 EXT.
4. Campos obrigatórios e fonte/página em todos os registros.
5. AGROSENTINELA (NAC-004) e TRAÇO VIVO (NAC-005) como registros separados.
6. Busca sem acentos sem alterar os títulos originais.
7. Distribuição por modalidade e dia.
8. Ranking separado e amostra mínima de cinco.
9. Desempate alfabético determinístico.
10. Modelo B: mesmo código em dois projetos; repetição do mesmo par; reuso idempotente de recibo.
11. Presença de LockService, hash, cache e persistência no Apps Script.
12. Uso de `google.script.run`, sem `no-cors` ou LocalStorage.
13. Sintaxe JavaScript do backend e do script HTML.

O script `npm run catalog:check` também valida o JSON versionado.

## CI remoto

A versão anterior do workflow havia sido aprovada, mas não é a versão atual. A execução mais recente após a inclusão do catálogo falhou em `npm run typecheck`, por incompatibilidade do parser TypeScript com a regex de acentos. A regex foi corrigida no branch; o próximo CI deverá confirmar a correção. **Não marque G2 como PASS até o novo run terminar com sucesso em typecheck, testes e build.**

O workflow ainda cria um lockfile temporário no runner para permitir `npm ci`. A equipe deve gerar e versionar um `package-lock.json` revisado para builds locais reproduzíveis.

## Testes manuais obrigatórios de integração

1. Em janela anônima, abrir o Pages e navegar por Projetos; testar busca sem acentos, modalidade, dia e área.
2. Abrir detalhes de um projeto e usar “Avaliar este projeto”.
3. No HTML Service, enviar notas 4, 5, 4, 3 com um token sintético. Esperado: 4,15 e recibo fornecido pelo servidor.
4. Verificar o recibo e a linha correspondente na aba privada `Avaliacoes`.
5. Repetir o mesmo `id_requisicao`: o servidor deve devolver o recibo original sem criar nova linha.
6. Usar o mesmo token em outro projeto: aceito.
7. Tentar o mesmo token no mesmo projeto com outro ID: recusado.
8. Disparar duas chamadas simultâneas do mesmo par: uma única linha deve existir.
9. Código não cadastrado/desabilitado, votação fechada, projeto inexistente e notas inválidas devem ser recusados.
10. Abrir Ranking; alternar modalidades; conferir média final e médias por critério; projetos com menos de cinco votos não podem receber posição.

## Matriz de responsividade e acessibilidade

A equipe deve testar nos viewports 320, 375, 768 e 1280 px; teclado e foco visível; rótulos associados; contraste; textos e botões sem overflow; alvos de toque. Testar Chrome Android e Safari iOS quando disponíveis. Este relatório não afirma validação WCAG 2.2 AA ou QA presencial, pois esses testes ainda não foram executados.

## Resultado

- Catálogo: PASS local/CI pendente da execução atual.
- Domínio e regras offline: cobertos pelos testes.
- Apps Script e Sheets ao vivo: NOT_RUN.
- Pages público e fluxo de voto anônimo: NOT_RUN.
- QA independente e dispositivos reais: NOT_RUN.
