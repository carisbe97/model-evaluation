import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MejorPorCriterio } from '../../../../core/models';

@Component({
  selector: 'app-criterios-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './criterios-tab.component.html'
})
export class CriteriosTabComponent {
  @Input({ required: true }) mejoresPorCriterio: MejorPorCriterio[] = [];
}
