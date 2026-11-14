import type { Projeto, AvaliacaoPublica, Modalidade } from './types';

export const PESOS = [0.30, 0.30, 0.25, 0.15] as const;
export const CRITERIOS = [
  'Criatividade e inovação',
  'Clareza da apresentação',
  'Relevância e impacto',
  'Demonstração e resultados'
] as const;
export const ROTULOS: Record<number, string> = {
  1: 'Muito ruim',
  2: 'Ruim',
  3: 'Regular',
  4: 'Bom',
  5: 'Excelente'
};

function dataValida(data: string): boolean {
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(data)) return false;

  const [ano, mes, dia] = data.split('-').map(Number);
  if (ano < 1 || ano > 9999 || mes < 1 || mes > 12 || dia < 1 || dia > 31) {
    return false;
  }

  // setUTCFullYear evita a interpretação especial de anos entre 0 e 99
  // feita pelo construtor Date.UTC.
  const dataUTC = new Date(0);
  dataUTC.setUTCHours(0, 0, 0, 0);
  dataUTC.setUTCFullYear(ano, mes - 1, dia);

  return dataUTC.getUTCFullYear() === ano &&
    dataUTC.getUTCMonth() === mes - 1 &&
    dataUTC.getUTCDate() === dia;
}

function horaValida(hora: string): boolean {
  if (!/^\\d{2}:\\d{2}$/.test(hora)) return false;

  const [horas, minutos] = hora.split(':').map(Number);
  return horas >= 0 && horas <= 23 && minutos >= 0 && minutos <= 59;
}

export function calcularNota(notas: number[]): number {
  if (
    !Array.isArray(notas) ||
    notas.length !== 4 ||
    notas.some((n) => !Number.isInteger(n) || n < 1 || n > 5)
  ) {
    throw new Error('Informe quatro notas inteiras entre 1 e 5.');
  }

  return Math.round(
    notas.reduce((soma, nota, i) => soma + nota * PESOS[i], 0) * 100
  ) / 100;
}

export function normalizarBusca(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

export function validarCatalogo(dados: unknown): Projeto[] {
  if (
    !dados ||
    typeof dados !== 'object' ||
    !Array.isArray((dados as { projetos?: unknown }).projetos)
  ) {
    throw new Error('O catálogo não possui uma lista de projetos válida.');
  }

  const lista = (dados as { projetos: unknown[] }).projetos as Projeto[];
  const ids = new Set<string>();

  for (const p of lista) {
    const campos = [
      'id', 'titulo', 'modalidade', 'area_tematica',
      'data', 'inicio', 'fim', 'formato', 'local'
    ];

    if (
      !p ||
      typeof p !== 'object' ||
      campos.some((campo) => {
        const valor = (p as unknown as Record<string, unknown>)[campo];
        return typeof valor !== 'string' || !valor.trim();
      })
    ) {
      throw new Error('Há projeto com campo obrigatório ausente.');
    }

    if (ids.has(p.id)) {
      throw new Error('ID duplicado no catálogo: ' + p.id);
    }
    ids.add(p.id);

    if (
      p.modalidade !== 'Mostra Nacional' &&
      p.modalidade !== 'Mostra de Extensão'
    ) {
      throw new Error('Modalidade inválida no projeto: ' + p.id);
    }

    if (!dataValida(p.data)) {
      throw new Error('Data inválida no projeto: ' + p.id);
    }

    if (
      !horaValida(p.inicio) ||
      !horaValida(p.fim) ||
      p.inicio >= p.fim
    ) {
      throw new Error('Horário inválido no projeto: ' + p.id);
    }

    if (
      !Array.isArray(p.fontes) ||
      p.fontes.length === 0 ||
      p.fontes.some((fonte) =>
        !fonte ||
        typeof fonte !== 'object' ||
        typeof fonte.arquivo !== 'string' ||
        !fonte.arquivo.trim() ||
        !Number.isInteger(fonte.pagina) ||
        fonte.pagina < 1
      )
    ) {
      throw new Error('Proveniência inválida no projeto: ' + p.id);
    }
  }

  const nacionais = lista.filter(
    (p) => p.modalidade === 'Mostra Nacional'
  );
  const extensao = lista.filter(
    (p) => p.modalidade === 'Mostra de Extensão'
  );

  const idsEsperados = new Set([
    ...Array.from({ length: 24 }, (_, i) =>
      'NAC-' + String(i + 1).padStart(3, '0')
    ),
    ...Array.from({ length: 22 }, (_, i) =>
      'EXT-' + String(i + 1).padStart(3, '0')
    )
  ]);

  if (
    lista.length !== 46 ||
    nacionais.length !== 24 ||
    extensao.length !== 22 ||
    ids.size !== idsEsperados.size ||
    [...idsEsperados].some((id) => !ids.has(id))
  ) {
    throw new Error(
      'Catálogo incompatível: esperados 24 NAC e 22 EXT, total 46.'
    );
  }

  return lista;
}

export function filtrarProjetos(
  projetos: Projeto[],
  filtros: {
    busca?: string;
    modalidade?: string;
    area?: string;
    data?: string;
  }
): Projeto[] {
  const termo = normalizarBusca(filtros.busca ?? '');

  return projetos.filter((p) =>
    (!termo || normalizarBusca(p.titulo).includes(termo)) &&
    (!filtros.modalidade || p.modalidade === filtros.modalidade) &&
    (!filtros.area || p.area_tematica === filtros.area) &&
    (!filtros.data || p.data === filtros.data)
  );
}

export function montarRanking(
  projetos: Projeto[],
  dados: AvaliacaoPublica[],
  modalidade: Modalidade,
  minimo = 5
) {
  const porId = new Map(
    dados
      .filter((d) => d.modalidade === modalidade)
      .map((d) => [d.id_projeto, d])
  );

  const lista = projetos
    .filter((p) => p.modalidade === modalidade)
    .map((projeto) => {
      const dado = porId.get(projeto.id);
      return {
        projeto,
        dado,
        elegivel: (dado?.quantidade ?? 0) >= minimo
      };
    });

  lista.sort((a, b) => {
    if (a.elegivel !== b.elegivel) {
      return a.elegivel ? -1 : 1;
    }

    const diferenca =
      (b.dado?.media_final ?? 0) - (a.dado?.media_final ?? 0);

    if (Math.abs(diferenca) > 1e-9) return diferenca;

    return (
      a.projeto.titulo.localeCompare(b.projeto.titulo, 'pt-BR') ||
      a.projeto.id.localeCompare(b.projeto.id)
    );
  });

  let posicao = 0;

  return lista.map((item) => ({
    ...item,
    posicao: item.elegivel ? ++posicao : null
  }));
}
