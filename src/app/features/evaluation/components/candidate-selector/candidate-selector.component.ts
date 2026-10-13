import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Candidata } from '../../../../core/models';
import { JudgeSessionService } from '../../../../core/services/judge-session.service';

@Component({
  selector: 'app-candidate-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candidate-selector.component.html',
  styleUrl: './candidate-selector.component.scss'
})
export class CandidateSelectorComponent {
  private readonly judgeSession = inject(JudgeSessionService);

  @Input() candidatas: Candidata[] = [];
  @Input() currentCandidateIndex: number = 0;

  @Output() candidateSelected = new EventEmitter<number>();

  isEvaluated(candidataId: number): boolean {
    return this.judgeSession.isCandidateEvaluated(candidataId);
  }

  /**
   * Ventana deslizante de hasta 5 candidatas centrada en la actual.
   */
  get visibleCandidateIndices(): number[] {
    const total = this.candidatas.length;
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i);
    }

    const current = this.currentCandidateIndex;
    let start = current - 2;
    let end = current + 2;

    if (start < 0) {
      end += Math.abs(start);
      start = 0;
    }
    if (end >= total) {
      start -= (end - (total - 1));
      end = total - 1;
    }

    start = Math.max(0, start);
    end = Math.min(total - 1, end);

    const indices: number[] = [];
    for (let i = start; i <= end; i++) {
      indices.push(i);
    }
    return indices;
  }

  formatCandidateNumber(index: number): string {
    const num = index + 1;
    return num < 10 ? `0${num}` : `${num}`;
  }

  selectCandidate(index: number): void {
    if (index >= 0 && index < this.candidatas.length) {
      this.candidateSelected.emit(index);
    }
  }
}
