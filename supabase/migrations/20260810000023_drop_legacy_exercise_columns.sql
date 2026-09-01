-- NO APLICAR hasta que scripts/verify-catalog-translations.js confirme 0 filas
-- sin traducir en exercises/muscle_groups/equipment (backfill de la Fase 2).
-- Congela las columnas bilingües como obligatorias y elimina las columnas legadas
-- de un solo idioma + las FK 1:1 ya reemplazadas por las tablas de junction.
ALTER TABLE public.exercises
  ALTER COLUMN name_es SET NOT NULL, ALTER COLUMN name_en SET NOT NULL,
  DROP COLUMN name, DROP COLUMN description, DROP COLUMN instructions, DROP COLUMN tips,
  DROP COLUMN muscle_group_id, DROP COLUMN equipment_id;

ALTER TABLE public.muscle_groups
  ALTER COLUMN name_es SET NOT NULL, ALTER COLUMN name_en SET NOT NULL,
  ADD CONSTRAINT muscle_groups_name_es_key UNIQUE (name_es),
  ADD CONSTRAINT muscle_groups_name_en_key UNIQUE (name_en),
  DROP COLUMN name;

ALTER TABLE public.equipment
  ALTER COLUMN name_es SET NOT NULL, ALTER COLUMN name_en SET NOT NULL,
  ADD CONSTRAINT equipment_name_es_key UNIQUE (name_es),
  ADD CONSTRAINT equipment_name_en_key UNIQUE (name_en),
  DROP COLUMN name;
