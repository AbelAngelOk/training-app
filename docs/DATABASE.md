# Base de datos

## Motor

PostgreSQL a través de Supabase. RLS (Row Level Security) habilitado en todas las tablas.

---

## Esquema actual

### Enums

| Enum | Valores |
|---|---|
| `user_role` | `free_user`, `premium_user`, `coach`, `admin` |
| `subscription_status` | `active`, `expired`, `cancelled`, `grace_period` |
| `program_type` | `official`, `personal`, `challenge` |
| `weekday` | `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday` |
| `session_type` | `official`, `personal` |
| `exercise_difficulty` | `beginner`, `intermediate`, `advanced` |
| `workout_status` | `in_progress`, `completed`, `cancelled` |
| `calendar_status` | `scheduled`, `completed`, `skipped` |
| `friend_request_status` | `pending`, `accepted`, `rejected` |
| `health_provider` | `health_connect`, `apple_health`, `garmin`, `fitbit`, `samsung_health` |
| `ranking_type` | `training_hours`, `weight_lifted`, `distance` |
| `coach_client_status` | `active`, `inactive` |
| `content_status` | `draft`, `published`, `archived` |

---

### Tablas

#### Usuarios

**`users`**
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | Igual al auth.users.id |
| email | text | Único |
| role | user_role | Default: free_user |
| created_at | timestamptz | |
| updated_at | timestamptz | Auto-actualizado |

**`user_profiles`**
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | Único (1 perfil por usuario) |
| display_name | text | Nombre visible |
| avatar_url | text | Nullable |
| city | text | Nullable |
| province | text | Nullable |
| country | text | Nullable |
| bio | text | Nullable |
| tag | varchar(30) | **PENDIENTE** — único, modificable 1x semana |
| tag_updated_at | timestamptz | **PENDIENTE** — controla frecuencia de cambio |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### Suscripciones

**`subscription_plans`** — Solo lectura para clientes
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| code | text | Único (ej: premium_monthly) |
| name | text | |
| duration_months | integer | |
| price | numeric | |
| active | boolean | |

**`user_subscriptions`** — Escritura solo por service_role
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | |
| subscription_plan_id | uuid FK → subscription_plans | |
| store_provider | text | google_play / apple_app_store |
| store_transaction_id | text | |
| starts_at | timestamptz | |
| expires_at | timestamptz | |
| status | subscription_status | |

#### Programas de entrenamiento

**`workout_programs`**
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| name | text | |
| description | text | Nullable |
| type | program_type | official / personal / challenge |
| owner_id | uuid FK → users | NULL = programa oficial o reto |
| source_program_id | uuid FK → workout_programs | NULL = no es copia |
| status | content_status | `draft` / `published` / `archived` — reemplazó a `active` (boolean). Programas personales nacen en `published` por defecto |
| duration_days | integer | Solo retos (CHECK: `type <> 'challenge' OR duration_days IS NOT NULL`) |
| achievement_id | uuid FK → achievements | Solo retos; logro que se desbloquea al completar todos los días |

**Retos (`type='challenge'`)**: reusan toda la infraestructura de programas/sesiones/tracking en vez de un modelo aparte. No se duplican al asignar (sus objetivos son fijos, no editables): `user_programs` apunta directo a la plantilla. Sus `program_days` usan `day_number` (1..duration_days) en vez de `weekday`, y sus `training_sessions` son `type='official'` (pasan las policies existentes de sesiones oficiales sin cambios). Ver `docs/FEATURES.md` para el flujo completo.

**`user_programs`**
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | |
| workout_program_id | uuid FK → workout_programs | |
| assigned_at | timestamptz | Fecha de asignación |
| is_active | boolean | Default `true`. Un usuario puede tener varias asignaciones (activas o desactivadas) |
| deactivated_at | timestamptz | Nullable. Se completa al desactivar |
| completed_at | timestamptz | Nullable. Solo retos: se completa cuando se terminan todos sus días (ver Edge Function `complete-workout`) |

Constraint `UNIQUE(user_id, workout_program_id)`: a lo sumo una fila de asignación por usuario y programa (reactivar reusa la fila en vez de insertar). Reemplaza a la vieja `unique_user_active_program` (`UNIQUE(user_id)`).

