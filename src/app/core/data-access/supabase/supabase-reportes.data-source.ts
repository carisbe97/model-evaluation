import { Injectable, inject } from '@angular/core';
import { ReportesDataSource } from '../contracts/reportes.data-source';
import {
  RankingCategoria,
  MejorPorCriterio,
  ConsolidadoCandidata,
  CriterioPuntajeCandidata,
  CriterioCualitativoCandidata,
  OpcionCualitativaEstadistica,
  Candidata,
  Categoria,
  CriterioEvaluativo,
  EvaluacionRegistro
} from '../../models';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({
  providedIn: 'root'
})
export class SupabaseReportesDataSource extends ReportesDataSource {
  private readonly supabaseClient = inject(SupabaseClientService);

  async getRankingPorCategoria(categoriaId?: number): Promise<RankingCategoria[]> {
    const sb = this.supabaseClient.client;
    if (sb) {
      let query = sb
        .from('vista_ranking_categoria')
        .select('*');

      if (categoriaId !== undefined && categoriaId !== null) {
        query = query.eq('categoria_id', categoriaId).order('ranking_posicion', { ascending: true });
      } else {
        query = query.order('puntaje_total_promedio', { ascending: false });
      }

      const { data, error } = await query;
      if (!error && data) {
        return data as RankingCategoria[];
      }
      if (error) {
        console.error('Error al obtener ranking de categorías de Supabase:', error);
      }
    }
    return [];
  }

  async getMejoresPorCriterio(categoriaId?: number): Promise<MejorPorCriterio[]> {
    const sb = this.supabaseClient.client;
    if (sb) {
      let query = sb
        .from('vista_mejores_por_criterio')
        .select('*')
        .order('puntaje_promedio_criterio', { ascending: false });

      if (categoriaId !== undefined && categoriaId !== null) {
        query = query.eq('categoria_id', categoriaId);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data as MejorPorCriterio[];
      }
      if (error) {
        console.error('Error al obtener mejores por criterio de Supabase:', error);
      }
    }
    return [];
  }

  async getConsolidadosPorCandidata(categoriaId?: number): Promise<ConsolidadoCandidata[]> {
    const sb = this.supabaseClient.client;
    if (!sb) return [];

    try {
      let candQuery = sb.from('candidatas').select('*').order('id', { ascending: true });
      let evalQuery = sb.from('evaluaciones').select('*');
      let rankQuery = sb.from('vista_ranking_categoria').select('*');

      if (categoriaId !== undefined && categoriaId !== null) {
        candQuery = candQuery.eq('categoria_id', categoriaId);
        evalQuery = evalQuery.eq('categoria_id', categoriaId);
        rankQuery = rankQuery.eq('categoria_id', categoriaId);
      }

      const [
        { data: candidatas, error: candErr },
        { data: categorias, error: catErr },
        { data: criterios, error: critErr },
        { data: evaluaciones, error: evalErr },
        { data: rankingData }
      ] = await Promise.all([
        candQuery,
        sb.from('categorias').select('*'),
        sb.from('criterios_evaluativos').select('*').order('orden', { ascending: true }),
        evalQuery,
        rankQuery
      ]);

      if (candErr || !candidatas || candidatas.length === 0) {
        return [];
      }

      const catsList = (categorias || []) as Categoria[];
      const critsList = (criterios || []) as CriterioEvaluativo[];
      const evalsList = (evaluaciones || []) as EvaluacionRegistro[];
      const rankingList = (rankingData || []) as RankingCategoria[];

      return this.buildConsolidados(
        candidatas as Candidata[],
        catsList,
        critsList,
        evalsList,
        rankingList
      );
    } catch (err) {
      console.error('Error al obtener consolidados de candidata en Supabase:', err);
      return [];
    }
  }

