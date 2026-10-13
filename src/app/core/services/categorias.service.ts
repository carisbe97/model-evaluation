import { Injectable, inject } from '@angular/core';
import { Categoria } from '../models';
import { CategoriaDataSource } from '../data-access/contracts';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private readonly dataSource = inject(CategoriaDataSource);

  async getCategorias(): Promise<Categoria[]> {
    return this.dataSource.getCategorias();
  }

  async getCategoriaById(id: number | string): Promise<Categoria | null> {
    const cats = await this.getCategorias();
    return cats.find(c => Number(c.id) === Number(id)) || null;
  }

  async crearCategoria(categoria: Omit<Categoria, 'id' | 'created_at'>): Promise<Categoria> {
    return this.dataSource.crearCategoria(categoria);
  }

  async actualizarCategoria(id: number, categoria: Partial<Categoria>): Promise<Categoria> {
    return this.dataSource.actualizarCategoria(id, categoria);
  }

  async eliminarCategoria(id: number): Promise<void> {
    return this.dataSource.eliminarCategoria(id);
  }
}
