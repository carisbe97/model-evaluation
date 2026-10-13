import { Injectable, inject } from '@angular/core';
import { CategoriaDataSource } from '../contracts/categoria.data-source';
import { Categoria } from '../../models';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({
  providedIn: 'root'
})
export class SupabaseCategoriaDataSource extends CategoriaDataSource {
  private readonly supabaseClient = inject(SupabaseClientService);

  async getCategorias(): Promise<Categoria[]> {
    const sb = this.supabaseClient.client;
    if (sb) {
      const { data, error } = await sb
        .from('categorias')
        .select('*')
        .order('orden', { ascending: true });

      if (!error && data) {
        return data as Categoria[];
      }
      if (error) {
        console.error('Error al obtener categorías de Supabase:', error);
      }
    }
    return [];
  }

  async crearCategoria(categoria: Omit<Categoria, 'id' | 'created_at'>): Promise<Categoria> {
    const sb = this.supabaseClient.client;
    if (!sb) {
      throw new Error('Supabase no está configurado');
    }

    const { data, error } = await sb
      .from('categorias')
      .insert({
        nombre: categoria.nombre.trim(),
        descripcion: categoria.descripcion?.trim() || null,
        orden: Number(categoria.orden) || 1,
        icono: categoria.icono?.trim() || null,
        banner_url: categoria.banner_url?.trim() || null
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error al crear categoría en Supabase:', error);
      throw new Error(error?.message || 'No fue posible crear la categoría');
    }

    return data as Categoria;
  }

  async actualizarCategoria(id: number, categoria: Partial<Categoria>): Promise<Categoria> {
    const sb = this.supabaseClient.client;
    if (!sb) {
      throw new Error('Supabase no está configurado');
    }

    const payload: Record<string, any> = {};
    if (categoria.nombre !== undefined) payload['nombre'] = categoria.nombre.trim();
    if (categoria.descripcion !== undefined) payload['descripcion'] = categoria.descripcion?.trim() || null;
    if (categoria.orden !== undefined) payload['orden'] = Number(categoria.orden);
    if (categoria.icono !== undefined) payload['icono'] = categoria.icono?.trim() || null;
    if (categoria.banner_url !== undefined) payload['banner_url'] = categoria.banner_url?.trim() || null;

    const { data, error } = await sb
      .from('categorias')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error(`Error al actualizar categoría ${id} en Supabase:`, error);
      throw new Error(error?.message || 'No fue posible actualizar la categoría');
    }

    return data as Categoria;
  }

  async eliminarCategoria(id: number): Promise<void> {
    const sb = this.supabaseClient.client;
    if (!sb) {
      throw new Error('Supabase no está configurado');
    }

    const { error } = await sb
      .from('categorias')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error al eliminar categoría ${id} en Supabase:`, error);
      throw new Error(error.message || 'No fue posible eliminar la categoría');
    }
  }
}
