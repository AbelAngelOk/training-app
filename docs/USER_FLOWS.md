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

## Ejecución de entrenamiento

```
[/training — Con programa activo]
      │
      ▼ Toca sesión del día
[/training/session/[id]]
  └── Lista de ejercicios con targets
      │
      ▼ "Iniciar entrenamiento"
[startWorkout(sessionId)]
  └── Crea workout_execution (status: in_progress)
      │
[/training/activity/[executionId]]
  ├── Para cada ejercicio:
  │     └── Para cada serie: logSet(payload)
  └── Al completar todos los ejercicios o presionar "Finalizar":
        │
        ▼ completeWorkoutWithStats(executionId)
        └── Edge Function: complete-workout
              ├── Actualiza workout_execution (status: completed)
              ├── Actualiza user_stats
              ├── Actualiza calendar_event
              └── Dispara process-achievements
                    │
                    ▼
[Post-workout summary]
  └── Muestra: duración, series, peso, racha
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
