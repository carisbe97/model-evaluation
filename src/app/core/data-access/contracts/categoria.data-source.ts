import { Categoria } from '../../models';

export abstract class CategoriaDataSource {
  abstract getCategorias(): Promise<Categoria[]>;
  abstract crearCategoria(categoria: Omit<Categoria, 'id' | 'created_at'>): Promise<Categoria>;
  abstract actualizarCategoria(id: number, categoria: Partial<Categoria>): Promise<Categoria>;
  abstract eliminarCategoria(id: number): Promise<void>;
}

