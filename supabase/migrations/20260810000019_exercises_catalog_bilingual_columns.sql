-- Agrega columnas bilingües (ES/EN) a exercises, muscle_groups y equipment.
-- Aditiva únicamente: las columnas viejas de un solo idioma siguen existiendo
-- hasta que el backfill (scripts/apply-catalog-translations.js) termine y
-- scripts/verify-catalog-translations.js confirme 0 filas sin traducir —
-- recién ahí se aplica 20260810000023_drop_legacy_exercise_columns.sql.
ALTER TABLE public.exercises
  ADD COLUMN name_es text,
  ADD COLUMN name_en text,
  ADD COLUMN description_es text,
  ADD COLUMN description_en text,
  ADD COLUMN instructions_es text,
  ADD COLUMN instructions_en text,
  ADD COLUMN tips_es text,
  ADD COLUMN tips_en text;

ALTER TABLE public.muscle_groups
  ADD COLUMN name_es text,
  ADD COLUMN name_en text,
  ADD COLUMN description_es text,
  ADD COLUMN description_en text;

ALTER TABLE public.equipment
  ADD COLUMN name_es text,
  ADD COLUMN name_en text,
  ADD COLUMN description_es text,
  ADD COLUMN description_en text;
