import { Injectable, inject } from '@angular/core';
import { StorageDataSource } from '../contracts/storage.data-source';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({
  providedIn: 'root'
})
export class SupabaseStorageDataSource extends StorageDataSource {
  private readonly supabaseClient = inject(SupabaseClientService);

  async uploadFile(bucketName: string, path: string, file: File): Promise<string> {
    const sb = this.supabaseClient.client;
    if (!sb) {
      throw new Error('El cliente de Supabase no se encuentra inicializado.');
    }

    const { data, error } = await sb.storage
      .from(bucketName)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error(`Error al subir archivo a ${bucketName}/${path}:`, error);
      throw new Error(
        `Error al subir ${path} al bucket '${bucketName}': ${error.message}. ` +
        `Verifica que el bucket tenga permisos de INSERT para usuarios públicos/anon.`
      );
    }

    const { data: publicData } = sb.storage
      .from(bucketName)
      .getPublicUrl(path);

    if (!publicData?.publicUrl) {
      throw new Error(`No se pudo obtener la URL pública para el archivo ${path}`);
    }

    return publicData.publicUrl;
  }
}
