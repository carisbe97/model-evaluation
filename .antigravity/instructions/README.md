# Directrices Generales para el Proyecto Model Evaluation (Vogue Elite)

Este proyecto cuenta con tres agentes de apoyo especializados:
1. `agent-supabase-architect.md`: Base de datos PostgreSQL, esquemas DDL, RLS, vistas de ranking y scripts de seed.
2. `agent-angular-ui.md`: Maquetación estética editorial de alta costura, transiciones, visor de fotos y podio.
3. `agent-state-evaluator.md`: Estado reactivo con Signals, computed properties, validaciones y sincronización con Supabase.

Consulta sus especificaciones en `.agent/rules/` o en este mismo directorio.

⚠️ **REGLA SUPREMA:** Para arquitectura de directorios, división de componentes en HTML (`shared` vs `features/<feature>/components`), manejo de scripts en `resource/scripts/` y normas de diseño, consulta el documento principal en la raíz: [AGENTS.md](../../AGENTS.md).
