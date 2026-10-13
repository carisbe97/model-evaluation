import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CategoriasService } from '../../core/services/categorias.service';
import { CandidatasService } from '../../core/services/candidatas.service';
import { Categoria, Candidata } from '../../core/models';

@Component({
  selector: 'app-postulacion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './postulacion.component.html',
  styleUrl: './postulacion.component.scss'
})
export class PostulacionComponent implements OnInit, OnDestroy {
  private readonly categoriasService = inject(CategoriasService);
  private readonly candidatasService = inject(CandidatasService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  // Límite máximo de fotos para la galería
  readonly MAX_GALERIA_FOTOS = 5;

  // Estados reactivos de la vista
  categorias = signal<Categoria[]>([]);
  isLoadingCategorias = signal(true);
  isSubmitting = signal(false);
  isSuccess = signal(false);
  registeredCandidata = signal<Candidata | null>(null);
  errorMessage = signal<string | null>(null);
  uploadProgressMessage = signal<string>('');

  // Estados de carga de loaders y skeletons en tiempo real
  isLoadingPerfil = signal<boolean>(false);
  loadingGaleriaCount = signal<number>(0);

  // Array computado para iterar los cuadros skeleton de galería
  skeletonArray = computed<number[]>(() => {
    const count = this.loadingGaleriaCount();
    return Array.from({ length: count }, (_, i) => i);
  });

  // Campos del formulario
  nombre = '';
  categoriaId: number | null = null;
  urlRedesSociales = '';

  // Dropdown personalizado de selección de categoría
  isCategoriaDropdownOpen = signal<boolean>(false);

  categoriaSeleccionada(): Categoria | null {
    if (!this.categoriaId) return null;
    return this.categorias().find(c => c.id === this.categoriaId) || null;
  }

  toggleCategoriaDropdown(): void {
    this.isCategoriaDropdownOpen.update(v => !v);
  }

  cerrarCategoriaDropdown(): void {
    this.isCategoriaDropdownOpen.set(false);
  }

  seleccionarCategoria(id: number): void {
    this.categoriaId = id;
    this.isCategoriaDropdownOpen.set(false);
  }

  // Archivos locales seleccionados y previsualizaciones reactivas con Signals
  fotoPerfilFile = signal<File | null>(null);
  fotoPerfilPreview = signal<string>('');

  galeriaFiles = signal<File[]>([]);
  galeriaPreviews = signal<string[]>([]);

  async ngOnInit(): Promise<void> {
    try {
      const cats = await this.categoriasService.getCategorias();
      this.categorias.set(cats);
    } catch (err) {
      console.error('Error al cargar categorías para postulación:', err);
    } finally {
      this.isLoadingCategorias.set(false);
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.liberarObjectUrls();
  }

  /**
   * Manejo de selección de archivo para la foto de perfil:
   * Activa el skeleton loader al instante y renderiza de inmediato.
   */
  onFotoPerfilFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    input.value = '';

    // 1. Mostrar de inmediato el skeleton con loader y forzar detección
    this.isLoadingPerfil.set(true);
    this.errorMessage.set(null);
    this.cdr.detectChanges();

    // 2. Procesamiento fluido para que el loader sea visible y no bloquee el hilo
    setTimeout(() => {
      const prev = this.fotoPerfilPreview();
      if (prev && prev.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
      }

      this.fotoPerfilFile.set(file);
      this.fotoPerfilPreview.set(URL.createObjectURL(file));
      this.isLoadingPerfil.set(false);
      this.cdr.detectChanges();
    }, 120);
  }

  /**
   * Elimina la foto de perfil seleccionada
   */
  eliminarFotoPerfil(): void {
    const prev = this.fotoPerfilPreview();
    if (prev && prev.startsWith('blob:')) {
      URL.revokeObjectURL(prev);
    }
    this.fotoPerfilFile.set(null);
    this.fotoPerfilPreview.set('');
    this.cdr.detectChanges();
  }

  /**
   * Manejo de selección múltiple de fotos para la galería:
   * 1. Limita estrictamente a 5 fotos.
   * 2. Activa de inmediato los cuadros skeleton con loader en la grilla.
   * 3. Muestra las miniaturas de inmediato.
   */
  onGaleriaFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const selectedFiles = Array.from(input.files);
    input.value = '';

    const totalActuales = this.galeriaFiles().length;
    const cuposDisponibles = this.MAX_GALERIA_FOTOS - totalActuales;

    if (cuposDisponibles <= 0) {
      this.errorMessage.set(`Ya has alcanzado el límite máximo de ${this.MAX_GALERIA_FOTOS} fotos para la galería.`);
      this.cdr.detectChanges();
      return;
    }

    if (selectedFiles.length > cuposDisponibles) {
      this.errorMessage.set(
        `Solo se procesaron ${cuposDisponibles} foto(s). La galería permite un máximo de ${this.MAX_GALERIA_FOTOS} fotos.`
      );
    } else {
      this.errorMessage.set(null);
    }

    // Tomamos únicamente los archivos que quepan dentro del límite de 5
    const filesToAdd = selectedFiles.slice(0, cuposDisponibles);

    // 1. Activar inmediatamente los skeletons con loader en la grilla
    this.loadingGaleriaCount.set(filesToAdd.length);
    this.cdr.detectChanges();

    // 2. Colocar las imágenes en la grilla tras la animación de carga fluida
    setTimeout(() => {
      const newPreviews = filesToAdd.map(f => URL.createObjectURL(f));

      this.galeriaFiles.update(current => [...current, ...filesToAdd]);
      this.galeriaPreviews.update(current => [...current, ...newPreviews]);
      this.loadingGaleriaCount.set(0);
      this.cdr.detectChanges();
    }, 150);
  }

