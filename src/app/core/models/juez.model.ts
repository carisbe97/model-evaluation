import { EvaluacionRegistro } from './evaluacion.model';

export interface Juez {
  id: number;
  nombre: string;
  created_at?: string;
  ultimo_acceso?: string;
}

export interface JuezLoginResult {
  juez: Juez;
  esNuevo: boolean;
  evaluaciones: EvaluacionRegistro[];
}
