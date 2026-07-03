# MVP — Scope Definition

## Versión

MVP v1.0

---

## Objetivo

Este documento define el alcance exacto de la primera versión publicable de la aplicación.

Todo lo que no aparece en la sección "IN" de este documento es Post-MVP.

Ante cualquier duda sobre si una feature pertenece al MVP, consultar este documento antes de implementar.

---

# Funcionalidades IN — MVP

## Autenticación

* Registro con email y contraseña
* Login con email y contraseña
* Google Sign-In (Android e iOS)
* Apple Sign-In (iOS) — requerido por App Store para apps con login social
* Recuperación de contraseña por email
* Cierre de sesión

---

## Perfil de Usuario

* Nombre visible
* Avatar (subir desde galería o cámara)
* Ciudad, Provincia, País (requerido para segmentación de rankings)
* Edición del perfil propio

---

## Catálogo de Ejercicios

* Catálogo oficial administrado por la plataforma (solo lectura)
* Cada ejercicio incluye: nombre, descripción, instrucciones, imagen, video, grupo muscular, equipamiento y dificultad
* Los usuarios no pueden crear ejercicios

---

## Programas Oficiales

* Catálogo de programas oficiales creados por la plataforma
* Seleccionar y activar un programa oficial
* Un usuario puede tener únicamente un programa activo
* El usuario puede cambiar de programa en cualquier momento sin perder el historial

---

## Ejecución de Entrenamientos

* Iniciar una sesión del programa activo
* Pantalla de actividad full-screen estilo reel
* Video del ejercicio como elemento visual principal
* Registro por serie: peso, repeticiones, tiempo y distancia según tipo
* Avance automático entre series y actividades
* Temporizador de descanso entre series
* Pantalla de resumen post-entrenamiento al completar la sesión

---

## Historial

* Historial permanente de entrenamientos completados
* El historial nunca se elimina automáticamente

---

## Estadísticas Personales

* Total de horas entrenadas
* Total de peso levantado
* Total de sesiones completadas
* Racha actual
* Mejor racha histórica

---

## Calendario del Perfil

* Vista mensual de actividad
* Estados visuales diferenciados: Programada, Completada, Omitida

---

## Explorar

* Navegación por programas oficiales
* Navegación por sesiones oficiales
* Filtros por dificultad, objetivo y categoría
* Vista de detalle de programa
* Vista de detalle de sesión
* Activar un programa directamente desde Explorar

---

## Rankings

* Ranking por horas entrenadas
* Ranking por peso levantado
* Alcances disponibles: Amigos, Ciudad, Provincia, País, Mundial
* Usuarios Free: visualizan todos los rankings, no aparecen en rankings globales
* Usuarios Premium: participan automáticamente en todos los rankings

---

## Sistema de Amistades

* Buscar usuario por nombre
* Enviar solicitud de amistad
* Aceptar o rechazar solicitudes
* Eliminar amistad
* Ranking entre amigos disponible para todos los usuarios sin requisito premium

---

## Suscripción Premium

* Plan mensual
* Plan anual
* Compra vía Google Play Billing (Android)
* Compra vía Apple In-App Purchases (iOS)
* Validación server-side mediante Edge Function
* Pantalla de gestión de suscripción
* Restaurar compra
* Paywall contextual: se muestra cuando usuario Free intenta una feature Premium

---

## Beneficio Premium en MVP

El único beneficio funcional de Premium en v1.0 es la participación en rankings globales.

El Paywall debe comunicar también los beneficios futuros (crear programas, etc.) para maximizar conversión.

---

## Interfaz

* Tema Wolf (único tema activo en MVP)
* Modo oscuro exclusivo en MVP
* Idioma: Español

---

## Configuración

* Cerrar sesión
* Notificaciones (activar/desactivar)
* Información de cuenta

---

# Funcionalidades OUT — Post-MVP

## v1.1 — Primera actualización

* Crear programas personalizados [Premium]
* Crear sesiones personalizadas [Premium]
* Editar y duplicar programas existentes [Premium]
* Logros (Achievements) — sistema completo y UI
* Temas adicionales: Fox, Crimson Night
* Selector de modo claro / oscuro según preferencia del sistema

---

## v1.2

* Soporte offline para ejecución de entrenamientos con sincronización posterior
* Integración Health Connect (Android)
* Integración Apple Health (iOS)
* Ranking por kilómetros recorridos (depende de integraciones de salud)

---

## v1.3+

* Integración Garmin
* Integración Fitbit
* Integración Samsung Health
* Notificaciones push
* Perfil público enriquecido con feed de actividad reciente

---

## v2.0 — Nuevos productos

* Marketplace de programas y sesiones
* Publicar contenido con precio
* Compra de programas de coaches
* Sistema de valoraciones y reseñas
* Portal de Coaches
* Gestión de clientes por parte del coach
* Asignación de programas coach → cliente
* Chat entrenador-cliente en tiempo real
* Comunidades asociadas a contenido pagado

---

# Criterios de Lanzamiento

La aplicación está lista para publicar cuando:

1. El flujo de autenticación completo funciona correctamente en Android e iOS.
2. El catálogo contiene al menos 50 ejercicios con imagen y video.
3. Hay al menos 5 programas oficiales disponibles con sesiones completas.
4. El flujo completo de entrenamiento funciona sin errores: selección de programa → sesión → actividad → resumen.
5. Las estadísticas se actualizan correctamente al finalizar cada entrenamiento.
6. Los rankings de horas y peso muestran datos reales correctos.
7. El flujo de suscripción premium funciona en ambas tiendas y la validación server-side opera correctamente.
8. La aplicación pasa la revisión de App Store y Google Play.
9. No existen crashes críticos en el flujo principal de entrenamiento.
10. Los datos históricos se conservan correctamente ante cambios de programa.