**Límites por plan** (trigger `check_user_program_limit`, `BEFORE INSERT OR UPDATE OF is_active`): al activar una asignación, cuenta cuántas asignaciones activas tiene el usuario del mismo tipo (programa vs. reto — comparando `workout_programs.type::text = 'challenge'`) y rechaza con `RAISE EXCEPTION 'PROGRAM_LIMIT_REACHED'` si ya alcanzó el límite:
- Free (`users.role = 'free_user'` y sin suscripción activa): 1 programa activo + 1 reto activo.
- Premium (`users.role IN ('premium_user','coach','admin')` o `user_subscriptions` activa/en gracia): 3 programas activos + 3 retos activos.

El cliente (`useProgramLimits` hook) replica este cálculo para UX (deshabilitar botones, mostrar avisos), pero el trigger es la garantía real.

**`program_days`**
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| workout_program_id | uuid FK → workout_programs | |
| weekday | weekday | Nullable. Programas normales |
| day_number | integer | Nullable. Solo retos (1..duration_days) |
| training_session_id | uuid FK → training_sessions | |

CHECK `program_day_schedule_xor`: exactamente uno de `weekday`/`day_number` está seteado (nunca ambos, nunca ninguno). Índice único parcial `(workout_program_id, day_number)` para retos.

#### Sesiones y ejercicios

**`training_sessions`**
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| name | text | |
| description | text | Nullable |
| type | session_type | official / personal |
| owner_id | uuid FK → users | NULL = sesión oficial |
| source_session_id | uuid FK → training_sessions | Nullable |
| estimated_duration_minutes | integer | Nullable |
| targets_configured_at | timestamptz | Nullable. Se completa cuando el usuario termina el wizard obligatorio de primera vez (`session/[id]/setup`). NULL en sesiones legacy (anteriores a esta columna) — la pre-sesión también chequea historial completado para no forzar el wizard en esos casos |

**`session_exercises`**
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| training_session_id | uuid FK → training_sessions | |
| exercise_id | uuid FK → exercises | |
| sort_order | integer | Orden dentro de la sesión |
| target_sets | integer | Nullable |
| target_reps | integer | Nullable |
| target_weight | numeric | Nullable (kg) |
| target_duration_seconds | integer | Nullable |
| target_distance_meters | numeric | Nullable |
| rest_seconds | integer | Nullable |

**`muscle_groups`** — Solo lectura
| Campo | Tipo |
|---|---|
| id | uuid PK |
| name | text (unique) |

**`equipment`** — Solo lectura
| Campo | Tipo |
|---|---|
| id | uuid PK |
| name | text (unique) |

**`exercises`** — Solo lectura para clientes; escritura solo `admin` (dashboard) o `service_role`
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| name | text | |
| description | text | Nullable |
| instructions | text | Nullable |
| image_url | text | Nullable |
| tips | text | Nullable |
| external_id | text | Unique. ID from ExerciseDB API (solo para importar catálogo — `seed:exercises`). NULL = custom/local exercise |
| fitgifs_slug | text | Nullable. Slug de fitgifs API (`/gif/{slug}`). NULL = sin GIF asociado |
| muscle_group_id | uuid FK → muscle_groups | FK sin `ON DELETE` (NO ACTION) — no se puede borrar un grupo muscular en uso |
| equipment_id | uuid FK → equipment | Nullable |
| difficulty | exercise_difficulty | |
| active | boolean | Soft delete (dashboard admin). `session_exercises.exercise_id` es `ON DELETE RESTRICT`, así que borrar un ejercicio en uso falla — el dashboard ofrece desactivar en su lugar |
| **NOTE** | GIFs fetched on-demand | Ver `src/api/exercise-gif.ts` / `docs/EXERCISE_GIF_ARCHITECTURE.md` — el GIF no se guarda, se arma la URL en runtime a partir de `fitgifs_slug` |

#### Ejecución de entrenamientos

**`workout_executions`** — Sin DELETE
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | |
| training_session_id | uuid FK → training_sessions | |
| started_at | timestamptz | |
| completed_at | timestamptz | Nullable |
| duration_seconds | integer | Nullable |
| status | workout_status | in_progress / completed / cancelled |

**`workout_exercise_executions`** — Sin DELETE
| Campo | Tipo |
|---|---|
| id | uuid PK |
| workout_execution_id | uuid FK → workout_executions |
| session_exercise_id | uuid FK → session_exercises |

