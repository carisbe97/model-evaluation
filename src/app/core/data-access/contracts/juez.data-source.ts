import { Juez } from '../../models';

export abstract class JuezDataSource {
  abstract getJueces(): Promise<Juez[]>;
  abstract getJuezByNombre(nombre: string): Promise<Juez | null>;
  abstract autenticarOcrearJuez(nombre: string): Promise<{ juez: Juez; esNuevo: boolean }>;
}
