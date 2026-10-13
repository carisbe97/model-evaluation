import { Injectable, inject } from '@angular/core';
import { StorageDataSource } from '../data-access/contracts';

export interface UploadCandidataResult {
  fotoPerfilUrl: string;
  galeriaUrls: string[];
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly storageDataSource = inject(StorageDataSource);

  /**
   * Sube un archivo a un bucket específico a través del contrato StorageDataSource
   * y retorna la URL pública del archivo.
   */
  async uploadFile(bucketName: string, path: string, file: File): Promise<string> {
    return this.storageDataSource.uploadFile(bucketName, path, file);
  }

  /**
   * Sube las fotos de una candidata a su carpeta correspondiente:
   * fotos-candidatas/<NombreCandidata>/perfil.<ext>
   * fotos-candidatas/<NombreCandidata>/1.<ext>, 2.<ext>...
   */
  async uploadFotosCandidata(
    nombreCandidata: string,
    fotoPerfilFile: File,
    galeriaFiles: File[],
    onProgress?: (mensaje: string) => void
  ): Promise<UploadCandidataResult> {
    const folderName = nombreCandidata.trim().replace(/[\\/]/g, '-');
    const bucketName = 'fotos-candidatas';

    // 1. Subir foto de perfil oficial
    onProgress?.(`Subiendo foto de perfil a ${bucketName}/${folderName}/perfil...`);
    const perfilExt = this.getFileExtension(fotoPerfilFile);
    const perfilPath = `${folderName}/perfil.${perfilExt}`;
    const fotoPerfilUrl = await this.uploadFile(bucketName, perfilPath, fotoPerfilFile);

    // 2. Subir fotos de galería complementarias
    const galeriaUrls: string[] = [];
    for (let i = 0; i < galeriaFiles.length; i++) {
      const file = galeriaFiles[i];
      onProgress?.(`Subiendo fotos de galería (${i + 1} de ${galeriaFiles.length})...`);
      const galeriaExt = this.getFileExtension(file);
      const galeriaPath = `${folderName}/${i + 1}.${galeriaExt}`;
      const url = await this.uploadFile(bucketName, galeriaPath, file);
      galeriaUrls.push(url);
    }

    return {
      fotoPerfilUrl,
      galeriaUrls
    };
  }

  /**
   * Sube la imagen del banner de una categoría a fotos-candidatas/categorias/<nombre>_<timestamp>.<ext>
   * y retorna la URL pública.
   */
  async uploadBannerCategoria(file: File, nombreCategoria?: string): Promise<string> {
    const bucketName = 'fotos-candidatas';
    const ext = this.getFileExtension(file);
    const sanitizedName = nombreCategoria
      ? nombreCategoria.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')
      : 'banner';
    const uniquePath = `categorias/${sanitizedName}_${Date.now()}.${ext}`;
    return this.uploadFile(bucketName, uniquePath, file);
  }

  private getFileExtension(file: File): string {
    const ext = file.name.split('.').pop() || 'jpg';
    return ext.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  }
}
