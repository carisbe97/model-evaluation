# 📐 REGLAS Y CONVENCIONES DE ARQUITECTURA DEL PROYECTO
> **Plataforma de Evaluación de Modelos — Vogue Elite (`model-evaluation`)**  
> *DOCUMENTO OBLIGATORIO DE CONSULTA PARA AGENTES DE IA ANTES DE CUALQUIER INTERVENCIÓN.*

---

## 0. 🚨 MANDATO OBLIGATORIO PARA EL AGENTE DE IA
**LEER DETENIDAMENTE ANTES DE EMPEZAR CUALQUIER TAREA:**
1. **No asumir ni improvisar arquitectura:** Este proyecto ya cuenta con una arquitectura limpia, modular y desacoplada bien establecida. Toda modificación debe respetar estrictamente esta estructura.
2. **Prohibido sobrecargar los HTML de las páginas:** Ninguna página (`*.component.html`) debe convertirse en un monolito de cientos de líneas. Las vistas principales actúan únicamente como orquestadoras de layout y delegan en componentes hijos.
3. **Respetar los componentes y estilos ya ajustados:** Pantallas críticas como `/evaluation` tienen proporciones de pantalla fijas (1920x1080), scrolls internos específicos y configuraciones visuales milimétricas. **NUNCA** modifiques sus estilos, grillas o estructuras sin antes consultar las reglas de este documento.
4. **Verificación de compilación:** Todo cambio de código debe validar que el proyecto compila limpiamente (`npm run build`).

---

## 1. 🏛️ ESTRUCTURA Y ARQUITECTURA DE DIRECTORIOS

El proyecto sigue una arquitectura limpia por capas en Angular con Standalone Components:

```text
src/app/
├── core/                           # Núcleo de la aplicación (Singletons, modelos, contratos y servicios)
│   ├── constants/                  # Constantes globales de configuración
│   ├── data-access/                # Capa de abstracción de datos (Patrón Repository/DataSource)
│   │   ├── contracts/              # Clases abstractas de acceso a datos (sin dependencias directas de BD)
│   │   │   ├── candidata.data-source.ts
│   │   │   ├── categoria.data-source.ts
│   │   │   ├── criterio.data-source.ts
│   │   │   ├── evaluacion.data-source.ts
│   │   │   ├── juez.data-source.ts
│   │   │   ├── reportes.data-source.ts
│   │   │   └── storage.data-source.ts
│   │   ├── supabase/               # Implementaciones concretas usando Supabase Client
│   │   └── data-access.providers.ts# Proveedores de inyección de dependencias para los DataSources
│   ├── guards/                     # Guardias de enrutamiento (ej. judge.guard.ts)
│   ├── models/                     # Interfaces TypeScript estrictas (candidata, evaluacion, reportes, etc.)
│   └── services/                   # Servicios de negocio (JudgeSessionService, ReportesService, ToastService, etc.)
│
├── shared/                         # Elementos compartidos TRANSVERSALMENTE (2 o más features)
│   └── components/                 # Componentes UI reutilizables y átomos
│       ├── loader/                 # Indicador de carga global
│       ├── navbar/                 # Barra de navegación principal
│       ├── toast/                  # Notificaciones flotantes
│       ├── status-badge/           # Badges de estado (Completada, Pendiente, etc.)
│       ├── model-card/             # Tarjeta de presentación de aspirante
│       ├── social-preview/         # Previsualizador de perfil en redes sociales
│       ├── me-criterios-cuantitativos-form/ # Sub-formulario reusable de criterios numéricos
│       ├── me-criterios-cualitativos-form/  # Sub-formulario reusable de criterios cualitativos
│       └── me-criterios-ordinales-form/      # Sub-formulario reusable de criterios ordinales
│
├── features/                       # Módulos verticales por funcionalidad / dominio
│   ├── welcome/                    # Pantalla de bienvenida y registro de juez
│   ├── categories-menu/            # Hub de selección de categorías
│   ├── evaluation/                 # Pantalla de evaluación de aspirantes
│   │   ├── components/             # Sub-componentes EXCLUSIVOS de la feature evaluation
│   │   │   ├── candidate-gallery/  # Visor y carrusel editorial de fotos
│   │   │   ├── candidate-selector/ # Barra de selección rápida de aspirantes
│   │   │   └── evaluation-form/    # Formulario con sliders y scroll interno
│   │   ├── evaluation.component.html # Orquestador delgado (layout grid 5/7 cols)
│   │   └── evaluation.component.ts
│   ├── results/                    # Tablero de resultados y reportes oficiales
│   │   ├── components/             # Pestañas y vistas hijas de resultados
│   │   │   ├── judge-evaluations-tab/# Pestaña de evaluaciones detalladas por juez
│   │   │   ├── ranking-tab/        # Pestaña de podio y ranking general
│   │   │   ├── criterios-tab/      # Pestaña de mejores por criterio
│   │   │   ├── consolidados-tab/   # Pestaña de expediente consolidado
│   │   │   └── evaluation-detail/  # Modal o vista de detalle de evaluación
│   │   ├── results.component.html  # Orquestador de tabs y filtros (< 180 líneas)
│   │   └── results.component.ts
│   ├── admin/                      # Panel de administración de categorías y criterios
│   │   ├── components/             # Modales y formularios de administración
│   │   │   ├── modal-categoria-form/ # Modal aislado para crear/editar categoría
│   │   │   └── modal-criterio-form/  # Modal aislado para crear/editar criterio
│   │   ├── admin.component.html
│   │   └── admin.component.ts
│   └── postulacion/                # Registro público de aspirantes
│
resource/
└── scripts/                        # Scripts SQL versionados e incrementales para Supabase/PostgreSQL
    ├── V1__schema.sql
    ├── V2__criterios_ordinales.sql
    ├── V3__resultados_cualitativos_y_consolidados.sql
    ├── V4__ranking_general_y_posiciones.sql
    ├── insert_candidatas.sql
    ├── insert_categorias.sql
    └── insert_criterios.sql
```

