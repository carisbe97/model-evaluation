-- ====================================================================
-- SCRIPT DE INSERCIÓN: CRITERIOS EVALUATIVOS (ACTUALIZADO)
-- Archivo: insert_criterios.sql
-- ====================================================================
-- 1. Limpia todos los registros previos de criterios_evaluativos.
-- 2. Inserta los 38 criterios actualizados para las 3 categorías:
--    - Categoría 1 (IDs 1 al 12):  5 cualitativos + 7 puntuables (suma pesos = 100%)
--    - Categoría 2 (IDs 13 al 25): 6 cualitativos + 7 puntuables (suma pesos = 100%)
--    - Categoría 3 (IDs 26 al 38): 6 cualitativos + 7 puntuables (suma pesos = 100%)
-- 3. Sincroniza la secuencia autoincremental de PostgreSQL.
-- ====================================================================

-- 1. Limpiar criterios existentes
DELETE FROM public.criterios_evaluativos;

-- 2. Insertar criterios actualizados
INSERT INTO public.criterios_evaluativos 
(id, categoria_id, nombre, descripcion, tipo_calificacion, peso, puntaje_minimo, puntaje_maximo, opciones_cualitativas, orden)
VALUES
-- ==========================================
-- CATEGORÍA 1: MODELOS ONLY (12 Criterios)
-- ==========================================
(
    1, 1, 'Intencion tuya', '¿Que tipo de relacion tendria con ella?',
    'cualitativa', NULL, NULL, NULL,
    ARRAY['NO LE HARIA', 'SOLO SEXO', 'NOVIA PASAGERA', 'RELACION SERIA'], 1
),
(
    2, 1, 'Personalidad', 'Cuando la vez, ¿que actitud refleja?',
    'cualitativa', NULL, NULL, NULL,
    ARRAY['MAMONA', 'NORMAL', 'INTERESANTE', 'DIVERTIDA'], 2
),
(
    3, 1, 'Rol', '¿Que cara tiene ella de ser?',
    'cualitativa', NULL, NULL, NULL,
    ARRAY['PASIVA', 'ACTIVA'], 3
),
(
    4, 1, 'Mirada O Intencion', '¿De que tiene cara?',
    'cualitativa', NULL, NULL, NULL,
    ARRAY['DE PUTA', 'MAMONA', 'INOSENTE', 'DE PENDEJA', 'DE GALLETA'], 4
),
(
    5, 1, 'Tipo de relacion', 'De que forma te la cogerias',
    'cualitativa', NULL, NULL, NULL,
    ARRAY['CRISTIANO', 'LE HAGO EL AMOR', 'SALVAJE', 'CON RABIA', 'PISARLE LA CABEZA'], 5
),
(
    6, 1, 'Cuerpo', 'Evaluacion de cuerpo completo, que sea armonico es si esta bien proporcional',
    'cuantitativa', 25.00, 1.0, 5.0,
    ARRAY[]::TEXT[], 6
),
(
    7, 1, 'Rostro', 'Evaluacion del atractivo de la cara o que tan bonita es',
    'cuantitativa', 10.00, 1.0, 5.0,
    ARRAY[]::TEXT[], 7
),
(
    8, 1, 'Tetas', 'Evaluacion del tamaño de las tetas',
    'ordinal', 19.00, 1.0, 3.0,
    ARRAY['BUENAS TETAS', 'TETONA', 'TETOTAS'], 8
),
(
    9, 1, 'Curvatura', 'Evaluacion de sus curvaturas: cintura y caderas',
    'cuantitativa', 6.00, 1.0, 5.0,
    ARRAY[]::TEXT[], 9
),
(
    10, 1, 'Abdomen', 'Evaluacion de solo del abdomen',
    'cuantitativa', 6.00, 1.0, 5.0,
    ARRAY[]::TEXT[], 10
),
(
    11, 1, 'Culo', 'Evaluacion del tamaño del culo',
    'ordinal', 19.00, 1.0, 3.0,
    ARRAY['BUEN CULO', 'CULOTE', 'CULAZO'], 11
),
(
    12, 1, 'Piernas', 'Evaluacion del tamaño de las piernas',
    'cuantitativa', 15.00, 1.0, 5.0,
    ARRAY[]::TEXT[], 12
),

