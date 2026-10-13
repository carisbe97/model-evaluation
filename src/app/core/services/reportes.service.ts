import { Injectable, inject } from '@angular/core';
import { RankingCategoria, MejorPorCriterio, ConsolidadoCandidata } from '../models';
import { ReportesDataSource } from '../data-access/contracts';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private readonly dataSource = inject(ReportesDataSource);

  async getRankingPorCategoria(categoriaId?: number | string): Promise<RankingCategoria[]> {
    const idNum = (categoriaId !== undefined && categoriaId !== null && categoriaId !== '')
      ? Number(categoriaId)
      : undefined;
    return this.dataSource.getRankingPorCategoria(idNum);
  }

  async getMejoresPorCriterio(categoriaId?: number | string): Promise<MejorPorCriterio[]> {
    const idNum = (categoriaId !== undefined && categoriaId !== null && categoriaId !== '')
      ? Number(categoriaId)
      : undefined;
    return this.dataSource.getMejoresPorCriterio(idNum);
  }

  async getConsolidadosPorCandidata(categoriaId?: number | string): Promise<ConsolidadoCandidata[]> {
    const idNum = (categoriaId !== undefined && categoriaId !== null && categoriaId !== '')
      ? Number(categoriaId)
      : undefined;
    return this.dataSource.getConsolidadosPorCandidata(idNum);
  }
}

