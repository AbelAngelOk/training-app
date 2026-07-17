# Flujos de usuario

---

## Registro

```
[Welcome Screen]
      │
      ▼ "Crear cuenta"
[Register Screen]
  ├── Completa: nombre, email, contraseña
  ├── Indicador de fortaleza se actualiza en tiempo real
  ├── Al submit: POST /auth/v1/signup
  │     ├── Error → mostrar mensaje descriptivo en pantalla
  │     └── HTTP 200 → mostrar "¡Cuenta creada! Revisá tu email"
  │           │
  │           ▼ (usuario confirma email)
  │     [Trigger BD: crea users + user_stats]
  │           │
  │           ▼
  │     [Login Screen]  ← usuario inicia sesión tras confirmar
  └──
```

**Condiciones límite:**
- Email ya registrado → Supabase retorna error; mostrar "El email ya está en uso"
- Sin conexión → mostrar "Error de conexión"
- Contraseña muy débil → la validación Zod bloquea el submit (mínimo 8 caracteres)

---

## Inicio de sesión

```
[Welcome Screen]
      │
      ▼ "Iniciar sesión"
[Login Screen]
  ├── Completa: email, contraseña
  ├── Al submit: supabase.auth.signInWithPassword()
  │     ├── Error auth → "Email o contraseña incorrectos"
  │     ├── Error red → "Error de conexión"
  │     └── Éxito → redirige a /
  │                       │
  │                       ▼ (index.tsx verifica auth)
  │                 [/(tabs)/training]
  └──
```

**Condiciones límite:**
- Usuario no confirmó email → Supabase retorna error específico; mostrar "Confirmá tu email antes de iniciar sesión"
- Cuenta suspendida → mostrar "Tu cuenta ha sido suspendida"

---

## Asignación de programa activo

```
[/training — Sin programa activo]
      │
      ▼ "Ver programas" o FAB → "Programas preestablecidos"
[/explore]
      │
      ▼ Selecciona un programa
[Detalle del programa]
      │
      ▼ "Usar este programa"
[Confirmación]
      │
      ▼ assignProgram(userId, programId)
      │   ├── Upsert en user_programs
      │   └── Invalida USER_PROGRAM query
[/training — Con programa activo]
      │   └── Muestra sesiones de la semana
```

---

## Creación de programa (Premium)

```
[/training]
      │
      ▼ FAB → "Crear programa"
      ├── Free user → [Paywall modal]
      └── Premium user →
[/training/program/create]
  ├── Completa: nombre, descripción
  ├── Al submit: createProgram(payload)
  │     ├── Error → mostrar mensaje
  │     └── Éxito → redirige al detalle del programa creado
  │
[Detalle del programa]
  └── (futuro: agregar sesiones y ejercicios)
```

---

## Wizard inicial de objetivos y ajuste entre semanas (reqs. a, b, c)

```
[/training/session/[id]] — Pre-sesión
      │
      ▼ useSessionHistory(id) resuelve si hay ejecuciones completed (propias
        o de copias hermanas por source_session_id)
      │
      ├── Sin targets_configured_at Y sin historial completed (primera vez)
      │     ▼ router.replace a .../setup (OBLIGATORIO)
      │   [/training/session/[id]/setup]
      │     ├── Paso 0: descanso entre series (único, aplica a todos los ejercicios)
      │     ├── Pasos 1..N: un paso por ejercicio (series/reps/peso) — estos
      │     │   valores pasan a ser los objetivos iniciales
      │     ▼ "Guardar y comenzar"
      │   [Promise.all] updateSessionExercise() por ejercicio + rest_seconds
      │     + markSessionTargetsConfigured(sessionId)
      │     └── router.replace de vuelta a la pre-sesión (ya no es "primera vez")
      │
      └── Con historial completed (ya se usó antes) → BumpTargetsModal automático
            ├── "¿Modificar objetivos?" → No, mantener → cierra, sigue solo lectura
            └── → Sí, modificar → "¿Cómo?"
                  ├── Con formulario → checkboxes Peso(+5kg)/Series(+1)/Reps(+2)
                  │     ▼ "Aplicar a todos los ejercicios"
                  │   Promise.all updateSessionExercise() con los deltas elegidos
                  │     sobre TODOS los ejercicios de la sesión
                  └── Manualmente → cierra el modal y activa el mismo modo edición
                        que el ícono de lápiz (edición ejercicio por ejercicio)
```

