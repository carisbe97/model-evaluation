-- ====================================================================
-- MIGRACIÓN V3: ESTADÍSTICAS CUALITATIVAS Y CONSOLIDADO POR CANDIDATA
-- Archivo: V3__resultados_cualitativos_y_consolidados.sql
-- ====================================================================
-- Esta migración añade soporte para la consolidación estadística de los
-- criterios cualitativos (opción más escogida / moda / distribución de votos)
-- y vistas consolidadas individuales por candidata.
-- ====================================================================

-- 1. Vista de desglose estadístico de todas las opciones cualitativas por candidata
DROP VIEW IF EXISTS public.vista_cualitativas_predominantes CASCADE;
DROP VIEW IF EXISTS public.vista_resumen_cualitativo_candidata CASCADE;

CREATE OR REPLACE VIEW public.vista_resumen_cualitativo_candidata AS
WITH votos_cualitativos AS (
    SELECT 
        e.categoria_id,
        c.nombre AS categoria_nombre,
        e.candidata_id,
        cand.nombre AS candidata_nombre,
        cand.foto_perfil AS candidata_foto,
        (elem->>'criterio_id')::INT AS criterio_id,
        COALESCE(elem->>'criterio_nombre', crit.nombre) AS criterio_nombre,
        elem->>'valor_cualitativo' AS valor_cualitativo
    FROM public.evaluaciones e
    JOIN public.candidatas cand ON e.candidata_id = cand.id
    JOIN public.categorias c ON e.categoria_id = c.id
    CROSS JOIN LATERAL jsonb_array_elements(e.notas_criterios) AS elem
    LEFT JOIN public.criterios_evaluativos crit ON crit.id = (elem->>'criterio_id')::INT
    WHERE (elem->>'valor_cualitativo') IS NOT NULL 
      AND (elem->>'valor_cualitativo') != ''
      AND (elem->>'puntaje') IS NULL -- Exclusivo para criterios cualitativos descriptivos puros
),
conteos_agrupados AS (
    SELECT 
        categoria_id,
        categoria_nombre,
        candidata_id,
        candidata_nombre,
        candidata_foto,
        criterio_id,
        criterio_nombre,
        valor_cualitativo,
        COUNT(*) AS votos_opcion,
        SUM(COUNT(*)) OVER (PARTITION BY candidata_id, criterio_id) AS total_votos_criterio,
        ROW_NUMBER() OVER (
            PARTITION BY candidata_id, criterio_id 
            ORDER BY COUNT(*) DESC, valor_cualitativo ASC
        ) AS rank_preferencia
    FROM votos_cualitativos
    GROUP BY 
        categoria_id, categoria_nombre, candidata_id, candidata_nombre, candidata_foto,
        criterio_id, criterio_nombre, valor_cualitativo
)
SELECT 
    categoria_id,
    categoria_nombre,
    candidata_id,
    candidata_nombre,
    candidata_foto,
    criterio_id,
    criterio_nombre,
    valor_cualitativo,
    votos_opcion,
    total_votos_criterio,
    ROUND((votos_opcion::NUMERIC / NULLIF(total_votos_criterio, 0)) * 100, 1) AS porcentaje_votos,
    (rank_preferencia = 1) AS es_opcion_mas_votada
FROM conteos_agrupados;

-- 2. Vista rápida de opciones predominantes (la opción ganadora de cada criterio por candidata)
CREATE OR REPLACE VIEW public.vista_cualitativas_predominantes AS
SELECT 
    categoria_id,
    categoria_nombre,
    candidata_id,
    candidata_nombre,
    candidata_foto,
    criterio_id,
    criterio_nombre,
    valor_cualitativo AS opcion_mas_escogida,
    votos_opcion,
    total_votos_criterio,
    porcentaje_votos
FROM public.vista_resumen_cualitativo_candidata
WHERE es_opcion_mas_votada = true;

-- 3. Otorgar permisos de lectura a roles públicos / anon en Supabase
GRANT SELECT ON public.vista_resumen_cualitativo_candidata TO anon, authenticated, service_role;
GRANT SELECT ON public.vista_cualitativas_predominantes TO anon, authenticated, service_role;
