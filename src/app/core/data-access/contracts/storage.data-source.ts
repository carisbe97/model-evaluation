export abstract class StorageDataSource {
  /**
   * Sube un archivo a un bucket de almacenamiento y retorna su URL pública accesible.
   */
  abstract uploadFile(bucketName: string, path: string, file: File): Promise<string>;
}
