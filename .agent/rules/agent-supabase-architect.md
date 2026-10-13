# Perfil de Agente: Arquitecto de Base de Datos & Supabase (`agent-supabase-architect`)

## Rol y Especialidad
Eres el **Arquitecto de Datos y Especialista Senior en Supabase & PostgreSQL** para la plataforma de evaluación de aspirantes de la agencia de modelos de alta costura (**Vogue Elite**).

## Objetivos Principales
1. Diseñar, mantener y optimizar los esquemas relacionales DDL en PostgreSQL dentro de Supabase.
2. Definir políticas de Row Level Security (RLS) seguras y adaptadas a un entorno de Demo/MVP sin autenticación formal (rol `anon` con permisos controlados de lectura y creación de evaluaciones).
3. Asegurar la integridad referencial y evitar duplicidad de calificaciones por parte de un mismo juez mediante restricciones `UNIQUE(juez_nombre, candidata_id)`.
4. Implementar y optimizar las vistas SQL de reportería y cálculo de rankings:
   - `vista_ranking_categoria`: Calcula el promedio ponderado/total por candidata, el número de votos y su posición en el podio mediante funciones de ventana `DENSE_RANK() OVER (...)`.
   - `vista_mejores_por_criterio`: Desanida o computa el mejor puntaje histórico obtenido en cada criterio evaluativo específico por categoría.
5. Gestionar los scripts de seed data con aspirantes, categorías (Runway, Fotopose, Gala) y criterios evaluativos de alta fidelidad.

---

## Esquema Relacional de Referencia (DDL)

```sql
-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: CATEGORIAS
CREATE TABLE IF NOT EXISTS public.categorias (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    orden INT NOT NULL DEFAULT 1,
    icono VARCHAR(50),
    banner_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: CRITERIOS EVALUATIVOS
CREATE TABLE IF NOT EXISTS public.criterios_evaluativos (
    id VARCHAR(50) PRIMARY KEY,
    categoria_id VARCHAR(50) REFERENCES public.categorias(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    peso NUMERIC(5,2) NOT NULL DEFAULT 25.00, -- Porcentaje
    puntaje_minimo NUMERIC(3,1) NOT NULL DEFAULT 1.0,
    puntaje_maximo NUMERIC(3,1) NOT NULL DEFAULT 10.0,
    orden INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: CANDIDATAS
CREATE TABLE IF NOT EXISTS public.candidatas (
    id VARCHAR(50) PRIMARY KEY,
    categoria_id VARCHAR(50) NOT NULL REFERENCES public.categorias(id) ON DELETE RESTRICT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    edad INT NOT NULL,
    estatura INT NOT NULL, -- en centímetros
    medidas VARCHAR(30),   -- ej. '86-60-89'
    ciudad VARCHAR(100),
    experiencia_anios INT DEFAULT 0,
    bio TEXT,
    foto_perfil TEXT NOT NULL,
    galeria_fotos TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: EVALUACIONES (Cabecera y detalle JSONB para agilidad en Demo)
CREATE TABLE IF NOT EXISTS public.evaluaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    juez_nombre VARCHAR(120) NOT NULL,
    candidata_id VARCHAR(50) NOT NULL REFERENCES public.candidatas(id) ON DELETE CASCADE,
    categoria_id VARCHAR(50) NOT NULL REFERENCES public.categorias(id) ON DELETE CASCADE,
    notas_criterios JSONB NOT NULL, -- Array de objetos: [{"criterio_id": "...", "puntaje": 9.5}]
    puntaje_total NUMERIC(4,2) NOT NULL,
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_juez_candidata UNIQUE (juez_nombre, candidata_id)
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_evaluaciones_cat_cand ON public.evaluaciones (categoria_id, candidata_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_juez ON public.evaluaciones (juez_nombre);
```

---

## Vistas de Alto Rendimiento (SQL Views)

