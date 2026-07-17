-- =============================================================================
-- Migration: content_status enum for workout_programs
-- Replaces the boolean `active` (published/unpublished) with a 3-state enum
-- (draft/published/archived), shared by regular programs AND challenges
-- (same table). Needed for the admin dashboard's publish workflow.
-- Existing data: active=true -> published, active=false -> archived.
-- DEFAULT 'published' keeps the existing mobile flows (personal program
-- creation) visible immediately, matching today's `active DEFAULT true`.
-- =============================================================================

CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');

ALTER TABLE public.workout_programs
  ADD COLUMN status content_status;

UPDATE public.workout_programs
  SET status = CASE WHEN active THEN 'published'::content_status ELSE 'archived'::content_status END;

ALTER TABLE public.workout_programs
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'published';

CREATE INDEX idx_workout_programs_type_status
  ON public.workout_programs (type, status);

-- Only the "select challenges" policy filtered on `active`; migrate it to status.
DROP POLICY "workout_programs: select challenges" ON public.workout_programs;
CREATE POLICY "workout_programs: select challenges"
  ON public.workout_programs FOR SELECT TO authenticated
  USING (type = 'challenge' AND status = 'published');

ALTER TABLE public.workout_programs
  DROP COLUMN active;
