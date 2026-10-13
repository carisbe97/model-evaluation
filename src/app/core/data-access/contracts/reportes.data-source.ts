import { RankingCategoria, MejorPorCriterio, ConsolidadoCandidata } from '../../models';

export abstract class ReportesDataSource {
  abstract getRankingPorCategoria(categoriaId?: number): Promise<RankingCategoria[]>;
  abstract getMejoresPorCriterio(categoriaId?: number): Promise<MejorPorCriterio[]>;
  abstract getConsolidadosPorCandidata(categoriaId?: number): Promise<ConsolidadoCandidata[]>;
}

