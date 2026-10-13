import { Injectable, inject } from '@angular/core';
import { Juez } from '../models';
import { JuezDataSource } from '../data-access/contracts';

@Injectable({
  providedIn: 'root'
})
export class JuecesService {
  private readonly dataSource = inject(JuezDataSource);

  async getJueces(): Promise<Juez[]> {
    return this.dataSource.getJueces();
  }

  async getJuezByNombre(nombre: string): Promise<Juez | null> {
    return this.dataSource.getJuezByNombre(nombre);
  }

  async autenticarOcrearJuez(nombre: string): Promise<{ juez: Juez; esNuevo: boolean }> {
    return this.dataSource.autenticarOcrearJuez(nombre);
  }
}
