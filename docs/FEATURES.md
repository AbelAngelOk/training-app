# Features

Documentación funcional completa de cada pantalla y sus reglas de negocio.

---

## /register — Registro de cuenta

### Campos
| Campo | Validación |
|---|---|
| Nombre | 2–50 caracteres |
| Email | Formato válido |
| Contraseña | Mínimo 8 caracteres |
| Confirmar contraseña | Debe coincidir con contraseña |

### UX de contraseña
- **Ícono show/hide** en el campo de contraseña y confirmación.
- **Indicador de fortaleza** debajo del campo de contraseña:
  - Barra visual: débil (rojo) / media (naranja) / fuerte (verde)
  - 5 criterios visuales (solo informativos, no bloquean el registro):
    - ✓/✗ Al menos una mayúscula
    - ✓/✗ Al menos una minúscula
    - ✓/✗ Al menos un número
    - ✓/✗ Al menos un carácter especial
    - ✓/✗ Mínimo 8 caracteres

### Flujo
1. Usuario completa el formulario
2. React Hook Form + Zod validan en tiempo real
3. Al submit: `POST /auth/v1/signup`
4. Si HTTP 200: mostrar mensaje de éxito "¡Cuenta creada! Revisá tu email para confirmar tu cuenta."
5. Si error: mostrar mensaje de error descriptivo

### Reglas de negocio
- Un email solo puede tener una cuenta activa.
- Supabase envía email de confirmación automáticamente.
- El `display_name` se guarda en `auth.users.user_metadata`.
- Al confirmar email, el trigger `on_auth_user_created` crea automáticamente registros en `public.users` y `public.user_stats`.

---

## /login — Inicio de sesión

### Campos
| Campo | Validación |
|---|---|
| Email | Formato válido |
| Contraseña | Mínimo 6 caracteres |

### UX
- **Ícono show/hide** en campo de contraseña.
- **Mensaje de error unificado**: "Email o contraseña incorrectos" (no revelar qué campo falló — seguridad).
- Link a recuperación de contraseña.
- Link a registro.

### Flujo
1. Usuario ingresa credenciales
2. Llamada a `supabase.auth.signInWithPassword()`
3. Si exitoso: redirigir a `/` (que redirige a `/(tabs)/training`)
4. Si error auth: mostrar "Email o contraseña incorrectos"
5. Si error de red: mostrar "Error de conexión, intentá nuevamente"

---

## /training — Lista de programas activos

### Límites por plan (reqs. d, h, i)
| Plan | Programas activos | Retos activos (Fase 3) |
|---|---|---|
| Free | 1 | 1 |
| Premium | 3 | 3 |

Programas y retos se cuentan por separado. El límite se aplica en dos capas: `useProgramLimits()` (cliente, UX) y el trigger `check_user_program_limit` (BD, garantía real — ver `docs/DATABASE.md`).

### Secciones
- **Header**: título "Entrenamiento" + cantidad de programas activos (o "Sin programas activos") + botón "Mis programas" (icono `albums-outline`) → `/training/manage-programs`
- **Banner "Entrenamiento en curso"**: visible si hay un `workout_execution` `in_progress`; toca para reanudar la sesión donde quedó
- **Calendario mensual combinado (req. g)**: `MonthCalendar` (grilla propia, sin librería) con navegación mes anterior/siguiente. Marca con un punto **violeta** los días comprometidos por programas activos (proyectados desde `program_days.weekday`, solo a partir de `assigned_at`) y con un punto **ámbar** los días de retos activos (proyectados `assigned_at + (day_number - 1)`). El punto aparece **relleno** si ese día ya se completó (hay un `workout_execution` `completed` real) o **hueco** si todavía está pendiente. Solo se muestra si el usuario tiene al menos un programa o reto activo.
- **Retos activos (req. g)**: si hay alguno, una sección con una card por reto (nombre, progreso `días completados/duration_days`); tap → `/explore/challenge/[id]`.
- **Lista de programas activos**: una card por programa asignado y activo (nombre, descripción, días/semana, badge "Activo"); tap → `/training/[id]`.
- **Estado vacío** (solo programas): si no tiene programas activos, CTA "Explorar programas" → `/explore` y "Mis programas" → `/training/manage-programs` (por si tiene alguno desactivado para reactivar). El calendario y los retos activos igual se muestran si existen, aunque no haya programas.

