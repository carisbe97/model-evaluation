import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoriasService } from '../../core/services/categorias.service';
import { CandidatasService } from '../../core/services/candidatas.service';
import { CriteriosService } from '../../core/services/criterios.service';
import { EvaluacionesService } from '../../core/services/evaluaciones.service';
import { JudgeSessionService } from '../../core/services/judge-session.service';
import { ToastService } from '../../core/services/toast.service';
import { Candidata, Categoria, CriterioEvaluativo, EvaluacionRegistro, DetalleCriterioEvaluado } from '../../core/models';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { SocialPreviewComponent } from '../../shared/components/social-preview/social-preview.component';
import { CandidateGalleryComponent } from './components/candidate-gallery/candidate-gallery.component';
import { EvaluationFormComponent } from './components/evaluation-form/evaluation-form.component';

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoaderComponent,
    SocialPreviewComponent,
    CandidateGalleryComponent,
    EvaluationFormComponent
  ],
  templateUrl: './evaluation.component.html',
  styleUrl: './evaluation.component.scss'
})
export class EvaluationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Servicios desacoplados por dominio
  private readonly categoriasService = inject(CategoriasService);
  private readonly candidatasService = inject(CandidatasService);
  private readonly criteriosService = inject(CriteriosService);
  private readonly evaluacionesService = inject(EvaluacionesService);

  readonly judgeSession = inject(JudgeSessionService);
  readonly toastService = inject(ToastService);

  categoryId = signal<number>(0);
  currentCategory = signal<Categoria | null>(null);
  candidatas = signal<Candidata[]>([]);
  criterios = signal<CriterioEvaluativo[]>([]);

  currentCandidateIndex = signal<number>(0);

  // Estado reactivo de la calificación actual
  scoresMap = signal<Record<number, number>>({});
  qualitativeMap = signal<Record<number, string>>({});
  observaciones = '';
  isSaving = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  isCandidateAlreadyEvaluated = signal<boolean>(false);

  currentCandidate = computed(() => {
    const list = this.candidatas();
    const idx = this.currentCandidateIndex();
    return list[idx] || null;
  });

  isLastCandidate = computed(() => {
    return this.currentCandidateIndex() >= this.candidatas().length - 1;
  });

  criteriosCuantitativos = computed(() => {
    return this.criterios().filter(c => c.tipo_calificacion === 'cuantitativa');
  });

  criteriosOrdinales = computed(() => {
    return this.criterios().filter(c => c.tipo_calificacion === 'ordinal');
  });

  /**
   * Calcula el puntaje numérico equivalente para una opción ordinal seleccionada.
   */
  getOrdinalOptionScore(crit: CriterioEvaluativo, optionText: string): number {
    const options = crit.opciones_cualitativas || [];
    if (options.length === 0) return crit.puntaje_maximo ?? 5;
    const idx = options.indexOf(optionText);
    if (idx === -1) return crit.puntaje_minimo ?? 1;

    const min = crit.puntaje_minimo ?? 1;
    const max = crit.puntaje_maximo ?? 5;

    if (options.length === 1) return max;

    const step = (max - min) / (options.length - 1);
    const calculated = min + (idx * step);
    return Number(calculated.toFixed(2));
  }

  /**
   * Promedio ponderado reactivo en vivo:
   * Incluye tanto los criterios cuantitativos directos como los criterios ordinales.
   */
  computedAverageScore = computed(() => {
    const cuants = this.criteriosCuantitativos();
    const ords = this.criteriosOrdinales();
    const allScored = [...cuants, ...ords];

    if (allScored.length === 0) return '--';

    const numScores = this.scoresMap();
    const textScores = this.qualitativeMap();

    let totalWeight = 0;
    let weightedSum = 0;

    // 1. Criterios cuantitativos directos
    cuants.forEach(c => {
      const score = numScores[c.id];
      if (score !== undefined && score !== null) {
        const weight = (c.peso && c.peso > 0) ? c.peso : (100 / allScored.length);
        weightedSum += score * weight;
        totalWeight += weight;
      }
    });

    // 2. Criterios ordinales (escala Likert ponderada)
    ords.forEach(c => {
      const selectedOpt = textScores[c.id];
      if (selectedOpt) {
        const score = this.getOrdinalOptionScore(c, selectedOpt);
        const weight = (c.peso && c.peso > 0) ? c.peso : (100 / allScored.length);
        weightedSum += score * weight;
        totalWeight += weight;
      }
    });

    if (totalWeight === 0) return '--';
    const avg = weightedSum / totalWeight;
    return avg.toFixed(2);
  });

  async ngOnInit(): Promise<void> {
    const rawCatId = this.route.snapshot.paramMap.get('categoryId') || '0';
    const catIdNum = Number(rawCatId);
    this.categoryId.set(catIdNum);

    try {
      this.isLoading.set(true);
      const [allCats, candList, critList] = await Promise.all([
        this.categoriasService.getCategorias(),
        this.candidatasService.getCandidatas(catIdNum),
        this.criteriosService.getCriterios(catIdNum)
      ]);

      const foundCat = allCats.find(c => Number(c.id) === catIdNum) || null;
      this.currentCategory.set(foundCat);
      this.candidatas.set(candList);
      this.criterios.set(critList);

      if (candList.length > 0) {
        this.loadCandidateForm(0);
      }
    } catch (e) {
      console.error('Error cargando información de la evaluación:', e);
    } finally {
      this.isLoading.set(false);
    }
  }

  selectCandidateIndex(index: number): void {
    if (index >= 0 && index < this.candidatas().length) {
      this.loadCandidateForm(index);
    }
  }

  onScoreChange(criterioId: number, val: number): void {
    this.scoresMap.update(prev => ({
      ...prev,
      [criterioId]: Math.round(Number(val))
    }));
  }

  onQualitativeChange(criterioId: number, option: string): void {
    this.qualitativeMap.update(prev => ({
      ...prev,
      [criterioId]: option
    }));
  }

  onPrevCandidate(): void {
    if (this.currentCandidateIndex() > 0) {
      this.loadCandidateForm(this.currentCandidateIndex() - 1);
    }
  }

  async onSaveAndProceed(): Promise<void> {
    const cand = this.currentCandidate();
    const judge = this.judgeSession.currentJudgeName();
    if (!cand || !judge) return;

    const crits = this.criterios();
    const scores = this.scoresMap();
    const qualiScores = this.qualitativeMap();

    // Validar si existen criterios obligatorios sin responder
    const missingCrits = crits.filter(c => {
      if (c.tipo_calificacion === 'cuantitativa') {
        return scores[c.id] === undefined || scores[c.id] === null;
      } else {
        return !qualiScores[c.id] || !qualiScores[c.id].trim();
      }
    });

    if (missingCrits.length > 0) {
      const missingNames = missingCrits.map(c => c.nombre);
      const msg = missingCrits.length === 1
        ? `Falta calificar el criterio: "${missingNames[0]}". Todos los criterios son obligatorios.`
        : `Tienes ${missingCrits.length} criterios sin calificar (${missingNames.slice(0, 2).join(', ')}${missingCrits.length > 2 ? '...' : ''}). Todos son obligatorios.`;
      this.toastService.warning(msg, 'Criterios Incompletos');
      return;
    }

    this.isSaving.set(true);

    // Construir desglose en JSONB con los valores reales del juez
    const notasCriterios: DetalleCriterioEvaluado[] = crits.map(c => {
      if (c.tipo_calificacion === 'cualitativa') {
        const selectedVal = qualiScores[c.id] || '';
        return {
          criterio_id: c.id,
          criterio_nombre: c.nombre,
          valor_cualitativo: selectedVal
        };
      } else if (c.tipo_calificacion === 'ordinal') {
        const selectedVal = qualiScores[c.id] || '';
        const numScore = this.getOrdinalOptionScore(c, selectedVal);
        return {
          criterio_id: c.id,
          criterio_nombre: c.nombre,
          valor_cualitativo: selectedVal,
          puntaje: numScore
        };
      } else {
        const numScore = Math.round(Number(scores[c.id]));
        return {
          criterio_id: c.id,
          criterio_nombre: c.nombre,
          puntaje: numScore
        };
      }
    });

    const juezObj = this.judgeSession.currentJudge();
    const totalScoreNum = this.computedAverageScore() !== '--'
      ? Number(this.computedAverageScore())
      : 0;

    const evaluacionPayload: EvaluacionRegistro = {
      juez_id: juezObj?.id,
      juez_nombre: judge,
      candidata_id: Number(cand.id),
      categoria_id: Number(this.categoryId()),
      notas_criterios: notasCriterios,
      puntaje_total: totalScoreNum,
      observaciones: this.observaciones.trim() || undefined
    };

    try {
      // 1. Guardar en base de datos
      await this.evaluacionesService.guardarEvaluacion(evaluacionPayload);

      // 2. Registrar en sesión local para reflejo inmediato
      this.judgeSession.recordLocalEvaluation(evaluacionPayload);

      this.toastService.success(`Evaluación de ${cand.nombre} registrada correctamente.`);

      // 3. Pasar a la siguiente candidata o retornar a categorías si finalizó
      if (this.isLastCandidate()) {
        this.router.navigate(['/categories']);
      } else {
        this.loadCandidateForm(this.currentCandidateIndex() + 1);
      }
    } catch (err) {
      console.error('Error al guardar evaluación:', err);
      this.toastService.error('Error al guardar la evaluación. Intente nuevamente.');
    } finally {
      this.isSaving.set(false);
    }
  }

  private loadCandidateForm(index: number): void {
    this.currentCandidateIndex.set(index);
    const cand = this.candidatas()[index];
    if (!cand) return;

    // Revisar si ya existía evaluación previa
    const existing = this.judgeSession.getCandidateEvaluation(cand.id);
    this.isCandidateAlreadyEvaluated.set(!!existing);

    const initialScores: Record<number, number> = {};
    const initialQuali: Record<number, string> = {};

    if (existing && existing.notas_criterios) {
      existing.notas_criterios.forEach(nc => {
        if (nc.puntaje !== undefined && nc.puntaje !== null) {
          initialScores[nc.criterio_id] = Math.round(Number(nc.puntaje));
        }
        if (nc.valor_cualitativo) {
          initialQuali[nc.criterio_id] = nc.valor_cualitativo;
        }
      });
      this.observaciones = existing.observaciones || '';
    } else {
      // Sin valores por defecto: el juez debe seleccionar conscientemente cada criterio
      this.observaciones = '';
    }

    this.scoresMap.set(initialScores);
    this.qualitativeMap.set(initialQuali);
  }
}
