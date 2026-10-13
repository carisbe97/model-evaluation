import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Candidata, Categoria, CriterioEvaluativo } from '../../../../core/models';
import { JudgeSessionService } from '../../../../core/services/judge-session.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CandidateSelectorComponent } from '../candidate-selector/candidate-selector.component';
import { MeCriteriosCuantitativosFormComponent } from '../../../../shared/components/me-criterios-cuantitativos-form/me-criterios-cuantitativos-form.component';
import { MeCriteriosOrdinalesFormComponent } from '../../../../shared/components/me-criterios-ordinales-form/me-criterios-ordinales-form.component';
import { MeCriteriosCualitativosFormComponent } from '../../../../shared/components/me-criterios-cualitativos-form/me-criterios-cualitativos-form.component';

@Component({
  selector: 'app-evaluation-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CandidateSelectorComponent,
    MeCriteriosCuantitativosFormComponent,
    MeCriteriosOrdinalesFormComponent,
    MeCriteriosCualitativosFormComponent
  ],
  templateUrl: './evaluation-form.component.html',
  styleUrl: './evaluation-form.component.scss'
})
export class EvaluationFormComponent {
  private readonly judgeSession = inject(JudgeSessionService);
  private readonly toastService = inject(ToastService);

  @Input() category: Categoria | null = null;
  @Input() candidate: Candidata | null = null;
  @Input() candidatas: Candidata[] = [];
  @Input() currentCandidateIndex: number = 0;
  @Input() criterios: CriterioEvaluativo[] = [];
  @Input() scoresMap: Record<number, number> = {};
  @Input() qualitativeMap: Record<number, string> = {};
  @Input() observaciones: string = '';
  @Input() isSaving: boolean = false;
  @Input() isCandidateAlreadyEvaluated: boolean = false;
  @Input() isLastCandidate: boolean = false;
  @Input() computedAverageScore: string = '5.00';

  @Output() candidateSelected = new EventEmitter<number>();
  @Output() scoreChanged = new EventEmitter<{ criterioId: number; score: number }>();
  @Output() qualitativeChanged = new EventEmitter<{ criterioId: number; option: string }>();
  @Output() observationsChanged = new EventEmitter<string>();
  @Output() prevCandidate = new EventEmitter<void>();
  @Output() saveAndProceed = new EventEmitter<void>();

  // Criterios clasificados por tipo
  get criteriosCuantitativos(): CriterioEvaluativo[] {
    return this.criterios.filter(c => c.tipo_calificacion === 'cuantitativa');
  }

  get criteriosOrdinales(): CriterioEvaluativo[] {
    return this.criterios.filter(c => c.tipo_calificacion === 'ordinal');
  }

  get criteriosCualitativos(): CriterioEvaluativo[] {
    return this.criterios.filter(c => c.tipo_calificacion === 'cualitativa');
  }

  isEvaluated(candidataId: number): boolean {
    return this.judgeSession.isCandidateEvaluated(candidataId);
  }



  onScoreChange(criterioId: number, val: number): void {
    this.scoreChanged.emit({ criterioId, score: Math.round(Number(val)) });
  }

  onQualitativeChange(criterioId: number, option: string): void {
    this.qualitativeChanged.emit({ criterioId, option });
  }

  onObservationsInput(val: string): void {
    this.observationsChanged.emit(val);
  }

  onSelectCandidate(index: number): void {
    if (index >= 0 && index < this.candidatas.length) {
      this.candidateSelected.emit(index);
    }
  }

  onPrev(): void {
    this.prevCandidate.emit();
  }

  onSave(): void {
    // 1. Validar si hay criterios cuantitativos sin calificar
    const missingCuants = this.criteriosCuantitativos.filter(
      c => this.scoresMap[c.id] === undefined || this.scoresMap[c.id] === null
    );

    // 2. Validar si hay criterios ordinales sin calificar
    const missingOrds = this.criteriosOrdinales.filter(
      c => !this.qualitativeMap[c.id] || !this.qualitativeMap[c.id].trim()
    );

    // 3. Validar si hay criterios cualitativos sin calificar
    const missingCuals = this.criteriosCualitativos.filter(
      c => !this.qualitativeMap[c.id] || !this.qualitativeMap[c.id].trim()
    );

    const totalMissing = missingCuants.length + missingOrds.length + missingCuals.length;

    if (totalMissing > 0) {
      const missingNames = [
        ...missingCuants.map(c => c.nombre),
        ...missingOrds.map(c => c.nombre),
        ...missingCuals.map(c => c.nombre)
      ];

      const mensaje = totalMissing === 1
        ? `Falta calificar el criterio: "${missingNames[0]}". Todos los criterios son obligatorios.`
        : `Tienes ${totalMissing} criterios sin calificar (${missingNames.slice(0, 2).join(', ')}${totalMissing > 2 ? '...' : ''}). Todos son obligatorios.`;

      this.toastService.warning(mensaje, 'Criterios Incompletos');
      return;
    }

    this.saveAndProceed.emit();
  }
}
