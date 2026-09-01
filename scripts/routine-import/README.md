# Import de rutinas (agosto 2026)

Import único de 87 rutinas de entrenamiento desde archivos .md ya extraídos de PDFs (fuente en un directorio separado, fuera de este repo: `normalizacion_rutinas/rutinas_md/`), como `workout_programs`/`training_sessions`/`session_exercises` oficiales y publicados.

No están pensados para correrse de nuevo — quedan como registro de cómo se hizo el import.

## Alcance

De 163 archivos .md disponibles, solo se importaron los que tenían series/reps/descanso reales por ejercicio (no bloques vagos tipo "30 min de cardio, 20 min de fuerza"). Eso dejó 103 candidatos; de ahí se excluyó además el lote "01-100 Rutinas Full Body #88-100" completo (13 archivos) porque, pese a pasar el filtro inicial, resultó ser contenido de actividad genérica de una sola pieza (jardinería, patinaje, escalada, "fijar un objetivo") sin ejercicios discretos reales. Quedaron 90 rutinas procesadas, de las cuales 4 se excluyeron por completo tras filtrar bloques genéricos internos (quedaban sin ningún ejercicio real) — **86 rutinas finales**, más 1 agregada a mano tras el reconcilio de duplicados (ver abajo) = **87 sesiones oficiales**.

## Orden de ejecución

1. Clasificación de archivos "bien estructurados" vs "vagos" (bash/grep, no quedó como script — ver el historial de la sesión).
2. 7 agentes en paralelo extrajeron cada .md a JSON estructurado (`session_name`, `description`, `estimated_duration_minutes`, lista de ejercicios con series/reps/descanso), matcheando cada ejercicio contra el catálogo de 1595 ejercicios existentes o proponiendo uno nuevo cuando no había equivalente.
3. `01-merge-and-list-new.js` — combina los 7 lotes (excluyendo el de Plan 88-100), deduplica los ejercicios nuevos propuestos.
4. Revisión manual de los ~123 ejercicios nuevos propuestos: 19 bloques genéricos/no-ejercicio descartados (ej. "Enfriamiento", "Fijar un objetivo", "Sesión de yoga"), ~15 duplicados casi idénticos entre agentes fusionados a un solo nombre canónico.
5. `02-create-exercises-and-sessions.js` — aplica el filtro/fusión, crea los 89 ejercicios nuevos genuinos (bilingüe, categorías existentes), resuelve el id final de cada ejercicio de cada rutina.
6. `02b-validate-matched-ids.js` — valida que todo `matched_exercise_id` que dieron los agentes exista de verdad en la base (encontró 2 UUIDs corruptos por transcripción, recuperados por nombre).
7. `03-insert-sessions.js` — crea `training_sessions` + `session_exercises`, envuelve cada una en su propio `workout_programs` (`status: published`) + `program_days` (una sesión sin programa contenedor no es visible para el usuario final — ver `src/api/programs.ts`). Dos series de "Día 1/Día 2" (fútbol, plan de 1 mes) se agruparon en un solo programa de 2 días en vez de dos programas de 1 día.

## Incidentes durante el import (y cómo se resolvieron)

- El primer intento de `03-insert-sessions.js` cortó a mitad de camino por un FK inválido (UUID corrupto de un agente). Dejó una sesión huérfana (`Rutina de acondicionamiento en circuito`, sin ejercicios ni programa) — borrada a mano.
- 3 archivos fuente distintos (`Circuito para Mujeres perdida de peso.md`, `Circuito Pirámide quemagrasa.md`, `Rutina Quemagrasa Mujer.md`) resultaron ser la misma rutina de 5 ejercicios bajo 3 títulos de marketing distintos. Dos agentes les pusieron el mismo `session_name` por coincidencia, lo que hizo que el chequeo de idempotencia del segundo intento saltee la tercera como "ya existente". Se renombró la sesión duplicada a su título real y se creó la tercera a mano.

## Datos que quedaron sin completar (a propósito)

`description_es/en`, `instructions_es/en`, `tips_es/en` de los 89 ejercicios nuevos quedaron `null` — no había ese nivel de detalle en los .md de origen para generarlo sin inventar contenido.
