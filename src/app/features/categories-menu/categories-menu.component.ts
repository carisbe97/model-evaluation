import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CategoriasService } from '../../core/services/categorias.service';
import { CandidatasService } from '../../core/services/candidatas.service';
import { JudgeSessionService } from '../../core/services/judge-session.service';
import { Categoria, CategoriaConProgreso, CategoriaEstado } from '../../core/models';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-categories-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, LoaderComponent],
  templateUrl: './categories-menu.component.html',
  styleUrl: './categories-menu.component.scss'
})
export class CategoriesMenuComponent implements OnInit {
  private readonly categoriasService = inject(CategoriasService);
  private readonly candidatasService = inject(CandidatasService);
  readonly judgeSession = inject(JudgeSessionService);
  private readonly router = inject(Router);

  rawCategories = signal<Categoria[]>([]);
  isLoading = signal(true);
  totalCandidatesCount = signal(0);

  // Computa el progreso reactivo de cada categoría usando las Signals de judgeSession
  categoriesWithProgress = computed<CategoriaConProgreso[]>(() => {
    const cats = this.rawCategories();
    // Leer judgeEvaluations para suscripción reactiva a cambios
    this.judgeSession.judgeEvaluations();

    return cats.map(cat => {
      const total = cat.total_candidatas ?? 0;
      const evaluadas = this.judgeSession.getEvaluatedCountForCategory(cat.id);
      let estado: CategoriaEstado = 'Pendiente';
      if (total > 0 && evaluadas >= total) {
        estado = 'Completada';
      } else if (evaluadas > 0) {
        estado = 'En Progreso';
      }
      return {
        ...cat,
        total_candidatas: total,
        evaluadas,
        estado
      };
    });
  });

  progressPercentage = computed(() => {
    const total = this.totalCandidatesCount();
    if (total === 0) return 0;
    const evaluated = this.judgeSession.totalEvaluated();
    return Math.min(100, Math.round((evaluated / total) * 100));
  });

  async ngOnInit(): Promise<void> {
    try {
      this.isLoading.set(true);
      const [cats, candList] = await Promise.all([
        this.categoriasService.getCategorias(),
        this.candidatasService.getCandidatas()
      ]);
      const catsWithCount = cats.map(cat => ({
        ...cat,
        total_candidatas: candList.filter(c => Number(c.categoria_id) === Number(cat.id)).length
      }));
      this.rawCategories.set(catsWithCount);
      this.totalCandidatesCount.set(candList.length);
    } catch (err) {
      console.error('Error cargando categorías:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  onStartCategory(categoriaId: number | string): void {
    this.router.navigate(['/evaluation', categoriaId]);
  }
}