---

## 2. 🧩 ESTÁNDARES EN EL HTML Y DIVISIÓN DE COMPONENTES

### Regla Fundamental: Mantener los HTML de las Páginas Limpios y Legibles
- Los componentes de página (`evaluation.component.html`, `results.component.html`, `admin.component.html`) **NUNCA** deben contener marcado extenso de tablas gigantes, modales incrustados de cientos de líneas o bloques de formularios completos.
- Su única función es:
  1. Definir el layout macro (encabezados, contenedor de ancho máximo, grilla responsive, barra de tabs o filtros).
  2. Proveer feedback de carga (`@if (isLoading()) { <app-loader /> }`).
  3. Declarar e instanciar los componentes hijos pasando datos vía `[inputs]` y escuchando eventos vía `(outputs)`.

---

### ¿Cuándo crear un componente en `src/app/shared/components/`?
Un componente pertenece a `shared` **ÚNICAMENTE** si cumple con alguna de estas condiciones:
1. **Es un átomo o molécula UI genérico y reutilizable en 2 o más features independientes:**
   - Ejemplos: `app-loader`, `app-navbar`, `app-toast`, `app-status-badge`, `app-model-card`.
2. **Es un sub-formulario de criterio que se reutiliza transversalmente:**
   - Ejemplos: `app-me-criterios-cuantitativos-form`, `app-me-criterios-cualitativos-form`, `app-me-criterios-ordinales-form` (utilizados en la mesa de calificación y en las vistas previas de administración).

> [!CAUTION]
> **REGLA ESTRICTA:** Si un componente resuelve una necesidad de **una sola feature** (por ejemplo, el modal de categorías de administración o el carrusel de fotos de evaluación), **NUNCA DEBE CREARSE EN `shared`**. Pertenece a `features/<feature>/components/`.

---

### ¿Cuándo crear un componente dentro de `src/app/features/<feature>/components/`?
Cualquier pieza de UI específica de una feature debe extraerse a su carpeta local `components/` en los siguientes casos:

1. **Modales y Diálogos:**
   - **Prohibido:** Dejar el HTML de un modal incrustado al final de la página principal ocupando 100+ líneas.
   - **Correcto:** Crear `src/app/features/<feature>/components/modal-<nombre>-form/` como un componente standalone con sus propios `@Input()` (visibilidad, datos a editar) y `@Output()` (guardar, cerrar).
   - *Ejemplo aplicado:* `src/app/features/admin/components/modal-categoria-form/` y `modal-criterio-form/`.

