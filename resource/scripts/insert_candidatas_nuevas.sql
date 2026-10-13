-- ====================================================================
-- SCRIPT DE INSERCIÓN: CANDIDATAS NUEVAS (IDs 11 AL 18)
-- Archivo: insert_candidatas_nuevas.sql
-- ====================================================================
-- Inserta o actualiza las 8 nuevas candidatas del certamen.
-- Incluye fotos de perfil y galería almacenadas en Supabase Storage.
-- Utiliza ON CONFLICT (id) para garantizar idempotencia y actualiza
-- la secuencia del SERIAL de PostgreSQL.
-- ====================================================================

INSERT INTO public.candidatas (id, categoria_id, nombre, foto_perfil, galeria_fotos, url_redes_sociales)
VALUES
(
    11,
    1,
    'Silver riot',
    'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Silver%20riot/perfil.jpg',
    ARRAY[
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Silver%20riot/1.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Silver%20riot/2.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Silver%20riot/3.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Silver%20riot/4.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Silver%20riot/5.jpg'
    ]::TEXT[],
    'https://x.com/SilverRiot_0'
),
(
    12,
    1,
    'Ximena',
    'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Ximena/perfil.jpg',
    ARRAY[
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Ximena/1.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Ximena/2.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Ximena/3.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Ximena/4.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Ximena/5.jpg'
    ]::TEXT[],
    'https://x.com/ximena_kujo'
),
(
    13,
    1,
    'Lux',
    'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Lux/perfil.jpg',
    ARRAY[
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Lux/1.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Lux/2.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Lux/3.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Lux/4.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Lux/5.jpg'
    ]::TEXT[],
    'https://x.com/lamegff'
),
(
    14,
    2,
    'Angel',
    'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Angel/perfil.png',
    ARRAY[
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Angel/1.png',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Angel/2.png',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Angel/3.png'
    ]::TEXT[],
    'https://x.com/Ghkncgmmmv'
),
(
    15,
    3,
    'Ailish',
    'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Ailish/perfil.png',
    ARRAY[
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Ailish/1.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Ailish/2.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Ailish/3.jpg'
    ]::TEXT[],
    'https://x.com/Ailish_GR'
),
(
    16,
    2,
    'Madyblood',
    'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Madyblood/perfil.jpg',
    ARRAY[
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Madyblood/1.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Madyblood/2.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Madyblood/3.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Madyblood/4.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Madyblood/5.jpg'
    ]::TEXT[],
    'https://x.com/madyblood'
),
(
    17,
    1,
    'Fe galvao',
    'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Fe%20galvao/perfil.jpg',
    ARRAY[
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Fe%20galvao/1.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Fe%20galvao/2.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Fe%20galvao/3.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Fe%20galvao/4.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Fe%20galvao/5.jpg'
    ]::TEXT[],
    'https://x.com/fehgalvao_'
),
(
    18,
    3,
    'Naomi Soraya',
    'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Naomi%20Soraya/perfil.jpg',
    ARRAY[
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Naomi%20Soraya/1.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Naomi%20Soraya/2.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Naomi%20Soraya/3.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Naomi%20Soraya/4.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Naomi%20Soraya/5.jpg'
    ]::TEXT[],
    'https://x.com/Naomi_Soraya2'
),
INSERT INTO public.candidatas (id, categoria_id, nombre, foto_perfil, galeria_fotos, url_redes_sociales)
VALUES
(
    19,
    1,
    'Gavii',
    'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Gavi/perfil.jpg',
    ARRAY[
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Gavi/1.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Gavi/2.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Gavi/3.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Gavi/4.jpg',
        'https://ebnpiimwxnptqbvsjmtk.supabase.co/storage/v1/object/public/fotos-candidatas/Gavi/5.jpg'
    ]::TEXT[],
    'https://x.com/Gab1u88'
)
ON CONFLICT (id) DO UPDATE SET
    categoria_id = EXCLUDED.categoria_id,
    nombre = EXCLUDED.nombre,
    foto_perfil = EXCLUDED.foto_perfil,
    galeria_fotos = EXCLUDED.galeria_fotos,
    url_redes_sociales = EXCLUDED.url_redes_sociales;

-- Sincronizar la secuencia del autoincremental (SERIAL)
SELECT setval(
    pg_get_serial_sequence('public.candidatas', 'id'),
    COALESCE((SELECT MAX(id) FROM public.candidatas), 1)
);
