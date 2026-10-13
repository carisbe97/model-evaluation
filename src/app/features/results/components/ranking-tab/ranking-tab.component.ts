import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RankingCategoria } from '../../../../core/models';

@Component({
  selector: 'app-ranking-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking-tab.component.html'
})
export class RankingTabComponent {
  @Input({ required: true }) ranking: RankingCategoria[] = [];
  @Input() topWinners: RankingCategoria[] = [];
  @Output() viewCandidate = new EventEmitter<number>();

  onViewCandidate(candidataId: number): void {
    this.viewCandidate.emit(candidataId);
  }
}
