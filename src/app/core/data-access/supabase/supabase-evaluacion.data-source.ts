import { Injectable, inject } from '@angular/core';
import { EvaluacionDataSource } from '../contracts/evaluacion.data-source';
import { EvaluacionRegistro } from '../../models';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({
  providedIn: 'root'
})
export class SupabaseEvaluacionDataSource extends EvaluacionDataSource {
  private readonly supabaseClient = inject(SupabaseClientService);

  async getEvaluacionesPorJuez(juezNombre: string): Promise<EvaluacionRegistro[]> {
    const cleanName = juezNombre.trim();
    if (!cleanName) return [];

    const sb = this.supabaseClient.client;
    if (sb) {
      const { data, error } = await sb
        .from('evaluaciones')
        .select('*')
        .ilike('juez_nombre', cleanName);

      if (!error && data) {
        return data as EvaluacionRegistro[];
      }
      if (error) {
        console.error('Error al obtener evaluaciones por juez de Supabase:', error);
      }
    }
    return [];
  }

  async getEvaluacionById(id: number): Promise<EvaluacionRegistro | null> {
    const sb = this.supabaseClient.client;
    if (sb) {
      const { data, error } = await sb
        .from('evaluaciones')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return data as EvaluacionRegistro;
      }
      if (error) {
        console.error('Error al obtener evaluación por ID de Supabase:', error);
      }
    }
    return null;
  }

  async getEvaluacionPorJuezYCandidata(juezNombre: string, candidataId: number): Promise<EvaluacionRegistro | null> {
    const cleanName = juezNombre.trim();
    if (!cleanName) return null;

    const sb = this.supabaseClient.client;
    if (sb) {
      const { data, error } = await sb
        .from('evaluaciones')
        .select('*')
        .ilike('juez_nombre', cleanName)
        .eq('candidata_id', candidataId)
        .maybeSingle();

      if (!error && data) {
        return data as EvaluacionRegistro;
      }
      if (error) {
        console.error('Error al obtener evaluación por juez y candidata de Supabase:', error);
      }
    }
    return null;
  }

  async guardarEvaluacion(evaluacion: EvaluacionRegistro): Promise<{ success: boolean; data?: any; error?: any }> {
    const sb = this.supabaseClient.client;
    if (!sb) {
      return { success: false, error: 'Cliente de Supabase no inicializado' };
    }

    const payload: any = {
      juez_nombre: evaluacion.juez_nombre,
      candidata_id: Number(evaluacion.candidata_id),
      categoria_id: Number(evaluacion.categoria_id),
      notas_criterios: evaluacion.notas_criterios,
      observaciones: evaluacion.observaciones,
      puntaje_total: evaluacion.puntaje_total,
      updated_at: new Date().toISOString()
    };
    if (evaluacion.juez_id) {
      payload.juez_id = Number(evaluacion.juez_id);
    }

    const { data, error } = await sb
      .from('evaluaciones')
      .upsert(payload, { onConflict: 'juez_nombre,candidata_id' })
      .select();

    if (error) {
      console.error('Error al persistir evaluación en Supabase:', error);
      return { success: false, error };
    }
    return { success: true, data };
  }
}

