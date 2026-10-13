import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import {
  Candidata,
  Categoria,
  CriterioEvaluativo,
  EvaluacionRegistro,
  RankingCategoria,
  MejorPorCriterio,
  Juez
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient | null = null;
  public readonly isConfigured: boolean;

  constructor() {
    this.isConfigured = !!(
      environment.supabaseUrl &&
      !environment.supabaseUrl.includes('your-project') &&
      environment.supabaseAnonKey &&
      !environment.supabaseAnonKey.includes('your-anon-key')
    );

    if (this.isConfigured) {
      try {
        const cleanUrl = environment.supabaseUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
        this.supabase = createClient(cleanUrl, environment.supabaseAnonKey.trim());
      } catch (e) {
        console.warn('Error inicializando cliente de Supabase:', e);
        this.supabase = null;
      }
    }
  }

  get client(): SupabaseClient | null {
    return this.supabase;
  }

  // ==========================================
  // JUECES (AUTENTICACIÓN SIMPLIFICADA POR NOMBRE)
  // ==========================================
  async getJueces(): Promise<Juez[]> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('jueces')
        .select('*')
        .order('nombre', { ascending: true });

      if (!error && data) {
        return data as Juez[];
      }
    }
    return [];
  }

  async getJuezByNombre(nombre: string): Promise<Juez | null> {
    const cleanName = nombre.trim();
    if (!cleanName) return null;

    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('jueces')
        .select('*')
        .ilike('nombre', cleanName)
        .maybeSingle();

      if (!error && data) {
        return data as Juez;
      }
    }
    return null;
  }

  /**
   * Valida si un juez existe por su nombre.
   * Si no existe, lo registra automáticamente en la base de datos (con ID SERIAL autoincrementable).
   * Si ya existe, actualiza su último acceso.
   */
  async autenticarOcrearJuez(nombre: string): Promise<{ juez: Juez; esNuevo: boolean }> {
    const cleanName = nombre.trim().toUpperCase();
    if (!cleanName) {
      throw new Error('El nombre del juez es requerido');
    }

    if (!this.supabase) {
      throw new Error('Supabase no está configurado');
    }

    // 1. Buscar si ya existe (búsqueda sin distinción de mayúsculas/minúsculas)
    const { data: existing, error: searchError } = await this.supabase
      .from('jueces')
      .select('*')
      .ilike('nombre', cleanName)
      .maybeSingle();

    if (existing && !searchError) {
      await this.supabase
        .from('jueces')
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq('id', existing.id);

      return { juez: existing as Juez, esNuevo: false };
    }

    // 2. Si no existe, crearlo
    const { data: nuevo, error: insertError } = await this.supabase
      .from('jueces')
      .insert({ nombre: cleanName })
      .select()
      .single();

    if (!insertError && nuevo) {
      return { juez: nuevo as Juez, esNuevo: true };
    }

    throw new Error(insertError?.message || 'Error al autenticar o crear juez en Supabase');
  }

  // ==========================================
  // CATEGORÍAS
  // ==========================================
  async getCategorias(): Promise<Categoria[]> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('categorias')
        .select('*')
        .order('orden', { ascending: true });

      if (!error && data) {
        return data as Categoria[];
      }
    }
    return [];
  }

  // ==========================================
  // CRITERIOS EVALUATIVOS
  // ==========================================
  async getCriterios(categoriaId?: number | string): Promise<CriterioEvaluativo[]> {
    if (this.supabase) {
      let query = this.supabase
        .from('criterios_evaluativos')
        .select('*')
        .order('orden', { ascending: true });

      if (categoriaId !== undefined && categoriaId !== null && categoriaId !== '') {
        const catIdNum = Number(categoriaId);
        query = query.or(`categoria_id.is.null,categoria_id.eq.${catIdNum}`);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data as CriterioEvaluativo[];
      }
    }
    return [];
  }

  // ==========================================
  // CANDIDATAS
  // ==========================================
  async getCandidatas(categoriaId?: number | string): Promise<Candidata[]> {
    if (this.supabase) {
      let query = this.supabase.from('candidatas').select('*').order('id', { ascending: true });
      if (categoriaId !== undefined && categoriaId !== null && categoriaId !== '') {
        const catIdNum = Number(categoriaId);
        query = query.eq('categoria_id', catIdNum);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as Candidata[];
      }
    }
    return [];
  }

  async getCandidataById(id: number | string): Promise<Candidata | null> {
    const idNum = Number(id);
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('candidatas')
        .select('*')
        .eq('id', idNum)
        .maybeSingle();

      if (!error && data) return data as Candidata;
    }
    return null;
  }

  async registrarCandidata(candidata: Omit<Candidata, 'id' | 'created_at'>): Promise<Candidata> {
    if (!this.supabase) {
      throw new Error('Supabase no está configurado');
    }

    const { data, error } = await this.supabase
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
      throw new Error(error.message || 'No fue posible registrar la candidata');
    }

    return data as Candidata;
  }

  // ==========================================
  // EVALUACIONES
  // ==========================================
  async getEvaluacionesPorJuez(juezNombre: string): Promise<EvaluacionRegistro[]> {
    const cleanName = juezNombre.trim();
    if (!cleanName) return [];

    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('evaluaciones')
        .select('*')
        .ilike('juez_nombre', cleanName);

      if (!error && data) {
        return data as EvaluacionRegistro[];
      }
    }
    return [];
  }

  async guardarEvaluacion(evaluacion: EvaluacionRegistro): Promise<{ success: boolean; data?: any; error?: any }> {
    if (this.supabase) {
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

      const { data, error } = await this.supabase
        .from('evaluaciones')
        .upsert(payload, { onConflict: 'juez_nombre,candidata_id' })
        .select();

      if (error) {
        console.error('Error al persistir evaluación en Supabase:', error);
        return { success: false, error };
      }
      return { success: true, data };
    }

    return { success: false, error: 'Supabase no inicializado' };
  }

  // ==========================================
  // REPORTES Y VISTAS SUPABASE / POSTGRES
  // ==========================================
  async getRankingPorCategoria(categoriaId?: number | string): Promise<RankingCategoria[]> {
    if (this.supabase) {
      let query = this.supabase
        .from('vista_ranking_categoria')
        .select('*');

      if (categoriaId !== undefined && categoriaId !== null && categoriaId !== '') {
        const catIdNum = Number(categoriaId);
        query = query.eq('categoria_id', catIdNum).order('ranking_posicion', { ascending: true });
      } else {
        query = query.order('puntaje_total_promedio', { ascending: false });
      }

      const { data, error } = await query;
      if (!error && data) {
        return data as RankingCategoria[];
      }
    }
    return [];
  }

  async getMejoresPorCriterio(categoriaId?: number | string): Promise<MejorPorCriterio[]> {
    if (this.supabase) {
      let query = this.supabase
        .from('vista_mejores_por_criterio')
        .select('*')
        .order('puntaje_promedio_criterio', { ascending: false });

      if (categoriaId !== undefined && categoriaId !== null && categoriaId !== '') {
        const catIdNum = Number(categoriaId);
        query = query.eq('categoria_id', catIdNum);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data as MejorPorCriterio[];
      }
    }
    return [];
  }
}

