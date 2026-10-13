import { Component, input, output, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Categoria, CriterioEvaluativo, TipoCalificacion } from '../../../../core/models';

@Component({
  selector: 'app-modal-criterio-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-criterio-form.component.html'
})
export class ModalCriterioFormComponent {
  isOpen = input<boolean>(false);
  mode = input<'create' | 'edit'>('create');
  criterio = input<CriterioEvaluativo | null>(null);
  categoriaId = input<number | null>(null);
  categorias = input<Categoria[]>([]);
  siguienteOrden = input<number>(1);
  isSubmitting = input<boolean>(false);

  closeModal = output<void>();
  save = output<{ id: number | null; data: Omit<CriterioEvaluativo, 'id' | 'created_at'> }>();
  validationError = output<string>();

  // Campos locales del formulario - Sin valores por defecto (solo placeholders)
  critFormCategoriaId: number | null = 0;
  critFormNombre = '';
  critFormDescripcion = '';
  critFormTipo: TipoCalificacion | null = null;
  critFormPeso: number | null = null;
  critFormPuntajeMin: number | null = null;
  critFormPuntajeMax: number | null = null;
  critFormOpcionesTexto = '';
  critFormOrden = 1;

  private wasOpen = false;
  private currentEditingId: number | null = null;

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const crit = this.criterio();
      const currentMode = this.mode();
      const nextOrder = this.siguienteOrden();

      untracked(() => {
        if (open && (!this.wasOpen || (currentMode === 'edit' && crit?.id !== this.currentEditingId))) {
          this.wasOpen = true;
          this.currentEditingId = currentMode === 'edit' && crit ? crit.id : null;

          if (currentMode === 'edit' && crit) {
            this.critFormCategoriaId = crit.categoria_id ?? this.categoriaId() ?? 0;
            this.critFormNombre = crit.nombre;
            this.critFormDescripcion = crit.descripcion || '';
            this.critFormTipo = crit.tipo_calificacion;
            this.critFormPeso = crit.peso ?? null;
            this.critFormPuntajeMin = crit.puntaje_minimo ?? null;
            this.critFormPuntajeMax = crit.puntaje_maximo ?? null;
            this.critFormOpcionesTexto = crit.opciones_cualitativas && crit.opciones_cualitativas.length > 0
              ? crit.opciones_cualitativas.join(', ')
              : '';
            this.critFormOrden = crit.orden;
          } else {
            // Modo creación: Inicialmente vacío, opción 0 para el select y orden automático de solo lectura
            this.critFormCategoriaId = 0;
            this.critFormNombre = '';
            this.critFormDescripcion = '';
            this.critFormTipo = null;
            this.critFormPeso = null;
            this.critFormPuntajeMin = null;
            this.critFormPuntajeMax = null;
            this.critFormOpcionesTexto = '';
            this.critFormOrden = nextOrder;
          }
        } else if (!open) {
          this.wasOpen = false;
          this.currentEditingId = null;
        }
      });
    });
  }

  onSubmit(): void {
    const catId = this.critFormCategoriaId;
    if (!catId || catId === 0) {
      this.validationError.emit('Debes seleccionar una categoría para el criterio');
      return;
    }

    const nombre = this.critFormNombre.trim();
    if (!nombre) {
      this.validationError.emit('El nombre del criterio es obligatorio');
      return;
    }

    if (!this.critFormTipo) {
      this.validationError.emit('Debes seleccionar el tipo de evaluación técnica');
      return;
    }

    let peso: number | null = null;
    let puntajeMin: number | null = null;
    let puntajeMax: number | null = null;
    let opciones: string[] = [];

    if (this.critFormTipo === 'cuantitativa') {
      if (this.critFormPeso === null || this.critFormPeso === undefined) {
        this.validationError.emit('El peso ponderado (%) es obligatorio');
        return;
      }
      peso = Number(this.critFormPeso);
      puntajeMin = this.critFormPuntajeMin !== null && this.critFormPuntajeMin !== undefined ? Number(this.critFormPuntajeMin) : 1;
      puntajeMax = this.critFormPuntajeMax !== null && this.critFormPuntajeMax !== undefined ? Number(this.critFormPuntajeMax) : 10;
      if (puntajeMin >= puntajeMax) {
        this.validationError.emit('El puntaje mínimo debe ser menor que el máximo');
        return;
      }
    } else if (this.critFormTipo === 'ordinal') {
      if (this.critFormPeso === null || this.critFormPeso === undefined) {
        this.validationError.emit('El peso ponderado (%) es obligatorio');
        return;
      }
      peso = Number(this.critFormPeso);
      opciones = this.critFormOpcionesTexto
        .split(',')
        .map(o => o.trim())
        .filter(o => o.length > 0);
      if (opciones.length < 2) {
        this.validationError.emit('Un criterio ordinal requiere al menos 2 opciones de escala (ej: Bueno, Excelente)');
        return;
      }
    } else {
      // cualitativa
      opciones = this.critFormOpcionesTexto
        .split(',')
        .map(o => o.trim())
        .filter(o => o.length > 0);
    }

    const orden = this.critFormOrden !== null && this.critFormOrden !== undefined && Number(this.critFormOrden) > 0
      ? Number(this.critFormOrden)
      : (this.siguienteOrden() || 1);

    const payload: Omit<CriterioEvaluativo, 'id' | 'created_at'> = {
      categoria_id: catId,
      nombre,
      descripcion: this.critFormDescripcion.trim() || undefined,
      tipo_calificacion: this.critFormTipo!,
      peso,
      puntaje_minimo: puntajeMin,
      puntaje_maximo: puntajeMax,
      opciones_cualitativas: opciones,
      orden
    };

    const id = this.mode() === 'edit' && this.criterio() ? this.criterio()!.id : null;
    this.save.emit({ id, data: payload });
  }

  onCancel(): void {
    this.closeModal.emit();
  }
}
