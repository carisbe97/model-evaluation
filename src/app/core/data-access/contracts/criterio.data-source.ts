import { CriterioEvaluativo } from '../../models';

export abstract class CriterioDataSource {
  abstract getCriterios(categoriaId?: number): Promise<CriterioEvaluativo[]>;
  abstract getCriteriosByCategoriaId(categoriaId: number): Promise<CriterioEvaluativo[]>;
  abstract crearCriterio(criterio: Omit<CriterioEvaluativo, 'id' | 'created_at'>): Promise<CriterioEvaluativo>;
  abstract actualizarCriterio(id: number, criterio: Partial<CriterioEvaluativo>): Promise<CriterioEvaluativo>;
  abstract eliminarCriterio(id: number): Promise<void>;
}

