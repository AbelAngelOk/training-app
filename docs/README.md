# Training App

Aplicación móvil de entrenamiento físico desarrollada con React Native y Expo.

## Propósito

Centralizar planificación, ejecución y análisis de entrenamientos en una plataforma con rankings competitivos y seguimiento de progreso.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | React Native + Expo (SDK 54) |
| Navegación | Expo Router |
| Lenguaje | TypeScript (strict) |
| Estado global | Zustand |
| Estado del servidor | TanStack Query (React Query) |
| Formularios | React Hook Form + Zod |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions) |
| Animaciones | React Native Reanimated |
| Fechas | date-fns |

## Requisitos previos

- Node.js 18+
- npm 9+
- Expo Go (iOS/Android) o emulador
- Cuenta de Supabase con proyecto configurado

## Instalación

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` en la raíz con:

```env
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

## Comandos

```bash
# Iniciar en modo desarrollo
npm start

# Android
npm run android

# iOS
npm run ios

# Web
npm run web

# Lint
npm run lint

# Seed inicial de base de datos
node scripts/seed.js
```

## Estructura del proyecto

```
src/
├── api/              # Queries y mutaciones de Supabase
├── components/ui/    # Componentes de UI reutilizables
├── constants/        # Colores, query keys
├── hooks/            # Custom hooks (React Query)
├── lib/              # Configuración de Supabase y React Query
├── services/         # Lógica que invoca Edge Functions
├── stores/           # Zustand stores (auth, theme)
└── types/            # Tipos TypeScript (database.ts)

src/app/
├── (auth)/           # Pantallas públicas (login, register)
├── (tabs)/           # Pantallas con bottom navigation
│   ├── training/     # Dashboard + creación de programas
│   ├── explore/      # Catálogo de programas oficiales
│   ├── rankings/     # Rankings por tipo y alcance
│   └── profile/      # Perfil + sub-pantallas
└── user/[id].tsx     # Perfil público de otro usuario

supabase/
├── functions/        # Edge Functions (Deno)
└── migrations/       # Migraciones SQL versionadas

docs/                 # Documentación técnica del proyecto
scripts/              # Scripts utilitarios (seed, etc.)
```

## Modelo de usuarios

| Rol | Capacidades |
|---|---|
| `free_user` | Programas oficiales, historial, rankings de amigos |
| `premium_user` | Todo lo anterior + rankings globales, programas personalizados (v1.1) |
| `coach` | Todo lo anterior + gestión de clientes (futuro) |
| `admin` | Acceso completo a la plataforma |

## Documentación adicional

- [GLOSARIO.md](./GLOSARIO.md) — Correspondencia entre términos coloquiales (Programa, Reto, Rutina, Sesión, Entrenamiento) y las tablas reales
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Decisiones de arquitectura
- [ROUTES.md](./ROUTES.md) — Mapa de rutas y navegación
- [DATABASE.md](./DATABASE.md) — Esquema de base de datos
- [FEATURES.md](./FEATURES.md) — Funcionalidades por pantalla
- [USER_FLOWS.md](./USER_FLOWS.md) — Flujos de usuario
- [TESTING.md](./TESTING.md) — Estrategia de testing
- [TESTID_CONVENTION.md](./TESTID_CONVENTION.md) — Convención de identificadores de componentes
- [RELEASES.md](./RELEASES.md) — Proceso de build, versionado y publicación en Play Store
