-- =============================================================================
-- Migration: challenges schema
-- Challenges reuse workout_programs/program_days/training_sessions/session_exercises
-- (type='challenge') so they get the same execution/tracking machinery as
-- regular programs for free. Differences from a program:
--   - duration_days + achievement_id on workout_programs (a challenge always
--     unlocks exactly one achievement on completion)
--   - program_days use day_number (1..duration_days) instead of weekday
--   - challenges are not deep-copied on assignment (targets are fixed content,
--     not user-editable), so user_programs points directly at the template
--     and gains completed_at to record when the last day was finished
-- =============================================================================

ALTER TABLE public.workout_programs
  ADD COLUMN duration_days integer,
  ADD COLUMN achievement_id uuid REFERENCES public.achievements(id) ON DELETE SET NULL;

ALTER TABLE public.workout_programs
  ADD CONSTRAINT challenge_requires_duration
    CHECK (type <> 'challenge' OR duration_days IS NOT NULL);

ALTER TABLE public.program_days
  ALTER COLUMN weekday DROP NOT NULL;

ALTER TABLE public.program_days
  ADD COLUMN day_number integer;

ALTER TABLE public.program_days
  ADD CONSTRAINT program_day_schedule_xor
    CHECK (
      (weekday IS NOT NULL AND day_number IS NULL) OR
      (weekday IS NULL AND day_number IS NOT NULL)
    );

CREATE UNIQUE INDEX idx_program_days_day_number
  ON public.program_days (workout_program_id, day_number)
  WHERE day_number IS NOT NULL;

ALTER TABLE public.user_programs
  ADD COLUMN completed_at timestamptz;

-- -----------------------------------------------------------------------------
-- RLS: challenges are read-only public templates, same spirit as official
-- programs. The existing "select official" policies check wp.type = 'official'
-- so they don't cover type = 'challenge' — add sibling policies.
-- -----------------------------------------------------------------------------
CREATE POLICY "workout_programs: select challenges"
  ON public.workout_programs FOR SELECT TO authenticated
  USING (type = 'challenge' AND active);

CREATE POLICY "program_days: select challenge"
  ON public.program_days FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_programs wp
      WHERE wp.id = workout_program_id AND wp.type = 'challenge'
    )
  );

-- -----------------------------------------------------------------------------
-- Seed: one example challenge so the feature is visible/testable end to end.
-- Skipped gracefully if the exercise catalog hasn't been seeded yet
-- (npm run seed:exercises).
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  v_exercise_id uuid;
  v_achievement_id uuid;
  v_program_id uuid;
  v_session_id uuid;
  v_reps int;
  v_day int;
BEGIN
  SELECT id INTO v_exercise_id FROM public.exercises WHERE name = 'burpee' LIMIT 1;
  IF v_exercise_id IS NULL THEN
    RAISE NOTICE 'Skipping challenge seed: exercise "burpee" not found (run npm run seed:exercises first)';
    RETURN;
  END IF;

  INSERT INTO public.achievements (code, name, description)
  VALUES (
    'CHALLENGE_BURPEES_7_DAYS',
    'Reto: 7 días de burpees',
    'Completaste los 7 días del reto de burpees'
  )
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_achievement_id;

  INSERT INTO public.workout_programs (name, description, type, duration_days, achievement_id)
  VALUES (
    'Reto: 7 días de burpees',
    'Un burpee más cada día durante una semana. Simple, directo, sin excusas.',
    'challenge',
    7,
    v_achievement_id
  )
  RETURNING id INTO v_program_id;

  FOR v_day IN 1..7 LOOP
    v_reps := 5 + (v_day - 1) * 3;

    INSERT INTO public.training_sessions (name, type, estimated_duration_minutes)
    VALUES ('Día ' || v_day || ' — Burpees', 'official', 10)
    RETURNING id INTO v_session_id;

    INSERT INTO public.session_exercises (
      training_session_id, exercise_id, sort_order, target_sets, target_reps, rest_seconds
    )
    VALUES (v_session_id, v_exercise_id, 0, 1, v_reps, 30);

    INSERT INTO public.program_days (workout_program_id, day_number, training_session_id)
    VALUES (v_program_id, v_day, v_session_id);
  END LOOP;
END $$;