**`workout_sets`** — Sin DELETE
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| workout_exercise_execution_id | uuid FK | |
| set_number | integer | |
| weight | numeric | Nullable (kg) |
| reps | integer | Nullable |
| duration_seconds | integer | Nullable |
| distance_meters | numeric | Nullable |

#### Calendario y estadísticas

**`calendar_events`** — Escritura solo por service_role
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | |
| training_session_id | uuid FK → training_sessions | |
| scheduled_date | date | |
| status | calendar_status | scheduled / completed / skipped |
| UNIQUE | (user_id, training_session_id, scheduled_date) | |

**`user_stats`** — Escritura solo por service_role; PK = user_id
| Campo | Tipo |
|---|---|
| user_id | uuid PK → users |
| total_workouts | integer |
| total_training_seconds | bigint |
| total_weight_lifted | numeric |
| total_distance_meters | numeric |
| current_streak | integer |
| best_streak | integer |

#### Sistema social

**`friend_requests`**
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| sender_id | uuid FK → users | |
| receiver_id | uuid FK → users | |
| status | friend_request_status | pending / accepted / rejected |
| UNIQUE | (sender_id, receiver_id) | |

**`friendships`** — Escritura solo por service_role
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| user_a_id | uuid FK → users | Siempre menor UUID |
| user_b_id | uuid FK → users | Siempre mayor UUID |
| UNIQUE | (user_a_id, user_b_id) | |

#### Rankings y logros

**`ranking_snapshots`** — Escritura solo por service_role
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | |
| ranking_type | ranking_type | |
| value | numeric | |
| city / province / country | text | Nullable |
| snapshot_date | date | |
| UNIQUE | (user_id, ranking_type, snapshot_date) | |

**`achievements`** — Solo lectura
| Campo | Tipo |
|---|---|
| id | uuid PK |
| code | text (unique) |
| name | text |
| description | text |

**`user_achievements`** — Escritura solo por service_role; Sin UPDATE/DELETE
| Campo | Tipo |
|---|---|
| id | uuid PK |
| user_id | uuid FK → users |
| achievement_id | uuid FK → achievements |
| unlocked_at | timestamptz |
| UNIQUE | (user_id, achievement_id) |

#### Integraciones (futuro)

**`health_connections`**, **`coach_clients`** — definidas en esquema, funcionalidad post-MVP.

---

## Migraciones

