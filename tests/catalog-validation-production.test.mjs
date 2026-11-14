import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/domain.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  }
}).outputText;
const sandbox = { exports: {} };
vm.runInNewContext(compiled, sandbox);
const { validarCatalogo, calcularNota } = sandbox.exports;
const catalogo = JSON.parse(readFileSync(new URL('../src/catalogo.json', import.meta.url), 'utf8'));

function copiaCom(mutacao) {
  const dados = structuredClone(catalogo);
  mutacao(dados.projetos[0]);
  return dados;
}

test('validação de produção aceita o catálogo oficial completo', () => {
  assert.equal(validarCatalogo(catalogo).length, 46);
});

test('rejeita datas inexistentes, inclusive 29 de fevereiro em ano comum', () => {
  for (const data of ['2026-02-29', '2026-13-01', '2026-04-31', '0000-01-01', '2026/11/17']) {
    assert.throws(() => validarCatalogo(copiaCom((p) => { p.data = data; })), /Data inválida/);
  }
});

test('rejeita horários impossíveis e fim anterior ou igual ao início', () => {
  for (const [inicio, fim] of [['24:00', '25:00'], ['12:60', '13:00'], ['15:00', '14:59'], ['14:00', '14:00'], ['9:00', '10:00']]) {
    assert.throws(() => validarCatalogo(copiaCom((p) => { p.inicio = inicio; p.fim = fim; })), /Horário inválido/);
  }
});

test('rejeita modalidade fora do conjunto oficial', () => {
  assert.throws(() => validarCatalogo(copiaCom((p) => { p.modalidade = 'Outra'; })), /Modalidade inválida/);
});

test('rejeita fonte malformada e página não positiva', () => {
  for (const fonte of [null, {}, { arquivo: '  ', pagina: 1 }, { arquivo: 'origem.pdf', pagina: 0 }]) {
    assert.throws(() => validarCatalogo(copiaCom((p) => { p.fontes = [fonte]; })), /Proveniência inválida/);
  }
});

test('nota ponderada rejeita entrada que não seja vetor', () => {
  for (const notas of [null, '1234', {}, [1, 2, 3]]) {
    assert.throws(() => calcularNota(notas));
  }
});
