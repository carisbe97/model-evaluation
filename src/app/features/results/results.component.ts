import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CategoriasService } from '../../core/services/categorias.service';
import { ReportesService } from '../../core/services/reportes.service';
import { CandidatasService } from '../../core/services/candidatas.service';
import { EvaluacionesService } from '../../core/services/evaluaciones.service';
import { JuecesService } from '../../core/services/jueces.service';
import { JudgeSessionService } from '../../core/services/judge-session.service';
import {
  Categoria,
  RankingCategoria,
  MejorPorCriterio,
  ConsolidadoCandidata,
  Candidata,
  Juez,
  EvaluacionRegistro
} from '../../core/models';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { RankingTabComponent } from './components/ranking-tab/ranking-tab.component';
import { CriteriosTabComponent } from './components/criterios-tab/criterios-tab.component';
import { ConsolidadosTabComponent } from './components/consolidados-tab/consolidados-tab.component';
import {
  JudgeEvaluationsTabComponent,
  EvaluacionItemView
} from './components/judge-evaluations-tab/judge-evaluations-tab.component';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoaderComponent,
    JudgeEvaluationsTabComponent,
    RankingTabComponent,
    CriteriosTabComponent,
    ConsolidadosTabComponent
  ],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly categoriasService = inject(CategoriasService);
  private readonly reportesService = inject(ReportesService);
  private readonly candidatasService = inject(CandidatasService);
  private readonly evaluacionesService = inject(EvaluacionesService);
  private readonly juecesService = inject(JuecesService);
  readonly judgeSession = inject(JudgeSessionService);

  // Por defecto se muestra la tabla de evaluaciones del juez
  activeTab = signal<'evaluaciones' | 'ranking' | 'criterios' | 'consolidados'>('evaluaciones');
  selectedCategoryFilter = signal<number | null>(null);

  // Datos para Evaluaciones por Juez
  jueces = signal<Juez[]>([]);
  selectedJudgeName = signal<string>('');
  judgeEvaluationItems = signal<EvaluacionItemView[]>([]);
  isLoadingJudgeEvaluations = signal<boolean>(true);

  // Datos para Reportes Globales
  categorias = signal<Categoria[]>([]);
  candidatas = signal<Candidata[]>([]);
  rankingData = signal<RankingCategoria[]>([]);
  mejoresPorCriterioData = signal<MejorPorCriterio[]>([]);
  consolidadosData = signal<ConsolidadoCandidata[]>([]);
  selectedCandidateId = signal<number | null>(null);
  isLoadingReports = signal(true);

  filteredRanking = computed(() => {
    const filter = this.selectedCategoryFilter();
    const data = this.rankingData();

    const listToProcess = (filter === null)
      ? [...data]
      : data.filter(r => Number(r.categoria_id) === Number(filter));

    // Ordenar de mayor a menor por promedio final; desempate por total de evaluaciones
    const sorted = listToProcess.sort((a, b) => {
      const scoreDiff = (Number(b.puntaje_total_promedio) || 0) - (Number(a.puntaje_total_promedio) || 0);
      if (scoreDiff !== 0) return scoreDiff;
      return (Number(b.total_evaluaciones) || 0) - (Number(a.total_evaluaciones) || 0);
    });

    // Asignar posición secuencial (1=Oro, 2=Plata, 3=Bronce...) según el contexto (global o categoría)
    return sorted.map((item, index) => ({
      ...item,
      ranking_posicion: index + 1
    }));
  });

  topThreeWinners = computed(() => {
    return this.filteredRanking().slice(0, 3);
  });

  filteredMejoresPorCriterio = computed(() => {
    const filter = this.selectedCategoryFilter();
    const data = this.mejoresPorCriterioData();
    if (filter === null) return data;
    return data.filter(m => Number(m.categoria_id) === Number(filter));
  });

  filteredConsolidados = computed(() => {
    const filter = this.selectedCategoryFilter();
    const data = this.consolidadosData();

    const listToProcess = (filter === null)
      ? [...data]
      : data.filter(c => Number(c.categoria_id) === Number(filter));

    const sorted = listToProcess.sort((a, b) => {
      const scoreDiff = (Number(b.puntaje_total_promedio) || 0) - (Number(a.puntaje_total_promedio) || 0);
      if (scoreDiff !== 0) return scoreDiff;
      return (Number(b.total_evaluaciones) || 0) - (Number(a.total_evaluaciones) || 0);
    });

    return sorted.map((c, index) => ({
      ...c,
      ranking_posicion: index + 1
    }));
  });

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.initJudgeEvaluations(),
      this.loadReports()
    ]);
  }

  /**
   * Inicializa el filtro de jueces seleccionando por defecto al juez en sesión activa
   */
  async initJudgeEvaluations(): Promise<void> {
    try {
      this.isLoadingJudgeEvaluations.set(true);

      const [juecesList, candidatasList, categoriasList] = await Promise.all([
        this.juecesService.getJueces(),
        this.candidatasService.getCandidatas(),
        this.categoriasService.getCategorias()
      ]);

      this.candidatas.set(candidatasList);
      this.categorias.set(categoriasList);

      const currentActiveJudge = this.judgeSession.currentJudgeName();

      // Asegurar que el juez activo esté en la lista si no existiera
      const list = [...juecesList];
      if (currentActiveJudge && !list.some(j => j.nombre.toLowerCase() === currentActiveJudge.toLowerCase())) {
        list.unshift({
          id: 0,
          nombre: currentActiveJudge,
          created_at: new Date().toISOString()
        });
      }

      this.jueces.set(list);

      // Por defecto, seleccionar el juez que hay en sesión activa
      const defaultJudge = currentActiveJudge || (list[0]?.nombre ?? '');
      this.selectedJudgeName.set(defaultJudge);

      await this.loadEvaluationsForSelectedJudge();
    } catch (err) {
      console.error('Error al inicializar evaluaciones por juez:', err);
    } finally {
      this.isLoadingJudgeEvaluations.set(false);
    }
  }

  /**
   * Carga las evaluaciones del juez seleccionado y las cruza con candidatas y categorías
   */
  async loadEvaluationsForSelectedJudge(): Promise<void> {
    const judgeName = this.selectedJudgeName().trim();
    if (!judgeName) {
      this.judgeEvaluationItems.set([]);
      return;
    }

    try {
      this.isLoadingJudgeEvaluations.set(true);

      // 1. Obtener evaluaciones registradas en base de datos/mock
      const evalsFromService = await this.evaluacionesService.getEvaluacionesPorJuez(judgeName);

      // 2. Si el juez seleccionado es el de la sesión activa, combinar con las evaluaciones locales
      const currentActive = this.judgeSession.currentJudgeName();
      let combinedEvals = [...evalsFromService];

      if (currentActive && currentActive.toLowerCase() === judgeName.toLowerCase()) {
        const localEvals = this.judgeSession.judgeEvaluations();
        localEvals.forEach(localEv => {
          const alreadyExists = combinedEvals.some(
            e => Number(e.candidata_id) === Number(localEv.candidata_id)
          );
          if (!alreadyExists) {
            combinedEvals.push(localEv);
          }
        });
      }

      // 3. Cruzar con candidatas y categorías
      const candidatasMap = new Map<number, Candidata>();
      this.candidatas().forEach(c => candidatasMap.set(c.id, c));

      const categoriasMap = new Map<number, Categoria>();
      this.categorias().forEach(cat => categoriasMap.set(cat.id, cat));

      const items: EvaluacionItemView[] = combinedEvals.map(evaluacion => ({
        evaluacion,
        candidata: candidatasMap.get(Number(evaluacion.candidata_id)),
        categoria: categoriasMap.get(Number(evaluacion.categoria_id))
      }));

      // Ordenar por ID o fecha más reciente
      items.sort((a, b) => (b.evaluacion.id || 0) - (a.evaluacion.id || 0));

      this.judgeEvaluationItems.set(items);
    } catch (err) {
      console.error('Error cargando evaluaciones para el juez:', err);
      this.judgeEvaluationItems.set([]);
    } finally {
      this.isLoadingJudgeEvaluations.set(false);
    }
  }

  /**
   * Cambia el juez en el filtro y recarga sus evaluaciones
   */
  async onJudgeChange(judgeName: string): Promise<void> {
    this.selectedJudgeName.set(judgeName);
    await this.loadEvaluationsForSelectedJudge();
  }

  /**
   * Navega a la pantalla de detalle de la evaluación
   */
  onViewEvaluation(evaluacion: EvaluacionRegistro): void {
    const evalId = evaluacion.id ?? evaluacion.candidata_id;
    this.router.navigate(['/results/evaluation', evalId], {
      queryParams: { juez: evaluacion.juez_nombre }
    });
  }

  setCategoryFilter(catId: number | null): void {
    this.selectedCategoryFilter.set(catId);
    const list = this.filteredConsolidados();
    if (list.length > 0) {
      this.selectedCandidateId.set(list[0].candidata_id);
    }
  }

  selectCandidate(candidataId: number): void {
    this.selectedCandidateId.set(candidataId);
  }

  viewCandidateConsolidado(candidataId: number): void {
    this.selectedCandidateId.set(candidataId);
    this.activeTab.set('consolidados');
  }

  async loadReports(): Promise<void> {
    try {
      this.isLoadingReports.set(true);
      const [cats, ranking, mejores, consolidados] = await Promise.all([
        this.categoriasService.getCategorias(),
        this.reportesService.getRankingPorCategoria(),
        this.reportesService.getMejoresPorCriterio(),
        this.reportesService.getConsolidadosPorCandidata()
      ]);
      this.categorias.set(cats);
      this.rankingData.set(ranking);
      this.mejoresPorCriterioData.set(mejores);
      this.consolidadosData.set(consolidados);

      if (consolidados.length > 0 && this.selectedCandidateId() === null) {
        this.selectedCandidateId.set(consolidados[0].candidata_id);
      }
    } catch (err) {
      console.error('Error cargando reportes:', err);
    } finally {
      this.isLoadingReports.set(false);
    }
  }
}
