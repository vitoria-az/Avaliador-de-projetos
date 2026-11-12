export type Modalidade='Mostra Nacional'|'Mostra de Extensão';
export interface Projeto{id:string;titulo:string;modalidade:Modalidade;area_tematica:string;data:string;inicio:string;fim:string;formato:string;local:string;fontes:string[]}
export interface AvaliacaoPublica{id_projeto:string;quantidade:number;media_final:number;medias_criterios:[number,number,number,number];atualizado_em:string}