---

## Ejecución de entrenamiento

```
[/training — Con programa activo]
      │
      ▼ Toca sesión del día
[/training/session/[id]] — Pre-sesión ("Planificación de la sesión")
  ├── Solo lectura por defecto; ícono de lápiz activa edición manual
  │     └── updateSessionExercise() al salir de cada input
  │         (solo sesiones personales; las oficiales son de solo lectura)
  ├── Si hay workout_execution in_progress de ESTA sesión → botón "Continuar sesión"
  │     └── Rehidrata el store desde getActiveWorkout() y va a execute
  │
  ▼ "Iniciar sesión"
[startWorkout(sessionId)]
  ├── Crea workout_execution (status: in_progress)
  ├── Crea workout_exercise_executions (una por ejercicio, upfront)
  └── Hidrata active-workout-store (executionId, startedAt, mapa de executions)
      │
[/training/session/[id]/execute] — Ejecución guiada
  ├── Un ejercicio por pantalla: video arriba (ExerciseVideoDisplay),
  │   series abajo (SeriesCard); swipe horizontal para saltar ejercicios
  ├── Al marcar una serie: logSet(payload) → fila en workout_sets
  │     ├── Editar una serie ya registrada → updateSet() (debounced)
  │     └── Arranca descanso (RestCountdown con deadline)
  ├── Al completar la última serie: descanso → auto-avance al próximo
  │   ejercicio incompleto
  ├── Cronómetro derivado de started_at (sobrevive a cierres de app)
  └── Botón atrás → ConfirmExitModal:
        ├── "Guardar y salir" → queda in_progress (reanudable desde banner
        │   "Entrenamiento en curso" en /training)
        └── "Cancelar entrenamiento" → cancelWorkout() (status: cancelled)
      │
      ▼ "Finalizar sesión"
completeWorkoutWithStats(executionId)
  └── Edge Function: complete-workout
        ├── Actualiza workout_execution (status: completed)
        ├── Actualiza user_stats
        ├── Actualiza calendar_event
        └── Dispara process-achievements
              │
              ▼
[/training/session/[id]/summary] — Resumen
  └── Muestra: duración, series, volumen total y comparación
      objetivo vs. realizado serie por serie (cumplido / superado / debajo)
```

---

## Búsqueda y solicitud de amistad

```
[/profile]
      │
      ▼ "Amigos"
[/profile/friends]
  ├── Sección: Solicitudes pendientes
  │     ├── Aceptar → acceptFriendRequest(requestId) [Edge Function]
  │     └── Rechazar → updateFriendRequestStatus(requestId, 'rejected')
  │
  └── Búsqueda:
        ├── Escribe email o tag (debounce 300ms)
        ├── searchUsers(query) [≥ 2 caracteres]
        └── Selecciona resultado:
              ├── Ver perfil → /user/[id]
              └── Enviar solicitud → sendFriendRequest(userId)
                    ├── Error: ya son amigos → mostrar estado actual
                    └── Éxito → botón cambia a "Solicitud enviada"
```

---

## Edición de perfil y tag

```
[/profile]
      │
      ▼ "Editar perfil"
[/profile/edit]
  ├── Campos: nombre, tag, bio, ciudad, provincia, país
  ├── Campo tag:
  │     ├── Verifica disponibilidad en tiempo real (debounce 500ms)
  │     ├── Si tag_updated_at < 7 días → mostrar "Podés cambiarlo el [fecha]" y deshabilitar campo
  │     └── Indica: disponible ✓ / no disponible ✗ / no cambiable por 7 días
  └── Al guardar:
        ├── updateUserProfile(userId, payload)
        │     ├── Error: tag en uso → "Ese tag ya está en uso"
        │     └── Éxito → invalidar USER_PROFILE query
        └── redirige a /profile
```

