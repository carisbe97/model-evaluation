export interface RankingCategoria {
  categoria_id: number;
  categoria_nombre: string;
  candidata_id: number;
  candidata_nombre: string;
  candidata_foto: string;
  url_redes_sociales?: string | null;
  puntaje_total_promedio: number;
  total_evaluaciones: number;
  ranking_posicion: number;
}

export interface MejorPorCriterio {
  categoria_id: number;
  categoria_nombre: string;
  criterio_id: number;
  criterio_nombre: string;
  candidata_id: number;
  candidata_nombre: string;
  candidata_foto: string;
  url_redes_sociales?: string | null;
  tipo_calificacion?: string;
  puntaje_promedio_criterio: number;
  total_evaluaciones: number;
}

export interface OpcionCualitativaEstadistica {
  valor_cualitativo: string;
  votos_opcion: number;
  total_votos_criterio: number;
  porcentaje_votos: number;
  es_opcion_mas_votada: boolean;
}

export interface CriterioCualitativoCandidata {
  criterio_id: number;
  criterio_nombre: string;
  opcion_mas_escogida: string;
  porcentaje_mas_escogida: number;
  total_votos: number;
  distribucion: OpcionCualitativaEstadistica[];
}

export interface CriterioPuntajeCandidata {
  criterio_id: number;
  criterio_nombre: string;
  tipo_calificacion: 'cuantitativa' | 'ordinal';
  peso?: number | null;
  puntaje_promedio: number;
  puntaje_maximo?: number;
}

export interface ConsolidadoCandidata {
  candidata_id: number;
  candidata_nombre: string;
  candidata_foto: string;
  url_redes_sociales?: string | null;
  categoria_id: number;
  categoria_nombre: string;
  ranking_posicion: number;
  puntaje_total_promedio: number;
  total_evaluaciones: number;
  criterios_con_puntaje: CriterioPuntajeCandidata[];
  criterios_cualitativos: CriterioCualitativoCandidata[];
  observaciones_jueces: { juez: string; comentario: string }[];
}