  /**
   * Elimina una foto de la galería y libera su URL de memoria
   */
  eliminarFotoGaleria(index: number): void {
    const previews = this.galeriaPreviews();
    if (index >= 0 && index < previews.length) {
      const urlToRemove = previews[index];
      if (urlToRemove && urlToRemove.startsWith('blob:')) {
        URL.revokeObjectURL(urlToRemove);
      }

      this.galeriaFiles.update(files => files.filter((_, i) => i !== index));
      this.galeriaPreviews.update(prev => prev.filter((_, i) => i !== index));
      this.errorMessage.set(null);
      this.cdr.detectChanges();
    }
  }

  /**
   * Obtiene el nombre de la categoría seleccionada
   */
  getCategoriaSeleccionadaNombre(): string {
    if (!this.categoriaId) return 'Sin categoría seleccionada';
    const found = this.categorias().find(c => Number(c.id) === Number(this.categoriaId));
    return found ? found.nombre : `Categoría #${this.categoriaId}`;
  }

  /**
   * Envío del formulario de postulación
   */
  async onSubmit(): Promise<void> {
    const cleanNombre = this.nombre.trim();
    const perfil = this.fotoPerfilFile();

    if (!cleanNombre) {
      this.errorMessage.set('Por favor ingrese el nombre completo de la aspirante.');
      return;
    }

    if (!this.categoriaId) {
      this.errorMessage.set('Por favor seleccione una categoría.');
      return;
    }

    if (!perfil) {
      this.errorMessage.set('Por favor seleccione una foto de perfil oficial desde su dispositivo.');
      return;
    }

    if (this.galeriaFiles().length > this.MAX_GALERIA_FOTOS) {
      this.errorMessage.set(`La galería no puede exceder el límite de ${this.MAX_GALERIA_FOTOS} fotos.`);
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    try {
      const nuevaCandidata = await this.candidatasService.registrarPostulacion(
        {
          nombre: cleanNombre,
          categoriaId: Number(this.categoriaId),
          fotoPerfilFile: perfil,
          galeriaFiles: this.galeriaFiles(),
          urlRedesSociales: this.urlRedesSociales.trim() || null
        },
        (progreso) => {
          this.uploadProgressMessage.set(progreso);
          this.cdr.detectChanges();
        }
      );

      this.registeredCandidata.set(nuevaCandidata);
      this.isSuccess.set(true);
    } catch (err: any) {
      console.error('Error al registrar la postulación:', err);
      this.errorMessage.set(err?.message || 'Ocurrió un error al procesar la inscripción. Intente nuevamente.');
    } finally {
      this.isSubmitting.set(false);
      this.uploadProgressMessage.set('');
      this.cdr.detectChanges();
    }
  }

  /**
   * Reinicia el formulario para postular a otra candidata
   */
  resetFormulario(): void {
    this.liberarObjectUrls();

    this.nombre = '';
    this.fotoPerfilFile.set(null);
    this.fotoPerfilPreview.set('');
    this.urlRedesSociales = '';
    this.galeriaFiles.set([]);
    this.galeriaPreviews.set([]);
    this.uploadProgressMessage.set('');
    this.isLoadingPerfil.set(false);
    this.loadingGaleriaCount.set(0);
    this.errorMessage.set(null);
    this.isSuccess.set(false);
    this.registeredCandidata.set(null);
    this.cdr.detectChanges();
  }

  private liberarObjectUrls(): void {
    const perfil = this.fotoPerfilPreview();
    if (perfil && perfil.startsWith('blob:')) {
      URL.revokeObjectURL(perfil);
    }
    for (const url of this.galeriaPreviews()) {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    }
  }
}
