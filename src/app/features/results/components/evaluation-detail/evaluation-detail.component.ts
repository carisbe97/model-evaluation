import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EvaluacionesService } from '../../../../core/services/evaluaciones.service';
import { CandidatasService } from '../../../../core/services/candidatas.service';
import { CategoriasService } from '../../../../core/services/categorias.service';
import { CriteriosService } from '../../../../core/services/criterios.service';
import { JudgeSessionService } from '../../../../core/services/judge-session.service';
import { EvaluacionRegistro, Candidata, Categoria, CriterioEvaluativo, DetalleCriterioEvaluado } from '../../../../core/models';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';

export interface CriterioDetalleView {
  criterio_id: number;
  nombre: string;
  descripcion?: string;
  tipo: 'cuantitativa' | 'ordinal' | 'cualitativa';
  peso?: number | null;
  puntaje?: number;
  valor_cualitativo?: string;
  puntaje_maximo?: number;
}

@Component({
  selector: 'app-evaluation-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent],
  templateUrl: './evaluation-detail.component.html'
})
export class EvaluationDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly evaluacionesService = inject(EvaluacionesService);
  private readonly candidatasService = inject(CandidatasService);
  private readonly categoriasService = inject(CategoriasService);
  private readonly criteriosService = inject(CriteriosService);
  private readonly judgeSession = inject(JudgeSessionService);

  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  evaluacion = signal<EvaluacionRegistro | null>(null);
  candidata = signal<Candidata | null>(null);
  categoria = signal<Categoria | null>(null);
  criterios = signal<CriterioEvaluativo[]>([]);

  criteriosCuantitativos = signal<CriterioDetalleView[]>([]);
  criteriosOrdinales = signal<CriterioDetalleView[]>([]);
  criteriosCualitativos = signal<CriterioDetalleView[]>([]);

  async ngOnInit(): Promise<void> {
    await this.loadEvaluationDetail();
  }

  async loadEvaluationDetail(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const idParam = this.route.snapshot.paramMap.get('id');
      const queryJuez = this.route.snapshot.queryParamMap.get('juez');
      const currentJudge = this.judgeSession.currentJudgeName();

      let foundEval: EvaluacionRegistro | null = null;

      // 1. Intentar buscar por ID numérico directo
      if (idParam && !isNaN(Number(idParam))) {
        foundEval = await this.evaluacionesService.getEvaluacionById(Number(idParam));
      }

      // 2. Si no se encontró por ID, intentar buscar por (juez, candidata_id)
      const judgeToSearch = queryJuez || currentJudge;
      if (!foundEval && idParam && judgeToSearch) {
        foundEval = await this.evaluacionesService.getEvaluacionPorJuezYCandidata(
          judgeToSearch,
          Number(idParam)
        );
      }

      // 3. Fallback: buscar en la sesión local activa
      if (!foundEval && idParam) {
        const localEvals = this.judgeSession.judgeEvaluations();
        foundEval =
          localEvals.find(
            e =>
              (e.id !== undefined && Number(e.id) === Number(idParam)) ||
              (Number(e.candidata_id) === Number(idParam) &&
                (!judgeToSearch || e.juez_nombre.toLowerCase() === judgeToSearch.toLowerCase()))
          ) || null;
      }

      if (!foundEval) {
        this.errorMessage.set('No se encontró el registro de evaluación solicitado.');
        return;
      }

      this.evaluacion.set(foundEval);

      // Cargar entidades relacionadas en paralelo
      const [cand, cat, crits] = await Promise.all([
        this.candidatasService.getCandidataById(foundEval.candidata_id),
        this.categoriasService.getCategoriaById(foundEval.categoria_id),
        this.criteriosService.getCriterios(foundEval.categoria_id)
      ]);

      this.candidata.set(cand);
      this.categoria.set(cat);
      this.criterios.set(crits);

      this.processCriteriosBreakdown(foundEval.notas_criterios, crits);
    } catch (err) {
      console.error('Error al cargar detalle de evaluación:', err);
      this.errorMessage.set('Ocurrió un error al cargar la evaluación.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private processCriteriosBreakdown(
    notas: DetalleCriterioEvaluado[],
    critsOficiales: CriterioEvaluativo[]
  ): void {
    const cuants: CriterioDetalleView[] = [];
    const ords: CriterioDetalleView[] = [];
    const cualis: CriterioDetalleView[] = [];

    const critsMap = new Map<number, CriterioEvaluativo>();
    critsOficiales.forEach(c => critsMap.set(c.id, c));

    notas.forEach(nota => {
      const criterioMeta = critsMap.get(nota.criterio_id);
      const nombre = nota.criterio_nombre || criterioMeta?.nombre || `Criterio #${nota.criterio_id}`;
      const tipo = criterioMeta?.tipo_calificacion || this.inferTipo(nota);

      const item: CriterioDetalleView = {
        criterio_id: nota.criterio_id,
        nombre,
        descripcion: criterioMeta?.descripcion,
        tipo,
        peso: criterioMeta?.peso,
        puntaje: nota.puntaje,
        valor_cualitativo: nota.valor_cualitativo,
        puntaje_maximo: criterioMeta?.puntaje_maximo ?? 5
      };

      if (tipo === 'cuantitativa') {
        cuants.push(item);
      } else if (tipo === 'ordinal') {
        ords.push(item);
      } else {
        cualis.push(item);
      }
    });

    this.criteriosCuantitativos.set(cuants);
    this.criteriosOrdinales.set(ords);
    this.criteriosCualitativos.set(cualis);
  }

  private inferTipo(nota: DetalleCriterioEvaluado): 'cuantitativa' | 'ordinal' | 'cualitativa' {
    if (nota.puntaje !== undefined && nota.valor_cualitativo) return 'ordinal';
    if (nota.puntaje !== undefined) return 'cuantitativa';
    return 'cualitativa';
  }

  getPerformanceBadge(score: number): { text: string; css: string } {
    if (score >= 4.7) return { text: 'SOBRESALIENTE', css: 'bg-amber-400/20 text-brand-goldLight border-brand-gold/40' };
    if (score >= 4.2) return { text: 'EXCELENTE', css: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    if (score >= 3.5) return { text: 'BUEN DESEMPEÑO', css: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
    return { text: 'PROMEDIO', css: 'bg-gray-500/20 text-gray-300 border-gray-500/40' };
  }
}
