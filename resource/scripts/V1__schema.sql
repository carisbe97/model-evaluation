-- ====================================================================
-- PLATAFORMA DE EVALUACIÓN DE MODELOS (VOGUE ELITE)
-- Script DDL con Criterios Cuantitativos y Cualitativos
-- Vistas de Reportería y Políticas RLS para Supabase / PostgreSQL
-- ====================================================================

-- 1. Limpieza de tablas existentes (en orden inverso de dependencias)
DROP TABLE IF EXISTS public.evaluaciones CASCADE;
DROP TABLE IF EXISTS public.candidatas CASCADE;
DROP TABLE IF EXISTS public.criterios_evaluativos CASCADE;
DROP TABLE IF EXISTS public.categorias CASCADE;
DROP TABLE IF EXISTS public.jueces CASCADE;

-- 2. TABLA: JUECES (ID numérico autoincremental, nombre único)
CREATE TABLE public.jueces (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ultimo_acceso TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_juez_nombre UNIQUE (nombre)
);

CREATE INDEX idx_jueces_nombre ON public.jueces (nombre);

-- 3. TABLA: CATEGORIAS (ID numérico autoincremental)
CREATE TABLE public.categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    orden INT NOT NULL DEFAULT 1,
    icono VARCHAR(50),
    banner_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: CRITERIOS EVALUATIVOS (Soporte Cuantitativo y Cualitativo)
CREATE TABLE public.criterios_evaluativos (
    id SERIAL PRIMARY KEY,
    categoria_id INT REFERENCES public.categorias(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo_calificacion VARCHAR(20) NOT NULL DEFAULT 'cuantitativa',
    peso NUMERIC(5,2),
    puntaje_minimo NUMERIC(3,1),
    puntaje_maximo NUMERIC(3,1),
    opciones_cualitativas TEXT[] DEFAULT '{}',
    orden INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_criterios_tipo CHECK (tipo_calificacion IN ('cuantitativa', 'cualitativa')),
    CONSTRAINT chk_criterios_rango CHECK (
        tipo_calificacion = 'cualitativa' OR 
        (puntaje_minimo IS NOT NULL AND puntaje_maximo IS NOT NULL AND puntaje_minimo >= 0 AND puntaje_maximo > puntaje_minimo)
    ),
    CONSTRAINT chk_criterios_peso CHECK (
        tipo_calificacion = 'cualitativa' OR 
        (peso IS NOT NULL AND peso > 0 AND peso <= 100)
    )
);

-- 5. TABLA: CANDIDATAS (ID numérico autoincremental con url_redes_sociales)
CREATE TABLE public.candidatas (
    id SERIAL PRIMARY KEY,
    categoria_id INT NOT NULL REFERENCES public.categorias(id) ON DELETE RESTRICT,
    nombre VARCHAR(120) NOT NULL,
    foto_perfil TEXT NOT NULL,
    galeria_fotos TEXT[] NOT NULL DEFAULT '{}',
    url_redes_sociales TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA: EVALUACIONES (BIGSERIAL autoincremental y claves foráneas numéricas)
CREATE TABLE public.evaluaciones (
    id BIGSERIAL PRIMARY KEY,
    juez_id INT REFERENCES public.jueces(id) ON DELETE CASCADE,
    juez_nombre VARCHAR(120) NOT NULL,
    candidata_id INT NOT NULL REFERENCES public.candidatas(id) ON DELETE CASCADE,
    categoria_id INT NOT NULL REFERENCES public.categorias(id) ON DELETE CASCADE,
    notas_criterios JSONB NOT NULL,
    puntaje_total NUMERIC(4,2) NOT NULL,
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_juez_candidata UNIQUE (juez_nombre, candidata_id),
    CONSTRAINT chk_evaluacion_puntaje CHECK (puntaje_total >= 0 AND puntaje_total <= 10)
);

CREATE INDEX idx_evaluaciones_cat_cand ON public.evaluaciones (categoria_id, candidata_id);
CREATE INDEX idx_evaluaciones_juez ON public.evaluaciones (juez_nombre);
CREATE INDEX idx_evaluaciones_juez_id ON public.evaluaciones (juez_id);

-- ====================================================================
-- VISTAS SQL PARA REPORTES DIRECTOS
-- ====================================================================

-- VISTA 1: Ranking por Categoría y Podio
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
    ) AS ranking_posicion
FROM promedios;

-- VISTA 2: Mejores Puntajes por Criterio Específico (Criterios Cuantitativos)
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
        nd.categoria_id, c.nombre, nd.criterio_id, crit.nombre, 
        cand.id, cand.nombre, cand.foto_perfil, cand.url_redes_sociales
)
SELECT 
    categoria_id,
    categoria_nombre,
    criterio_id,
    criterio_nombre,
    candidata_id,
    candidata_nombre,
    candidata_foto,
    url_redes_sociales,
    puntaje_promedio_criterio,
    total_evaluaciones
FROM promedios_criterio
WHERE rank_criterio = 1;

-- ====================================================================
-- POLÍTICAS RLS (Demo / Anon friendly)
-- ====================================================================
ALTER TABLE public.jueces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criterios_evaluativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluaciones ENABLE ROW LEVEL SECURITY;

-- Políticas de Jueces
CREATE POLICY "Lectura libre de jueces" ON public.jueces FOR SELECT USING (true);
CREATE POLICY "Creación libre de jueces" ON public.jueces FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualización libre de jueces" ON public.jueces FOR UPDATE USING (true);

-- Políticas de Categorías, Criterios y Candidatas
CREATE POLICY "Lectura libre de categorias" ON public.categorias FOR SELECT USING (true);
CREATE POLICY "Lectura libre de criterios" ON public.criterios_evaluativos FOR SELECT USING (true);
CREATE POLICY "Lectura libre de candidatas" ON public.candidatas FOR SELECT USING (true);

-- Políticas de Evaluaciones (Lectura, Inserción y Modificación de calificaciones)
CREATE POLICY "Lectura libre de evaluaciones" ON public.evaluaciones FOR SELECT USING (true);
CREATE POLICY "Creación libre de evaluaciones" ON public.evaluaciones FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualización libre de evaluaciones" ON public.evaluaciones FOR UPDATE USING (true);
