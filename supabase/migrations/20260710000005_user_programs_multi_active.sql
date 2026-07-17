-- =============================================================================
-- Migration: user_programs multi-active + plan limits
-- Allows a user to hold several program assignments (active or deactivated)
-- instead of exactly one, and enforces per-plan limits at the database level:
--   free    -> 1 active program (and, from Phase 3, 1 active challenge)
--   premium -> 3 active programs (and 3 active challenges)
-- Programs and challenges are counted separately (challenge = workout_programs
-- rows with type 'challenge', an enum value added in a later migration; the
-- comparison is done over ::text so this trigger works before that value exists).
-- =============================================================================

ALTER TABLE public.user_programs
  DROP CONSTRAINT unique_user_active_program;

ALTER TABLE public.user_programs
  ADD COLUMN is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN deactivated_at timestamptz;

-- A user keeps at most one assignment row per program (re-activation reuses it)
ALTER TABLE public.user_programs
  ADD CONSTRAINT unique_user_program UNIQUE (user_id, workout_program_id);

CREATE OR REPLACE FUNCTION public.check_user_program_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_premium boolean;
  v_limit int;
  v_is_challenge boolean;
  v_count int;
BEGIN
  -- Deactivating (or keeping inactive) never hits the limit
  IF NOT NEW.is_active THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM user_subscriptions
    WHERE user_id = NEW.user_id
      AND status IN ('active', 'grace_period')
      AND expires_at > now()
  ) OR EXISTS (
    SELECT 1 FROM users
    WHERE id = NEW.user_id AND role IN ('premium_user', 'coach', 'admin')
  ) INTO v_is_premium;

  v_limit := CASE WHEN v_is_premium THEN 3 ELSE 1 END;

  SELECT wp.type::text = 'challenge' INTO v_is_challenge
  FROM workout_programs wp
  WHERE wp.id = NEW.workout_program_id;

  SELECT count(*) INTO v_count
  FROM user_programs up
  JOIN workout_programs wp ON wp.id = up.workout_program_id
  WHERE up.user_id = NEW.user_id
    AND up.is_active
    AND up.id IS DISTINCT FROM NEW.id
    AND (wp.type::text = 'challenge') = v_is_challenge;

  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'PROGRAM_LIMIT_REACHED' USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_user_program_limit
  BEFORE INSERT OR UPDATE OF is_active ON public.user_programs
  FOR EACH ROW EXECUTE FUNCTION public.check_user_program_limit();
