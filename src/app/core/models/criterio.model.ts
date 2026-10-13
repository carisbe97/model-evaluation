export type TipoCalificacion = 'cuantitativa' | 'ordinal' | 'cualitativa';

export interface CriterioEvaluativo {
  id: number;
  categoria_id?: number | null; // null si aplica a todas las categorías
  nombre: string;
  descripcion?: string;
  tipo_calificacion: TipoCalificacion; // cuantitativa (estrellas), ordinal (likert con peso %), cualitativa (descriptiva pura)
  peso?: number | null; // Porcentaje de ponderación (ej. 35 = 35%) para cuantitativa y ordinal
  puntaje_minimo?: number | null; // Generalmente 1.0 (cuantitativa y ordinal)
  puntaje_maximo?: number | null; // Generalmente 5.0 ó 10.0 (cuantitativa y ordinal)
  opciones_cualitativas?: string[]; // ej. ['Mal', 'Aceptable', 'Bueno', 'Excelente'] (ordinal y cualitativa)
  orden: number;
  created_at?: string;
}