2. **Pestañas y Vistas Hijas (Tabs):**
   - **Prohibido:** Colocar todas las tablas y podios en el mismo HTML con 800 líneas.
   - **Correcto:** Cada pestaña debe ser un componente independiente.
   - *Ejemplo aplicado:* En `results/`: `judge-evaluations-tab`, `ranking-tab`, `criterios-tab`, `consolidados-tab`.

3. **Secciones Complejas de Pantalla o Paneles Divididos:**
   - **Prohibido:** Unir la galería de fotos y el formulario de calificación en un solo archivo.
   - **Correcto:** Separar en sub-componentes independientes.
   - *Ejemplo aplicado:* En `evaluation/`: `candidate-gallery` (columna izquierda) y `evaluation-form` (columna derecha).

4. **Expedientes o Vistas de Detalle (Drawers / Paneles Flotantes):**
   - *Ejemplo aplicado:* `evaluation-detail`.

---

## 3. 🖥️ REGLAS DE LAYOUT, PROPORCIONES Y VIEWPORT (NO ROMPER)

### Pantalla de Calificación (`/evaluation`) — REGLAS CRÍTICAS DE ESTILO:
Esta pantalla está diseñada como una mesa de trabajo editorial para jurados y está optimizada para pantallas de **1920x1080** (y laptops 1366x768). **NO DEBE MODIFICARSE SU ESTRUCTURA BASE.**

1. **Cero Scroll en el Navegador / Body:**
   - La pantalla utiliza la clase global en el body:
     ```scss
     body.evaluation-mode {
       overflow: hidden !important;
       height: 100vh !important;
       max-height: 100vh !important;
     }
     ```
   - El contenedor principal usa `h-full flex-1 min-h-0 overflow-hidden flex flex-col`.
2. **Proporción de Grilla (Grid 12 Columnas):**
   - Contenedor con `max-w-[1720px] mx-auto`.
   - **Columna Izquierda (`col-span-5`):** Galería fotográfica (`app-candidate-gallery`) + previsualización social (`app-social-preview`).
   - **Columna Derecha (`col-span-7`):** Formulario de evaluación (`app-evaluation-form`).
3. **Contenedor de Fotos Fijo y Estable:**
   - El contenedor fotográfico tiene dimensiones estables (`aspect-[3/4]` o altura fija en pasarela).
   - Las imágenes deben utilizar `object-contain` para que sin importar si la fotografía es vertical u horizontal, el marco no salte ni empuje los componentes adyacentes.
4. **Scroll Interno Único (Dorado):**
   - El **ÚNICO** elemento con scroll vertical en toda la pantalla de evaluación es el contenedor interno de `app-evaluation-form`.
   - Utiliza la clase `.scrollbar-thin` con el color dorado oficial `#D4AF37`:
     ```scss
     .scrollbar-thin {
       scrollbar-width: thin;
       scrollbar-color: #D4AF37 rgba(15, 18, 26, 0.6);
       &::-webkit-scrollbar-thumb {
         background: #D4AF37;
         border-radius: 9999px;
       }
     }
     ```
   - El scroll debe permitir bajar holgadamente hasta los botones de acción (`Guardar y Continuar`).

---

### Pantalla de Resultados (`/results`) — LÓGICA DE PODIO Y CLASIFICACIÓN:
1. **Filtro "Todas las Categorías":**
   - El podio (Oro, Plata, Bronce) corresponde estrictamente a las **3 mejores puntuaciones generales del evento completo**, ordenadas por Promedio Final de mayor a menor.
   - La Tabla de Posiciones general clasifica de forma global descendente. No deben duplicarse 3 medallas de oro para diferentes categorías en este filtro general.
2. **Filtro por Categoría Específica:**
   - Muestra el podio local y las posiciones de las aspirantes pertenecientes a esa categoría seleccionada.

---

## 4. 🗄️ MANEJO DE SCRIPTS Y BASE DE DATOS (`resource/scripts/`)

Toda alteración en el esquema de base de datos de PostgreSQL en Supabase debe quedar registrada formalmente:

### Reglas de Versionado SQL:
1. **Convención de Nombres Incremental:**
   - Todo cambio DDL (tablas, columnas, índices, vistas, funciones) debe crearse en un archivo con el patrón:
     `resource/scripts/V<N>__<descripcion_en_snake_case>.sql`
   - *Ejemplos existentes:*
     - `V1__schema.sql`: Tablas principales, RLS y extensiones.
     - `V2__criterios_ordinales.sql`: Nuevos tipos y estructuras de criterios.
     - `V3__resultados_cualitativos_y_consolidados.sql`: Vistas para actas de evaluación y promedios.
     - `V4__ranking_general_y_posiciones.sql`: Vistas ajustadas para ranking global y ordenamiento de podio.