  private buildConsolidados(
    candidatas: Candidata[],
    categorias: Categoria[],
    criterios: CriterioEvaluativo[],
    evaluaciones: EvaluacionRegistro[],
    rankingList: RankingCategoria[]
  ): ConsolidadoCandidata[] {
    const rankingMap = new Map<number, { pos: number; avg: number; count: number }>();
    rankingList.forEach(r => {
      rankingMap.set(r.candidata_id, {
        pos: r.ranking_posicion,
        avg: r.puntaje_total_promedio,
        count: r.total_evaluaciones
      });
    });

    const resultados: ConsolidadoCandidata[] = candidatas.map(cand => {
      const cat = categorias.find(c => Number(c.id) === Number(cand.categoria_id));
      const candEvals = evaluaciones.filter(e => Number(e.candidata_id) === Number(cand.id));

      let rInfo = rankingMap.get(cand.id);
      if (!rInfo) {
        const totalScore = candEvals.reduce((acc, ev) => acc + (ev.puntaje_total || 0), 0);
        const avg = candEvals.length > 0 ? Number((totalScore / candEvals.length).toFixed(2)) : 0;
        rInfo = { pos: candidatas.length, avg, count: candEvals.length };
      }

      // Criterios aplicables a esta candidata (generales o de su categoría)
      const candCriterios = criterios.filter(
        c => c.categoria_id === null || c.categoria_id === undefined || Number(c.categoria_id) === Number(cand.categoria_id)
      );

      // 1. Criterios con puntaje (cuantitativos y ordinales)
      const scoredCrits = candCriterios.filter(c => c.tipo_calificacion === 'cuantitativa' || c.tipo_calificacion === 'ordinal');
      const criteriosConPuntaje: CriterioPuntajeCandidata[] = scoredCrits.map(crit => {
        const scores: number[] = [];
        candEvals.forEach(ev => {
          const nc = ev.notas_criterios?.find(n => Number(n.criterio_id) === Number(crit.id));
          if (nc && nc.puntaje !== undefined && nc.puntaje !== null) {
            scores.push(Number(nc.puntaje));
          }
        });
        const avg = scores.length > 0
          ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2))
          : 0;

        return {
          criterio_id: crit.id,
          criterio_nombre: crit.nombre,
          tipo_calificacion: crit.tipo_calificacion as 'cuantitativa' | 'ordinal',
          peso: crit.peso,
          puntaje_promedio: avg,
          puntaje_maximo: crit.puntaje_maximo ?? 5
        };
      });

      // 2. Criterios cualitativos descriptivos con cálculo de moda y distribución de votos
      const qualiCrits = candCriterios.filter(c => c.tipo_calificacion === 'cualitativa');
      const criteriosCualitativos: CriterioCualitativoCandidata[] = qualiCrits.map(crit => {
        const conteoMap = new Map<string, number>();
        let totalVotos = 0;

        candEvals.forEach(ev => {
          const nc = ev.notas_criterios?.find(n => Number(n.criterio_id) === Number(crit.id));
          if (nc && nc.valor_cualitativo && nc.valor_cualitativo.trim().length > 0) {
            const val = nc.valor_cualitativo.trim();
            conteoMap.set(val, (conteoMap.get(val) || 0) + 1);
            totalVotos++;
          }
        });

        if (totalVotos === 0) {
          const fallbackOpt = crit.opciones_cualitativas?.[0] || 'Sin evaluaciones';
          return {
            criterio_id: crit.id,
            criterio_nombre: crit.nombre,
            opcion_mas_escogida: fallbackOpt,
            porcentaje_mas_escogida: 0,
            total_votos: 0,
            distribucion: []
          };
        }

        const distribucion: OpcionCualitativaEstadistica[] = Array.from(conteoMap.entries())
          .map(([opcion, votos]) => ({
            valor_cualitativo: opcion,
            votos_opcion: votos,
            total_votos_criterio: totalVotos,
            porcentaje_votos: Number(((votos / totalVotos) * 100).toFixed(1)),
            es_opcion_mas_votada: false
          }))
          .sort((a, b) => b.votos_opcion - a.votos_opcion);

        distribucion[0].es_opcion_mas_votada = true;
        const topOpt = distribucion[0].valor_cualitativo;
        const topPct = distribucion[0].porcentaje_votos;

        return {
          criterio_id: crit.id,
          criterio_nombre: crit.nombre,
          opcion_mas_escogida: topOpt,
          porcentaje_mas_escogida: topPct,
          total_votos: totalVotos,
          distribucion
        };
      });

      // 3. Observaciones del jurado
      const observaciones_jueces = candEvals
        .filter(ev => ev.observaciones && ev.observaciones.trim().length > 0)
        .map(ev => ({
          juez: ev.juez_nombre,
          comentario: ev.observaciones!.trim()
        }));

      return {
        candidata_id: cand.id,
        candidata_nombre: cand.nombre,
        candidata_foto: cand.foto_perfil,
        url_redes_sociales: cand.url_redes_sociales || null,
        categoria_id: cand.categoria_id,
        categoria_nombre: cat?.nombre || 'General',
        ranking_posicion: rInfo.pos,
        puntaje_total_promedio: rInfo.avg,
        total_evaluaciones: candEvals.length,
        criterios_con_puntaje: criteriosConPuntaje,
        criterios_cualitativos: criteriosCualitativos,
        observaciones_jueces
      };
    });

    resultados.sort((a, b) => {
      if (a.ranking_posicion !== b.ranking_posicion) {
        return a.ranking_posicion - b.ranking_posicion;
      }
      return b.puntaje_total_promedio - a.puntaje_total_promedio;
    });

    return resultados;
  }
}

