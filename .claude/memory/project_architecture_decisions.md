---
name: project-architecture-decisions
description: Decisiones de arquitectura clave tomadas durante la auditoría inicial del proyecto training-app
metadata:
  type: project
---

React Query (TanStack Query) fue aprobado como dependencia en la sesión de auditoría inicial (2026-06-12). Está agregado a CLAUDE.md y tech-stack.md como tecnología autorizada para gestión de datos del servidor.

**Why:** Necesario para separar server state de client state. Zustand solo se usa para auth/theme/settings.

**How to apply:** Usar React Query para toda comunicación con el backend (queries, mutations, caché, paginación). Zustand queda restringido a auth state, user state, theme y settings globales.

---

La estructura de navegación está unificada en `.claude/docs/03-UI/navigation.md` como fuente de verdad.

4 tabs en este orden: Entrenamiento (/training) → Explorar (/explore) → Rankings (/rankings) → Perfil (/profile).

**Why:** Había 3 definiciones contradictorias (frontend.md, navigation.md, screens.md). navigation.md es ahora la única fuente de verdad.

**How to apply:** Ante cualquier duda de navegación, consultar navigation.md primero. frontend.md y screens.md son documentos complementarios.

---

Alcance MVP definido en `.claude/docs/04-roadmap/mvp.md`.

El único beneficio funcional de Premium en v1.0 es participar en rankings globales. Crear programas personalizados es v1.1.

**Why:** Reducir complejidad del MVP. El flujo de training loop (selección → ejecución → estadísticas) es el core.

**How to apply:** Antes de implementar cualquier feature, verificar que esté en la lista IN de mvp.md.

---

RLS policies definidas en `.claude/docs/02-architecture/database.md` al final del archivo.

service_role solo en Edge Functions, nunca en el cliente. user_stats y ranking_snapshots son públicos (necesarios para social). workout_executions nunca se eliminan.

**Why:** Sin RLS, cualquier usuario autenticado podría leer datos privados de otros directamente desde Supabase.

**How to apply:** Antes de crear cualquier tabla, definir su política RLS siguiendo los patrones establecidos. Usar funciones SECURITY DEFINER para tablas con ownership via JOIN.
