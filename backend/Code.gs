const ABAS = { projetos: 'Projetos', codigos: 'Codigos', avaliacoes: 'Avaliacoes', configuracao: 'Configuracao' };
const CABECALHOS = {
  Projetos: ['id', 'titulo', 'modalidade', 'area_tematica', 'data', 'inicio', 'fim', 'formato', 'local', 'fontes'],
  Codigos: ['hash_codigo', 'habilitado', 'criado_em', 'observacao'],
  Avaliacoes: ['id_requisicao', 'recibo', 'hash_codigo', 'id_projeto', 'c1', 'c2', 'c3', 'c4', 'nota_final', 'timestamp', 'estado'],
  Configuracao: ['chave', 'valor']
};
const PESOS = [0.30, 0.30, 0.25, 0.15];

function planilha_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('Propriedade SPREADSHEET_ID não configurada.');
  return SpreadsheetApp.openById(id);
}

function setupSheets_() {
  const ss = planilha_();
  Object.keys(ABAS).forEach((chave) => {
    const nome = ABAS[chave];
    let sheet = ss.getSheetByName(nome);
    if (!sheet) sheet = ss.insertSheet(nome);
    if (sheet.getLastRow() === 0) sheet.appendRow(CABECALHOS[nome]);
  });
  const configuracao = ss.getSheetByName(ABAS.configuracao);
  const existentes = configuracao.getLastRow() > 1
    ? configuracao.getRange(2, 1, configuracao.getLastRow() - 1, 1).getValues().flat()
    : [];
  [['votacao_aberta', 'FALSE'], ['minimo_ranking', '5'], ['versao_catalogo', '1.0']]
    .forEach((linha) => { if (!existentes.includes(linha[0])) configuracao.appendRow(linha); });
  return 'Abas e configurações básicas verificadas.';
}

function importarProjetos_() {
  const props = PropertiesService.getScriptProperties();
  const url = props.getProperty('CATALOGO_URL');
  if (!url || !/^https:\/\/raw\.githubusercontent\.com\/vitoria-az\/Avaliador-de-projetos\//.test(url)) {
    throw new Error('Configure CATALOGO_URL com o JSON público do repositório da equipe.');
  }
  const ss = planilha_();
  const sheet = ss.getSheetByName(ABAS.projetos);
  if (!sheet || sheet.getLastRow() < 1) throw new Error('Execute setupSheets_() primeiro.');
  if (sheet.getLastRow() > 1) throw new Error('A aba Projetos já contém dados. Faça backup antes de substituir.');
  const resposta = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (resposta.getResponseCode() !== 200) throw new Error('Não foi possível ler o catálogo público (HTTP ' + resposta.getResponseCode() + ').');
  const catalogo = JSON.parse(resposta.getContentText('UTF-8'));
  const projetos = catalogo.projetos;
  if (!Array.isArray(projetos) || projetos.length !== 46 ||
      projetos.filter((p) => p.modalidade === 'Mostra Nacional').length !== 24 ||
      projetos.filter((p) => p.modalidade === 'Mostra de Extensão').length !== 22) {
    throw new Error('Catálogo incompatível. Esperados 46 projetos (24 NAC + 22 EXT).');
  }
  const ids = new Set();
  const linhas = projetos.map((p) => {
    if (!p.id || !p.titulo || ids.has(p.id) || !Array.isArray(p.fontes) || !p.fontes.length) {
      throw new Error('Registro inválido ou ID duplicado: ' + String(p.id || 'sem ID'));
    }
    ids.add(p.id);
    return [p.id, p.titulo, p.modalidade, p.area_tematica, p.data, p.inicio, p.fim, p.formato, p.local, JSON.stringify(p.fontes)];
  });
  sheet.getRange(2, 1, linhas.length, CABECALHOS.Projetos.length).setValues(linhas);
  const config = ss.getSheetByName(ABAS.configuracao);
  const rows = config.getDataRange().getValues();
  const i = rows.findIndex((r) => r[0] === 'versao_catalogo');
  if (i > 0) config.getRange(i + 1, 2).setValue(catalogo.schema || '1.0');
  return 'Importados ' + linhas.length + ' projetos.';
}

