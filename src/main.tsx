import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import catalogo from './catalogo.json';
import { filtrarProjetos, normalizarBusca, validarCatalogo } from './domain';
import type { Modalidade, Projeto } from './types';
import './style.css';

const projetos = validarCatalogo(catalogo);
const appsScriptUrl = (import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined)?.trim() ?? '';

type Aba = 'projetos' | 'avaliar' | 'ranking';
function linkAppsScript(page: 'avaliar' | 'ranking', id?: string): string | null {
  if (!appsScriptUrl) return null;
  try {
    const url = new URL(appsScriptUrl);
    url.searchParams.set('page', page);
    if (id) url.searchParams.set('id', id);
    else url.searchParams.delete('id');
    return url.toString();
  } catch {
    return null;
  }
}
function lerRota(): { aba: Aba; id: string | null } {
  const rota = window.location.hash.replace(/^#/, '').split('/');
  const aba = (['projetos', 'avaliar', 'ranking'].includes(rota[0]) ? rota[0] : 'projetos') as Aba;
  return { aba, id: rota[1] || null };
}
function dataPt(data: string): string {
  const [ano, mes, dia] = data.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(ano, mes - 1, dia));
}

function App() {
  const rotaInicial = lerRota();
  const [aba, setAba] = useState<Aba>(rotaInicial.aba);
  const [selecionado, setSelecionado] = useState<Projeto | null>(() => projetos.find((p) => p.id === rotaInicial.id) ?? null);
  const [busca, setBusca] = useState('');
  const [modalidade, setModalidade] = useState<Modalidade>('Mostra Nacional');
  const [area, setArea] = useState('');
  const [data, setData] = useState('');

  useEffect(() => {
    const sincronizarRota = () => {
      const rota = lerRota();
      setAba(rota.aba);
      setSelecionado(projetos.find((p) => p.id === rota.id) ?? null);
    };
    window.addEventListener('hashchange', sincronizarRota);
    return () => window.removeEventListener('hashchange', sincronizarRota);
  }, []);

  const filtrados = useMemo(
    () => filtrarProjetos(projetos, { busca, modalidade, area, data }),
    [busca, modalidade, area, data]
  );
  const areas = useMemo(() => [...new Set(projetos.map((p) => p.area_tematica))].sort((a, b) => a.localeCompare(b, 'pt-BR')), []);
  const datas = useMemo(() => [...new Set(projetos.map((p) => p.data))].sort(), []);
  const urlAvaliacao = selecionado ? linkAppsScript('avaliar', selecionado.id) : null;
  const urlRanking = linkAppsScript('ranking');

  function navegar(proxima: Aba, projeto?: Projeto) {
    setAba(proxima);
    setSelecionado(projeto ?? null);
    const hash = projeto ? `${proxima}/${projeto.id}` : proxima;
    if (window.location.hash.replace(/^#/, '') !== hash) window.location.hash = hash;
  }

  return (
    <div className="app">
      <header>
        <a className="brand" href="#projetos" onClick={() => navegar('projetos')}>
          <b aria-hidden="true">IF</b>
          <span><strong>Universo IF Avalia</strong><small>Participação popular educativa</small></span>
        </a>
        <span className="tag">PROTÓTIPO ACADÊMICO</span>
      </header>

      <main>
        <section className="hero">
          <small>IFMA · WEB MOBILE · 2026.2</small>
          <h1>Conheça. Avalie.<br /><i>Participe.</i></h1>
          <p>Explore os projetos da Mostra Nacional e da Mostra de Extensão e registre sua percepção sobre as apresentações.</p>
          <aside>Este protótipo acadêmico não representa votação, julgamento, nota científica ou ranking oficial do Universo IF.</aside>
        </section>

        <nav className="tabs" aria-label="Navegação principal">
          <button className={aba === 'projetos' ? 'on' : ''} aria-current={aba === 'projetos' ? 'page' : undefined} onClick={() => navegar('projetos')}>Projetos</button>
          <button className={aba === 'avaliar' ? 'on' : ''} aria-current={aba === 'avaliar' ? 'page' : undefined} onClick={() => navegar('avaliar', selecionado ?? undefined)}>Avaliar</button>
          <button className={aba === 'ranking' ? 'on' : ''} aria-current={aba === 'ranking' ? 'page' : undefined} onClick={() => navegar('ranking')}>Ranking</button>
        </nav>

        {aba === 'projetos' && (
          <section aria-labelledby="titulo-projetos">
            <div className="section-heading"><div><small className="eyebrow">CATÁLOGO OFICIAL DA PROGRAMAÇÃO</small><h2 id="titulo-projetos">{selecionado ? 'Detalhes do projeto' : 'Projetos'}</h2></div><span className="count">{selecionado ? '46 projetos no catálogo' : `${filtrados.length} de 46 projetos`}</span></div>
            {selecionado ? (
              <article className="panel detail">
                <button className="link" onClick={() => navegar('projetos')}>← Voltar ao catálogo</button>
                <small className="pill">{selecionado.modalidade}</small>
                <h3>{selecionado.titulo}</h3>
                <p className="muted">{selecionado.area_tematica}</p>
                <dl>
                  <dt>Data</dt><dd>{dataPt(selecionado.data)}</dd>
                  <dt>Horário</dt><dd>{selecionado.inicio} às {selecionado.fim}</dd>
                  <dt>Formato</dt><dd>{selecionado.formato || 'Informação não disponibilizada na programação'}</dd>
                  <dt>Local</dt><dd>{selecionado.local || 'Informação não disponibilizada na programação'}</dd>
                </dl>
                <button className="primary" onClick={() => navegar('avaliar', selecionado)}>Avaliar este projeto</button>
              </article>
            ) : (
              <>
                <div className="filters">
                  <label className="sr-only" htmlFor="busca">Buscar por título</label>
                  <input id="busca" placeholder="Buscar pelo título..." value={busca} onChange={(e) => setBusca(e.target.value)} />
                  <label className="sr-only" htmlFor="modalidade">Modalidade</label>
                  <select id="modalidade" value={modalidade} onChange={(e) => setModalidade(e.target.value as Modalidade)}>
                    <option>Mostra Nacional</option><option>Mostra de Extensão</option>
                  </select>
                  <label className="sr-only" htmlFor="area">Área temática</label>
                  <select id="area" value={area} onChange={(e) => setArea(e.target.value)}>
                    <option value="">Todas as áreas</option>{areas.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <label className="sr-only" htmlFor="data">Dia</label>
                  <select id="data" value={data} onChange={(e) => setData(e.target.value)}>
                    <option value="">Todas as datas</option>{datas.map((item) => <option key={item} value={item}>{dataPt(item)}</option>)}
                  </select>
                </div>
                {filtrados.length === 0 ? (
                  <div className="empty" role="status"><b>Nenhum projeto encontrado</b><p>Altere os filtros ou tente outra palavra. A busca ignora acentos.</p></div>
                ) : (
                  <div className="cards">
                    {filtrados.map((p) => (
                      <button className="project" key={p.id} onClick={() => navegar('projetos', p)}>
                        <small className="pill">{p.modalidade}</small>
                        <h3>{p.titulo}</h3>
                        <p>{p.area_tematica}</p>
                        <small>{dataPt(p.data)} · {p.inicio}–{p.fim}</small>
                        <small>{p.local}</small>
                        <b>Ver detalhes <span aria-hidden="true">↗</span></b>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {aba === 'avaliar' && (
          <section aria-labelledby="titulo-avaliar">
            <small className="eyebrow">AVALIAÇÃO EDUCATIVA</small>
            <h2 id="titulo-avaliar">Avaliar apresentação</h2>
            {selecionado ? (
              <article className="panel">
                <small className="pill">{selecionado.modalidade}</small>
                <h3>{selecionado.titulo}</h3>
                <p className="muted">{dataPt(selecionado.data)} · {selecionado.inicio}–{selecionado.fim} · {selecionado.local}</p>
                <p>O formulário de avaliação abre em uma tela segura do Google Apps Script. Não é necessário criar conta nem fazer login: basta informar o código de participação entregue pela organização.</p>
                {urlAvaliacao ? <a className="primary-link" href={urlAvaliacao}>Abrir formulário de avaliação</a> : <div className="empty" role="status">A conexão com a avaliação ainda não foi configurada. Depois de implantar o Apps Script, cadastre a variável pública <code>VITE_APPS_SCRIPT_URL</code> nas variáveis do repositório e execute novamente o build.</div>}
                <p className="hint">Cada código pode avaliar vários projetos, mas apenas uma vez cada projeto. O código é um token de participação, não uma conta pessoal.</p>
              </article>
            ) : (
              <div className="empty"><b>Escolha um projeto primeiro.</b><p>Abra a aba Projetos, selecione uma apresentação e toque em “Avaliar este projeto”.</p><button className="secondary" onClick={() => navegar('projetos')}>Ver projetos</button></div>
            )}
          </section>
        )}

        {aba === 'ranking' && (
          <section aria-labelledby="titulo-ranking">
            <small className="eyebrow">RESULTADOS AGREGADOS</small>
            <h2 id="titulo-ranking">Ranking da participação</h2>
            <article className="panel">
              <p>O ranking é público e não exibe códigos de participação nem avaliações individuais. Cada modalidade é classificada separadamente pela média das notas ponderadas válidas.</p>
              <ul className="rules">
                <li>Mínimo de cinco avaliações válidas para receber posição.</li>
                <li>Empates são resolvidos pelo título em ordem alfabética (pt-BR) e, persistindo, pelo ID.</li>
                <li>Projetos abaixo da amostra mínima continuam visíveis como “Aguardando amostra mínima”.</li>
              </ul>
              {urlRanking ? <a className="primary-link" href={urlRanking}>Abrir ranking atualizado</a> : <div className="empty" role="status">O ranking será habilitado depois da implantação do Google Apps Script. Cadastre <code>VITE_APPS_SCRIPT_URL</code> nas variáveis do repositório e execute novamente o build.</div>}
              <p className="hint">A classificação é indicativa, não é inferência estatística, premiação ou avaliação científica oficial.</p>
            </article>
          </section>
        )}
      </main>

      <footer><span>Universo IF Avalia · IFMA 2026.2</span><span>Protótipo acadêmico independente</span></footer>
      <nav className="mobile" aria-label="Navegação inferior">
        {(['projetos', 'avaliar', 'ranking'] as const).map((item) => <button key={item} className={aba === item ? 'on' : ''} aria-current={aba === item ? 'page' : undefined} onClick={() => navegar(item, item === 'avaliar' ? selecionado ?? undefined : undefined)}>{item === 'projetos' ? 'Projetos' : item === 'avaliar' ? 'Avaliar' : 'Ranking'}</button>)}
      </nav>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
