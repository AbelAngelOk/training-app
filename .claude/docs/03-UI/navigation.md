# Navegación

## Objetivo

La navegación debe ser simple, intuitiva y optimizada para uso diario.

El usuario debe poder:

- Ver y gestionar sus sesiones programadas.
- Iniciar entrenamientos en pocos toques.
- Explorar programas oficiales.
- Consultar rankings.
- Acceder a su perfil y progreso.

La navegación principal se realiza mediante Bottom Tab Navigation.

---

# Fuente de Verdad

Este documento es la definición oficial de la estructura de navegación.

Ante cualquier conflicto con otros documentos (frontend.md, screens.md), prevalece este documento.

---

# Estructura General

```
App
│
├── Auth Stack
│   ├── Welcome              /
│   ├── Login                /login
│   ├── Register             /register
│   └── Forgot Password      /forgot-password
│
├── Main Tabs
│   ├── Entrenamiento        /training
│   ├── Explorar             /explore
│   ├── Rankings             /rankings
│   └── Perfil               /profile
│
├── Modales Globales
│   ├── Configuración        /settings
│   └── Paywall              /premium
│
└── Pantallas Globales
    └── Perfil Público       /user/:id
```

---

# Flujo de Inicio

```
Splash
↓
Welcome
↓
Login / Registro
↓
Entrenamiento (tab inicial)
```

---

# Auth Stack

## Welcome

Ruta: `/`

Punto de entrada para usuarios no autenticados.

Contenido:
- Logo y nombre de la aplicación
- Mensaje de bienvenida
- Botón de login
- Botón de registro

---

## Login

Ruta: `/login`

Opciones de autenticación:
- Email y contraseña
- Google
- Apple (iOS)

Al autenticar correctamente: → Entrenamiento

---

## Register

Ruta: `/register`

Campos:
- Nombre visible
- Email
- Contraseña
- Confirmar contraseña

Al registrarse correctamente: → Entrenamiento

---

## Forgot Password

Ruta: `/forgot-password`

Accesible desde: Login Screen

Campo:
- Email

Acción: enviar link de recuperación por email

---

# Bottom Navigation

Cuatro tabs en el siguiente orden:

| Posición | Nombre | Icono | Ruta base |
|---|---|---|---|
| 1 | Entrenamiento | Dumbbell | /training |
| 2 | Explorar | Compass | /explore |
| 3 | Rankings | Trophy | /rankings |
| 4 | Perfil | User | /profile |

El tab inicial al autenticar es siempre Entrenamiento.

---

# Tab 1 — Entrenamiento

Ruta base: `/training`

Pantalla principal de la aplicación.

Contiene el dashboard de entrenamientos y acceso a la ejecución de sesiones.

---

## Stack Entrenamiento

```
/training                         Training Screen (index)
/training/program/:id             Program Detail Screen
/training/session/:id             Session Screen
/training/activity/:id            Activity Screen
/training/summary/:executionId    Post-Workout Summary Screen
/training/program/create          Create Program Screen [Premium]
/training/program/:id/edit        Edit Program Screen [Premium]
/training/session/create          Create Session Screen [Premium]
```

---

## Training Screen (index)

Ruta: `/training`

Contenido superior (dashboard):
- Próxima sesión programada
- Racha actual

Contenido principal:
- Lista de sesiones de la semana actual
- Cada sesión mostrada como tarjeta con imagen, nombre y estado

Estados de sesión en la lista:
- Pendiente
- Completada
- Atrasada

Botón flotante (+):

Opciones disponibles:
- Crear Programa [Premium]
- Crear Sesión [Premium]

Si el usuario es Free y toca cualquiera de esas opciones: abrir Paywall Modal.

Acciones adicionales:
- Buscar programas → navega a Explorar
- Ver programa activo → navega a Program Detail Screen

---

## Program Detail Screen

Ruta: `/training/program/:id`

Contenido:
- Nombre del programa
- Descripción
- Calendario semanal
- Lista de sesiones por día

Acciones disponibles según tipo de programa:

Programa oficial:
- Solo visualización
- Duplicar [Premium]

Programa personal:
- Editar [Premium]
- Eliminar

Acciones generales:
- Iniciar sesión del día
- Activar como programa actual

---

## Session Screen

Ruta: `/training/session/:id`

Contenido:
- Nombre de la sesión
- Duración estimada
- Lista de actividades

Cada actividad muestra:
- Nombre del ejercicio
- Estado
- Series y repeticiones objetivo

