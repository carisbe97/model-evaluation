import { Component, input, output, effect, inject, signal, computed, ChangeDetectorRef, OnDestroy, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Categoria } from '../../../../core/models';
import { StorageService } from '../../../../core/services/storage.service';
import { LISTA_ICONOS_CATEGORIA, IconoCategoriaOption } from '../../../../core/constants/iconos-categoria';

@Component({
  selector: 'app-modal-categoria-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-categoria-form.component.html'
})
export class ModalCategoriaFormComponent implements OnDestroy {
  private readonly storageService = inject(StorageService);
  private readonly cdr = inject(ChangeDetectorRef);

  isOpen = input<boolean>(false);
  mode = input<'create' | 'edit'>('create');
  categoria = input<Categoria | null>(null);
  siguienteOrden = input<number>(1);
  isSubmitting = input<boolean>(false);

  closeModal = output<void>();
  save = output<{ id: number | null; data: Omit<Categoria, 'id' | 'created_at'> }>();
  validationError = output<string>();

  // Control de apertura para evitar reinicios reactivos involuntarios en las señales internas
  private wasOpen = false;
  private currentEditingId: number | null | undefined = undefined;

  // Campos locales del formulario
  catFormNombre = '';
  catFormDescripcion = '';
  catFormOrden = 1;
  catFormIcono = '';

  // Lista y filtro para el selector de iconos
  readonly listaIconos = LISTA_ICONOS_CATEGORIA;
  isIconDropdownOpen = signal<boolean>(false);
  iconFilter = signal<string>('');

  // Iconos filtrados por nombre, etiqueta o palabras clave
  iconosFiltrados = computed(() => {
    const query = this.iconFilter().trim().toLowerCase();
    if (!query) return this.listaIconos;
    return this.listaIconos.filter(i =>
      i.name.toLowerCase().includes(query) ||
      i.label.toLowerCase().includes(query) ||
      i.keywords.toLowerCase().includes(query) ||
      i.category.toLowerCase().includes(query)
    );
  });

  // Icono actualmente seleccionado
  iconoSeleccionado = computed<IconoCategoriaOption | null>(() => {
    const nombre = this.catFormIcono;
    if (!nombre) return null;
    return this.listaIconos.find(i => i.name === nombre) || null;
  });

  // Gestión de imagen del banner
  bannerFile = signal<File | null>(null);
  bannerPreview = signal<string | null>(null);
  isLoadingBannerPreview = signal<boolean>(false);
  isUploading = signal<boolean>(false);

