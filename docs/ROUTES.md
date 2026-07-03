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
│   │   ├── index        → Dashboard de entrenamiento
│   │   └── program/
│   │       └── create   → Creación de programa (premium)
│   ├── explore/
│   │   └── index        → Catálogo de programas oficiales
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
└── user/[id]            → Perfil público de otro usuario
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
| `/(tabs)/training` | `src/app/(tabs)/training/index.tsx` | Todos | Dashboard semanal y programa activo |
| `/(tabs)/training/program/create` | `src/app/(tabs)/training/program/create.tsx` | Premium | Creación de programa personalizado |
| `/(tabs)/explore` | `src/app/(tabs)/explore/index.tsx` | Todos | Catálogo de programas oficiales |
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
