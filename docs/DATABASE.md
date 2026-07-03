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
| `program_type` | `official`, `personal` |
| `weekday` | `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday` |
| `session_type` | `official`, `personal` |
| `exercise_difficulty` | `beginner`, `intermediate`, `advanced` |
| `workout_status` | `in_progress`, `completed`, `cancelled` |
| `calendar_status` | `scheduled`, `completed`, `skipped` |
| `friend_request_status` | `pending`, `accepted`, `rejected` |
| `health_provider` | `health_connect`, `apple_health`, `garmin`, `fitbit`, `samsung_health` |
| `ranking_type` | `training_hours`, `weight_lifted`, `distance` |
| `coach_client_status` | `active`, `inactive` |

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
| type | program_type | official / personal |
| owner_id | uuid FK → users | NULL = programa oficial |
| source_program_id | uuid FK → workout_programs | NULL = no es copia |
| active | boolean | Soft delete |

**`user_programs`**
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | |
| workout_program_id | uuid FK → workout_programs | |
| assigned_at | timestamptz | Fecha de asignación |

**`program_days`**
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| workout_program_id | uuid FK → workout_programs | |
| weekday | weekday | |
| training_session_id | uuid FK → training_sessions | |

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

**`exercises`** — Solo lectura para clientes
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| name | text | |
| description | text | Nullable |
| instructions | text | Nullable |
| image_url | text | Nullable |
| video_url | text | Nullable |
| muscle_group_id | uuid FK → muscle_groups | |
| equipment_id | uuid FK → equipment | Nullable |
| difficulty | exercise_difficulty | |

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
| `20260614000001_add_user_tag.sql` | Agrega `tag` y `tag_updated_at` a `user_profiles` | ⏳ Pendiente |

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
