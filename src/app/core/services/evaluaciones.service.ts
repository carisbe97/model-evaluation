import { Injectable, inject } from '@angular/core';
import { EvaluacionRegistro } from '../models';
import { EvaluacionDataSource } from '../data-access/contracts';

@Injectable({
  providedIn: 'root'
})
export class EvaluacionesService {
  private readonly dataSource = inject(EvaluacionDataSource);

  async getEvaluacionesPorJuez(juezNombre: string): Promise<EvaluacionRegistro[]> {
    return this.dataSource.getEvaluacionesPorJuez(juezNombre);
  }

  async getEvaluacionById(id: number): Promise<EvaluacionRegistro | null> {
    return this.dataSource.getEvaluacionById(id);
  }

  async getEvaluacionPorJuezYCandidata(juezNombre: string, candidataId: number): Promise<EvaluacionRegistro | null> {
    return this.dataSource.getEvaluacionPorJuezYCandidata(juezNombre, candidataId);
  }

  async guardarEvaluacion(evaluacion: EvaluacionRegistro): Promise<{ success: boolean; data?: any; error?: any }> {
    return this.dataSource.guardarEvaluacion(evaluacion);
  }
}
