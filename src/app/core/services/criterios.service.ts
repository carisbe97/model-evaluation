import { Injectable, inject } from '@angular/core';
import { CriterioEvaluativo } from '../models';
import { CriterioDataSource } from '../data-access/contracts';

@Injectable({
  providedIn: 'root'
})
export class CriteriosService {
  private readonly dataSource = inject(CriterioDataSource);

  async getCriterios(categoriaId?: number | string): Promise<CriterioEvaluativo[]> {
    const idNum = (categoriaId !== undefined && categoriaId !== null && categoriaId !== '')
      ? Number(categoriaId)
      : undefined;
    return this.dataSource.getCriterios(idNum);
  }

  async getCriteriosByCategoriaId(categoriaId: number | string): Promise<CriterioEvaluativo[]> {
    return this.dataSource.getCriteriosByCategoriaId(Number(categoriaId));
  }

  async crearCriterio(criterio: Omit<CriterioEvaluativo, 'id' | 'created_at'>): Promise<CriterioEvaluativo> {
    return this.dataSource.crearCriterio(criterio);
  }

  async actualizarCriterio(id: number, criterio: Partial<CriterioEvaluativo>): Promise<CriterioEvaluativo> {
    return this.dataSource.actualizarCriterio(id, criterio);
  }

  async eliminarCriterio(id: number): Promise<void> {
    return this.dataSource.eliminarCriterio(id);
  }
}
