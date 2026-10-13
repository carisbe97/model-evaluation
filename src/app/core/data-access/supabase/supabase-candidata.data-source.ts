import { Injectable, inject } from '@angular/core';
import { CandidataDataSource } from '../contracts/candidata.data-source';
import { Candidata } from '../../models';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({
  providedIn: 'root'
})
export class SupabaseCandidataDataSource extends CandidataDataSource {
  private readonly supabaseClient = inject(SupabaseClientService);

  async getCandidatas(categoriaId?: number): Promise<Candidata[]> {
    const sb = this.supabaseClient.client;
    if (sb) {
      let query = sb.from('candidatas').select('*').order('id', { ascending: true });
      if (categoriaId !== undefined && categoriaId !== null) {
        query = query.eq('categoria_id', categoriaId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as Candidata[];
      }
      if (error) {
        console.error('Error al obtener candidatas de Supabase:', error);
      }
    }
    return [];
  }

  async getCandidataById(id: number): Promise<Candidata | null> {
    const sb = this.supabaseClient.client;
    if (sb) {
      const { data, error } = await sb
        .from('candidatas')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) return data as Candidata;
      if (error) {
        console.error('Error al obtener candidata por ID de Supabase:', error);
      }
    }
    return null;
  }

  async registrarCandidata(candidata: Omit<Candidata, 'id' | 'created_at'>): Promise<Candidata> {
    const sb = this.supabaseClient.client;
    if (!sb) {
      throw new Error('Cliente de Supabase no disponible.');
    }

    const { data, error } = await sb
      .from('candidatas')
      .insert({
        categoria_id: candidata.categoria_id,
        nombre: candidata.nombre.trim(),
        foto_perfil: candidata.foto_perfil.trim(),
        galeria_fotos: candidata.galeria_fotos || [],
        url_redes_sociales: candidata.url_redes_sociales?.trim() || null
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error al registrar candidata en Supabase:', error);
      throw new Error(error.message || 'No fue posible registrar la candidata.');
    }

    return data as Candidata;
  }
}
