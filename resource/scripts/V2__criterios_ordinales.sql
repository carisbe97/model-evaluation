-- ====================================================================
-- MIGRACIÓN V2: SOPORTE DE CRITERIOS ORDINALES (ESCALA LIKERT PONDERADA)
-- Archivo: V2__criterios_ordinales.sql
-- ====================================================================
-- Esta migración añade soporte para el tipo 'ordinal' en criterios evaluativos:
-- 1. 'cuantitativa': Calificación numérica / estrellas directa con peso %.
-- 2. 'ordinal': Escala cualitativa ordenada (ej: Mal, Aceptable, Bueno, Sobresaliente, Excelente)
--               con equivalencia numérica automática y peso % en el promedio.
-- 3. 'cualitativa': Apreciación puramente descriptiva sin peso numérico.
-- ====================================================================

-- 1. Actualizar restricción de tipos de calificación
ALTER TABLE public.criterios_evaluativos 
DROP CONSTRAINT IF EXISTS chk_criterios_tipo;

ALTER TABLE public.criterios_evaluativos 
ADD CONSTRAINT chk_criterios_tipo 
CHECK (tipo_calificacion IN ('cuantitativa', 'ordinal', 'cualitativa'));

-- 2. Actualizar restricción de peso ponderado (requerido para cuantitativa y ordinal)
ALTER TABLE public.criterios_evaluativos 
DROP CONSTRAINT IF EXISTS chk_criterios_peso;

ALTER TABLE public.criterios_evaluativos 
ADD CONSTRAINT chk_criterios_peso 
CHECK (
    tipo_calificacion = 'cualitativa' OR 
    (peso IS NOT NULL AND peso > 0 AND peso <= 100)
);

-- 3. Actualizar restricción de rango de puntaje
ALTER TABLE public.criterios_evaluativos 
DROP CONSTRAINT IF EXISTS chk_criterios_rango;

ALTER TABLE public.criterios_evaluativos 
ADD CONSTRAINT chk_criterios_rango 
CHECK (
    tipo_calificacion IN ('cualitativa', 'ordinal') OR 
    (puntaje_minimo IS NOT NULL AND puntaje_maximo IS NOT NULL AND puntaje_minimo >= 0 AND puntaje_maximo > puntaje_minimo)
);

-- 4. Actualizar vista de mejores por criterio para incluir cuantitativos y ordinales
-- Se elimina primero con CASCADE para permitir modificar el orden y firma de columnas sin conflicto 42P16
DROP VIEW IF EXISTS public.vista_mejores_por_criterio CASCADE;

CREATE OR REPLACE VIEW public.vista_mejores_por_criterio AS
WITH notas_desglosadas AS (
    SELECT 
        e.categoria_id,
        e.candidata_id,
        (elem->>'criterio_id')::INT AS criterio_id,
        (elem->>'puntaje')::NUMERIC AS puntaje
    FROM public.evaluaciones e,
    LATERAL jsonb_array_elements(e.notas_criterios) AS elem
    WHERE (elem->>'puntaje') IS NOT NULL
),
promedios_criterio AS (
    SELECT 
        nd.categoria_id,
        c.nombre AS categoria_nombre,
        nd.criterio_id,
        crit.nombre AS criterio_nombre,
        crit.tipo_calificacion,
        cand.id AS candidata_id,
        cand.nombre AS candidata_nombre,
        cand.foto_perfil AS candidata_foto,
        cand.url_redes_sociales,
        ROUND(AVG(nd.puntaje), 2) AS puntaje_promedio_criterio,
        COUNT(nd.puntaje) AS total_evaluaciones,
        ROW_NUMBER() OVER (
            PARTITION BY nd.categoria_id, nd.criterio_id 
            ORDER BY AVG(nd.puntaje) DESC
        ) AS rank_criterio
    FROM notas_desglosadas nd
    JOIN public.candidatas cand ON nd.candidata_id = cand.id
    JOIN public.categorias c ON nd.categoria_id = c.id
    JOIN public.criterios_evaluativos crit ON nd.criterio_id = crit.id
    GROUP BY 
        nd.categoria_id, c.nombre, nd.criterio_id, crit.nombre, crit.tipo_calificacion,
        cand.id, cand.nombre, cand.foto_perfil, cand.url_redes_sociales
)
SELECT 
    categoria_id,
    categoria_nombre,
    criterio_id,
    criterio_nombre,
    tipo_calificacion,
    candidata_id,
    candidata_nombre,
    candidata_foto,
    url_redes_sociales,
    puntaje_promedio_criterio,
    total_evaluaciones
FROM promedios_criterio
WHERE rank_criterio = 1;
