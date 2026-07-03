# Reglas de Negocio

## Objetivo

Este documento define las reglas funcionales que gobiernan el comportamiento de la plataforma.

Las reglas aquí descritas deben ser respetadas por todos los consumidores del sistema:

* Aplicación móvil.
* Aplicación web futura.
* Portal de coaches futuro.
* Portal administrativo futuro.
* APIs y Edge Functions.

---

# Usuarios

## Registro

Todo usuario debe estar registrado para utilizar la plataforma.

Un usuario puede autenticarse mediante:

* Email y contraseña.
* Google Sign-In.

Métodos adicionales podrán incorporarse en el futuro.

---

## Perfil

Todo usuario posee un perfil único.

El perfil debe contener:

* Nombre visible.
* Avatar.
* Ciudad.
* Provincia.
* País.

La ubicación será utilizada para segmentar rankings.

---

# Programas de Entrenamiento

## Programa Activo

Un usuario solamente puede tener un programa activo a la vez.

El programa activo define las sesiones programadas para el usuario.

---

## Programas Oficiales

Los programas oficiales son creados exclusivamente por la plataforma.

Los usuarios no pueden modificar un programa oficial.

---

## Programas Personalizados

Los programas personalizados son creados por usuarios premium.

Un programa personalizado pertenece únicamente a su creador.

---

## Cambio de Programa

Un usuario puede cambiar de programa en cualquier momento.

El cambio de programa no elimina el historial de entrenamientos realizados.

---

# Usuarios Gratuitos

## Capacidades

Los usuarios gratuitos pueden:

* Seleccionar programas oficiales.
* Ejecutar sesiones.
* Registrar resultados.
* Consultar estadísticas personales.
* Participar en rankings de amigos.
* Visualizar rankings globales.

---

## Restricciones

Los usuarios gratuitos no pueden:

* Crear programas personalizados.
* Modificar programas oficiales.
* Participar en rankings globales.
* Acceder a funcionalidades premium.

---

# Usuarios Premium

## Capacidades

Los usuarios premium pueden:

* Crear programas personalizados.
* Editar programas personalizados.
* Duplicar programas oficiales.
* Modificar programas duplicados.
* Participar en rankings globales.
* Acceder a funcionalidades premium futuras.

---

# Sesiones

## Ejecución

Una sesión puede encontrarse en los siguientes estados:

* Programada.
* En progreso.
* Completada.
* Omitida.

---

## Registro

Toda sesión completada debe generar historial permanente.

El historial nunca debe eliminarse automáticamente.

---

## Modificación

La modificación de una sesión futura no debe alterar sesiones históricas ya ejecutadas.

---

# Ejercicios

## Catálogo

Los ejercicios pertenecen al catálogo oficial de la plataforma.

Los usuarios no pueden crear ejercicios.

---

## Configuración

Un ejercicio dentro de una sesión puede definir:

* Series.
* Repeticiones.
* Peso objetivo.
* Tiempo objetivo.
* Distancia objetivo.
* Descanso.

---

# Registro de Resultados

## Series

Cada serie ejecutada puede registrar:

* Peso utilizado.
* Repeticiones realizadas.
* Tiempo realizado.
* Distancia realizada.

---

## Persistencia

Toda información registrada durante una sesión debe conservarse para estadísticas futuras.

---

# Calendario

## Generación

El calendario se genera a partir del programa activo del usuario.

---

## Estados

Cada sesión mostrada en el calendario debe encontrarse en uno de los siguientes estados:

* Programada.
* Completada.
* Omitida.

---

## Historial

El usuario debe poder consultar fechas pasadas y futuras.

---

# Estadísticas

## Actualización

Las estadísticas personales deben actualizarse automáticamente al finalizar una sesión.

---

## Horas Entrenadas

Las horas entrenadas se calculan utilizando la duración real de las sesiones completadas.

---

## Peso Levantado

El peso levantado se calcula utilizando los registros reales de las series ejecutadas.

---

## Kilómetros Recorridos

Los kilómetros utilizados para estadísticas y rankings deben provenir exclusivamente de fuentes autorizadas.

---

## Fuentes Autorizadas

Inicialmente:

* Health Connect.
* Apple Health.
* Garmin.
* Fitbit.
* Samsung Health.

No se permitirá la carga manual de kilómetros para rankings.

---

# Rankings