Acciones:
- Iniciar sesión completa
- Ejecutar actividad individual
- Continuar sesión en progreso

---

## Activity Screen

Ruta: `/training/activity/:id`

Pantalla de ejecución de una actividad específica.

Full screen. Sin bottom navigation visible durante la ejecución.

Inspiración visual: TikTok / Reels.

Contenido:
- Video del ejercicio (área principal)
- Nombre del ejercicio
- Serie actual
- Indicador de repeticiones o temporizador según tipo
- Temporizador de descanso entre series
- Progreso general de la sesión

Comportamiento por tipo de actividad:

Actividades por repeticiones:
- Usuario confirma manualmente la finalización de cada serie
- Al confirmar: inicia descanso automático
- Al terminar descanso: siguiente serie automática
- Al terminar última serie: siguiente actividad automática

Actividades por tiempo:
- Temporizador inicia automáticamente
- Al terminar: inicia descanso automático
- Al terminar descanso: siguiente serie automática
- Al terminar última serie: siguiente actividad automática

Al completar la última actividad de la sesión: → Post-Workout Summary Screen

---

## Post-Workout Summary Screen

Ruta: `/training/summary/:executionId`

Se muestra automáticamente al completar la última actividad de una sesión.

Full screen. Sin bottom navigation visible.

Contenido:
- Nombre de la sesión completada
- Duración total
- Total de series completadas
- Total de peso levantado en la sesión
- Racha actualizada
- Mensaje de felicitación

Acciones:
- Volver a Entrenamiento (tab principal)

---

## Create Program Screen [Premium]

Ruta: `/training/program/create`

Accesible desde: FAB (+) en Training Screen.

Si el usuario es Free: abrir Paywall Modal en lugar de esta pantalla.

Campos:
- Nombre del programa
- Descripción
- Asignación de sesiones por día de semana

Acciones:
- Guardar

---

## Edit Program Screen [Premium]

Ruta: `/training/program/:id/edit`

Solo disponible para programas personales del usuario.

Campos editables:
- Nombre
- Descripción
- Sesiones por día de semana

Acciones:
- Guardar cambios

---

## Create Session Screen [Premium]

Ruta: `/training/session/create`

Accesible desde: FAB (+) en Training Screen.

Si el usuario es Free: abrir Paywall Modal en lugar de esta pantalla.

Campos:
- Nombre de la sesión
- Descripción
- Selección de ejercicios del catálogo
- Series, repeticiones, peso objetivo y descanso por ejercicio

Acciones:
- Guardar

---

# Tab 2 — Explorar

Ruta base: `/explore`

Permite descubrir y activar programas y sesiones oficiales de la plataforma.

En el futuro incorporará el marketplace de contenido de coaches.

---

## Stack Explorar

```
/explore                          Explore Screen (index)
/explore/program/:id              Program Details Screen
/explore/session/:id              Session Details Screen
```

---

## Explore Screen (index)

Ruta: `/explore`

Contenido:
- Barra de búsqueda
- Filtros: objetivo, dificultad, duración, categoría
- Sección de programas destacados
- Sección de sesiones destacadas

Búsquedas disponibles sobre:
- Programas
- Sesiones

---

## Program Details Screen (Explorar)

Ruta: `/explore/program/:id`

Contenido:
- Imagen de portada
- Nombre del programa
- Descripción
- Dificultad
- Duración estimada
- Sesiones incluidas

Acciones:
- Añadir a mis programas y activar

---

## Session Details Screen (Explorar)

Ruta: `/explore/session/:id`

Contenido:
- Imagen de portada
- Nombre de la sesión
- Descripción
- Ejercicios incluidos

Acciones:
- Añadir a mis sesiones

---

# Tab 3 — Rankings

Ruta base: `/rankings`

---

## Stack Rankings

```
/rankings                         Rankings Screen (index)
```

Los perfiles de usuario se acceden desde `/user/:id` (pantalla global).

---

## Rankings Screen (index)

Ruta: `/rankings`

Filtros de alcance:
- Amigos
- Ciudad
- Provincia
- País
- Mundial

Categorías disponibles en MVP:
- Horas entrenadas
- Peso levantado

Categorías Post-MVP:
- Kilómetros recorridos

Usuarios Free:
- Pueden visualizar todos los rankings
- No aparecen en rankings globales (ciudad, provincia, país, mundial)
- Sí aparecen en ranking de amigos

