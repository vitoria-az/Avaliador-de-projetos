# Testes e QA

## CI verificado

GitHub Actions execução #2, commit 1681104b0f24d39ced2ede3d7f727c1d86db8f46: SUCCESS. Steps concluídos: npm install --package-lock-only, npm ci, npm run typecheck, npm test, npm run build e upload-pages-artifact. Job deploy foi SKIPPED porque o evento foi pull_request e o deploy só é permitido em main. [Execução](https://github.com/vitoria-az/Avaliador-de-projetos/actions/runs/43262484347).

O workflow gera package-lock.json temporário no runner. A equipe deve gerar e commitar package-lock.json revisado para reprodutibilidade local.

## Testes automatizados

5 testes Node passaram: cálculo ponderado [4,5,4,3] = 4,15; rejeição de notas ausentes/decimais/fora da faixa; busca sem acento; modelo B em simulação offline; desempate alfabético. node --check foi executado no Apps Script e no script do HTML Service.

## Pendências

- G1: validar 46 IDs, campos e PDFs; BLOQUEADO pela fonte ausente.
- G2: PASS para interface, domínio, testes e build no CI. Catálogo oficial ainda bloqueado pelo G1.
- G3: código Apps Script escrito e simulação offline da regra B aprovada; planilha e execução real do backend pendentes.
- G4: teste anônimo Pages, recibo e readback; não executado.
- G5: CI aprovado; publicação Pages pendente de aprovação/merge e configuração de Pages.
- G6: QA independente e testes em dispositivos reais; não realizados.

## Roteiro manual

1. Gere/commite package-lock.json e rode npm ci, npm run typecheck, npm test e npm run build.
2. Configure planilha privada, Apps Script, hashes sintéticos e implantação de teste.
3. Abra site em janela anônima no desktop e celular; carregue ranking e envie notas 4,5,4,3.
4. Confirme recibo e nota 4,15 no servidor. Confira a linha em Avaliacoes.
5. Mesmo token/projeto com novo request deve ser recusado; mesmo token/outro projeto deve ser aceito; mesmo request deve devolver o recibo original.
6. Duas requisições simultâneas do mesmo par devem gerar exatamente uma linha.
7. Conferir 320, 375, 768 e 1280 px, teclado, foco, contraste, alvos de toque e mensagens. QA independente deve revisar 10 projetos e testar em smartphone.
