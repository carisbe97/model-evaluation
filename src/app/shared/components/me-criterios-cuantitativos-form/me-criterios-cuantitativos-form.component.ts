import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CriterioEvaluativo } from '../../../core/models';

@Component({
  selector: 'me-criterios-cuantitativos-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './me-criterios-cuantitativos-form.component.html',
  styleUrl: './me-criterios-cuantitativos-form.component.scss'
})
export class MeCriteriosCuantitativosFormComponent {
  @Input() criterios: CriterioEvaluativo[] = [];
  @Input() scoresMap: Record<number, number> = {};

  @Output() scoreChanged = new EventEmitter<{ criterioId: number; score: number }>();

  getCriteriaStars(crit: CriterioEvaluativo): number[] {
    const min = Math.max(1, Math.floor(crit.puntaje_minimo ?? 1));
    const max = Math.max(min, Math.floor(crit.puntaje_maximo ?? 10));
    const stars: number[] = [];
    for (let i = min; i <= max; i++) {
      stars.push(i);
    }
    return stars;
  }

  onScoreChange(criterioId: number, val: number): void {
    this.scoreChanged.emit({ criterioId, score: Math.round(Number(val)) });
  }
}
