-- ====================================================================
-- SCRIPT DE INSERCIÓN: CATEGORÍAS
-- Archivo: insert_categorias.sql
-- ====================================================================
-- Inserta o actualiza las categorías definidas para el concurso.
-- Incluye ON CONFLICT para ser idempotente y actualiza la secuencia
-- del SERIAL para evitar colisiones con futuros registros.
-- ====================================================================

INSERT INTO public.categorias (id, nombre, descripcion, orden, icono, banner_url)
VALUES
(
    1,
    'Modelos Only',
    'Chicas Only que solo sube sus Nudes',
    1,
    'gem',
    'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/categorias/categoria1.jpg'
),
(
    2,
    'Only Nopor',
    'Mujeres que tambien tienen Only pero adicional tambien ya hace videos Nopor',
    2,
    'eye',
    'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/categorias/categoria2.jpg'
),
(
    3,
    'Actrices Nopor',
    'Actrices Nopor que te camellan de forma profecional en el naranja',
    3,
    'flame',
    'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/categorias/categoria3.jpg'
)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    orden = EXCLUDED.orden,
    icono = EXCLUDED.icono,
    banner_url = EXCLUDED.banner_url;

-- Sincronizar la secuencia del autoincremental (SERIAL) con el máximo id actual
SELECT setval(
    pg_get_serial_sequence('public.categorias', 'id'),
    COALESCE((SELECT MAX(id) FROM public.categorias), 1)
);
