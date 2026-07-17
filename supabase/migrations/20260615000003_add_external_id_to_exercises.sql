-- Add external_id column to exercises table to reference ExerciseDB API
ALTER TABLE public.exercises
ADD COLUMN external_id text UNIQUE,
ADD COLUMN tips text;

-- Remove video_url from exercises - videos will be fetched on-demand
ALTER TABLE public.exercises
DROP COLUMN video_url;

-- Add index for faster external_id lookups
CREATE INDEX idx_exercises_external_id ON public.exercises(external_id);
