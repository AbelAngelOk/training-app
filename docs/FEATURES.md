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

## /training — Dashboard de entrenamiento

### Secciones
- **Header**: saludo personalizado con nombre del usuario
- **Card de programa activo**: muestra racha y próxima sesión
- **Lista semanal**: sesiones de la semana actual según el programa activo
- **Estado vacío**: "Sin programa activo" con CTA "Ver programas" → `/explore`

### FAB (Floating Action Button)
- Posición: inferior derecha, más abajo que el estándar actual
- Al presionar: expande menú con dos opciones:
  - **"Crear programa"** → navega a `/training/program/create` (solo premium; mostrar paywall para free)
  - **"Programas preestablecidos"** → navega a `/explore`

### Navegación desde esta pantalla
| Acción | Destino |
|---|---|
| "Ver programas" (estado vacío) | `/(tabs)/explore` |
| FAB → "Programas preestablecidos" | `/(tabs)/explore` |
| FAB → "Crear programa" (premium) | `/(tabs)/training/program/create` |
| FAB → "Crear programa" (free) | Paywall modal |
| Tap en sesión de la semana | `/(tabs)/training/session/[id]` (futuro) |

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

## /explore — Catálogo de programas

### Secciones
- **Búsqueda**: filtro por nombre
- **Programas oficiales**: cards con nombre, duración, días, nivel de dificultad
- **Estado vacío**: mientras carga o sin resultados

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
- Ver detalle: sesiones y ejercicios
- Asignar como programa activo (todos los usuarios)
- Duplicar y personalizar (solo premium — futuro en v1.1)

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
