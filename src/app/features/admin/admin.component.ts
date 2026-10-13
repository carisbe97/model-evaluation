import { Component, OnInit, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoriasService } from '../../core/services/categorias.service';
import { CriteriosService } from '../../core/services/criterios.service';
import { CandidatasService } from '../../core/services/candidatas.service';
import { ToastService } from '../../core/services/toast.service';
import { Categoria, CriterioEvaluativo } from '../../core/models';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ModalCategoriaFormComponent } from './components/modal-categoria-form/modal-categoria-form.component';
import { ModalCriterioFormComponent } from './components/modal-criterio-form/modal-criterio-form.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoaderComponent,
    ModalCategoriaFormComponent,
    ModalCriterioFormComponent
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  private readonly categoriasService = inject(CategoriasService);
  private readonly criteriosService = inject(CriteriosService);
  private readonly candidatasService = inject(CandidatasService);
  readonly toastService = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  // Estados reactivos principales
  categorias = signal<Categoria[]>([]);
  criterios = signal<CriterioEvaluativo[]>([]);
  selectedCategoria = signal<Categoria | null>(null);

  // Mapas de conteo para feedback en tarjetas
  candidatasCountMap = signal<Record<number, number>>({});
  criteriosCountMap = signal<Record<number, number>>({});

  // Indicadores de carga
  isLoading = signal<boolean>(true);
  isLoadingCriterios = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  // ==========================================
  // ESTADO MODAL CATEGORÍA
  // ==========================================
  modalCategoriaOpen = signal<boolean>(false);
  modalCategoriaMode = signal<'create' | 'edit'>('create');
  categoriaEnEdicion = signal<Categoria | null>(null);

  siguienteOrdenCategoria = computed<number>(() => {
    const list = this.categorias();
    const max = list.reduce((m, c) => Math.max(m, c.orden || 0), 0);
    return max + 1;
  });

  // ==========================================
  // ESTADO MODAL CRITERIO
  // ==========================================
  modalCriterioOpen = signal<boolean>(false);
  modalCriterioMode = signal<'create' | 'edit'>('create');
  criterioEnEdicion = signal<CriterioEvaluativo | null>(null);

  siguienteOrdenCriterio = computed<number>(() => {
    const list = this.criterios();
    const max = list.reduce((m, c) => Math.max(m, c.orden || 0), 0);
    return max + 1;
  });

  // ==========================================
  // MODAL CONFIRMACIÓN ELIMINACIÓN
  // ==========================================
  modalDeleteOpen = signal<boolean>(false);
  deleteTarget = signal<{
    type: 'categoria' | 'criterio';
    id: number;
    nombre: string;
    warningMessage?: string;
  } | null>(null);

  // ==========================================
  // CÁLCULOS REACTIVOS
  // ==========================================
  totalPesoPorcentual = computed<number>(() => {
    const list = this.criterios();
    return list
      .filter(c => (c.tipo_calificacion === 'cuantitativa' || c.tipo_calificacion === 'ordinal') && c.peso)
      .reduce((sum, c) => sum + Number(c.peso || 0), 0);
  });

  async ngOnInit(): Promise<void> {
    await this.cargarDatosIniciales();
  }

  /**
   * Carga categorías, candidatas y conteos
   */
  async cargarDatosIniciales(): Promise<void> {
    try {
      this.isLoading.set(true);
      const [cats, candidatas, todosCriterios] = await Promise.all([
        this.categoriasService.getCategorias(),
        this.candidatasService.getCandidatas(),
        this.criteriosService.getCriterios()
      ]);

      this.categorias.set(cats);

      // Calcular mapa de candidatas por categoría
      const candMap: Record<number, number> = {};
      for (const cand of candidatas) {
        const catId = Number(cand.categoria_id);
        candMap[catId] = (candMap[catId] || 0) + 1;
      }
      this.candidatasCountMap.set(candMap);

      // Calcular mapa de criterios por categoría
      const critMap: Record<number, number> = {};
      for (const crit of todosCriterios) {
        if (crit.categoria_id !== null && crit.categoria_id !== undefined) {
          const catId = Number(crit.categoria_id);
          critMap[catId] = (critMap[catId] || 0) + 1;
        }
      }
      this.criteriosCountMap.set(critMap);

      // Si no hay categoría seleccionada y hay categorías, seleccionar la primera
      if (cats.length > 0) {
        const catActual = this.selectedCategoria();
        const existe = catActual ? cats.find(c => c.id === catActual.id) : null;
        await this.seleccionarCategoria(existe || cats[0]);
      } else {
        this.selectedCategoria.set(null);
        this.criterios.set([]);
      }
    } catch (err: any) {
      console.error('Error cargando datos en Admin:', err);
      this.toastService.error('Error al cargar datos: ' + (err.message || 'Error de conexión'));
    } finally {
      this.isLoading.set(false);
      this.cdr.detectChanges();
    }
  }

  /**
   * Selecciona una categoría y carga sus criterios específicos
   */
  async seleccionarCategoria(cat: Categoria): Promise<void> {
    this.selectedCategoria.set(cat);
    this.isLoadingCriterios.set(true);
    this.cdr.detectChanges();

    try {
      const crits = await this.criteriosService.getCriteriosByCategoriaId(cat.id);
      this.criterios.set(crits);
    } catch (err: any) {
      console.error(`Error al cargar criterios para categoría ${cat.id}:`, err);
      this.toastService.error('No se pudieron cargar los criterios de ' + cat.nombre);
    } finally {
      this.isLoadingCriterios.set(false);
      this.cdr.detectChanges();
    }
  }

  // ==========================================
  // OPERACIONES CRUD: CATEGORÍAS
  // ==========================================

  abrirModalCrearCategoria(): void {
    this.categoriaEnEdicion.set(null);
    this.modalCategoriaMode.set('create');
    this.modalCategoriaOpen.set(true);
  }

  abrirModalEditarCategoria(cat: Categoria, event?: Event): void {
    if (event) event.stopPropagation();
    this.categoriaEnEdicion.set(cat);
    this.modalCategoriaMode.set('edit');
    this.modalCategoriaOpen.set(true);
  }

  cerrarModalCategoria(): void {
    this.modalCategoriaOpen.set(false);
  }

  async onGuardarCategoria(event: { id: number | null; data: Omit<Categoria, 'id' | 'created_at'> }): Promise<void> {
    try {
      this.isSubmitting.set(true);

      if (event.id === null) {
        const nueva = await this.categoriasService.crearCategoria(event.data);
        this.toastService.success(`Categoría "${nueva.nombre}" creada con éxito`);
        this.cerrarModalCategoria();
        await this.cargarDatosIniciales();
        this.seleccionarCategoria(nueva);
      } else {
        const actualizada = await this.categoriasService.actualizarCategoria(event.id, event.data);
        this.toastService.success(`Categoría "${actualizada.nombre}" actualizada`);
        this.cerrarModalCategoria();
        await this.cargarDatosIniciales();
        const encontrada = this.categorias().find(c => c.id === event.id);
        if (encontrada) this.selectedCategoria.set(encontrada);
      }
    } catch (err: any) {
      console.error('Error guardando categoría:', err);
      this.toastService.error(err.message || 'Error al guardar categoría');
    } finally {
      this.isSubmitting.set(false);
      this.cdr.detectChanges();
    }
  }

  confirmarEliminarCategoria(cat: Categoria, event?: Event): void {
    if (event) event.stopPropagation();

    const candCount = this.candidatasCountMap()[cat.id] || 0;
    const critCount = this.criteriosCountMap()[cat.id] || 0;

    let warning: string | undefined = undefined;
    if (candCount > 0) {
      warning = `¡Atención! Hay ${candCount} candidata(s) inscrita(s) en esta categoría. Eliminarla puede ocasionar inconsistencias en evaluaciones ya registradas.`;
    } else if (critCount > 0) {
      warning = `Se eliminarán también los ${critCount} criterios evaluativos vinculados en cascada.`;
    }

    this.deleteTarget.set({
      type: 'categoria',
      id: cat.id,
      nombre: cat.nombre,
      warningMessage: warning
    });
    this.modalDeleteOpen.set(true);
  }

  // ==========================================
  // OPERACIONES CRUD: CRITERIOS
  // ==========================================

  abrirModalCrearCriterio(): void {
    const cat = this.selectedCategoria();
    if (!cat) {
      this.toastService.info('Selecciona primero una categoría para asignarle un criterio');
      return;
    }

    this.criterioEnEdicion.set(null);
    this.modalCriterioMode.set('create');
    this.modalCriterioOpen.set(true);
  }

  abrirModalEditarCriterio(crit: CriterioEvaluativo): void {
    this.criterioEnEdicion.set(crit);
    this.modalCriterioMode.set('edit');
    this.modalCriterioOpen.set(true);
  }

  cerrarModalCriterio(): void {
    this.modalCriterioOpen.set(false);
  }

  async onGuardarCriterio(event: { id: number | null; data: Omit<CriterioEvaluativo, 'id' | 'created_at'> }): Promise<void> {
    try {
      this.isSubmitting.set(true);

      if (event.id === null) {
        const nuevo = await this.criteriosService.crearCriterio(event.data);
        this.toastService.success(`Criterio "${nuevo.nombre}" agregado con éxito`);
        this.cerrarModalCriterio();
        const cat = this.selectedCategoria();
        if (cat) await this.seleccionarCategoria(cat);
        const map = { ...this.criteriosCountMap() };
        const catId = event.data.categoria_id!;
        map[catId] = (map[catId] || 0) + 1;
        this.criteriosCountMap.set(map);
      } else {
        const actualizado = await this.criteriosService.actualizarCriterio(event.id, event.data);
        this.toastService.success(`Criterio "${actualizado.nombre}" actualizado`);
        this.cerrarModalCriterio();
        const cat = this.selectedCategoria();
        if (cat) await this.seleccionarCategoria(cat);
      }
    } catch (err: any) {
      console.error('Error guardando criterio:', err);
      this.toastService.error(err.message || 'Error al guardar criterio');
    } finally {
      this.isSubmitting.set(false);
      this.cdr.detectChanges();
    }
  }

  confirmarEliminarCriterio(crit: CriterioEvaluativo): void {
    this.deleteTarget.set({
      type: 'criterio',
      id: crit.id,
      nombre: crit.nombre,
      warningMessage: 'Las evaluaciones previas que hayan calificado con este criterio podrían perder esta métrica individual.'
    });
    this.modalDeleteOpen.set(true);
  }

  // ==========================================
  // CONFIRMACIÓN DE ELIMINACIÓN GENERAL
  // ==========================================

  cerrarModalDelete(): void {
    this.modalDeleteOpen.set(false);
    this.deleteTarget.set(null);
  }

  async ejecutarEliminacion(): Promise<void> {
    const target = this.deleteTarget();
    if (!target) return;

    try {
      this.isSubmitting.set(true);

      if (target.type === 'categoria') {
        await this.categoriasService.eliminarCategoria(target.id);
        this.toastService.success(`Categoría "${target.nombre}" eliminada`);
        this.cerrarModalDelete();
        await this.cargarDatosIniciales();
      } else {
        await this.criteriosService.eliminarCriterio(target.id);
        this.toastService.success(`Criterio "${target.nombre}" eliminado`);
        this.cerrarModalDelete();
        const cat = this.selectedCategoria();
        if (cat) {
          await this.seleccionarCategoria(cat);
          const map = { ...this.criteriosCountMap() };
          map[cat.id] = Math.max(0, (map[cat.id] || 1) - 1);
          this.criteriosCountMap.set(map);
        }
      }
    } catch (err: any) {
      console.error('Error en eliminación:', err);
      this.toastService.error(err.message || 'Error al eliminar');
    } finally {
      this.isSubmitting.set(false);
      this.cdr.detectChanges();
    }
  }
}