  constructor() {
    // Sincronizar campos únicamente cuando el modal cambia de estado o de categoría
    effect(() => {
      const open = this.isOpen();
      const cat = this.categoria();
      const currentMode = this.mode();
      const nextOrder = this.siguienteOrden();

      untracked(() => {
        if (open) {
          const catId = cat?.id ?? null;
          // Solo inicializar si el modal acaba de abrirse o si cambió de categoría
          if (!this.wasOpen || this.currentEditingId !== catId) {
            this.wasOpen = true;
            this.currentEditingId = catId;
            this.resetFormulario(cat, currentMode, nextOrder);
          }
        } else {
          if (this.wasOpen) {
            this.wasOpen = false;
            this.currentEditingId = undefined;
            this.limpiarBlob();
          }
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.limpiarBlob();
  }

  private resetFormulario(cat: Categoria | null, currentMode: 'create' | 'edit', nextOrder: number): void {
    this.limpiarBlob();

    if (currentMode === 'edit' && cat) {
      this.catFormNombre = cat.nombre;
      this.catFormDescripcion = cat.descripcion || '';
      this.catFormOrden = cat.orden;
      this.catFormIcono = cat.icono || '';
      this.bannerPreview.set(cat.banner_url || null);
      this.bannerFile.set(null);
    } else {
      this.catFormNombre = '';
      this.catFormDescripcion = '';
      this.catFormOrden = nextOrder;
      this.catFormIcono = '';
      this.bannerPreview.set(null);
      this.bannerFile.set(null);
    }
    this.isIconDropdownOpen.set(false);
    this.iconFilter.set('');
    this.isLoadingBannerPreview.set(false);
    this.isUploading.set(false);
  }

  private limpiarBlob(): void {
    const currentPrev = this.bannerPreview();
    if (currentPrev && currentPrev.startsWith('blob:')) {
      URL.revokeObjectURL(currentPrev);
    }
  }

  // ==========================================
  // MÉTODOS DEL SELECTOR DE ICONOS
  // ==========================================

  toggleIconDropdown(): void {
    this.isIconDropdownOpen.update(v => !v);
  }

  cerrarIconDropdown(): void {
    this.isIconDropdownOpen.set(false);
  }

  seleccionarIcono(name: string): void {
    this.catFormIcono = name;
    this.isIconDropdownOpen.set(false);
    this.iconFilter.set('');
  }

  limpiarIcono(event?: Event): void {
    if (event) event.stopPropagation();
    this.catFormIcono = '';
    this.isIconDropdownOpen.set(false);
    this.iconFilter.set('');
  }

  onIconSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.iconFilter.set(input.value);
  }

  // ==========================================
  // GESTIÓN DE BANNER
  // ==========================================

  /**
   * Manejo de selección de archivo para el banner de categoría:
   * Activa el skeleton loader al instante y asigna la previsualización de forma segura.
   */
  onBannerSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    input.value = '';

    // 1. Validar formato de imagen
    if (!file.type.startsWith('image/')) {
      this.validationError.emit('El archivo seleccionado debe ser una imagen válida (JPG, PNG, WEBP, etc.)');
      return;
    }

    // 2. Validar tamaño máximo (10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.validationError.emit('La imagen no debe superar los 10MB de tamaño');
      return;
    }

    // 3. Mostrar de inmediato el skeleton loader y forzar detección
    this.isLoadingBannerPreview.set(true);
    this.cdr.detectChanges();

    // 4. Procesamiento fluido para que el skeleton sea visible y renderice limpiamente
    setTimeout(() => {
      this.limpiarBlob();

      this.bannerFile.set(file);
      const previewUrl = URL.createObjectURL(file);
      this.bannerPreview.set(previewUrl);
      this.isLoadingBannerPreview.set(false);
      this.cdr.detectChanges();
    }, 150);
  }

  /**
   * Elimina la imagen de banner actual o seleccionada
   */
  eliminarBanner(): void {
    this.limpiarBlob();
    this.bannerFile.set(null);
    this.bannerPreview.set(null);
    this.cdr.detectChanges();
  }

  async onSubmit(): Promise<void> {
    const nombre = this.catFormNombre.trim();
    if (!nombre) {
      this.validationError.emit('El nombre de la categoría es obligatorio');
      return;
    }

    let bannerUrlFinal: string | null = null;
    const file = this.bannerFile();

    if (file) {
      try {
        this.isUploading.set(true);
        this.cdr.detectChanges();
        bannerUrlFinal = await this.storageService.uploadBannerCategoria(file, nombre);
      } catch (err: any) {
        console.error('Error al subir banner de categoría:', err);
        this.validationError.emit('Error al subir la imagen del banner: ' + (err.message || 'Error de almacenamiento'));
        return;
      } finally {
        this.isUploading.set(false);
        this.cdr.detectChanges();
      }
    } else {
      // Si no se seleccionó un archivo nuevo, conserva la URL actual (o null si fue eliminada)
      bannerUrlFinal = this.bannerPreview();
    }

    const payload: Omit<Categoria, 'id' | 'created_at'> = {
      nombre,
      descripcion: this.catFormDescripcion.trim() || undefined,
      orden: Number(this.catFormOrden) || 1,
      icono: this.catFormIcono.trim() || undefined,
      banner_url: bannerUrlFinal || null
    };

    const id = this.mode() === 'edit' && this.categoria() ? this.categoria()!.id : null;
    this.save.emit({ id, data: payload });
  }

  onCancel(): void {
    this.closeModal.emit();
  }
}
