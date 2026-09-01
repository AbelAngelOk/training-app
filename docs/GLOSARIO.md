# Glosario de entidades

Los nombres de las entidades de entrenamiento se prestan a confusión porque varios
términos coloquiales ("rutina", "sesión", "entrenamiento") podrían referirse a más de
una tabla. Este documento fija la correspondencia entre el vocabulario que se usa en
la conversación/UI y las tablas reales (`docs/DATABASE.md`), para que no haya ambigüedad
al hablar de "objetivos de una rutina" o "sesión anterior".

---

## Tabla rápida

| Término coloquial | Entidad (tabla) | Qué es |
|---|---|---|
| **Programa** | `workout_programs` | Plantilla de más alto nivel: un horario semanal que asigna una Rutina a cada día. |
| **Reto** | `workout_programs` (`type='challenge'`) | Subtipo de Programa: días consecutivos numerados (no semanales), objetivos fijos, no se duplica al asignarlo. |
| **Día del programa** | `program_days` | La fila que conecta un Programa con una Rutina en un día concreto (`weekday` o `day_number`). |
| **Rutina** | `training_sessions` | Plantilla de una sesión de entrenamiento concreta: un conjunto ordenado de ejercicios con sus objetivos propios. |
| **Ejercicio (catálogo)** | `exercises` | Ficha global de un ejercicio (nombre, instrucciones, GIF, músculos). No tiene objetivos propios. |
| **Ejercicio de la rutina** | `session_exercises` | La fila que conecta una Rutina con un Ejercicio del catálogo + sus objetivos (`target_sets`/`target_reps`/`target_weight`/`rest_seconds`). |
| **Entrenamiento** | `workout_executions` | Una instancia real de "hacer" una Rutina: arranca al tocar "Iniciar sesión", termina al "Finalizar sesión". |
| **Serie registrada** | `workout_sets` | Cada serie realmente realizada dentro de un Entrenamiento (peso/reps reales, no el objetivo). |

---

## Detalle

### Programa (`workout_programs`)
Es el nivel más alto: agrupa varias Rutinas en un horario. Un Programa **no** tiene
ejercicios ni objetivos directamente — solo referencia Rutinas a través de sus Días.
Tipos (`type`): `official` (plantilla compartida, no editable), `personal` (copia propia
de un usuario, editable), `challenge` (Reto).

Ejemplo: "18 ejercicios para perder peso" es un Programa. Puede tener **más de una
Rutina distinta** asignada a distintos días (ej. Rutina A los lunes, Rutina B los
viernes) — eso son dos filas en `program_days`, cada una apuntando a una `training_session`
distinta.

### Reto (`workout_programs` con `type='challenge'`)
Es un Programa con reglas especiales: sus Días usan `day_number` (1..N días consecutivos)
en vez de día de la semana, típicamente una Rutina por día con un solo ejercicio, y sus
objetivos son fijos (no se duplica al asignarlo — todos los usuarios comparten la misma
plantilla, por eso no es editable).

### Día del programa (`program_days`)
La fila puente: "en el Programa X, el [lunes | día 3], se hace la Rutina Y". Un Programa
con Rutina A los lunes y Rutina B los viernes tiene **dos** filas en `program_days` que
apuntan a **dos `training_sessions` distintas** — no hay forma de que se mezclen los
objetivos de A y B porque ni siquiera comparten fila.

### Rutina (`training_sessions`)
Lo que coloquialmente se llama "Rutina A" o "Rutina B". Es una plantilla de sesión: un
conjunto ordenado de ejercicios (`session_exercises`) con sus objetivos propios. Es la
entidad dueña de los objetivos — **no el Programa**. Por eso "Rutina A" y "Rutina B" del
mismo Programa son independientes por diseño: cada una es una fila distinta de
`training_sessions`, con su propio conjunto de `session_exercises`.

Cuando un usuario asigna un Programa oficial, `duplicate_program_deep` crea una **copia
personal** de cada Rutina del Programa (además del Programa mismo) para que el usuario
pueda editar sus objetivos sin tocar la plantilla compartida. La copia guarda
`source_session_id` apuntando a la Rutina original — esto es lo que permite agrupar
historial/objetivos entre "copias hermanas" de la misma Rutina (por ejemplo, si el mismo
Programa se vuelve a asignar más adelante).

