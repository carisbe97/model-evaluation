# Arquitectura, Descomposición de Componentes y Manejo de Scripts
> Consulta el documento maestro en la raíz del proyecto: [AGENTS.md](../../AGENTS.md)

Este documento resume los principios que todo agente debe cumplir en este repositorio:
1. **Páginas delgadas:** Mantener los `*.component.html` limpios y legibles (< 150 líneas).
2. **Componentes locales:** Pestañas, modales (`modal-categoria-form`, etc.) y secciones de formularios pertenecen a `src/app/features/<feature>/components/`.
3. **Componentes shared:** Solo elementos UI atómicos reutilizados en 2+ features (`src/app/shared/components/`).
4. **Scripts de base de datos:** Versionados en `resource/scripts/V<N>__<descripcion>.sql`.
5. **Layouts sensibles:** Respetar la vista 1920x1080 de `/evaluation` (cero scroll exterior, scroll interno dorado en `app-evaluation-form`, grilla 5/7 cols).
6. **Patrón Data Access:** Inyectar contratos y DataSources desde `core/data-access`, nunca invocar Supabase directamente desde vistas.
