export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string | null;
  orden: number;
  icono?: string | null;
  banner_url?: string | null;
  total_candidatas?: number;
  created_at?: string;
}

export type CategoriaEstado = 'Pendiente' | 'En Progreso' | 'Completada';

export interface CategoriaConProgreso extends Categoria {
  estado: CategoriaEstado;
  evaluadas: number;
}