### Ejercicio de catálogo (`exercises`)
La ficha genérica de un ejercicio (nombre, instrucciones, GIF, grupo muscular, equipo).
Es reutilizable entre cualquier Rutina — **no tiene objetivos propios**, esos viven un
nivel más abajo, en `session_exercises`.

### Ejercicio de la rutina / objetivo (`session_exercises`)
La fila que realmente importa para "series, reps, peso": conecta una Rutina con un
Ejercicio del catálogo y guarda `target_sets`/`target_reps`/`target_weight`/`rest_seconds`
— el objetivo vigente para esa Rutina. Esta es la fila que se edita (manualmente o con el
formulario de ajuste) y la que se lee cada vez que se entra a la pre-sesión de esa Rutina.
Como pertenece a una Rutina concreta, editar los objetivos de Rutina A nunca toca los de
Rutina B.

**Cómo se editan los objetivos** (ya implementado, ver `docs/FEATURES.md` →
"Ajuste de objetivos entre semanas"):
- **Edición manual**: ícono de lápiz en la pre-sesión (`/training/session/[id]`) activa
  un modo edición ejercicio por ejercicio; cada campo se guarda al perder el foco
  (`updateSessionExercise` → `UPDATE session_exercises`).
- **Edición con formulario**: al reingresar a una Rutina con al menos una ejecución
  completada (propia o de una copia hermana vía `source_session_id`), aparece
  `BumpTargetsModal` con checkboxes (Peso +5kg / Series +1 / Reps +2) que aplican el
  incremento a **todos** los ejercicios de esa Rutina de una sola vez.
- **Herencia**: no hay un mecanismo aparte de "copiar valores" — como `session_exercises`
  guarda el objetivo vigente y se lee siempre de ahí, el valor editado (por cualquiera de
  los dos métodos) queda automáticamente como el objetivo de la **próxima vez** que se
  entre a esa misma Rutina.

### Entrenamiento (`workout_executions`)
Una instancia real de ejecutar una Rutina. Es lo que en la UI dice "¡Entrenamiento
completado!" o el banner "Entrenamiento en curso". Tiene estado (`in_progress` /
`completed` / `cancelled`), hora de inicio/fin y apunta a la Rutina (`training_session_id`)
que se estaba ejecutando — **no** al Programa directamente (el Programa se infiere por
contexto de navegación).

### Serie registrada (`workout_sets`)
Lo que realmente se hizo dentro de un Entrenamiento: peso y reps reales de cada serie
marcada durante la ejecución guiada. Es historial inmutable (no se puede desmarcar, solo
editar mientras el Entrenamiento sigue activo) — se compara contra el objetivo
(`session_exercises.target_*`) en la pantalla de resumen ("objetivo vs. realizado").

---

## Resumen visual

```
Programa (workout_programs)
 └─ Día del programa (program_days) — "lunes → Rutina A", "viernes → Rutina B"
     └─ Rutina (training_sessions)               ← objetivos viven acá para abajo
         └─ Ejercicio de la rutina (session_exercises) — target_sets/reps/weight
             └─ Ejercicio de catálogo (exercises) — ficha genérica reutilizable

Entrenamiento (workout_executions)               ← "hacer" una Rutina, una vez
 └─ Serie registrada (workout_sets)               ← lo realmente hecho, vs. el objetivo
```

## Mapeo con pantallas

| Pantalla | Entidad principal |
|---|---|
| `/training` | Lista de Programas/Retos activos |
| `/training/[id]` | Detalle de **Programa** (calendario + lista de Rutinas por día) |
| `/training/session/[id]` | Pre-sesión de una **Rutina** (objetivos, editar, iniciar) |
| `/training/session/[id]/setup` | Wizard de objetivos iniciales de una **Rutina** |
| `/training/session/[id]/execute` | Ejecución guiada de un **Entrenamiento** |
| `/training/session/[id]/summary` | Resumen de un **Entrenamiento** terminado |
| `/training/session/[id]/history` | Historial de **Entrenamientos** de una Rutina (y sus copias hermanas) |
| `/training/challenge/[id]` | Detalle de **Reto** (Programa especial) |