## Tipos

La plataforma soporta:

* Ranking por horas entrenadas.
* Ranking por peso levantado.
* Ranking por kilómetros recorridos.

---

## Alcances

Los rankings podrán visualizarse por:

* Ciudad.
* Provincia.
* País.
* Mundial.

---

## Participación Global

Solo los usuarios con suscripción premium activa participan en rankings globales.

---

## Visualización Global

Todos los usuarios pueden visualizar rankings globales.

---

## Ranking de Amigos

Todos los usuarios participan en rankings de amigos.

La suscripción premium no es requerida.

---

## Actualización

Los rankings deben actualizarse automáticamente cuando cambien las estadísticas de un usuario.

---

# Amistades

## Solicitudes

Las amistades deben iniciarse mediante una solicitud.

---

## Estados

Una solicitud puede encontrarse en:

* Pendiente.
* Aceptada.
* Rechazada.

---

## Ranking de Amigos

Solo las amistades aceptadas participan en rankings de amigos.

---

# Suscripciones

## Planes Disponibles

La plataforma ofrecerá:

* Suscripción mensual.
* Suscripción anual.

---

## Estado

Una suscripción puede encontrarse en:

* Activa.
* Vencida.
* Cancelada.
* En período de gracia.

---

## Validación

La validez de una suscripción debe verificarse mediante servicios oficiales de la tienda correspondiente.

No debe confiarse únicamente en información enviada por el cliente.

---

# API First

## Regla General

Toda funcionalidad importante del negocio debe estar disponible mediante APIs.

---

## Consumidores

Las APIs deberán poder ser utilizadas por:

* Aplicación móvil.
* Aplicación web futura.
* Portal de coaches.
* Portal administrativo.

---

## Lógica de Negocio

Las reglas críticas no deben implementarse exclusivamente en la aplicación móvil.

---

## Backend

La lógica compartida debe implementarse mediante:

* PostgreSQL.
* Edge Functions.
* Servicios backend autorizados.

---

# Coaches (Futuro)

## Gestión de Clientes

Los coaches podrán gestionar múltiples clientes.

---

## Asignación

Los coaches podrán asignar programas de entrenamiento a sus clientes.

---

## Comunicación

Los coaches podrán comunicarse mediante chats privados.

---

# Marketplace (Futuro)

## Venta de Programas

Los coaches podrán publicar programas para su comercialización.

---

## Compra

Los usuarios podrán adquirir programas publicados en el marketplace.

---

## Acceso

La compra de un programa otorgará acceso permanente o temporal según la configuración del producto.

---

# Auditoría

## Historial

Toda acción relevante debe ser registrable.

Ejemplos:

* Inicio de sesión.
* Finalización de sesión.
* Cambio de programa.
* Compra de suscripción.
* Compra de programas.

---

# Principios Generales

1. El historial nunca debe perderse.
2. Las estadísticas deben derivarse de datos reales.
3. Los rankings deben ser verificables.
4. La lógica crítica pertenece al backend.
5. La aplicación móvil es un consumidor de APIs.
6. Todo diseño debe contemplar crecimiento futuro sin comprometer el MVP.

# Reglas Adicionales - Sesiones

## Sesiones Oficiales

Las sesiones oficiales son creadas exclusivamente por la plataforma.

Ejemplos:

* Push
* Pull
* Legs
* Full Body
* Running Inicial

Las sesiones oficiales no pueden ser modificadas por los usuarios.

---

## Copia de Sesiones

Los usuarios premium pueden crear una copia privada de una sesión oficial.

La copia se convierte en una sesión personalizada propiedad del usuario.

---

## Sesiones Personalizadas

Las sesiones personalizadas pertenecen únicamente a su creador.

El usuario puede:

* Modificar ejercicios.
* Modificar series.
* Modificar repeticiones.
* Modificar pesos objetivo.
* Modificar descansos.
* Eliminar ejercicios.
* Agregar ejercicios.

---

## Independencia

Las modificaciones realizadas sobre una sesión personalizada nunca afectan la sesión oficial original.

Las modificaciones realizadas sobre una sesión oficial por parte de administradores no afectan copias previamente realizadas por usuarios.

---

## Restricciones

Los usuarios gratuitos no pueden crear copias personalizadas de sesiones.

Los usuarios gratuitos solamente pueden utilizar sesiones oficiales.