function sha256_(texto) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, texto, Utilities.Charset.UTF_8)
    .map((byte) => (byte < 0 ? byte + 256 : byte).toString(16).padStart(2, '0')).join('');
}

function hashTokenParaCadastro_(token) {
  const valor = String(token || '').trim();
  if (!/^[A-Za-z0-9_-]{32,128}$/.test(valor)) {
    throw new Error('Use um código aleatório base64url com pelo menos 32 caracteres.');
  }
  return sha256_(valor);
}

function configuracao_() {
  const values = planilha_().getSheetByName(ABAS.configuracao).getDataRange().getValues();
  return Object.fromEntries(values.slice(1).filter((row) => row[0]).map((row) => [String(row[0]), String(row[1])]));
}

function jsonSeguro_(valor) {
  return JSON.stringify(String(valor == null ? '' : valor))
    .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

function doGet(e) {
  const pagina = e && e.parameter && e.parameter.page === 'ranking' ? 'ranking' : 'avaliar';
  const projetoId = e && e.parameter ? String(e.parameter.id || '') : '';
  const template = HtmlService.createTemplateFromFile('Index');
  template.paginaInicial = pagina;
  template.projetoInicial = projetoId;
  return template.evaluate()
    .setTitle('Universo IF Avalia')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getProjetoPublico(id) {
  const rows = planilha_().getSheetByName(ABAS.projetos).getDataRange().getValues();
  const row = rows.slice(1).find((item) => String(item[0]) === String(id));
  if (!row) return null;
  return {
    id: String(row[0]), titulo: String(row[1]), modalidade: String(row[2]),
    area_tematica: String(row[3]), data: String(row[4]), inicio: String(row[5]),
    fim: String(row[6]), formato: String(row[7]), local: String(row[8])
  };
}

function limitarTaxa_(hash) {
  const cache = CacheService.getScriptCache();
  const agora = Number(cache.get('limite_global') || 0);
  if (agora >= 600) throw new Error('Muitas solicitações neste momento. Aguarde um minuto e tente novamente.');
  cache.put('limite_global', String(agora + 1), 60);
  const chave = 'limite_' + hash;
  const tentativas = Number(cache.get(chave) || 0);
  if (tentativas >= 30) throw new Error('Limite de tentativas deste código atingido. Aguarde alguns minutos.');
  cache.put(chave, String(tentativas + 1), 600);
}

function submitVote(payload) {
  const p = payload || {};
  const requestId = String(p.id_requisicao || '');
  const token = String(p.codigo || '').trim();
  const projetoId = String(p.id_projeto || '');
  const notas = p.notas;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
    throw new Error('Identificador de solicitação inválido.');
  }
  if (!/^[A-Za-z0-9_-]{32,128}$/.test(token)) throw new Error('Código de participação inválido.');
  if (!/^((NAC-0(0[1-9]|1[0-9]|2[0-4]))|(EXT-0(0[1-9]|1[0-9]|2[0-2])))$/.test(projetoId)) {
    throw new Error('ID de projeto inválido.');
  }
  if (!Array.isArray(notas) || notas.length !== 4 || notas.some((n) => !Number.isInteger(n) || n < 1 || n > 5)) {
    throw new Error('Informe quatro notas inteiras entre 1 e 5.');
  }
  const hash = sha256_(token);
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const ss = planilha_();
    const sheetProjetos = ss.getSheetByName(ABAS.projetos);
    const sheetCodigos = ss.getSheetByName(ABAS.codigos);
    const sheetAvaliacoes = ss.getSheetByName(ABAS.avaliacoes);
    const votos = sheetAvaliacoes.getDataRange().getValues().slice(1);

    const mesmaRequisicao = votos.find((row) => String(row[0]) === requestId);
    if (mesmaRequisicao) {
      if (String(mesmaRequisicao[2]) === hash && String(mesmaRequisicao[3]) === projetoId) {
        return { ok: true, recibo: String(mesmaRequisicao[1]), repetido: true };
      }
      throw new Error('Este identificador de solicitação já foi utilizado.');
    }

    limitarTaxa_(hash);
    const config = configuracao_();
    if (config.votacao_aberta !== 'TRUE') throw new Error('A avaliação está fechada no momento.');
    const projetoExiste = sheetProjetos.getDataRange().getValues().slice(1)
      .some((row) => String(row[0]) === projetoId);
    if (!projetoExiste) throw new Error('Projeto não encontrado no catálogo.');
    const codigoAtivo = sheetCodigos.getDataRange().getValues().slice(1)
      .some((row) => String(row[0]) === hash && String(row[1]).toUpperCase() === 'TRUE');
    if (!codigoAtivo) throw new Error('Código não autorizado ou desabilitado.');
    const duplicado = votos.some((row) => String(row[2]) === hash && String(row[3]) === projetoId);
    if (duplicado) throw new Error('Este código já avaliou este projeto.');
    const notaFinal = Math.round(notas.reduce((soma, n, i) => soma + n * PESOS[i], 0) * 100) / 100;
    const recibo = 'UIA-' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
    sheetAvaliacoes.appendRow([requestId, recibo, hash, projetoId, notas[0], notas[1], notas[2], notas[3], notaFinal, new Date(), 'VALIDO']);
    SpreadsheetApp.flush();
    CacheService.getScriptCache().remove('ranking_publico_v1');
    return { ok: true, recibo: recibo, repetido: false, nota_final: notaFinal };
  } finally {
    lock.releaseLock();
  }
}