Usuarios Premium:
- Aparecen automáticamente en todos los rankings

---

# Tab 4 — Perfil

Ruta base: `/profile`

---

## Stack Perfil

```
/profile                          Profile Screen (index)
/profile/edit                     Edit Profile Screen
/profile/friends                  Friends Screen
/profile/achievements             Achievements Screen
/profile/subscription             Subscription Screen
```

---

## Profile Screen (index)

Ruta: `/profile`

Contenido:
- Avatar
- Nombre visible
- Estado de suscripción (Free / Premium)
- Estadísticas acumuladas de por vida
- Calendario mensual de actividad
- Resumen de logros
- Racha actual y mejor racha

Acciones:
- Editar perfil → /profile/edit
- Ver amigos → /profile/friends
- Ver todos los logros → /profile/achievements
- Gestionar suscripción → /profile/subscription
- Abrir Configuración → /settings (modal)

---

## Edit Profile Screen

Ruta: `/profile/edit`

Campos editables:
- Nombre visible
- Avatar (desde cámara o galería)
- Ciudad
- Provincia
- País

Acciones:
- Guardar cambios

---

## Friends Screen

Ruta: `/profile/friends`

Secciones:
- Lista de amigos actuales
- Solicitudes recibidas pendientes
- Buscar usuario por nombre

Acciones:
- Enviar solicitud de amistad
- Aceptar solicitud
- Rechazar solicitud
- Eliminar amistad
- Ver perfil público → /user/:id

---

## Achievements Screen

Ruta: `/profile/achievements`

Secciones:
- Logros desbloqueados (con fecha de desbloqueo)
- Logros pendientes (con progreso actual)

---

## Subscription Screen

Ruta: `/profile/subscription`

Contenido:
- Estado actual de la suscripción
- Fecha de vencimiento si aplica
- Lista de beneficios premium
- Planes disponibles: Mensual y Anual

Acciones:
- Suscribirse
- Renovar
- Restaurar compra

---

# Modales Globales

## Configuración

Ruta: `/settings`

Accesible desde: Profile Screen → acción Configuración

Contenido:
- Tema visual: Wolf (único en MVP)
- Notificaciones
- Dispositivos conectados (Post-MVP)
- Configuración de cuenta
- Cerrar sesión

---

## Paywall

Ruta: `/premium`

Se muestra cuando un usuario Free intenta acceder a una funcionalidad Premium.

Puede abrirse desde cualquier tab o pantalla.

Contenido:
- Nombre de la funcionalidad que requiere Premium (contextual)
- Lista de beneficios premium
- Planes disponibles: Mensual y Anual
- Precios

Acciones:
- Suscribirse (Mensual)
- Suscribirse (Anual)
- Cerrar (volver a la pantalla anterior)

Regla: nunca ocultar completamente una funcionalidad. Siempre informar qué se desbloquea con Premium.

---

# Pantallas Globales

## Perfil Público

Ruta: `/user/:id`

Accesible desde: Rankings Screen, Friends Screen.

Contenido:
- Avatar
- Nombre
- Indicador de estado premium
- Estadísticas públicas
- Logros destacados
- Posición en rankings

---

# Reglas de Navegación

1. El tab inicial tras autenticar es siempre Entrenamiento.
2. El FAB (+) solo aparece en el tab Entrenamiento.
3. Activity Screen y Post-Workout Summary Screen ocultan el bottom navigation (full screen).
4. El Paywall Modal puede abrirse desde cualquier tab o pantalla.
5. La navegación hacia atrás debe estar siempre disponible en stacks anidados.
6. Las funcionalidades Premium siempre muestran el Paywall, nunca un error genérico.
7. Toda funcionalidad nueva debe integrarse en un tab existente o justificar explícitamente la creación de un nuevo tab.

---

# Roadmap Futuro

## Coaches (Post-MVP)

Nuevo módulo. Tab adicional o stack dentro de Perfil.

Funciones:
- Lista de clientes
- Chat
- Seguimiento de progreso
- Asignación de programas

---

## Marketplace (Post-MVP)

Integrado dentro del tab Explorar o como tab separado.

Funciones:
- Venta de programas y sesiones
- Comunidades de contenido
- Sistema de valoraciones

---

## Publicar Contenido (Post-MVP)

Disponible desde el detalle del programa o sesión propia.

Flujo:
- Título, descripción, imagen de portada
- Visibilidad: Privado / Público Gratuito / Público Pago
- Si es pago: precio y configuración de comunidad
