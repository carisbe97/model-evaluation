export interface Candidata {
  id: number;
  categoria_id: number;
  nombre: string; // Nombre completo de la aspirante
  foto_perfil: string;
  galeria_fotos: string[];
  url_redes_sociales?: string | null;
  created_at?: string;
}
