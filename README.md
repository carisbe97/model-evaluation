# 👑 VOGUE ELITE — Plataforma de Evaluación de Aspirantes

Plataforma web de alto rendimiento construida en **Angular (Standalone Components, Signals & Tailwind CSS)** integrada con arquitectura cloud serverless sobre **Supabase (PostgreSQL & Storage)** y desplegada en **Firebase Hosting**.

Diseñada para eventos de scouting, agencias de modelos y pasarelas de alta costura, donde el jurado calificador evalúa aspirantes por categorías con criterios cuantitativos y cualitativos, interactúa con un visor fotográfico de alta fidelidad y consulta rankings y podios en vivo calculados directamente por vistas de base de datos.

🌐 **Demo en Producción:** [https://model-evaluation-71b48.web.app](https://model-evaluation-71b48.web.app)

---

## ✨ Características Principales

### 📸 Visor Editorial de Fotos (`CandidateGalleryComponent`)
- **Carrusel Automático a 5 Segundos**: Rotación fluida entre la foto de perfil y las fotos de galería de la aspirante.
- **Pausa Inteligente en Hover**: Detiene la rotación automáticamente al colocar el cursor para inspeccionar detalles.
- **Ajuste Adaptativo (`object-contain`)**: Visualización completa y sin cortes de imágenes tanto verticales como panorámicas o cuadradas, sin distorsión ni zoom invasivo.
- **Backdrop Ambiental Desenfocado**: Relleno periférico con efecto *Glassmorphism* generado a partir de la misma foto activa para garantizar armonía estética editorial.
- **Navegación Intuitiva**: Flechas centradas, barra de indicadores (*dots*) en cápsula traslúcida y carrusel de miniaturas inferiores con resaltado de borde dorado.

### 📝 Evaluación Multicriterio Flexible (`EvaluationFormComponent`)
- **Criterios Cuantitativos**: Puntuación numérica (1 a 10) con cálculo inmediato de promedios ponderados.
- **Criterios Cualitativos**: Selección de opciones cualitativas parametrizadas por categoría (almacenadas como `text[]`).
- **Criterios Ordinales**: Evaluación jerárquica y de orden de mérito.
- **Selector Rápido de Aspirantes (`CandidateSelectorComponent`)**: Navegación fluida entre candidatas sin perder el contexto del formulario.
- **Previsualización de Redes (`SocialPreviewComponent`)**: Tarjeta compacta de perfil oficial de la candidata (X, Instagram, etc.) con acceso directo.
- **Observaciones y Feedback**: Campo de notas adicionales por evaluación.

### 🏆 Podio y Reportes en Tiempo Real (`ResultsComponent`)
- **Podio de Honor**: Top 3 de la categoría con medallas de oro, plata y bronce.
- **Tabla General de Posiciones**: Ranking dinámico basado en la vista PostgreSQL `vista_ranking_categoria`.
- **Destacadas por Criterio**: Tabla de mejores puntuadas según la vista `vista_mejores_por_criterio`.
- **Carga Diferida (`@defer (on idle)`)**: Rendimiento optimizado dividiendo las pestañas secundarias en chunks lazy para reducir el bundle inicial.

### 🔐 Gestión de Sesión y Acceso
- **Identificación Rápida de Jurado**: Registro de nombre de juez almacenado de forma reactiva en `sessionStorage` y administrado con Signals.
- **Protección de Rutas (`judge-name.guard.ts`)**: Redirección automática a la pantalla de bienvenida si no se ha registrado un juez activo.

---

## 🏛 Arquitectura del Proyecto

```
model-evaluation/
├── .agent/
│   └── rules/
│       ├── agent-supabase-architect.md      # Guía de PostgreSQL, DDL, RLS y Vistas
│       ├── agent-angular-ui.md              # Lineamientos de diseño editorial, lujo y UX
│       └── agent-state-evaluator.md          # Patrones reactivos con Signals y Session
├── resource/
│   └── scripts/                             # Scripts DDL, migraciones y seeds SQL
│       ├── V1__schema.sql                   # Esquema base (Tablas, RLS y Vistas)
│       ├── V2__criterios_ordinales.sql      # Extensión para criterios ordinales
│       ├── V3__resultados_cualitativos_y_consolidados.sql # Vistas analíticas consolidadas
│       ├── insert_categorias.sql            # Datos maestros de categorías
│       ├── insert_criterios.sql             # Criterios cuantitativos y cualitativos
│       ├── insert_candidatas.sql            # Aspirantes con fotos en Supabase Storage
│       └── imagenes_candidatas.txt          # Inventario de URLs de fotos públicas
├── src/
│   ├── environments/
│   │   ├── environment.ts                   # Variables de producción
│   │   └── environment.development.ts       # Variables de desarrollo (Supabase Keys)
│   └── app/
│       ├── core/
│       │   ├── guards/
│       │   │   └── judge-name.guard.ts      # Guard funcional de sesión
│       │   ├── models/
│       │   │   ├── candidata.model.ts       # Interfaz de aspirantes y fotos
│       │   │   ├── categoria.model.ts       # Categorías y estados
│       │   │   ├── criterio.model.ts        # Tipado de criterios (cualitativo/cuantitativo)
│       │   │   ├── evaluacion.model.ts      # Modelo de calificaciones
│       │   │   ├── juez.model.ts            # Modelo de jurado
│       │   │   └── reportes.model.ts        # Tipado de rankings y podio
│       │   └── services/
│       │       ├── candidatas.service.ts    # CRUD y consultas de aspirantes
│       │       ├── categorias.service.ts    # Consulta de categorías
│       │       ├── criterios.service.ts     # Consulta de criterios de evaluación
│       │       ├── evaluaciones.service.ts  # Registro y validación de evaluaciones
│       │       ├── judge-session.service.ts # Estado global reactivo con Signals
│       │       ├── reportes.service.ts      # Consultas a vistas SQL de resultados
│       │       └── supabase.service.ts      # Cliente oficial de Supabase
│       ├── features/
│       │   ├── welcome/                     # Portada de bienvenida e ingreso de jurado
│       │   ├── categories-menu/             # Selector de categorías con barra de progreso
│       │   ├── evaluation/                  # Pantalla principal de evaluación
│       │   │   └── components/
│       │   │       ├── candidate-gallery/   # Visor fotográfico con carrusel de 5s
│       │   │       ├── candidate-selector/  # Selector rápido de aspirantes
│       │   │       └── evaluation-form/     # Formulario de puntuación y observaciones
│       │   └── results/                     # Podio y tabla de resultados con @defer
│       └── shared/
│           └── components/
│               ├── navbar/                  # Barra superior de navegación y estado de juez
│               ├── model-card/              # Tarjeta de aspirante para listas
│               ├── loader/                  # Indicador de carga animado
│               ├── social-preview/          # Previsualización compacta de redes sociales
│               ├── status-badge/            # Badges de estado
│               ├── me-criterios-cuantitativos-form/ # Subformulario cuantitativo
│               ├── me-criterios-cualitativos-form/  # Subformulario cualitativo
│               └── me-criterios-ordinales-form/     # Subformulario ordinal
```

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/TU-USUARIO/model-evaluation.git
cd model-evaluation
npm install
```

### 2. Configurar Variables de Entorno
Crea o edita los archivos `src/environments/environment.development.ts` y `src/environments/environment.ts` con las credenciales de tu proyecto Supabase:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://TU-PROYECTO.supabase.co',
  supabaseAnonKey: 'TU-ANON-KEY-DE-SUPABASE'
};
```

### 3. Ejecutar los Scripts de Base de Datos
Ejecuta secuencialmente los scripts ubicados en `resource/scripts/` en el **SQL Editor** de Supabase:
1. `V1__schema.sql`: Tablas, relaciones, políticas RLS y funciones.
2. `V2__criterios_ordinales.sql`: Estructura para soporte ordinal.
3. `V3__resultados_cualitativos_y_consolidados.sql`: Vistas para cálculo de podio y rankings.
4. `insert_categorias.sql`: Catálogo inicial de categorías.
5. `insert_criterios.sql`: Criterios con opciones cualitativas y escalas.
6. `insert_candidatas.sql`: Aspirantes vinculadas a fotos de Supabase Storage.

### 4. Iniciar Servidor de Desarrollo
```bash
npm start
# o con Angular CLI directamente
ng serve
```
Abre tu navegador en `http://localhost:4200/`.

---

## 📦 Compilación y Despliegue en Firebase Hosting

El proyecto se encuentra configurado para desplegarse de manera directa en **Firebase Hosting**:

### Construir bundle de producción
```bash
npm run build
```

### Desplegar en Firebase
```bash
npx firebase deploy --only hosting
```

La configuración de reescritura de rutas SPA para Angular se encuentra gestionada en `firebase.json`:
```json
{
  "hosting": {
    "public": "dist/model-evaluation/browser",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

## 🎨 Paleta de Diseño y Estética Visual

El proyecto implementa un sistema visual de lujo y alta costura mediante **Tailwind CSS**:
- **Fondo Primario (`brand-darker`)**: `#0b0b0e` (Negro obsidiana profundo).
- **Tarjetas y Superficies (`brand-card`)**: `#131318` con bordes sutiles en `#23232c`.
- **Acento Dorado (`brand-gold`)**: `#d4af37` con reflejos dorados y resplandor *gold-glow*.
- **Efectos**: *Glassmorphism* (`backdrop-blur-md`), transiciones suaves y microanimaciones de estado.

---

## 🛠 Tecnologías Utilizadas

- **Framework**: [Angular 19/22](https://angular.dev/) (Standalone Components, Signals, Control Flow `@if`/`@for`/`@defer`)
- **Estilos**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Base de Datos & Storage**: [Supabase](https://supabase.com/) (PostgreSQL 15+, Row Level Security, Storage Buckets)
- **Hosting & CDN**: [Firebase Hosting](https://firebase.google.com/products/hosting)
- **Iconografía**: SVG puro con microinteracciones y estilos adaptativos
