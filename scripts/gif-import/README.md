# Import de biblioteca de GIFs (agosto 2026)

Import único de ~1222 ejercicios con GIF desde una biblioteca externa (normalizada a español en un directorio separado, fuera de este repo), subidos a Supabase Storage (bucket `exercise-gifs`) en vez de a la API fitgifs (que este repo no puede escribir).

No están pensados para correrse de nuevo — quedan como registro de cómo se hizo el import, por si hace falta algo similar en el futuro. Los datos intermedios (manifests, chunks de traducción) vivían en un scratchpad de sesión, no en este repo.

## Orden de ejecución

1. `01-reconcile-catalog.js` — reutiliza/crea `muscle_groups`/`equipment` (idempotente).
2. `02-build-exercise-rows.js` — arma el dataset final por ejercicio (uuid propio, ids de categoría resueltos, `image_url` calculada de antemano).
3. Traducción de `name_es` → `name_en` (batch, fuera de estos scripts).
4. `04-merge-translations.js` — combina las traducciones en el dataset final.
5. `03-create-bucket.js` — crea el bucket público `exercise-gifs` (idempotente).
6. `05-insert-exercises.js` + `05b-repair-missing-junctions.js` — INSERT masivo de `exercises` + `exercise_muscle_groups`/`exercise_equipment` (idempotente por id; el script `05b` repara relaciones si una corrida anterior se cortó a mitad de camino).
7. `06-upload-gifs.js` — sube cada `.gif` a Storage como `${id}.gif` (resumable, concurrencia acotada).

## Decisiones

- `external_id` se deja `NULL` — no vienen de ExerciseDB, y esa columna es específicamente el marcador de dedupe de esa API.
- `fitgifs_slug` se deja `NULL` — el GIF vive en Storage, no en la API externa.
- Categorías nuevas de `muscle_groups`/`equipment` solo se crean cuando no hay un equivalente ya cargado (sinónimos como "Barra Z (EZ)"/"Barra EZ" o "Fitball / Balón suizo"/"Pelota de estabilidad" se fusionan con la fila existente).
