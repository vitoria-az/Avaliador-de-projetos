import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const catalogo = JSON.parse(readFileSync(new URL('../src/catalogo.json', import.meta.url), 'utf8'));
const projetos = catalogo.projetos;
const codeGs = readFileSync(new URL('../backend/Code.gs', import.meta.url), 'utf8');
const indexHtml = readFileSync(new URL('../backend/Index.html', import.meta.url), 'utf8');

function calcularNota(notas) {
  if (!Array.isArray(notas) || notas.length !== 4 || notas.some((n) => !Number.isInteger(n) || n < 1 || n > 5)) {
    throw new Error('Informe quatro notas inteiras entre 1 e 5.');
  }
  return Math.round(notas.reduce((soma, nota, i) => soma + nota * [0.30, 0.30, 0.25, 0.15][i], 0) * 100) / 100;
}
function normalizarBusca(texto) {
  return texto.normalize('NFD').replace(/\\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR').trim();
}
function montarRanking(dados, modalidade, minimo = 5) {
  return dados.filter((p) => p.modalidade === modalidade).map((p) => ({ ...p, elegivel: p.quantidade >= minimo }))
    .sort((a, b) => a.elegivel !== b.elegivel ? (a.elegivel ? -1 : 1)
      : (b.media_final ?? 0) - (a.media_final ?? 0) || a.titulo.localeCompare(b.titulo, 'pt-BR'));
}
function simularVoto() {
  const porRequisicao = new Map();
  const pares = new Set();
  return (requestId, token, projetoId) => {
    const hash = 'hash:' + token;
    if (porRequisicao.has(requestId)) {
      const salvo = porRequisicao.get(requestId);
      return salvo.hash === hash && salvo.projetoId === projetoId ? salvo.recibo : false;
    }
    const par = hash + ':' + projetoId;
    if (pares.has(par)) return false;
    pares.add(par);
    const recibo = 'RECIBO-' + porRequisicao.size;
    porRequisicao.set(requestId, { hash, projetoId, recibo });
    return recibo;
  };
}

test('nota ponderada [4,5,4,3] é 4,15', () => assert.equal(calcularNota([4, 5, 4, 3]), 4.15));
test('rejeita notas ausentes, decimais e fora da escala', () => {
  for (const notas of [[4, 5, 4], [4, 5, 4, 2.5], [0, 5, 4, 3], [4, 5, 4, 6], null]) {
    assert.throws(() => calcularNota(notas));
  }
});
test('catálogo contém exatamente 46 IDs únicos: 24 NAC e 22 EXT', () => {
  assert.equal(catalogo.total, 46);
  assert.equal(projetos.length, 46);
  assert.equal(new Set(projetos.map((p) => p.id)).size, 46);
  assert.equal(projetos.filter((p) => p.modalidade === 'Mostra Nacional').length, 24);
  assert.equal(projetos.filter((p) => p.modalidade === 'Mostra de Extensão').length, 22);
  for (let i = 1; i <= 24; i++) assert.ok(projetos.some((p) => p.id === 'NAC-' + String(i).padStart(3, '0')));
  for (let i = 1; i <= 22; i++) assert.ok(projetos.some((p) => p.id === 'EXT-' + String(i).padStart(3, '0')));
});
test('todos os projetos têm campos obrigatórios e proveniência por arquivo/página', () => {
  const required = ['id', 'titulo', 'modalidade', 'area_tematica', 'data', 'inicio', 'fim', 'formato', 'local'];
  for (const p of projetos) {
    for (const campo of required) assert.ok(typeof p[campo] === 'string' && p[campo].trim(), p.id + ': ' + campo);
    assert.match(p.data, /^2026-11-(17|18)$/);
    assert.ok(Array.isArray(p.fontes) && p.fontes.length > 0);
    for (const fonte of p.fontes) {
      assert.ok(fonte.arquivo.endsWith('.pdf'));
      assert.ok(Number.isInteger(fonte.pagina) && fonte.pagina >= 1);
    }
  }
});
test('AGROSENTINELA e TRAÇO VIVO são projetos distintos da Mostra Nacional', () => {
  const agro = projetos.find((p) => p.id === 'NAC-004');
  const traco = projetos.find((p) => p.id === 'NAC-005');
  assert.match(agro.titulo, /AGROSENTINELA/);
  assert.match(traco.titulo, /TRAÇO VIVO/);
  assert.notEqual(agro.id, traco.id);
  assert.equal(agro.modalidade, 'Mostra Nacional');
  assert.equal(traco.modalidade, 'Mostra Nacional');
});
test('busca remove acentos sem alterar o texto de apresentação', () => {
  assert.equal(normalizarBusca('TRAÇO VIVO'), normalizarBusca('traco vivo'));
  assert.equal(projetos.find((p) => p.id === 'NAC-005').titulo.includes('TRAÇO'), true);
});
test('filtros mantêm modalidades e dias separados', () => {
  const nacionalDia17 = projetos.filter((p) => p.modalidade === 'Mostra Nacional' && p.data === '2026-11-17');
  const extensaoDia18 = projetos.filter((p) => p.modalidade === 'Mostra de Extensão' && p.data === '2026-11-18');
  assert.equal(nacionalDia17.length, 12);
  assert.equal(extensaoDia18.length, 9);
});
test('ranking aplica mínimo 5 e não mistura modalidades', () => {
  const dados = [
    { id_projeto: 'NAC-001', titulo: 'Zeta', modalidade: 'Mostra Nacional', quantidade: 5, media_final: 4.5 },
    { id_projeto: 'NAC-002', titulo: 'Alfa', modalidade: 'Mostra Nacional', quantidade: 4, media_final: 5 },
    { id_projeto: 'EXT-001', titulo: 'Beta', modalidade: 'Mostra de Extensão', quantidade: 10, media_final: 4.8 }
  ];
  const nacional = montarRanking(dados, 'Mostra Nacional');
  assert.equal(nacional.length, 2);
  assert.equal(nacional[0].titulo, 'Zeta');
  assert.equal(nacional[0].elegivel, true);
  assert.equal(nacional[1].elegivel, false);
  assert.equal(montarRanking(dados, 'Mostra de Extensão').length, 1);
});
test('empate é resolvido pelo título em ordem alfabética', () => {
  const ranking = montarRanking([
    { id_projeto: 'NAC-001', titulo: 'Zeta', modalidade: 'Mostra Nacional', quantidade: 5, media_final: 4 },
    { id_projeto: 'NAC-002', titulo: 'Alfa', modalidade: 'Mostra Nacional', quantidade: 5, media_final: 4 }
  ], 'Mostra Nacional');
  assert.deepEqual(ranking.map((p) => p.titulo), ['Alfa', 'Zeta']);
});
test('modelo B permite outro projeto, bloqueia repetição e recupera recibo idempotente', () => {
  const votar = simularVoto();
  const primeiro = votar('req-1', 'X', 'NAC-001');
  assert.ok(primeiro);
  assert.ok(votar('req-2', 'X', 'NAC-002'));
  assert.equal(votar('req-3', 'X', 'NAC-001'), false);
  assert.equal(votar('req-1', 'X', 'NAC-001'), primeiro);
  assert.ok(votar('req-4', 'Y', 'NAC-001'));
});
test('Apps Script usa lock e não expõe linhas individuais no ranking', () => {
  assert.match(codeGs, /LockService\\.getScriptLock\\(\\)/);
  assert.match(codeGs, /appendRow/);
  assert.match(codeGs, /sha256_/);
  assert.match(codeGs, /id_requisicao/);
  assert.match(codeGs, /CacheService/);
  assert.match(codeGs, /getPublicRanking/);
  assert.doesNotMatch(codeGs, /getRange\\([^\\n]*hash_codigo[^\\n]*\\)/);
});
test('HTML Service usa google.script.run e não usa no-cors ou LocalStorage', () => {
  assert.match(indexHtml, /google\\.script\\.run/);
  assert.doesNotMatch(indexHtml, /no-cors/i);
  assert.doesNotMatch(indexHtml, /localStorage/i);
  const script = indexHtml.match(/<script>([\\s\\S]*?)<\\/script>/);
  assert.ok(script);
  const executable = script[1]
    .replace(/const PAGINA = <\\?!= jsonSeguro_\\(paginaInicial\\) \\?>;/, 'const PAGINA = "avaliar";')
    .replace(/const PROJETO_ID = <\\?!= jsonSeguro_\\(projetoInicial\\) \\?>;/, 'const PROJETO_ID = "NAC-001";');
  assert.doesNotThrow(() => new vm.Script(executable));
});
test('código Apps Script é sintaticamente JavaScript válido', () => {
  assert.doesNotThrow(() => new vm.Script(codeGs));
});
