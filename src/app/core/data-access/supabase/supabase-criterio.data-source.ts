import { Injectable, inject } from '@angular/core';
import { CriterioDataSource } from '../contracts/criterio.data-source';
import { CriterioEvaluativo } from '../../models';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({
  providedIn: 'root'
})
export class SupabaseCriterioDataSource extends CriterioDataSource {
  private readonly supabaseClient = inject(SupabaseClientService);

  async getCriterios(categoriaId?: number): Promise<CriterioEvaluativo[]> {
    const sb = this.supabaseClient.client;
    if (sb) {
      let query = sb
        .from('criterios_evaluativos')
        .select('*')
        .order('orden', { ascending: true });

      if (categoriaId !== undefined && categoriaId !== null) {
        query = query.or(`categoria_id.is.null,categoria_id.eq.${categoriaId}`);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data as CriterioEvaluativo[];
      }
      if (error) {
        console.error('Error al obtener criterios de Supabase:', error);
      }
    }
    return [];
  }

  async getCriteriosByCategoriaId(categoriaId: number): Promise<CriterioEvaluativo[]> {
    const sb = this.supabaseClient.client;
    if (sb) {
      const { data, error } = await sb
        .from('criterios_evaluativos')
        .select('*')
        .eq('categoria_id', categoriaId)
        .order('orden', { ascending: true });

      if (!error && data) {
        return data as CriterioEvaluativo[];
      }
      if (error) {
        console.error(`Error al obtener criterios de la categoría ${categoriaId}:`, error);
      }
    }
    return [];
  }

  async crearCriterio(criterio: Omit<CriterioEvaluativo, 'id' | 'created_at'>): Promise<CriterioEvaluativo> {
    const sb = this.supabaseClient.client;
    if (!sb) {
      throw new Error('Supabase no está configurado');
    }

    const payload: Record<string, any> = {
      categoria_id: criterio.categoria_id ?? null,
      nombre: criterio.nombre.trim(),
      descripcion: criterio.descripcion?.trim() || null,
      tipo_calificacion: criterio.tipo_calificacion,
      orden: Number(criterio.orden) || 1,
      opciones_cualitativas: criterio.opciones_cualitativas || []
    };

    if (criterio.tipo_calificacion === 'cuantitativa') {
      payload['peso'] = criterio.peso !== undefined && criterio.peso !== null ? Number(criterio.peso) : null;
      payload['puntaje_minimo'] = criterio.puntaje_minimo !== undefined && criterio.puntaje_minimo !== null ? Number(criterio.puntaje_minimo) : 1;
      payload['puntaje_maximo'] = criterio.puntaje_maximo !== undefined && criterio.puntaje_maximo !== null ? Number(criterio.puntaje_maximo) : 10;
    } else if (criterio.tipo_calificacion === 'ordinal') {
      payload['peso'] = criterio.peso !== undefined && criterio.peso !== null ? Number(criterio.peso) : null;
      payload['puntaje_minimo'] = null;
      payload['puntaje_maximo'] = null;
    } else {
      payload['peso'] = null;
      payload['puntaje_minimo'] = null;
      payload['puntaje_maximo'] = null;
    }

    const { data, error } = await sb
      .from('criterios_evaluativos')
      .insert(payload)
      .select()
      .single();

    if (error || !data) {
      console.error('Error al crear criterio en Supabase:', error);
      throw new Error(error?.message || 'No fue posible crear el criterio');
    }

    return data as CriterioEvaluativo;
  }

  async actualizarCriterio(id: number, criterio: Partial<CriterioEvaluativo>): Promise<CriterioEvaluativo> {
    const sb = this.supabaseClient.client;
    if (!sb) {
      throw new Error('Supabase no está configurado');
    }

    const payload: Record<string, any> = {};
    if (criterio.categoria_id !== undefined) payload['categoria_id'] = criterio.categoria_id;
    if (criterio.nombre !== undefined) payload['nombre'] = criterio.nombre.trim();
    if (criterio.descripcion !== undefined) payload['descripcion'] = criterio.descripcion?.trim() || null;
    if (criterio.tipo_calificacion !== undefined) payload['tipo_calificacion'] = criterio.tipo_calificacion;
    if (criterio.orden !== undefined) payload['orden'] = Number(criterio.orden);
    if (criterio.opciones_cualitativas !== undefined) payload['opciones_cualitativas'] = criterio.opciones_cualitativas;

    if (criterio.tipo_calificacion === 'cuantitativa') {
      if (criterio.peso !== undefined) payload['peso'] = Number(criterio.peso);
      if (criterio.puntaje_minimo !== undefined) payload['puntaje_minimo'] = Number(criterio.puntaje_minimo);
      if (criterio.puntaje_maximo !== undefined) payload['puntaje_maximo'] = Number(criterio.puntaje_maximo);
    } else if (criterio.tipo_calificacion === 'ordinal') {
      if (criterio.peso !== undefined) payload['peso'] = Number(criterio.peso);
      payload['puntaje_minimo'] = null;
      payload['puntaje_maximo'] = null;
    } else if (criterio.tipo_calificacion === 'cualitativa') {
      payload['peso'] = null;
      payload['puntaje_minimo'] = null;
      payload['puntaje_maximo'] = null;
    }

    const { data, error } = await sb
      .from('criterios_evaluativos')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error(`Error al actualizar criterio ${id} en Supabase:`, error);
      throw new Error(error?.message || 'No fue posible actualizar el criterio');
    }

    return data as CriterioEvaluativo;
  }

  async eliminarCriterio(id: number): Promise<void> {
    const sb = this.supabaseClient.client;
    if (!sb) {
      throw new Error('Supabase no está configurado');
    }

    const { error } = await sb
      .from('criterios_evaluativos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error al eliminar criterio ${id} en Supabase:`, error);
      throw new Error(error.message || 'No fue posible eliminar el criterio');
    }
  }
}