| Archivo | Descripción | Estado |
|---|---|---|
| `20260613000000_initial_schema.sql` | Schema completo inicial (24 tablas, enums, RLS, triggers) | ✅ Aplicada |
| `20260614000001_add_user_tag.sql` | Agrega `tag` y `tag_updated_at` a `user_profiles` | ✅ Aplicada |
| `20260615000002_add_unique_user_programs.sql` | Agrega restricción UNIQUE en `user_id` a `user_programs` | ✅ Aplicada |
| `20260615000003_add_external_id_to_exercises.sql` | Agrega `external_id` y `tips` a exercises; remueve `video_url` | ✅ Aplicada |
| `20260709000004_duplicate_program_deep.sql` | Función RPC `duplicate_program_deep` (copia profunda de programas) | ✅ Aplicada |
| `20260710000005_user_programs_multi_active.sql` | `user_programs` admite múltiples asignaciones (`is_active`, `deactivated_at`); trigger `check_user_program_limit` para límites free/premium | ✅ Aplicada |
| `20260711000006_add_challenge_program_type.sql` | Agrega `'challenge'` al enum `program_type` (migración separada: `ALTER TYPE ADD VALUE` no puede compartir transacción con su uso) | ✅ Aplicada |
| `20260711000007_challenges_schema.sql` | Esquema de retos: `duration_days`/`achievement_id` en `workout_programs`, `day_number` en `program_days`, policies de lectura para `type='challenge'`, `user_programs.completed_at`, seed de ejemplo ("Reto: 7 días de burpees" + su achievement) | ✅ Aplicada |
| `20260712000008_history_indexes.sql` | Índices para el progreso histórico por sesión: `workout_executions(user_id, training_session_id, started_at DESC)` y `training_sessions(source_session_id)` | ✅ Aplicada |
| `20260713000009_session_targets_configured.sql` | Agrega `training_sessions.targets_configured_at` (marca de "ya pasó por el wizard inicial de objetivos") | ✅ Aplicada |
| `20260714000010_admin_role_and_users_protection.sql` | Función `is_admin()`; policy `users: admin update`; trigger `prevent_role_self_escalation` (bloquea que un usuario cambie su propio `role` salvo que ya sea admin) | ✅ Aplicada |
| `20260714000011_content_status_enum.sql` | Reemplaza `workout_programs.active` (boolean) por `status content_status` (`draft`/`published`/`archived`), migra datos existentes, actualiza policy de retos | ✅ Aplicada |
| `20260714000012_exercises_soft_delete.sql` | Agrega `exercises.active` (soft-delete; `session_exercises.exercise_id` es `ON DELETE RESTRICT`) | ✅ Aplicada |
| `20260714000013_program_days_weekday_unique.sql` | Agrega índice único parcial `(workout_program_id, weekday)` — bug preexistente: `setProgramDay()` ya usaba `upsert(onConflict:...)` sin que este constraint existiera | ✅ Aplicada |
| `20260714000014_admin_write_policies.sql` | Policies de INSERT/UPDATE/DELETE condicionadas a `is_admin()` sobre exercises/muscle_groups/equipment/achievements/workout_programs/training_sessions/session_exercises/program_days (dashboard admin) | ✅ Aplicada |
| `20260714000015_fix_role_escalation_trigger.sql` | Corrige `prevent_role_self_escalation`: la versión original bloqueaba incluso a `service_role`/migraciones (sin sesión JWT, `auth.uid()` es NULL) — ahora solo bloquea cuando hay una sesión autenticada no-admin intentando el cambio | ✅ Aplicada |
| `20260714000016_admin_select_user_programs.sql` | Policy adicional (aditiva) `user_programs: admin select` — sin ella, `getProgramAssignmentCount()` (chequeo previo a eliminar un programa/reto oficial, ya que `workout_program_id` es `ON DELETE CASCADE`) siempre devolvía 0 para asignaciones de otros usuarios, dejando el borrado duro sin protección real | ✅ Aplicada |
| `20260714000017_admin_select_draft_challenges.sql` | Corrige `"workout_programs: select challenges"`: a diferencia de `"select official"` (sin filtro de status), esta policy solo permitía ver retos `status='published'` — ni siquiera un admin podía ver/editar retos en borrador o archivados. Ahora: `status='published' OR is_admin()` | ✅ Aplicada |
| `20260718000018_add_fitgifs_slug_to_exercises.sql` | Agrega `fitgifs_slug` a exercises (referencia a fitgifs API para GIFs) — reemplaza el sistema de video de ExerciseDB | ✅ Aplicada |

### Función RPC: duplicate_program_deep

`duplicate_program_deep(p_source_program_id uuid, p_name text DEFAULT NULL) RETURNS uuid`

Copia profunda de un programa para el usuario autenticado (`SECURITY DEFINER`):

- Copia `workout_programs` (como `type='personal'`, `owner_id = auth.uid()`), sus `program_days`, cada `training_sessions` (como `type='personal'`) y sus `session_exercises` completos (targets incluidos).
- `source_program_id` y `source_session_id` se normalizan siempre a la plantilla **raíz** (`COALESCE(source_x_id, id)`), lo que permite agrupar el historial de ejecuciones de copias sucesivas de una misma plantilla.
- Solo permite duplicar programas oficiales o propios.

**Uso**: `assignProgram()` la invoca al asignar un programa oficial, de modo que el usuario recibe una copia personal cuyos objetivos (`target_sets/reps/weight`) puede editar libremente (la RLS impide editar plantillas oficiales). La asignación en `user_programs` apunta a la copia.

### Migración pendiente: add_user_tag

```sql
ALTER TABLE public.user_profiles
  ADD COLUMN tag varchar(30),
  ADD COLUMN tag_updated_at timestamptz;

CREATE UNIQUE INDEX idx_user_profiles_tag
  ON public.user_profiles (tag)
  WHERE tag IS NOT NULL;

CREATE INDEX idx_user_profiles_tag_lower
  ON public.user_profiles (lower(tag))
  WHERE tag IS NOT NULL;
```

