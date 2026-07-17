# Rutas de navegación

## Estructura general

```
/                        → Redirect (auth check)
├── (auth)/
│   ├── welcome          → Pantalla de bienvenida
│   ├── login            → Inicio de sesión
│   ├── register         → Registro de cuenta
│   └── forgot-password  → Recuperación de contraseña
│
├── (tabs)/              → Bottom Navigation (requiere auth)
│   ├── training/
│   │   ├── index        → Lista de programas activos, retos activos y calendario combinado (o estado vacío)
│   │   ├── [id]         → Detalle de programa
│   │   ├── manage-programs → Gestión de programas activos/desactivados
│   │   ├── session/[id]/
│   │   │   ├── index    → Pre-sesión ("Planificación de la sesión", solo lectura + ícono de editar + iniciar)
│   │   │   ├── setup    → Wizard obligatorio de primera vez (descanso + objetivos por ejercicio)
│   │   │   ├── execute  → Ejecución guiada (video + series, un ejercicio a la vez)
│   │   │   ├── summary  → Resumen objetivo vs. realizado
│   │   │   └── history  → Progreso histórico (gráfico + estados por ejecución)
│   │   ├── exercise/[id] → Detalle/video de un ejercicio
│   │   └── program/
│   │       └── create   → Creación de programa (premium)
│   ├── explore/
│   │   ├── index        → Carruseles "Programas" y "Retos" (máx 6 c/u + "Ver todo")
│   │   ├── programs     → Todos los programas paginados, con buscador
│   │   ├── challenges   → Todos los retos paginados, con buscador y filtro de duración
│   │   ├── challenge/[id] → Detalle de reto (días, logro asociado, "Comenzar reto")
│   │   └── [id]          → Detalle de programa oficial/personal
│   ├── rankings/
│   │   └── index        → Rankings por tipo y alcance
│   └── profile/
│       ├── index        → Perfil del usuario
│       ├── edit         → Editar perfil
│       ├── friends      → Amigos y búsqueda
│       ├── achievements → Logros
│       ├── subscription → Suscripción premium
│       ├── settings     → Configuración (email, password)
│       └── personalization → Temas y preferencias
│
├── user/[id]            → Perfil público de otro usuario
│
└── admin/                → Portal web de administración (carpeta real, solo web, requiere role='admin')
    ├── login             → Login separado del móvil
    ├── index             → Overview
    ├── exercises/         → CRUD de ejercicios
    ├── programs/          → CRUD de programas (draft/published/archived)
    ├── challenges/        → CRUD de retos
    ├── sessions/          → CRUD de sesiones + asociación a programas/retos
    ├── achievements/       → CRUD de logros
    ├── muscle-groups/      → CRUD de grupos musculares
    ├── equipment/          → CRUD de equipamiento
    └── users/              → Gestión de roles de usuario
```

---

## Detalle por ruta

### Rutas públicas (sin autenticación)

| Ruta | Archivo | Descripción |
|---|---|---|
| `/` | `src/app/index.tsx` | Redirect: `/welcome` si no auth, `/(tabs)/training` si auth |
| `/(auth)/welcome` | `src/app/(auth)/welcome.tsx` | Landing con opciones login/register |
| `/(auth)/login` | `src/app/(auth)/login.tsx` | Formulario de login |
| `/(auth)/register` | `src/app/(auth)/register.tsx` | Formulario de registro |
| `/(auth)/forgot-password` | `src/app/(auth)/forgot-password.tsx` | Recuperación de contraseña |

### Rutas protegidas — Bottom Tabs

