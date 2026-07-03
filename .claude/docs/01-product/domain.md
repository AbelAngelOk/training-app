# Dominio del Negocio

## Introducción

Este documento describe las entidades principales del negocio y las relaciones conceptuales entre ellas.

El objetivo es proporcionar una comprensión común del dominio antes de diseñar la base de datos, APIs y componentes de la aplicación.

---

# Usuario

## User

Representa una persona registrada en la plataforma.

Un usuario puede:

* Crear planes de entrenamiento.
* Utilizar planes propios o de terceros.
* Ejecutar sesiones de entrenamiento.
* Registrar resultados.
* Consultar estadísticas.
* Participar en rankings.
* Mantener historial de actividad.

Cada usuario posee un perfil único.

---

# Perfil

## UserProfile

Contiene información pública y privada del usuario.

Incluye:

* Nombre visible.
* Avatar.
* Ciudad.
* Provincia.
* País.
* Fecha de registro.
* Configuración personal.

La ubicación es utilizada para segmentar rankings.

---

# Planificación

## Program

Representa una planificación completa de entrenamiento.

Un programa contiene:

* Nombre.
* Descripción.
* Objetivo.
* Duración estimada.
* Días programados.
* Sesiones asociadas.

Los usuarios pueden:

* Crear un plan.
* Modificar plan.
* Reorganizar sesiones del plan.
* Eliminar sesiones.

---

## TrainingDay

Representa un día programado dentro de una sesion.

Ejemplos:

* Lunes
* Martes
* Miércoles

Cada día contiene una sesión asignada.

El usuario puede modificar la distribución de los días.

---

## TrainingSession

Representa un entrenamiento específico.

Ejemplos:

* Pecho y Tríceps
* Espalda y Bíceps
* Piernas
* Full Body
* Running

Una sesión pertenece a un plan.

Una sesión contiene múltiples actividades.

---

# Catálogo de ejercicios

## Exercise

Representa un ejercicio disponible en el catálogo global.

Ejemplos:

* Bench Press
* Squat
* Deadlift
* Pull Up
* Running

Los ejercicios son administrados por la plataforma.

Los usuarios no crean ejercicios.

Cada ejercicio puede incluir:

* Nombre.
* Descripción.
* Instrucciones.
* Imagen.
* Video.
* Grupo muscular principal.
* Equipamiento requerido.
* Nivel de dificultad.

---

## MuscleGroup

Clasificación muscular utilizada por los ejercicios.

Ejemplos:

* Pecho
* Espalda
* Piernas
* Hombros
* Bíceps
* Tríceps
* Core

---

## Equipment

Equipamiento utilizado por los ejercicios.

Ejemplos:

* Barra
* Mancuernas
* Máquina
* Peso corporal
* Kettlebell
* Banda elástica

---

# Configuración de ejercicios

## SessionExercise

Representa un ejercicio configurado dentro de una sesión.

Define objetivos esperados.

Puede incluir:

* Series.
* Repeticiones.
* Peso objetivo.
* Tiempo objetivo.
* Distancia objetivo.
* Descanso entre series.

Un mismo ejercicio puede utilizarse múltiples veces en distintos planes y sesiones.

---

# Ejecución de entrenamientos

## WorkoutExecution

Representa una ejecución real de una sesión.

Se crea cuando un usuario inicia un entrenamiento.

Contiene:

* Fecha.
* Hora de inicio.
* Hora de finalización.
* Duración total.
* Estado.

Estados posibles:

* En progreso.
* Completado.
* Cancelado.

Toda ejecución genera historial.

---

## WorkoutExerciseExecution

Representa la ejecución de un ejercicio durante una sesión.

Contiene los resultados obtenidos para ese ejercicio.

---

## WorkoutSet

Representa una serie ejecutada por el usuario.

Puede registrar:

* Repeticiones realizadas.
* Peso utilizado.
* Tiempo realizado.
* Distancia realizada.

Es la unidad mínima de registro de progreso.

---

# Calendario

## CalendarEvent

Representa una actividad programada para una fecha específica.

Puede estar asociada a una sesión.

Estados:

* Programada.
* Completada.
* Omitida.

El calendario del perfil debe permitir visualizar:

* Sesiones futuras.
* Sesiones realizadas.
* Sesiones pendientes.

---

# Estadísticas

## PersonalStats

Representa estadísticas acumuladas del usuario.

Incluye:

* Total de entrenamientos completados.
* Total de horas entrenadas.
* Total de peso levantado.
* Total de kilómetros recorridos.
* Racha actual.
* Mejor racha histórica.

Las estadísticas se actualizan automáticamente luego de cada entrenamiento.

---

## DistanceTracking

Representa información de distancia recorrida.

La distancia puede provenir de:

* Entrenamientos registrados.
* Integraciones externas.

Inicialmente estará orientado a integraciones con smartwatches y plataformas de salud.

---

# Rankings

## Ranking

Representa una clasificación de usuarios.

Tipos de ranking:

* Horas entrenadas.
* Peso levantado.
* Kilómetros recorridos.

---

## RankingScope

Define el alcance geográfico de un ranking.

Niveles soportados:

* Ciudad.
* Provincia.
* País.
* Mundial.

---

## RankingEntry

Representa la posición de un usuario dentro de un ranking.

Contiene:

* Usuario.
* Posición.
* Valor acumulado.
* Fecha de actualización.

---

# Integraciones

## HealthIntegration