function getPublicRanking() {
  const cache = CacheService.getScriptCache();
  const salvo = cache.get('ranking_publico_v1');
  if (salvo) return JSON.parse(salvo);
  const ss = planilha_();
  const config = configuracao_();
  const minimo = Math.max(1, Number(config.minimo_ranking) || 5);
  const projetos = ss.getSheetByName(ABAS.projetos).getDataRange().getValues().slice(1).filter((row) => row[0]);
  const votos = ss.getSheetByName(ABAS.avaliacoes).getDataRange().getValues().slice(1).filter((row) => row[10] === 'VALIDO');
  const agregados = {};
  votos.forEach((row) => {
    const id = String(row[3]);
    if (!agregados[id]) agregados[id] = { quantidade: 0, soma: 0, criterios: [0, 0, 0, 0], atualizado: null };
    const item = agregados[id];
    item.quantidade += 1;
    item.soma += Number(row[8]);
    for (let i = 0; i < 4; i += 1) item.criterios[i] += Number(row[4 + i]);
    const timestamp = new Date(row[9]);
    if (!item.atualizado || timestamp > item.atualizado) item.atualizado = timestamp;
  });
  const dados = projetos.map((row) => {
    const item = agregados[String(row[0])] || { quantidade: 0, soma: 0, criterios: [0, 0, 0, 0], atualizado: null };
    return {
      id_projeto: String(row[0]), titulo: String(row[1]), modalidade: String(row[2]),
      quantidade: item.quantidade,
      media_final: item.quantidade ? Math.round(item.soma / item.quantidade * 100) / 100 : null,
      medias_criterios: item.quantidade ? item.criterios.map((n) => Math.round(n / item.quantidade * 100) / 100) : [null, null, null, null],
      atualizado_em: item.atualizado ? item.atualizado.toISOString() : null,
      minimo: minimo
    };
  });
  const resposta = { atualizado_em: new Date().toISOString(), minimo: minimo, dados: dados };
  cache.put('ranking_publico_v1', JSON.stringify(resposta), 30);
  return resposta;
}