**Reglas de negocio del tag:**
- Formato: `/^[a-zA-Z0-9_]{3,30}$/`
- Único en la plataforma
- Modificable máximo 1 vez por semana (verificar `tag_updated_at < NOW() - INTERVAL '7 days'`)
- Nullable (no obligatorio en el registro)

---

## Portal de administración (`/admin`)

Rutas web-only dentro del mismo proyecto Expo Router (`src/app/admin/`, carpeta real — no route group, para no colisionar con `/login` móvil). Login separado (`/admin/login`, reusa `supabase.auth.signInWithPassword`), guard en `src/app/admin/_layout.tsx` que verifica `users.role === 'admin'` (hook `useAdminRole()` en `src/hooks/use-admin.ts`) y redirige a "Acceso denegado" si no lo es. Guard adicional `Platform.OS !== 'web'` (redirige a `/` en nativo).

**Función `is_admin()`** (`SECURITY DEFINER`, mismo patrón que `owns_workout_program`/`owns_training_session`): chequea `users.role = 'admin'` para el usuario autenticado actual. Usada en todas las policies de escritura admin.

**Protección contra auto-promoción**: la policy `"users: update own"` (preexistente, sin `WITH CHECK`) permitía que cualquier usuario cambiara su propio `role`. El trigger `prevent_role_self_escalation` lo bloquea, **excepto** cuando no hay sesión JWT activa (`auth.uid() IS NULL` — `service_role`, migraciones, SQL Editor), para no romper el bootstrap del primer admin ni futuras operaciones de infraestructura.

**Bootstrap del primer admin**: no es una migración versionada (es una operación de datos de un entorno/persona específica). Después de que el usuario se registre con signup normal:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'abel.angel1996@gmail.com';
```

**Escritura de contenido admin**: policies RLS separadas por comando (INSERT/UPDATE/DELETE, no `FOR ALL`) condicionadas a `is_admin()` sobre `exercises`, `muscle_groups`, `equipment`, `achievements`, `workout_programs`, `training_sessions`, `session_exercises`, `program_days`. El dashboard escribe con el mismo cliente Supabase que la app móvil (`src/lib/supabase.ts`), sin Edge Functions nuevas.

**Componentes compartidos** (`src/components/admin/`): `DataTable` (tabla genérica, sin librería de grid), `ConfirmDeleteModal`, `FormField`, `ExerciseForm`, `ProgramForm`, `AchievementForm`, `ChallengeForm`, `SessionForm`, `ProgramDaySelector`, `CatalogManager`, `AdminSidebar`.

**Verificación**: no hay Playwright en el proyecto; `.claude/skills/verify/SKILL.md` documenta cómo conducir la app en un Edge headless real vía CDP (WebSocket nativo de Node, sin dependencias nuevas) para probar logins y guards de punta a punta.

**Fase 1 — Ejercicios** (`/admin/exercises`): CRUD completo. Eliminar un ejercicio referenciado por `session_exercises` (`ON DELETE RESTRICT`) captura el error Postgres `23503` y ofrece desactivarlo (`active=false`) en su lugar; las sesiones existentes lo conservan.

**Fase 2 — Programas** (`/admin/programs`): CRUD completo sobre `workout_programs` (`type='official'`), con badge de `status` (Borrador/Publicado/Archivado) y detalle de solo-lectura de "Días del programa" (la edición de días vive en el módulo de Sesiones). A diferencia de `exercises`, `user_programs.workout_program_id` es `ON DELETE CASCADE` — un borrado duro no lanza error de FK, así que antes de eliminar se consulta `getProgramAssignmentCount()`; si hay asignaciones existentes, se ofrece archivar (`status='archived'`) en vez de borrar.

**Fase 3 — Logros y Retos** (`/admin/achievements`, `/admin/challenges`): Logros adelantado de la Fase 5 porque los retos los referencian (`achievement_id`, requerido). Eliminar un logro se bloquea (sin alternativa de "archivar", no existe ese concepto para logros) si `getAchievementUsage()` detecta uso en `workout_programs.achievement_id` (`ON DELETE SET NULL`) o en `user_achievements.achievement_id` (`ON DELETE CASCADE` — borrarlo silenciosamente le quitaría el logro ya desbloqueado a los usuarios). Retos reutiliza el mismo `getProgramAssignmentCount()` de Programas (misma tabla `workout_programs`/`user_programs`) para el flujo de "ofrecer archivar en vez de eliminar".

**Fase 5 — Extras**: Grupos musculares y Equipamiento (`/admin/muscle-groups`, `/admin/equipment`) comparten un único componente `CatalogManager` (`src/components/admin/CatalogManager.tsx`) — CRUD de un solo campo (`name`) con edición inline; `exercises.muscle_group_id`/`equipment_id` no tienen `ON DELETE` (RESTRICT por defecto), así que eliminar uno en uso lanza `23503`, capturado igual que en Ejercicios (sin alternativa de desactivar, solo bloqueo informativo). Overview (`/admin`, `src/api/admin.ts#getAdminOverviewStats`) muestra conteos reales en paralelo (usuarios por rol, programas/retos por status, entrenamientos completados en 7 días). Gestión de usuarios (`/admin/users`) permite cambiar `role` por fila (protegido por la policy + trigger de Fase 0); la fila del propio admin logueado se marca "(vos)" y no es editable desde la UI como capa extra de seguridad, aunque el trigger ya lo permitiría. `subscription_plans` CRUD (5.5) quedó **sin implementar**, explícitamente opcional/baja prioridad en el plan original.