Representa una integración con plataformas externas.

Ejemplos futuros:

* Health Connect.
* Apple Health.
* Garmin.
* Fitbit.
* Samsung Health.

Estas integraciones permiten importar métricas de actividad física.

---

# Coaches (Futuro)

## Coach

Representa un usuario con capacidades avanzadas de entrenador.

Puede:

* Gestionar clientes.
* Asignar planes.
* Consultar progreso.
* Mantener conversaciones.

---

## CoachClient

Representa la relación entre entrenador y cliente.

Permite:

* Asignar entrenamientos.
* Compartir progreso.
* Gestionar seguimiento.

---

## Chat

Representa una conversación entre usuarios.

Inicialmente orientado a comunicación entrenador-cliente.

---

## Message

Representa un mensaje dentro de una conversación.

Puede contener:

* Texto.
* Imágenes.
* Archivos.

---

# Marketplace (Futuro)

## MarketplaceProduct

Representa un producto publicado por un entrenador.

Ejemplos:

* Programa de hipertrofia.
* Programa de pérdida de peso.
* Programa de running.

---

## Purchase

Representa la compra de un producto.

Permite otorgar acceso a contenido premium.

---

# Relaciones Principales

User
→ tiene uno UserProfile

User
→ tiene muchos TrainingPlan

TrainingPlan
→ tiene muchos TrainingDay

TrainingDay
→ tiene una TrainingSession

TrainingSession
→ tiene muchos SessionExercise

SessionExercise
→ referencia un Exercise

User
→ realiza muchos WorkoutExecution

WorkoutExecution
→ contiene muchos WorkoutExerciseExecution

WorkoutExerciseExecution
→ contiene muchos WorkoutSet

User
→ posee un PersonalStats

User
→ participa en muchos RankingEntry

Coach
→ gestiona muchos CoachClient

CoachClient
→ puede tener múltiples Chat

MarketplaceProduct
→ pertenece a un Coach

# Nuevas Entidades del Dominio

## SubscriptionPlan

Representa un plan de suscripción disponible.

Tipos iniciales:

* Mensual.
* Anual.

Define:

* Precio.
* Duración.
* Beneficios.

---

## UserSubscription

Representa una suscripción contratada por un usuario.

Contiene:

* Usuario.
* Plan contratado.
* Fecha de inicio.
* Fecha de vencimiento.
* Estado.

Estados posibles:

* Activa.
* Vencida.
* Cancelada.
* En período de gracia.

---

## Friendship

Representa una relación de amistad entre dos usuarios.

Permite:

* Comparar estadísticas.
* Participar en rankings privados.
* Visualizar actividad futura.

Estados posibles:

* Pendiente.
* Aceptada.
* Rechazada.
* Bloqueada.

---

## FriendRequest

Representa una solicitud de amistad.

Contiene:

* Usuario origen.
* Usuario destino.
* Fecha de envío.
* Estado.

---

## UserRole

Define las capacidades de un usuario dentro de la plataforma.

Roles iniciales:

* FreeUser
* PremiumUser

Roles futuros:

* Coach
* Administrator

---

## RankingEligibility

Representa la capacidad de un usuario para participar en rankings.

Reglas iniciales:

* Usuarios gratuitos pueden visualizar rankings globales.
* Usuarios gratuitos no participan en rankings globales.
* Usuarios gratuitos sí participan en rankings de amigos.
* Usuarios premium participan en todos los rankings.

---

# Reglas del Dominio

## Participación en Rankings

Los rankings globales solamente consideran usuarios con suscripción premium activa.

Los rankings de amigos consideran todos los usuarios independientemente de su plan.

---

## Creación de Planes

Los usuarios gratuitos únicamente pueden utilizar planes predefinidos por la plataforma.

Los usuarios premium pueden:

* Crear planes.
* Editar planes.
* Duplicar planes.
* Compartir planes.

---

## Distancia Recorrida

La estadística de kilómetros recorridos se obtiene únicamente mediante integraciones compatibles con dispositivos o plataformas de salud autorizadas.

Los usuarios no pueden ingresar manualmente kilómetros para rankings globales.

# Catálogo de Planes

## SystemTrainingPlan

Representa un plan oficial creado por la plataforma.

Los planes oficiales son mantenidos exclusivamente por administradores del sistema.

Los usuarios no pueden modificar el contenido original de estos planes.

Ejemplos:

* Principiante 3 días
* Hipertrofia 4 días
* Fuerza 5 días
* Running Inicial
* Full Body

---

# Reglas de Negocio

## Planes Oficiales

La plataforma proporciona un catálogo de planes oficiales.

Los usuarios gratuitos tienen acceso a estos planes.

Los usuarios pueden seleccionar un plan oficial y utilizarlo para entrenar.

---

## Personalización de Planes

Los usuarios gratuitos no pueden crear planes personalizados.

Los usuarios gratuitos no pueden modificar planes oficiales.

Los usuarios premium pueden:

* Crear planes propios.
* Duplicar planes oficiales.
* Modificar planes duplicados.
* Crear nuevas sesiones.
* Reorganizar días de entrenamiento.

La modificación de un plan oficial nunca afecta al plan original.

Siempre se genera una copia privada para el usuario.

## API Consumer

Representa cualquier aplicación que interactúa con la plataforma.

Tipos previstos:

- Mobile App
- Web App
- Coach Portal
- Admin Portal

Todos los consumidores deben acceder a los datos mediante APIs oficiales.