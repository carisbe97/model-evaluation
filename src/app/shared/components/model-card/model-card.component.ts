import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Candidata } from '../../../core/models';

@Component({
  selector: 'app-model-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './model-card.component.html',
  styleUrl: './model-card.component.scss'
})
export class ModelCardComponent {
  candidata = input.required<Candidata>();
  isEvaluated = input<boolean>(false);
  cardClick = output<Candidata>();
}
