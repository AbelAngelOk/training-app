-- Fix: duplicate_program_deep only ever copied program_days.weekday, never
-- day_number. Every program_days row must have exactly one of the two set
-- (program_day_schedule_xor CHECK, migration 20260711000007). Challenges
-- (day_number-based) were never deep-copied so this stayed dormant — but
-- assigning any day_number-based *official program* (e.g. the routine import
-- from 2026-08-22) hits duplicate_program_deep and inserts a program_days row
-- with both weekday and day_number NULL, violating the CHECK (23514).
CREATE OR REPLACE FUNCTION public.duplicate_program_deep(
  p_source_program_id uuid,
  p_name text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_src workout_programs%ROWTYPE;
  v_new_program uuid;
  v_day RECORD;
  v_new_session uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_src FROM workout_programs WHERE id = p_source_program_id;
  IF NOT FOUND OR NOT (v_src.type = 'official' OR v_src.owner_id = v_user) THEN
    RAISE EXCEPTION 'Program not accessible';
  END IF;

  INSERT INTO workout_programs (name, description, type, owner_id, source_program_id)
  VALUES (
    COALESCE(p_name, v_src.name),
    v_src.description,
    'personal',
    v_user,
    COALESCE(v_src.source_program_id, v_src.id)
  )
  RETURNING id INTO v_new_program;

  FOR v_day IN
    SELECT
      pd.weekday,
      pd.day_number,
      ts.id AS session_id,
      ts.name AS session_name,
      ts.description AS session_description,
      ts.estimated_duration_minutes,
      ts.source_session_id
    FROM program_days pd
    JOIN training_sessions ts ON ts.id = pd.training_session_id
    WHERE pd.workout_program_id = p_source_program_id
  LOOP
    INSERT INTO training_sessions (name, description, type, owner_id, source_session_id, estimated_duration_minutes)
    VALUES (
      v_day.session_name,
      v_day.session_description,
      'personal',
      v_user,
      COALESCE(v_day.source_session_id, v_day.session_id),
      v_day.estimated_duration_minutes
    )
    RETURNING id INTO v_new_session;

    INSERT INTO session_exercises (
      training_session_id, exercise_id, sort_order, target_sets, target_reps,
      target_weight, target_duration_seconds, target_distance_meters, rest_seconds
    )
    SELECT
      v_new_session, exercise_id, sort_order, target_sets, target_reps,
      target_weight, target_duration_seconds, target_distance_meters, rest_seconds
    FROM session_exercises
    WHERE training_session_id = v_day.session_id;

    INSERT INTO program_days (workout_program_id, weekday, day_number, training_session_id)
    VALUES (v_new_program, v_day.weekday, v_day.day_number, v_new_session);
  END LOOP;

  RETURN v_new_program;
END;
$$;
