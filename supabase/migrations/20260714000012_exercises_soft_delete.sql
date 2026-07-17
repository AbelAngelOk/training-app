-- =============================================================================
-- Migration: exercises soft delete
-- exercises has no soft-delete flag today, and session_exercises.exercise_id
-- is ON DELETE RESTRICT (deleting an in-use exercise fails at the DB level).
-- The admin dashboard tries a hard DELETE first; on FK violation (23503) it
-- offers to deactivate instead. Deactivated exercises are hidden from the
-- mobile catalog (getExercises) but remain intact for sessions that already
-- reference them (those resolve the exercise by id via join, not via
-- getExercises).
-- =============================================================================

ALTER TABLE public.exercises
  ADD COLUMN active boolean NOT NULL DEFAULT true;

CREATE INDEX idx_exercises_active ON public.exercises (active);