### Navegación desde esta pantalla
| Acción | Destino |
|---|---|
| Tap en card de programa | `/(tabs)/training/[id]` |
| Tap en card de reto | `/(tabs)/explore/challenge/[id]` |
| Botón "Mis programas" (header) | `/(tabs)/training/manage-programs` |
| "Explorar programas" (estado vacío) | `/(tabs)/explore` |
| Banner "Entrenamiento en curso" | Pre-sesión del entrenamiento activo (reanudar) |

---

## /training/[id] — Detalle de programa

No tiene botón "Iniciar sesión" propio: el usuario elige qué sesión entrenar tocando directamente su `SessionCard` en la lista (navega a `/training/session/[id]`).

Además del calendario y lista de sesiones, el botón "⋯" del header abre un menú con:
- **"Desactivar programa"** (solo si la asignación está activa): llama `setUserProgramActive(id, false)`, libera un cupo del plan y vuelve a la lista. El historial de ejecuciones del programa se conserva.
- **"Gestionar programas"**: navega a `/training/manage-programs`.

---

## /training/manage-programs — Gestión de programas

- Dos secciones: **Activos** y **Desactivados**, cada asignación con nombre, tipo (Oficial/Personal/Reto) y fecha de desactivación si aplica.
- Cada fila tiene un botón **Activar**/**Desactivar**. Al intentar activar sin cupo disponible, se muestra un `AlertModal` de error con el límite del plan actual.
- Reactivar reusa la fila de asignación existente (no crea una nueva copia del programa).

---

## /training/session/[id] — Sesión de entrenamiento

### Pre-sesión (`session/[id]/index`) — "Planificación de la sesión"
- Sección titulada **"Planificación de la sesión"**, de **solo lectura por defecto**. Un ícono de lápiz junto al título (visible solo si `canEditTargets`) alterna el modo edición; al tocarlo cambia a un check verde mientras está activo. Solo se pueden editar sesiones `type='personal'` (sesiones oficiales legacy se muestran en solo lectura con aviso de reasignar).
- Al asignar un programa oficial desde Explore se crea una **copia personal profunda** (RPC `duplicate_program_deep`), por lo que las sesiones del usuario siempre son editables. Los cambios en modo edición se guardan al salir de cada input (`updateSessionExercise`).
- Botón **"Iniciar sesión"**: al final del contenido scrolleable (NO sticky/fijo, debajo de la lista de ejercicios). Crea `workout_execution` (in_progress) + una `workout_exercise_execution` por ejercicio y navega a la ejecución guiada. La sesión NO inicia automáticamente al entrar.
- Si ya existe un entrenamiento in_progress de esta sesión, el botón pasa a **"Continuar sesión"** (reanuda con las series ya registradas). Si el in_progress es de otra sesión, se bloquea el inicio con aviso.
- Ícono de header (`stats-chart-outline`) → `/training/session/[id]/history` (progreso histórico, ver más abajo).

#### Wizard obligatorio de primera vez (`session/[id]/setup`, reqs. a, b)
- Se dispara automáticamente (redirect) la primera vez que se entra a una sesión personal sin `targets_configured_at` y sin historial `completed` (ver `docs/DATABASE.md`). Es **obligatorio**: no se puede llegar a "Iniciar sesión" sin completarlo.
- **Paso 0 — Descanso entre series**: una única pregunta global (input en segundos + chips 30/60/90/120s) que se aplica a **todos** los ejercicios de la sesión.
- **Pasos 1..N — uno por ejercicio**: pantalla completa por ejercicio pidiendo series, repeticiones y peso; estos valores pasan a ser los **objetivos iniciales** (`session_exercises.target_*`).
- Al finalizar ("Guardar y comenzar"): actualiza los `target_*`/`rest_seconds` de todos los ejercicios y marca `training_sessions.targets_configured_at`, luego vuelve a la pre-sesión (ya de solo lectura, con los valores cargados).

#### Ajuste de objetivos entre semanas (req. c)
- Cada vez que se entra a la pre-sesión de una sesión con **al menos una ejecución `completed`** (propia o de una copia hermana vía `source_session_id` — ej. "sesión A" de la semana 2 compara contra la de la semana 1), aparece automáticamente `BumpTargetsModal`:
  1. "¿Querés modificar los objetivos?" → **Sí, modificar** / **No, mantener**.
  2. Si sí: "¿Cómo?" → **Con formulario** / **Manualmente**.
  3. Formulario: checkboxes **Peso (+5kg)** / **Series (+1)** / **Repeticiones (+2)** — el incremento marcado se aplica a **todos** los ejercicios de la sesión de una vez; queda de solo lectura al terminar.
  4. Manualmente: cierra el modal y activa el mismo modo edición que el ícono de lápiz (ejercicio por ejercicio).

### Ejecución guiada (`session/[id]/execute`)
- Un ejercicio por pantalla: **mitad superior video** (ExerciseDB, fallback a instrucciones), **mitad inferior series y descansos**.
- Navegación tipo tarjetas: swipe horizontal para avanzar/saltar ejercicios; indicador de puntos en el header (violeta = actual, verde = completado).
- Marcar una serie registra la fila en `workout_sets` (`logSet`) con el peso/reps reales; las series registradas se pueden editar (sync `updateSet` con debounce) pero no desmarcar (historial inmutable).
- Al completar una serie arranca el **descanso** (deadline persistente, botón "Saltar"); al completar la última serie del ejercicio, el fin del descanso **auto-avanza** al próximo ejercicio incompleto.
- Cronómetro derivado de `started_at`: sobrevive a cierres/minimizado de la app.
- **Página final no-sticky** (`FinishSessionCard`): última página del carrusel, después del último ejercicio (se llega deslizando, no es una barra fija). Muestra tiempo transcurrido, ejercicios completados/total y el botón **"Finalizar sesión"**. Las vistas de ejercicio no muestran ninguna barra inferior.
- **"Finalizar sesión"**: si quedan ejercicios incompletos, muestra `FinishIncompleteModal` ("Finalizar de todos modos" / "Volver a completar"); si están todos completos, finaliza directo. Al confirmar, invoca la Edge Function `complete-workout` (stats, racha, logros) y navega al resumen.
- Botón atrás abre modal (`ConfirmExitModal`) con 4 opciones: **Guardar y salir** (queda in_progress, reanudable), **Finalizar entrenamiento incompleto** (completa ya mismo con lo hecho hasta ahora, sin pedir confirmación adicional), **Cancelar entrenamiento** (status cancelled) o **Seguir entrenando**.

### Resumen (`session/[id]/summary`)
- Duración, series completadas vs. objetivo y volumen total (Σ peso×reps).
- Comparación **objetivo vs. realizado** serie por serie con indicador: cumplido (verde), superado (violeta), por debajo (ámbar). Ejercicios sin series figuran como salteados.

### Progreso histórico (`session/[id]/history`, req. c)
- Chips de métrica: **Peso** (volumen Σ peso×reps), **Duración**, **Reps**, **Series**. Gráfico de barras (`MiniBarChart`, sin librería externa — `View`s con altura proporcional) en orden cronológico.
- Lista cronológica de ejecuciones (más recientes primero) con badge de **estado**: `Completada` (verde), `Fuera de día` (ámbar — se completó mostrando un día de semana distinto al planificado en `program_days.weekday`), `Cancelada` (rojo), `En curso` (violeta).
- **Agrupa el historial de copias sucesivas de la misma plantilla**: como los programas oficiales se duplican al asignarlos (`duplicate_program_deep`), reasignar el mismo programa crea una sesión distinta pero con el mismo `source_session_id` raíz; el historial busca todas las sesiones hermanas de esa raíz para no fragmentar el progreso entre asignaciones.
- Solo se traen las últimas 30 ejecuciones (`api/workouts.ts#getSessionExecutionHistory`).

---

## /training/program/create — Creación de programa

### Acceso
Solo usuarios `premium_user`, `coach` o `admin`. Free users ven paywall.

### Campos
| Campo | Notas |
|---|---|
| Nombre | Requerido, 3–100 caracteres |
| Descripción | Opcional |
| Días de entrenamiento | Selección de días + asignación de sesiones |

### Flujo
1. Usuario completa el formulario
2. `POST` a `workout_programs` con `type: 'personal'` y `owner_id: user.id`
3. El usuario puede agregar sesiones y ejercicios en pasos posteriores
4. Redirige al detalle del programa creado

---

## /explore — Programas y Retos (reqs. e, f)

### Secciones
- **Carrusel "Programas"**: hasta 6 programas oficiales en fila horizontal, título + botón "Ver todo" → `/explore/programs`.
- **Carrusel "Retos"**: hasta 6 retos en fila horizontal (mismo patrón), → `/explore/challenges`. Card con ícono de llama y badge de duración en días.
- Componente compartido: `src/components/explore/SectionCarousel.tsx` (título + "Ver todo" + `FlatList` horizontal, cap de 6 ítems).
- **Estado vacío**: mientras carga o sin resultados en cada carrusel.

### /explore/programs y /explore/challenges — "Ver todo"
- Listado paginado de a 10 (`useInfinitePrograms`/`useInfiniteChallenges`, scroll infinito), con buscador (`SearchInput`, debounce 300ms).
- Retos además tienen chips de filtro por duración ("Hasta 14 días" / "15+ días").

### Programas oficiales iniciales

**Principiante 3 Días**
- Objetivo: introducción al entrenamiento
- Duración: sin fecha límite (continuo)
- Días: Lunes, Miércoles, Viernes
- Nivel: Principiante

**Hipertrofia 4 Días**
- Objetivo: aumento de masa muscular
- Duración: sin fecha límite (continuo)
- Días: Lunes (Push), Martes (Pull), Jueves (Piernas), Sábado (Upper)
- Nivel: Intermedio

### Acción sobre un programa
- Ver detalle: sesiones y ejercicios reales (`useProgramWithExercises`, ya no mockeados).
- Asignar como programa activo (todos los usuarios). Al asignar un programa **oficial** se crea una copia personal profunda (RPC `duplicate_program_deep`: programa + días + sesiones + ejercicios) y la asignación apunta a la copia; así el usuario puede editar sus objetivos (peso/reps/series) sin afectar la plantilla compartida. La copia personal anterior se conserva (con su historial); solo se reemplaza la asignación.
- **Límite de plan**: si el usuario ya alcanzó su cupo de programas activos (1 free / 3 premium — ver `docs/DATABASE.md`), la asignación se bloquea antes de llamar a la API y se muestra un `AlertModal` con CTA a `/training/manage-programs` para desactivar otro programa. Reasignar un programa que ya tiene una fila de asignación (por ejemplo, uno desactivado) reactiva esa fila en vez de duplicar de nuevo.

---

## /explore/challenge/[id] — Detalle de reto (reqs. e, f)

- Un reto tiene la estructura de un programa pero simplificada: `duration_days` días consecutivos, cada uno una sesión con (típicamente) un solo ejercicio y un objetivo directo (ej. "Día 3 — Burpees: 1×11"). Se listan en orden con su objetivo.
- **Logro asociado**: cada reto tiene un `achievement_id` fijo. La pantalla muestra una card con el logro que se desbloquea al completar todos los días.
- **"Comenzar reto"**: `assignChallenge` — a diferencia de los programas, el reto NO se duplica (sus objetivos son fijos); `user_programs` apunta directo a la plantilla. Respeta el límite de plan (1 free / 3 premium, contado por separado de los programas normales).
- **Desbloqueo del logro**: los días del reto son sesiones normales, así que se ejecutan con el flujo guiado de siempre (`/training/session/[id]`). Al completar una sesión, la Edge Function `complete-workout` revisa si pertenece a un reto activo del usuario; si ya se completaron sus `duration_days` sesiones (contando días distintos, no repeticiones), desbloquea el `achievement_id` en `user_achievements` y marca `user_programs.completed_at`. El logro queda visible en `/profile/achievements`.

---

## /rankings — Rankings

### Tipos de ranking
| Tipo | Métrica | Unidad |
|---|---|---|
| `training_hours` | Horas entrenadas | h |
| `weight_lifted` | Peso levantado total | kg |
| `distance` | Distancia recorrida | km (solo integración health) |

### Scopes (alcance geográfico)
| Scope | Descripción | Acceso |
|---|---|---|
| Amigos | Entre usuarios con amistad aceptada | Todos |
| Ciudad | Usuarios de la misma ciudad | Solo premium |
| Provincia | Usuarios de la misma provincia | Solo premium |
| País | Usuarios del mismo país | Solo premium |
| Mundial | Todos los usuarios premium | Solo premium |

### Reglas
- Solo usuarios `premium_user` o superior aparecen en rankings globales/regionales.
- Los free users pueden VER los rankings pero no aparecen en ellos.
- Los free users SÍ participan en rankings de amigos.
- Rankings se actualizan diariamente via `generate-rankings` Edge Function.
- La distancia solo cuenta si proviene de integraciones autorizadas (Health Connect, Apple Health, etc.).

---

## /profile — Perfil de usuario

### Información mostrada
- Avatar (inicial del nombre como fallback)
- Nombre visible
- Tag único (@usuario)
- Badge de suscripción (Free / Premium)
- Estadísticas: horas totales, sesiones, peso levantado, racha

### Menú de opciones
| Opción | Ruta |
|---|---|
| Editar perfil | `/profile/edit` |
| Amigos | `/profile/friends` |
| Logros | `/profile/achievements` |
| Suscripción Premium | `/profile/subscription` |
| Configuración | `/profile/settings` |
| Personalización | `/profile/personalization` |
| Cerrar sesión | Acción directa |

---

## /profile/edit — Editar perfil

### Campos editables
| Campo | Notas |
|---|---|
| Nombre visible | 2–50 caracteres |
| Tag único | 3–30 caracteres, alfanumérico + guión bajo; 1 cambio por semana |
| Descripción | Bio corta, opcional, máximo 200 caracteres |
| Ciudad | Texto libre, opcional |
| Provincia | Texto libre, opcional |
| País | Texto libre, opcional |

### Reglas del tag
- Formato: `/^[a-zA-Z0-9_]{3,30}$/`
- Único en la plataforma (verificación en tiempo real con debounce)
- Modificable máximo 1 vez por semana
- Si el usuario intenta cambiar el tag antes de 7 días: mostrar "Podés cambiar tu tag nuevamente el [fecha]"

---

## /profile/friends — Amigos

### Sub-secciones
1. **Búsqueda de usuarios**: input con debounce 300ms
2. **Solicitudes pendientes**: solicitudes recibidas aún sin respuesta
3. **Lista de amigos**: usuarios con amistad aceptada

### Búsqueda
- Busca por: email (match exacto) o tag (match parcial)
- Activada cuando el query tiene ≥ 2 caracteres
- Muestra: avatar, nombre, tag
- Acciones por resultado:
  - Ver perfil público → `/user/[id]`
  - Enviar solicitud de amistad (si no son amigos aún)

### Estados de solicitud
| Estado | Descripción |
|---|---|
| `pending` | Enviada, esperando respuesta |
| `accepted` | Amistad activa |
| `rejected` | Rechazada por el receptor |

### Acciones en solicitudes recibidas
- Aceptar → llama a `accept-friend-request` Edge Function
- Rechazar → actualiza `friend_requests.status = 'rejected'`

---

## /profile/achievements — Logros

### Logros disponibles
| Código | Nombre | Condición |
|---|---|---|
| `FIRST_WORKOUT` | Primer Entrenamiento | 1 workout completado |
| `TEN_WORKOUTS` | 10 Entrenamientos | 10 workouts completados |
| `FIFTY_WORKOUTS` | 50 Entrenamientos | 50 workouts completados |
| `HUNDRED_WORKOUTS` | 100 Entrenamientos | 100 workouts completados |
| `WEEK_STREAK` | Racha de 7 días | 7 días consecutivos |
| `MONTH_STREAK` | Racha de 30 días | 30 días consecutivos |
| `HUNDRED_HOURS` | 100 Horas de entrenamiento | 100 horas totales |
| `TEN_THOUSAND_KG` | 10,000 kg levantados | 10,000 kg acumulados |
| `HUNDRED_THOUSAND_KG` | 100,000 kg levantados | 100,000 kg acumulados |
| `MARATHON` | Maratonista | 42+ km recorridos |
| `CHALLENGE_BURPEES_7_DAYS` | Reto: 7 días de burpees | Completar los 7 días del reto (ver `/explore/challenge/[id]`) |

Los logros de tipo `FIRST_WORKOUT`…`MARATHON` son evaluados por stats (`process-achievements`, condición genérica sobre `user_stats`). Los logros de retos (uno por cada `workout_programs.type='challenge'`, vía `achievement_id`) los desbloquea directamente la Edge Function `complete-workout` al detectar que se completaron todos los días del reto — ver `docs/FEATURES.md#explorechallengeid--detalle-de-reto-reqs-e-f`.

### Vista
- Grid de logros (desbloqueados en color, bloqueados en gris)
- Fecha de desbloqueo en los obtenidos
- Descripción al presionar cualquier logro

---

## /profile/subscription — Suscripción

### Estado actual
- Si tiene suscripción activa: mostrar plan, fecha de vencimiento, estado
- Si no tiene: mostrar beneficios premium y planes disponibles

### Planes
| Plan | Precio | Duración |
|---|---|---|
| Premium Mensual | $9.99 | 1 mes |
| Premium Anual | $79.99 | 12 meses |

### Beneficio único MVP
Participar en rankings globales (ciudad, provincia, país, mundial).

---

## /profile/settings — Configuración

### Opciones
- **Cambiar email**: solicita email nuevo + contraseña actual para confirmar
- **Cambiar contraseña**: solicita contraseña actual + nueva contraseña + confirmación

### Seguridad
- Cambio de email requiere confirmación via link enviado al email nuevo
- Cambio de contraseña usa `supabase.auth.updateUser()`

---

## /profile/personalization — Personalización

### MVP
- Selector visual de tema (Wolf activo, Fox y Crimson Night como "próximamente")
- El tema seleccionado se persiste en `theme-store` (Zustand)

### Post-MVP
- Preferencias de notificaciones
- Preferencias de unidades (kg/lb, km/mi)

---

## /user/[id] — Perfil público

### Información visible
- Avatar, nombre, tag
- Estadísticas públicas (horas, sesiones, peso, racha)
- Logros desbloqueados

### Acciones
- Enviar solicitud de amistad (si no son amigos)
- Ver solicitud pendiente (si ya fue enviada)
