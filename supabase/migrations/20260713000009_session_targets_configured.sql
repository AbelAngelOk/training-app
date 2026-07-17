-- =============================================================================
-- Migration: session targets configured marker
-- Tracks whether the mandatory first-time setup wizard (rest + per-exercise
-- sets/reps/weight) has already run for a session, independent of whether
-- the user has ever completed a workout for it. Needed because "first time"
-- and "already used before" are different signals:
--   - targets_configured_at IS NULL + no completed execution -> force wizard
--   - completed execution exists (regardless of this column, covers legacy
--     sessions created before this migration) -> offer to bump targets
-- Using execution history alone for the wizard trigger would loop forever:
-- finishing the wizard doesn't create any workout_execution, so the "first
-- time" condition would still be true right after saving.
-- =============================================================================

ALTER TABLE public.training_sessions
  ADD COLUMN targets_configured_at timestamptz;