2. **Scripts de Datos (Seeds):**
   - Se guardan con el prefijo `insert_<entidad>.sql` (ej. `insert_candidatas.sql`, `insert_categorias.sql`, `insert_criterios.sql`).
3. **Sincronización con TypeScript:**
   - Si se modifica o crea una vista SQL (ej. `vista_ranking_categoria`, `vista_mejores_por_criterio`), es **OBLIGATORIO** actualizar la interfaz correspondiente en `src/app/core/models/reportes.model.ts`.
4. **Seguridad y Restricciones:**
   - Mantener siempre la restricción `UNIQUE(juez_nombre, candidata_id)` en la tabla `evaluaciones` para permitir la idempotencia de las operaciones `upsert`.
   - Toda tabla nueva debe habilitar `ROW LEVEL SECURITY (RLS)`.

---

## 5. 🔌 ACCESO A DATOS Y SERVICIOS (PATRÓN DATA SOURCE)

### Regla: Desacoplar la UI de Supabase
- **PROHIBIDO:** Inyectar directamente `SupabaseService` o el cliente de Supabase dentro de componentes de UI (`*.component.ts`).
- **CORRECTO:** Seguir el flujo de arquitectura:
  1. **Contrato:** Se define una clase abstracta en `src/app/core/data-access/contracts/<entidad>.data-source.ts`.
  2. **Implementación:** Se implementa en `src/app/core/data-access/supabase/<entidad>.supabase-data-source.ts`.
  3. **Inyección:** Se registra en `src/app/core/data-access/data-access.providers.ts`.
  4. **Servicio Core:** Los servicios en `src/app/core/services/` (`CandidatasService`, `ReportesService`, etc.) consumen el DataSource y exponen métodos o Signals listos para los componentes.
  5. **Componente:** El componente inyecta el servicio correspondiente.

---

## 6. 🎨 PALETA DE COLORES Y DESIGN SYSTEM (VOGUE ELITE)

El proyecto utiliza Tailwind CSS con tokens definidos:

| Token / Uso | Valor Hex | Clases Tailwind sugeridas |
| :--- | :--- | :--- |
| **Fondo Principal** | `#0B0D11` | `bg-[#0B0D11]`, `bg-brand-dark` |
| **Tarjetas / Paneles** | `#13161F` | `bg-[#13161F]`, `bg-brand-card` |
| **Bordes & Delimitadores** | `#232936` | `border-[#232936]`, `border-brand-border` |
| **Oro Primario** | `#D4AF37` | `text-brand-gold`, `border-brand-gold` |
| **Oro Claro (Highlight)** | `#F5E7B2` | `text-brand-goldLight` |
| **Oro Oscuro / Contorno** | `#997B1A` | `border-brand-goldDark` |
| **Gradiente Oro Fondo** | `#F5E7B2` a `#B88E16` | `.gold-gradient-bg` |
| **Gradiente Oro Texto** | `#FFF6D6` a `#AA820A` | `.gold-gradient-text` |
| **Fuente Títulos** | Cinzel | `font-display` |
| **Fuente Cuerpo** | Inter | `font-sans` |
| **Fuente Puntajes** | Monospace | `font-mono` |

---

## 7. 📋 CHECKLIST ANTES DE FINALIZAR CUALQUIER TAREA

Antes de reportar una tarea como completada, verifica:
- [ ] ¿Respeté la arquitectura de capas (`core`, `shared`, `features`)?
- [ ] ¿El HTML de mi página se mantuvo ligero y conciso, delegando en componentes hijos?
- [ ] Si creé un modal o formulario, ¿lo ubiqué dentro de `features/<feature>/components/` (o en `shared` si es transversal)?
- [ ] ¿Evité llamadas directas de base de datos desde los componentes de UI?
- [ ] Si toqué `/evaluation`, ¿verifiqué que no haya scroll exterior y que el scroll dorado interno funcione?
- [ ] Si modifiqué tablas o vistas SQL, ¿creé el script `V<N>__*.sql` en `resource/scripts/`?
- [ ] ¿Ejecuté la compilación de prueba y el proyecto compila sin errores?
