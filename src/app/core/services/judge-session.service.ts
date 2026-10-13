import { Injectable, computed, signal, inject } from '@angular/core';
import { EvaluacionRegistro, Juez, JuezLoginResult } from '../models';
import { JuecesService } from './jueces.service';
import { EvaluacionesService } from './evaluaciones.service';

const STORAGE_KEY_JUDGE_NAME = 'vogue_elite_judge_name';
const STORAGE_KEY_JUDGE_DATA = 'vogue_elite_judge_data';
const STORAGE_KEY_EVALUATIONS = 'vogue_elite_judge_evaluations';

@Injectable({
  providedIn: 'root'
})
export class JudgeSessionService {
  private readonly juecesService = inject(JuecesService);
  private readonly evaluacionesService = inject(EvaluacionesService);

  // Signals para el estado reactivo del juez
  readonly currentJudge = signal<Juez | null>(this.getInitialJudge());
  readonly currentJudgeName = signal<string | null>(this.getInitialJudgeName());
  readonly judgeEvaluations = signal<EvaluacionRegistro[]>(this.getInitialEvaluations());
  readonly isExistingJudge = signal<boolean>(false);
  readonly isLoggingIn = signal<boolean>(false);

  // Señales computadas
  readonly isAuthenticated = computed(() => {
    const name = this.currentJudgeName();
    return typeof name === 'string' && name.trim().length > 0;
  });

  readonly totalEvaluated = computed(() => this.judgeEvaluations().length);

  constructor() {}

  /**
   * Autenticación simplificada del juez:
   * Valida si existe mediante el servicio de jueces.
   * Si no existe, lo crea automáticamente.
   * Carga inmediatamente todas sus evaluaciones previas desde el servicio de evaluaciones.
   */
  async loginJudge(name: string): Promise<JuezLoginResult> {
    const trimmed = name.trim().toUpperCase();
    if (!trimmed) {
      throw new Error('El nombre del juez es requerido.');
    }

    this.isLoggingIn.set(true);

    try {
      // 1. Validar o registrar juez mediante la capa de servicios desacoplada
      const authResult = await this.juecesService.autenticarOcrearJuez(trimmed);

      // 2. Obtener evaluaciones previas del juez mediante el servicio de evaluaciones
      const evaluaciones = await this.evaluacionesService.getEvaluacionesPorJuez(authResult.juez.nombre);

      // 3. Actualizar signals reactivos
      this.currentJudge.set(authResult.juez);
      this.currentJudgeName.set(authResult.juez.nombre);
      this.judgeEvaluations.set(evaluaciones);
      this.isExistingJudge.set(!authResult.esNuevo);

      // 4. Persistir en sessionStorage
      this.persistSession(authResult.juez, evaluaciones);

      return {
        juez: authResult.juez,
        esNuevo: authResult.esNuevo,
        evaluaciones
      };
    } finally {
      this.isLoggingIn.set(false);
    }
  }

  /**
   * Asignación directa de nombre de juez
   */
  setJudgeName(name: string): void {
    const trimmed = name.trim().toUpperCase();
    if (!trimmed) return;

    this.currentJudgeName.set(trimmed);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(STORAGE_KEY_JUDGE_NAME, trimmed);
    }
  }

  /**
   * Cierra o reinicia la sesión del juez actual
   */
  clearJudgeSession(): void {
    this.currentJudge.set(null);
    this.currentJudgeName.set(null);
    this.judgeEvaluations.set([]);
    this.isExistingJudge.set(false);

    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(STORAGE_KEY_JUDGE_NAME);
      window.sessionStorage.removeItem(STORAGE_KEY_JUDGE_DATA);
      window.sessionStorage.removeItem(STORAGE_KEY_EVALUATIONS);
    }
  }

  /**
   * Registra o actualiza una evaluación localmente para reflejo instantáneo en la UI
   */
  recordLocalEvaluation(evaluacion: EvaluacionRegistro): void {
    const current = this.judgeEvaluations();
    // Reemplaza o agrega evaluación para esta candidata y este juez
    const updated = [
      ...current.filter(e => !(Number(e.candidata_id) === Number(evaluacion.candidata_id) && e.juez_nombre.toLowerCase() === evaluacion.juez_nombre.toLowerCase())),
      evaluacion
    ];

    this.judgeEvaluations.set(updated);
    this.persistEvaluations(updated);
  }

  /**
   * Comprueba si una candidata ya fue evaluada por este juez
   */
  isCandidateEvaluated(candidataId: number | string): boolean {
    const judge = this.currentJudgeName();
    if (!judge) return false;
    const candIdNum = Number(candidataId);
    return this.judgeEvaluations().some(
      e => Number(e.candidata_id) === candIdNum && e.juez_nombre.toLowerCase() === judge.toLowerCase()
    );
  }

  /**
   * Obtiene la evaluación existente de una candidata (si la hay)
   */
  getCandidateEvaluation(candidataId: number | string): EvaluacionRegistro | undefined {
    const judge = this.currentJudgeName();
    if (!judge) return undefined;
    const candIdNum = Number(candidataId);
    return this.judgeEvaluations().find(
      e => Number(e.candidata_id) === candIdNum && e.juez_nombre.toLowerCase() === judge.toLowerCase()
    );
  }

  /**
   * Obtiene la cantidad de candidatas evaluadas para una categoría dada
   */
  getEvaluatedCountForCategory(categoriaId: number | string): number {
    const judge = this.currentJudgeName();
    if (!judge) return 0;
    const catIdNum = Number(categoriaId);
    return this.judgeEvaluations().filter(
      e => Number(e.categoria_id) === catIdNum && e.juez_nombre.toLowerCase() === judge.toLowerCase()
    ).length;
  }

  /**
   * Determina si una categoría está completada por el juez
   */
  isCategoryCompleted(categoriaId: number | string, totalCandidatesInCategory: number): boolean {
    if (totalCandidatesInCategory <= 0) return false;
    const evaluated = this.getEvaluatedCountForCategory(categoriaId);
    return evaluated >= totalCandidatesInCategory;
  }

  // --- Soporte de almacenamiento de sesión ---
  private getInitialJudge(): Juez | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = window.sessionStorage.getItem(STORAGE_KEY_JUDGE_DATA);
      if (stored) {
        try {
          return JSON.parse(stored) as Juez;
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  private getInitialJudgeName(): string | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(STORAGE_KEY_JUDGE_NAME);
    }
    return null;
  }

  private getInitialEvaluations(): EvaluacionRegistro[] {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = window.sessionStorage.getItem(STORAGE_KEY_EVALUATIONS);
      if (stored) {
        try {
          return JSON.parse(stored) as EvaluacionRegistro[];
        } catch {
          return [];
        }
      }
    }
    return [];
  }

  private persistSession(juez: Juez, evaluations: EvaluacionRegistro[]): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(STORAGE_KEY_JUDGE_NAME, juez.nombre);
      window.sessionStorage.setItem(STORAGE_KEY_JUDGE_DATA, JSON.stringify(juez));
      window.sessionStorage.setItem(STORAGE_KEY_EVALUATIONS, JSON.stringify(evaluations));
    }
  }

  private persistEvaluations(evaluations: EvaluacionRegistro[]): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(STORAGE_KEY_EVALUATIONS, JSON.stringify(evaluations));
    }
  }
}
