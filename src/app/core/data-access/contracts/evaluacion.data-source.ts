import { EvaluacionRegistro } from '../../models';

export abstract class EvaluacionDataSource {
  abstract getEvaluacionesPorJuez(juezNombre: string): Promise<EvaluacionRegistro[]>;
  abstract getEvaluacionById(id: number): Promise<EvaluacionRegistro | null>;
  abstract getEvaluacionPorJuezYCandidata(juezNombre: string, candidataId: number): Promise<EvaluacionRegistro | null>;
  abstract guardarEvaluacion(evaluacion: EvaluacionRegistro): Promise<{ success: boolean; data?: any; error?: any }>;
}