| Ruta | Archivo | Acceso | Descripción |
|---|---|---|---|
| `/(tabs)/training` | `src/app/(tabs)/training/index.tsx` | Todos | Lista de programas activos del usuario (0, 1 o hasta 3 según plan); estado vacío si no tiene ninguno |
| `/(tabs)/training/[id]` | `src/app/(tabs)/training/[id].tsx` | Todos | Detalle de un programa; menú "⋯" con "Desactivar programa" y "Gestionar programas" |
| `/(tabs)/training/manage-programs` | `src/app/(tabs)/training/manage-programs.tsx` | Todos | Lista de asignaciones activas y desactivadas, con toggle para (re)activar respetando el límite del plan |
| `/(tabs)/training/session/[id]` | `src/app/(tabs)/training/session/[id]/index.tsx` | Todos | Pre-sesión: "Planificación de la sesión" de solo lectura (ícono de lápiz para editar) y botón "Iniciar sesión" |
| `/(tabs)/training/session/[id]/setup` | `src/app/(tabs)/training/session/[id]/setup.tsx` | Todos | Wizard obligatorio de primera vez: descanso entre series + series/reps/peso por ejercicio |
| `/(tabs)/training/session/[id]/execute` | `src/app/(tabs)/training/session/[id]/execute.tsx` | Todos | Ejecución guiada: un ejercicio por pantalla (video arriba, series abajo), swipe entre ejercicios |
| `/(tabs)/training/session/[id]/summary` | `src/app/(tabs)/training/session/[id]/summary.tsx` | Todos | Resumen post-entrenamiento: objetivo vs. realizado por serie |
| `/(tabs)/training/session/[id]/history` | `src/app/(tabs)/training/session/[id]/history.tsx` | Todos | Progreso histórico: gráfico de barras por métrica + lista de ejecuciones con estado |
| `/(tabs)/training/exercise/[id]` | `src/app/(tabs)/training/exercise/[id].tsx` | Todos | Detalle y video de un ejercicio |
| `/(tabs)/training/program/create` | `src/app/(tabs)/training/program/create.tsx` | Premium | Creación de programa personalizado |
| `/(tabs)/explore` | `src/app/(tabs)/explore/index.tsx` | Todos | Carruseles "Programas" y "Retos" (máx. 6 c/u) con botón "Ver todo" |
| `/(tabs)/explore/programs` | `src/app/(tabs)/explore/programs.tsx` | Todos | Todos los programas oficiales, paginados de a 10, con buscador |
| `/(tabs)/explore/challenges` | `src/app/(tabs)/explore/challenges.tsx` | Todos | Todos los retos, paginados de a 10, con buscador y filtro de duración |
| `/(tabs)/explore/[id]` | `src/app/(tabs)/explore/[id].tsx` | Todos | Detalle de programa; asignar respeta el límite del plan |
| `/(tabs)/explore/challenge/[id]` | `src/app/(tabs)/explore/challenge/[id].tsx` | Todos | Detalle de reto: días, logro asociado, "Comenzar reto" (respeta el límite del plan) |
| `/(tabs)/rankings` | `src/app/(tabs)/rankings/index.tsx` | Todos (ver); Premium (participar global) | Rankings por tipo y scope |
| `/(tabs)/profile` | `src/app/(tabs)/profile/index.tsx` | Todos | Perfil, stats, menú |
| `/(tabs)/profile/edit` | `src/app/(tabs)/profile/edit.tsx` | Todos | Editar nombre, tag, bio, ubicación |
| `/(tabs)/profile/friends` | `src/app/(tabs)/profile/friends.tsx` | Todos | Lista de amigos + búsqueda + solicitudes |
| `/(tabs)/profile/achievements` | `src/app/(tabs)/profile/achievements.tsx` | Todos | Logros desbloqueados y pendientes |
| `/(tabs)/profile/subscription` | `src/app/(tabs)/profile/subscription.tsx` | Todos | Estado y planes de suscripción |
| `/(tabs)/profile/settings` | `src/app/(tabs)/profile/settings.tsx` | Todos | Cambio de email y contraseña |
| `/(tabs)/profile/personalization` | `src/app/(tabs)/profile/personalization.tsx` | Todos | Temas y preferencias visuales |

### Rutas globales

| Ruta | Archivo | Acceso | Descripción |
|---|---|---|---|
| `/user/[id]` | `src/app/user/[id].tsx` | Todos | Perfil público de cualquier usuario |

---

## Bottom Navigation

Orden fijo de las pestañas:

| Posición | Nombre | Ícono | Ruta |
|---|---|---|---|
| 1 | Entrenamiento | barbell | `/(tabs)/training` |
| 2 | Explorar | compass | `/(tabs)/explore` |
| 3 | Rankings | trophy | `/(tabs)/rankings` |
| 4 | Perfil | person | `/(tabs)/profile` |

---

## Refactorización de rutas requerida

La estructura actual tiene `training.tsx` y `profile.tsx` como archivos planos en `(tabs)/`. Para soportar sub-rutas, deben convertirse a carpetas:

```
Antes:
src/app/(tabs)/training.tsx
src/app/(tabs)/profile.tsx

Después:
src/app/(tabs)/training/index.tsx   (mismo contenido)
src/app/(tabs)/training/_layout.tsx (Stack navigator)
src/app/(tabs)/profile/index.tsx    (mismo contenido)
src/app/(tabs)/profile/_layout.tsx  (Stack navigator)
```

**Impacto:** Las referencias de tabs en `src/app/(tabs)/_layout.tsx` deben usar `name="training/index"` o el nombre de la carpeta según el comportamiento de Expo Router.

---

## Reglas de navegación

1. `/` siempre redirige según estado de auth.
2. Rutas `(auth)/` son inaccesibles si el usuario está autenticado.
3. Rutas `(tabs)/` requieren autenticación; redirigen a `/welcome` si no hay sesión.
4. `/user/[id]` es accesible sin tabs (no muestra bottom nav).
5. La ruta `/training/program/create` solo es accesible para usuarios premium; mostrar paywall para free users.
6. Después de login exitoso, redirigir a `/` (que redirige a `/(tabs)/training`).
7. Después de registro exitoso, mostrar mensaje de éxito en la misma pantalla antes de redirigir.
8. `/admin/*` es un árbol completamente aparte: carpeta real (no route group), solo accesible en `Platform.OS==='web'`, con su propio login (`/admin/login`) y guard por `role='admin'` (`src/app/admin/_layout.tsx`) — no comparte sesión de navegación con `(auth)`/`(tabs)` más allá del mismo `useAuthStore`/sesión de Supabase.