---

## Cambio de contraseña

```
[/profile/settings]
      │
      ▼ "Cambiar contraseña"
[Modal o sección expandida]
  ├── Campos: contraseña actual, nueva contraseña, confirmación
  ├── Validación: nueva ≥ 8 caracteres, coincide con confirmación
  └── Al guardar:
        ├── supabase.auth.updateUser({ password: newPassword })
        │     ├── Error auth → "Contraseña actual incorrecta"
        │     └── Éxito → "Contraseña actualizada correctamente"
        └── Cerrar modal / limpiar campos
```

---

## Desbloqueo de logros

```
[Usuario completa entrenamiento]
      │
      ▼ completeWorkoutWithStats() → Edge Function complete-workout
      │
      ▼ Llama a process-achievements({ user_id })
      │
      ▼ process-achievements evalúa condiciones:
        ├── FIRST_WORKOUT: total_workouts >= 1
        ├── TEN_WORKOUTS: total_workouts >= 10
        ├── WEEK_STREAK: best_streak >= 7
        └── ... (resto de condiciones)
              │
              ▼ Para cada logro nuevo:
        INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
              │
              ▼ (futuro: push notification "¡Nuevo logro desbloqueado!")
```

---

## Reto: asignación y desbloqueo del logro asociado

```
[/explore — carrusel "Retos" o /explore/challenges]
      │
      ▼ Tap en un reto
[/explore/challenge/[id]]
  ├── Muestra días 1..duration_days con su objetivo y el logro asociado
  │
  ▼ "Comenzar reto"
[assignChallenge(userId, challengeId)]
  ├── Chequea límite de plan (1 free / 3 premium, retos aparte de programas)
  ├── NO duplica (targets fijos) → user_programs apunta directo a la plantilla
  └── Reactiva la fila existente si el usuario ya lo había asignado antes
      │
[/training — el reto es una sesión más; se ejecuta con el flujo normal]
      │
      ▼ Día N: /training/session/[id] → iniciar → execute → finalizar
[completeWorkoutWithStats(executionId)] → Edge Function complete-workout
  ├── (flujo de stats/achievements normal, sin cambios)
  └── maybeCompleteChallenge(userId, training_session_id):
        ├── ¿La sesión pertenece a un program_days de un reto activo del usuario?
        ├── Cuenta sesiones distintas del reto con ejecución completed
        └── Si count == duration_days:
              ├── INSERT user_achievements (achievement_id del reto) ON CONFLICT DO NOTHING
              └── UPDATE user_programs SET completed_at
                    │
                    ▼
        [Logro visible en /profile/achievements]
```

---

## Progreso histórico y calendario combinado

```
[/training/session/[id] — Pre-sesión]
      │
      ▼ Ícono "stats-chart-outline" del header
[/training/session/[id]/history]
  ├── getSessionExecutionHistory(userId, sessionId)
  │     ├── Resuelve la plantilla raíz (source_session_id ?? id)
  │     ├── Busca sesiones hermanas (copias sucesivas de la misma raíz)
  │     └── Trae hasta 30 workout_executions (todos los status) + sets anidados
  ├── buildSessionHistory(): agrega volumen/duración/reps/series y deriva estado
  │     (completed / completed_off_schedule / cancelled / in_progress)
  └── Chips de métrica + MiniBarChart + lista cronológica con badge de estado

[/training — calendario combinado]
  ├── useTrainingCommitments(month):
  │     ├── Proyecta días de programas activos desde program_days.weekday
  │     │   (solo a partir de assigned_at)
  │     ├── Proyecta días de retos activos: assigned_at + (day_number - 1)
  │     └── Overlay de getCompletedExecutionDates(): marca cada punto como
  │           relleno (completado) u hueco (pendiente)
  └── MonthCalendar: grilla mensual con puntos violeta (programas) y ámbar (retos)
```