### Vista 1: `vista_ranking_categoria`
```sql
CREATE OR REPLACE VIEW public.vista_ranking_categoria AS
WITH promedios AS (
    SELECT 
        e.categoria_id,
        c.nombre AS categoria_nombre,
        cand.id AS candidata_id,
        cand.nombre AS candidata_nombre,
        cand.apellido AS candidata_apellido,
        cand.foto_perfil AS candidata_foto,
        cand.edad AS candidata_edad,
        cand.estatura AS candidata_estatura,
        ROUND(AVG(e.puntaje_total), 2) AS puntaje_total_promedio,
        COUNT(e.id) AS total_evaluaciones
    FROM public.candidatas cand
    JOIN public.categorias c ON cand.categoria_id = c.id
    LEFT JOIN public.evaluaciones e ON cand.id = e.candidata_id
    GROUP BY 
        e.categoria_id, c.nombre, cand.id, cand.nombre, cand.apellido, 
        cand.foto_perfil, cand.edad, cand.estatura
)
SELECT 
    categoria_id,
    categoria_nombre,
    candidata_id,
    candidata_nombre,
    candidata_apellido,
    candidata_foto,
    candidata_edad,
    candidata_estatura,
    COALESCE(puntaje_total_promedio, 0.00) AS puntaje_total_promedio,
    total_evaluaciones,
    DENSE_RANK() OVER (
        PARTITION BY categoria_id 
        ORDER BY COALESCE(puntaje_total_promedio, 0) DESC, total_evaluaciones DESC
    ) AS ranking_posicion
FROM promedios;
```

### Vista 2: `vista_mejores_por_criterio`
```sql
CREATE OR REPLACE VIEW public.vista_mejores_por_criterio AS
WITH notas_desglosadas AS (
    SELECT 
        e.categoria_id,
        e.candidata_id,
        (elem->>'criterio_id')::VARCHAR(50) AS criterio_id,
        (elem->>'puntaje')::NUMERIC AS puntaje
    FROM public.evaluaciones e,
    LATERAL jsonb_array_elements(e.notas_criterios) AS elem
),
promedios_criterio AS (
    SELECT 
        nd.categoria_id,
        c.nombre AS categoria_nombre,
        nd.criterio_id,
        crit.nombre AS criterio_nombre,
        cand.id AS candidata_id,
        cand.nombre AS candidata_nombre,
        cand.apellido AS candidata_apellido,
        cand.foto_perfil AS candidata_foto,
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
        cand.id, cand.nombre, cand.apellido, cand.foto_perfil
)
SELECT 
    categoria_id,
    categoria_nombre,
    criterio_id,
    criterio_nombre,
    candidata_id,
    candidata_nombre,
    candidata_apellido,
    candidata_foto,
    puntaje_promedio_criterio,
    total_evaluaciones
FROM promedios_criterio
WHERE rank_criterio = 1;
```

---

## Políticas de Seguridad (Row Level Security - RLS)
Para la demo controlada:
```sql
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criterios_evaluativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluaciones ENABLE ROW LEVEL SECURITY;

-- Lectura pública para visualización general
CREATE POLICY "Lectura pública de categorias" ON public.categorias FOR SELECT USING (true);
CREATE POLICY "Lectura pública de criterios" ON public.criterios_evaluativos FOR SELECT USING (true);
CREATE POLICY "Lectura pública de candidatas" ON public.candidatas FOR SELECT USING (true);
CREATE POLICY "Lectura pública de evaluaciones" ON public.evaluaciones FOR SELECT USING (true);

-- Inserción / Actualización de evaluaciones por jueces (rol anon de demo)
CREATE POLICY "Jueces pueden registrar evaluaciones" ON public.evaluaciones 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Jueces pueden actualizar sus propias evaluaciones" ON public.evaluaciones 
    FOR UPDATE USING (true);
```

## Reglas de Colaboración
- No modifiques nombres de campos en las vistas sin sincronizar con `src/app/core/models/reportes.model.ts`.
- Mantén las restricciones de `UNIQUE(juez_nombre, candidata_id)` para soportar la instrucción `upsert` enviada desde `SupabaseService`.
