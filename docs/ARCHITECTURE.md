# Arquitectura

## Principios

1. **API-First** — toda lógica crítica vive en el backend, nunca exclusivamente en el cliente.
2. **Backend como fuente de verdad** — permisos, validaciones, rankings y estadísticas se calculan en el servidor.
3. **Separación de responsabilidades** — cada capa tiene una responsabilidad clara y no invade la otra.
4. **Duplication Model** — cuando un usuario personaliza contenido oficial, se crea una copia. El original nunca se modifica.

---

## Capas del sistema

```
┌─────────────────────────────────────────────────┐
│                 Pantallas (app/)                │
│   Renderizado, navegación, UX, estados UI       │
└────────────────────┬────────────────────────────┘
                     │ consume
┌────────────────────▼────────────────────────────┐
│              Hooks (src/hooks/)                 │
│   useQuery / useMutation por dominio            │
│   Caché, invalidación, estados de carga         │
└────────────────────┬────────────────────────────┘
                     │ llama a
┌────────────────────▼────────────────────────────┐
│         API Layer (src/api/)                    │
│   Queries directas a Supabase (CRUD)            │
└────────────────────┬────────────────────────────┘
                     │ o a
┌────────────────────▼────────────────────────────┐
│       Services Layer (src/services/)            │
│   Operaciones complejas vía Edge Functions      │
└────────────────────┬────────────────────────────┘
                     │ invoca
┌────────────────────▼────────────────────────────┐
│        Supabase Backend                         │
│   PostgreSQL + Auth + RLS + Edge Functions      │
└─────────────────────────────────────────────────┘
```

---

## Estado de la aplicación

### Zustand (estado global persistente)
Usado solo para:
- `auth-store.ts` — session, user, initialized
- `theme-store.ts` — tema activo (wolf / fox / crimson-night en el futuro)

**No usar Zustand para datos del servidor.** Para eso existe React Query.

### React Query (estado del servidor)
- Caché automático con staleTime de 5 minutos
- Retry: 2 veces en queries, 0 en mutations
- Invalidación explícita después de cada mutación relevante
- Query keys centralizadas en `src/constants/query-keys.ts`

---

## Seguridad

### Row Level Security (RLS)
Habilitado en las 24 tablas. Cada tabla tiene políticas explícitas por operación (SELECT/INSERT/UPDATE/DELETE).

### service_role
La `service_role` key de Supabase bypasea RLS. Se usa **exclusivamente** en Edge Functions. Nunca se incluye en el bundle del cliente.

### Tablas de solo escritura por service_role
Las siguientes tablas solo pueden escribirse mediante Edge Functions:
- `user_stats` — actualizada por `complete-workout`
- `ranking_snapshots` — actualizada por `generate-rankings`
- `user_achievements` — actualizada por `process-achievements`
- `calendar_events` — actualizada por `schedule-calendar-events`
- `friendships` — creada por `accept-friend-request`
- `user_subscriptions` — creada por función de suscripción (futura)

---

## Edge Functions

Corren en Deno (runtime de Supabase). Usan `service_role` internamente y verifican el JWT del usuario llamante.

| Función | Trigger | Responsabilidad |
|---|---|---|
| `complete-workout` | Mobile al terminar sesión | Actualiza stats, streak, calendar_event; dispara achievements |
| `process-achievements` | Llamada por complete-workout | Evalúa y desbloquea logros |
| `accept-friend-request` | Mobile al aceptar solicitud | Crea registro en `friendships` |
| `generate-rankings` | Cron job diario | Genera ranking_snapshots para usuarios premium |
| `schedule-calendar-events` | Cron job diario | Genera eventos de calendario de los próximos 14 días |

---

## Sistema de temas

Definido en `src/constants/colors.ts`. El tema activo se lee desde `useThemeStore`.

Temas planificados:
- **Wolf** (activo en MVP) — gris azulado oscuro
- **Fox** — cálido naranja (post-MVP)
- **Crimson Night** — rojo competitivo (post-MVP)

El sistema de tokens (colores, espaciado, tipografía, border radius) está abstraído en `WolfTheme` y es independiente del tema, permitiendo agregar nuevos temas sin refactorizar componentes.

---

## Decisiones técnicas documentadas

| Decisión | Justificación |
|---|---|
| React Query para server state | Evita duplicar lógica de caché en Zustand; soporte nativo de loading/error/empty |
| Expo Router file-based | Navegación predecible, type-safe routes, menos boilerplate |
| Supabase sin ORM | PostgREST + tipos generados es suficiente para el modelo actual; menos overhead |
| Edge Functions para stats/rankings | Garantiza consistencia de datos sin race conditions desde múltiples clientes |
| Historial de workouts inmutable | Regla de negocio: nunca perder historial; auditoría y confianza del usuario |
| Tags de usuario con unique index parcial | Permite NULL (tag opcional) sin violar unicidad |
