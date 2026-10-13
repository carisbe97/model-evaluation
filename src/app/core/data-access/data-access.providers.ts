import { Provider } from '@angular/core';
import {
  CategoriaDataSource,
  CandidataDataSource,
  CriterioDataSource,
  JuezDataSource,
  EvaluacionDataSource,
  ReportesDataSource,
  StorageDataSource
} from './contracts';
import {
  SupabaseCategoriaDataSource,
  SupabaseCandidataDataSource,
  SupabaseCriterioDataSource,
  SupabaseJuezDataSource,
  SupabaseEvaluacionDataSource,
  SupabaseReportesDataSource,
  SupabaseStorageDataSource
} from './supabase';

/**
 * Proveedores oficiales de la capa de acceso a datos.
 * Para cambiar la fuente de datos (ej. REST API, Firebase o GraphQL),
 * únicamente se reemplazan las clases aquí sin tocar ningún servicio ni componente.
 */
export const provideDataAccess = (): Provider[] => [
  { provide: CategoriaDataSource, useClass: SupabaseCategoriaDataSource },
  { provide: CandidataDataSource, useClass: SupabaseCandidataDataSource },
  { provide: CriterioDataSource, useClass: SupabaseCriterioDataSource },
  { provide: JuezDataSource, useClass: SupabaseJuezDataSource },
  { provide: EvaluacionDataSource, useClass: SupabaseEvaluacionDataSource },
  { provide: ReportesDataSource, useClass: SupabaseReportesDataSource },
  { provide: StorageDataSource, useClass: SupabaseStorageDataSource }
];
