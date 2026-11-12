# Testes e QA

## Testes automatizados

npm test cobre cálculo ponderado [4,5,4,3] = 4,15, rejeição de notas ausentes/decimais/fora da faixa, busca sem acento, modelo B em simulação offline e desempate alfabético. node --check foi executado no Apps Script. O build TypeScript/Vite não pôde ser executado: o ambiente não resolveu registry.npmjs.org e não instalou dependências.

## Pendências

- G1: validar 46 IDs, campos e PDFs; BLOQUEADO pela fonte ausente.
- G2: tipos e build Vite; bloqueados pela instalação de dependências.
- G3: executar backend em Sheets e testar concorrência; código escrito, não executado na conta da equipe.
- G4: teste anônimo Pages, recibo e readback; não executado.
- G5: GitHub Actions e Pages; não publicados.
- G6: QA independente e testes em dispositivos reais; não realizados.

## Roteiro manual

1. npm ci && npm run typecheck && npm test && npm run build.
2. Configure planilha privada, Apps Script, hashes sintéticos e implantação de teste.
3. Abra site em janela anônima no desktop e celular; carregue ranking e envie notas 4,5,4,3.
4. Confirme recibo e nota 4,15 no servidor. Confira a linha em Avaliacoes.
5. Mesmo token/projeto com novo request deve ser recusado; mesmo token/outro projeto deve ser aceito; mesmo request deve devolver o recibo original.
6. Duas requisições simultâneas do mesmo par devem gerar exatamente uma linha.
7. Conferir 320, 375, 768 e 1280 px, teclado, foco, contraste, alvos de toque e mensagens. QA independente deve revisar 10 projetos e testar em smartphone.
