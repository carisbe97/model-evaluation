import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsolidadoCandidata } from '../../../../core/models';
import { SocialPreviewComponent } from '../../../../shared/components/social-preview/social-preview.component';

@Component({
  selector: 'app-consolidados-tab',
  standalone: true,
  imports: [CommonModule, SocialPreviewComponent],
  templateUrl: './consolidados-tab.component.html'
})
export class ConsolidadosTabComponent {
  @Input({ required: true }) set consolidados(val: ConsolidadoCandidata[]) {
    this._consolidados.set(val || []);
  }
  @Input() set selectedCandidateId(val: number | null) {
    this._selectedCandidateId.set(val);
  }
  @Output() selectCandidate = new EventEmitter<number>();

  readonly _consolidados = signal<ConsolidadoCandidata[]>([]);
  readonly _selectedCandidateId = signal<number | null>(null);

  readonly selectedCandidate = computed<ConsolidadoCandidata | null>(() => {
    const list = this._consolidados();
    const selId = this._selectedCandidateId();
    if (selId !== null) {
      const found = list.find(c => Number(c.candidata_id) === Number(selId));
      if (found) return found;
    }
    return list.length > 0 ? list[0] : null;
  });

  onSelectCandidate(id: number): void {
    this._selectedCandidateId.set(id);
    this.selectCandidate.emit(id);
  }
}
