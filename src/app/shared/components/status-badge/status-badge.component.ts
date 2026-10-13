import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriaEstado } from '../../../core/models';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss'
})
export class StatusBadgeComponent {
  estado = input.required<CategoriaEstado>();
}
