import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CriterioEvaluativo } from '../../../core/models';

@Component({
  selector: 'me-criterios-cualitativos-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './me-criterios-cualitativos-form.component.html',
  styleUrl: './me-criterios-cualitativos-form.component.scss'
})
export class MeCriteriosCualitativosFormComponent {
  @Input() criterios: CriterioEvaluativo[] = [];
  @Input() qualitativeMap: Record<number, string> = {};

  @Output() qualitativeChanged = new EventEmitter<{ criterioId: number; option: string }>();

  onQualitativeChange(criterioId: number, option: string): void {
    this.qualitativeChanged.emit({ criterioId, option });
  }
}
