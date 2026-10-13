import { Injectable, inject } from '@angular/core';
import { JuezDataSource } from '../contracts/juez.data-source';
import { Juez } from '../../models';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({
  providedIn: 'root'
})
export class SupabaseJuezDataSource extends JuezDataSource {
  private readonly supabaseClient = inject(SupabaseClientService);

  async getJueces(): Promise<Juez[]> {
    const sb = this.supabaseClient.client;
    if (sb) {
      const { data, error } = await sb
        .from('jueces')
        .select('*')
        .order('nombre', { ascending: true });

      if (!error && data) {
        return data as Juez[];
      }
      if (error) {
        console.error('Error al obtener jueces de Supabase:', error);
      }
    }
    return [];
  }

  async getJuezByNombre(nombre: string): Promise<Juez | null> {
    const cleanName = nombre.trim();
    if (!cleanName) return null;

    const sb = this.supabaseClient.client;
    if (sb) {
      const { data, error } = await sb
        .from('jueces')
        .select('*')
        .ilike('nombre', cleanName)
        .maybeSingle();

      if (!error && data) {
        return data as Juez;
      }
      if (error) {
        console.error('Error al buscar juez por nombre en Supabase:', error);
      }
    }
    return null;
  }

  async autenticarOcrearJuez(nombre: string): Promise<{ juez: Juez; esNuevo: boolean }> {
    const cleanName = nombre.trim().toUpperCase();
    if (!cleanName) {
      throw new Error('El nombre del juez es requerido');
    }

    const sb = this.supabaseClient.client;
    if (!sb) {
      throw new Error('Cliente de Supabase no disponible');
    }

    const { data: existing, error: searchError } = await sb
      .from('jueces')
      .select('*')
      .ilike('nombre', cleanName)
      .maybeSingle();

    if (existing && !searchError) {
      await sb
        .from('jueces')
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq('id', existing.id);

      return { juez: existing as Juez, esNuevo: false };
    }

    const { data: nuevo, error: insertError } = await sb
      .from('jueces')
      .insert({ nombre: cleanName })
      .select()
      .single();

    if (!insertError && nuevo) {
      return { juez: nuevo as Juez, esNuevo: true };
    }

    throw new Error(insertError?.message || 'Error al autenticar o crear juez en Supabase');
  }
}

