-- Copia la relación 1:1 actual (exercises.muscle_group_id / equipment_id) a las
-- tablas de junction nuevas. SQL puro, sin contenido generado, idempotente.
INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id)
SELECT id, muscle_group_id FROM public.exercises
ON CONFLICT DO NOTHING;

INSERT INTO public.exercise_equipment (exercise_id, equipment_id)
SELECT id, equipment_id FROM public.exercises WHERE equipment_id IS NOT NULL
ON CONFLICT DO NOTHING;
