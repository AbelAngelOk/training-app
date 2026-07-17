-- =============================================================================
-- Migration: unique index for program_days(workout_program_id, weekday)
-- Pre-existing gap: setProgramDay() in src/api/sessions.ts already calls
-- .upsert(payload, { onConflict: 'workout_program_id,weekday' }) in production,
-- but no such unique constraint/index has ever existed (confirmed by
-- reviewing every prior migration). Adding it now, before building the admin
-- dashboard's session<->program/challenge association CRUD on top of it.
-- Partial index mirrors the existing day_number one (weekday is nullable —
-- challenges use day_number instead, enforced by program_day_schedule_xor).
-- =============================================================================

CREATE UNIQUE INDEX idx_program_days_weekday
  ON public.program_days (workout_program_id, weekday)
  WHERE weekday IS NOT NULL;
