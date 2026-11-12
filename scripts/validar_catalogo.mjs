import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const caminho = new URL('../src/catalogo.json', import.meta.url);
const catalogo = JSON.parse(readFileSync(caminho, 'utf8'));
assert.equal(catalogo.total, 46, 'total declarado deve ser 46');
assert.equal(catalogo.projetos.length, 46, 'devem existir 46 projetos');
const ids = new Set();
for (const projeto of catalogo.projetos) {
  assert.ok(projeto.id && projeto.titulo, 'ID e título são obrigatórios');
  assert.ok(!ids.has(projeto.id), 'ID duplicado: ' + projeto.id);
  ids.add(projeto.id);
  for (const campo of ['modalidade','area_tematica','data','inicio','fim','formato','local']) {
    assert.ok(typeof projeto[campo] === 'string' && projeto[campo].trim(), projeto.id + ': campo ausente ' + campo);
  }
  assert.ok(Array.isArray(projeto.fontes) && projeto.fontes.length > 0, projeto.id + ': fonte ausente');
  projeto.fontes.forEach((fonte) => {
    assert.ok(fonte.arquivo.endsWith('.pdf'));
    assert.ok(Number.isInteger(fonte.pagina) && fonte.pagina > 0);
  });
}
assert.equal(catalogo.projetos.filter((p) => p.modalidade === 'Mostra Nacional').length, 24);
assert.equal(catalogo.projetos.filter((p) => p.modalidade === 'Mostra de Extensão').length, 22);
console.log('PASS: 46 projetos únicos, 24 NAC, 22 EXT, campos obrigatórios e proveniência válidos.');
