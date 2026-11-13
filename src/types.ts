export type Modalidade = 'Mostra Nacional' | 'Mostra de Extensão';

export interface FonteProjeto {
  arquivo: string;
  pagina: number;
}

export interface Projeto {
  id: string;
  titulo: string;
  modalidade: Modalidade;
  area_tematica: string;
  data: string;
  inicio: string;
  fim: string;
  formato: string;
  local: string;
  fontes: FonteProjeto[];
  conferencia?: string;
}

export interface AvaliacaoPublica {
  id_projeto: string;
  modalidade: Modalidade;
  quantidade: number;
  media_final: number | null;
  medias_criterios: [number | null, number | null, number | null, number | null];
  atualizado_em: string | null;
  minimo: number;
}
