-- ====================================================================
-- MIGRACIÓN V4: RANKING GENERAL Y POSICIÓN POR CATEGORÍA
-- Archivo: V4__ranking_general_y_posiciones.sql
-- ====================================================================
-- Esta migración optimiza la vista `vista_ranking_categoria` para que:
-- 1. `ranking_posicion`: Calcule el podio relativo dentro de cada categoría (Oro, Plata, Bronce de la categoría).
-- 2. `ranking_general`: Calcule el podio absoluto global entre todas las aspirantes sin importar la categoría.
-- ====================================================================

DROP VIEW IF EXISTS public.vista_ranking_categoria CASCADE;

CREATE OR REPLACE VIEW public.vista_ranking_categoria AS
WITH promedios AS (
    SELECT 
        cand.categoria_id,
        c.nombre AS categoria_nombre,
        cand.id AS candidata_id,
        cand.nombre AS candidata_nombre,
        cand.foto_perfil AS candidata_foto,
        cand.url_redes_sociales,
        ROUND(AVG(e.puntaje_total), 2) AS puntaje_total_promedio,
        COUNT(e.id) AS total_evaluaciones
    FROM public.candidatas cand
    JOIN public.categorias c ON cand.categoria_id = c.id
    LEFT JOIN public.evaluaciones e ON cand.id = e.candidata_id
    GROUP BY 
        cand.categoria_id, c.nombre, cand.id, cand.nombre, 
        cand.foto_perfil, cand.url_redes_sociales
)
SELECT 
    categoria_id,
    categoria_nombre,
    candidata_id,
    candidata_nombre,
    candidata_foto,
    url_redes_sociales,
    COALESCE(puntaje_total_promedio, 0.00) AS puntaje_total_promedio,
    total_evaluaciones,
    DENSE_RANK() OVER (
        PARTITION BY categoria_id 
        ORDER BY COALESCE(puntaje_total_promedio, 0) DESC, total_evaluaciones DESC
    ) AS ranking_posicion,
    DENSE_RANK() OVER (
        ORDER BY COALESCE(puntaje_total_promedio, 0) DESC, total_evaluaciones DESC
    ) AS ranking_general
FROM promedios;

-- Otorgar permisos de lectura a roles en Supabase
GRANT SELECT ON public.vista_ranking_categoria TO anon, authenticated, service_role;
