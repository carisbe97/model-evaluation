import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CriterioEvaluativo } from '../../../core/models';

@Component({
  selector: 'me-criterios-ordinales-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './me-criterios-ordinales-form.component.html',
  styleUrl: './me-criterios-ordinales-form.component.scss'
})
export class MeCriteriosOrdinalesFormComponent {
  @Input() criterios: CriterioEvaluativo[] = [];
  @Input() qualitativeMap: Record<number, string> = {};

  @Output() qualitativeChanged = new EventEmitter<{ criterioId: number; option: string }>();

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

  onQualitativeChange(criterioId: number, option: string): void {
    this.qualitativeChanged.emit({ criterioId, option });
  }
}
