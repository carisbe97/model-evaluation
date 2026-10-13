export interface DetalleCriterioEvaluado {
  criterio_id: number;
  criterio_nombre?: string;
  puntaje?: number; // Para criterios cuantitativos (ej. 9.5)
  valor_cualitativo?: string; // Para criterios cualitativos (ej. 'Excelente')
}

export interface EvaluacionRegistro {
  id?: number;
  juez_id?: number;
  juez_nombre: string;
  candidata_id: number;
  categoria_id: number;
  notas_criterios: DetalleCriterioEvaluado[];
  puntaje_total: number;
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EvaluacionFormValue {
  scores: Record<number, number>; // criterio_id -> puntaje cuantitativo
  qualitativeScores?: Record<number, string>; // criterio_id -> opción seleccionada
  observaciones: string;
}
