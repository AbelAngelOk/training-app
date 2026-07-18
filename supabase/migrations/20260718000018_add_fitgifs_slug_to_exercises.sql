-- Agrega fitgifs_slug a exercises, referencia a la API de GIFs
-- (https://api-training-app.onrender.com). Reemplaza el sistema de video de ExerciseDB.
-- Nullable, sin UNIQUE: varias variantes locales de un ejercicio pueden
-- legítimamente resolver al mismo GIF (ej. varias variantes de curl con
-- mancuernas -> un solo "dumbbell-curl" en fitgifs).
ALTER TABLE public.exercises
ADD COLUMN fitgifs_slug text;

COMMENT ON COLUMN public.exercises.fitgifs_slug IS
  'Slug de la API fitgifs (api-training-app.onrender.com). Se usa para armar /gif/{slug} en runtime. NULL = sin GIF matcheado.';
