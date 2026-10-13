import { Injectable, inject } from '@angular/core';
import { Candidata } from '../models';
import { CandidataDataSource } from '../data-access/contracts';
import { StorageService } from './storage.service';

export interface RegistrarPostulacionParams {
  nombre: string;
  categoriaId: number;
  fotoPerfilFile: File;
  galeriaFiles?: File[];
  urlRedesSociales?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CandidatasService {
  private readonly dataSource = inject(CandidataDataSource);
  private readonly storageService = inject(StorageService);

  async getCandidatas(categoriaId?: number | string): Promise<Candidata[]> {
    const idNum = (categoriaId !== undefined && categoriaId !== null && categoriaId !== '')
      ? Number(categoriaId)
      : undefined;
    return this.dataSource.getCandidatas(idNum);
  }

  async getCandidataById(id: number | string): Promise<Candidata | null> {
    return this.dataSource.getCandidataById(Number(id));
  }

  async registrarCandidata(candidata: Omit<Candidata, 'id' | 'created_at'>): Promise<Candidata> {
    return this.dataSource.registrarCandidata(candidata);
  }

  /**
   * Coordina el proceso completo de postulación de una candidata:
   * 1. Sube la foto de perfil y la galería a Supabase Storage en la carpeta de la candidata.
   * 2. Registra la ficha técnica en la base de datos oficial.
   */
  async registrarPostulacion(
    params: RegistrarPostulacionParams,
    onProgress?: (mensaje: string) => void
  ): Promise<Candidata> {
    // 1. Subida de fotos al Storage mediante StorageService
    const { fotoPerfilUrl, galeriaUrls } = await this.storageService.uploadFotosCandidata(
      params.nombre,
      params.fotoPerfilFile,
      params.galeriaFiles || [],
      onProgress
    );

    // 2. Persistencia en base de datos mediante la capa de acceso a datos
    onProgress?.('Guardando registro en la base de datos oficial...');
    return this.dataSource.registrarCandidata({
      nombre: params.nombre.trim(),
      categoria_id: Number(params.categoriaId),
      foto_perfil: fotoPerfilUrl,
      galeria_fotos: galeriaUrls,
      url_redes_sociales: params.urlRedesSociales?.trim() || null
    });
  }
}
