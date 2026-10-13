import { Component, Input, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Candidata } from '../../../../core/models';

@Component({
  selector: 'app-candidate-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candidate-gallery.component.html',
  styleUrl: './candidate-gallery.component.scss'
})
export class CandidateGalleryComponent implements OnDestroy {
  private readonly _candidate = signal<Candidata | null>(null);

  @Input({ required: true })
  set candidate(val: Candidata | null) {
    this._candidate.set(val);
    this.initPhotoGallery(val);
  }
  get candidate(): Candidata | null {
    return this._candidate();
  }

  @Input() categoryName: string = '';
  @Input() candidateIndex: number = 0;

  activePhotoUrl = signal<string>('');
  isCarouselPaused = signal<boolean>(false);
  private carouselIntervalId: ReturnType<typeof setInterval> | null = null;

  // Lista unificada de fotos sin duplicados (recalculada reactivamente cuando _candidate cambia)
  candidatePhotos = computed<string[]>(() => {
    const cand = this._candidate();
    if (!cand) return [];
    const photos: string[] = [];
    if (cand.foto_perfil) {
      photos.push(cand.foto_perfil);
    }
    if (Array.isArray(cand.galeria_fotos)) {
      cand.galeria_fotos.forEach(p => {
        if (p && !photos.includes(p)) {
          photos.push(p);
        }
      });
    }
    return photos;
  });

  currentPhotoIndex = computed(() => {
    const photos = this.candidatePhotos();
    const active = this.activePhotoUrl();
    const idx = photos.indexOf(active);
    return idx >= 0 ? idx : 0;
  });

  ngOnDestroy(): void {
    this.stopPhotoCarousel();
  }

  private initPhotoGallery(cand: Candidata | null): void {
    this.stopPhotoCarousel();
    if (!cand) {
      this.activePhotoUrl.set('');
      return;
    }

    const photos: string[] = [];
    if (cand.foto_perfil) {
      photos.push(cand.foto_perfil);
    }
    if (Array.isArray(cand.galeria_fotos)) {
      cand.galeria_fotos.forEach(p => {
        if (p && !photos.includes(p)) {
          photos.push(p);
        }
      });
    }

    // Reiniciar inmediatamente la foto activa a la foto de perfil de la nueva candidata
    this.activePhotoUrl.set(cand.foto_perfil || (photos.length > 0 ? photos[0] : ''));
    this.startPhotoCarousel();
  }

  startPhotoCarousel(): void {
    this.stopPhotoCarousel();
    const photos = this.candidatePhotos();
    if (photos.length <= 1) return;

    this.carouselIntervalId = setInterval(() => {
      if (this.isCarouselPaused()) return;
      this.nextPhoto(false);
    }, 5000);
  }

  stopPhotoCarousel(): void {
    if (this.carouselIntervalId) {
      clearInterval(this.carouselIntervalId);
      this.carouselIntervalId = null;
    }
  }

  nextPhoto(restartTimer = true): void {
    const photos = this.candidatePhotos();
    if (photos.length <= 1) return;
    const current = this.activePhotoUrl();
    const currIdx = photos.indexOf(current);
    const nextIdx = (currIdx + 1) % photos.length;
    this.activePhotoUrl.set(photos[nextIdx]);

    if (restartTimer) {
      this.startPhotoCarousel();
    }
  }

  prevPhoto(restartTimer = true): void {
    const photos = this.candidatePhotos();
    if (photos.length <= 1) return;
    const current = this.activePhotoUrl();
    const currIdx = photos.indexOf(current);
    const prevIdx = (currIdx - 1 + photos.length) % photos.length;
    this.activePhotoUrl.set(photos[prevIdx]);

    if (restartTimer) {
      this.startPhotoCarousel();
    }
  }

  selectPhoto(url: string): void {
    this.activePhotoUrl.set(url);
    this.startPhotoCarousel();
  }

  pauseCarousel(): void {
    this.isCarouselPaused.set(true);
  }

  resumeCarousel(): void {
    this.isCarouselPaused.set(false);
  }

  formatNumber(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
}

