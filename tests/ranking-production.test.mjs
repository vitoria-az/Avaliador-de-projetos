import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Executa a implementação real de src/domain.ts, em vez de testar uma cópia
// simplificada da regra de ranking dentro do próprio teste.
const source = readFileSync(new URL('../src/domain.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  }
}).outputText;
const sandbox = { exports: {} };
vm.runInNewContext(compiled, sandbox);
const { montarRanking } = sandbox.exports;

const projetos = [
  { id: 'NAC-001', titulo: 'Zeta', modalidade: 'Mostra Nacional' },
  { id: 'NAC-002', titulo: 'Alfa', modalidade: 'Mostra Nacional' },
  { id: 'NAC-003', titulo: 'Beta', modalidade: 'Mostra Nacional' },
  { id: 'EXT-001', titulo: 'Gama', modalidade: 'Mostra de Extensão' }
];

test('implementação real separa Nacional e Extensão e exige cinco avaliações', () => {
  const dados = [
    { id_projeto: 'NAC-001', modalidade: 'Mostra Nacional', quantidade: 5, media_final: 4.7 },
    { id_projeto: 'NAC-002', modalidade: 'Mostra Nacional', quantidade: 4, media_final: 5.0 },
    { id_projeto: 'NAC-003', modalidade: 'Mostra Nacional', quantidade: 5, media_final: 4.2 },
    { id_projeto: 'EXT-001', modalidade: 'Mostra de Extensão', quantidade: 8, media_final: 4.9 }
  ];

  const nacional = montarRanking(projetos, dados, 'Mostra Nacional');
  const extensao = montarRanking(projetos, dados, 'Mostra de Extensão');

  assert.deepEqual(Array.from(nacional, (item) => item.projeto.id), ['NAC-001', 'NAC-003', 'NAC-002']);
  assert.deepEqual(Array.from(extensao, (item) => item.projeto.id), ['EXT-001']);
  assert.equal(nacional[0].posicao, 1);
  assert.equal(nacional[1].posicao, 2);
  assert.equal(nacional[2].elegivel, false);
  assert.equal(nacional[2].posicao, null);
});

test('implementação real desempata por título e depois por ID', () => {
  const projetosEmpatados = [
    { id: 'NAC-009', titulo: 'Projeto Igual', modalidade: 'Mostra Nacional' },
    { id: 'NAC-003', titulo: 'Projeto Igual', modalidade: 'Mostra Nacional' },
    { id: 'NAC-001', titulo: 'Outro Projeto', modalidade: 'Mostra Nacional' }
  ];
  const dados = projetosEmpatados.map((projeto) => ({
    id_projeto: projeto.id,
    modalidade: 'Mostra Nacional',
    quantidade: 5,
    media_final: 4.5
  }));

  const resultado = montarRanking(projetosEmpatados, dados, 'Mostra Nacional');
  assert.deepEqual(Array.from(resultado, (item) => item.projeto.id), [
    'NAC-001', 'NAC-003', 'NAC-009'
  ]);
});

test('projeto sem agregado permanece sem posição', () => {
  const resultado = montarRanking(projetos, [], 'Mostra Nacional');
  assert.equal(resultado.length, 3);
  assert.ok(resultado.every((item) => !item.elegivel && item.posicao === null));
});
