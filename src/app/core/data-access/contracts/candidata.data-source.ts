import { Candidata } from '../../models';

export abstract class CandidataDataSource {
  abstract getCandidatas(categoriaId?: number): Promise<Candidata[]>;
  abstract getCandidataById(id: number): Promise<Candidata | null>;
  abstract registrarCandidata(candidata: Omit<Candidata, 'id' | 'created_at'>): Promise<Candidata>;
}