**Fase 4 — Sesiones y asociación a programas/retos** (`/admin/sessions`): CRUD de `training_sessions` (`type='official'`) + gestor de ejercicios de la sesión (agregar/editar targets/quitar, reusando `addExerciseToSession`/`updateSessionExercise`/`removeExerciseFromSession`). `program_days.training_session_id` es `ON DELETE CASCADE` (a diferencia de `workout_executions`/`calendar_events`, que no tienen `ON DELETE` y por lo tanto sí bloquean con `23503` si hay historial real) — por eso, antes de eliminar una sesión se consulta `getSessionProgramDayUsage()` y se bloquea si está asignada a algún día (sin alternativa de archivar; hay que quitar la asociación primero). Componente compartido `ProgramDaySelector` (`src/components/admin/ProgramDaySelector.tsx`): completa cada slot de horario (7 días de la semana para un programa, `1..duration_days` para un reto) con una sesión, reusado desde el detalle de Programa y de Reto; `setProgramDayByWeekday`/`setProgramDayByDayNumber` (antes `setProgramDay`, renombrada — sin otros call sites) hacen upsert sobre los índices únicos parciales ya existentes. El detalle de una sesión muestra sus asociaciones (qué programas/retos y qué día) en modo lectura + quitar; agregar una asociación se hace siempre desde el lado del Programa/Reto.

---

## Datos iniciales (seed)

Cargados via `scripts/seed.js`:

| Tabla | Registros | Descripción |
|---|---|---|
| `muscle_groups` | 10 | Pecho, Espalda, Piernas, Hombros, Bíceps, Tríceps, Core, Glúteos, Pantorrillas, Antebrazos |
| `equipment` | 9 | Barra, Mancuernas, Máquina, Peso corporal, Kettlebell, Banda elástica, Polea, Smith Machine, Barra EZ |
| `exercises` | 44 | Catálogo de ejercicios por grupo muscular |
| `achievements` | 10 | FIRST_WORKOUT → MARATHON |
| `subscription_plans` | 2 | Premium Mensual ($9.99) y Anual ($79.99) |

---

## Índices

```sql
-- Usuarios
CREATE INDEX ON users (email);

-- Perfiles
CREATE INDEX ON user_profiles (country);
CREATE INDEX ON user_profiles (province);
CREATE INDEX ON user_profiles (city);
CREATE UNIQUE INDEX ON user_profiles (tag) WHERE tag IS NOT NULL;      -- PENDIENTE
CREATE INDEX ON user_profiles (lower(tag)) WHERE tag IS NOT NULL;       -- PENDIENTE

-- Workouts
CREATE INDEX ON workout_executions (user_id);
CREATE INDEX ON workout_executions (started_at);

-- Calendario
CREATE INDEX ON calendar_events (user_id);

-- Amigos
CREATE INDEX ON friendships (user_a_id);
CREATE INDEX ON friendships (user_b_id);

-- Rankings
CREATE INDEX ON ranking_snapshots (ranking_type);
CREATE INDEX ON ranking_snapshots (country);
CREATE INDEX ON ranking_snapshots (province);
CREATE INDEX ON ranking_snapshots (city);
CREATE INDEX ON ranking_snapshots (value);
```
