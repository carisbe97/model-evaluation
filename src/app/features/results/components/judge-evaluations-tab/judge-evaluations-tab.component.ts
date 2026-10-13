import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EvaluacionRegistro, Candidata, Categoria, Juez } from '../../../../core/models';

export interface EvaluacionItemView {
  evaluacion: EvaluacionRegistro;
  candidata?: Candidata;
  categoria?: Categoria;
}

@Component({
  selector: 'app-judge-evaluations-tab',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './judge-evaluations-tab.component.html'
})
export class JudgeEvaluationsTabComponent {
  @Input({ required: true }) jueces: Juez[] = [];
  @Input({ required: true }) selectedJudge: string = '';
  @Input({ required: true }) items: EvaluacionItemView[] = [];
  @Input() isLoading: boolean = false;
  @Input() currentActiveJudgeName: string | null = null;

  @Output() judgeChange = new EventEmitter<string>();
  @Output() viewEvaluation = new EventEmitter<EvaluacionRegistro>();

  onSelectJudge(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.judgeChange.emit(target.value);
    }
  }  

  onRowClick(evaluacion: EvaluacionRegistro): void {
    this.viewEvaluation.emit(evaluacion);
  }

  isCurrentJudgeSelected(): boolean {
    if (!this.currentActiveJudgeName || !this.selectedJudge) return false;
    return this.selectedJudge.trim().toLowerCase() === this.currentActiveJudgeName.trim().toLowerCase();
  }

  getScoreBadgeClass(score: number): string {
    if (score >= 4.5) return 'bg-amber-400/20 text-brand-goldLight border-brand-gold/40';
    if (score >= 4.0) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (score >= 3.0) return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    return 'bg-gray-500/20 text-gray-300 border-gray-500/40';
  }
}