-- ==========================================
-- CATEGORÍA 2: ONLY NOPOR (13 Criterios)
-- ==========================================
(
    13, 2, 'Intencion tuya', '¿Que tipo de relacion tendria con ella?',
    'cualitativa', NULL, NULL, NULL,
    ARRAY['NO LE HARIA', 'SOLO SEXO', 'NOVIA PASAGERA', 'RELACION SERIA'], 1
),
(
    14, 2, 'Personalidad', 'Cuando la vez, ¿que actitud refleja?',
    'cualitativa', NULL, NULL, NULL,
    ARRAY['MAMONA', 'NORMAL', 'INTERESANTE', 'DIVERTIDA'], 2
),
(
    15, 2, 'Rol', '¿Que cara tiene ella de ser?',
    'cualitativa', NULL, NULL, NULL,
    ARRAY['PASIVA', 'ACTIVA'], 3
),
(
    16, 2, 'Mirada O Intencion', '¿De que tiene cara?',
    'cualitativa', NULL, NULL, NULL,
    ARRAY['DE PUTA', 'MAMONA', 'INOSENTE', 'DE PENDEJA', 'DE GALLETA'], 4
),
(
    17, 2, 'Tipo de relacion', 'De que forma te la cogerias',
    'cualitativa', NULL, NULL, NULL,
    ARRAY['CRISTIANO', 'LE HAGO EL AMOR', 'SALVAJE', 'CON RABIA', 'PISARLE LA CABEZA'], 5
),
(
    18, 2, 'Cuerpo', 'Evaluacion de cuerpo completo, que sea armonico es si esta bien proporcional',
    'cuantitativa', 25.00, 1.0, 5.0,
    ARRAY[]::TEXT[], 6
),
(
    19, 2, 'Rostro', 'Evaluacion del atractivo de la cara',
    'cuantitativa', 10.00, 1.0, 5.0,
    ARRAY[]::TEXT[], 7
),
(
    20, 2, 'Tetas', 'Evaluacion del tamaño de las tetas',
    'ordinal', 19.00, 1.0, 5.0,
    ARRAY['BUENAS TETAS', 'TETONA', 'TETOTAS'], 8
),
(
    21, 2, 'Curvatura', 'Evaluacion de sus curvaturas: cintura y caderas',
    'cuantitativa', 6.00, 1.0, 5.0,
    ARRAY[]::TEXT[], 9
),
(
    22, 2, 'Abdomen', 'Evaluacion de solo del abdomen',
    'cuantitativa', 6.00, 1.0, 5.0,
    ARRAY[]::TEXT[], 10
),
(
    23, 2, 'Culo', 'Evaluacion del tamaño del culo',
    'ordinal', 19.00, 1.0, 5.0,
    ARRAY['BUEN CULO', 'CULOTE', 'CULAZO'], 11
),
(
    24, 2, 'Piernas', 'Evaluacion del tamaño de las piernas',
    'cuantitativa', 15.00, 1.0, 5.0,
    ARRAY[]::TEXT[], 12
),
(
    25, 2, 'Filmografia', 'Evalua la calidad, composicion, cuadros, angulos y variedad de filmes en los que trabajo',
    'cualitativa', NULL, NULL, NULL,
    ARRAY['MALOS', 'REGULARES', 'BUENOS', 'AMATEUR', 'INDEPENDIENTE', 'PROFESIONAL'], 13
),

-- ==========================================
-- CATEGORÍA 3: ACTRICES NOPOR (13 Criterios)
-- ==========================================
(
    26, 3, 'Intencion tuya', '¿Que tipo de relacion tendria con ella?',
    'cualitativa', NULL, NULL, NULL,
    ARRAY['NO LE HARIA', 'SOLO SEXO', 'NOVIA PASAGERA', 'RELACION SERIA'], 1
),
(
    27, 3, 'Personalidad', 'Cuando la vez, ¿que actitud refleja?',
    'cualitativa', NULL, NULL, NULL,
    ARRAY['MAMONA', 'NORMAL', 'INTERESANTE', 'DIVERTIDA'], 2
),
(
    28, 3, 'Rol', '¿Que cara tiene ella de ser?',
    'cualitativa', NULL, NULL, NULL,
    ARRAY['PASIVA', 'ACTIVA'], 3
),
(
    29, 3, 'Mirada O Intencion', '¿De que tiene cara?',
    'cualitativa', NULL, NULL, NULL,
    ARRAY['DE PUTA', 'MAMONA', 'INOSENTE', 'DE PENDEJA', 'DE GALLETA'], 4
),
(
    30, 3, 'Tipo de relacion', 'De que forma te la cogerias',
    'cualitativa', NULL, NULL, NULL,
    ARRAY['CRISTIANO', 'LE HAGO EL AMOR', 'SALVAJE', 'CON RABIA', 'PISARLE LA CABEZA'], 5
),
(
    31, 3, 'Cuerpo', 'Evaluacion de cuerpo completo, que sea armonico es si esta bien proporcional',
    'cuantitativa', 25.00, 1.0, 5.0,
    ARRAY[]::TEXT[], 6
),
(
    32, 3, 'Rostro', 'Evaluacion del atractivo de la cara',
    'cuantitativa', 10.00, 1.0, 5.0,
    ARRAY[]::TEXT[], 7
),
(
    33, 3, 'Tetas', 'Evaluacion del tamaño de las tetas',
    'ordinal', 19.00, 1.0, 5.0,
    ARRAY['BUENAS TETAS', 'TETONA', 'TETOTAS'], 8
),
(
    34, 3, 'Curvatura', 'Evaluacion de sus curvaturas: cintura y caderas',
    'cuantitativa', 6.00, 1.0, 5.0,
    ARRAY[]::TEXT[], 9
),
(
    35, 3, 'Abdomen', 'Evaluacion de solo del abdomen',
    'cuantitativa', 6.00, 1.0, 5.0,
    ARRAY[]::TEXT[], 10
),
(
    36, 3, 'Culo', 'Evaluacion del tamaño del culo',
    'ordinal', 19.00, 1.0, 5.0,
    ARRAY['BUEN CULO', 'CULOTE', 'CULAZO'], 11
),
(
    37, 3, 'Piernas', 'Evaluacion del tamaño de las piernas',
    'cuantitativa', 15.00, 1.0, 5.0,
    ARRAY[]::TEXT[], 12
),
(
    38, 3, 'Filmografia', 'Evalua la calidad, composicion, cuadros, angulos y variedad de filmes en los que trabajo',
    'cualitativa', NULL, NULL, NULL,
    ARRAY['MALOS', 'REGULARES', 'BUENOS', 'AMATEUR', 'INDEPENDIENTE', 'PROFESIONAL'], 13
);

-- 3. Sincronizar la secuencia del autoincremental de la tabla criterios_evaluativos
SELECT setval(
    pg_get_serial_sequence('public.criterios_evaluativos', 'id'),
    COALESCE((SELECT MAX(id) FROM public.criterios_evaluativos), 1)
);
